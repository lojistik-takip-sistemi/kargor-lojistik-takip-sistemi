package kargo.model;

public class Kurye extends Kullanici {
    private Arac zimmetliArac;
    private String sorumluBolge;

    public Kurye(int id, String adSoyad, String email, Arac zimmetliArac, String sorumluBolge) {
        super(id, adSoyad, email);
        this.zimmetliArac = zimmetliArac;
        this.sorumluBolge = sorumluBolge;
    }

    @Override
    public void bilgileriGoster() {
        System.out.println("--- KURYE BİLGİSİ ---");
        super.bilgileriGoster();
        System.out.println("Araç Plakası: " + zimmetliArac.getPlaka() + " | Sorumlu Bölge: " + sorumluBolge);
        System.out.println("--------------------------------------------------");
    }
}