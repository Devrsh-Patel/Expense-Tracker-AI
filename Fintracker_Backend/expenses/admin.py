from django.contrib import admin
from .models import Category, Expense, Onboarding, Budget, FinancialGoal, RecurringExpense, BillSplit, BillSplitMember, CustomCategory

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'icon', 'color']
    search_fields = ['name']

from django.utils.html import format_html

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display  = ['user', 'description', 'amount', 'category', 'payment_mode', 'date', 'receipt_preview', 'manual_receipt']
    list_filter   = ['payment_mode', 'category']
    search_fields = ['description', 'user__email']
    ordering      = ['-date']
    readonly_fields = ['receipt_preview']

    def receipt_preview(self, obj):
        if obj.receipt_name:
            url = f"/media/receipts/{obj.user_id}/{obj.id}/{obj.receipt_name}"
            if obj.receipt_name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg')):
                return format_html(
                    '<a href="{0}" target="_blank" title="Click to view full size">'
                    '<img src="{0}" style="max-height: 55px; max-width: 110px; border-radius: 5px; border: 1.5px solid #eaeaea; object-fit: cover;" />'
                    '</a>',
                    url
                )
            return format_html('<a href="{0}" target="_blank" style="font-weight: bold; color: #2D6A4F;">📄 View Document ({1})</a>', url, obj.receipt_name)
        return "-"

    receipt_preview.short_description = 'Receipt Preview'

@admin.register(Onboarding)
class OnboardingAdmin(admin.ModelAdmin):
    list_display  = ['user', 'income_source', 'purpose']
    search_fields = ['user__email']

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display  = ['user', 'category', 'amount', 'month']
    search_fields = ['user__email']

@admin.register(FinancialGoal)
class FinancialGoalAdmin(admin.ModelAdmin):
    list_display  = ['user', 'title', 'target_amount', 'saved_amount', 'status']
    search_fields = ['user__email', 'title']

@admin.register(RecurringExpense)
class RecurringExpenseAdmin(admin.ModelAdmin):
    list_display  = ['user', 'title', 'amount', 'frequency', 'next_due']
    search_fields = ['user__email', 'title']

@admin.register(BillSplit)
class BillSplitAdmin(admin.ModelAdmin):
    list_display  = ['user', 'title', 'total_amount', 'created_at']
    search_fields = ['user__email', 'title']

@admin.register(CustomCategory)
class CustomCategoryAdmin(admin.ModelAdmin):
    list_display  = ['user', 'name', 'color']
    search_fields = ['user__email', 'name']