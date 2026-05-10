from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, SupportTicket, Notification, Shipment, TrackingHistory

# 1. KARGO (Shipment) TETİKLEYİCİSİ
# Kargo oluşturulduğunda otomatik olarak "TrackingHistory" (Takip Geçmişi) oluşturur.
@receiver(post_save, sender=Shipment)
def manage_shipment_tracking(sender, instance, created, **kwargs):
    if created:
        # Yeni bir kargo oluşturulduğunda ilk hareket kaydını otomatik ekle
        TrackingHistory.objects.create(
            shipment=instance,
            status=instance.status,
            location=instance.departure_branch.name if instance.departure_branch else "Merkez Şube",
            description="Kargo kaydı oluşturuldu, gönderim süreci başlatıldı."
        )

# 2. GÖREV (Task) TETİKLEYİCİSİ
# Görev durumu "Tamamlandi" olarak güncellendiğinde atanan kişiye bildirim gönderir.
@receiver(post_save, sender=Task)
def task_status_changed(sender, instance, created, **kwargs):
    # Eğer görev güncelleniyorsa ve durumu 'Tamamlandi' olduysa
    if not created and instance.status == 'Tamamlandi':
        if instance.assigned_to:
            Notification.objects.create(
                user=instance.assigned_to,
                title="Görev Başarıyla Tamamlandı!",
                message=f"Tebrikler! '{instance.project.name}' projesindeki '{instance.title}' görevi tamamlandı olarak işaretlendi.",
                notification_type='PUSH'
            )

# 3. DESTEK TALEBİ (SupportTicket) TETİKLEYİCİSİ
# Yeni bir destek talebi açıldığında müşteriye onay bildirimi gönderir.
@receiver(post_save, sender=SupportTicket)
def new_support_ticket_created(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.customer,
            title="Destek Talebiniz Alındı",
            message=f"{instance.ticket_number} referans numaralı talebiniz sistemimize işlenmiştir. Ekibimiz inceliyor.",
            notification_type='EMAIL'
        )