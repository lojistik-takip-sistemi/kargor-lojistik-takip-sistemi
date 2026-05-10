document.addEventListener("DOMContentLoaded", function() {
    // --- TOKEN VE GÜVENLİK ---
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    // Token geçerlilik kontrolü
    const isTokenExpired = (t) => {
        if (!t) return true;
        try {
            const payload = JSON.parse(atob(t.split('.')[1]));
            return (Date.now() >= payload.exp * 1000);
        } catch (e) {
            return true; 
        }
    };

    if (!token || isTokenExpired(token)) {
        alert("Oturum süreniz doldu veya geçersiz. Lütfen tekrar giriş yapın.");
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
        return; 
    }

    let isAdmin = false;
    let payload = {};

    try {
        payload = JSON.parse(atob(token.split('.')[1]));
        isAdmin = (payload.role === 'Yonetici'); 
        console.log("Giriş yapan rolü:", payload.role); // Konsola yazdırıp kontrol edelim
    } catch (e) {
        console.error("Token çözümlenemedi:", e);
    }

    // Hareketsizlik zaman aşımı (15 Dakika)
    const setupInactivityTimer = () => {
        let timeout;
        const limit = 15 * 60 * 1000; 

        const logout = () => {
            alert("Uzun süre işlem yapmadığınız için güvenliğiniz amacıyla çıkış yapıldı.");
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "index.html";
        };

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(logout, limit);
        };

        window.onload = resetTimer;
        document.onmousemove = resetTimer;
        document.onkeypress = resetTimer;
        document.onclick = resetTimer;
        document.onscroll = resetTimer;
    };
    setupInactivityTimer();

    // --- VERİ ÇEKME (READ) İŞLEMLERİ ---
    let allTasks = []; 

    let myChart = null; // Grafiği globalde tutalım ki güncellenebilsin


const fetchDashboardStats = () => {
    // 1. Backend'den verileri çekiyoruz
    fetch('http://127.0.0.1:8000/api/dashboard/summary/', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        // Konsola yazdırarak verinin gelip gelmediğini kontrol edelim (F12 ile bakabilirsin)
        console.log("Gelen İstatistikler:", data);

        // 2. Üstteki sayaç kartlarını güncelle
        document.getElementById('stat-total-projects').innerText = data.total_projects || 0;
        document.getElementById('stat-total-tasks').innerText = data.total_tasks || 0;
        document.getElementById('stat-completed-tasks').innerText = data.completed_tasks || 0;

        // 3. Grafik Tuvalini (Canvas) Yakala
        const ctx = document.getElementById('taskChart').getContext('2d');
        
        // Önemli: Eğer halihazırda bir grafik varsa, üzerine binmemesi için onu yok et
        if (myChart) { 
            myChart.destroy(); 
        }

        const perfContainer = document.getElementById('performance-list');
        if (perfContainer && data.performance) {
            if (data.performance.length > 0) {
                perfContainer.innerHTML = data.performance.map((p, index) => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-weight: bold; color: ${index === 0 ? '#facc15' : '#94a3b8'}">#${index + 1}</span>
                            <span style="font-size: 14px; font-weight: 500;">${escapeHTML(p.username)}</span>
                        </div>
                        <div style="text-align: right;">
                            <span style="color: #4ade80; font-weight: bold;">${p.completed_count} Bitti</span>
                            <br>
                            <small style="color: #64748b; font-size: 10px;">Toplam: ${p.total_assigned} Görev</small>
                        </div>
                    </div>
                `).join('');
            } else {
                perfContainer.innerHTML = "<p style='color: #94a3b8; font-size: 13px;'>Henüz veri bulunmuyor.</p>";
            }
        }

        // 4. Yeni Grafiği Oluştur
        myChart = new Chart(ctx, {
            type: 'doughnut', // Simit grafik tipi
            data: {
                labels: ['Yapılacak', 'Devam Ediyor', 'Tamamlandı'],
                datasets: [{
                    label: 'Görev Sayısı',
                    data: [
                        data.todo_tasks || 0,       // Backend'den gelen 'Yapilacak' sayısı
                        data.ongoing_tasks || 0,    // Backend'den gelen 'Devam_Ediyor' sayısı
                        data.completed_tasks || 0   // Backend'den gelen 'Tamamlandi' sayısı
                    ],
                    backgroundColor: [
                        '#ff4e50', // Kırmızı
                        '#facc15', // Sarı
                        '#4ade80'  // Yeşil
                    ],
                    hoverOffset: 20,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Kutunun boyutuna uyum sağlaması için
                plugins: {
                    legend: {
                        position: 'bottom', // Renk açıklamaları altta dursun
                        labels: {
                            color: '#94a3b8', // Gri metin rengi
                            padding: 20,
                            font: { size: 12, family: "'Inter', sans-serif" }
                        }
                    }
                },
                cutout: '70%' // Ortadaki boşluk oranı
            }
        });
    })
    .catch(error => console.error("İstatistikler çekilirken hata oluştu:", error));
};

    // Aktif görevleri listele
    const fetchTasks = () => {
        fetch('http://127.0.0.1:8000/api/tasks/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            allTasks = data.results ? data.results : data;
            renderList(allTasks);
        });
    };

    // Proje seçim listesini doldur (Yeni Görev Modalı için)
    const fetchProjectsForSelect = () => {
        fetch('http://127.0.0.1:8000/api/projects/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            const projects = data.results ? data.results : data;
            const select = document.getElementById('taskProject');
            if(select) {
                select.innerHTML = projects.map(p => 
                    `<option value="${p.id}" style="color: black;">${escapeHTML(p.name)}</option>`
                ).join('');
            }
        });
    };

    // --- YORUM İŞLEMLERİ (FETCH) ---
    window.openCommentModal = (taskId, title, desc) => {
        document.getElementById('commentTaskId').value = taskId;
        document.getElementById('modalTaskTitle').innerText = title;
        document.getElementById('modalTaskDesc').innerText = desc || "Açıklama bulunmuyor.";
        document.getElementById('commentModal').style.display = "flex";
        fetchComments(taskId);
    };

    const fetchComments = (taskId) => {
        const container = document.getElementById('comment-list');
        container.innerHTML = "Yükleniyor...";

        fetch(`http://127.0.0.1:8000/api/comments/?task_id=${taskId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            const comments = data.results ? data.results : data;
            if (comments.length === 0) {
                container.innerHTML = "<p style='color: #64748b; font-size: 13px;'>Henüz yorum yapılmamış.</p>";
                return;
            }
            container.innerHTML = comments.map(c => `
                <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; justify-content: space-between; font-size: 11px; color: #60a5fa; margin-bottom: 5px;">
                        <strong>${escapeHTML(c.user_name)}</strong>
                        <span>${new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <p style="font-size: 13px; color: #e2e8f0;">${escapeHTML(c.content)}</p>
                </div>
            `).join('');
        });
    };

    // Güvenli metin yazdırma (XSS Koruması)
    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag] || tag)
        );
    };

    // Görevleri ekrana bas
    const renderList = (data) => {
        const container = document.getElementById('task-list');
        
        // Görev yoksa kullanıcıya bilgi ver
        if (data.length === 0) {
            container.innerHTML = "<p style='color: #94a3b8;'>Aktif görev bulunmuyor.</p>";
            return;
        }
        
        // Son 10 görevi ters sırada (en yeni üstte) listele
        container.innerHTML = data.slice(-10).reverse().map(t => `
            <div class="item-row">
                <div>
                    <strong>[${escapeHTML(t.task_code)}] ${escapeHTML(t.title)}</strong><br>
                    <small>Proje: ${escapeHTML(t.project_name)} | Atanan: ${escapeHTML(t.assigned_to_name) || 'Atanmadı'}</small>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div class="status ${t.status === 'Tamamlandi' ? 'delivered' : 'in-transit'}">
                        ${escapeHTML(t.status.replace('_', ' '))}
                    </div>

                    <button onclick="openCommentModal(${t.id}, '${escapeHTML(t.title)}', '${escapeHTML(t.description)}')" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Yorumlar</button>

                    <button onclick="openUpdateModal(${t.id}, '${escapeHTML(t.status)}')" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Güncelle</button>
                    
                    ${isAdmin ? `
                        <button onclick="deleteTask(${t.id})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Sil</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    };

    // --- ARAMA ---
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allTasks.filter(t => 
            (t.title && t.title.toLowerCase().includes(term)) || 
            (t.task_code && t.task_code.toLowerCase().includes(term))
        );
        renderList(filtered);
    });

    // --- MODAL YÖNETİMİ ---
    const taskModal = document.getElementById('taskModal');
    const updateModal = document.getElementById('updateModal');
    const logModal = document.getElementById('logModal');

    // Açma Butonları
    document.getElementById('openModalBtn').onclick = () => {
        fetchProjectsForSelect();
        taskModal.style.display = "flex";
    };
    document.getElementById('openLogModalBtn').onclick = () => {
        logModal.style.display = "flex";
        fetchLogs();
    };

    // Kapatma Butonları
    document.getElementById('closeModalBtn').onclick = () => taskModal.style.display = "none";
    document.getElementById('closeUpdateModalBtn').onclick = () => updateModal.style.display = "none";
    document.getElementById('closeLogModalBtn').onclick = () => logModal.style.display = "none";

    // --- YENİ GÖREV EKLEME (CREATE) ---
    document.getElementById('createTaskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        const newTask = {
            title: document.getElementById('taskTitle').value,
            project: document.getElementById('taskProject').value,
            priority: document.getElementById('taskPriority').value,
            status: "Yapilacak",
            assigned_to: payload.user_id
        };

        fetch('http://127.0.0.1:8000/api/tasks/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(newTask)
        })
        .then(res => {
            if (res.ok) {
                taskModal.style.display = "none";
                e.target.reset(); 
                fetchTasks(); 
                fetchDashboardStats(); 
                alert("Görev başarıyla oluşturuldu!");
            } else {
                res.json().then(err => alert("Hata: " + JSON.stringify(err)));
            }
        });
    });

    // --- GÜNCELLEME (UPDATE) ---
    window.openUpdateModal = (taskId, currentStatus) => {
        document.getElementById('updateTaskId').value = taskId;
        document.getElementById('updateTaskStatus').value = currentStatus;
        updateModal.style.display = "flex";
    };

    document.getElementById('updateTaskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const taskId = document.getElementById('updateTaskId').value;
        const newStatus = document.getElementById('updateTaskStatus').value;

        fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(res => {
            if (res.ok) {
                updateModal.style.display = "none";
                fetchTasks(); 
                fetchDashboardStats(); 
                alert("Durum güncellendi!");
            }
        });
    });

    // --- 3. YENİ YORUM EKLEME (POST) ---
    const addCommentForm = document.getElementById('addCommentForm');
    if (addCommentForm) {
        addCommentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const taskId = document.getElementById('commentTaskId').value;
            const content = document.getElementById('commentContent').value;

            fetch('http://127.0.0.1:8000/api/comments/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({ task: taskId, content: content })
            })
            .then(res => {
                if (res.ok) {
                    document.getElementById('commentContent').value = ""; // Yazılan yorumu temizle
                    fetchComments(taskId); // Listeyi anında yenile ki yorumu görelim
                } else {
                    alert("Yorum gönderilirken bir hata oluştu.");
                }
            });
        });
    }

    // --- SİLME (SOFT DELETE) ---
    window.deleteTask = (taskId) => {
        if (!confirm("Bu görevi silmek (pasife almak) istediğinize emin misiniz?")) return;

        fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => {
            if (res.ok) {
                fetchTasks(); 
                fetchDashboardStats(); 
                alert("Görev pasife alındı.");
            }
        });
    };

    // --- İŞLEM LOGLARI ---
    const fetchLogs = () => {
        const logContainer = document.getElementById('log-list');
        logContainer.innerHTML = "Yükleniyor...";

        fetch('http://127.0.0.1:8000/api/logs/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            const logs = data.results ? data.results : data;
            logContainer.innerHTML = logs.map(log => {
                let color = log.action_type === "CREATE" ? "#4ade80" : (log.action_type === "DELETE" ? "#f87171" : "#60a5fa");
                return `
                <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 10px; border-left: 4px solid ${color}; margin-bottom: 8px;">
                    <small style="color: ${color}; font-weight: bold;">${log.action_type}</small>
                    <p style="font-size: 13px; margin: 3px 0;">${escapeHTML(log.description)}</p>
                    <small style="color: #64748b;">${log.user_name} - ${new Date(log.created_at).toLocaleString('tr-TR')}</small>
                </div>`;
            }).join('');
        });
    };

    // Dışarı tıklayınca kapat
    window.onclick = (e) => { 
        if (e.target == taskModal) taskModal.style.display = "none"; 
        if (e.target == updateModal) updateModal.style.display = "none"; 
        if (e.target == logModal) logModal.style.display = "none"; 
    };

    // --- ÇIKIŞ ---
    document.getElementById('logoutBtn').onclick = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "index.html";
    };

    // Başlangıç yüklemeleri
    fetchDashboardStats();
    fetchTasks();
    fetchProjectsForSelect();
    setInterval(fetchTasks, 15000); 

