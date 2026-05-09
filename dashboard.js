document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('access_token');
    if (!token) { window.location.href = "index.html"; return; }

    let allShipments = []; // Filtreleme için tüm veriyi tutacağız

    // --- 1. VERİ ÇEKME VE GRAFİK ---
    const fetchData = () => {
        fetch('http://127.0.0.1:8000/api/shipments/', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(res => res.json())
        .then(data => {
            allShipments = data;
            updateUI(data);
            renderChart(data);
        });
    };

    const updateUI = (data) => {
        document.getElementById('stat-total').innerText = data.length;
        const delivered = data.filter(s => s.current_status.toLowerCase().includes('teslim')).length;
        document.getElementById('stat-delivered').innerText = delivered;
        renderList(data);
    };

    const renderList = (data) => {
        const container = document.getElementById('shipment-list');
        container.innerHTML = data.slice(-10).reverse().map(s => `
            <div class="item-row">
                <div><strong>${s.tracking_number}</strong><br><small>Ağırlık: ${s.weight_kg}kg</small></div>
                <div class="status ${s.current_status.includes('Teslim') ? 'delivered' : 'in-transit'}">${s.current_status}</div>
            </div>
        `).join('');
    };

    // --- 2. ARAMA ÖZELLİĞİ ---
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allShipments.filter(s => s.tracking_number.toLowerCase().includes(term));
        renderList(filtered);
    });

    // --- 3. GRAFİK ÖZELLİĞİ (Chart.js) ---
    const renderChart = (data) => {
        const ctx = document.getElementById('myChart').getContext('2d');
        const delivered = data.filter(s => s.current_status.includes('Teslim')).length;
        const waiting = data.length - delivered;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Teslim Edilen', 'Bekleyen'],
                datasets: [{
                    data: [delivered, waiting],
                    backgroundColor: ['#22c55e', '#ff4e50'],
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { display: false } }, cutout: '70%' }
        });
    };

    // --- 4. MODAL VE ÇIKIŞ (Öncekiyle aynı) ---
    const modal = document.getElementById('kargoModal');
    document.getElementById('openModalBtn').onclick = () => modal.style.display = 'flex';
    document.getElementById('closeModal').onclick = () => modal.style.display = 'none';

    document.getElementById('kargoForm').onsubmit = (e) => {
        e.preventDefault();
        const body = {
            tracking_number: document.getElementById('track_no').value,
            weight_kg: parseFloat(document.getElementById('weight').value),
            origin_branch: parseInt(document.getElementById('branch_id').value),
            sender: parseInt(document.getElementById('sender_id').value),
            receiver: parseInt(document.getElementById('receiver_id').value),
            current_status: "Şubede Bekliyor"
        };
        fetch('http://127.0.0.1:8000/api/shipments/', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }).then(() => { modal.style.display = 'none'; fetchData(); });
    };

    fetchData();
    setInterval(fetchData, 5000); // 5 saniyede bir otomatik yenile (Canlı Takip için)
});