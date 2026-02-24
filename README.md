# SoulSync

SoulSync is an AI-powered mental health and wellness platform designed to help users better understand and manage their emotional well-being. Instead of being just another journaling app, SoulSync combines reflective journaling, facial emotion analysis, adaptive assessments, and predictive risk modeling to provide meaningful, data-driven insights into mental health trends. By integrating AI with behavioral tracking and community support, SoulSync offers a holistic approach to mental wellness monitoring.

## Key Features

### AI-Driven Insights
-   **Deep Insights Journaling**: AI-enhanced journaling that detects sentiment and identifies discrepancies between written words and facial expressions using Face-api.js.
-   **AI Mental Health Companion**: An intelligent chatbot powered by Gemini AI. It utilizes Face-api.js for real-time facial emotion recognition during interactions to provide more empathetic support.
-   **Adaptive Mental Health Quizzes**: Specialized assessments for stress, anxiety, depression, and sleep, which adapt dynamically based on user responses.

### Advanced Risk Monitoring
The platform utilizes a sophisticated Insights & Alerts System to monitor well-being trends:
-   **Velocity Tracking**: Detects rapid deterioration or improvement in mental health scores (pts/day).
-   **Volatility Analysis**: Measures mood instability and daily fluctuations.
-   **Early Warning System**: Identifies relapse patterns or persistent high-risk states.
-   **Actionable Insights**: Provides recovery progress notifications and stability reports.

### Support & Community
-   **Helplines Feature**: A dedicated feature providing quick access to professional crisis resources and mental health support services.
-   **Community Forum**: A safe, anonymous space to share thoughts and find peer support.
-   **Emergency Support Circle**: Ability to set and notify emergency contacts instantly.

## Tech Stack

### Frontend
-   **React (Vite)**: Modern, responsive UI.
-   **Tailwind CSS & DaisyUI**: Styled with a focus on tranquility and accessibility.
-   **TanStack Query & Recharts**: Robust data management and visualization.
-   **face-api.js**: Browser-based facial expression recognition for journaling and chatbot analysis.

### Backend
-   **Node.js & Express**: Core API logic.
-   **MongoDB (Mongoose)**: Encrypted storage for journals and user data.
-   **Redis / Upstash**: Efficient caching and rate-limiting.
-   **Twilio & Web-Push**: Multi-channel notifications for reminders and alerts.

### AI & Machine Learning
-   **DistilBERT**: Fine-tuned for mental health risk classification (Anxiety, Depression, Suicidal ideation).
-   **Toxic-BERT**: Used for hate speech detection to maintain community safety.
-   **XGBoost**: The core engine for risk evaluation and prediction.
    -   **Dynamic Risk Weighting**: Learns from historical user data to determine the relative importance of different indicators (quizzes, journals, chat patterns). It automatically updates the system's risk configuration based on learned feature importance.
    -   **Predictive Forecasting**: Utilizes temporal regression to forecast a user's risk score 7 days into the future, enabling early intervention.
-   **FastAPI**: High-performance backbone for AI services.

## Project Structure

```text
SoulSync/
├── client/          
├── server/           
├── python-server/    
├── data/             
└── docker-compose.yml 
```

## Getting Started

### Docker Setup (Recommended)

The easiest way to get SoulSync running is using Docker. Ensure you have Docker and Docker Compose installed.

1.  **Configure Environment**:
    Create `.env` files in `server/`, `client/`, and `python-server/` using the tables below as a guide.

2.  **Start Services**:
    ```bash
    docker-compose up --build
    ```
    This will spin up:
    -   **Server**: [http://localhost:5000](http://localhost:5000)
    -   **Client**: [http://localhost:5173](http://localhost:5173)
    -   **AI Service**: [http://localhost:8000](http://localhost:8000)
    -   **Redis**: Local instance for caching.

### Local Setup (Manual)

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/sej197/SoulSync.git
    cd SoulSync
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Run Services**:
    -   **Server**: `npm run dev` in `server/`
    -   **AI Service**: `python server.py` in `python-server/`
    -   **Client**: `npm run dev` in `client/`

## Environment Variables

### Internal Backend (`server/`)

| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB connection string (Atlas or Local). |
| `PORT` | Port for the Express server (default: 5000). |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens. |
| `NODE_ENV` | Environment mode (`development` or `production`). |
| `SENDER_EMAIL` | Email address for sending notifications/OTP. |
| `SENDER_PASS` | App password for the sender email account. |
| `IMAGEKIT_PUBLIC_KEY` | Public key for ImageKit.io media storage. |
| `IMAGEKIT_PRIVATE_KEY` | Private key for ImageKit.io media storage. |
| `IMAGEKIT_URL_ENDPOINT` | URL endpoint for ImageKit.io storage. |
| `CLIENT_URL` | Frontend URL (e.g., `http://localhost:5173`). |
| `PYTHON_SERVER` | URL of the AI service (e.g., `http://localhost:8000`). |
| `JOURNAL_ENCRYPTION_KEY` | 32-byte hexadecimal key for AES-256 journal encryption. |
| `VAPID_PUBLIC_KEY` | Public Key for Web Push notifications. |
| `VAPID_PRIVATE_KEY` | Private Key for Web Push notifications. |
| `GEMINI_API_KEY` | Google Gemini API key for AI features. |
| `REDIS_HOST` | Redis hostname (e.g., `localhost` or `redis`). |
| `REDIS_PORT` | Redis port (default: 6379). |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL (optional). |
| `UPSTASH_REDIS_REST_TOKEN`| Upstash Redis REST Token (optional). |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID for SMS integration. |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token for SMS integration. |
| `TWILIO_PHONE_NUMBER` | Twilio Phone Number for sending SMS. |

### AI Service (`python-server/`)

| Variable | Description |
| :--- | :--- |
| `GROQ_API_KEY` | API key for Groq inference engine. |

### Frontend (`client/`)

| Variable | Description |
| :--- | :--- |
| `VITE_BASE_URL` | Backend API URL (e.g., `http://localhost:5000`). |
| `VITE_IMAGEKIT_ENDPOINT` | URL endpoint for ImageKit.io. |
| `VITE_IMAGEKIT_PUBLIC_KEY`| Public key for ImageKit.io. |
| `VITE_IMAGEKIT_PRIVATE_KEY`| Private key for ImageKit.io. |
| `VITE_GEMINI_PUBLIC_KEY` | Public Key or specific ID for Gemini client-side features. |

## Integrated Helplines (India)

Access professional support directly through the Helplines feature:
-   **iCall (TISS)**: 9152987821 (Mon–Sat, 8am–10pm)
-   **Vandrevala Foundation**: 1860-2662-345 (24/7)
-   **AASRA**: 9820466627 (24/7)
-   **Asks Foundation**: +91 87930 88814 (24/7)

---
## Team Members

- Sayalee Khedekar
- Anjali Phule
- Noopur Karkare
- Sejal Pathak

*SoulSync - Syncing your soul with your digital journey.*
