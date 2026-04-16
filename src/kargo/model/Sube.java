package kargo.model;

public class Sube {
    private String subeKodu;
    private String subeAdi;
    private String il;
    private String ilce;
    private String adres;

    public Sube(String subeKodu, String subeAdi,
            String il, String ilce, String adres) {
        this.subeKodu = subeKodu;
        this.subeAdi = subeAdi;
        this.il = il;
        this.ilce = ilce;
        this.adres = adres;
    }

    public String getSubeAdi() {
        return subeAdi;
    }

    public void bilgileriGoster() {
        System.out.println("--- ŞUBE BİLGİSİ ---");
        System.out.println("Şube Kodu: " + subeKodu);
        System.out.println("Şube Adı: " + subeAdi);
        System.out.println("İl: " + il + " | İlçe: " + ilce);
        System.out.println("Adres: " + adres);
        System.out.println("--------------------------------------------------");
    }

}