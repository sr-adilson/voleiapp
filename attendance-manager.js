// Sistema de Treinos e Presenças
class TrainingSession {
    constructor({ id, date, time, location, notes }) {
        this.id = id || (Date.now() + Math.random().toString(36).slice(2, 8));
        this.date = date; // YYYY-MM-DD
        this.time = time; // HH:MM
        this.location = location;
        this.notes = notes || '';
        this.createdAt = new Date().toISOString();
        this.attendance = {}; // memberId -> 'present' | 'absent' | 'justified'
    }
}

class AttendanceManager {
    constructor(membershipManager) {
        this.membershipManager = membershipManager;
        this.sessions = [];
        this.loadSessions();
    }

    addSession(sessionData) {
        const { date, time, location } = sessionData;
        if (!date || !time || !location) {
            this._alert('Preencha data, horário e local.', 'error');
            return null;
        }
        const session = new TrainingSession(sessionData);
        this.sessions.push(session);
        this.saveSessions();
        this.renderSessions();
        this._alert('Treino adicionado!', 'success');
        return session;
    }

    deleteSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;
        if (!confirm('Excluir este treino?')) return;
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        this.saveSessions();
        this.renderSessions();
        this._alert('Treino excluído.', 'success');
    }

    toggleAttendance(sessionId, memberId, status) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;
        session.attendance[memberId] = status; // 'present' | 'absent' | 'justified'
        this.saveSessions();
        this.renderSessions();
    }

    getStats(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return { present: 0, absent: 0, justified: 0, total: 0 };
        const values = Object.values(session.attendance);
        const present = values.filter(v => v === 'present').length;
        const absent = values.filter(v => v === 'absent').length;
        const justified = values.filter(v => v === 'justified').length;
        const total = this.membershipManager?.members?.length || 0;
        return { present, absent, justified, total };
    }

    // Persistence
    saveSessions() {
        localStorage.setItem('volleyball_sessions', JSON.stringify(this.sessions));
    }

    loadSessions() {
        const raw = localStorage.getItem('volleyball_sessions');
        if (raw) {
            const parsed = JSON.parse(raw);
            this.sessions = parsed.map(s => Object.assign(new TrainingSession({}), s));
        }
    }

    // UI helpers
    _el(id) { return document.getElementById(id); }
    _alert(msg, type = 'info') {
        if (window.membershipManager && typeof window.membershipManager.showAlert === 'function') {
            window.membershipManager.showAlert(msg, type);
        } else {
            console.log(`[${type}]`, msg);
        }
    }

    initializeUI() {
        const form = this._el('sessionForm');
        if (!form) return; // UI not present
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            this.addSession({
                date: data.date,
                time: data.time,
                location: data.location,
                notes: (data.notes || '').trim()
            });
            form.reset();
        });
        this.renderSessions();
        this.populateMonthYearFilters();
        const monthSel = this._el('attendanceMonthFilter');
        const yearSel = this._el('attendanceYearFilter');
        if (monthSel && yearSel) {
            monthSel.addEventListener('change', () => this.renderSessions());
            yearSel.addEventListener('change', () => this.renderSessions());
        }
    }

    populateMonthYearFilters() {
        const yearSel = this._el('attendanceYearFilter');
        const monthSel = this._el('attendanceMonthFilter');
        if (!yearSel || !monthSel) return;
        if (!yearSel.dataset.ready) {
            const currentYear = new Date().getFullYear();
            for (let y = currentYear - 1; y <= currentYear + 1; y++) {
                const opt = document.createElement('option');
                opt.value = String(y);
                opt.textContent = String(y);
                if (y === currentYear) opt.selected = true;
                yearSel.appendChild(opt);
            }
            yearSel.dataset.ready = '1';
        }
        if (!monthSel.dataset.ready) {
            const currentMonth = new Date().getMonth();
            Array.from({ length: 12 }).forEach((_, i) => {
                const opt = document.createElement('option');
                opt.value = String(i);
                opt.textContent = this._monthName(i);
                if (i === currentMonth) opt.selected = true;
                monthSel.appendChild(opt);
            });
            monthSel.dataset.ready = '1';
        }
    }

    _monthName(i) {
        const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        return names[i] || '';
    }

    renderSessions() {
        const container = this._el('sessionsList');
        if (!container) return;
        const yearSel = this._el('attendanceYearFilter');
        const monthSel = this._el('attendanceMonthFilter');
        const month = monthSel ? parseInt(monthSel.value) : null;
        const year = yearSel ? parseInt(yearSel.value) : null;

        let sessions = this.sessions.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        if (!isNaN(month) && !isNaN(year)) {
            sessions = sessions.filter(s => {
                const d = new Date(s.date + 'T00:00:00');
                return d.getMonth() === month && d.getFullYear() === year;
            });
        }

        if (sessions.length === 0) {
            container.innerHTML = `
                <div class="payments-empty">
                    <i class="fas fa-calendar"></i>
                    <h3>Nenhum treino para o período</h3>
                    <p>Adicione um novo treino usando o formulário acima.</p>
                </div>
            `;
            return;
        }

        const members = this.membershipManager?.members || [];
        container.innerHTML = sessions.map(s => this._renderSessionItem(s, members)).join('');
    }

    _renderSessionItem(session, members) {
        const stats = this.getStats(session.id);
        const memberRows = members.map(m => this._renderMemberAttendanceRow(session, m)).join('');
        return `
            <div class="session-item">
                <div class="session-header">
                    <div class="session-info">
                        <div class="session-title">
                            <i class="fas fa-dumbbell"></i>
                            <strong>${this._formatDate(session.date)} ${session.time}</strong> • ${session.location}
                        </div>
                        ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ''}
                    </div>
                    <div class="session-actions">
                        <div class="session-stats">
                            <span class="present">P: ${stats.present}</span>
                            <span class="absent">F: ${stats.absent}</span>
                            <span class="justified">J: ${stats.justified}</span>
                            <span class="total">Total: ${stats.total}</span>
                        </div>
                        <button class="btn btn-danger" onclick="attendanceManager.deleteSession('${session.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="attendance-table">
                    <div class="attendance-header">
                        <span>Jogador</span>
                        <span>Presenças</span>
                    </div>
                    ${memberRows}
                </div>
            </div>
        `;
    }

    _renderMemberAttendanceRow(session, member) {
        const status = session.attendance[member.id] || '';
        const button = (key, label, cls) => `
            <button class="att-btn ${cls} ${status===key?'active':''}" onclick="attendanceManager.toggleAttendance('${session.id}','${member.id}','${key}')">${label}</button>
        `;
        return `
            <div class="attendance-row">
                <span class="att-name">${member.nome}</span>
                <span class="att-buttons">
                    ${button('present','Presente','present')}
                    ${button('absent','Falta','absent')}
                    ${button('justified','Justificada','justified')}
                </span>
            </div>
        `;
    }

    _formatDate(iso) {
        const [y,m,d] = iso.split('-');
        return `${d}/${m}/${y}`;
    }
}

// Inicialização segura aguardando membershipManager
(function waitForManagers(){
    const start = () => {
        if (!window.membershipManager) { setTimeout(start, 100); return; }
        window.attendanceManager = new AttendanceManager(window.membershipManager);
        // Inicializa UI após DOM pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => attendanceManager.initializeUI());
        } else {
            attendanceManager.initializeUI();
        }
    };
    start();
})();