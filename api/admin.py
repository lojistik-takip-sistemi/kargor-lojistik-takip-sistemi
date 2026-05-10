from django.contrib import admin
from .models import (
    Branch, User, Vehicle, Shipment, TrackingHistory, Trip, 
    Notification, SupportTicket, Project, Task, Invoice, Review, InventoryItem
)

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('branch_code', 'name', 'city', 'district')
    search_fields = ('name', 'branch_code', 'city')

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'full_name', 'email', 'role', 'branch', 'date_joined') 
    list_filter = ('role', 'branch')
    search_fields = ('username', 'full_name', 'email')

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('plate_number', 'vehicle_type', 'capacity_kg', 'is_available')
    list_filter = ('is_available', 'vehicle_type')
    search_fields = ('plate_number',)

# --- DÜZELTİLEN KISIM: Shipment modelindeki güncel alanlara göre (receiver_name, status vb.) ---
@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'sender', 'receiver_name', 'status', 'departure_branch')
    list_filter = ('status', 'departure_branch')
    search_fields = ('tracking_number', 'receiver_name')

@admin.register(TrackingHistory)
class TrackingHistoryAdmin(admin.ModelAdmin):
    list_display = ('shipment', 'branch', 'status_description', 'action_date')
    list_filter = ('action_date',)
    search_fields = ('shipment__tracking_number',)

@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ('trip_number', 'origin_branch', 'destination_branch', 'vehicle')
    search_fields = ('trip_number',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('is_read', 'notification_type')
    search_fields = ('title', 'user__full_name')

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'subject', 'customer', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('ticket_number', 'subject', 'customer__full_name')

# GÖREV VE YÖNETİM PLATFORMU MODÜLLERİ
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'status', 'created_at')
    list_filter = ('status', 'branch')
    search_fields = ('name',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assigned_to', 'status', 'due_date')
    list_filter = ('status', 'project')
    search_fields = ('title', 'assigned_to__full_name')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('shipment', 'total_amount', 'is_paid', 'created_at')
    list_filter = ('is_paid',)
    search_fields = ('shipment__tracking_number',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('shipment', 'customer', 'courier', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('shipment__tracking_number', 'customer__full_name', 'courier__full_name')

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'branch', 'quantity', 'unit', 'last_updated')
    list_filter = ('branch',)
    search_fields = ('name',)