package kargo.model;

public class Kargo {
    private String takipNumarasi;
    private String durum; //
    private double agirlikKg;

    // Kargo sınıfı, diğer sınıfları (Musteri ve Kurye) içinde barındırıyor
    private Musteri gonderici;
    private Kurye tasiyanKurye;

    public Kargo(String takipNumarasi, double agirlikKg, Musteri gonderici, Kurye tasiyanKurye) {
        this.takipNumarasi = takipNumarasi;
        this.agirlikKg = agirlikKg;
        this.gonderici = gonderici;
        this.tasiyanKurye = tasiyanKurye;
        this.durum = "Şubede Bekliyor";
    }


    public void durumGuncelle(String yeniDurum) {
        this.durum = yeniDurum;
        System.out.println(takipNumarasi + " numaralı kargonun durumu güncellendi: " + durum);
    }

    public void kargoBilgileriniGoster() {
        System.out.println("📦 Kargo Takip No: " + takipNumarasi);
        System.out.println("Durum: " + durum);
        System.out.println("Ağırlık: " + agirlikKg + " kg");
        System.out.println("Gönderici: ");
        gonderici.bilgileriGoster();
        System.out.println("Taşıyan Kurye: ");
        tasiyanKurye.bilgileriGoster();
    }
}