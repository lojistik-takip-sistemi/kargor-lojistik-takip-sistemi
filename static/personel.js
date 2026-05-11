document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    let currentUser = null;
    let allTasks = [];

    // --- GÜVENLİK KONTROLÜ ---
    if (!token) {
        window.location.href = "/";
        return;
    }

    // --- BAŞLATMA FONKSİYONU ---
    function init() {
        // Önce kurye profilini alalım
        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/profile/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => {
            if (!res.ok) throw new Error("Yetkisiz erişim");
            return res.json();
        })
        .then(user => {
            currentUser = user;
            document.getElementById('personelName').textContent = user.full_name || user.username;
            fetchTasks(); // Profil geldikten sonra kargoları çek
        })
        .catch(err => {
            localStorage.clear();
            window.location.href = "/";
        });
    }

    // --- GÖREVLERİ ÇEKME ---
    function fetchTasks() {
        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/tasks/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            // Django'dan gelen veriyi diziye çevir
            allTasks = data.results || data;
            
            // ÖNEMLİ: Sadece bu kuryeye atanmış işleri göster
            const myTasks = allTasks.filter(t => t.assigned_to === currentUser.id);
            renderList(myTasks);
        });
    }

    // --- LİSTELEME (RENDER) ---
    function renderList(tasks) {
        const activeContainer = document.getElementById('activeTasksList');
        const completedContainer = document.getElementById('completedTasksList');
        
        let todoCount = 0;
        let ongoingCount = 0;
        let doneCount = 0;
        
        let activeHTML = '';
        let completedHTML = '';

        tasks.forEach(task => {
            const dateStr = new Date(task.created_at).toLocaleDateString('tr-TR');

            if (task.status === 'Yapilacak' || task.status === 'Devam_Ediyor') {
                if (task.status === 'Yapilacak') todoCount++;
                if (task.status === 'Devam_Ediyor') ongoingCount++;

                const isOngoing = task.status === 'Devam_Ediyor';
                
                activeHTML += `
                    <div class="task-card">
                        <div class="task-header">
                            <div>
                                <span class="task-code">${task.task_code || 'Kargo'}</span>
                                <h4 style="margin-top: 10px;">${escapeHTML(task.title)}</h4>
                            </div>
                            <span style="font-size: 11px; font-weight: 800; color: ${isOngoing ? 'var(--warning)' : 'var(--primary)'}">
                                ${isOngoing ? '🚚 YOLDA' : '📌 ATANDI'}
                            </span>
                        </div>
                        
                        <div class="route-info">
                            <span>${escapeHTML(task.origin || 'Depo')}</span>
                            <i class="fa-solid fa-chevron-right"></i>
                            <span>${escapeHTML(task.destination || 'Müşteri')}</span>
                        </div>

                        <p class="task-desc">${escapeHTML(task.description || 'Açıklama belirtilmemiş.')}</p>

                        <div class="task-footer">
                            <span class="task-date"><i class="fa-regular fa-clock"></i> ${dateStr}</span>
                            <div>
                                ${!isOngoing ? 
                                    `<button onclick="updateStatus(${task.id}, 'Devam_Ediyor')" class="btn btn-warning"><i class="fa-solid fa-truck"></i> YOLA ÇIK</button>` : 
                                    `<button onclick="updateStatus(${task.id}, 'Tamamlandi')" class="btn btn-success"><i class="fa-solid fa-check-circle"></i> TESLİM ET</button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            } else if (task.status === 'Tamamlandi') {
                doneCount++;
                completedHTML += `
                    <div class="task-card" style="opacity: 0.75;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <strong>${escapeHTML(task.title)}</strong>
                            <i class="fa-solid fa-circle-check" style="color:var(--success);"></i>
                        </div>
                        <div style="font-size:12px; color:var(--text-muted); margin-top:5px;">
                            ${escapeHTML(task.origin)} ➔ ${escapeHTML(task.destination)}
                        </div>
                    </div>
                `;
            }
        });

        // Sayıları Güncelle
        document.getElementById('statTodo').innerText = todoCount;
        document.getElementById('statInProgress').innerText = ongoingCount;
        document.getElementById('statDone').innerText = doneCount;

        // Listeleri Doldur
        activeContainer.innerHTML = activeHTML || '<div style="text-align:center; color:var(--text-muted); padding:20px;">Şu an aktif görev bulunmuyor.</div>';
        completedContainer.innerHTML = completedHTML || '<div style="text-align:center; color:var(--text-muted); padding:20px;">Henüz batan iş yok.</div>';
    }

    // --- DURUM GÜNCELLEME (GLOBAL) ---
    window.updateStatus = (taskId, newStatus) => {
        fetch(`https://kargor-lojistik-takip-sistemi.onrender.com/api/tasks/${taskId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(res => {
            if (res.ok) fetchTasks();
            else alert("Durum güncellenirken hata oluştu.");
        });
    };

    // --- ARAMA FİLTRESİ ---
    document.getElementById('searchInput').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allTasks.filter(t => 
            t.assigned_to === currentUser.id && (
            t.title.toLowerCase().includes(term) || 
            t.task_code.toLowerCase().includes(term) ||
            (t.origin && t.origin.toLowerCase().includes(term)) ||
            (t.destination && t.destination.toLowerCase().includes(term)))
        );
        renderList(filtered);
    };

    // --- PROFİL VE ŞİFRE GÜNCELLEME ---
    window.openProfileModal = () => {
        document.getElementById('profileUsername').value = currentUser.username;
        document.getElementById('profileFullName').value = currentUser.full_name || "";
        document.getElementById('profileEmail').value = currentUser.email || "";
        document.getElementById('profileNewPassword').value = "";
        document.getElementById('profileConfirmPassword').value = "";
        document.getElementById('profileModal').style.display = 'flex';
    };

    document.getElementById('profileForm').onsubmit = (e) => {
        e.preventDefault();
        const newPass = document.getElementById('profileNewPassword').value;
        const confirmPass = document.getElementById('profileConfirmPassword').value;

        if (newPass && newPass !== confirmPass) {
            alert("Şifreler uyuşmuyor!");
            return;
        }

        const payload = {
            full_name: document.getElementById('profileFullName').value,
            email: document.getElementById('profileEmail').value
        };
        if (newPass) payload.password = newPass;

        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/profile/', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (res.ok) {
                alert("Bilgileriniz başarıyla güncellendi!");
                location.reload();
            } else {
                alert("Hata: Bilgiler güncellenemedi.");
            }
        });
    };

    // --- YENİ EKLENEN: GÜVENLİ ÇIKIŞ İŞLEMİ ---
    window.logout = () => {
        // Hem beni hatırla verisini hem de anlık sekmeyi tamamen temizle
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        
        window.location.href = "/";
    };

    const escapeHTML = (s) => s ? s.toString().replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":"&#39;",'"':'&quot;'}[c])) : '';

    init();
});
