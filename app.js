document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Sayfanın yenilenmesini engeller

    // Formdaki bilgileri al
    const kadi = document.getElementById('username').value;
    const sifre = document.getElementById('password').value;

    // Django API'sine giriş isteği at
    fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: kadi,
            password: sifre
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Giriş Başarısız');
        }
        return response.json();
    })
    .then(data => {
        // Gelen Token'ı tarayıcının hafızasına (localStorage) kaydet
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        alert("Giriş Başarılı! Sisteme yönlendiriliyorsunuz...");
        window.location.href = "dashboard.html"; 
    })
    .catch(error => {
        console.error('Hata:', error);
        document.getElementById('hataMesaji').style.display = 'block';
    });
});