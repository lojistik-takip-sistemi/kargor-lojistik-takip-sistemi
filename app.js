document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked; // Checkbox durumu
    const hataBox = document.getElementById('hataMesaji');

    // Hata mesajını gizle
    hataBox.style.display = 'none';

    // Django Token Endpoint'ine istek atıyoruz
    fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Giriş başarısız');
    })
    .then(data => {
        // Beni Hatırla seçildiyse localStorage (kalıcı), seçilmediyse sessionStorage (tarayıcı kapanınca silinir)
        const storage = rememberMe ? localStorage : sessionStorage;

        // Çakışmayı önlemek için her iki storage'ı da temizle
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');

        // Token'ları ilgili alana kaydet
        storage.setItem('access_token', data.access);
        storage.setItem('refresh_token', data.refresh);
        
        // JWT Payload'ını çöz (Kullanıcı ID'sini ve yetkilerini okumak için)
        try {
            const payload = JSON.parse(atob(data.access.split('.')[1]));
            storage.setItem('user_id', payload.user_id);
            
            // İleride admin (1 numaralı ID) veya personeli ayırmak için bu payload'ı kullanacağız.
            console.log("Giriş başarılı. Kullanıcı ID:", payload.user_id);
        } catch (e) {
            console.error("Token çözümlenirken hata oluştu", e);
        }

        // Görev Yönetim paneline yönlendir
        window.location.href = "dashboard.html";
    })
    .catch(error => {
        // Hata durumunda kırmızı kutuyu göster
        hataBox.style.display = 'block';
        console.error('Hata:', error);
    });
});