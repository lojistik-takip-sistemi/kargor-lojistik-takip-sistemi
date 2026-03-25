package kargo.model;

public class Kullanici {
    private int id;
    private String adSoyad;
    private String email;

    public Kullanici(int id, String adSoyad, String email) {
        this.id = id;
        this.adSoyad = adSoyad;
        this.email = email;
    }

    public void bilgileriGoster() {
        System.out.println("ID: " + id + " | Ad Soyad: " + adSoyad + " | Email: " + email);
    }
}