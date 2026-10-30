from django.urls import path
from . import views

urlpatterns = [
    path('', views.InsightsSummaryView.as_view(), name='insights-summary'),
]