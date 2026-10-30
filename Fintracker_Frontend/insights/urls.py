# from django.urls import path
# from . import views

# urlpatterns = [
#     path('', views.InsightsSummaryView.as_view(), name='insights-summary'),
# ]

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header  = "FinTracker Admin"
admin.site.site_title   = "FinTracker Admin Portal"
admin.site.index_title  = "Welcome to FinTracker Admin"

urlpatterns = [
    path('admin/',        admin.site.urls),
    path('api/auth/',     include('authentication.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/reports/',  include('reports.urls')),
    path('api/insights/', include('insights.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)