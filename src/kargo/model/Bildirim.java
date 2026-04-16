package kargo.model;

import java.time.LocalDateTime;

public class Bildirim {
    private String bildirimId;
    private Kullanici alici; // Hem Musteri'ye hem Kurye'ye gidebilir, o yüzden ata sınıfı (Kullanici)
                             // kullanmak efsane olur!
    private String baslik;
    private String mesaj;
    private String bildirimTipi; // Örn: SMS, EMAIL, PUSH
    private boolean okunduMu;
    private LocalDateTime gonderimZamani;

    public Bildirim(String bildirimId, Kullanici alici, String baslik, String mesaj, String bildirimTipi) {
        this.bildirimId = bildirimId;
        this.alici = alici;
        this.baslik = baslik;
        this.mesaj = mesaj;
        this.bildirimTipi = bildirimTipi;
        this.okunduMu = false;
        this.gonderimZamani = LocalDateTime.now();
    }

    public void bildirimiOku() {
        this.okunduMu = true;
        System.out.println("Bildirim başarıyla okundu olarak işaretlendi.");
    }

    public void bildirimIceriginiGoster() {
        System.out.println("[" + bildirimTipi + "] " + baslik);
        System.out.println("Mesaj: " + mesaj);
        System.out.println("Durum: " + (okunduMu ? "Okundu" : "Okunmadı"));
    }
}