import os
from pathlib import Path
from dotenv import load_dotenv

# .env dosyasını sisteme yükle
load_dotenv()

# Proje ana dizini
BASE_DIR = Path(__file__).resolve().parent.parent

# Güvenlik Ayarları (.env dosyasından çekilir)
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG') == 'True'

# Geliştirme aşamasında her türlü bağlantıya izin ver
ALLOWED_HOSTS = ['*']

# Uygulamalar
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Üçüncü taraf paketler
    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',
    'corsheaders',
    # Senin uygulaman
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS her zaman en üstlerde olmalı
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cargo_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'cargo_project.wsgi.application'

# Yeni Kimlik Doğrulama Modeli (User tablosu özelleştirildiği için)
AUTH_USER_MODEL = 'api.User'

# --- ÖNEMLİ: POST VERİ KAYBI VE 405 HATASI İÇİN ---
# Django'nun otomatik olarak adresin sonuna '/' ekleyip yönlendirme yapmasını engeller.
# Bu sayede POST isteklerindeki veriler yönlendirme sırasında kaybolmaz.
APPEND_SLASH = False

# SQL Server Veritabanı Ayarları (Trusted_Connection ile yerel bağlanma)
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'KargoDB',
        'HOST': '(localdb)\\MSSQLLocalDB',
        'USER': '',
        'PASSWORD': '',
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'extra_params': 'Trusted_Connection=yes;'
        },
    }
}

# Dil ve Saat Ayarları
LANGUAGE_CODE = 'tr-tr'
TIME_ZONE = 'Europe/Istanbul'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.AutoField'

# REST FRAMEWORK: JWT GÜVENLİĞİ VE FİLTRELEME
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

# --- CORS AYARLARI ---
# Frontend ve Backend arasındaki iletişimi sağlar.
CORS_ALLOW_ALL_ORIGINS = True 
CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]
# --- MAİL VE SAYFALAMA AYARLARI ---
# E-postaları VS Code terminalinde görüntülemek için
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Global sayfalama (Kargo verileri çoğalınca sistemin çökmemesi için)
REST_FRAMEWORK['DEFAULT_PAGINATION_CLASS'] = 'rest_framework.pagination.PageNumberPagination'
REST_FRAMEWORK['PAGE_SIZE'] = 20
# --- EKLENEN PROFESYONEL BACKEND AYARLARI ---

# 1. DRF ve JWT Ayarları
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# 2. Şifre Sıfırlama Mailleri VS Code Terminaline Düşsün
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# 3. QR Kodlar için Medya Ayarları
import os
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')