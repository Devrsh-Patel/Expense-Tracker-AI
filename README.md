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
