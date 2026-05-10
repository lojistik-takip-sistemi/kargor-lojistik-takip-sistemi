document.addEventListener("DOMContentLoaded", function() {
    // --- TOKEN VE GÜVENLİK ---
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    
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

    const setupInactivityTimer = () => {
        let timeout;
        const limit = 15 * 60 * 1000; // 15 dakika

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

    // --- LİSTELEME (READ) İŞLEMLERİ ---
    let allTasks = []; 

    const fetchDashboardStats = () => {
        fetch('http://127.0.0.1:8000/api/dashboard/summary/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('stat-total-projects').innerText = data.total_projects || 0;
            document.getElementById('stat-total-tasks').innerText = data.total_tasks || 0;
            document.getElementById('stat-completed-tasks').innerText = data.completed_tasks || 0;
        });
    };

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

    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag] || tag)
        );
    };

    const renderList = (data) => {
        const container = document.getElementById('task-list');
        if (data.length === 0) {
            container.innerHTML = "<p style='color: #94a3b8;'>Henüz hiçbir görev bulunmuyor.</p>";
            return;
        }
        
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
                    <button onclick="openUpdateModal(${t.id}, '${escapeHTML(t.status)}')" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Güncelle</button>
                    <button onclick="deleteTask(${t.id})" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;">Sil</button>
                </div>
            </div>
        `).join('');
    };

    // --- ARAMA İŞLEMİ ---
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allTasks.filter(t => 
            (t.title && t.title.toLowerCase().includes(term)) || 
            (t.task_code && t.task_code.toLowerCase().includes(term))
        );
        renderList(filtered);
    });

    // --- YENİ GÖREV EKLEME (CREATE) ---
    const taskModal = document.getElementById('taskModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const createTaskForm = document.getElementById('createTaskForm');

    if (openModalBtn) openModalBtn.onclick = () => taskModal.style.display = "flex";
    if (closeModalBtn) closeModalBtn.onclick = () => taskModal.style.display = "none";

    if (createTaskForm) {
        createTaskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = payload.user_id;

            const newTask = {
                title: document.getElementById('taskTitle').value,
                project: document.getElementById('taskProject').value,
                priority: document.getElementById('taskPriority').value,
                status: "Yapilacak",
                assigned_to: currentUserId
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
                    createTaskForm.reset(); 
                    fetchTasks(); 
                    fetchDashboardStats(); 
                    alert("Görev başarıyla oluşturuldu!");
                } else {
                    res.json().then(err => alert("Hata: Lütfen geçerli bir Proje ID girdiğinizden emin olun. (" + JSON.stringify(err) + ")"));
                }
            });
        });
    }

    // --- GÖREV GÜNCELLEME (UPDATE) ---
    const updateModal = document.getElementById('updateModal');
    const closeUpdateModalBtn = document.getElementById('closeUpdateModalBtn');
    const updateTaskForm = document.getElementById('updateTaskForm');

    if (closeUpdateModalBtn) closeUpdateModalBtn.onclick = () => updateModal.style.display = "none";

    window.openUpdateModal = (taskId, currentStatus) => {
        document.getElementById('updateTaskId').value = taskId;
        document.getElementById('updateTaskStatus').value = currentStatus;
        updateModal.style.display = "flex";
    };

    if (updateTaskForm) {
        updateTaskForm.addEventListener('submit', function(e) {
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
                    alert("Görev durumu başarıyla güncellendi!");
                } else {
                    alert("Güncelleme başarısız oldu.");
                }
            });
        });
    }

    // --- GÖREV SİLME (DELETE) ---
    window.deleteTask = (taskId) => {
        if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) return;

        fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => {
            if (res.ok) {
                alert("Görev başarıyla silindi!");
                fetchTasks(); 
                fetchDashboardStats(); 
            } else {
                alert("Görevi silerken bir hata oluştu.");
            }
        });
    };

    // Modal dışına tıklayınca pencereleri kapatma
    window.onclick = (e) => { 
        if (e.target == taskModal) taskModal.style.display = "none"; 
        if (e.target == updateModal) updateModal.style.display = "none"; 
    }

    // --- ÇIKIŞ YAPMA İŞLEMİ ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "index.html";
        };
    }

    // --- BAŞLANGIÇ ÇAĞRILARI ---
    fetchDashboardStats();
    fetchTasks();
    setInterval(fetchTasks, 10000); // 10 saniyede bir listeyi otomatik yenile
});