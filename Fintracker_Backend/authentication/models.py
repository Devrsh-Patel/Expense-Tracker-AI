from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_admin', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    name        = models.CharField(max_length=100)
    email       = models.EmailField(unique=True)
    mobile      = models.CharField(max_length=10, unique=True, null=True, blank=True)
    gender      = models.CharField(max_length=20, null=True, blank=True)
    income      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency    = models.CharField(max_length=10, default='INR')
    is_admin    = models.BooleanField(default=False)
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email