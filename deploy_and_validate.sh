#!/usr/bin/env bash

set -euo pipefail

PROJECT_ID="${PROJECT_ID:-}"
REGION="${REGION:-us-central1}"
BACKEND_SERVICE="${BACKEND_SERVICE:-kickout-backend}"
FRONTEND_SERVICE="${FRONTEND_SERVICE:-kickout-frontend}"
RUNTIME_SA_NAME="${RUNTIME_SA_NAME:-kickout-run}"
PROXY_HEADER="${PROXY_HEADER:-6bp5n7mtRMSZkjcJ7mYBkksvHeOqBXzP}"
VITE_API_KEY="${VITE_API_KEY:-}"
API_PAYLOAD_MAX_SIZE="${API_PAYLOAD_MAX_SIZE:-7mb}"

usage() {
  cat <<EOF
Usage:
  PROJECT_ID=<gcp-project-id> VITE_API_KEY=<gemini-api-key> ./deploy_and_validate.sh

Optional env vars:
  REGION=us-central1
  BACKEND_SERVICE=kickout-backend
  FRONTEND_SERVICE=kickout-frontend
  RUNTIME_SA_NAME=kickout-run
  PROXY_HEADER=6bp5n7mtRMSZkjcJ7mYBkksvHeOqBXzP
  API_PAYLOAD_MAX_SIZE=7mb
EOF
}

require_env() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    echo "Error: missing required env var $name" >&2
    usage
    exit 1
  fi
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: required command not found: $cmd" >&2
    exit 1
  fi
}

ensure_service_account() {
  local sa_email="$1"
  if gcloud iam service-accounts describe "$sa_email" >/dev/null 2>&1; then
    echo "Service account exists: $sa_email"
    return
  fi

  echo "Creating service account: $sa_email"
  gcloud iam service-accounts create "$RUNTIME_SA_NAME" --display-name="KickOut Cloud Run SA"
}

grant_iam() {
  local sa_email="$1"
  echo "Granting IAM roles to $sa_email"

  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${sa_email}" \
    --role="roles/aiplatform.user" \
    >/dev/null

  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${sa_email}" \
    --role="roles/serviceusage.serviceUsageConsumer" \
    >/dev/null
}

validate_backend() {
  local backend_url="$1"
  local payload_file
  local tmp_root
  local backend_body_file
  tmp_root="${TMPDIR:-/tmp}"
  backend_body_file="${tmp_root%/}/kickout_backend_validate_body.json"
  payload_file="$(mktemp "${TMPDIR:-/tmp}/kickout-backend-validate.XXXXXX.json")"

  cat > "$payload_file" <<EOF
{"originalUrl":"https://aiplatform.googleapis.com/v1beta1/publishers/google/models/gemini-2.5-flash:generateContent","headers":{"content-type":"application/json"},"method":"POST","body":"{\"contents\":[{\"parts\":[{\"text\":\"ping\"}],\"role\":\"user\"}],\"generationConfig\":{\"temperature\":0.1}}"}
EOF

  echo "Validating backend: ${backend_url}/api-proxy"
  local status
  status="$(curl -sS -o "$backend_body_file" -w "%{http_code}" \
    -H 'Content-Type: application/json' \
    -H "X-App-Proxy: ${PROXY_HEADER}" \
    --data-binary "@${payload_file}" \
    "${backend_url}/api-proxy")"

  rm -f "$payload_file"

  if [[ "$status" != "200" ]]; then
    echo "Backend validation failed. HTTP status: $status" >&2
    echo "Response body:" >&2
    cat "$backend_body_file" >&2 || true
    exit 1
  fi

  if ! grep -q 'candidates' "$backend_body_file"; then
    echo "Backend validation failed: expected response to include 'candidates'" >&2
    cat "$backend_body_file" >&2 || true
    exit 1
  fi

  echo "Backend validation passed"
}

validate_frontend() {
  local frontend_url="$1"
  local tmp_root
  local frontend_body_file
  tmp_root="${TMPDIR:-/tmp}"
  frontend_body_file="${tmp_root%/}/kickout_frontend_validate_body.html"
  echo "Validating frontend: $frontend_url"

  local status
  status="$(curl -sS -o "$frontend_body_file" -w "%{http_code}" "$frontend_url")"

  if [[ "$status" != "200" ]]; then
    echo "Frontend validation failed. HTTP status: $status" >&2
    exit 1
  fi

  if ! grep -qi '<!doctype html>' "$frontend_body_file"; then
    echo "Frontend validation failed: expected HTML document" >&2
    exit 1
  fi

  echo "Frontend validation passed"
}

main() {
  require_cmd gcloud
  require_cmd curl

  require_env PROJECT_ID "$PROJECT_ID"
  require_env VITE_API_KEY "$VITE_API_KEY"

  gcloud config set project "$PROJECT_ID" >/dev/null

  echo "Enabling required APIs"
  gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    aiplatform.googleapis.com \
    >/dev/null

  local sa_email
  sa_email="${RUNTIME_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
  ensure_service_account "$sa_email"
  grant_iam "$sa_email"

  echo "Deploying backend service: $BACKEND_SERVICE"
  gcloud run deploy "$BACKEND_SERVICE" \
    --source backend \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --service-account "$sa_email" \
    --set-env-vars "API_BACKEND_PORT=8080,API_PAYLOAD_MAX_SIZE=${API_PAYLOAD_MAX_SIZE},GOOGLE_CLOUD_LOCATION=${REGION},GOOGLE_CLOUD_PROJECT=${PROJECT_ID},PROXY_HEADER=${PROXY_HEADER}"

  local backend_url
  backend_url="$(gcloud run services describe "$BACKEND_SERVICE" --region "$REGION" --format='value(status.url)')"
  if [[ -z "$backend_url" ]]; then
    echo "Failed to retrieve backend URL" >&2
    exit 1
  fi
  echo "Backend URL: $backend_url"

  echo "Deploying frontend service: $FRONTEND_SERVICE"
  gcloud run deploy "$FRONTEND_SERVICE" \
    --source frontend \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --set-build-env-vars "VITE_API_KEY=${VITE_API_KEY},VITE_BACKEND_URL=${backend_url}" \
    --command npm \
    --args run,preview,--,--host,0.0.0.0,--port,8080

  local frontend_url
  frontend_url="$(gcloud run services describe "$FRONTEND_SERVICE" --region "$REGION" --format='value(status.url)')"
  if [[ -z "$frontend_url" ]]; then
    echo "Failed to retrieve frontend URL" >&2
    exit 1
  fi
  echo "Frontend URL: $frontend_url"

  validate_backend "$backend_url"
  validate_frontend "$frontend_url"

  echo
  echo "Deployment and validation completed successfully"
  echo "Backend:  $backend_url"
  echo "Frontend: $frontend_url"
}

main "$@"
