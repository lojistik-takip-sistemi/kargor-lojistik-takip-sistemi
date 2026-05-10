import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

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

# --- REST FRAMEWORK: JWT GÜVENLİĞİ, FİLTRELEME VE BRUTE FORCE KORUMASI ---
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
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    # BRUTE FORCE KORUMASI (Throttling)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',  # Şifre deneme yanılmalarına karşı
        'rest_framework.throttling.UserRateThrottle'   # Oturumu açık hesap sömürülerine karşı
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '5/minute',  # Kimliksiz istekler dakikada maksimum 5 kez yapılabilir
        'user': '100/minute' # Normal personel dakikada maksimum 100 işlem yapabilir
    }
}

# --- JWT SÜRE VE HEADER AYARLARI ---
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# --- CORS AYARLARI (GÜVENLİK İÇİN SIKILAŞTIRILDI) ---
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://127.0.0.1:5500",
    "null"  # Frontend dosyaları yerel dizinden çift tıklayarak açılıyorsa buna ihtiyaç vardır
]

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

# E-postaları VS Code terminalinde görüntülemek için
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# QR Kodlar ve Dosyalar için Medya Ayarları
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')