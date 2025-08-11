class NotificationsManager {
    constructor({ membershipManager, paymentManager, attendanceManager }) {
        this.membershipManager = membershipManager;
        this.paymentManager = paymentManager;
        this.attendanceManager = attendanceManager;
        this.reminders = [];
        this._start();
    }

    _start() {
        const start = () => {
            if (!document.getElementById('notificationsList')) { setTimeout(start, 200); return; }
            this.runChecks();
            // Checagem a cada 6 horas
            setInterval(() => this.runChecks(), 6 * 60 * 60 * 1000);
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
    }

    runChecks(showToast = false) {
        this.reminders = [];
        this._checkPayments();
        this._checkTodayTrainings();
        this.render();
        if (showToast && window.membershipManager) {
            window.membershipManager.showAlert('Verificação de lembretes concluída.', 'success');
        }
    }

    _checkPayments() {
        const pm = this.paymentManager;
        if (!pm) return;
        const today = new Date();
        const inThreeDays = new Date(Date.now() + 3*24*60*60*1000);
        pm.payments.forEach(p => {
            const due = new Date(p.dueDate);
            const member = this.membershipManager.members.find(m => m.id === p.memberId);
            if (!member) return;
            if (p.status === 'overdue') {
                const days = Math.ceil((today - due) / (1000*60*60*24));
                this.reminders.push({
                    type: 'payment', level: 'overdue',
                    title: `Pagamento em atraso: ${member.nome}`,
                    description: `Atraso de ${days} dia(s). Valor: R$ ${p.amount.toFixed(2)}.`,
                    icon: 'fa-exclamation-triangle'
                });
            } else if (p.status === 'pending' && due <= inThreeDays && due >= today) {
                const days = Math.ceil((due - today) / (1000*60*60*24));
                this.reminders.push({
                    type: 'payment', level: 'due-soon',
                    title: `Vencimento em ${days} dia(s): ${member.nome}`,
                    description: `Valor: R$ ${p.amount.toFixed(2)}.`,
                    icon: 'fa-clock'
                });
            }
        });
    }

    _checkTodayTrainings() {
        const am = this.attendanceManager;
        if (!am) return;
        const todayStr = new Date().toISOString().split('T')[0];
        am.sessions.filter(s => s.date === todayStr).forEach(s => {
            this.reminders.push({
                type: 'training', level: 'today',
                title: `Treino hoje às ${s.time}`,
                description: `Local: ${s.location}${s.notes ? ' • ' + s.notes : ''}`,
                icon: 'fa-calendar-day'
            });
        });
    }

    render() {
        const list = document.getElementById('notificationsList');
        if (!list) return;
        if (this.reminders.length === 0) {
            list.innerHTML = `
                <div class="payments-empty">
                    <i class="fas fa-bell-slash"></i>
                    <h3>Nenhum lembrete no momento</h3>
                    <p>Use "Verificar Agora" para atualizar manualmente.</p>
                </div>
            `;
            return;
        }
        list.innerHTML = this.reminders.map(r => this._renderItem(r)).join('');
    }

    _renderItem(r) {
        const cls = r.level === 'overdue' ? 'overdue' : r.level === 'due-soon' ? 'due-soon' : 'today';
        return `
            <div class="notification-item ${cls}">
                <span class="icon"><i class="fas ${r.icon}"></i></span>
                <div class="content">
                    <div class="title">${r.title}</div>
                    <div class="desc">${r.description}</div>
                </div>
            </div>
        `;
    }

    exportReminders() {
        const data = { generatedAt: new Date().toISOString(), reminders: this.reminders };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lembretes_volei_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

(function initNotifications(){
    const start = () => {
        if (!window.membershipManager) { setTimeout(start, 150); return; }
        window.notificationsManager = new NotificationsManager({
            membershipManager: window.membershipManager,
            paymentManager: window.paymentManager,
            attendanceManager: window.attendanceManager
        });
    };
    start();
})();