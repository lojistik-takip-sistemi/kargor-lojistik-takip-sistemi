document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    // --- 1. GÜVENLİK VE GİRİŞ KONTROLÜ ---
    if (!token) { 
        window.location.href = "/"; 
        return; 
    }

    let allTasks = [];
    let allUsers = [];
    let myChart = null;

    // --- 2. PANEL DEĞİŞTİRME MANTIĞI (SIDEBAR) ---
    window.switchPanel = (panelId, element) => {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        
        document.getElementById(panelId).classList.add('active');
        element.classList.add('active');
        
        const titleMap = {
            'kargo-panel': 'Kargo Yönetimi',
            'kurye-panel': 'Kurye Yönetimi',
            'musteri-panel': 'Müşteri Yönetimi'
        };
        document.getElementById('panel-title').innerText = titleMap[panelId] || 'Yönetim Paneli';

        if (panelId === 'kurye-panel' || panelId === 'musteri-panel') fetchUsers();
        if (panelId === 'kargo-panel') { fetchTasks(); fetchStats(); }
    };

    // --- 3. VERİ ÇEKME FONKSİYONLARI ---
    const fetchStats = () => {
        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/dashboard/summary/', { 
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json()).then(data => {
            document.getElementById('stat-total-projects').innerText = data.total_projects || 0;
            document.getElementById('stat-total-tasks').innerText = data.total_tasks || 0;
            document.getElementById('stat-completed-tasks').innerText = data.completed_tasks || 0;
            updateChart(data);
            renderPerformance(data.performance);
        });
    };

    const fetchTasks = () => {
        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/tasks/', { 
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json()).then(data => {
            allTasks = data.results || data;
            renderKargoLists(allTasks);
        });
    };

    const fetchUsers = () => {
        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/users/', { 
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json()).then(data => {
            allUsers = data.results || data;
            renderUserLists(allUsers);
        });
    };

    // --- 4. LİSTELEME VE RENDER ---
    const renderKargoLists = (data) => {
        const pending = data.filter(t => t.status === 'Onay_Bekliyor');
        const others = data.filter(t => t.status !== 'Onay_Bekliyor');

        document.getElementById('pending-task-list').innerHTML = pending.length === 0 ? 
            "<p style='color:var(--text-muted); font-size:12px; padding:10px;'>Yeni talep yok.</p>" :
            pending.map(t => `
                <div class="item-row">
                    <div><strong>${escapeHTML(t.title)}</strong><br><small>${escapeHTML(t.origin)} ➔ ${escapeHTML(t.destination)}</small></div>
                    <div style="display:flex; gap:5px;">
                        <button onclick="openUpdateModal(${t.id})" class="badge" style="background:var(--warning); color:black;">Kurye Ata</button>
                        <button onclick="deleteTask(${t.id})" class="badge" style="background:var(--danger);">SİL</button>
                    </div>
                </div>`).join('');

        document.getElementById('task-list').innerHTML = others.length === 0 ? 
            "<p style='color:var(--text-muted); padding:10px;'>Aktif kargo yok.</p>" :
            others.slice().reverse().map(t => `
                <div class="item-row">
                    <div><strong>[${t.task_code}] ${escapeHTML(t.title)}</strong><br><small>Kurye: ${escapeHTML(t.assignee_name)} | ${t.status.replace('_',' ')}</small></div>
                    <div style="display:flex; gap:5px;">
                        <button onclick="openCommentModal(${t.id},'${escapeJS(t.title)}','${escapeJS(t.description)}')" class="badge" style="background:var(--success);">Yorum</button>
                        <button onclick="openUpdateModal(${t.id})" class="badge" style="background:#2563eb;">Düzenle</button>
                        <button onclick="deleteTask(${t.id})" class="badge" style="background:var(--danger);">SİL</button>
                    </div>
                </div>`).join('');
    };

    const renderUserLists = (users) => {
        const kuryeler = users.filter(u => u.role === 'Personel');
        const musteriler = users.filter(u => u.role === 'Kullanici');

        document.getElementById('courier-list').innerHTML = kuryeler.map(u => `
            <div class="item-row">
                <div><strong>${escapeHTML(u.full_name)}</strong><br><small>${u.email}</small></div>
                <div style="display:flex; gap:5px;">
                    <button onclick="openCourierDetailModal(${u.id}, '${escapeJS(u.full_name)}')" class="badge" style="background:var(--primary);">GEÇMİŞ İŞLER</button>
                    <button onclick="deleteUser(${u.id})" class="badge" style="background:var(--danger);">SİL</button>
                </div>
            </div>`).join('');
            
        document.getElementById('customer-list').innerHTML = musteriler.map(u => `
            <div class="item-row">
                <div><strong>${escapeHTML(u.full_name)}</strong><br><small>${u.email}</small></div>
                <div style="display:flex; gap:5px;">
                    <button onclick="openCustomerDetailModal(${u.id}, '${escapeJS(u.full_name)}')" class="badge" style="background:var(--warning); color:black;">KARGO GEÇMİŞİ</button>
                    <button onclick="deleteUser(${u.id})" class="badge" style="background:var(--danger);">SİL</button>
                </div>
            </div>`).join('');
    };

    // --- 5. MODAL VE GEÇMİŞ GÖRÜNTÜLEME FONKSİYONLARI ---

    // Kurye Geçmişi (TÜM DURUMLAR GÖSTERİLECEK ŞEKİLDE DÜZELTİLDİ)
    window.openCourierDetailModal = (courierId, courierName) => {
        document.getElementById('detailCourierName').innerText = courierName;
        
        // Sadece 'Tamamlandi' olanları DEĞİL, kuryeye atanmış TÜM kargoları alıyoruz
        const history = allTasks.filter(t => t.assigned_to == courierId);
        
        document.getElementById('courier-task-history').innerHTML = history.length === 0 ? 
            "<p style='color:var(--text-muted); text-align:center;'>Bu kuryeye atanmış hiçbir kargo bulunamadı.</p>" :
            history.map(t => {
                // Duruma göre renk ve metin belirliyoruz
                let color = t.status === 'Tamamlandi' ? 'var(--success)' : (t.status === 'Devam_Ediyor' ? 'var(--primary)' : 'var(--warning)');
                let statusText = t.status.replace('_', ' ');
                
                return `
                <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); margin-bottom:5px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong>${escapeHTML(t.title)}</strong>
                        <span style="font-size:10px; color:${color}; font-weight:bold; background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:6px;">${statusText}</span>
                    </div>
                    <small style="color:var(--text-muted);">${escapeHTML(t.origin || 'Bilinmiyor')} ➔ ${escapeHTML(t.destination || 'Bilinmiyor')}</small>
                </div>`;
            }).join('');
        
        document.getElementById('courierDetailModal').style.display = 'flex';
    };

    // Müşteri Geçmişi (TÜM DURUMLAR GÖSTERİLECEK ŞEKİLDE DÜZELTİLDİ)
    window.openCustomerDetailModal = (customerId, customerName) => {
        document.getElementById('detailCustomerName').innerText = customerName;
        
        // Müşterinin gönderdiği TÜM kargoları alıyoruz
        const history = allTasks.filter(t => t.customer == customerId);
        const historyContainer = document.getElementById('customer-task-history');

        if (history.length === 0) {
            historyContainer.innerHTML = "<p style='color:var(--text-muted); text-align:center; padding:20px;'>Bu müşteriye ait hiçbir gönderim bulunamadı.</p>";
        } else {
            historyContainer.innerHTML = history.map(t => {
                let color = t.status === 'Tamamlandi' ? 'var(--success)' : (t.status === 'Devam_Ediyor' ? 'var(--primary)' : 'var(--warning)');
                let statusText = t.status.replace('_', ' ');
                
                return `
                <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05); margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong>${escapeHTML(t.title)}</strong>
                        <span style="font-size:10px; color:${color}; font-weight:bold; background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:6px;">${statusText}</span>
                    </div>
                    <small style="color:var(--text-muted);">${escapeHTML(t.origin || 'Bilinmiyor')} ➔ ${escapeHTML(t.destination || 'Bilinmiyor')}</small>
                </div>`;
            }).join('');
        }
        document.getElementById('customerDetailModal').style.display = 'flex';
    };

    // --- 6. PROFİL VE DİĞER İŞLEMLER ---
    window.openProfileModal = () => {
        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/profile/', { 
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json()).then(u => {
            document.getElementById('profileUsername').value = u.username;
            document.getElementById('profileFullName').value = u.full_name || "";
            document.getElementById('profileEmail').value = u.email || "";
            if(document.getElementById('profileNewPassword')) document.getElementById('profileNewPassword').value = "";
            if(document.getElementById('profileConfirmPassword')) document.getElementById('profileConfirmPassword').value = "";
            document.getElementById('profileModal').style.display = 'flex';
        });
    };

    document.getElementById('profileForm').onsubmit = (e) => {
        e.preventDefault();
        const newPass = document.getElementById('profileNewPassword').value;
        const confirmPass = document.getElementById('profileConfirmPassword').value;
        if (newPass && newPass !== confirmPass) { alert("Şifreler uyuşmuyor!"); return; }

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
        .then(res => { if (res.ok) { alert("Profil güncellendi!"); document.getElementById('profileModal').style.display = 'none'; } });
    };

    window.deleteUser = (userId) => {
        if (confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) {
            fetch(`https://kargor-lojistik-takip-sistemi.onrender.com/api/users/${userId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            }).then(res => { if (res.ok) { alert("Silindi."); fetchUsers(); } });
        }
    };

    window.deleteTask = (id) => {
        if(confirm("Kargoyu silmek istediğinize emin misiniz?")) {
            fetch(`https://kargor-lojistik-takip-sistemi.onrender.com/api/tasks/${id}/`, { 
                method:'DELETE', 
                headers:{'Authorization':'Bearer '+token}
            }).then(() => fetchTasks());
        }
    };

    window.openUpdateModal = (taskId) => {
        const t = allTasks.find(x => x.id === taskId);
        if(!t) return;
        document.getElementById('updateTaskId').value = t.id;
        document.getElementById('updateTaskTitle').value = t.title;
        document.getElementById('updateTaskOrigin').value = t.origin || "";
        document.getElementById('updateTaskDestination').value = t.destination || "";
        document.getElementById('updateTaskDescription').value = t.description || "";
        document.getElementById('updateTaskStatus').value = t.status;
        document.getElementById('updateTaskAssignee').value = t.assigned_to || "";
        loadPersonnelDropdown();
        document.getElementById('updateModal').style.display='flex';
    };

    document.getElementById('updateTaskForm').onsubmit = (e) => {
        e.preventDefault();
        const tid = document.getElementById('updateTaskId').value;
        const payload = {
            title: document.getElementById('updateTaskTitle').value,
            origin: document.getElementById('updateTaskOrigin').value,
            destination: document.getElementById('updateTaskDestination').value,
            description: document.getElementById('updateTaskDescription').value,
            status: document.getElementById('updateTaskStatus').value,
            assigned_to: document.getElementById('updateTaskAssignee').value || null
        };
        fetch(`https://kargor-lojistik-takip-sistemi.onrender.com/api/tasks/${tid}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        }).then(res => { if(res.ok) { document.getElementById('updateModal').style.display='none'; fetchTasks(); fetchStats(); alert("Güncellendi!"); } });
    };

    window.loadPersonnelDropdown = () => {
        fetch('https://kargor-lojistik-takip-sistemi.onrender.com/api/users/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json()).then(data => {
            const users = data.results || data;
            const options = '<option value="">-- Kurye Seçin --</option>' + 
                users.filter(u => u.role === 'Personel').map(u => `<option value="${u.id}">${escapeHTML(u.full_name || u.username)}</option>`).join('');
            document.getElementById('updateTaskAssignee').innerHTML = options;
            if(document.getElementById('taskAssignee')) document.getElementById('taskAssignee').innerHTML = options;
        });
    };

    const updateChart = (data) => {
        const ctx = document.getElementById('taskChart').getContext('2d');
        if(myChart) myChart.destroy();
        myChart = new Chart(ctx, { 
            type:'doughnut', 
            data:{ labels:['Yapılacak','Yolda','Bitti'], datasets:[{ data:[data.todo_tasks, data.ongoing_tasks, data.completed_tasks], backgroundColor:['#ff4e50','#facc15','#4ade80'], borderWidth:0 }] }, 
            options:{ cutout:'75%', plugins:{ legend:{ display:false }}}
        });
    };

    const renderPerformance = (perf) => {
        const perfList = document.getElementById('performance-list');
        if(!perfList) return;
        perfList.innerHTML = (perf && perf.length > 0) ? 
            perf.map((p, i) => `<div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; margin-bottom:5px;"><span>#${i+1} ${p.username}</span><span style="color:var(--success);">${p.completed_count} Teslimat</span></div>`).join('') : "";
    };

    document.getElementById('searchInput').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allTasks.filter(t => t.title.toLowerCase().includes(term) || t.task_code.toLowerCase().includes(term));
        renderKargoLists(filtered);
    };

    window.openCommentModal = (tid, title, desc) => {
        document.getElementById('commentTaskId').value = tid;
        document.getElementById('modalTaskTitle').innerText = title;
        document.getElementById('commentModal').style.display = "flex";
        fetchComments(tid);
    };

    const fetchComments = (tid) => {
        fetch(`https://kargor-lojistik-takip-sistemi.onrender.com/api/comments/?task_id=${tid}`, { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json()).then(data => {
            const comments = data.results || data;
            document.getElementById('comment-list').innerHTML = comments.map(c => `<div style="background:rgba(255,255,255,0.02); padding:8px; border-radius:8px; margin-bottom:5px; font-size:12px;"><strong>${escapeHTML(c.user_name)}:</strong> ${escapeHTML(c.content)}</div>`).join('');
        });
    };

    document.getElementById('logoutBtn').onclick = () => { 
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href="/"; 
    };

    // --- YARDIMCI FONKSİYONLAR ---
    const escapeHTML = (s) => s ? s.toString().replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":"&#39;",'"':'&quot;'}[c])) : '';
    const escapeJS = (s) => s ? s.toString().replace(/'/g, "\\'") : '';

    fetchStats();
    fetchTasks();
    loadPersonnelDropdown();
});
