package kargo.api;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class ApiServisi {
    private static final String BASE_URL = "https://kargor-lojistik-takip-sistemi.onrender.com/api/";
    private static String accessToken = "";

    public static boolean girisYap(String username, String password) {
        try {
            URL url = new URL(BASE_URL + "token/");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setDoOutput(true);

            String jsonInputString = String.format("{\"username\":\"%s\", \"password\":\"%s\"}", username, password);
            try (OutputStream os = con.getOutputStream()) {
                os.write(jsonInputString.getBytes("utf-8"));
            }

            if (con.getResponseCode() == 200) {
                BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"));
                StringBuilder response = new StringBuilder();
                String line;
                while ((line = br.readLine()) != null) response.append(line.trim());
                
                String respStr = response.toString();
                if (respStr.contains("\"access\":\"")) {
                    accessToken = respStr.split("\"access\":\"")[1].split("\"")[0];
                    return true;
                }
            }
        } catch (Exception e) {
            System.out.println("Bağlantı Hatası: " + e.getMessage());
        }
        return false;
    }

    public static boolean gorevOlustur(String baslik, String aciklama, int projeId, int atananId) {
        String json = String.format(
            "{\"title\":\"%s\", \"description\":\"%s\", \"project\":%d, \"assigned_to\":%d, \"status\":\"Yapilacak\"}",
            baslik, aciklama, projeId, atananId
        );
        return apiIstegiAt("POST", "tasks/", json);
    }

    public static boolean gorevDurumGuncelle(int gorevId, String yeniDurum) {
        String json = "{\"status\":\"" + yeniDurum + "\"}";
        return apiIstegiAt("PATCH", "tasks/" + gorevId + "/", json);
    }

    private static boolean apiIstegiAt(String method, String endpoint, String jsonBody) {
        if (accessToken.isEmpty()) return false;
        try {
            URL url = new URL(BASE_URL + endpoint);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod(method);
            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("Authorization", "Bearer " + accessToken);
            
            // PATCH desteklenmiyorsa override
            if(method.equals("PATCH")) {
                con.setRequestProperty("X-HTTP-Method-Override", "PATCH");
            }
            
            con.setDoOutput(true);
            try (OutputStream os = con.getOutputStream()) {
                os.write(jsonBody.getBytes("utf-8"));
            }
            
            int code = con.getResponseCode();
            return code == 201 || code == 200;
        } catch (Exception e) {
            return false;
        }
    }
}