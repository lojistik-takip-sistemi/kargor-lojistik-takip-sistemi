document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token');
    
    // 1. Aşama: Eğer token hiç yoksa giriş ekranına at
    if (!token) {
        alert("Bu sayfayı görüntülemek için giriş yapmalısınız!");
        window.location.href = "index.html"; 
        return;
    }

    // 2. Aşama: Token var ama geçerli mi? Backend'e doğrulama isteği at.
    fetch('http://127.0.0.1:8000/api/users/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 401) { // 401 Unauthorized (Geçersiz veya süresi dolmuş token)
            alert("Oturumunuzun süresi doldu veya geçersiz. Lütfen tekrar giriş yapın.");
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = "index.html";
        }
        // Eğer status 200 OK ise her şey yolunda demektir, kullanıcı sayfada kalabilir.
    })
    .catch(error => {
        console.error('Bağlantı hatası:', error);
    });
});

// Çıkış Yap Butonu İşlemi
document.getElementById('logoutBtn').addEventListener('click', function() {
    // Tarayıcıdaki biletleri (tokenları) sil
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Giriş sayfasına geri gönder
    window.location.href = "index.html";
});