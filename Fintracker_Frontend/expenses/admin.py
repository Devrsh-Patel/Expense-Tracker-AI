from django.contrib import admin
from .models import Category, Expense, Onboarding

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['id', 'name', 'icon', 'color']
    search_fields = ['name']

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display  = ['user', 'description', 'amount', 'category', 'payment_mode', 'date']
    list_filter   = ['payment_mode', 'category']
    search_fields = ['description', 'user__email']
    ordering      = ['-date']

@admin.register(Onboarding)
class OnboardingAdmin(admin.ModelAdmin):
    list_display  = ['user', 'income_source', 'purpose']
    search_fields = ['user__email']