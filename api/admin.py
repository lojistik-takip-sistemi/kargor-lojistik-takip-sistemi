from django.contrib import admin
from .models import User, Shipment, TrackingHistory

# Admin panelinde tabloların daha düzenli ve filtrelenebilir görünmesi için ayarlar

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'role', 'created_at') # Ekranda görünecek kolonlar
    list_filter = ('role',) # Sağ tarafa role göre filtreleme menüsü ekler
    search_fields = ('full_name', 'email') # Arama çubuğu ekler

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'sender', 'receiver', 'current_status', 'created_at')
    list_filter = ('current_status', 'origin_branch', 'destination_branch')
    search_fields = ('tracking_number',)

@admin.register(TrackingHistory)
class TrackingHistoryAdmin(admin.ModelAdmin):
    list_display = ('shipment', 'location', 'status_description', 'action_date')
    search_fields = ('shipment__tracking_number', 'location')