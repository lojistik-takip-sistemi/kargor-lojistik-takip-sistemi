from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, SupportTicket, Notification

# 1. GÖREV (Task) TETİKLEYİCİSİ
@receiver(post_save, sender=Task)
def task_status_changed(sender, instance, created, **kwargs):
    # Eğer görev yeni oluşturulmadıysa (yani güncelleniyorsa) ve durumu 'Tamamlandi' olduysa
    if not created and instance.status == 'Tamamlandi':
        # Görev kime atandıysa ona bir tebrik/bilgi bildirimi atalım
        if instance.assigned_to:
            Notification.objects.create(
                user=instance.assigned_to,
                title="Görev Başarıyla Tamamlandı!",
                message=f"Tebrikler! '{instance.project.name}' projesindeki '{instance.title}' görevi tamamlandı olarak işaretlendi.",
                notification_type='PUSH'
            )

# 2. DESTEK TALEBİ (SupportTicket) TETİKLEYİCİSİ
@receiver(post_save, sender=SupportTicket)
def new_support_ticket_created(sender, instance, created, **kwargs):
    # Eğer bu kayıt veritabanına İLK KEZ ekleniyorsa (created = True)
    if created:
        Notification.objects.create(
            user=instance.customer,
            title="Destek Talebiniz Alındı",
            message=f"{instance.ticket_number} referans numaralı talebiniz sistemimize işlenmiştir. Ekibimiz inceliyor.",
            notification_type='EMAIL'
        )