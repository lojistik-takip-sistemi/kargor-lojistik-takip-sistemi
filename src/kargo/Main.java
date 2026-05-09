package kargo;

import kargo.api.ApiServisi; // API Servisimizi dahil ediyoruz
import kargo.model.Arac;
import kargo.model.Kargo;
import kargo.model.Kurye;
import kargo.model.Musteri;
import kargo.model.Sefer;
import kargo.model.Sube;
import kargo.model.SubeCalisani;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("--- Kargo Lojistik Takip Sistemi Başlatılıyor ---\n");

        // --- API BAĞLANTI VE VERİTABANI KAYIT KISMI ---
        System.out.println("🌐 Backend (Django) sunucusuna bağlanılıyor...");
        boolean baglantiDurumu = ApiServisi.girisYap("admin", "1234");
        
        if (!baglantiDurumu) {
            System.out.println("⚠️ Çevrimdışı mod: Veriler sadece bu ekranda (RAM'de) kalacak.\n");
        } else {
            System.out.println("🚀 Çevrimiçi mod: Gerçek zamanlı veritabanı entegrasyonu aktif.\n");
            
            // --- VERİTABANINA CANLI KAYIT ATIYORUZ ---
            ApiServisi.projeOlustur("Trabzon Şube Altyapı Yenilemesi", "Tüm bilgisayarlar ve ağ sistemleri güncellenecek.");
        }
        // ----------------------------------------

        // 1. Şubelerin Oluşturulması
        Sube cikisSubesi = new Sube("SUB-061", "Trabzon Merkez Şubesi", "Trabzon", "Ortahisar", "Meydan Mevkii");
        Sube varisSubesi = new Sube("SUB-053", "Rize Merkez Şubesi", "Rize", "Merkez", "Atatürk Cad.");

        // 2. Şube Çalışanı Oluşturulması ve Testi
        System.out.println("--- PERSONEL BİLGİLERİ ---");
        SubeCalisani calisan = new SubeCalisani(201, "Ayşe Yılmaz", "ayse@kargor.com", cikisSubesi, 8, 17);
        calisan.bilgileriGoster();

        // 3. Araçların Oluşturulması (Dağıtım aracı ve Şehirlerarası Sefer Kamyonu)
        Arac kuryeAraci = new Arac("61 TR 123", "Panelvan", 500.0);
        Arac seferAraci = new Arac("34 KMY 99", "Kamyon", 15000.0);

        // 4. Kurye ve Müşteri Oluşturulması
        Kurye kurye1 = new Kurye(101, "Mehmet Kaptan", "mehmet@kargor.com", kuryeAraci, "Ortahisar");
        Musteri musteri1 = new Musteri(1, "Ahmet Yılmaz", "ahmet@email.com", "Trabzon Merkez", "05551234567");

        // 5. Kargo Oluşturulması ve İlk Hareket
        System.out.println("\n--- KARGO KABUL SÜRECİ ---");
        Kargo kargo1 = new Kargo("KRG-987654321", 2.5, musteri1, kurye1);
        kargo1.kargoBilgileriniGoster();

        System.out.println();
        kargo1.yeniHareketEkle(cikisSubesi, "Şubeye Teslim Alındı");

        // 6. Sefer (Transfer) Süreci
        System.out.println("\n--- SEFER VE TRANSFER SÜRECİ ---");
        Sefer sefer1 = new Sefer("SFR-1001", cikisSubesi, varisSubesi, seferAraci);
        sefer1.kargoEkle(kargo1);

        sefer1.seferiBaslat(); // Kamyonun müsaitlik durumu otomatik 'false' (Görevde) olacak
        kargo1.yeniHareketEkle(cikisSubesi, "Transfer Merkezine Gönderilmek Üzere Yola Çıktı");

        // Sefer süresini simüle etmek için kısa bir duraklama (1.5 saniye)
        Thread.sleep(1500);

        sefer1.seferiBitir(); // Kamyon tekrar müsait (true) duruma geçecek
        kargo1.yeniHareketEkle(varisSubesi, "Varış Şubesine Ulaştı");

        // 7. Dağıtım ve Teslimat
        System.out.println("\n--- DAĞITIM VE TESLİMAT SÜRECİ ---");
        kargo1.yeniHareketEkle(varisSubesi, "Kurye Dağıtıma Çıktı");
        kargo1.yeniHareketEkle(varisSubesi, "Müşteriye Teslim Edildi");

        // 8. Raporlama ve Dökümler
        System.out.println("\n--- SİSTEM RAPORLARI ---");
        sefer1.seferBilgileriniGoster();
        System.out.println();
        kargo1.hareketGecmisiniGoster();
    }
}