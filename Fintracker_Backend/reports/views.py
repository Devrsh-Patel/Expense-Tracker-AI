from datetime import date, datetime
import csv

from django.db.models import Sum
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from expenses.models import Category, Expense

class ReportSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user)

        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        if from_date:
            try:
                from_date_value = datetime.strptime(from_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'from_date must be in YYYY-MM-DD format'}, status=400)
            if from_date_value > date.today():
                return Response({'error': 'from_date cannot be in the future'}, status=400)
            expenses = expenses.filter(date__gte=from_date_value)
        if to_date:
            try:
                to_date_value = datetime.strptime(to_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'to_date must be in YYYY-MM-DD format'}, status=400)
            if to_date_value > date.today():
                return Response({'error': 'to_date cannot be in the future'}, status=400)
            expenses = expenses.filter(date__lte=to_date_value)

        if from_date and to_date:
            if from_date_value > to_date_value:
                return Response({'error': 'from_date cannot be later than to_date'}, status=400)

        total = expenses.aggregate(total=Sum('amount'))['total'] or 0

        category_data = []
        for cat in Category.objects.all():
            cat_total = expenses.filter(category=cat).aggregate(
                total=Sum('amount'))['total'] or 0
            if cat_total > 0:
                category_data.append({
                    'category_id':    cat.id,
                    'category_name':  cat.name,
                    'category_icon':  cat.icon,
                    'category_color': cat.color,
                    'total':          str(cat_total),
                    'percentage':     round((float(cat_total) / float(total)) * 100, 1)
                })

        category_data.sort(key=lambda x: float(x['total']), reverse=True)

        return Response({
            'total':            str(total),
            'count':            expenses.count(),
            'from_date':        from_date,
            'to_date':          to_date,
            'category_summary': category_data,
            'expenses':         [
                {
                    'id':           e.id,
                    'date':         str(e.date),
                    'description':  e.description,
                    'category':     e.category.name if e.category else '',
                    'amount':       str(e.amount),
                    'payment_mode': e.payment_mode,
                    'spent_at':     e.spent_at or ''
                }
                for e in expenses.order_by('-date')
            ]
        })


class ExportCSVView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user)

        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')

        if from_date:
            try:
                from_date_value = datetime.strptime(from_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'from_date must be in YYYY-MM-DD format'}, status=400)
            if from_date_value > date.today():
                return Response({'error': 'from_date cannot be in the future'}, status=400)
            expenses = expenses.filter(date__gte=from_date_value)
        if to_date:
            try:
                to_date_value = datetime.strptime(to_date, '%Y-%m-%d').date()
            except ValueError:
                return Response({'error': 'to_date must be in YYYY-MM-DD format'}, status=400)
            if to_date_value > date.today():
                return Response({'error': 'to_date cannot be in the future'}, status=400)
            expenses = expenses.filter(date__lte=to_date_value)

        if from_date and to_date:
            if from_date_value > to_date_value:
                return Response({'error': 'from_date cannot be later than to_date'}, status=400)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="fintracker_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Description', 'Category', 'Amount', 'Payment Mode', 'Spent At'])

        for e in expenses.order_by('-date'):
            writer.writerow([
                e.date,
                e.description,
                e.category.name if e.category else '',
                e.amount,
                e.payment_mode,
                e.spent_at or ''
            ])

        return response