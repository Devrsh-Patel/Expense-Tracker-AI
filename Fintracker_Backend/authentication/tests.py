from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import User
from expenses.models import Expense, Category

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='user1@test.com',
            password='Password123!',
            name='User One'
        )
        self.user2 = User.objects.create_user(
            email='user2@test.com',
            password='Password123!',
            name='User Two'
        )

    def test_login_success(self):
        res = self.client.post('/api/auth/login/', {
            'email': 'user1@test.com',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])

    def test_google_login_missing_token(self):
        res = self.client.post('/api/auth/google/', {}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data.get('error'), 'Token is required')

    def test_google_login_invalid_token(self):
        res = self.client.post('/api/auth/google/', {'token': 'fake_invalid_token_12345'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_expense_isolation(self):
        cat = Category.objects.create(name='Groceries', color='#27ae60', icon='🛒')
        exp = Expense.objects.create(
            user=self.user1,
            category=cat,
            amount=500.0,
            date='2026-10-30',
            description='Test Groceries'
        )

        # Authenticate as user2
        self.client.force_authenticate(user=self.user2)
        res = self.client.get('/api/expenses/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

        # Authenticate as user1
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/expenses/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['description'], 'Test Groceries')
