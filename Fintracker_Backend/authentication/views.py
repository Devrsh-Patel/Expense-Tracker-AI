from django.conf import settings
from django.db.models import Sum
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UpdateProfileSerializer
from .models import User
from expenses.models import Expense
import random
import requests as http_requests
from django.core.cache import cache


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access':  str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user   = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Account created successfully',
                'user':    UserSerializer(user).data,
                'tokens':  tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user   = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful',
                'user':    UserSerializer(user).data,
                'tokens':  tokens
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user':    UserSerializer(request.user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'No account found with this email'},
                status=status.HTTP_404_NOT_FOUND
            )

        otp = str(random.randint(100000, 999999))
        cache.set(f'otp_{email}', otp, timeout=600)

        return Response({
            'message': f'OTP sent to {email}',
            'otp': otp
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp   = request.data.get('otp')

        if not email or not otp:
            return Response(
                {'error': 'Email and OTP are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cached_otp = cache.get(f'otp_{email}')

        if not cached_otp:
            return Response(
                {'error': 'OTP expired. Please request a new one'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if str(otp) != str(cached_otp):
            return Response(
                {'error': 'Invalid OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reset_token = str(random.randint(100000000, 999999999))
        cache.set(f'reset_token_{email}', reset_token, timeout=600)
        cache.delete(f'otp_{email}')

        return Response({
            'message':     'OTP verified successfully',
            'reset_token': reset_token
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email            = request.data.get('email')
        reset_token      = request.data.get('reset_token')
        new_password     = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not all([email, reset_token, new_password, confirm_password]):
            return Response(
                {'error': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cached_token = cache.get(f'reset_token_{email}')

        if not cached_token:
            return Response(
                {'error': 'Reset token expired. Please start again'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if str(reset_token) != str(cached_token):
            return Response(
                {'error': 'Invalid reset token'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            cache.delete(f'reset_token_{email}')
            return Response({
                'message': 'Password reset successfully'
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        old_password     = request.data.get('old_password')
        new_password     = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not all([old_password, new_password, confirm_password]):
            return Response(
                {'error': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(old_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.set_password(new_password)
        request.user.save()

        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        total_users    = User.objects.filter(is_admin=False).count()
        total_expenses = Expense.objects.count()
        total_amount   = Expense.objects.aggregate(
            total=Sum('amount'))['total'] or 0

        all_users = User.objects.filter(
            is_admin=False
        ).order_by('-created_at')

        return Response({
            'total_users':    total_users,
            'total_expenses': total_expenses,
            'total_amount':   str(total_amount),
            'recent_users': [
                {
                    'id':         u.id,
                    'name':       u.name,
                    'email':      u.email,
                    'mobile':     u.mobile,
                    'gender':     u.gender,
                    'created_at': str(u.created_at)
                }
                for u in all_users
            ]
        })


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        email = request.data.get('email')
        name  = request.data.get('name')

        if not token:
            return Response(
                {'error': 'Token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Try validating as Google ID Token first
            google_url = f'https://oauth2.googleapis.com/tokeninfo?id_token={token}'
            response = http_requests.get(google_url)
            idinfo = response.json()

            # If that fails, fallback to validating as access token via userinfo
            if 'error' in idinfo or 'error_description' in idinfo:
                google_url_acc = 'https://www.googleapis.com/oauth2/v3/userinfo'
                headers = {'Authorization': f'Bearer {token}'}
                response_acc = http_requests.get(google_url_acc, headers=headers)
                idinfo_acc = response_acc.json()
                if 'error' not in idinfo_acc:
                    idinfo = idinfo_acc
                else:
                    return Response(
                        {'error': 'Invalid Google token'},
                        status=status.HTTP_400_BAD_REQUEST
                    )


            # Security: Validate audience if present (for ID tokens)
            configured_client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
            allowed_audiences = [a for a in [configured_client_id] if a]

            token_aud = idinfo.get('aud')
            if token_aud and allowed_audiences and token_aud not in allowed_audiences:
                return Response(
                    {'error': 'Invalid token audience.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Security: Ensure email is verified by Google
            if idinfo.get('email_verified') in [False, 'false', '0']:
                return Response(
                    {'error': 'Google account email is not verified.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            email = idinfo.get('email')
            name  = idinfo.get('name') or (email.split('@')[0] if email else 'User')

            if not email:
                return Response(
                    {'error': 'Email not provided by Google'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'name':      name,
                    'is_active': True,
                }
            )

            if created:
                user.set_unusable_password()
                user.save()

            tokens = get_tokens_for_user(user)

            return Response({
                'message': 'Google login successful',
                'user':    UserSerializer(user).data,
                'tokens':  tokens,
                'is_new':  created
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )