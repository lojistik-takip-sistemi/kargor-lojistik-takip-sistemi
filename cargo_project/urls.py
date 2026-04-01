from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # /api/ ile başlayan tüm istekleri 'api' uygulamamızın içindeki urls.py dosyasına havale ediyoruz.
    path('api/', include('api.urls')), 
]