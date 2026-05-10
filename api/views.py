from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail

from .models import (
    Branch, User, Vehicle, Shipment, TrackingHistory, Trip, 
    Notification, SupportTicket, Project, Task, Invoice, Review, InventoryItem
)
from .serializers import (
    BranchSerializer, UserSerializer, VehicleSerializer, ShipmentSerializer, 
    TrackingHistorySerializer, TripSerializer, NotificationSerializer, 
    SupportTicketSerializer, ProjectSerializer, TaskSerializer, 
    InvoiceSerializer, ReviewSerializer, InventoryItemSerializer
)

# --- İSTATİSTİK (DASHBOARD) VİEW'I ---
class DashboardSummaryView(APIView):
    permission_classes = [AllowAny] # Geliştirme kolaylığı için açık bırakıldı
    
    def get(self, request):
        total_shipments = Shipment.objects.count()
        delivered = Shipment.objects.filter(status='Teslim Edildi').count()
        active_users = User.objects.count()
        
        return Response({
            'total_shipments': total_shipments,
            'delivered_shipments': delivered,
            'total_users': active_users,
            'delivery_rate_percent': round((delivered / total_shipments * 100) if total_shipments > 0 else 0, 2)
        })

# --- ŞİFRE SIFIRLAMA ---
@api_view(['POST'])
@permission_classes([AllowAny])
def request_password_reset(request):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    
    if user:
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        reset_link = f"http://127.0.0.1:8000/api/reset-password-confirm/{uidb64}/{token}/"
        send_mail(
            subject="Sistem - Şifre Sıfırlama Talebi",
            message=f"Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:\n{reset_link}",
            from_email="noreply@sistem.com",
            recipient_list=[user.email]
        )
    return Response({"message": "Eğer bu e-posta adresi sistemde varsa, sıfırlama bağlantısı gönderildi."})

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password_confirm(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    token_generator = PasswordResetTokenGenerator()
    if user is not None and token_generator.check_token(user, token):
        user.set_password(request.data.get('new_password'))
        user.save()
        return Response({"message": "Şifreniz başarıyla güncellendi."})
    return Response({"error": "Geçersiz veya süresi dolmuş bağlantı."}, status=400)

# --- MEVCUT VIEWSET'LER ---
class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer

class TrackingHistoryViewSet(viewsets.ModelViewSet):
    queryset = TrackingHistory.objects.all()
    serializer_class = TrackingHistorySerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    queryset = SupportTicket.objects.all()
    serializer_class = SupportTicketSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'branch']

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'project', 'assigned_to']
    
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer