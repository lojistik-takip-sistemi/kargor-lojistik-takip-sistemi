package kargo.model;

public class SubeCalisani extends Kullanici {
    private Sube calistigiSube;
    private int vardiyaBaslangicSaati;
    private int vardiyaBitisSaati;

    public SubeCalisani(int id, String adSoyad, String email,
            Sube calistigiSube, int vardiyaBaslangicSaati, int vardiyaBitisSaati) {
        super(id, adSoyad, email);
        this.calistigiSube = calistigiSube;
        this.vardiyaBaslangicSaati = vardiyaBaslangicSaati;
        this.vardiyaBitisSaati = vardiyaBitisSaati;
    }

    public int calistigiSaatleriHesapla() {
        int toplamSaat = vardiyaBitisSaati - vardiyaBaslangicSaati;
        if (toplamSaat < 0) {
            toplamSaat += 24; // Gece vardiyası için düzeltme
        }
        return toplamSaat;
    }

    @Override
    public void bilgileriGoster() {
        super.bilgileriGoster(); // Önce temel kullanıcı bilgilerini yazdır
        System.out.println("Çalıştığı Şube: " + calistigiSube.getSubeAdi());
        System.out.println("Vardiya: " + vardiyaBaslangicSaati + ":00 - " + vardiyaBitisSaati + ":00");
        System.out.println("Toplam Çalışma Saati: " + calistigiSaatleriHesapla() + " saat");
        System.out.println("--------------------------------------------------");
    }

}
