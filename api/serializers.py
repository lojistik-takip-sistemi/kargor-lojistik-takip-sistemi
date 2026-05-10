from .models import ActionLog # En üste eklemeyi unutma (veya mevcut model importuna dahil et)
from rest_framework import serializers
from .models import User, Project, Task, Comment, Notification
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'full_name', 'email', 'role', 'phone']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Güvenli şifre hashleme yöntemi
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['task_code', 'created_at'] # YENİ EKLENEN SATIR: Bu alanları benden bekleme, otomatik dolacak diyoruz.

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
       

class ActionLogSerializer(serializers.ModelSerializer):
    # Logu atan kişinin adını doğrudan göstermek için
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = ActionLog
        fields = ['id', 'user_name', 'action_type', 'description', 'created_at']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Token içine kullanıcının rolünü ekliyoruz
        token['role'] = user.role 
        return token

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'user_name', 'content', 'created_at']
        read_only_fields = ['user'] # Kullanıcıyı biz otomatik atayacağız
    

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'role']
        read_only_fields = ['username', 'role'] # Kullanıcı adı ve rol değiştirilemez 

from django.contrib.auth.hashers import make_password

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'full_name', 'email', 'role']

    def create(self, validated_data):
        # Şifreyi güvenli hale getiriyoruz
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)