# 🏃 KickOut — Post-Match Escape Agent

> *AI agent that gets World Cup tourists home safely after the final whistle — real-time crowd, transport & route intelligence in plain English.*

[![Hackathon](https://img.shields.io/badge/Google%20Cloud-Rapid%20Agent%20Hackathon-4285F4?logo=googlecloud&logoColor=white)](https://rapid-agent.devpost.com)
[![Track](https://img.shields.io/badge/Partner%20Track-Dynatrace-1496FF?logo=dynatrace&logoColor=white)](https://www.dynatrace.com)
[![Built with Gemini](https://img.shields.io/badge/Built%20with-Gemini%202.0-8E44AD?logo=google&logoColor=white)](https://cloud.google.com/vertex-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-00C853.svg)](LICENSE)
[![Cloud Run](https://img.shields.io/badge/Deployed%20on-Cloud%20Run-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)

-----

## ⚽ The Problem

60,000 fans pour out of a World Cup stadium at the same time. Apps crash. Trains are packed. Taxi surge pricing hits 3x. A tourist from Germany has no idea which exit is least crowded, whether the metro is running, or if the 45-minute taxi queue is worth it.

The post-match escape is the moment every tourist dreads — and the one no travel app has solved with genuine real-time intelligence.

**KickOut solves it in one message.**

-----

## 🎬 Demo

[![Demo Video](https://img.shields.io/badge/Watch-Demo%20Video-FF0000?logo=youtube&logoColor=white)](https://youtube.com/your-demo-link)
[![Live App](https://img.shields.io/badge/Try-Live%20App-00C853?logo=googlechrome&logoColor=white)](https://kickout-escape-agent.run.app)

```
Tourist: "Final whistle just blew. I'm at the Azteca and need to 
         get back to Hotel Zócalo downtown. How do I get out?"

KickOut: "Don't go to the main gate — it's already packed. Head to 
         Gate D (east side, 4-min walk). Metro Line 3 opens in 
         3 minutes. Take it 6 stops to Pino Suárez — your hotel 
         is 400m from there. Total time: ~28 mins. 
         
         A taxi right now costs 3x normal and will take 55+ mins."
```

-----

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Tourist's Phone                        │
│              React PWA · GPS · Push Alerts              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              Google Cloud Agent Layer                    │
│     Vertex AI Agent Builder · Gemini 2.0 Flash          │
│          Tool Orchestrator (parallel calls)             │
└──┬──────────┬──────────┬──────────┬─────────────────────┘
   │          │          │          │
┌──▼──┐  ┌───▼───┐  ┌───▼───┐  ┌──▼──────────┐
│Maps │  │GTFS-RT│  │Crowd  │  │Match        │
│API  │  │Transit│  │Model  │  │Schedule     │
└──┬──┘  └───┬───┘  └───┬───┘  └──┬──────────┘
   │          │          │          │
┌──▼──────────▼──────────▼──────────▼──────────────────────┐
│                   FastAPI Backend                         │
│              Cloud Run · Python 3.12                     │
└──────────────────────┬────────────────────────────────────┘
                       │  OpenTelemetry
┌──────────────────────▼────────────────────────────────────┐
│                     Dynatrace                             │
│   Traces · SLO Tracking · Synthetics · Dashboard         │
└───────────────────────────────────────────────────────────┘
```

-----

## 🔧 Tech Stack

|Layer               |Technology                                                           |
|--------------------|---------------------------------------------------------------------|
|**Agent Brain**     |Gemini 2.0 Flash via Vertex AI Agent Builder                         |
|**Backend**         |FastAPI · Python 3.12 · google-agents-cli                            |
|**Hosting**         |Google Cloud Run (serverless, scales to zero)                        |
|**Frontend**        |React 18 PWA · Mobile-first · Built with Claude Code + GitHub Copilot|
|**Maps & Routing**  |Google Maps Platform — Routes API, Directions API                    |
|**Public Transport**|GTFS-Realtime feeds (live arrivals for all World Cup host cities)    |
|**Match Schedule**  |football-data.org API                                                |
|**Weather**         |OpenWeatherMap API                                                   |
|**Observability**   |Dynatrace — OTel traces, SLOs, Synthetic Monitors, Dashboards        |
|**Secrets**         |Google Cloud Secret Manager                                          |
|**CI/CD**           |GitHub Actions                                                       |

-----

## 🤖 Agent Tools

The agent orchestrates 5 tools in parallel to build an escape plan in under 3 seconds:

|Tool                    |Description                                 |Data Source                                |
|------------------------|--------------------------------------------|-------------------------------------------|
|`get_crowd_density`     |Exit gate crowd levels at current match time|Simulated model keyed to stadium + clock   |
|`get_transit_arrivals`  |Next departure times from nearest stations  |GTFS-Realtime open feeds                   |
|`get_route`             |Walking + transit routes from exit to hotel |Google Maps Routes API                     |
|`get_rideshare_estimate`|Surge pricing and wait time estimate        |Simulated (Uber API requires prod approval)|
|`get_match_info`        |Stadium, kick-off time, expected crowd size |football-data.org                          |

-----

## 📡 Dynatrace Observability

Every agent interaction is fully traced end-to-end:

- **OpenTelemetry spans** wrap each tool call — name, input, latency, status
- **Token usage metrics** track Gemini prompt and completion tokens per request
- **Agent SLO**: response latency < 3 seconds for 99.9% of requests
- **Synthetic monitors** ping Maps API + GTFS-RT feeds every 2 minutes on match days
- **Live dashboard** shows: tool call health, agent P99 latency, token spend, error budget

> If the Google Maps API degrades during a match, Dynatrace fires an alert before the tourist asks their first question.

-----

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- GCP project with billing enabled ([free trial](https://cloud.google.com/free))
- Dynatrace account ([free trial](https://www.dynatrace.com/signup/))

### 1. Clone the repo

```bash
git clone https://github.com/ale-sanchez-g/kickout-escape-agent.git
cd kickout-escape-agent
```

### 2. Install dependencies

```bash
uv sync
```

### 3. Configure environment

```bash
cp .env.example .env
# Add your API keys to .env — never commit this file
```

Required keys (store in GCP Secret Manager for production):

```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_MAPS_API_KEY=your-maps-key
FOOTBALL_DATA_API_KEY=your-football-data-key
OPENWEATHER_API_KEY=your-openweather-key
DYNATRACE_ENDPOINT=https://your-tenant.live.dynatrace.com/api/v2/otlp
DYNATRACE_API_TOKEN=your-dynatrace-token
```

### 4. Run locally

```bash
# Start the FastAPI backend
uv run uvicorn app.main:app --reload --port 8080

# In a separate terminal, start the React frontend
cd frontend && npm install && npm run dev
```

Open `http://localhost:5173` — you should see the tourist chat UI.

### 5. Test the agent

```bash
curl -X POST http://localhost:8080/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Final whistle at the Azteca. I need to get back to Hotel Zócalo.",
    "location": {"lat": 19.3029, "lng": -99.1505},
    "language": "en"
  }'
```

-----

## ☁️ Deploy to Cloud Run

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy using agents-cli
uvx google-agents-cli deploy

# Or manually with gcloud
gcloud run deploy kickout-escape-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GOOGLE_MAPS_API_KEY=maps-key:latest"
```

-----

## 📁 Project Structure

```
kickout-escape-agent/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── agent/
│   │   ├── prompt.py        # Gemini system prompt
│   │   └── tools/
│   │       ├── crowd.py     # Crowd density tool
│   │       ├── transit.py   # GTFS-RT tool
│   │       ├── maps.py      # Google Maps tool
│   │       ├── rideshare.py # Rideshare estimate tool
│   │       └── schedule.py  # Match schedule tool
│   └── observability/
│       └── otel.py          # Dynatrace OTel config
├── frontend/                # React PWA (Claude Code)
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/
│   │       ├── ChatUI.jsx
│   │       └── RouteCard.jsx
│   └── package.json
├── terraform/               # GCP infra (auto-generated by agents-cli)
├── .github/workflows/       # CI/CD
├── .env.example
├── Dockerfile
├── pyproject.toml
└── README.md
```

-----

## 🌍 World Cup 2026 Coverage

KickOut supports all 16 host city stadiums across 3 countries:

|Country        |Host Cities                                                                                                      |
|---------------|-----------------------------------------------------------------------------------------------------------------|
|🇺🇸 United States|New York, Los Angeles, Dallas, San Francisco, Miami, Atlanta, Seattle, Boston, Houston, Philadelphia, Kansas City|
|🇲🇽 Mexico       |Mexico City, Guadalajara, Monterrey                                                                              |
|🇨🇦 Canada       |Toronto, Vancouver                                                                                               |

-----

## 🛣️ Roadmap

- [ ] Integration with real venue crowd sensors (pilot with stadium operators)
- [ ] Merchant companion: food vendors alerted 15 mins before post-match surge
- [ ] Voice input — tourist speaks, agent responds in their language
- [ ] Accessibility routing — wheelchair-accessible exit paths
- [ ] Offline mode — cached escape plan downloaded at match start

-----

## 👥 Team

|Name                            |Role                                                |Location         |
|--------------------------------|----------------------------------------------------|-----------------|
|**Alejandro Sanchez Giraldo**   |Architecture · Dynatrace · SLO Strategy · Submission|Sydney, Australia|
|**Backend Engineer**            |Vertex AI · FastAPI · Cloud Run · OTel              |Nigeria          |
|**Claude Code + GitHub Copilot**|React Frontend · PWA · Chat UI                      |🤖                |

-----

## 🏆 Hackathon

Built for the [Google Cloud Rapid Agent Hackathon](https://rapid-agent.devpost.com) — **Dynatrace Track**.

Deadline: **11 June 2026** · Prize: **$5,000 (1st place)**

-----

## 📄 License

MIT License — see <LICENSE> for details.

-----

<p align="center">
  <strong>KickOut</strong> · Built with ⚽ + ☁️ + 📡<br>
  <em>FIFA World Cup 2026 · Google Cloud · Dynatrace</em>
</p>