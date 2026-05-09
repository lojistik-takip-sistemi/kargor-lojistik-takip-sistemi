from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BranchViewSet, UserViewSet, VehicleViewSet, ShipmentViewSet, 
    TrackingHistoryViewSet, TripViewSet, NotificationViewSet, 
    SupportTicketViewSet, ProjectViewSet, TaskViewSet, 
    InvoiceViewSet, ReviewViewSet, InventoryItemViewSet
)

# Router oluşturuyoruz
router = DefaultRouter()

# Tabloları router'a kaydediyoruz
router.register(r'branches', BranchViewSet)
router.register(r'users', UserViewSet)
router.register(r'vehicles', VehicleViewSet)
router.register(r'shipments', ShipmentViewSet)
router.register(r'tracking-history', TrackingHistoryViewSet)
router.register(r'trips', TripViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'support-tickets', SupportTicketViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'inventory-items', InventoryItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]