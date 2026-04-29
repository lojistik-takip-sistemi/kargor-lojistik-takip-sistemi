// Sayfa yüklendiğinde Token var mı diye kontrol et
document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token');
    
    // Eğer token yoksa (yani giriş yapmamışsa) kapı dışarı et!
    if (!token) {
        alert("Bu sayfayı görüntülemek için giriş yapmalısınız!");
        window.location.href = "index.html"; 
    }
});

// Çıkış Yap Butonu İşlemi
document.getElementById('logoutBtn').addEventListener('click', function() {
    // Tarayıcıdaki biletleri (tokenları) sil
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Giriş sayfasına geri gönder
    window.location.href = "index.html";
});