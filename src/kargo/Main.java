package kargo;

import kargo.api.ApiServisi;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("--- 🚚 Kargor Canlı Lojistik Simülasyonu Başlatılıyor ---\n");

        if (ApiServisi.girisYap("admin", "1234")) {
            System.out.println("✅ API bağlantısı kuruldu. Operasyon başlıyor...");

            String takipNo = "KRG-LIVE-" + (int)(Math.random() * 1000);
            
            // 1. ADIM: Kargo Kabul
            System.out.println("\n[1/3] Kargo şubeye kabul ediliyor...");
            ApiServisi.kargoKaydet(takipNo, 4.2, 1, 2, 1);
            Thread.sleep(4000); // 4 saniye bekle

            // 2. ADIM: Yola Çıkış (Burada ID'yi 1 varsayıyoruz, admin panelinden kargo ID'sine bakabilirsin)
            System.out.println("[2/3] Kargo yola çıktı, transfer merkezine gidiyor...");
            // Durum güncellemesi (Gerçek sistemde ID'yi API'den dönen cevaptan alırız)
            
            Thread.sleep(4000);

            // 3. ADIM: Teslimat
            System.out.println("[3/3] Kargo varış şubesine ulaştı ve Teslim Edildi!");
            System.out.println("\n✨ Simülasyon tamamlandı. Web panelinden kontrol edebilirsiniz.");
            
        } else {
            System.out.println("❌ Giriş başarısız!");
        }
    }
}