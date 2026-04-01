# INSTALLED_APPS listesine rest_framework ve kendi app'imizi (api) ekliyoruz.
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework', # Eklenen: API yazmak için gerekli kütüphane
    'api',            # Eklenen: Kendi oluşturduğumuz uygulama
]

# DATABASES sözlüğünü tamamen silip yerine SQL Server (MSSQL) ayarlarını yapıştır.
DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': 'KargoDB', # SQL Server'da oluşturduğun veritabanının adı
        'HOST': 'localhost\\SQLEXPRESS', # Kendi SQL Server adınla değiştir (Örn: DESKTOP-XYZ\SQLEXPRESS)
        'USER': '', 
        'PASSWORD': '', 
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
            'extra_params': 'Trusted_Connection=yes;' # Windows Authentication ile bağlanmak için
        },
    }
}