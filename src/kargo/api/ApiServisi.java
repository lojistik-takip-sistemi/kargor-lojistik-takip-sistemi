package kargo.api;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiServisi {
    // Django sunucumuzun adresi
    private static final String BASE_URL = "http://127.0.0.1:8000/api/";
    private static String accessToken = ""; // Django'dan alacağımız bilet

    // Sisteme giriş yapıp Token alma metodu
    public static boolean girisYap(String username, String password) {
        try {
            URL url = new URL(BASE_URL + "token/");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            
            // İstek ayarları
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("Accept", "application/json");
            con.setDoOutput(true);

            // JSON formatında kullanıcı adı ve şifreyi hazırlıyoruz
            String jsonInputString = String.format("{\"username\":\"%s\", \"password\":\"%s\"}", username, password);

            // Veriyi sunucuya gönder
            try (OutputStream os = con.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            // Sunucudan gelen cevabın kodunu al (200 = Başarılı)
            int responseCode = con.getResponseCode();

            if (responseCode == 200) {
                // Cevabı oku
                try (BufferedReader br = new BufferedReader(
                        new InputStreamReader(con.getInputStream(), "utf-8"))) {
                    StringBuilder response = new StringBuilder();
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                    
                    // JSON içinden token'ı ayıkla
                    String responseBody = response.toString();
                    accessToken = responseBody.split("\"access\":\"")[1].split("\"")[0];
                    System.out.println("✅ API Bağlantısı Başarılı! Sistem Token'ı aldı.");
                    return true;
                }
            } else {
                System.out.println("❌ API Girişi Başarısız. Hata Kodu: " + responseCode);
                return false;
            }

        } catch (Exception e) {
            System.out.println("❌ API Sunucusuna Bağlanılamadı. Django'nun (runserver) açık olduğundan emin olun.");
            System.out.println("Hata Detayı: " + e.getMessage());
            return false;
        }
    }
    
    // Diğer sınıfların Token'ı kullanabilmesi için
    public static String getAccessToken() {
        return accessToken;
    }
    // --- YENİ EKLENEN METOT: VERİTABANINA PROJE KAYDETME ---
    public static boolean projeOlustur(String projeAdi, String aciklama) {
        // Eğer token yoksa işlem yapamayız
        if (accessToken == null || accessToken.isEmpty()) {
            System.out.println("⚠️ Token bulunamadı. Önce giriş yapılmalı!");
            return false;
        }

        try {
            URL url = new URL(BASE_URL + "projects/");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            
            // İstek ayarları (POST)
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("Accept", "application/json");
            
            // DİKKAT: Güvenlik duvarını geçmek için az önce aldığımız bileti (Token) gösteriyoruz!
            con.setRequestProperty("Authorization", "Bearer " + accessToken); 
            con.setDoOutput(true);

            // Django'ya göndereceğimiz veriyi JSON formatında hazırlıyoruz
            String jsonInputString = String.format(
                "{\"name\":\"%s\", \"description\":\"%s\", \"status\":\"Planlaniyor\"}", 
                projeAdi, aciklama
            );

            // Veriyi sunucuya gönderiyoruz
            try (OutputStream os = con.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }

            // Sunucudan gelen cevabın kodunu alıyoruz (201 = Created / Başarıyla Oluşturuldu)
            int responseCode = con.getResponseCode();

            if (responseCode == 201) {
                System.out.println("💾 [VERİTABANI] Yeni Proje Başarıyla Kaydedildi: " + projeAdi);
                return true;
            } else {
                System.out.println("❌ Proje Kaydedilemedi. Hata Kodu: " + responseCode);
                return false;
            }

        } catch (Exception e) {
            System.out.println("❌ Bağlantı Hatası: " + e.getMessage());
            return false;
        }
    }
}