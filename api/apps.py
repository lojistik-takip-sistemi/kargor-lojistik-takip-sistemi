from django.apps import AppConfig

class ApiConfig(AppConfig):
    # Veritabanında otomatik oluşturulacak ID'lerin tipi (Standart Django ayarı)
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api' # Uygulamamızın adı