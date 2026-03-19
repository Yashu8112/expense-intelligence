# 🧠 Expense Intelligence Platform

> AI-Powered Expense Tracking — Built with Spring Boot 3, React, and Groq AI

![Stack](https://img.shields.io/badge/Backend-Spring%20Boot%203-brightgreen)
![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Stack](https://img.shields.io/badge/AI-Groq%20AI-purple)
![Stack](https://img.shields.io/badge/Auth-JWT-orange)
![Stack](https://img.shields.io/badge/DB-PostgreSQL-336791)
![Stack](https://img.shields.io/badge/Deploy-Docker%20Compose-2496ED)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Email/password signup & login, JWT-secured APIs |
| 💸 **Expense Management** | Add, edit, delete, filter, and paginate expenses |
| 🤖 **AI Categorization** | Groq AI automatically categorizes every expense you add |
| 📊 **Dashboard Analytics** | Monthly totals, category breakdown doughnut, 6-month bar chart |
| 💡 **AI Insights** | On-demand AI spending pattern analysis with actionable tips |
| 💬 **FinBot Chatbot** | Ask your AI financial assistant anything about your spending |
| 📅 **Monthly Summary** | AI-generated narrative + key insights per month |
| 💼 **Budget Recommendations** | AI suggests optimal budgets based on 3-month history |
| 📄 **PDF Reports** | Branded, print-ready PDF report |
| 📊 **Excel Reports** | Formatted XLSX export |
| 🌙 **Dark / Light Mode** | Toggle between dark and light theme across all pages |
| 💰 **INR Currency** | All amounts displayed in Indian Rupees (₹) |

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
│   │   ├── security/                 # JWT, UserPrincipal
│   │   └── service/                  # Business logic + AI
│   ├── src/main/resources/
│   │   ├── application.yml           # App configuration
│   │   └── db/migration/             # Flyway SQL migrations
│   └── Dockerfile
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── components/               # Reusable components
│   │   ├── context/                  # Auth + Theme contexts
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
- Groq API key — get one free at [console.groq.com](https://console.groq.com)

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Enter the project folder
cd expense-intelligence

# 2. Create your environment file
cp .env.example .env
# Edit .env and set OPENAI_API_KEY to your Groq API key and JWT_SECRET

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

# 2. Set environment variables
export OPENAI_API_KEY=your-groq-api-key
export JWT_SECRET=your-secret-64-chars

# 3. Run
./mvnw spring-boot:run

# Backend starts at http://localhost:8080/api
```

#### Frontend

```bash
cd frontend

npm install
npm run dev

# Frontend starts at http://localhost:5173
```

---

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description | Where to get |
|---|---|---|
| `OPENAI_API_KEY` | Groq API key | [console.groq.com](https://console.groq.com) |
| `JWT_SECRET` | 64+ character random string | Generate locally |
| `DB_HOST` | PostgreSQL host | Your DB server |
| `DB_PORT` | PostgreSQL port (default 5432) | Your DB server |
| `DB_NAME` | Database name | Your DB server |
| `DB_USERNAME` | Database username | Your DB server |
| `DB_PASSWORD` | Database password | Your DB server |

---

## 📡 API Endpoints

### Authentication
```
POST /api/auth/signup    — Register new user
POST /api/auth/login     — Login with email/password
GET  /api/auth/me        — Get current user
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
POST /api/ai/insights/generate             — Generate AI insights
GET  /api/ai/insights                      — Get saved insights
GET  /api/ai/budget-recommendations        — Get budget recommendations
GET  /api/ai/monthly-summary?month=&year=  — Get monthly AI summary
POST /api/ai/chat                          — Chat with FinBot
GET  /api/ai/chat/history/{sessionId}      — Get chat history
```

### Reports
```
GET /api/reports/pdf?startDate=&endDate=    — Download PDF report
GET /api/reports/excel?startDate=&endDate=  — Download Excel report
```

---

## 🗄️ Database Schema

```sql
users              — id, email, password, full_name, role
expense_categories — id, name, icon, color
expenses           — id, user_id, category_id, title, amount, currency, date, ai_category
ai_insights        — id, user_id, insight_type, title, content
chat_messages      — id, user_id, session_id, role, content
```

---

## 🏗️ Architecture

- **Clean Architecture** — Controller → Service → Repository separation
- **JWT Stateless Auth** — No sessions, horizontally scalable
- **Spring AI** — Abstracts LLM calls; easily swap Groq for any other provider
- **Flyway Migrations** — Version-controlled, repeatable DB schema changes
- **Async AI Categorization** — Expenses saved instantly; AI categorization runs in background

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | Spring Boot 3.2 |
| Security | Spring Security + JWT (JJWT 0.12) |
| Database | PostgreSQL 16 + Spring Data JPA + Flyway |
| AI | Spring AI + Groq (llama-3.3-70b-versatile) |
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

## 🌐 Live Demo

| | URL |
|-|-----|
| Frontend | https://expense-intelligence-iota.vercel.app |
| Backend | https://expense-backend-z1dp.onrender.com |

---

## 📌 Notes

- AI categorization runs **asynchronously** — expenses appear instantly and get categorized within seconds.
- **FinBot chatbot** has access to your last 30 days of expenses as context.
- All AI features require a valid Groq API key.
- Swagger UI available at `/api/swagger-ui.html`
- All amounts are displayed in **Indian Rupees (₹)**.

---

*Built with ❤️ using Spring Boot 3, React, and Groq AI*