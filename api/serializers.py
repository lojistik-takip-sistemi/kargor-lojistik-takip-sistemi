from rest_framework import serializers
from .models import Shipment, TrackingHistory

class TrackingHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingHistory
        # İstemciye sadece bu alanları JSON olarak döndüreceğiz
        fields = ['action_date', 'location', 'status_description']

class ShipmentSerializer(serializers.ModelSerializer):
    # Kargonun kendi bilgilerini çekerken, ona ait tüm geçmiş hareketleri de alt liste olarak ekliyoruz
    history = TrackingHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Shipment
        fields = [
            'tracking_number', 'sender', 'receiver', 
            'origin_branch', 'destination_branch', 
            'current_status', 'created_at', 'history'
        ]