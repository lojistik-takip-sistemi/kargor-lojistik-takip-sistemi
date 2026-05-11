from django.urls import path
from rest_framework import generics
from rest_framework_simplejwt.views import TokenRefreshView

from api.models import Project
from api.serializers import ProjectSerializer
from .views import (
    MyTokenObtainPairView,
    TaskListView, 
    TaskDetailView, 
    DashboardSummaryView, 
    ProfileView,
    NotificationListView,
    CommentListView,
    UserManagementView,
    SystemLogsView,
    RegisterView
)

urlpatterns = [
    # Kimlik Doğrulama ve Kayıt
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'), # EKLENEN SATIR

    # Görevler ve Projeler
    path('tasks/', TaskListView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('tasks/<int:task_id>/comments/', CommentListView.as_view(), name='task-comments'),
    path('projects/', generics.ListAPIView.as_view(queryset=Project.objects.all(), serializer_class=ProjectSerializer), name='project-list'),

    # Panel, Profil ve Sistem
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('users/', UserManagementView.as_view(), name='user-management'),
    path('logs/', SystemLogsView.as_view(), name='system-logs'),
]