package kargo.model;

import java.util.ArrayList;
import java.util.List;

public class Kargo {
    private String takipNumarasi;
    private String durum; //
    private double agirlikKg;
    private List<KargoHareketi> hareketGecmisi;

    // Kargo sınıfı, diğer sınıfları (Musteri ve Kurye) içinde barındırıyor
    private Musteri gonderici;
    private Kurye tasiyanKurye;

    public Kargo(String takipNumarasi, double agirlikKg, Musteri gonderici, Kurye tasiyanKurye) {
        this.takipNumarasi = takipNumarasi;
        this.agirlikKg = agirlikKg;
        this.gonderici = gonderici;
        this.tasiyanKurye = tasiyanKurye;
        this.durum = "Şubede Bekliyor";

        this.hareketGecmisi = new ArrayList<>();
    }

    public void yeniHareketEkle(Sube sube, String aciklama) {
        String hareketId = "HRK-" + System.currentTimeMillis(); // Rastgele bir ID ürettik
        KargoHareketi yeniHareket = new KargoHareketi(hareketId, this, sube, aciklama);
        hareketGecmisi.add(yeniHareket);

        // Kargonun genel durumunu da son hareketle güncelleyelim
        this.durum = aciklama;
        System.out.println(takipNumarasi + " için yeni hareket kaydedildi: " + aciklama);
    }

    public void durumGuncelle(String yeniDurum) {
        this.durum = yeniDurum;
        System.out.println(takipNumarasi + " numaralı kargonun durumu güncellendi: " + durum);
    }

    public void kargoBilgileriniGoster() {
        System.out.println("Kargo Takip No: " + takipNumarasi);
        System.out.println("Durum: " + durum);
        System.out.println("Ağırlık: " + agirlikKg + " kg");
        System.out.println("Gönderici: ");
        gonderici.bilgileriGoster();
        System.out.println("Taşıyan Kurye: ");
        tasiyanKurye.bilgileriGoster();
    }

    public void hareketGecmisiniGoster() {
        System.out.println("--- " + takipNumarasi + " Numaralı Kargo Hareket Dökümü ---");
        for (KargoHareketi hareket : hareketGecmisi) {
            hareket.hareketDetayiGoster();
        }
        System.out.println("---------------------------------------------------");
    }

    public String getTakipNumarasi() {
        return takipNumarasi;
    }

}