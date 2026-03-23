# 💨 Luff Microservices Boilerplate

A **production-ready microservices monorepo** featuring Google OAuth, Payments, and AI-powered RAG. Designed for ultra-fast startup and GitOps-ready deployment.

---

## 🏗️ Monorepo Architecture

| Service | Path | Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend App** | `frontend` | :3000 | Next.js 14 with TailwindCSS, Lucide-React and Sonner. 🥂 |
| **Auth Service** | `backend/auth` | :4001 | Google OAuth + Stateless JWT Authentication. 🛡️ |
| **Posts Service** | `backend/posts` | :4002 | CRUD for community posts with owner enforcement. 🍻 |
| **Payment Service** | `backend/payment` | :4003 | Handles Razorpay orders and payment verification. ✨ |
| **AI Service** | `backend/ai-service` | :4004 | **AI Chatbot (GPT-4o)** + **RAG** (Upstash Vector) for PDF intelligence. 🧠 💎 |
| **API Gateway** | `backend/api-gateway` | :4000 | Microservices proxy with Rate Limiting and unified entry point. 🛡️ ✨ |

---

## 🔐 Google OAuth Configuration

To enable authentication:

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Set authorized origin to `http://localhost:3000`.
3. Update `GOOGLE_CLIENT_ID` in `backend/auth/.env` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `frontend/.env`.

---

## 🤖 AI Service Configuration (Optional)

To unleash the **AI Chatbot** and **RAG** functionality:

1. **OpenAI**: Get your `OPENAI_API_KEY` from [OpenAI Dashboard](https://platform.openai.com/).
2. **Upstash**: Create a **Vector Index** (1536 dimensions) in [Upstash Console](https://console.upstash.com/) and copy the REST URL and Token.
3. Update these in `backend/ai-service/.env`.

---

## 🐳 Deployment

### Docker Compose

```bash
docker compose -f docker/docker-compose.yml up --build
```

### Kubernetes

```bash
kubectl apply -f k8s/
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
