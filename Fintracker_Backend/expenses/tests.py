from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Expense


class ReceiptUploadValidationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='receipt@example.com',
            password='StrongPass123!',
            name='Receipt User',
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name='Food', icon='🍽️', color='#FF6B6B')
        self.expense = Expense.objects.create(
            user=self.user,
            category=self.category,
            amount=120.50,
            date='2025-01-15',
            payment_mode='UPI',
            description='Lunch',
        )

    def test_receipt_with_disallowed_extension_is_rejected(self):
        file = SimpleUploadedFile(
            'fake.pdf',
            b'not-a-real-image',
            content_type='image/jpeg',
        )

        response = self.client.post(
            f'/api/expenses/{self.expense.id}/receipt/',
            {'receipt': file},
            format='multipart',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
