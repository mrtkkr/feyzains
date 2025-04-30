from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response 
from accounts.models import User
from django.http import JsonResponse
from django.contrib.auth import authenticate, login,logout
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, action
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model

from .serializers import *

from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated,AllowAny
from feyzainsaat_django.pagination import CustomPageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
import json
from rest_framework import status
from django.db import transaction

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    print('user in get_tokens_for_user', user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    if request.user.is_authenticated:
        return Response({'message': 'User already authenticated'}, status=200)

    data = request.data
    print('request.data', data)

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response({'message': 'Email and password are required'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'No user with this email address exists'}, status=400)
    user = authenticate(request, username=email, password=password)

    if user is not None:
        token = get_tokens_for_user(user)
        return Response({'message': 'Login successful', 'token': token, 'user': UserSerializer(user).data})
    else:
        return Response({'message': 'Incorrect password'}, status=400)
    
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    data = request.data
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')
    company_name = data.get('company')

    if not email or not password or not first_name or not last_name:
        return Response({'message': 'Missing required fields'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'message': 'User already exists'}, status=400)

    try:
        company = None
        print(company_name)
        if company_name:
            company_instance, _ = Company.objects.get_or_create(name=company_name)
            company = company_instance

        user = User.objects.create_user(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            company=company
        )
        user.save()

    except Exception as e:
        return Response({'message': f'User could not be created: {str(e)}'}, status=400)

    return Response({'message': 'User created successfully'})
    
@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    try:
        refresh_token = request.data.get("refresh_token")
        # Blacklist the refresh token
        refresh = RefreshToken(refresh_token)
        refresh.blacklist()

        logout(request)

        
        return Response({'message': 'Logout successful'}, status=200)
    except Exception as e:
        return Response({'message': str(e)}, status=400)

class Home(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({'message': f'Hello, {user.email}'})
    

class UsersView(APIView):
    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    def check_email_exists(self, email, exclude_user_id=None):
        query = User.objects.filter(email=email)
        if exclude_user_id:
            query = query.exclude(id=exclude_user_id)
        return query.exists()

    def post(self, request):
        data = request.data
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        for field in required_fields:
            if not data.get(field):
                return Response({'message': f'{field} is required'}, status=400)
        
        # Check if email exists
        if self.check_email_exists(data['email']):
            return Response({'message': 'Email already exists'}, status=400)
        
        try:
            user = User.objects.create_user(
                email=data['email'],
                password=data['password'],
                first_name=data['first_name'],
                last_name=data['last_name'],
            )
            
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data,
            }, status=201)
        except Exception as e:
            return Response({'message': str(e)}, status=400)

    def put(self, request):
        data = request.data
        user_id = data.get('id')

        if not user_id:
            return Response({'message': 'User ID is required'}, status=400)

        try:
            user = User.objects.get(id=user_id)
            
            # Check if new email exists (excluding current user)
            if data.get('email') and data['email'] != user.email:
                if self.check_email_exists(data['email'], user_id):
                    return Response({'message': 'Email already exists'}, status=400)
            
            # Update fields if provided
            if data.get('first_name'):
                user.first_name = data['first_name']
            if data.get('last_name'):
                user.last_name = data['last_name']
            if data.get('email'):
                user.email = data['email']
            if data.get('password'):
                user.set_password(data['password'])

            user.save()
            
            return Response({
                'message': 'User updated successfully',
                'user': UserSerializer(user).data
            }, status=200)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=404)
        except Exception as e:
            return Response({'message': str(e)}, status=400)

    # Add email check endpoint
    @action(detail=False, methods=['post'])
    def check_email(self, request):
        email = request.data.get('email')
        exclude_user_id = request.data.get('exclude_user_id')
        
        if not email:
            return Response({'message': 'Email is required'}, status=400)
            
        exists = self.check_email_exists(email, exclude_user_id)
        return Response({'exists': exists})
    
    def delete(self, request):
        data = request.data
        user_id = data.get('id')
        print(user_id)

        if not user_id:
            return Response({"message": "User ID is required"}, status=400)

        try:
            user = User.objects.get(id=user_id)
            user.delete()
            # Change from 204 to 200 and include message in response
            return JsonResponse({
                "success": True,
                "message": "User successfully deleted."
            }, status=200)
        except User.DoesNotExist:
            return Response({
                "success": False,
                "message": "User not found."
            }, status=404)


class UserView(APIView): 
    def get(self, request):
        # TODO: check if user is admin when id is passed
        if request.GET.get('id'):
            user_id = request.GET.get('id')
            if user_id == 0 or user_id == '0':
                print('user_id', user_id)
                users = User.objects.all()
                users_serialized = UserSerializer(users, many=True).data
                return JsonResponse(users_serialized, safe=False)
            else:
                user = User.objects.get(id=user_id)
                user_serialized = UserSerializer(user).data
                return JsonResponse(user_serialized)
        else:
            user = request.user
            user_serialized = UserSerializer(user).data
            return JsonResponse(user_serialized)
        
         
    def post(self, request):
        pass
        
        
            
    def put(self, request):
        try:
            data = request.data
            print('request.data', data)
            
            # Check if 'id' is in the request data
            if 'id' in data:
                # Get the user by id when id is passed
                user = User.objects.get(id=data['id'])
            else:
                # Else get the request user
                user = request.user
            
            # Change only the fields that have been passed
            if data.get('email'):
                # TODO: update email change logic later
                user.email = data['email']
            if data.get('first_name'):
                user.first_name = data['first_name']
            if data.get('last_name'):
                user.last_name = data['last_name']
            if data.get('password'):
                # TODO: maybe add sms or email confirmation for password
                user.set_password(data['password'])  # Use set_password to hash the password
            if data.get('phone_number'):
                user.phone_number = data['phone_number']
            
            user.save()
            return Response({'message': 'User updated successfully', 'user': UserSerializer(user).data})
        except Exception as e:
            return Response({'message': f'User could not be updated: {str(e)}'})  
    def delete(self, request):
        user_id = request.GET.get('id')
        user = User.objects.get(id=user_id)
        user.is_active = False
        user.save()
        return Response({'message': 'User deactivated successfully'})
    
 

class NotificationView(ListAPIView):
    serializer_class = NotificationSerializer
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        return self.request.user.notifications.ordered_by_priority_and_date()
    
class SetNotificationsAsRead(APIView):
    def post(self, request):
        data = request.data
        if data.get('notification_ids'):
            notification_ids = data['notification_ids']
            notifications = Notification.objects.filter(id__in=notification_ids)
            for notification in notifications:
                notification.is_read = True
                notification.save()
            return Response({'message': 'Notifications set as read successfully'})
        

