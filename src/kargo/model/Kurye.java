package kargo.model;

public class Kurye extends Kullanici {
    private String aracPlakasi;
    private String sorumluBolge;

    public Kurye(int id, String adSoyad, String email, String aracPlakasi, String sorumluBolge) {
        super(id, adSoyad, email);
        this.aracPlakasi = aracPlakasi;
        this.sorumluBolge = sorumluBolge;
    }

    @Override
    public void bilgileriGoster() {
        System.out.println("--- KURYE BİLGİSİ ---");
        super.bilgileriGoster();
        System.out.println("Araç Plakası: " + aracPlakasi + " | Sorumlu Bölge: " + sorumluBolge);
        System.out.println("--------------------------------------------------");
    }
}