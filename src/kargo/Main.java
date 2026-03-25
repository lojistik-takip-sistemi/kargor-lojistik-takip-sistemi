package kargo;

import kargo.model.Kargo;
import kargo.model.Kurye;
import kargo.model.Musteri;

public class Main {
    public static void main(String[] args) {
        System.out.println("--- Kargo Lojistik Takip Sistemi ---");


        Musteri musteri1 = new Musteri(1, "Ahmet Yılmaz", "ahmet@email.com", "Trabzon Merkez", "05551234567");


        Kurye kurye1 = new Kurye(101, "Mehmet Kaptan", "mehmet@kargor.com", "61 TR 123", "Ortahisar");


        Kargo kargo1 = new Kargo("KRG-987654321", 2.5, musteri1, kurye1);


        System.out.println("\n--- İLK KARGO OLUŞTURULDU ---");
        kargo1.kargoBilgileriniGoster();


        System.out.println("\n--- KARGO HAREKETİ ---");
        kargo1.durumGuncelle("Dağıtıma Çıktı");
    }
}