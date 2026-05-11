document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (!token) { window.location.href = "index.html"; return; }

    let allTasks = [];
    let allUsers = [];
    let myChart = null;

    // --- PANEL DEĞİŞTİRME MANTIĞI ---
    window.switchPanel = (panelId, element) => {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        
        document.getElementById(panelId).classList.add('active');
        element.classList.add('active');
        document.getElementById('panel-title').innerText = element.innerText;

        if (panelId === 'kurye-panel' || panelId === 'musteri-panel') fetchUsers();
        if (panelId === 'kargo-panel') { fetchTasks(); fetchStats(); }
    };

    // --- VERİ ÇEKME ---
    const fetchStats = () => {
        fetch('http://127.0.0.1:8000/api/dashboard/summary/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json()).then(data => {
            document.getElementById('stat-total-projects').innerText = data.total_projects || 0;
            document.getElementById('stat-total-tasks').innerText = data.total_tasks || 0;
            document.getElementById('stat-completed-tasks').innerText = data.completed_tasks || 0;
            updateChart(data);
            renderPerformance(data.performance);
        });
    };

    const fetchTasks = () => {
        fetch('http://127.0.0.1:8000/api/tasks/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json()).then(data => {
            allTasks = data.results || data;
            renderKargoLists(allTasks);
        });
    };

    const fetchUsers = () => {
        fetch('http://127.0.0.1:8000/api/users/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json()).then(data => {
            allUsers = data.results || data;
            renderUserLists(allUsers);
        });
    };

    // --- LİSTELEME FONKSİYONLARI ---
    const renderKargoLists = (data) => {
        const pending = data.filter(t => t.status === 'Onay_Bekliyor');
        const others = data.filter(t => t.status !== 'Onay_Bekliyor');

        document.getElementById('pending-task-list').innerHTML = pending.length === 0 ? "<p style='color:var(--text-muted); font-size:12px;'>Yeni talep yok.</p>" :
            pending.map(t => `<div class="item-row"><div><strong>${escapeHTML(t.title)}</strong><br><small>${escapeHTML(t.origin)} ➔ ${escapeHTML(t.destination)}</small></div><div style="display:flex; gap:5px;"><button onclick="openUpdateModal(${t.id})" class="badge" style="background:var(--warning); color:black;">Detay</button><button onclick="deleteTask(${t.id})" class="badge" style="background:var(--danger);">SİL</button></div></div>`).join('');

        document.getElementById('task-list').innerHTML = others.map(t => `<div class="item-row"><div><strong>[${t.task_code}] ${escapeHTML(t.title)}</strong><br><small>Kurye: ${escapeHTML(t.assignee_name)} | ${t.status}</small></div><div style="display:flex; gap:5px;"><button onclick="openCommentModal(${t.id},'${t.title}','${t.description}')" class="badge" style="background:var(--success);">Yorum</button><button onclick="openUpdateModal(${t.id})" class="badge" style="background:#2563eb;">Düzenle</button><button onclick="deleteTask(${t.id})" class="badge" style="background:var(--danger);">SİL</button></div></div>`).join('');
    };

    const renderUserLists = (users) => {
        const kuryeler = users.filter(u => u.role === 'Personel');
        const musteriler = users.filter(u => u.role === 'Kullanici');

        document.getElementById('courier-list').innerHTML = kuryeler.map(u => `
            <div class="item-row">
                <div><strong>${escapeHTML(u.full_name)}</strong><br><small>${u.email}</small></div>
                <div style="display:flex; gap:5px;">
                    <button onclick="openCourierDetailModal(${u.id}, '${escapeHTML(u.full_name)}')" class="badge" style="background:var(--primary);">GEÇMİŞ İŞLER</button>
                    <button onclick="deleteUser(${u.id})" class="badge" style="background:var(--danger);">KURYEYİ SİL</button>
                </div>
            </div>`).join('');
            
        document.getElementById('customer-list').innerHTML = musteriler.map(u => `
            <div class="item-row">
                <div><strong>${escapeHTML(u.full_name)}</strong><br><small>${u.email}</small></div>
                <div style="display:flex; gap:5px;">
                    <button onclick="openCustomerDetailModal(${u.id}, '${escapeHTML(u.full_name)}')" class="badge" style="background:var(--warning); color:black;">KARGO GEÇMİŞİ</button>
                    <button onclick="deleteUser(${u.id})" class="badge" style="background:var(--danger);">MÜŞTERİYİ SİL</button>
                </div>
            </div>`).join('');
    };

    // --- PROFİL GÜNCELLEME MANTIĞI ---
    window.openProfileModal = () => {
        fetch('http://127.0.0.1:8000/api/profile/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json()).then(u => {
            document.getElementById('profileUsername').value = u.username;
            document.getElementById('profileFullName').value = u.full_name;
            document.getElementById('profileEmail').value = u.email;
            document.getElementById('profileNewPassword').value = "";
            document.getElementById('profileConfirmPassword').value = "";
            document.getElementById('profileModal').style.display = 'flex';
        });
    };

    document.getElementById('profileForm').onsubmit = (e) => {
        e.preventDefault();
        const fullName = document.getElementById('profileFullName').value;
        const email = document.getElementById('profileEmail').value;
        const newPass = document.getElementById('profileNewPassword').value;
        const confirmPass = document.getElementById('profileConfirmPassword').value;

        if (newPass && newPass !== confirmPass) {
            alert("Yeni şifreler birbiriyle eşleşmiyor!");
            return;
        }

        const payload = { full_name: fullName, email: email };
        if (newPass) payload.password = newPass;

        fetch('http://127.0.0.1:8000/api/profile/', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (res.ok) {
                alert("Profil başarıyla güncellendi!");
                document.getElementById('profileModal').style.display = 'none';
            } else {
                alert("Güncelleme sırasında bir hata oluştu.");
            }
        });
    };

    // --- KULLANICI SİLME ---
    window.deleteUser = (userId) => {
        if (confirm("Bu kullanıcıyı sistemden tamamen silmek istediğinize emin misiniz?")) {
            fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + token }
            }).then(res => { if (res.ok) { alert("Kullanıcı silindi."); fetchUsers(); } });
        }
    };

    // --- KURYE VE MÜŞTERİ GEÇMİŞİ MODALLARI ---
    window.openCourierDetailModal = (courierId, courierName) => {
        document.getElementById('detailCourierName').innerText = courierName;
        const history = allTasks.filter(t => t.assigned_to === courierId && t.status === 'Tamamlandi');
        document.getElementById('courier-task-history').innerHTML = history.length === 0 ? "<p style='color:var(--text-muted); text-align:center;'>Geçmiş iş bulunamadı.</p>" :
            history.map(t => `<div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);"><strong>${t.title}</strong><br><small>${t.origin} ➔ ${t.destination}</small></div>`).join('');
        document.getElementById('courierDetailModal').style.display = 'flex';
    };

    window.openCustomerDetailModal = (customerId, customerName) => {
        document.getElementById('detailCustomerName').innerText = customerName;
        const history = allTasks.filter(t => t.customer === customerId);
        document.getElementById('customer-task-history').innerHTML = history.length === 0 ? "<p style='color:var(--text-muted); text-align:center;'>Gönderim bulunamadı.</p>" :
            history.map(t => `<div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,0.05);"><strong>${t.title}</strong><br><small>${t.status.replace('_',' ')} | ${t.origin} ➔ ${t.destination}</small></div>`).join('');
        document.getElementById('customerDetailModal').style.display = 'flex';
    };

    // --- DİĞER İŞLEMLER ---
    window.deleteTask = (id) => { if(confirm("Kargoyu silmek istediğinize emin misiniz?")) fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, { method:'DELETE', headers:{'Authorization':'Bearer '+token}}).then(() => fetchTasks()); };
    
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

    window.loadPersonnelDropdown = () => {
        fetch('http://127.0.0.1:8000/api/users/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json()).then(data => {
            const users = data.results || data;
            const options = '<option value="">-- Kurye Seçin --</option>' + 
                users.filter(u => u.role === 'Personel').map(u => `<option value="${u.id}">${escapeHTML(u.full_name || u.username)}</option>`).join('');
            document.getElementById('updateTaskAssignee').innerHTML = options;
        });
    };

    const updateChart = (data) => {
        const ctx = document.getElementById('taskChart').getContext('2d');
        if(myChart) myChart.destroy();
        myChart = new Chart(ctx, { type:'doughnut', data:{ labels:['Yapılacak','Yolda','Bitti'], datasets:[{ data:[data.todo_tasks, data.ongoing_tasks, data.completed_tasks], backgroundColor:['#ff4e50','#facc15','#4ade80'], borderWidth:0 }]}, options:{ cutout:'75%', plugins:{ legend:{ display:false }}}});
    };

    const renderPerformance = (perf) => {
        const perfList = document.getElementById('performance-list');
        perfList.innerHTML = (perf && perf.length > 0) ? perf.map((p, i) => `<div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; margin-bottom:5px;"><span>#${i+1} ${p.username}</span><span style="color:var(--success);">${p.completed_count} Teslimat</span></div>`).join('') : "";
    };

    const escapeHTML = (s) => s ? s.toString().replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":"&#39;",'"':'&quot;'}[c])) : '';
    document.getElementById('logoutBtn').onclick = () => { localStorage.clear(); window.location.href="index.html"; };
    
    fetchStats(); fetchTasks();
});