from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProjectViewSet, TaskViewSet, CommentViewSet, NotificationViewSet, DashboardSummaryView, RegisterView, ActionLogViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet)

# YENİ GÜNCELLENEN SATIR: basename parametresi eklendi
router.register(r'tasks', TaskViewSet, basename='task') 

router.register(r'comments', CommentViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'logs', ActionLogViewSet, basename='actionlogs')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
    path('register/', RegisterView.as_view(), name='auth_register'),
]