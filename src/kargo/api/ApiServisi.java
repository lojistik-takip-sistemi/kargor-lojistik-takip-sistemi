package kargo.api;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiServisi {
    // ÖNEMLİ: Eğer 127.0.0.1 çalışmazsa burayı "http://localhost:8000/api/" olarak dene
    private static final String BASE_URL = "http://127.0.0.1:8000/api/";
    private static String accessToken = "";

    public static boolean girisYap(String username, String password) {
        try {
            URL url = new URL(BASE_URL + "token/");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setDoOutput(true);
            con.setConnectTimeout(5000); // 5 saniye içinde bağlanamazsa hata ver

            String jsonInputString = String.format("{\"username\":\"%s\", \"password\":\"%s\"}", username, password);
            try (OutputStream os = con.getOutputStream()) {
                os.write(jsonInputString.getBytes("utf-8"));
            }

            int responseCode = con.getResponseCode();
            if (responseCode == 200) {
                BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) response.append(line.trim());
                
                // Token ayıklama
                String respStr = response.toString();
                if (respStr.contains("\"access\":\"")) {
                    accessToken = respStr.split("\"access\":\"")[1].split("\"")[0];
                    return true;
                }
            } else {
                System.out.println("❌ Giriş Başarısız! Sunucu Yanıtı: " + responseCode);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Bağlantı Hatası: Sunucuya ulaşılamıyor. Şunları kontrol et:");
            System.out.println("1. Django sunucusu (runserver) çalışıyor mu?");
            System.out.println("2. Terminaldeki adres http://127.0.0.1:8000 mi?");
            System.out.println("Hata Detayı: " + e.getMessage());
        }
        return false;
    }

    public static boolean kargoKaydet(String takipNo, double agirlik, int gondericiId, int aliciId, int subeId) {
        String json = String.format(
            "{\"tracking_number\":\"%s\", \"weight_kg\":%s, \"sender\":%d, \"receiver\":%d, \"origin_branch\":%d, \"current_status\":\"Şubede Bekliyor\"}",
            takipNo, String.valueOf(agirlik), gondericiId, aliciId, subeId
        );
        return apiIstegiAt("POST", "shipments/", json, false);
    }

    public static boolean kargoDurumGuncelle(int kargoId, String yeniDurum) {
        String json = "{\"current_status\":\"" + yeniDurum + "\"}";
        // Güncelleme işlemi olduğu için isUpdate parametresini true gönderiyoruz
        return apiIstegiAt("POST", "shipments/" + kargoId + "/", json, true);
    }

    private static boolean apiIstegiAt(String method, String endpoint, String jsonBody, boolean isUpdate) {
        if (accessToken.isEmpty()) return false;
        try {
            URL url = new URL(BASE_URL + endpoint);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod(method);
            
            // Eğer bir güncelleme yapıyorsak Django'ya bunun bir PATCH olduğunu bildiriyoruz
            if (isUpdate) {
                con.setRequestProperty("X-HTTP-Method-Override", "PATCH");
            }
            
            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("Authorization", "Bearer " + accessToken);
            con.setDoOutput(true);

            try (OutputStream os = con.getOutputStream()) {
                os.write(jsonBody.getBytes("utf-8"));
            }
            
            int code = con.getResponseCode();
            return code == 201 || code == 200;
        } catch (Exception e) {
            System.out.println("İstek Hatası: " + e.getMessage());
            return false;
        }
    }
}