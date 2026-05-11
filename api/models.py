from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Yonetici', 'Yönetici'), 
        ('Personel', 'Personel')
    )
    full_name = models.CharField(max_length=100) 
    phone = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Personel')

    class Meta:
        db_table = 'Users'

    def __str__(self):
        return f"{self.full_name} ({self.role})"

class Project(models.Model):
    STATUS_CHOICES = (('Planlaniyor', 'Planlanıyor'), ('Devam_Ediyor', 'Devam Ediyor'), ('Tamamlandi', 'Tamamlandı'))
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planlaniyor')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Projects'

    def __str__(self):
        return self.name

class Task(models.Model):
    STATUS_CHOICES = (('Yapilacak', 'Yapılacak'), ('Devam_Ediyor', 'Devam Ediyor'), ('Tamamlandi', 'Tamamlandı'))
    PRIORITY_CHOICES = (('Dusuk', 'Düşük'), ('Normal', 'Normal'), ('Acil', 'Acil'))
    
    # Çakışmayı önlemek için UUID kullanımı
    task_code = models.CharField(max_length=50, unique=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Yapilacak')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Normal')
    
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # YENİ EKLENEN SATIR: Aktif/Pasif Kontrolü
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'Tasks'
        ordering = ['-created_at'] # Sıralama uyarısını çözmek için daha önce eklemiştik

    def save(self, *args, **kwargs):
        if not self.task_code:
            self.task_code = f"TSK-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.task_code}] {self.title}"

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Comments'

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Notifications'
        # YENİ EKLENEN SINIF: İşlem Logları
class ActionLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action_type = models.CharField(max_length=50) # Örn: "CREATE", "UPDATE", "DELETE", "DEACTIVATE"
    description = models.TextField() # Örn: "TSK-1234 kodlu görev silindi."
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ActionLogs'
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.action_type}] {self.user.username if self.user else 'Sistem'} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
    
@receiver(post_save, sender=Task)
def create_task_notification(sender, instance, created, **kwargs):
    if created and instance.assigned_to:
        Notification.objects.create(
            user=instance.assigned_to,
            title="Yeni Görev Ataması",  # Eksik olan title eklendi
            message=f"Yeni bir görev size atandı: {instance.title}"
            # Hata veren notification_type satırı kaldırıldı
        )

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance, created, **kwargs):
    if created:
        # Görevi atayan kişiye veya görevdeki sorumluya bildirim gitsin
        task = instance.task
        if task.assigned_to and task.assigned_to != instance.user:
            Notification.objects.create(
                user=task.assigned_to,
                title="Yeni Yorum",  # Eksik olan title eklendi
                message=f"'{task.title}' görevine yeni bir yorum yapıldı."
                # Hata veren notification_type satırı kaldırıldı
            )