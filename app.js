// Sayfanın tamamen yüklenmesini bekliyoruz
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    // Eğer sayfada loginForm isimli bir form varsa işlemleri başlat
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const user = document.getElementById('email').value;
            const pass = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            const hataBox = document.getElementById('hataMesaji');

            hataBox.style.display = 'none';

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
                const storage = rememberMe ? localStorage : sessionStorage;
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('refresh_token');

                storage.setItem('access_token', data.access);
                storage.setItem('refresh_token', data.refresh);
                
                return fetch('http://127.0.0.1:8000/api/profile/', {
                    headers: { 'Authorization': 'Bearer ' + data.access }
                });
            })
            .then(profileResponse => profileResponse.json())
            .then(profileData => {
                console.log("Giriş Başarılı! Rol:", profileData.role);
                
                if (profileData.role === 'Personel') {
                    window.location.href = "personel.html"; 
                } else {
                    window.location.href = "dashboard.html"; 
                }
            })
            .catch(error => {
                hataBox.style.display = 'block';
                console.error('Hata:', error);
            });
        });
    } else {
        console.warn("loginForm sayfada bulunamadı.");
    }
});