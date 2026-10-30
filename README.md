# FinTracker - AI-Powered Expense Tracker

FinTracker is a full-stack personal finance and expense management web application featuring AI/ML-driven insights, budgeting, bill splitting, and comprehensive reporting.

---

## 🚀 Features

- **Dashboard & Analytics**: Track income, monthly expenses, category-wise breakdowns, and spending trends with interactive charts.
- **Expense Tracking**: Add, edit, filter, and categorize daily expenses with payment modes (UPI, Card, Cash, etc.).
- **AI Insights & ML Prediction**: Machine learning regression models trained on spending patterns to predict and evaluate expenses.
- **Budget Planner & Goals**: Set category-specific monthly budgets and track financial savings goals.
- **Bill Splitter**: Split shared bills with friends/groups and track settlements.
- **Recurring Expenses**: Manage monthly subscriptions and recurring bills.
- **Reports & Export**: Generate detailed spending reports across custom timeframes.
- **Authentication**: JWT-based authentication with user profile and currency management.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with **Vite**
- **React Router 7**
- **Recharts** (Visualizations)
- **React Icons**
- **Axios** (API Client)

### Backend
- **Python** & **Django REST Framework**
- **SimpleJWT** (Authentication)
- **SQLite** (Default local DB) / **MySQL** support
- **Scikit-learn**, **Pandas**, **NumPy**, **Joblib** (ML Pipeline)

---

## 🏁 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Quick Start (Windows)
Double-click `run_project.bat` or run:
```powershell
.\run_project.bat
```
This automatically starts both the Django backend and React frontend dev server and opens `http://localhost:5173/` in your browser.

---

### Manual Setup

#### 1. Backend Setup
```bash
# Navigate to backend directory
cd Fintracker_Backend

# Activate virtual environment
# Windows:
..\.venv\Scripts\activate

# Install dependencies (if needed)
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver 127.0.0.1:8000
```
Backend runs on: `http://127.0.0.1:8000/`

#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd Fintracker_Frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend runs on: `http://localhost:5173/`

---

### 🧠 Train ML Model
To retrain the expense prediction model:
```bash
python train_model.py
```
Models will be saved to `Fintracker_Backend/insights/models/`.

---

## ☁️ Cloud Deployment Guide (Free Tier)

### 1. Database Setup (Free MySQL via TiDB Cloud / Aiven)
1. Sign up on **[TiDB Cloud](https://tidb.cloud/)** (Serverless Free Tier, 25 GB storage, 100% MySQL 8 compatible).
2. Create a free cluster and obtain your MySQL connection details:
   - Host, Port (default `4000`), User, Password, Database (`fintracker_db`).

### 2. Backend Deployment (Render Free Web Service)
1. Sign in to **[Render](https://render.com/)** using your GitHub account (`Devrsh-Patel`).
2. Click **New +** -> **Web Service** -> Connect `Devrsh-Patel/Expense-Tracker-AI-`.
3. Set the following options:
   - **Root Directory**: `Fintracker_Backend`
   - **Environment**: `Python 3`
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `gunicorn fintracker_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2`
   - **Plan**: `Free`
4. In **Environment Variables**, add:
   - `DEBUG`: `False`
   - `SECRET_KEY`: `<generate-a-secure-random-key>`
   - `ALLOWED_HOSTS`: `.onrender.com,localhost,127.0.0.1`
   - `DB_ENGINE`: `django.db.backends.mysql`
   - `DB_NAME`: `<your_db_name>`
   - `DB_USER`: `<your_db_user>`
   - `DB_PASSWORD`: `<your_db_password>`
   - `DB_HOST`: `<your_db_host>`
   - `DB_PORT`: `4000` (or `3306`)
   - `CORS_ALLOWED_ORIGINS`: `https://<your-frontend-app>.vercel.app,http://localhost:5173`
   - `CSRF_TRUSTED_ORIGINS`: `https://<your-frontend-app>.vercel.app,https://<your-backend-app>.onrender.com`
5. Click **Create Web Service**. Render runs migrations and serves the API at `https://<your-backend-app>.onrender.com`.

### 3. Frontend Deployment (Vercel Free Tier)
1. Sign in to **[Vercel](https://vercel.com/)** using your GitHub account (`Devrsh-Patel`).
2. Click **Add New...** -> **Project** -> Import `Devrsh-Patel/Expense-Tracker-AI-`.
3. Set:
   - **Root Directory**: `Fintracker_Frontend`
   - **Framework Preset**: `Vite`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<your-backend-app>.onrender.com`
5. Click **Deploy**. Vercel will build and provide your live frontend URL (e.g., `https://expense-tracker-ai.vercel.app`).


