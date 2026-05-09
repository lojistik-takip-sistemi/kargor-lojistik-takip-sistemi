document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
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
        // Token'ları tarayıcıya kaydet
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        // Dashboard'a yönlendir
        window.location.href = "dashboard.html";
    })
    .catch(error => {
        // Hata durumunda kırmızı kutuyu göster
        hataBox.style.display = 'block';
        console.error('Hata:', error);
    });
});