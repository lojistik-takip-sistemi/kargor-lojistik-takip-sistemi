// Sayfanın tamamen yüklenmesini bekliyoruz
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const hataBox = document.getElementById('hataMesaji');

    // --- 1. OTOMATİK GİRİŞ KONTROLÜ (BENİ HATIRLA) ---
    // Sayfa açıldığında localStorage veya sessionStorage içinde geçerli bir token var mı bakıyoruz
    const savedToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    if (savedToken) {
        // Eğer token varsa, geçerli olup olmadığını kontrol etmek için profil sayfasına istek atıyoruz
        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/profile/', {
            headers: { 'Authorization': 'Bearer ' + savedToken }
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Oturum süresi dolmuş veya geçersiz.");
        })
        .then(profileData => {
            // Token geçerliyse kullanıcıyı direkt rolüne göre yönlendiriyoruz (Giriş ekranını atla)
            console.log("Kayıtlı oturum bulundu. Yönlendiriliyor...");
            if (profileData.role === 'Personel') {
                window.location.href = "/personel/";
            } else if (profileData.role === 'Kullanici') {
                window.location.href = "/kullanici/";
            } else {
                window.location.href = "/dashboard/";
            }
        })
        .catch(err => {
            // Token geçersizse veya hata alındıysa temizlik yapıp giriş sayfasında kalıyoruz
            console.log("Kayıtlı oturum geçersiz:", err.message);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            sessionStorage.removeItem('access_token');
            sessionStorage.removeItem('refresh_token');
        });
    }

    // --- 2. GİRİŞ FORMU İŞLEMLERİ ---
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const user = document.getElementById('email').value;
            const pass = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            if (hataBox) hataBox.style.display = 'none';

            fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            })
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Giriş başarısız');
            })
            .then(data => {
                // Eğer "Beni Hatırla" seçiliyse localStorage (kalıcı), değilse sessionStorage (geçici) kullanılır
                const storage = rememberMe ? localStorage : sessionStorage;
                
                // Eski verileri temizle
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');

                // Yeni tokenları kaydet
                storage.setItem('access_token', data.access);
                storage.setItem('refresh_token', data.refresh);
                
                return fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/profile/', {
                    headers: { 'Authorization': 'Bearer ' + data.access }
                });
            })
            .then(profileResponse => profileResponse.json())
            .then(profileData => {
                console.log("Giriş Başarılı! Rol:", profileData.role);
                
                // GELEN ROLE GÖRE YÖNLENDİRME (AKILLI KAPI)
                if (profileData.role === 'Personel') {
                    window.location.href = "/personel/"; 
                } else if (profileData.role === 'Kullanici') {
                    window.location.href = "/kullanici/"; 
                } else {
                    window.location.href = "/dashboard/"; 
                }
            })
            .catch(error => {
                if (hataBox) hataBox.style.display = 'block';
                console.error('Hata:', error);
            });
        });
    } else {
        console.warn("loginForm sayfada bulunamadı.");
    }
});
