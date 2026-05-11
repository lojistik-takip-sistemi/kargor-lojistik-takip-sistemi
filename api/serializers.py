from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password
from .models import User, Project, Task, Comment, Notification, ActionLog
from django.core.mail import send_mail
from django.conf import settings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'full_name', 'email', 'role', 'phone']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source='assigned_to.full_name', read_only=True, default='Atanmadı')
    project_name = serializers.CharField(source='project.name', read_only=True, default='Bireysel Kargo')
    customer_name = serializers.CharField(source='customer.full_name', read_only=True, default='Bilinmiyor')
    
    class Meta:
        model = Task
        fields = '__all__'
        # customer alanı otomatik dolduğu için read_only olmalı
        read_only_fields = ['task_code', 'created_at', 'customer']

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'user', 'user_name', 'content', 'created_at']
        read_only_fields = ['user']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class ActionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = ActionLog
        fields = ['id', 'user_name', 'action_type', 'description', 'created_at']

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role 
        return token

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email', 'role']
        read_only_fields = ['username', 'role']

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'full_name', 'email', 'role']

    def create(self, validated_data):
        # Şifreyi şifreleyerek kaydet
        validated_data['password'] = make_password(validated_data['password'])
        user = super().create(validated_data)
        
        # Başarılı kayıt sonrası arka planda E-posta gönderimi
        try:
            subject = 'Kargor Lojistik Sistemine Hoş Geldiniz!'
            message = f"""Merhaba {user.full_name},

Kargor Görev ve Yönetim Platformuna kaydınız başarıyla tamamlanmıştır.

Giriş Bilgileriniz:
E-posta: {user.email}
Rolünüz: {user.role}

Sisteme giriş yaparak size atanan görevleri takip edebilirsiniz.
İyi çalışmalar dileriz."""
            
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [user.email]
            
            # fail_silently=True yapıyoruz ki, mail sunucusunda anlık bir hata olursa kullanıcının kayıt işlemi iptal olmasın.
            send_mail(subject, message, email_from, recipient_list, fail_silently=True)
            
        except Exception as e:
            print(f"E-posta gönderiminde hata oluştu: {e}")

        return user