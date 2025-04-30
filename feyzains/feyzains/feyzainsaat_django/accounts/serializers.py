from rest_framework import serializers


from accounts.models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({'data':{ 'status': 'success', 'detail': 'Logged in successfully'}})
        return data
class UserSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True)
    username = serializers.CharField(required=False)    
    class Meta:
        model = User
        fields = '__all__'

    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'