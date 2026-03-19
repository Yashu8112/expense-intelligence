-- V1__init_schema.sql
-- Expense Intelligence Platform - Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255),
    full_name       VARCHAR(255) NOT NULL,
    avatar_url      VARCHAR(500),
    provider        VARCHAR(50) NOT NULL DEFAULT 'LOCAL',   -- LOCAL, GOOGLE, GITHUB
    provider_id     VARCHAR(255),
    role            VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider, provider_id);

-- ============================================================
-- EXPENSE CATEGORIES TABLE
-- ============================================================
CREATE TABLE expense_categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    icon        VARCHAR(50),
    color       VARCHAR(20),
    description VARCHAR(255),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO expense_categories (name, icon, color, description) VALUES
    ('Food & Dining',     'utensils',       '#F59E0B', 'Restaurants, cafes, groceries'),
    ('Transportation',    'car',            '#3B82F6', 'Fuel, public transport, rideshare'),
    ('Shopping',          'shopping-bag',   '#8B5CF6', 'Clothing, electronics, online shopping'),
    ('Entertainment',     'film',           '#EC4899', 'Movies, concerts, streaming services'),
    ('Healthcare',        'heart',          '#EF4444', 'Medical, pharmacy, fitness'),
    ('Housing',           'home',           '#10B981', 'Rent, utilities, maintenance'),
    ('Travel',            'plane',          '#06B6D4', 'Flights, hotels, vacations'),
    ('Education',         'book',           '#F97316', 'Courses, books, subscriptions'),
    ('Bills & Utilities', 'zap',            '#84CC16', 'Electricity, water, internet'),
    ('Personal Care',     'smile',          '#A78BFA', 'Haircut, spa, personal items'),
    ('Investments',       'trending-up',    '#14B8A6', 'Stocks, mutual funds, crypto'),
    ('Insurance',         'shield',         '#64748B', 'Life, health, vehicle insurance'),
    ('Gifts & Donations', 'gift',           '#F472B6', 'Gifts, charity, donations'),
    ('Other',             'more-horizontal','#9CA3AF', 'Miscellaneous expenses');

-- ============================================================
-- EXPENSES TABLE
-- ============================================================
CREATE TABLE expenses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     INTEGER REFERENCES expense_categories(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    expense_date    DATE NOT NULL,
    payment_method  VARCHAR(50) DEFAULT 'CARD',    -- CASH, CARD, UPI, BANK_TRANSFER, OTHER
    merchant        VARCHAR(255),
    tags            TEXT[],
    ai_category     VARCHAR(100),
    ai_confidence   DECIMAL(5, 4),
    ai_processed    BOOLEAN NOT NULL DEFAULT FALSE,
    receipt_url     VARCHAR(500),
    notes           TEXT,
    is_recurring    BOOLEAN NOT NULL DEFAULT FALSE,
    recurring_freq  VARCHAR(20),                   -- DAILY, WEEKLY, MONTHLY, YEARLY
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_title_trgm ON expenses USING GIN(title gin_trgm_ops);

-- ============================================================
-- AI INSIGHTS TABLE
-- ============================================================
CREATE TABLE ai_insights (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_type    VARCHAR(50) NOT NULL,   -- SPENDING_PATTERN, BUDGET_REC, ANOMALY, SUMMARY
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL,
    metadata        JSONB,
    period_start    DATE,
    period_end      DATE,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user ON ai_insights(user_id, created_at DESC);

-- ============================================================
-- BUDGET TABLE
-- ============================================================
CREATE TABLE budgets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     INTEGER REFERENCES expense_categories(id),
    month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year            INTEGER NOT NULL,
    amount          DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, category_id, month, year)
);

CREATE INDEX idx_budgets_user ON budgets(user_id, year, month);

-- ============================================================
-- CHAT MESSAGES TABLE (AI Chatbot)
-- ============================================================
CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id      UUID NOT NULL,
    role            VARCHAR(20) NOT NULL,   -- USER, ASSISTANT
    content         TEXT NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_user_session ON chat_messages(user_id, session_id, created_at);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
