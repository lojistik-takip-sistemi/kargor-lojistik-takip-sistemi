import os
from pathlib import Path

# Proje ana dizini
BASE_DIR = Path(__file__).resolve().parent.parent

# Güvenlik Anahtarı
SECRET_KEY = 'django-insecure-kargo-projesi-anahtari'

# Geliştirme modu açık
DEBUG = True

ALLOWED_HOSTS = ['*']

# Uygulamalar
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',  # JWT Güvenliği için ekledik
    'django_filters',            # Arama ve Filtreleme için ekledik
    'api',
    'corsheaders',
]

# Eksik olan Ara Katmanlar (Middleware) eklendi
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'cargo_project.urls'

# Eksik olan Template ayarları eklendi
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

# Senin SQL Server Veritabanı Ayarların
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

# REST FRAMEWORK: JWT GÜVENLİĞİ VE FİLTRELEME AYARLARI
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

CORS_ALLOW_ALL_ORIGINS = True