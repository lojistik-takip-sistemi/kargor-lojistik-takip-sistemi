document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) { window.location.href = "index.html"; return; }

    const fetchProfile = () => {
        fetch('http://127.0.0.1:8000/api/profile/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(user => {
            // Arayüzü doldur
            document.getElementById('userNameDisplay').innerText = user.full_name;
            document.getElementById('userRoleDisplay').innerText = user.role === 'Yonetici' ? 'Yönetici' : 'Saha Personeli';
            document.getElementById('userInitial').innerText = user.full_name.charAt(0).toUpperCase();
            
            // Formu doldur
            document.getElementById('profUsername').value = user.username;
            document.getElementById('profFullName').value = user.full_name;
            document.getElementById('profEmail').value = user.email;
            document.getElementById('profPhone').value = user.phone || '';

            // Yöneticiyse linki göster
            if (user.role === 'Yonetici') {
                document.getElementById('adminLink').style.display = 'flex';
            }
        });
    };

    const fetchNotifications = () => {
        fetch('http://127.0.0.1:8000/api/notifications/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('userNotifList');
            const notifs = data.results || data;
            if (notifs.length === 0) {
                list.innerHTML = "<p style='color:#64748b; font-size:13px;'>Bildirim bulunmuyor.</p>";
                return;
            }
            list.innerHTML = notifs.slice(0, 5).map(n => `
                <div class="notif-item">
                    <p style="font-size: 13px; margin-bottom: 5px;">${n.message}</p>
                    <small style="color: #64748b;">${new Date(n.created_at).toLocaleDateString('tr-TR')}</small>
                </div>
            `).join('');
        });
    };

    document.getElementById('profileEditForm').onsubmit = function(e) {
        e.preventDefault();
        const updateData = {
            full_name: document.getElementById('profFullName').value,
            email: document.getElementById('profEmail').value,
            phone: document.getElementById('profPhone').value
        };

        fetch('http://127.0.0.1:8000/api/profile/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(updateData)
        })
        .then(res => {
            if (res.ok) {
                alert("Profiliniz başarıyla güncellendi!");
                fetchProfile();
            } else {
                alert("Güncelleme sırasında bir hata oluştu.");
            }
        });
    };

    window.logout = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    };

    fetchProfile();
    fetchNotifications();
});