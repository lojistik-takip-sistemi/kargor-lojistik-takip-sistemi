package kargo.model;

public class Kullanici {
    private int id;
    private String username;  // Backend'deki giriş adı
    private String adSoyad;   // Backend'deki full_name
    private String email;
    private String role;      // Musteri, Kurye, Personel (Backend ile eşleşmeli)
    private String phone;

    // Boş constructor (JSON kütüphanelerinin veriyi parse etmesi için gereklidir)
    public Kullanici() {
    }

    // Dolu constructor
    public Kullanici(int id, String username, String adSoyad, String email, String role, String phone) {
        this.id = id;
        this.username = username;
        this.adSoyad = adSoyad;
        this.email = email;
        this.role = role;
        this.phone = phone;
    }

    public void bilgileriGoster() {
        System.out.println("ID: " + id + " | Kullanıcı Adı: " + username + 
                           " | Ad Soyad: " + adSoyad + " | Rol: " + role);
    }

    // --- GETTER VE SETTER METODLARI ---
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAdSoyad() {
        return adSoyad;
    }

    public void setAdSoyad(String adSoyad) {
        this.adSoyad = adSoyad;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}