from django.urls import path
from . import views

urlpatterns = [
    path('',        views.ReportSummaryView.as_view(), name='report-summary'),
    path('export/', views.ExportCSVView.as_view(),     name='export-csv'),
]