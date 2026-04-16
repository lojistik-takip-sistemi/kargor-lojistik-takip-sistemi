package kargo.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class KargoHareketi {
    private String hareketId;
    private Kargo kargo;
    private LocalDateTime tarihSaat;
    private Sube sube;
    private String durumAciklamasi;

    public KargoHareketi(String hareketId, Kargo kargo, Sube sube, String durumAciklamasi) {
        this.hareketId = hareketId;
        this.kargo = kargo;
        this.sube = sube;
        this.tarihSaat = LocalDateTime.now();
        this.durumAciklamasi = durumAciklamasi;
    }

    public void hareketDetayiGoster() {
        // Tarih ve saati daha okunaklı bir formata çeviriyoruz
        DateTimeFormatter formatlayici = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
        String formatliTarih = tarihSaat.format(formatlayici);

        System.out.println(
                "Tarih: " + formatliTarih + " | Konum: " + sube.getSubeAdi() + " | Durum: " + durumAciklamasi);
    }

}