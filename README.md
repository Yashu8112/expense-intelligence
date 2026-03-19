# 🧠 Expense Intelligence Platform

> AI-Powered Expense Tracking SaaS — Built with Spring Boot 3, React, and GPT-4

![Stack](https://img.shields.io/badge/Backend-Spring%20Boot%203-brightgreen)
![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Stack](https://img.shields.io/badge/AI-GPT--4%20via%20Spring%20AI-purple)
![Stack](https://img.shields.io/badge/Auth-JWT%20%2B%20OAuth2-orange)
![Stack](https://img.shields.io/badge/DB-PostgreSQL-336791)
![Stack](https://img.shields.io/badge/Deploy-Docker%20Compose-2496ED)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Email/password signup + Google & GitHub OAuth2, JWT-secured APIs |
| 💸 **Expense Management** | Add, edit, delete, filter, paginate expenses |
| 🤖 **AI Categorization** | GPT-4 automatically categorizes every expense you add |
| 📊 **Dashboard Analytics** | Monthly totals, category breakdown doughnut, 6-month bar chart |
| 💡 **AI Insights** | On-demand AI spending pattern analysis with actionable tips |
| 💬 **FinBot Chatbot** | Ask your AI financial assistant anything about your spending |
| 📅 **Monthly Summary** | AI-generated narrative + key insights per month |
| 💼 **Budget Recommendations** | AI suggests optimal budgets based on 3-month history |
| 📄 **PDF Reports** | Branded, print-ready PDF with iText 8 |
| 📊 **Excel Reports** | Formatted XLSX with Apache POI |

---

## 🗂 Project Structure

```
expense-intelligence/
├── backend/                          # Spring Boot 3 application
│   ├── src/main/java/com/expenseintelligence/
│   │   ├── config/                   # SecurityConfig, AiConfig
│   │   ├── controller/               # REST controllers
│   │   ├── dto/                      # Request/Response DTOs
│   │   ├── entity/                   # JPA entities
│   │   ├── exception/                # Global exception handler
│   │   ├── repository/               # Spring Data JPA repositories
│   │   ├── report/                   # PDF & Excel generation
│   │   ├── security/                 # JWT, OAuth2, UserPrincipal
│   │   └── service/                  # Business logic
│   ├── src/main/resources/
│   │   ├── application.yml           # App configuration
│   │   └── db/migration/             # Flyway SQL migrations
│   └── Dockerfile
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   ├── context/                  # React contexts
│   │   ├── layouts/                  # AppLayout (sidebar)
│   │   ├── pages/                    # Route page components
│   │   └── services/                 # Axios API layer
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone and enter the project
cd expense-intelligence

# 2. Create your environment file
cp .env.example .env
# Edit .env and fill in OPENAI_API_KEY, OAuth2 keys, JWT_SECRET

# 3. Start everything
docker compose up --build

# App will be at:
#   Frontend:  http://localhost:5173
#   Backend:   http://localhost:8080/api
#   Swagger:   http://localhost:8080/api/swagger-ui.html
```

---

### Option B — Local Development

#### Backend

```bash
cd backend

# 1. Make sure PostgreSQL is running with:
#    DB: expense_intelligence, User: postgres, Pass: postgres
#    (or update application.yml)

# 2. Set environment variables
export OPENAI_API_KEY=sk-your-key
export JWT_SECRET=your-secret-64-chars
export GOOGLE_CLIENT_ID=your-client-id
export GOOGLE_CLIENT_SECRET=your-secret
export GITHUB_CLIENT_ID=your-client-id
export GITHUB_CLIENT_SECRET=your-secret

# 3. Run
./mvnw spring-boot:run

# Backend starts at http://localhost:8080/api
```

#### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# Frontend starts at http://localhost:5173
```

---

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description | Where to get |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | [platform.openai.com](https://platform.openai.com/api-keys) |
| `JWT_SECRET` | 64+ char random string | Generate locally |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID | [console.cloud.google.com](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 secret | Same as above |
| `GITHUB_CLIENT_ID` | GitHub OAuth2 client ID | [github.com/settings/developers](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth2 secret | Same as above |

### Setting Up OAuth2

#### Google OAuth2
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URI: `http://localhost:8080/api/oauth2/callback/google`
6. Copy Client ID and Secret to `.env`

#### GitHub OAuth2
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set Homepage URL: `http://localhost:5173`
4. Set Callback URL: `http://localhost:8080/api/oauth2/callback/github`
5. Copy Client ID and Secret to `.env`

---

## 📡 API Endpoints

### Authentication
```
POST /api/auth/signup         — Register new user
POST /api/auth/login          — Login with email/password
GET  /api/auth/me             — Get current user
GET  /api/oauth2/authorize/google  — Start Google OAuth flow
GET  /api/oauth2/authorize/github  — Start GitHub OAuth flow
```

### Expenses
```
POST   /api/expenses                   — Create expense
GET    /api/expenses                   — List expenses (with filters)
GET    /api/expenses/{id}              — Get expense by ID
PUT    /api/expenses/{id}              — Update expense
DELETE /api/expenses/{id}              — Delete expense
GET    /api/expenses/dashboard/stats   — Dashboard statistics
GET    /api/expenses/categories        — List all categories
```

### AI Features
```
POST /api/ai/insights/generate            — Generate AI insights
GET  /api/ai/insights                     — Get saved insights
GET  /api/ai/budget-recommendations       — Get budget recommendations
GET  /api/ai/monthly-summary?month=&year= — Get monthly AI summary
POST /api/ai/chat                         — Chat with FinBot
GET  /api/ai/chat/history/{sessionId}     — Get chat history
```

### Reports
```
GET /api/reports/pdf?startDate=&endDate=    — Download PDF report
GET /api/reports/excel?startDate=&endDate=  — Download Excel report
```

---

## 🗄️ Database Schema

```sql
users            — id, email, password, full_name, provider, role
expense_categories — id, name, icon, color
expenses         — id, user_id, category_id, title, amount, date, ai_category
ai_insights      — id, user_id, insight_type, title, content
chat_messages    — id, user_id, session_id, role, content
budgets          — id, user_id, category_id, month, year, amount
```

---

## 🏗️ Architecture Decisions

- **Clean Architecture** — Controller → Service → Repository separation
- **JWT Stateless Auth** — No sessions, horizontally scalable
- **OAuth2 via Spring Security** — Battle-tested OAuth2 flow
- **Spring AI** — Abstracts LLM calls; swap OpenAI for any other provider
- **Flyway Migrations** — Version-controlled, repeatable DB changes
- **Async AI Categorization** — Expenses are saved instantly; AI runs in background
- **iText 8 + Apache POI** — Professional PDF and Excel generation

---

## 🛠️ Tech Stack Summary

| Layer | Technology |
|---|---|
| Backend Framework | Spring Boot 3.2 |
| Security | Spring Security + JWT (JJWT 0.12) + OAuth2 |
| Database | PostgreSQL 16 + Spring Data JPA + Flyway |
| AI | Spring AI + OpenAI GPT-4 |
| PDF Reports | iText 8 |
| Excel Reports | Apache POI 5 |
| API Docs | SpringDoc OpenAPI 3 |
| Frontend | React 18 + Vite 5 |
| Styling | TailwindCSS 3 |
| Charts | Chart.js 4 + react-chartjs-2 |
| HTTP Client | Axios |
| Container | Docker + Docker Compose |
| Web Server | Nginx 1.25 (frontend) |

---

## 📌 Notes

- The AI categorization runs **asynchronously** — expenses appear instantly and get categorized within seconds.
- The **FinBot chatbot** has access to your last 30 days of expenses as context.
- All AI features require a valid `OPENAI_API_KEY` to work.
- Without OAuth2 credentials, email/password login will still work fully.
- Swagger UI is available at `http://localhost:8080/api/swagger-ui.html`

---

*Built with ❤️ using Spring Boot 3, React, and GPT-4*
