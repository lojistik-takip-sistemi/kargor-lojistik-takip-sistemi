package kargo.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class Sefer {
    private String seferNo;
    private Sube cikisSubesi;
    private Sube varisSubesi;
    private Arac kullanilanArac;
    private List<Kargo> tasinanKargolar;
    private LocalDateTime cikisZamani;
    private LocalDateTime varisZamani;

    public Sefer(String seferNo, Sube cikisSubesi, Sube varisSubesi, Arac kullanilanArac) {
        this.seferNo = seferNo;
        this.cikisSubesi = cikisSubesi;
        this.varisSubesi = varisSubesi;
        this.kullanilanArac = kullanilanArac;
        this.tasinanKargolar = new ArrayList<>();
    }

    public void kargoEkle(Kargo kargo) {
        tasinanKargolar.add(kargo);
        System.out.println(kargo.getTakipNumarasi() + " numaralı kargo " + seferNo + " numaralı sefere yüklendi.");
    }

    public void seferiBaslat() {
        this.cikisZamani = LocalDateTime.now();
        this.kullanilanArac.durumuGuncelle(false);
        System.out.println("Sefer Başladı! Araç yola çıktı.");
    }

    public void seferiBitir() {
        this.varisZamani = LocalDateTime.now();
        this.kullanilanArac.durumuGuncelle(true); // Araç şubeye ulaştı, tekrar müsait oldu.
        System.out.println("✅ Sefer Tamamlandı! Araç varış şubesine ulaştı.");
    }

    // Seferin genel özetini görmek için
    public void seferBilgileriniGoster() {
        DateTimeFormatter formatlayici = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

        System.out.println("--- SEFER BİLGİLERİ ---");
        System.out.println("Sefer No: " + seferNo);
        System.out.println("Rota: " + cikisSubesi.getSubeAdi() + " → " + varisSubesi.getSubeAdi());
        System.out.println("Araç Plakası: " + kullanilanArac.getPlaka());
        System.out.println("Taşınan Kargo Sayısı: " + tasinanKargolar.size());

        if (cikisZamani != null) {
            System.out.println("Çıkış Zamanı: " + cikisZamani.format(formatlayici));
            if (varisZamani != null) {
                System.out.println("Varış Zamanı: " + varisZamani.format(formatlayici));
                System.out.println(
                        "Sefer Süresi: " + java.time.Duration.between(cikisZamani, varisZamani).toMinutes()
                                + " dakika");
            } else {
                System.out.println("Durum: Sefer devam ediyor, henüz varış yapılmadı.");
            }
        } else {
            System.out.println("Durum: Henüz yola çıkmadı.");
        }
    }
}