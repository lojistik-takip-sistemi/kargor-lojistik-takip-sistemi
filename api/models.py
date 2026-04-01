from django.db import models

class User(models.Model):
    # Sadece Müşteri ve Personel rolleri seçilebilsin diye kısıtlama ekliyoruz
    ROLE_CHOICES = (('Musteri', 'Müşteri'), ('Personel', 'Personel'))
    
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Users' # SQL tarafındaki tablo ismini net belirtiyoruz

class Shipment(models.Model):
    tracking_number = models.CharField(max_length=50, unique=True)
    # Gönderici ve Alıcıyı Users tablosuna Foreign Key ile bağlıyoruz
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_shipments')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_shipments')
    origin_branch = models.CharField(max_length=100)
    destination_branch = models.CharField(max_length=100)
    current_status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Shipments'

class TrackingHistory(models.Model):
    # Her kargo hareketi, bir kargoya ait olmak zorundadır (Shipments tablosuna bağlantı)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='history')
    action_date = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=150)
    status_description = models.CharField(max_length=255)

    class Meta:
        db_table = 'TrackingHistory'