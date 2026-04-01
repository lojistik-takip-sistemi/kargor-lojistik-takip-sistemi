from django.urls import path
from . import views

urlpatterns = [
    # Gelen istekleri views.py içindeki ilgili fonksiyonlara bağlıyoruz
    path('shipments', views.create_shipment),
    path('shipments/<str:tracking_no>', views.get_shipment),
    path('shipments/<str:tracking_no>/status', views.update_shipment_status),
]