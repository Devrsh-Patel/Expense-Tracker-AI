from django.http import JsonResponse
from django.db import connection

def health_check(request):
    db_status = "healthy"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    is_healthy = db_status == "healthy"
    status_code = 200 if is_healthy else 503
    return JsonResponse({
        "status": "ok" if is_healthy else "degraded",
        "database": db_status,
        "service": "FinTracker API",
        "version": "1.0.0"
    }, status=status_code)

def root_api(request):
    return JsonResponse({
        "message": "Welcome to FinTracker API",
        "documentation": "/swagger/",
        "health": "/api/health/"
    })

