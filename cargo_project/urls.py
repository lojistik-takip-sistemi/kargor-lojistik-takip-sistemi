from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from api.views import MyTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # --- FRONTEND SAYFALAR ---
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('dashboard/', TemplateView.as_view(template_name='dashboard.html'), name='dashboard'),
    path('kullanici/', TemplateView.as_view(template_name='kullanici.html'), name='kullanici'),
    path('personel/', TemplateView.as_view(template_name='personel.html'), name='personel'),
    path('register/', TemplateView.as_view(template_name='register.html'), name='register'),
    path('reset-password/', TemplateView.as_view(template_name='reset-password.html'), name='reset-password'),

    # --- API ENDPOINTLER ---
    path('api/', include('api.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Production'da media dosyalarını serve et (Render için)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)