package kargo.model;

public class Kurye extends Kullanici {
    private Arac zimmetliArac;
    private String sorumluBolge;

    public Kurye(int id, String username, String adSoyad, String email, String phone, Arac zimmetliArac, String sorumluBolge) {
        // Ata sınıfa (Kullanici) bilgileri ve "Kurye" rolünü gönderiyoruz
        super(id, username, adSoyad, email, "Kurye", phone);
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