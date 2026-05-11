from django.shortcuts import render
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Count, Q

from .models import User, Task, Project, Notification, Comment, ActionLog
from .serializers import (
    UserSerializer, 
    TaskSerializer, 
    ProjectSerializer, 
    NotificationSerializer, 
    CommentSerializer, 
    ActionLogSerializer,
    MyTokenObtainPairSerializer
)

# --- KİMLİK DOĞRULAMA ---

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

# YENİ EKLENEN: E-posta göndermeden direkt şifre güncelleyen görünüm
class DirectPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')

        if not email or not new_password:
            return Response({"error": "E-posta ve yeni şifre gereklidir."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            return Response({"message": "Şifreniz başarıyla güncellendi. Şimdi yeni şifrenizle giriş yapabilirsiniz."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Bu e-posta adresine ait bir kullanıcı bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# --- GÖREV / KARGO YÖNETİMİ ---

class TaskListView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.none()

        if user.role == 'Admin' or user.is_staff or user.is_superuser:
            queryset = Task.objects.all().order_by('-created_at')
        elif user.role == 'Kullanici':
            queryset = Task.objects.filter(customer=user).order_by('-created_at')
        elif user.role == 'Personel':
            queryset = Task.objects.filter(assigned_to=user).exclude(status='Onay_Bekliyor').order_by('-created_at')
        
        # Eğer query params'da 'status' varsa ona göre filtrele
        status_param = self.request.query_params.get('status', None)
        if status_param is not None:
            queryset = queryset.filter(status=status_param)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'Kullanici':
            serializer.save(customer=user, status='Onay_Bekliyor')
        else:
            serializer.save()

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- KULLANICI / KURYE / MÜŞTERİ YÖNETİMİ ---

class UserManagementView(generics.ListAPIView):
    """Sistemdeki tüm kullanıcıları (Personel, Yönetici, Kullanıcı) listeler"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Kurye veya Müşteri silme/güncelleme işlemini yapan sınıftır.
    Hata aldığın eksik kısım burasıydı.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- SOSYAL VE SİSTEM ÖZELLİKLERİ ---

class CommentListView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        task_id = self.request.query_params.get('task_id')
        if task_id:
            return Comment.objects.filter(task_id=task_id).order_by('-created_at')
        return Comment.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class SystemLogsView(generics.ListAPIView):
    queryset = ActionLog.objects.all().order_by('-created_at')
    serializer_class = ActionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- DASHBOARD VE İSTATİSTİKLER ---

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Genel Sayılar
        total_projects = Project.objects.count()
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='Tamamlandi').count()
        todo_tasks = Task.objects.filter(status='Yapilacak').count()
        ongoing_tasks = Task.objects.filter(status='Devam_Ediyor').count()

        # Performans (En çok teslimat yapan personeller)
        performance = User.objects.filter(role='Personel').annotate(
            completed_count=Count('assigned_tasks', filter=Q(assigned_tasks__status='Tamamlandi'))
        ).order_by('-completed_count')[:5]

        performance_data = [
            {"username": p.username, "completed_count": p.completed_count} 
            for p in performance
        ]

        return Response({
            "total_projects": total_projects,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "todo_tasks": todo_tasks,
            "ongoing_tasks": ongoing_tasks,
            "performance": performance_data
        })