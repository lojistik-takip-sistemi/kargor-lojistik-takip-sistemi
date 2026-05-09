from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # Django Admin Paneli
    path('admin/', admin.site.urls),

    # API Rotaları (Az önce hazırladığımız api/urls.py dosyasını dahil ediyoruz)
    path('api/', include('api.urls')),

    # JWT Token İşlemleri (Giriş yapmak için)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]