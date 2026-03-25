package kargo.model;

public class Musteri extends Kullanici {
    private String adres;
    private String telefon;

    public Musteri(int id, String adSoyad, String email, String adres, String telefon) {
        super(id, adSoyad, email);
        this.adres = adres;
        this.telefon = telefon;
    }

    @Override
    public void bilgileriGoster() {
        super.bilgileriGoster(); // Önce temel kullanıcı bilgilerini yazdır
        System.out.println("Adres: " + adres + " | Telefon: " + telefon);
        System.out.println("--------------------------------------------------");
    }
}