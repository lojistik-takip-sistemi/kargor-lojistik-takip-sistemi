from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
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
    filterset_fields = ['status', 'branch'] # Duruma ve Şubeye göre filtrele

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'project', 'assigned_to'] # Durum, Öncelik ve Personele göre filtrele
    
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer