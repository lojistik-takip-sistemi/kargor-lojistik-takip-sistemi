package kargo.model;

public class Arac {
    private String plaka;
    private String aracTipi; // Panelvan, Kamyonet, Motosiklet vb.
    private double tasimaKapasitesiKg;
    private boolean musaitMi;

    public Arac(String plaka, String aracTipi, double tasimaKapasitesiKg) {
        this.plaka = plaka;
        this.aracTipi = aracTipi;
        this.tasimaKapasitesiKg = tasimaKapasitesiKg;
        this.musaitMi = true; // Yeni araç sisteme eklendiğinde varsayılan olarak boştadır
    }

    public void aracBilgileriniGoster() {
        System.out.println("Araç Plakası: " + plaka);
        System.out.println("Tipi: " + aracTipi + " | Kapasite: " + tasimaKapasitesiKg + " kg");
        System.out.println("Durum: " + (musaitMi ? "Müsait" : "Görevde/Dolu"));
    }

    // Kurye aracı alıp dağıtıma çıktığında müsaitlik durumunu güncellemek için:
    public void durumuGuncelle(boolean musaitMi) {
        this.musaitMi = musaitMi;
        System.out.println(plaka + " plakalı aracın durumu güncellendi.");
    }

    public String getPlaka() {
        return plaka;
    }
}