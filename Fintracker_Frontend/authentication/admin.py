from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display  = ['email', 'name', 'mobile', 'is_admin', 'created_at']
    list_filter   = ['is_admin', 'gender']
    search_fields = ['email', 'name', 'mobile']
    ordering      = ['-created_at']

    fieldsets = (
        (None,            {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('name', 'mobile', 'gender', 'income')}),
        ('Permissions',   {'fields': ('is_admin', 'is_active', 'is_staff', 'is_superuser')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'name', 'password1', 'password2'),
        }),
    )

admin.site.register(User, UserAdmin)