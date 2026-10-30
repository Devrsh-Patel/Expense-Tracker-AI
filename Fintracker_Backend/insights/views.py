from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Sum
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from expenses.models import Category, Expense
from insights.ai_service import build_prediction_payload


class InsightsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = datetime.now()

        this_month_exp = Expense.objects.filter(
            user=request.user,
            date__year=now.year,
            date__month=now.month,
        )

        last_month = now.replace(day=1) - timedelta(days=1)
        last_month_exp = Expense.objects.filter(
            user=request.user,
            date__year=last_month.year,
            date__month=last_month.month,
        )

        this_total = this_month_exp.aggregate(total=Sum('amount'))['total'] or Decimal('0')
        last_total = last_month_exp.aggregate(total=Sum('amount'))['total'] or Decimal('0')

        days_passed = now.day
        daily_avg = float(this_total) / days_passed if days_passed > 0 else 0
        projected = daily_avg * 30

        mom_change = None
        if last_total > 0:
            mom_change = round(((float(this_total) - float(last_total)) / float(last_total)) * 100, 1)

        category_totals = []
        for cat in Category.objects.all():
            cat_total = this_month_exp.filter(category=cat).aggregate(total=Sum('amount'))['total'] or 0
            if cat_total > 0:
                category_totals.append({
                    'name': cat.name,
                    'icon': cat.icon,
                    'color': cat.color,
                    'total': float(cat_total),
                })

        category_totals.sort(key=lambda x: x['total'], reverse=True)

        unusual = []
        if daily_avg > 0:
            for e in this_month_exp:
                if float(e.amount) > daily_avg * 3:
                    unusual.append({
                        'id': e.id,
                        'description': e.description,
                        'amount': str(e.amount),
                        'date': str(e.date),
                        'category': e.category.name if e.category else '',
                    })

        suggested_budgets = []
        for cat in Category.objects.all():
            three_month_total = Decimal('0')
            for i in range(1, 4):
                d = now.replace(day=1) - timedelta(days=i * 28)
                month_total = Expense.objects.filter(
                    user=request.user,
                    category=cat,
                    date__year=d.year,
                    date__month=d.month,
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0')
                three_month_total += month_total

            avg = float(three_month_total) / 3
            if avg > 0:
                suggested_budgets.append({
                    'category_name': cat.name,
                    'category_icon': cat.icon,
                    'avg': round(avg, 2),
                    'suggested': round(avg * 1.1, 2),
                })

        suggested_budgets.sort(key=lambda x: x['avg'], reverse=True)

        prediction_payload = build_prediction_payload(
            user=request.user,
            expenses=list(this_month_exp),
            budgets=None,
            income=getattr(request.user, 'income', None),
            month=now.strftime('%Y-%m'),
        )

        return Response({
            'this_month_total': str(this_total),
            'last_month_total': str(last_total),
            'daily_average': round(daily_avg, 2),
            'projected_total': round(projected, 2),
            'mom_change': mom_change,
            'category_totals': category_totals,
            'unusual_count': len(unusual),
            'unusual': unusual,
            'suggested_budgets': suggested_budgets,
            'prediction': prediction_payload,
        })