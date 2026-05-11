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

        // Panele göre veriyi yenile
        if (panelId === 'kurye-panel' || panelId === 'musteri-panel') fetchUsers();
        if (panelId === 'kargo-panel') { fetchTasks(); fetchStats(); }
    };

    // --- VERİ ÇEKME FONKSİYONLARI ---
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

        // Kurye listesinde Detay butonu openCourierDetailModal'ı çağırır
        document.getElementById('courier-list').innerHTML = kuryeler.map(u => `
            <div class="item-row">
                <div><strong>${escapeHTML(u.full_name)}</strong><br><small>${u.email} | ${u.phone || 'Tel yok'}</small></div>
                <button onclick="openCourierDetailModal(${u.id}, '${escapeHTML(u.full_name)}')" class="badge" style="background:var(--primary);">GEÇMİŞ İŞLER</button>
            </div>`).join('');
            
        document.getElementById('customer-list').innerHTML = musteriler.map(u => `<div class="item-row"><div><strong>${escapeHTML(u.full_name)}</strong><br><small>${u.email}</small></div><button class="badge" style="background:#64748b;">Görüntüle</button></div>`).join('');
    };

    const renderPerformance = (perf) => {
        const perfList = document.getElementById('performance-list');
        perfList.innerHTML = (perf && perf.length > 0) ? 
            perf.map((p, i) => `<div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; margin-bottom:5px; border:1px solid rgba(255,255,255,0.05);"><span>#${i+1} ${escapeHTML(p.username)}</span><span style="color:var(--success);">${p.completed_count} Teslimat</span></div>`).join('') :
            "<p style='color:var(--text-muted); font-size:12px;'>Veri yok.</p>";
    };

    // --- KURYE GEÇMİŞİ MODALI (YENİ) ---
    window.openCourierDetailModal = (courierId, courierName) => {
        document.getElementById('detailCourierName').innerText = courierName;
        const historyContainer = document.getElementById('courier-task-history');
        
        // allTasks içinden bu kuryeye atanmış ve TAMAMLANMIŞ olanları filtrele
        const history = allTasks.filter(t => t.assigned_to === courierId && t.status === 'Tamamlandi');

        if (history.length === 0) {
            historyContainer.innerHTML = "<p style='color:var(--text-muted); text-align:center; padding:20px;'>Bu kuryeye ait tamamlanmış iş bulunamadı.</p>";
        } else {
            historyContainer.innerHTML = history.map(t => `
                <div style="background:rgba(255,255,255,0.02); padding:15px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong>${escapeHTML(t.title)}</strong>
                        <span style="color:var(--success); font-size:11px;">${t.task_code}</span>
                    </div>
                    <small style="color:var(--text-muted);">${escapeHTML(t.origin)} ➔ ${escapeHTML(t.destination)}</small>
                </div>
            `).join('');
        }
        document.getElementById('courierDetailModal').style.display = 'flex';
    };

    // --- DİĞER YARDIMCI FONKSİYONLAR ---
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
            document.getElementById('taskAssignee').innerHTML = options;
            document.getElementById('updateTaskAssignee').innerHTML = options;
        });
    };

    const updateChart = (data) => {
        const ctx = document.getElementById('taskChart').getContext('2d');
        if(myChart) myChart.destroy();
        myChart = new Chart(ctx, { type:'doughnut', data:{ labels:['Yapılacak','Yolda','Bitti'], datasets:[{ data:[data.todo_tasks, data.ongoing_tasks, data.completed_tasks], backgroundColor:['#ff4e50','#facc15','#4ade80'], borderWidth:0 }]}, options:{ cutout:'75%', plugins:{ legend:{ display:false }}}});
    };

    const escapeHTML = (s) => s ? s.toString().replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":"&#39;",'"':'&quot;'}[c])) : '';
    document.getElementById('logoutBtn').onclick = () => { localStorage.clear(); window.location.href="index.html"; };
    
    // Başlangıç yüklemesi
    fetchStats(); fetchTasks();
});