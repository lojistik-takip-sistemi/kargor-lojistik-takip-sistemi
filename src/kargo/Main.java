package kargo;

import kargo.api.ApiServisi;
import java.util.Random;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("--- 🚀 Görev Yönetim Simülasyonu Başlatılıyor ---\n");

        if (ApiServisi.girisYap("admin", "1234")) {
            System.out.println("✅ API bağlantısı kuruldu.");

            // --- DİNAMİK VERİ HAVUZU ---
            String[] bolgeler = {"Of", "Trabzon Merkez", "Arsin", "Rize Merkez", "Çayeli"};
            String[] gorevTipleri = {"Günlük Teslimat", "İade Alımı", "Adresten Kargo Alımı", "Şube İçi Düzenleme"};

            Random rastgele = new Random();
            String secilenBolge = bolgeler[rastgele.nextInt(bolgeler.length)];
            String secilenGorev = gorevTipleri[rastgele.nextInt(gorevTipleri.length)];
            
            String aciklama = secilenBolge + " bölgesindeki atanan operasyonları eksiksiz tamamla.";

            System.out.println("\n[1/3] Yeni Görev Sisteme Ekleniyor...");
            System.out.println("Görev: " + secilenGorev + " | Bölge: " + secilenBolge);
            
            // Rastgele seçilen verileri API'ye gönderiyoruz (Proje ID: 1, Personel ID: 2)
            ApiServisi.gorevOlustur(secilenGorev, aciklama, 1, 2);
            Thread.sleep(3000);

            System.out.println("\n[2/3] Personel (" + secilenBolge + " bölgesi) görevi üzerine aldı, durum: Devam Ediyor...");
            ApiServisi.gorevDurumGuncelle(1, "Devam_Ediyor");
            Thread.sleep(3000);

            System.out.println("\n[3/3] Görev başarıyla tamamlandı!");
            ApiServisi.gorevDurumGuncelle(1, "Tamamlandi");
            
            System.out.println("\n✨ İşlem tamamlandı. Web panelinden sonuçları görebilirsiniz.");
        } else {
            System.out.println("❌ API Girişi başarısız! Bilgileri kontrol edin.");
        }
    }
}