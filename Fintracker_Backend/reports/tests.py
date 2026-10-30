from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class ReportValidationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='report@example.com',
            password='StrongPass123!',
            name='Report User',
        )
        self.client.force_authenticate(user=self.user)

    def test_invalid_date_range_is_rejected(self):
        response = self.client.get('/api/reports/', {'from_date': '2025-05-10', 'to_date': '2025-05-01'})

        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)
