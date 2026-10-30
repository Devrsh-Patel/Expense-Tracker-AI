from rest_framework import serializers
from .models import Category, Expense, Onboarding, Budget, FinancialGoal, RecurringExpense, BillSplit, BillSplitMember


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = '__all__'


class ExpenseSerializer(serializers.ModelSerializer):
    category_name  = serializers.CharField(source='category.name',  read_only=True)
    category_icon  = serializers.CharField(source='category.icon',  read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)

    class Meta:
        model  = Expense
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class OnboardingSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Onboarding
        fields = '__all__'
        read_only_fields = ['user']


class BudgetSerializer(serializers.ModelSerializer):
    category_name  = serializers.CharField(source='category.name',  read_only=True)
    category_icon  = serializers.CharField(source='category.icon',  read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    spent_amount   = serializers.SerializerMethodField()
    percentage     = serializers.SerializerMethodField()

    class Meta:
        model  = Budget
        fields = '__all__'
        read_only_fields = ['user']

    def get_spent_amount(self, obj):
        from django.db.models import Sum
        spent = Expense.objects.filter(
            user=obj.user,
            category=obj.category,
            date__startswith=obj.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        return str(spent)

    def get_percentage(self, obj):
        from django.db.models import Sum
        spent = Expense.objects.filter(
            user=obj.user,
            category=obj.category,
            date__startswith=obj.month
        ).aggregate(total=Sum('amount'))['total'] or 0
        if obj.amount > 0:
            return round((float(spent) / float(obj.amount)) * 100, 1)
        return 0


class FinancialGoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    days_remaining      = serializers.SerializerMethodField()

    class Meta:
        model  = FinancialGoal
        fields = '__all__'
        read_only_fields = ['user']

    def get_progress_percentage(self, obj):
        if obj.target_amount > 0:
            return round((float(obj.saved_amount) / float(obj.target_amount)) * 100, 1)
        return 0

    def get_days_remaining(self, obj):
        if obj.deadline:
            from datetime import date
            delta = obj.deadline - date.today()
            return delta.days
        return None


class RecurringExpenseSerializer(serializers.ModelSerializer):
    category_name  = serializers.CharField(source='category.name',  read_only=True)
    category_icon  = serializers.CharField(source='category.icon',  read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)

    class Meta:
        model  = RecurringExpense
        fields = '__all__'
        read_only_fields = ['user']


class BillSplitMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model  = BillSplitMember
        fields = '__all__'


class BillSplitSerializer(serializers.ModelSerializer):
    members = BillSplitMemberSerializer(many=True, read_only=True)

    class Meta:
        model  = BillSplit
        fields = '__all__'
        read_only_fields = ['user']