// --- BİLDİRİM SİSTEMİ ---
    const notifBell = document.getElementById('notificationBell');
    const notifDropdown = document.getElementById('notifDropdown');
    const notifList = document.getElementById('notifList');
    const notifCount = document.getElementById('notifCount');

    // Zile tıklayınca menüyü aç/kapat
    notifBell.onclick = (e) => {
        e.stopPropagation();
        notifDropdown.style.display = notifDropdown.style.display === 'none' ? 'block' : 'none';
        if (notifDropdown.style.display === 'block') fetchNotifications();
    };

    const fetchNotifications = () => {
        fetch('http://127.0.0.1:8000/api/notifications/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            const notifs = data.results ? data.results : data;
            const unreadCount = notifs.filter(n => !n.is_read).length;

            if (unreadCount > 0) {
                notifCount.innerText = unreadCount;
                notifCount.style.display = 'block';
            } else {
                notifCount.style.display = 'none';
            }

            notifList.innerHTML = notifs.length === 0 ? 
                "<p style='font-size:12px; color:#94a3b8;'>Bildirim yok.</p>" :
                notifs.slice(0, 5).map(n => `
                    <div style="background: ${n.is_read ? 'transparent' : 'rgba(255,78,80,0.1)'}; padding: 10px; border-radius: 8px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        ${escapeHTML(n.message)}
                        <br><small style="color:#64748b;">${new Date(n.created_at).toLocaleTimeString()}</small>
                    </div>
                `).join('');
        });
    };

    // Dışarı tıklayınca kapat
    window.addEventListener('click', () => { notifDropdown.style.display = 'none'; });

    // Her 30 saniyede bir yeni bildirim var mı diye bak
    setInterval(fetchNotifications, 30000);
    fetchNotifications(); // Sayfa açılınca ilk kez çalıştır

