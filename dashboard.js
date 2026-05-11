document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
    // --- GÜVENLİK VE TOKEN KONTROLÜ ---
    const isTokenExpired = (t) => {
        if (!t) return true;
        try {
            const payload = JSON.parse(atob(t.split('.')[1]));
            return (Date.now() >= payload.exp * 1000);
        } catch (e) { return true; }
    };

    if (!token || isTokenExpired(token)) {
        localStorage.clear(); sessionStorage.clear();
        window.location.href = "index.html"; return; 
    }

    let isAdmin = false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        isAdmin = (payload.role === 'Yonetici');
    } catch (e) { console.error(e); }

    const setupInactivityTimer = () => {
        let timeout;
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => { localStorage.clear(); window.location.href = "index.html"; }, 15 * 60 * 1000);
        };
        document.onmousemove = resetTimer; document.onkeypress = resetTimer;
    };
    setupInactivityTimer();

    // --- DEĞİŞKENLER VE GRAFİK ---
    let allTasks = [];
    let myChart = null;

    // --- İSTATİSTİKLER VE LİDERLİK ---
    const fetchDashboardStats = () => {
        fetch('http://127.0.0.1:8000/api/dashboard/summary/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json())
        .then(data => {
            document.getElementById('stat-total-projects').innerText = data.total_projects || 0;
            document.getElementById('stat-total-tasks').innerText = data.total_tasks || 0;
            document.getElementById('stat-completed-tasks').innerText = data.completed_tasks || 0;

            const ctx = document.getElementById('taskChart').getContext('2d');
            if (myChart) myChart.destroy();
            myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Yapılacak', 'Yolda', 'Bitti'],
                    datasets: [{ data: [data.todo_tasks||0, data.ongoing_tasks||0, data.completed_tasks||0], backgroundColor: ['#ff4e50', '#facc15', '#4ade80'], borderWidth: 0 }]
                },
                options: { maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 12 }}}}
            });

            const perfList = document.getElementById('performance-list');
            perfList.innerHTML = (data.performance && data.performance.length > 0) ? 
                data.performance.map((p, i) => `<div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.02); border-radius:10px; margin-bottom:5px;"><span>#${i+1} ${escapeHTML(p.username)}</span><span style="color:#4ade80;">${p.completed_count} Kargo</span></div>`).join('') : 
                "<p style='color:#94a3b8; font-size:12px;'>Veri bulunmuyor.</p>";
        });
    };

    // --- GÖREV LİSTELEME VE ONAY MANTIĞI ---
    const fetchTasks = () => {
        fetch('http://127.0.0.1:8000/api/tasks/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json())
        .then(data => {
            allTasks = data.results || data;
            renderList(allTasks);
        });
    };

    const renderList = (data) => {
        const pendingContainer = document.getElementById('pending-task-list');
        const taskContainer = document.getElementById('task-list');

        // Konsolda veriyi kontrol et (Hata ayıklama için)
        console.log("Gelen Tüm Görevler:", data);

        // Onay bekleyenleri filtrele (Hem 'Onay_Bekliyor' hem 'Onay Bekliyor' ihtimaline karşı)
        const pending = data.filter(t => 
            t.status === 'Onay_Bekliyor' || t.status === 'Onay Bekliyor'
        );
        
        // Diğer aktif görevleri filtrele
        const others = data.filter(t => 
            t.status !== 'Onay_Bekliyor' && t.status !== 'Onay Bekliyor'
        );

        // Onay Bekleyenler Listesi
        if (pending.length === 0) {
            pendingContainer.innerHTML = "<p style='color:#64748b; font-size:12px;'>Onay bekleyen yeni kargo talebi yok.</p>";
        } else {
            pendingContainer.innerHTML = pending.map(t => `
                <div class="item-row" style="background: rgba(250, 204, 21, 0.05); border-left: 4px solid var(--warning);">
                    <div>
                        <strong>[TALEP] ${escapeHTML(t.title)}</strong><br>
                        <small>${escapeHTML(t.origin || 'Adres Belirtilmemiş')} ➔ ${escapeHTML(t.destination || 'Adres Belirtilmemiş')}</small><br>
                        <small style="color: var(--warning);">Müşteri: ${escapeHTML(t.customer_name || 'Bilinmiyor')}</small>
                    </div>
                    <button onclick="openUpdateModal(${t.id}, '${t.status}', '${t.assigned_to || ''}')" class="add-btn" style="background: var(--warning); color: black; font-size: 11px; padding: 8px 15px;">Onayla & Ata</button>
                </div>
            `).join('');
        }

        // Aktif Görev Listesi (Yeni kargolar en üstte)
        taskContainer.innerHTML = others.length === 0 ? 
            "<p style='color:#64748b;'>Henüz onaylanmış görev yok.</p>" :
            others.map(t => `
                <div class="item-row">
                    <div>
                        <strong>[${escapeHTML(t.task_code)}] ${escapeHTML(t.title)}</strong><br>
                        <small>Kurye: ${escapeHTML(t.assignee_name)} | Durum: ${escapeHTML(t.status.replace('_',' '))}</small>
                    </div>
                    <div style="display:flex; gap:8px;">
                        <button onclick="openCommentModal(${t.id}, '${escapeHTML(t.title)}', '${escapeHTML(t.description)}')" class="status" style="background:#10b981; color:white; border:none; cursor:pointer;">Yorum</button>
                        <button onclick="openUpdateModal(${t.id}, '${escapeHTML(t.status)}', '${t.assigned_to || ''}')" class="status" style="background:#2563eb; color:white; border:none; cursor:pointer;">Güncelle</button>
                        ${isAdmin ? `<button onclick="deleteTask(${t.id})" class="status" style="background:#ef4444; color:white; border:none; cursor:pointer;">Sil</button>` : ''}
                    </div>
                </div>
            `).join('');
    };

    // --- PERSONEL LİSTESİ ---
    window.loadPersonnelDropdown = () => {
        fetch('http://127.0.0.1:8000/api/users/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json())
        .then(data => {
            const users = data.results || data;
            const options = '<option value="">-- Personel Seçin --</option>' + 
                users.filter(u => u.role === 'Personel').map(u => `<option value="${u.id}">${escapeHTML(u.full_name || u.username)}</option>`).join('');
            document.getElementById('taskAssignee').innerHTML = options;
            document.getElementById('updateTaskAssignee').innerHTML = options;
        });
    };

    // --- GÜNCELLEME / ONAY FORMU ---
    window.openUpdateModal = (taskId, status, assigneeId) => {
        document.getElementById('updateTaskId').value = taskId;
        document.getElementById('updateTaskStatus').value = status;
        document.getElementById('updateTaskAssignee').value = (assigneeId && assigneeId !== 'null') ? assigneeId : '';
        document.getElementById('updateModal').style.display = "flex";
    };

    document.getElementById('updateTaskForm').onsubmit = (e) => {
        e.preventDefault();
        const payload = {
            status: document.getElementById('updateTaskStatus').value,
            assigned_to: document.getElementById('updateTaskAssignee').value || null
        };
        fetch(`http://127.0.0.1:8000/api/tasks/${document.getElementById('updateTaskId').value}/`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify(payload)
        }).then(res => { if(res.ok) { document.getElementById('updateModal').style.display='none'; fetchTasks(); fetchDashboardStats(); }});
    };

    // --- BİLDİRİMLER ---
    const fetchNotifications = () => {
        fetch('http://127.0.0.1:8000/api/notifications/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json())
        .then(data => {
            const notifs = data.results || data;
            const unread = notifs.filter(n => !n.is_read).length;
            const countBadge = document.getElementById('notifCount');
            if(unread > 0) { countBadge.innerText = unread; countBadge.style.display = "block"; } else { countBadge.style.display = "none"; }
            document.getElementById('notifList').innerHTML = notifs.map(n => `<div style="font-size:12px; padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); ${!n.is_read ? 'background:rgba(255,78,80,0.05);' : ''}">${escapeHTML(n.message)}</div>`).join('');
        });
    };

    document.getElementById('notificationBell').onclick = (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('notifDropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        if(dropdown.style.display === 'block') fetchNotifications();
    };

    // --- LOGLAR ---
    const fetchLogs = () => {
        fetch('http://127.0.0.1:8000/api/logs/', { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json())
        .then(data => {
            const logs = data.results || data;
            document.getElementById('log-list').innerHTML = logs.map(l => `<div style="font-size:11px; padding:8px; border-bottom:1px solid rgba(255,255,255,0.05);"><span style="color:#4ade80;">[${new Date(l.created_at).toLocaleString()}]</span> <strong>${escapeHTML(l.user_name)}:</strong> ${escapeHTML(l.action)}</div>`).join('');
        });
    };

    // --- PROJE VE PERSONEL EKLEME ---
    document.getElementById('userAddForm').onsubmit = (e) => {
        e.preventDefault();
        const userData = { username: document.getElementById('addUsername').value, password: document.getElementById('addPassword').value, full_name: document.getElementById('addFullName').value, email: document.getElementById('addEmail').value, role: document.getElementById('addRole').value };
        fetch('http://127.0.0.1:8000/api/register/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData)})
        .then(res => { if(res.ok) { alert("Kaydedildi."); document.getElementById('userModal').style.display='none'; e.target.reset(); loadPersonnelDropdown(); }});
    };

    // --- YORUMLAR ---
    window.openCommentModal = (taskId, title, desc) => {
        document.getElementById('commentTaskId').value = taskId;
        document.getElementById('modalTaskTitle').innerText = title;
        document.getElementById('modalTaskDesc').innerText = desc || "";
        document.getElementById('commentModal').style.display = "flex";
        fetchComments(taskId);
    };

    const fetchComments = (tid) => {
        fetch(`http://127.0.0.1:8000/api/comments/?task_id=${tid}`, { headers: { 'Authorization': 'Bearer ' + token }})
        .then(res => res.json())
        .then(data => {
            const comments = data.results || data;
            document.getElementById('comment-list').innerHTML = comments.map(c => `<div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:8px; margin-bottom:8px; font-size:13px;"><strong>${escapeHTML(c.user_name)}:</strong> ${escapeHTML(c.content)}</div>`).join('');
        });
    };

    document.getElementById('addCommentForm').onsubmit = (e) => {
        e.preventDefault();
        const tid = document.getElementById('commentTaskId').value;
        fetch('http://127.0.0.1:8000/api/comments/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ task: tid, content: document.getElementById('commentContent').value })})
        .then(res => { if(res.ok) { document.getElementById('commentContent').value = ""; fetchComments(tid); }});
    };

    // --- DİĞER İŞLEMLER ---
    document.getElementById('createTaskForm').onsubmit = (e) => {
        e.preventDefault();
        const payload = { title: document.getElementById('taskTitle').value, project: document.getElementById('taskProject').value, priority: document.getElementById('taskPriority').value, assigned_to: document.getElementById('taskAssignee').value, status: "Yapilacak" };
        fetch('http://127.0.0.1:8000/api/tasks/', { method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body:JSON.stringify(payload)})
        .then(res => { if(res.ok) { document.getElementById('taskModal').style.display='none'; e.target.reset(); fetchTasks(); fetchDashboardStats(); }});
    };

    document.getElementById('searchInput').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        renderList(allTasks.filter(t => t.title.toLowerCase().includes(term) || t.task_code.toLowerCase().includes(term)));
    };

    window.deleteTask = (id) => { if(confirm("Silinsin mi?")) fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, { method:'DELETE', headers:{'Authorization':'Bearer '+token}}).then(() => { fetchTasks(); fetchDashboardStats(); }); };
    
    const escapeHTML = (s) => s ? s.toString().replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":"&#39;",'"':'&quot;'}[c])) : '';
    
    document.getElementById('logoutBtn').onclick = () => { localStorage.clear(); window.location.href="index.html"; };
    document.getElementById('openModalBtn').onclick = () => {
        fetch('http://127.0.0.1:8000/api/projects/', { headers:{'Authorization':'Bearer '+token}})
        .then(res => res.json()).then(data => {
            const projs = data.results || data;
            document.getElementById('taskProject').innerHTML = projs.map(p => `<option value="${p.id}" style="color:black;">${escapeHTML(p.name)}</option>`).join('');
            loadPersonnelDropdown();
            document.getElementById('taskModal').style.display='flex';
        });
    };

    document.getElementById('openLogModalBtn').onclick = () => { fetchLogs(); document.getElementById('logModal').style.display='flex'; };
    document.getElementById('closeModalBtn').onclick = () => document.getElementById('taskModal').style.display='none';
    document.getElementById('closeUpdateModalBtn').onclick = () => document.getElementById('updateModal').style.display='none';
    document.getElementById('closeLogModalBtn').onclick = () => document.getElementById('logModal').style.display='none';
    window.onclick = (e) => { if (e.target.className === 'modal') e.target.style.display = 'none'; };

    // Başlat
    fetchDashboardStats(); fetchTasks(); loadPersonnelDropdown();
    setInterval(fetchNotifications, 30000); // 30 sn'de bir bildirim kontrolü
});

function openProfileModal() {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/profile/', { headers: { 'Authorization': 'Bearer ' + token }})
    .then(res => res.json())
    .then(user => {
        document.getElementById('profileUsername').value = user.username;
        document.getElementById('profileFullName').value = user.full_name;
        document.getElementById('profileEmail').value = user.email;
        document.getElementById('profileModal').style.display = 'flex';
    });
}