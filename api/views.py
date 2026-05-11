from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Project, Task, Notification, Comment, ActionLog
from .serializers import (
    TaskSerializer, 
    UserProfileSerializer, 
    UserCreateSerializer,
    MyTokenObtainPairSerializer
)

User = get_user_model()

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class TaskListView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        
        # Eğer giriş yapmamış birisi erişmeye çalışırsa boş döner
        if user.is_anonymous:
            return Task.objects.none()

        # TEST İÇİN: Şimdilik tüm rollere her şeyi gösterelim. 
        # Verilerin geldiğini gördükten sonra kısıtlamayı tekrar ekleriz.
        return Task.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        # Müşteri kargo oluştururken sistemin hata vermemesi için
        user = self.request.user
        if user.role == 'Kullanici':
            serializer.save(customer=user, status='Onay_Bekliyor')
        else:
            serializer.save()

    def perform_create(self, serializer):
        user = self.request.user
        # Eğer kullanıcı 'Kullanici' rolündeyse kargoyu 'Onay Bekliyor' olarak kaydet
        if user.role == 'Kullanici':
            serializer.save(customer=user, status='Onay_Bekliyor')
        else:
            # Yönetici oluşturuyorsa doğrudan 'Yapilacak' olarak kaydet
            serializer.save(status='Yapilacak')

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.filter(is_active=True)
    serializer_class = TaskSerializer

class DashboardSummaryView(APIView):
    def get(self, request):
        try:
            total_projects = Project.objects.count()
            total_tasks = Task.objects.filter(is_active=True).count()
            
            status_counts = Task.objects.filter(is_active=True).values('status').annotate(total=Count('status'))
            stats = {item['status']: item['total'] for item in status_counts}

            all_users = User.objects.all()
            performance_list = []
            
            for u in all_users:
                c_count = Task.objects.filter(assigned_to=u, status='Tamamlandi', is_active=True).count()
                t_count = Task.objects.filter(assigned_to=u, is_active=True).count()
                
                performance_list.append({
                    "username": u.username,
                    "completed_count": c_count,
                    "total_assigned": t_count
                })

            performance_list = sorted(performance_list, key=lambda x: x['completed_count'], reverse=True)[:5]

            return Response({
                "total_projects": total_projects,
                "total_tasks": total_tasks,
                "completed_tasks": stats.get('Tamamlandi', 0),
                "ongoing_tasks": stats.get('Devam_Ediyor', 0),
                "todo_tasks": stats.get('Yapilacak', 0),
                "performance": performance_list
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ProfileView(APIView):
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class NotificationListView(APIView):
    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).order_by('-created_at')[:10]
        data = [{
            "id": n.id,
            "message": n.message, 
            "is_read": n.is_read, 
            "created_at": n.created_at
        } for n in notifs]
        return Response(data)

class CommentListView(APIView):
    def get(self, request, task_id):
        comments = Comment.objects.filter(task_id=task_id).order_by('-created_at')
        data = [{
            "user": c.user.username, 
            "text": getattr(c, 'content', ''), 
            "created_at": c.created_at
        } for c in comments]
        return Response(data)
    
class UserManagementView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = UserCreateSerializer

class SystemLogsView(APIView):
    def get(self, request):
        logs = [
            {"action": "Sistem başarıyla başlatıldı.", "time": "Az önce"},
            {"action": "Yeni personel kayıtları güncellendi.", "time": "1 saat önce"},
            {"action": "Görev dağılım algoritmaları aktif.", "time": "Bugün"}
        ]
        return Response(logs)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny] # Herkesin kayıt olabilmesine izin verir
    serializer_class = UserCreateSerializer