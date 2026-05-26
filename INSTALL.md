# Vertex AI Studio Frontend App with Node.js Backend

This repository contains a frontend and a Node.js backend, designed to run together.
The backend acts as a proxy, handling Google Cloud API calls.

This project is intended for demonstration and prototyping purposes only.
It is not intended for use in a production environment.

## Prerequisites

To run this application locally, you need:

*   **[Google Cloud SDK / gcloud CLI](https://cloud.google.com/sdk/docs/install)**: Follow the instructions to install the SDK.

*   **gcloud Initialization**:
    *   Initialize the gcloud CLI:
        ```bash
        gcloud init
        ```
    *   Authenticate for Application Default Credentials (needed to call Google Cloud APIs):
        ```bash
        gcloud auth application-default login
        ```

*   **Node.js and npm**: Ensure you have Node.js and its package manager, `npm`, installed on your machine.

## Project Structure

The project is organized into two main directories:

*   `frontend/`: Contains the Frontend application code.
*   `backend/`: Contains the Node.js/Express server code to proxy Google Cloud API calls.

## Backend Environment Variables

The `backend/.env.local` file is automatically generated when you download this application.
It contains essential Google Cloud environment variables pre-configured based on your project settings at the time of download.

The variables set in `backend/.env.local` are:
*   `API_BACKEND_PORT`: The port the backend API server listens on (e.g., `5000`).
*   `API_PAYLOAD_MAX_SIZE`: The maximum size of the request payload accepted by the backend server (e.g., `5mb`).
*   `GOOGLE_CLOUD_LOCATION`: The Google Cloud region associated with your project.
*   `GOOGLE_CLOUD_PROJECT`: Your Google Cloud Project ID.

**Note:** These variables are automatically populated during the download process.
You can modify the values in `backend/.env.local` if you need to change them.

## Installation and Running the App

### Frontend Environment Variables

Create `frontend/.env.local` with:

*   `VITE_API_KEY`: Gemini key used by the frontend SDK.
*   `VITE_BACKEND_URL`: Absolute URL for the backend proxy.

Recommended local value:

```bash
VITE_API_KEY=your-gemini-api-key
VITE_BACKEND_URL=http://127.0.0.1:5000
```

Using `127.0.0.1` avoids `localhost` IPv6/IPv4 mismatches on some machines.

### Backend Environment Variables

Ensure `backend/.env.local` contains valid values for:

*   `API_BACKEND_PORT` (typically `5000`)
*   `API_PAYLOAD_MAX_SIZE`
*   `GOOGLE_CLOUD_LOCATION`
*   `GOOGLE_CLOUD_PROJECT`
*   `PROXY_HEADER`

### Run Locally

From the repository root:

```bash
npm install
npm run dev
```

This starts:

*   Frontend (Vite)
*   Backend proxy (Node.js)

If you change any `.env.local` file, restart the corresponding dev server.

Before running the app, make sure ADC is authenticated:

```bash
gcloud auth application-default login
```
