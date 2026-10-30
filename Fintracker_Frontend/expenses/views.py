from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime
from .models import Category, Expense, Onboarding, Budget, FinancialGoal, RecurringExpense, BillSplit, BillSplitMember, CustomCategory
from .serializers import CategorySerializer, ExpenseSerializer, OnboardingSerializer, BudgetSerializer, FinancialGoalSerializer, RecurringExpenseSerializer, BillSplitSerializer, BillSplitMemberSerializer, CustomCategorySerializer


class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class ExpenseListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user).order_by('-date')

        from_date = request.query_params.get('from_date')
        to_date   = request.query_params.get('to_date')
        category  = request.query_params.get('category')
        payment   = request.query_params.get('payment_mode')

        if from_date:
            expenses = expenses.filter(date__gte=from_date)
        if to_date:
            expenses = expenses.filter(date__lte=to_date)
        if category:
            expenses = expenses.filter(category__id=category)
        if payment:
            expenses = expenses.filter(payment_mode=payment)

        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Expense.objects.get(pk=pk, user=user)
        except Expense.DoesNotExist:
            return None

    def get(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    def put(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ExpenseSerializer(expense, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        expense = self.get_object(pk, request.user)
        if not expense:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)
        expense.delete()
        return Response({'message': 'Expense deleted successfully'}, status=status.HTTP_204_NO_CONTENT)


class OnboardingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            onboarding = Onboarding.objects.get(user=request.user)
            serializer = OnboardingSerializer(onboarding)
            return Response(serializer.data)
        except Onboarding.DoesNotExist:
            return Response({'completed': False})

    def post(self, request):
        try:
            onboarding = Onboarding.objects.get(user=request.user)
            serializer = OnboardingSerializer(onboarding, data=request.data, partial=True)
        except Onboarding.DoesNotExist:
            serializer = OnboardingSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({
                'message': 'Onboarding completed',
                'data':    serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.filter(user=request.user)

        month = request.query_params.get('month')
        if month:
            expenses = expenses.filter(date__startswith=month)

        total = expenses.aggregate(total=Sum('amount'))['total'] or 0

        category_summary = []
        categories = Category.objects.all()
        for cat in categories:
            cat_expenses = expenses.filter(category=cat)
            cat_total = cat_expenses.aggregate(total=Sum('amount'))['total'] or 0
            if cat_total > 0:
                category_summary.append({
                    'category_id':    cat.id,
                    'category_name':  cat.name,
                    'category_icon':  cat.icon,
                    'category_color': cat.color,
                    'total':          str(cat_total),
                    'percentage':     round((float(cat_total) / float(total)) * 100, 1) if total > 0 else 0
                })

        category_summary.sort(key=lambda x: float(x['total']), reverse=True)

        return Response({
            'total':            str(total),
            'count':            expenses.count(),
            'category_summary': category_summary
        })


class ReceiptUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            expense = Expense.objects.get(pk=pk, user=request.user)
        except Expense.DoesNotExist:
            return Response({'error': 'Expense not found'}, status=status.HTTP_404_NOT_FOUND)

        file = request.FILES.get('receipt')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
        if file.content_type not in allowed_types:
            return Response({'error': 'Only JPG PNG PDF allowed'}, status=status.HTTP_400_BAD_REQUEST)

        if file.size > 5 * 1024 * 1024:
            return Response({'error': 'File too large. Maximum 5MB'}, status=status.HTTP_400_BAD_REQUEST)

        file_path  = f'receipts/{request.user.id}/{pk}/{file.name}'
        saved_path = default_storage.save(file_path, ContentFile(file.read()))

        expense.receipt_name = file.name
        expense.save()

        return Response({
            'message':   'Receipt uploaded successfully',
            'file_path': saved_path
        }, status=status.HTTP_200_OK)


class BudgetView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get('month', datetime.now().strftime('%Y-%m'))
        budgets = Budget.objects.filter(user=request.user, month=month)
        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)

    def post(self, request):
        month = request.data.get('month', datetime.now().strftime('%Y-%m'))
        budget, created = Budget.objects.update_or_create(
            user=request.user,
            category_id=request.data.get('category'),
            month=month,
            defaults={'amount': request.data.get('amount')}
        )
        return Response(BudgetSerializer(budget).data, status=status.HTTP_201_CREATED)

    def put(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk, user=request.user)
            budget.amount = request.data.get('amount', budget.amount)
            budget.save()
            return Response(BudgetSerializer(budget).data)
        except Budget.DoesNotExist:
            return Response({'error': 'Budget not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            budget = Budget.objects.get(pk=pk, user=request.user)
            budget.delete()
            return Response({'message': 'Budget deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Budget.DoesNotExist:
            return Response({'error': 'Budget not found'}, status=status.HTTP_404_NOT_FOUND)


class FinancialGoalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goals = FinancialGoal.objects.filter(user=request.user).order_by('-created_at')
        serializer = FinancialGoalSerializer(goals, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FinancialGoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FinancialGoalDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            goal = FinancialGoal.objects.get(pk=pk, user=request.user)
            serializer = FinancialGoalSerializer(goal, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except FinancialGoal.DoesNotExist:
            return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            goal = FinancialGoal.objects.get(pk=pk, user=request.user)
            goal.delete()
            return Response({'message': 'Goal deleted'}, status=status.HTTP_204_NO_CONTENT)
        except FinancialGoal.DoesNotExist:
            return Response({'error': 'Goal not found'}, status=status.HTTP_404_NOT_FOUND)


class RecurringExpenseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recurring = RecurringExpense.objects.filter(
            user=request.user, is_active=True
        ).order_by('next_due')
        serializer = RecurringExpenseSerializer(recurring, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = RecurringExpenseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            recurring = RecurringExpense.objects.get(pk=pk, user=request.user)
            recurring.is_active = False
            recurring.save()
            return Response({'message': 'Recurring expense removed'}, status=status.HTTP_204_NO_CONTENT)
        except RecurringExpense.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class BillSplitView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bills = BillSplit.objects.filter(user=request.user).order_by('-created_at')
        serializer = BillSplitSerializer(bills, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BillSplitSerializer(data=request.data)
        if serializer.is_valid():
            bill    = serializer.save(user=request.user)
            members = request.data.get('members', [])
            for member in members:
                BillSplitMember.objects.create(
                    bill=bill,
                    name=member.get('name'),
                    amount=member.get('amount'),
                    is_paid=member.get('is_paid', False)
                )
            return Response(BillSplitSerializer(bill).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BillSplitDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            member = BillSplitMember.objects.get(pk=pk)
            member.is_paid = request.data.get('is_paid', member.is_paid)
            if member.is_paid:
                from django.utils import timezone
                member.paid_at = timezone.now()
            member.save()
            return Response(BillSplitMemberSerializer(member).data)
        except BillSplitMember.DoesNotExist:
            return Response({'error': 'Member not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            bill = BillSplit.objects.get(pk=pk, user=request.user)
            bill.delete()
            return Response({'message': 'Bill split deleted'}, status=status.HTTP_204_NO_CONTENT)
        except BillSplit.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class CustomCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = CustomCategory.objects.filter(user=request.user)
        serializer = CustomCategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CustomCategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            category = CustomCategory.objects.get(pk=pk, user=request.user)
            category.delete()
            return Response({'message': 'Category deleted'}, status=status.HTTP_204_NO_CONTENT)
        except CustomCategory.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)