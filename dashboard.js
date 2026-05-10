document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token');
    if (!token) { window.location.href = "index.html"; return; }

    let allTasks = []; 

    const fetchDashboardStats = () => {
        fetch('http://127.0.0.1:8000/api/dashboard/summary/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            document.getElementById('stat-total-projects').innerText = data.total_projects;
            document.getElementById('stat-total-tasks').innerText = data.total_tasks;
            document.getElementById('stat-completed-tasks').innerText = data.completed_tasks;
        });
    };

    const fetchTasks = () => {
        fetch('http://127.0.0.1:8000/api/tasks/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            // Sayfalama (Pagination) kontrolü
            allTasks = data.results ? data.results : data;
            renderList(allTasks);
        });
    };

    // XSS Koruması için verileri zararsız hale getiren fonksiyon
    const escapeHTML = (str) => {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    };

    const renderList = (data) => {
        const container = document.getElementById('task-list');
        // task_code, title, vb. zararlı scriptleri engellemek için escapeHTML'den geçirildi
        container.innerHTML = data.slice(-10).reverse().map(t => `
            <div class="item-row">
                <div>
                    <strong>[${escapeHTML(t.task_code)}] ${escapeHTML(t.title)}</strong><br>
                    <small>Proje: ${escapeHTML(t.project_name)} | Atanan: ${escapeHTML(t.assigned_to_name) || 'Atanmadı'}</small>
                </div>
                <div class="status ${t.status === 'Tamamlandi' ? 'delivered' : 'in-transit'}">
                    ${escapeHTML(t.status.replace('_', ' '))}
                </div>
            </div>
        `).join('');
    };

    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allTasks.filter(t => t.title.toLowerCase().includes(term) || t.task_code.toLowerCase().includes(term));
        renderList(filtered);
    });

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.clear();
        window.location.href = "index.html";
    };

    fetchDashboardStats();
    fetchTasks();
    setInterval(fetchTasks, 10000); // Sunucuyu yormamak için 10 saniyeye çekildi
});