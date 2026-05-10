from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
import qrcode
from io import BytesIO
from django.core.files import File
import random
import string

# 1. ŞUBE (Branch) MODELİ
class Branch(models.Model):
    branch_code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    address = models.TextField()

    class Meta:
        db_table = 'Branches'

    def __str__(self):
        return self.name

# 2. KULLANICI (User) MODELİ
class User(AbstractUser):
    ROLE_CHOICES = (
        ('Musteri', 'Müşteri'), 
        ('Kurye', 'Kurye'), 
        ('Personel', 'Şube Çalışanı')
    )
    # Django'nun AbstractUser sınıfında username, password, email zaten olduğu için 
    # projenin diğer yerleri (admin vb.) bozulmasın diye full_name eklendi.
    full_name = models.CharField(max_length=100) 
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Musteri')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')

    class Meta:
        db_table = 'Users'

    def __str__(self):
        return f"{self.username} ({self.role})"

# 3. ARAÇ (Vehicle) MODELİ
class Vehicle(models.Model):
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=50)
    capacity_kg = models.FloatField()
    is_available = models.BooleanField(default=True)
    assigned_courier = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_vehicle', limit_choices_to={'role': 'Kurye'})

    class Meta:
        db_table = 'Vehicles'

    def __str__(self):
        return self.plate_number

class Shipment(models.Model):
    # Senin mevcut alanların muhtemelen şunlardı, kendi alanlarınla birleştirebilirsin
    tracking_number = models.CharField(max_length=50, unique=True, blank=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_shipments', null=True)
    receiver_name = models.CharField(max_length=255)
    departure_branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, related_name='departures')
    status = models.CharField(max_length=50, default='Hazırlanıyor')
    
    # Yeni eklenen QR Code alanı
    qr_code = models.ImageField(upload_to='qr_codes/', blank=True, null=True)

    def save(self, *args, **kwargs):
        # 1. Otomatik Takip Numarası Üretme (Eğer boşsa)
        if not self.tracking_number:
            random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            self.tracking_number = f"KRG-2026-{random_str}"
        
        # 2. QR Kod Üretimi (Sadece ilk kaydedildiğinde)
        if not self.qr_code:
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            # QR kod okutulunca API'deki takip adresine gider
            qr.add_data(f"http://127.0.0.1:8000/api/shipments/?tracking_number={self.tracking_number}")
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            self.qr_code.save(f'qr_{self.tracking_number}.png', File(buffer), save=False)
            
        super().save(*args, **kwargs)

# 5. KARGO HAREKETLERİ (TrackingHistory)
class TrackingHistory(models.Model):
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='history')
    action_date = models.DateTimeField(auto_now_add=True)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    status_description = models.CharField(max_length=255)

    class Meta:
        db_table = 'TrackingHistory'

# 6. SEFER (Trip) MODELİ
class Trip(models.Model):
    trip_number = models.CharField(max_length=50, unique=True)
    origin_branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='departing_trips')
    destination_branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='arriving_trips')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    shipments = models.ManyToManyField(Shipment, related_name='trips') 
    departure_time = models.DateTimeField(null=True, blank=True)
    arrival_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Trips'

# 7. BİLDİRİM (Notification)
class Notification(models.Model):
    NOTIFICATION_TYPES = (('SMS', 'SMS'), ('EMAIL', 'E-Posta'), ('PUSH', 'Push'))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Notifications'

# 8. DESTEK TALEBİ (SupportTicket)
class SupportTicket(models.Model):
    STATUS_CHOICES = (('Acik', 'Açık'), ('Cozuldu', 'Çözüldü'), ('Iptal', 'İptal'))
    ticket_number = models.CharField(max_length=50, unique=True, blank=True)
    shipment = models.ForeignKey(Shipment, on_delete=models.CASCADE, related_name='support_tickets')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets', limit_choices_to={'role': 'Musteri'})
    subject = models.CharField(max_length=150)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Acik')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'SupportTickets'

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f"TICKET-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

# 9. PROJE (Project)
class Project(models.Model):
    STATUS_CHOICES = (('Planlaniyor', 'Planlanıyor'), ('Devam_Ediyor', 'Devam Ediyor'), ('Tamamlandi', 'Tamamlandı'))
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planlaniyor')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Projects'

# 10. GÖREV (Task)
class Task(models.Model):
    STATUS_CHOICES = (('Yapilacak', 'Yapılacak'), ('Devam_Ediyor', 'Devam Ediyor'), ('Tamamlandi', 'Tamamlandı'))
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Yapilacak')
    due_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'Tasks'

# 11. FATURA (Invoice)
class Invoice(models.Model):
    shipment = models.OneToOneField(Shipment, on_delete=models.CASCADE, related_name='invoice')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.FloatField(default=20.0)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Invoices'

# 12. DEĞERLENDİRME (Review)
class Review(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given', limit_choices_to={'role': 'Musteri'})
    courier = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received', limit_choices_to={'role': 'Kurye'})
    shipment = models.OneToOneField(Shipment, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Reviews'

# 13. ENVANTER (InventoryItem)
class InventoryItem(models.Model):
    name = models.CharField(max_length=100)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='inventory')
    quantity = models.IntegerField(default=0)
    unit = models.CharField(max_length=20, default='Adet')
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'InventoryItems'