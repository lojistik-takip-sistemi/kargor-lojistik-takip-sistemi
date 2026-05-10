from django.urls import path
from .views import (
    TaskListView, 
    TaskDetailView, 
    DashboardSummaryView, 
    ProfileView,
    NotificationListView,
    CommentListView,
    UserManagementView
)

urlpatterns = [
    path('tasks/', TaskListView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('tasks/<int:task_id>/comments/', CommentListView.as_view(), name='task-comments'),
    path('users/', UserManagementView.as_view(), name='user-management'),
]