const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
let currentUser = null;

// Token yoksa giriş sayfasına at
if (!token) {
    window.location.href = 'index.html';
}

// 1. Önce kim olduğumuzu (Profilimizi) öğrenelim
function initPersonelPanel() {
    fetch('http://127.0.0.1:8000/api/profile/', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(user => {
        currentUser = user;
        // İsmi ekrana yaz
        document.getElementById('personelName').textContent = user.full_name || user.username;
        
        // Şimdi bu kullanıcıya ait görevleri çekelim
        fetchMyTasks();
    })
    .catch(err => console.error("Profil çekilemedi:", err));
}

// 2. Gerçek Görevleri Veritabanından Çek
// 2. Gerçek Görevleri Veritabanından Çek
function fetchMyTasks() {
    fetch('http://127.0.0.1:8000/api/tasks/', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        // İŞTE ÇÖZÜM BURASI: Veri direkt liste mi yoksa 'results' içinde mi kontrol ediyoruz
        let tasksArray = [];
        if (Array.isArray(data)) {
            tasksArray = data; 
        } else if (data && Array.isArray(data.results)) {
            tasksArray = data.results; 
        } else {
            console.error("Beklenmeyen görev formatı:", data);
            return;
        }

        // Backend'den gelen tüm görevler içinden SADECE bana ait olanları ayıkla
        const myTasks = tasksArray.filter(task => {
        // Hem sayı hem metin durumunu kapsamak için == kullanıyoruz 
        // ve console.log ile eşleşmeyi kontrol ediyoruz
        const matches = task.assigned_to == currentUser.id;
        if (matches) console.log("Eşleşen görev bulundu:", task.title);
        return matches;
});

        let todoCount = 0;
        let progressCount = 0;
        let doneCount = 0;

        let activeHTML = '';
        let completedHTML = '';

        myTasks.forEach(task => {
            // Tarihi güzelleştir
            const dateStr = new Date(task.due_date || task.created_at).toLocaleDateString('tr-TR');

            if (task.status === 'Yapilacak' || task.status === 'Devam_Ediyor') {
                if (task.status === 'Yapilacak') todoCount++;
                if (task.status === 'Devam_Ediyor') progressCount++;

                activeHTML += `
                    <div class="task-card" style="border-left: 4px solid ${task.status === 'Yapilacak' ? 'var(--accent-blue)' : '#f59e0b'};">
                        <div>
                            <h3 style="margin: 0 0 5px 0; font-size: 16px;">${escapeHTML(task.title)}</h3>
                            <p style="margin: 0; font-size: 12px; color: var(--text-muted);">${escapeHTML(task.description)}</p>
                            <small style="color: #64748b; display: block; margin-top: 5px;">📅 Son Tarih: ${dateStr}</small>
                        </div>
                        <div>
                            <button onclick="updateTaskStatus(${task.id}, 'Tamamlandi')" class="btn-finish">✓ Bitir</button>
                        </div>
                    </div>
                `;
            } else if (task.status === 'Tamamlandi') {
                doneCount++;
                completedHTML += `
                    <div class="task-card" style="opacity: 0.7; border-left: 4px solid var(--accent-green);">
                        <div>
                            <h3 style="margin: 0 0 5px 0; font-size: 16px; text-decoration: line-through;">${escapeHTML(task.title)}</h3>
                            <p style="margin: 0; font-size: 12px; color: var(--text-muted);">${escapeHTML(task.description)}</p>
                        </div>
                        <div>
                            <span style="color: var(--accent-green); font-weight: bold;">✓ Bitti</span>
                        </div>
                    </div>
                `;
            }
        });

        // Sayıları Ekrana Yaz
        document.getElementById('statTodo').textContent = todoCount;
        document.getElementById('statInProgress').textContent = progressCount;
        document.getElementById('statDone').textContent = doneCount;

        // Listeleri Ekrana Yaz
        document.getElementById('activeTasksList').innerHTML = activeHTML || '<p style="color: var(--text-muted);">Aktif görevin yok. Harika!</p>';
        document.getElementById('completedTasksList').innerHTML = completedHTML || '<p style="color: var(--text-muted);">Henüz tamamlanan görev yok.</p>';
    })
    .catch(err => console.error("Görevler çekilemedi:", err));
}

// 3. Tek Tıkla Görevi Tamamlama İşlemi (Backend'e PUT İsteği)
function updateTaskStatus(taskId, newStatus) {
    // Sadece durumu güncellemek için PATCH kullanıyoruz
    fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => {
        if(res.ok) {
            // Başarılıysa listeyi yeniden çek ve ekranı tazele
            fetchMyTasks();
        } else {
            alert("Durum güncellenirken hata oluştu.");
        }
    });
}

// XSS Koruması için yardımcı fonksiyon
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Sayfa yüklendiğinde sistemi başlat
initPersonelPanel();