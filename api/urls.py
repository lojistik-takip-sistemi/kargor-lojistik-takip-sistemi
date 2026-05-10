from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserViewSet, 
    ProjectViewSet, 
    TaskViewSet, 
    CommentViewSet, 
    NotificationViewSet, 
    DashboardSummaryView, 
    RegisterView, 
    ActionLogViewSet,
    MyTokenObtainPairView # Yeni eklediğimiz özel token görünümü
)

# Router (ViewSet'ler için otomatik URL'ler)
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'logs', ActionLogViewSet, basename='actionlogs')

# URL Patterns
urlpatterns = [
    # Router üzerinden gelen ViewSet URL'leri (tasks, projects vb.)
    path('', include(router.urls)),

    # Kimlik Doğrulama (Auth) URL'leri
    # Aşağıdaki 'token/' satırı artık bizim özel 'role' bilgisini içeren view'ımızı kullanıyor
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),

    # İstatistikler ve Özet Veriler
    path('dashboard/summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
]