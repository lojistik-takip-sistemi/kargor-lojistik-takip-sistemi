import os
from pathlib import Path
from dotenv import load_dotenv

# .env dosyasını sisteme yükle
load_dotenv()

# Proje ana dizini
BASE_DIR = Path(__file__).resolve().parent.parent

# Güvenlik Anahtarı ve Debug modunu .env dosyasından çekiyoruz
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG') == 'True'

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
    'rest_framework_simplejwt',
    'django_filters',
    'api',
    'corsheaders',
]

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

# Yeni Kimlik Doğrulama Modelimiz (User tablosu değişti)
AUTH_USER_MODEL = 'api.User'

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

# CORS Ayarları (Sadece belirlediğimiz frontend adreslerine izin veriyoruz)
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5500",  # Live Server kullanıyorsan varsayılan adres
    "http://localhost:5500",
]