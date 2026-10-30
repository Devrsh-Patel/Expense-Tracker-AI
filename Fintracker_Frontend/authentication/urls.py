from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/',        views.RegisterView.as_view(),       name='register'),
    path('login/',           views.LoginView.as_view(),          name='login'),
    path('logout/',          views.LogoutView.as_view(),         name='logout'),
    path('profile/',         views.ProfileView.as_view(),        name='profile'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),
    path('verify-otp/',      views.VerifyOTPView.as_view(),      name='verify-otp'),
    path('reset-password/',  views.ResetPasswordView.as_view(),  name='reset-password'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('token/refresh/',   TokenRefreshView.as_view(),         name='token-refresh'),
    path('admin/stats/',     views.AdminStatsView.as_view(),     name='admin-stats'),
]