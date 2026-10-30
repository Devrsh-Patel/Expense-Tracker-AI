from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from .views import health_check, root_api

schema_view = get_schema_view(
    openapi.Info(
        title="FinTracker API",
        default_version='v1',
        description="FinTracker Personal Expense Tracker API Documentation",
        contact=openapi.Contact(email="admin@fintracker.com"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('',              root_api,     name='root-api'),
    path('health/',       health_check, name='health-check-root'),
    path('api/health/',   health_check, name='health-check'),
    path('admin/',        admin.site.urls),
    path('api/auth/',     include('authentication.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/reports/',  include('reports.urls')),
    path('api/insights/', include('insights.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/',   schema_view.with_ui('redoc',   cache_timeout=0), name='redoc-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
