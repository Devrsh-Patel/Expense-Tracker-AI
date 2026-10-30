from django.urls import path
from . import views

urlpatterns = [
    path('categories/',                  views.CategoryListView.as_view(),        name='categories'),
    path('',                             views.ExpenseListView.as_view(),         name='expense-list'),
    path('<int:pk>/',                    views.ExpenseDetailView.as_view(),       name='expense-detail'),
    path('<int:pk>/receipt/',            views.ReceiptUploadView.as_view(),       name='receipt-upload'),
    path('onboarding/',                  views.OnboardingView.as_view(),          name='onboarding'),
    path('summary/',                     views.ExpenseSummaryView.as_view(),      name='expense-summary'),
    path('budgets/',                     views.BudgetView.as_view(),              name='budgets'),
    path('budgets/<int:pk>/',            views.BudgetDetailView.as_view(),        name='budget-detail'),
    path('goals/',                       views.FinancialGoalView.as_view(),       name='goals'),
    path('goals/<int:pk>/',              views.FinancialGoalDetailView.as_view(), name='goal-detail'),
    path('recurring/',                   views.RecurringExpenseView.as_view(),    name='recurring'),
    path('recurring/<int:pk>/',          views.RecurringExpenseView.as_view(),    name='recurring-detail'),
    path('bill-splits/',                 views.BillSplitView.as_view(),           name='bill-splits'),
    path('bill-splits/<int:pk>/',        views.BillSplitDetailView.as_view(),     name='bill-split-detail'),
    path('custom-categories/',           views.CustomCategoryView.as_view(),      name='custom-categories'),
    path('custom-categories/<int:pk>/',  views.CustomCategoryView.as_view(),      name='custom-category-detail'),
]