document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    let currentUser = null;
    let myTasks = [];

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    // --- PROFİL VERİLERİNİ BAŞLAT ---
    const fetchProfile = () => {
        fetch('http://127.0.0.1:8000/api/profile/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(user => {
            currentUser = user;
            document.getElementById('userNameDisplay').innerText = user.full_name || user.username;
            document.getElementById('userInitial').innerText = (user.full_name || user.username).charAt(0).toUpperCase();
            
            // Modal verilerini doldur
            document.getElementById('profUsername').value = user.username;
            document.getElementById('profFullName').value = user.full_name;
            document.getElementById('profEmail').value = user.email;
            document.getElementById('profPhone').value = user.phone || '';

            if (user.role === 'Yonetici') {
                const adminLink = document.getElementById('adminLink');
                if(adminLink) adminLink.style.display = 'flex';
            }

            fetchMyShipments();
            fetchNotifications();
        })
        .catch(err => {
            localStorage.clear();
            window.location.href = "index.html";
        });
    };

    // --- KARGOLARI LİSTELE ---
    function fetchMyShipments() {
        fetch('http://127.0.0.1:8000/api/tasks/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            myTasks = data.results || data;
            renderShipments(myTasks);
        });
    }

    // --- KRİTİK: RENDER VE İPTAL BUTONU ---
    function renderShipments(tasks) {
        const container = document.getElementById('shipment-list');
        let totalCount = tasks.length;
        let ongoingCount = 0;
        let doneCount = 0;

        if (totalCount === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); text-align:center; padding:20px;">Henüz bir kargo talebi oluşturmadınız.</p>';
            updateStats(0, 0, 0);
            return;
        }

        container.innerHTML = tasks.slice().reverse().map(task => {
            if (task.status === 'Devam_Ediyor' || task.status === 'Yapilacak') ongoingCount++;
            if (task.status === 'Tamamlandi') doneCount++;

            let statusColor = 'var(--text-muted)';
            let statusText = task.status.replace('_', ' ');

            if (task.status === 'Onay_Bekliyor') statusColor = 'var(--warning)';
            if (task.status === 'Devam_Ediyor') statusColor = 'var(--primary)';
            if (task.status === 'Tamamlandi') statusColor = 'var(--success)';

            // BURASI İPTAL BUTONUNUN EKLENDİĞİ YER
            return `
                <div class="item-row">
                    <div style="flex: 1;">
                        <span style="font-size: 10px; color: var(--text-muted); font-weight: 700;">#${task.task_code || 'T-XYZ'}</span>
                        <h4 style="margin: 3px 0;">${escapeHTML(task.title)}</h4>
                        <small style="color: var(--text-muted);"><i class="fa-solid fa-map-pin"></i> ${escapeHTML(task.origin)} ➔ ${escapeHTML(task.destination)}</small>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge" style="background: rgba(255,255,255,0.05); color: ${statusColor}; border: 1px solid ${statusColor};">
                            ${statusText}
                        </span>
                        <br>
                        ${task.status === 'Onay_Bekliyor' ? 
                            `<button onclick="cancelShipment(${task.id})" class="cancel-btn">
                                <i class="fa-solid fa-trash-arrow-up"></i> TALEBİ İPTAL ET
                            </button>` : 
                            `<small style="color: var(--text-muted); font-size: 10px;">${new Date(task.created_at).toLocaleDateString('tr-TR')}</small>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        updateStats(totalCount, ongoingCount, doneCount);
    }

    function updateStats(total, ongoing, done) {
        document.getElementById('statTotal').textContent = total;
        document.getElementById('statInProgress').textContent = ongoing;
        document.getElementById('statDone').textContent = done;
    }

    // --- KRİTİK: İPTAL ETME (SİLME) FONKSİYONU ---
    window.cancelShipment = (taskId) => {
        if (confirm("Bu kargo talebinizi kalıcı olarak iptal etmek istediğinize emin misiniz?")) {
            fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            })
            .then(res => {
                if (res.ok) {
                    alert("Kargo talebi başarıyla iptal edildi.");
                    fetchMyShipments();
                } else {
                    alert("Bir hata oluştu. Kargo yola çıkmış olabilir.");
                }
            });
        }
    };

    // --- YENİ KARGO OLUŞTURMA ---
    document.getElementById('createShipmentForm').onsubmit = (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('shipmentTitle').value,
            origin: document.getElementById('shipmentOrigin').value,
            destination: document.getElementById('shipmentDestination').value,
            description: document.getElementById('shipmentDesc').value,
            status: "Onay_Bekliyor"
        };
        fetch('http://127.0.0.1:8000/api/tasks/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.ok) {
                alert("Talebiniz yöneticiye iletildi.");
                document.getElementById('taskModal').style.display = 'none';
                e.target.reset();
                fetchMyShipments();
            }
        });
    };

    // --- PROFİL GÜNCELLEME ---
    document.getElementById('profileEditForm').onsubmit = function(e) {
        e.preventDefault();
        const newPass = document.getElementById('profileNewPassword').value;
        const confirmPass = document.getElementById('profileConfirmPassword').value;

        if (newPass && newPass !== confirmPass) {
            alert("Şifreler eşleşmiyor!"); return;
        }

        const updateData = {
            full_name: document.getElementById('profFullName').value,
            email: document.getElementById('profEmail').value,
            phone: document.getElementById('profPhone').value
        };
        if (newPass) updateData.password = newPass;

        fetch('http://127.0.0.1:8000/api/profile/', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(updateData)
        }).then(res => {
            if (res.ok) { alert("Profil güncellendi!"); location.reload(); }
        });
    };

    // --- SİSTEM VE YARDIMCI FONKSİYONLAR ---
    const fetchNotifications = () => {
        fetch('http://127.0.0.1:8000/api/notifications/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json()).then(data => {
            const list = document.getElementById('userNotifList');
            const notifs = data.results || data;
            if (notifs.length > 0) {
                list.innerHTML = "<h4 style='font-size:12px; margin-bottom:10px;'>Son Bildirimler</h4>" + 
                    notifs.slice(0, 3).map(n => `<div style="font-size:11px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.05);">${n.message}</div>`).join('');
            }
        });
    };

    window.openProfileModal = () => { document.getElementById('profileModal').style.display = 'flex'; };

    document.getElementById('searchInput').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        renderShipments(myTasks.filter(t => t.title.toLowerCase().includes(term) || (t.task_code && t.task_code.toLowerCase().includes(term))));
    };

    window.logout = () => { localStorage.clear(); window.location.href = "index.html"; };

    function escapeHTML(s) { return s ? s.toString().replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":"&#39;",'"':'&quot;'}[c])) : ''; }

    fetchProfile();
});