function openProfileModal() {
    fetch('http://127.0.0.1:8000/api/profile/', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(user => {
        document.getElementById('profileUsername').value = user.username;
        document.getElementById('profileFullName').value = user.full_name || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profileModal').style.display = 'flex';
    });
}

document.getElementById('profileForm').onsubmit = function(e) {
    e.preventDefault();
    const data = {
        full_name: document.getElementById('profileFullName').value,
        email: document.getElementById('profileEmail').value
    };

    fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
        alert("Profil güncellendi!");
        closeModal('profileModal');
        fetchDashboardStats(); // Liderlik tablosunu tazele
    });
};

document.getElementById('userAddForm').onsubmit = function(e) {
    e.preventDefault();
    const data = {
        username: document.getElementById('addUsername').value,
        password: document.getElementById('addPassword').value,
        full_name: document.getElementById('addFullName').value,
        email: document.getElementById('addEmail').value,
        role: document.getElementById('addRole').value
    };

    fetch('http://127.0.0.1:8000/api/users/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if(res.ok) {
            alert("Yeni personel başarıyla eklendi!");
            closeModal('userModal');
            document.getElementById('userAddForm').reset();
            fetchDashboardStats(); // Liderlik tablosunu güncelle
        } else {
            alert("Hata: Kullanıcı adı zaten alınmış olabilir.");
        }
    });
};

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}


});