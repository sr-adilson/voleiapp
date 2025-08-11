class DashboardManager {
    constructor({ membershipManager, paymentManager, attendanceManager }) {
        this.membershipManager = membershipManager;
        this.paymentManager = paymentManager;
        this.attendanceManager = attendanceManager;
        this.charts = {};
        this._initWhenReady();
    }

    _initWhenReady() {
        const start = () => {
            if (!document.getElementById('chartMembersByPosition')) { setTimeout(start, 150); return; }
            this.renderAll();
            // Atualiza quando dados mudarem (poll leve)
            setInterval(() => this.renderAll(), 60000);
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
    }

    renderAll() {
        this.renderMembersByPosition();
        this.renderRevenueChart();
        this.renderAttendanceChart();
    }

    // 1) Membros por posição
    renderMembersByPosition() {
        const members = this.membershipManager?.members || [];
        const positions = ['levantador','ponteiro','meio-de-rede','oposto','libero'];
        const labels = ['Levantador','Ponteiro','Meio de Rede','Oposto','Líbero'];
        const counts = positions.map(p => members.filter(m => (m.posicao||'').toLowerCase() === p).length);
        this._renderBar('chartMembersByPosition', labels, counts, {
            label: 'Quantidade',
            color: '#4f46e5'
        });
    }

    // 2) Receita vs Pendências (últimos 6 meses)
    renderRevenueChart() {
        const pm = this.paymentManager;
        if (!pm) return;
        const today = new Date();
        const months = [];
        const paidValues = [];
        const pendingValues = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = d.getMonth();
            const year = d.getFullYear();
            months.push(this._monthShort(month) + '/' + String(year).slice(2));
            const monthPayments = pm.payments.filter(p => {
                const dd = new Date(p.dueDate);
                return dd.getMonth() === month && dd.getFullYear() === year;
            });
            const paid = monthPayments.filter(p => p.status === 'paid').reduce((s,p)=>s+p.amount,0);
            const pend = monthPayments.filter(p => p.status !== 'paid').reduce((s,p)=>s+p.amount,0);
            paidValues.push(Number(paid.toFixed(2)));
            pendingValues.push(Number(pend.toFixed(2)));
        }
        this._renderLine('chartRevenue', months, [
            { label: 'Pago', data: paidValues, color: '#10b981' },
            { label: 'Pendente/Atraso', data: pendingValues, color: '#ef4444' }
        ]);
    }

    // 3) Presença por mês (percentual)
    renderAttendanceChart() {
        const am = this.attendanceManager;
        const mm = this.membershipManager;
        if (!am || !mm) return;
        const today = new Date();
        const labels = [];
        const percent = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = d.getMonth();
            const year = d.getFullYear();
            labels.push(this._monthShort(month) + '/' + String(year).slice(2));
            const monthSessions = am.sessions.filter(s => {
                const dd = new Date(s.date + 'T00:00:00');
                return dd.getMonth() === month && dd.getFullYear() === year;
            });
            const totalMembers = mm.members.length || 1;
            let presentCount = 0;
            let totalMarks = 0;
            monthSessions.forEach(s => {
                mm.members.forEach(m => {
                    const st = s.attendance[m.id];
                    if (st) {
                        totalMarks += 1;
                        if (st === 'present') presentCount += 1;
                    }
                });
            });
            const pct = totalMarks > 0 ? (presentCount/totalMarks)*100 : 0;
            percent.push(Number(pct.toFixed(1)));
        }
        this._renderLine('chartAttendance', labels, [
            { label: 'Presença (%)', data: percent, color: '#3b82f6' }
        ]);
    }

    // Helpers Chart.js
    _renderBar(canvasId, labels, data, { label, color }) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        const old = this.charts[canvasId];
        if (old) old.destroy();
        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    backgroundColor: color + 'cc',
                    borderColor: color,
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
    }

    _renderLine(canvasId, labels, datasets) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;
        const old = this.charts[canvasId];
        if (old) old.destroy();
        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data,
                    borderColor: ds.color,
                    backgroundColor: ds.color + '33',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 2
                }))
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    }

    _monthShort(i) { return ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][i] || ''; }
}

(function initDashboard(){
    const start = () => {
        if (!window.membershipManager) { setTimeout(start, 150); return; }
        window.dashboardManager = new DashboardManager({
            membershipManager: window.membershipManager,
            paymentManager: window.paymentManager,
            attendanceManager: window.attendanceManager
        });
    };
    start();
})();