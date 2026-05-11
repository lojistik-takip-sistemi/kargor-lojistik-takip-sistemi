document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // DİKKAT: index.html içindeki id'si "loginEmail" olan inputtan veriyi alıyoruz
    const userEmail = document.getElementById('loginEmail').value;
    const pass = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked; // Checkbox durumu
    const hataBox = document.getElementById('hataMesaji');

    // Hata mesajını gizle
    hataBox.style.display = 'none';

    // 1. Django Token Endpoint'ine istek atıyoruz
    // Django bizden "username" beklediği için, e-posta değerini (userEmail) "username" içine yazarak yolluyoruz.
    fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userEmail, password: pass })
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Giriş başarısız');
    })
    .then(data => {
        // Token'ları kaydetme işlemleri
        const storage = rememberMe ? localStorage : sessionStorage;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');

        storage.setItem('access_token', data.access);
        storage.setItem('refresh_token', data.refresh);
        
        // 2. TOKEN'I ALDIK, ŞİMDİ KİMLİĞİMİZİ (ROLÜMÜZÜ) SORGULUYORUZ
        return fetch('http://127.0.0.1:8000/api/profile/', {
            headers: { 'Authorization': 'Bearer ' + data.access }
        });
    })
    .then(profileResponse => profileResponse.json())
    .then(profileData => {
        // 3. GELEN ROLE GÖRE YÖNLENDİRME (AKILLI KAPI)
        console.log("Giriş Başarılı! Rol:", profileData.role);
        
        if (profileData.role === 'Personel') {
            window.location.href = "personel.html"; // Kurye/Personel paneli
        } else {
            window.location.href = "dashboard.html"; // Yönetici paneli
        }
    })
    .catch(error => {
        // Hata durumunda kırmızı kutuyu göster
        hataBox.style.display = 'block';
        console.error('Hata:', error);
    });
});