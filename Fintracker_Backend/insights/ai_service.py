from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

import joblib
import pandas as pd

MODEL_PATH = Path(__file__).resolve().parent / 'models' / 'expense_model.joblib'
FEATURES_PATH = Path(__file__).resolve().parent / 'models' / 'feature_names.joblib'
METRICS_PATH = Path(__file__).resolve().parent / 'models' / 'metrics.joblib'


def _load_model_artifacts():
    if not MODEL_PATH.exists():
        return None, ['Category', 'Payment Mode', 'Month'], {}

    model = joblib.load(MODEL_PATH)
    features = joblib.load(FEATURES_PATH) if FEATURES_PATH.exists() else ['Category', 'Payment Mode', 'Month']
    metrics = joblib.load(METRICS_PATH) if METRICS_PATH.exists() else {}
    return model, features, metrics


def _coerce_amount(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    try:
        return float(str(value))
    except (TypeError, ValueError):
        return 0.0


def _coerce_category(expense: Any) -> str:
    if hasattr(expense, 'category_name') and expense.category_name:
        return str(expense.category_name)
    if hasattr(expense, 'category') and expense.category:
        name = getattr(expense.category, 'name', None) or expense.category
        return str(name)
    if isinstance(expense, dict):
        return str(expense.get('category_name') or expense.get('category') or 'Other')
    return 'Other'


def _coerce_payment_mode(expense: Any) -> str:
    if hasattr(expense, 'payment_mode') and expense.payment_mode:
        return str(expense.payment_mode)
    if isinstance(expense, dict):
        return str(expense.get('payment_mode') or 'Other')
    return 'Other'


def _coerce_date(expense: Any) -> str:
    if hasattr(expense, 'date') and expense.date:
        return str(expense.date)
    if isinstance(expense, dict):
        return str(expense.get('date') or '')
    return ''


def _get_month_index(month: str | None) -> int:
    if month and len(month) >= 7:
        return int(month.split('-')[1])
    return datetime.now().month


def _build_category_summary(expenses: Iterable[Any]) -> list[dict[str, Any]]:
    totals: dict[str, float] = {}
    for expense in expenses:
        category = _coerce_category(expense)
        totals[category] = totals.get(category, 0.0) + _coerce_amount(getattr(expense, 'amount', None) or (expense.get('amount') if isinstance(expense, dict) else None))

    category_summary = []
    for category, total in totals.items():
        category_summary.append({'name': category, 'total': round(total, 2)})
    category_summary.sort(key=lambda item: item['total'], reverse=True)
    return category_summary


def build_prediction_payload(user: Any, expenses: Iterable[Any], budgets: Iterable[Any] | None = None, income: float | None = None, month: str | None = None) -> dict[str, Any]:
    month = month or datetime.now().strftime('%Y-%m')
    month_expenses = [expense for expense in expenses if _coerce_date(expense).startswith(month)]
    last_month = datetime.strptime(month + '-01', '%Y-%m-%d')
    prev_month = last_month.replace(day=1) if last_month.month == 1 else last_month.replace(year=last_month.year, month=last_month.month - 1)
    previous_month_label = prev_month.strftime('%Y-%m')
    previous_month_expenses = [expense for expense in expenses if _coerce_date(expense).startswith(previous_month_label)]

    current_total = round(sum(_coerce_amount(getattr(expense, 'amount', None) or (expense.get('amount') if isinstance(expense, dict) else None)) for expense in month_expenses), 2)
    previous_total = round(sum(_coerce_amount(getattr(expense, 'amount', None) or (expense.get('amount') if isinstance(expense, dict) else None)) for expense in previous_month_expenses), 2)

    daily_average = round(current_total / max(1, datetime.now().day), 2)
    expected_daily = round(daily_average, 2)
    expected_weekly = round(expected_daily * 7, 2)
    expected_monthly = round(expected_daily * 30, 2)

    monthly_growth = 0.0
    if previous_total > 0:
        monthly_growth = round(((current_total - previous_total) / previous_total) * 100, 1)

    category_summary = _build_category_summary(month_expenses)
    highest_category = category_summary[0]['name'] if category_summary else 'Other'
    lowest_category = category_summary[-1]['name'] if category_summary else 'Other'

    payment_modes: dict[str, int] = {}
    for expense in month_expenses:
        mode = _coerce_payment_mode(expense)
        payment_modes[mode] = payment_modes.get(mode, 0) + 1

    primary_payment_mode = max(payment_modes.items(), key=lambda item: item[1])[0] if payment_modes else 'Other'

    model, feature_names, metrics = _load_model_artifacts()
    predicted_amount = expected_monthly
    if model is not None:
        try:
            input_df = pd.DataFrame([{
                'Category': highest_category,
                'Payment Mode': primary_payment_mode,
                'Month': _get_month_index(month),
            }], columns=feature_names)
            predicted_amount = float(model.predict(input_df)[0])
        except Exception:
            predicted_amount = expected_monthly

    income_value = float(income or 0 or getattr(user, 'income', 0) or 0)
    remaining_budget = round(income_value - predicted_amount, 2) if income_value > 0 else None
    budget_utilization = round((predicted_amount / income_value) * 100, 1) if income_value > 0 else 0.0
    spending_trend = 'rising' if monthly_growth > 8 else 'falling' if monthly_growth < -8 else 'stable'
    future_forecast = round(predicted_amount * (1 + (monthly_growth / 100 if monthly_growth else 0)), 2)

    suggestions = []
    for category_item in category_summary[:4]:
        suggested = round(max(category_item['total'] * 1.1, 0), 2)
        suggestions.append({'category': category_item['name'], 'suggested_amount': suggested})

    if income_value > 0 and predicted_amount > income_value:
        overspending = [f'Projected monthly spending of {predicted_amount:.2f} exceeds your income of {income_value:.2f}.']
    else:
        overspending = []

    tips = []
    if predicted_amount > income_value > 0:
        tips.append('Trim discretionary categories such as entertainment and subscriptions to bring spending back in line.')
    elif budget_utilization > 70:
        tips.append('Your spending is approaching your budget limit; consider pausing non-essential purchases this week.')
    else:
        tips.append('You are staying on track; keep contributing to your savings goal to build momentum.')

    if suggestions:
        tips.append('Use the suggested category budgets to keep future months predictable and balanced.')

    recommendations = []
    if budget_utilization > 80:
        recommendations.append('You are using a large share of your income; reduce non-essential spending to protect savings.')
    if highest_category and highest_category != 'Other':
        recommendations.append(f'{highest_category} is your top spending category; consider setting a tighter monthly cap there.')
    if remaining_budget is not None and remaining_budget > 0:
        recommendations.append('A positive remaining budget gives you room to save or invest this month.')
    if not recommendations:
        recommendations.append('Keep logging expenses regularly so the predictions stay accurate and useful.')

    health_score = max(0, min(100, round(100 - budget_utilization, 1))) if income_value > 0 else 70.0

    return {
        'expected_daily_expense': round(expected_daily, 2),
        'expected_weekly_expense': round(expected_weekly, 2),
        'expected_monthly_expense': round(expected_monthly, 2),
        'remaining_budget': remaining_budget,
        'budget_utilization_percent': round(budget_utilization, 1),
        'spending_trend': spending_trend,
        'monthly_growth': monthly_growth,
        'category_analysis': category_summary[:5],
        'highest_spending_category': highest_category,
        'lowest_spending_category': lowest_category,
        'future_expense_forecast': round(future_forecast, 2),
        'smart_budget_suggestions': suggestions,
        'saving_tips': tips,
        'overspending_alerts': overspending,
        'financial_health_score': round(health_score, 1),
        'ai_recommendations': recommendations,
        'model_metrics': metrics,
        'predicted_amount': round(predicted_amount, 2),
        'prediction_history': [
            {'month': month, 'amount': round(current_total, 2)},
            {'month': previous_month_label, 'amount': round(previous_total, 2)},
        ],
    }


def get_model_metrics() -> dict[str, Any]:
    _, _, metrics = _load_model_artifacts()
    return metrics
