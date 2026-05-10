from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, Notification

@receiver(post_save, sender=Task)
def create_task_notification(sender, instance, created, **kwargs):
    # Eğer görev yeni oluşturulduysa ve birine atandıysa
    if created and instance.assigned_to:
        Notification.objects.create(
            user=instance.assigned_to,
            title="Yeni Görev Atandı",
            message=f"Size yeni bir görev atandı: [{instance.task_code}] {instance.title}"
        )
    # Eğer görev önceden var ama güncellendiyse (Örn: Durumu Tamamlandı olduysa)
    elif not created and instance.status == 'Tamamlandi':
        # İsteğe bağlı: Görevi bitirene veya projeyi yönetene bildirim atılabilir.
        # Biz şimdilik görevi yapana tebrik / bilgi mesajı atalım:
        if instance.assigned_to:
            Notification.objects.create(
                user=instance.assigned_to,
                title="Görev Tamamlandı",
                message=f"Tebrikler, görevi başarıyla tamamladınız: {instance.title}"
            )