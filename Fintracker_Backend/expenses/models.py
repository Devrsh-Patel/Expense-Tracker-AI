from django.db import models
from authentication.models import User

class Category(models.Model):
    name  = models.CharField(max_length=100)
    icon  = models.CharField(max_length=10)
    color = models.CharField(max_length=20)

    class Meta:
        db_table = 'categories'

    def __str__(self):
        return self.name

class Expense(models.Model):
    PAYMENT_MODES = [
        ('Cash',        'Cash'),
        ('UPI',         'UPI'),
        ('Card',        'Card'),
        ('Net Banking', 'Net Banking'),
        ('Wallet',      'Wallet'),
        ('Other',       'Other'),
    ]

    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    category        = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    custom_category = models.ForeignKey('CustomCategory', on_delete=models.SET_NULL, null=True, blank=True)
    amount       = models.DecimalField(max_digits=12, decimal_places=2)
    date         = models.DateField()
    payment_mode = models.CharField(max_length=20, choices=PAYMENT_MODES)
    description  = models.CharField(max_length=150)
    spent_at     = models.CharField(max_length=100, null=True, blank=True)
    receipt_name = models.CharField(max_length=255, null=True, blank=True)
    manual_receipt = models.TextField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expenses'

    def __str__(self):
        return f"{self.user.name} - {self.description} - {self.amount}"

class Onboarding(models.Model):
    user            = models.OneToOneField(User, on_delete=models.CASCADE, related_name='onboarding')
    income_source   = models.CharField(max_length=100, null=True, blank=True)
    family_members  = models.CharField(max_length=50, null=True, blank=True)
    purpose         = models.CharField(max_length=100, null=True, blank=True)
    has_loan        = models.CharField(max_length=100, null=True, blank=True)
    biggest_expense = models.CharField(max_length=100, null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'onboardings'

    def __str__(self):
        return f"{self.user.name} onboarding"


class Budget(models.Model):
    user     = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    amount   = models.DecimalField(max_digits=12, decimal_places=2)
    month    = models.CharField(max_length=7)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'category', 'month']
        db_table = 'budgets'

    def __str__(self):
        return f"{self.user.name} - {self.category.name} - {self.month}"


class FinancialGoal(models.Model):
    STATUS_CHOICES = [
        ('active',    'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    user          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title         = models.CharField(max_length=100)
    description   = models.TextField(null=True, blank=True)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    saved_amount  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deadline      = models.DateField(null=True, blank=True)
    status        = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    icon          = models.CharField(max_length=10, default='🎯')
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'financial_goals'

    def __str__(self):
        return f"{self.user.name} - {self.title}"


class RecurringExpense(models.Model):
    FREQUENCY_CHOICES = [
        ('daily',   'Daily'),
        ('weekly',  'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly',  'Yearly'),
    ]
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recurring')
    category     = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    title        = models.CharField(max_length=100)
    amount       = models.DecimalField(max_digits=12, decimal_places=2)
    frequency    = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    next_due     = models.DateField()
    payment_mode = models.CharField(max_length=20, default='UPI')
    is_active    = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recurring_expenses'

    def __str__(self):
        return f"{self.user.name} - {self.title}"


class BillSplit(models.Model):
    user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bill_splits')
    title        = models.CharField(max_length=100)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    description  = models.TextField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'bill_splits'

    def __str__(self):
        return f"{self.user.name} - {self.title}"


class BillSplitMember(models.Model):
    bill     = models.ForeignKey(BillSplit, on_delete=models.CASCADE, related_name='members')
    name     = models.CharField(max_length=100)
    amount   = models.DecimalField(max_digits=12, decimal_places=2)
    is_paid  = models.BooleanField(default=False)
    paid_at  = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'bill_split_members'

    def __str__(self):
        return f"{self.bill.title} - {self.name}"

class CustomCategory(models.Model):
    user  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_categories')
    name  = models.CharField(max_length=100)
    icon  = models.CharField(max_length=50, default='other')
    color = models.CharField(max_length=20, default='#6C757D')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'custom_categories'

    def __str__(self):
        return f"{self.user.name} - {self.name}"