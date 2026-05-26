# Deploy KickOut to Google Cloud

This guide deploys:

1. Backend API proxy to Cloud Run
2. Frontend app to Cloud Run

It assumes this repository layout:

* `backend/` Node.js proxy service
* `frontend/` Vite + React app

---

## 1) Prerequisites

Install and authenticate:

```bash
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

Set shell variables used below:

```bash
export PROJECT_ID="YOUR_PROJECT_ID"
export REGION="us-central1"
export BACKEND_SERVICE="kickout-backend"
export FRONTEND_SERVICE="kickout-frontend"
export PROXY_HEADER="6bp5n7mtRMSZkjcJ7mYBkksvHeOqBXzP"
export VITE_API_KEY="YOUR_GEMINI_API_KEY"
```

Enable required APIs:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com
```

---

## 2) Create Service Account for Backend

Create a runtime identity for the backend:

```bash
gcloud iam service-accounts create kickout-run --display-name="KickOut Cloud Run SA"
```

Grant minimum required roles:

```bash
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
	--member="serviceAccount:kickout-run@${PROJECT_ID}.iam.gserviceaccount.com" \
	--role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
	--member="serviceAccount:kickout-run@${PROJECT_ID}.iam.gserviceaccount.com" \
	--role="roles/serviceusage.serviceUsageConsumer"
```

---

## 3) Deploy Backend to Cloud Run

Deploy from source in `backend/`:

```bash
gcloud run deploy "$BACKEND_SERVICE" \
	--source backend \
	--region "$REGION" \
	--platform managed \
	--allow-unauthenticated \
	--service-account "kickout-run@${PROJECT_ID}.iam.gserviceaccount.com" \
	--set-env-vars API_BACKEND_PORT=8080,API_PAYLOAD_MAX_SIZE=7mb,GOOGLE_CLOUD_LOCATION=${REGION},GOOGLE_CLOUD_PROJECT=${PROJECT_ID},PROXY_HEADER=${PROXY_HEADER}
```

Get backend URL:

```bash
export BACKEND_URL="$(gcloud run services describe "$BACKEND_SERVICE" --region "$REGION" --format='value(status.url)')"
echo "$BACKEND_URL"
```

---

## 4) Deploy Frontend to Cloud Run

The frontend build needs these values at build time:

* `VITE_API_KEY`
* `VITE_BACKEND_URL` (must point to backend Cloud Run URL)

Deploy from source in `frontend/`:

```bash
gcloud run deploy "$FRONTEND_SERVICE" \
	--source frontend \
	--region "$REGION" \
	--platform managed \
	--allow-unauthenticated \
	--set-build-env-vars VITE_API_KEY=${VITE_API_KEY},VITE_BACKEND_URL=${BACKEND_URL} \
	--command npm \
	--args run,preview,--,--host,0.0.0.0,--port,8080
```

Get frontend URL:

```bash
export FRONTEND_URL="$(gcloud run services describe "$FRONTEND_SERVICE" --region "$REGION" --format='value(status.url)')"
echo "$FRONTEND_URL"
```

---

## 5) Smoke Test

Open frontend URL in browser and send a prompt.

Optional backend check:

```bash
curl -i "$BACKEND_URL/api-proxy"
```

Expected result:

* Non-empty response from frontend prompt
* No 403 from backend proxy path

---

## 6) Updating Existing Deployments

After code changes, redeploy:

```bash
gcloud run deploy "$BACKEND_SERVICE" --source backend --region "$REGION"
gcloud run deploy "$FRONTEND_SERVICE" --source frontend --region "$REGION" \
	--set-build-env-vars VITE_API_KEY=${VITE_API_KEY},VITE_BACKEND_URL=${BACKEND_URL} \
	--command npm --args run,preview,--,--host,0.0.0.0,--port,8080
```

If backend URL changes, redeploy frontend with updated `VITE_BACKEND_URL`.

---

## 7) Common Issues

### 403 Forbidden from `/api-proxy`

Check all of the following:

1. `PROXY_HEADER` in backend Cloud Run env matches frontend interceptor value.
2. Frontend was rebuilt with correct `VITE_BACKEND_URL`.
3. Backend service account has `roles/aiplatform.user`.

### 401 Authentication errors from Vertex

Check:

1. Backend is running with the intended service account.
2. Vertex AI API is enabled in the same project.
3. `GOOGLE_CLOUD_PROJECT` and `GOOGLE_CLOUD_LOCATION` env vars are correct.

### Frontend still calling old backend URL

`VITE_*` values are build-time values. Redeploy frontend after any env change.

