Kargor Lojistik ve Kargo Takip Sistemi
Kargor Lojistik Takip Sistemi, kargo süreçlerinin, personel görevlerinin ve lojistik operasyonların uçtan uca yönetilmesini sağlayan kapsamlı bir otomasyon projesidir. Sistem; müşterilerin kargo taleplerini iletmesini, kuryelerin görevlerini takip etmesini ve yöneticilerin tüm süreci denetlemesini sağlar.

🚀 Özellikler
Rol Bazlı Kullanıcı Yönetimi: Sistemde 3 temel kullanıcı rolü bulunur:

Yönetici: Tüm süreçleri, projeleri ve kullanıcıları yönetir.

Personel (Kurye): Kendisine atanan kargo/teslimat görevlerini üstlenir ve durumlarını günceller.

Kullanıcı (Müşteri): Dışarıdan kayıt olan varsayılan roldür. Gönderi talebinde bulunur ve kargolarını takip eder.

Akıllı Kargo ve Görev Yönetimi: * Her kargo/görev için otomatik olarak benzersiz bir takip kodu (KRG-XXXXXXXX) üretilir.

Gönderinin çıkış yeri (Nereden) ve varış yeri (Nereye) detaylıca kayıt altına alınır.

Durum takibi ("Onay Bekliyor", "Yapılacak", "Devam Ediyor", "Tamamlandı") ve öncelik ataması ("Düşük", "Normal", "Acil") yapılabilir.

Otomatik Bildirim Sistemi: Görev atamaları yapıldığında veya kargo görevlerine yeni yorumlar eklendiğinde ilgili kullanıcılara anlık bildirimler düşer.

İşlem Günlükleri (Action Log): Sistem üzerindeki tüm "Oluşturma", "Güncelleme" ve "Silme" işlemleri güvenlik ve takip amacıyla loglanır.

Proje Yönetimi: Kapsamlı lojistik işlemleri projeler altında gruplandırılabilir ve planlama aşamaları takip edilebilir.

🛠 Kullanılan Teknolojiler
Backend: Python 3, Django 6.0.4, Django REST Framework

Veritabanı: PostgreSQL (psycopg2-binary)

Kimlik Doğrulama: JWT (djangorestframework-simplejwt)

Sunucu & Dağıtım: Gunicorn, WhiteNoise (Statik dosya yönetimi)

Ek Modüller: Pillow (Görsel işleme), qrcode (Barkod/Karekod entegrasyonu), django-cors-headers, django-filter
