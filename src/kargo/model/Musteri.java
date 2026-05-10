package kargo.model;

public class Musteri extends Kullanici {
    private String adres;

    public Musteri(int id, String username, String adSoyad, String email, String adres, String telefon) {
        // Ata sınıfa (Kullanici) tüm bilgileri ve "Musteri" rolünü gönderiyoruz
        super(id, username, adSoyad, email, "Musteri", telefon);
        this.adres = adres;
    }

    @Override
    public void bilgileriGoster() {
        super.bilgileriGoster(); // Önce temel kullanıcı bilgilerini yazdır
        System.out.println("Adres: " + adres + " | Telefon: " + getPhone());
        System.out.println("--------------------------------------------------");
    }
}