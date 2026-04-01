from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Shipment, TrackingHistory
from .serializers import ShipmentSerializer
import uuid

@api_view(['POST'])
def create_shipment(request):
    """ Yeni bir kargo oluşturur ve otomatik ilk geçmiş kaydını atar. """
    data = request.data
    
    # Sistemin otomatik ve benzersiz bir takip numarası üretmesini sağlıyoruz
    tracking_no = f"TR-{str(uuid.uuid4())[:8].upper()}"
    
    try:
        # Gelen verilerle veritabanında yeni bir kargo kaydı açıyoruz
        shipment = Shipment.objects.create(
            tracking_number=tracking_no,
            sender_id=data['sender_id'],
            receiver_id=data['receiver_id'],
            origin_branch=data['origin_branch'],
            destination_branch=data['destination_branch'],
            current_status="Alındı"
        )
        
        # Kargo oluşturulduğu an "Alındı" statüsüyle ilk hareket geçmişini oluşturuyoruz
        TrackingHistory.objects.create(
            shipment=shipment,
            location=data['origin_branch'],
            status_description="Kargo şubeye teslim alındı."
        )
        
        return Response({"message": "Kargo başarıyla oluşturuldu.", "tracking_number": tracking_no}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_shipment(request, tracking_no):
    """ Takip numarasına göre kargo detaylarını ve geçmişini getirir. """
    try:
        shipment = Shipment.objects.get(tracking_number=tracking_no)
        # Veriyi Serializer'a verip JSON formatına dönüştürüyoruz
        serializer = ShipmentSerializer(shipment)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Shipment.DoesNotExist:
        return Response({"error": "Kargo bulunamadı."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def update_shipment_status(request, tracking_no):
    """ Kargonun durumunu günceller ve tarihçeye yeni satır ekler. """
    try:
        shipment = Shipment.objects.get(tracking_number=tracking_no)
        data = request.data
        
        yeni_durum = data.get('status')
        guncel_konum = data.get('location')
        
        # Ana kargo tablosundaki genel durumu güncelliyoruz
        shipment.current_status = yeni_durum
        shipment.save()
        
        # Yeni durumu log olarak Kargo Hareketleri tablosuna ekliyoruz
        TrackingHistory.objects.create(
            shipment=shipment,
            location=guncel_konum,
            status_description=yeni_durum
        )
        
        return Response({"message": "Durum güncellendi ve geçmişe eklendi."}, status=status.HTTP_200_OK)
    except Shipment.DoesNotExist:
        return Response({"error": "Kargo bulunamadı."}, status=status.HTTP_404_NOT_FOUND)