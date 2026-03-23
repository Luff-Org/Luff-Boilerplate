# 🚀 Create-Luff-App

The official CLI for scaffolding the **Luff Microservices Boilerplate**.

---

## 🧱 What's Included?

- **Frontend**: Next.js 14 (App Router) + Tailwind + Lucide Icons.
- **Auth Service**: Google OAuth + Stateless JWT.
- **Microservices**:
| Service | Path | Port | Description |
| :--- | :--- | :--- | :--- |
| **Auth Service** | `backend/auth` | :4001 | Google OAuth. |
| **Post Service** | `backend/posts` | :4002 | CRUD for community posts. |
| **Payment Service** | `backend/payment" | :4003 | Handles Razorpay orders. |
| **AI Service** | `backend/ai-service` | :4004 | AI Chatbot + RAG (Upstash Vector). |

---

## 🤖 AI Features (RAG + GPT-4o)

The AI module provides:
1. **Generic Mode**: Direct GPT-4o chat.
2. **RAG Mode**: Ask questions about your uploaded PDFs.

### Setup AI Keys:
1. Get **OpenAI Key** from [platform.openai.com](https://platform.openai.com/).
2. Get **Upstash Vector** URL/Token from [upstash.com](https://upstash.com/).
3. Set them in `backend/ai-service/.env`.

---

## 🚀 Getting Started

1. **Install CLI**: `npm install -g create-luff-app`
2. **Scaffold**: `npx create-luff-app my-vision`
3. **Setup**: `npm run setup`
4. **Dev**: `npm run dev`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
