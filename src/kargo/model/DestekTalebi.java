package kargo.model;

import java.time.LocalDateTime;

public class DestekTalebi {
    private String talepNo;
    private Kargo ilgiliKargo;
    private Musteri olusturanMusteri;
    private String konu;
    private String aciklama;
    private String durum;
    private LocalDateTime olusturulmaTarihi;

    public DestekTalebi(String talepNo, Kargo ilgiliKargo, Musteri olusturanMusteri, String konu, String aciklama) {
        this.talepNo = talepNo;
        this.ilgiliKargo = ilgiliKargo;
        this.olusturanMusteri = olusturanMusteri;
        this.konu = konu;
        this.aciklama = aciklama;
        this.durum = "Açık";
        this.olusturulmaTarihi = LocalDateTime.now();
    }

    public void talepDurumuGuncelle(String yeniDurum) {
        this.durum = yeniDurum;
        System.out.println(talepNo + " numaralı destek talebinin durumu güncellendi: " + durum);
    }

    public void talepBilgileriniGoster() {
        System.out.println("--- DESTEK TALEBİ ---");
        System.out.println("Talep No: " + talepNo + " | Konu: " + konu);
        System.out.println("Kargo Takip: " + ilgiliKargo.getTakipNumarasi());
        System.out.println("Açıklama: " + aciklama);
        System.out.println("Durum: " + durum);
    }
}