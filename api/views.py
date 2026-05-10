from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User, Project, Task, Comment, Notification
from .serializers import UserSerializer, ProjectSerializer, TaskSerializer, CommentSerializer, NotificationSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny # AllowAny eklendi
from rest_framework import generics # generics eklendi
from .models import Task, Project, Comment, Notification, ActionLog # ActionLog eklendi
from .serializers import TaskSerializer, ProjectSerializer, CommentSerializer, NotificationSerializer, ActionLogSerializer # ActionLogSerializer eklendi
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total_projects = Project.objects.count()
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='Tamamlandi').count()
        
        return Response({
            'total_projects': total_projects,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'completion_rate': round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 2)
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    
    def get_queryset(self):
        # 1. KONTROL: Sadece 'is_active=True' olan yani silinmemiş aktif görevleri listele
        return Task.objects.filter(is_active=True)

    def perform_create(self, serializer):
        # Görev eklendiğinde log tut
        task = serializer.save()
        ActionLog.objects.create(
            user=self.request.user,
            action_type="CREATE",
            description=f"[{task.task_code}] kodlu görev sisteme eklendi."
        )

    def perform_update(self, serializer):
        # Görev güncellendiğinde log tut
        task = serializer.save()
        ActionLog.objects.create(
            user=self.request.user,
            action_type="UPDATE",
            description=f"[{task.task_code}] kodlu görevin durumu '{task.status}' olarak güncellendi."
        )

    def perform_destroy(self, instance):
        # 2. KONTROL: Görevi veritabanından kalıcı SİLME! Sadece pasife çek (Soft Delete)
        instance.is_active = False
        instance.save()
        
        # Silme (Pasife alma) işlemini logla
        ActionLog.objects.create(
            user=self.request.user,
            action_type="DELETE",
            description=f"[{instance.task_code}] kodlu görev silindi (pasife alındı)."
        )
class ActionLogViewSet(viewsets.ReadOnlyModelViewSet):
    # Sadece son 50 logu getir ki sistem yorulmasın
    queryset = ActionLog.objects.all()[:50]
    serializer_class = ActionLogSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        # Yorumu kaydeden kullanıcıyı o anki giriş yapmış kullanıcı yap
        serializer.save(user=self.request.user)

    def get_queryset(self):
        # Sadece ilgili göreve ait yorumları getirmek için (opsiyonel)
        task_id = self.request.query_params.get('task_id')
        if task_id:
            return Comment.objects.filter(task_id=task_id)
        return Comment.objects.all()

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

# Yeni kayıt olanlar için token istemeyen özel uç nokta
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) # Burası önemli: Herkese açık!
    serializer_class = UserSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer