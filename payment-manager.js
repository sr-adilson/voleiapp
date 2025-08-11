// Sistema de Gerenciamento de Pagamentos
class Payment {
    constructor(memberId, amount, dueDate, status = 'pending') {
        this.id = Date.now() + Math.random().toString(36).substr(2, 9);
        this.memberId = memberId;
        this.amount = amount;
        this.dueDate = dueDate;
        this.paymentDate = null;
        this.status = status; // pending, paid, overdue, cancelled
        this.paymentMethod = null;
        this.notes = '';
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    markAsPaid(paymentMethod = 'cash', notes = '') {
        this.status = 'paid';
        this.paymentDate = new Date().toISOString();
        this.paymentMethod = paymentMethod;
        this.notes = notes;
        this.updatedAt = new Date().toISOString();
    }

    markAsOverdue() {
        if (this.status === 'pending') {
            this.status = 'overdue';
            this.updatedAt = new Date().toISOString();
        }
    }

    isOverdue() {
        return new Date(this.dueDate) < new Date() && this.status === 'pending';
    }

    getDaysOverdue() {
        if (this.status !== 'pending') return 0;
        const due = new Date(this.dueDate);
        const today = new Date();
        const diffTime = today - due;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getStatusColor() {
        switch (this.status) {
            case 'paid': return 'success';
            case 'overdue': return 'danger';
            case 'pending': return 'warning';
            case 'cancelled': return 'secondary';
            default: return 'info';
        }
    }

    getStatusText() {
        switch (this.status) {
            case 'paid': return 'Pago';
            case 'overdue': return 'Em Atraso';
            case 'pending': return 'Pendente';
            case 'cancelled': return 'Cancelado';
            default: return 'Desconhecido';
        }
    }
}

class PaymentManager {
    constructor(membershipManager) {
        this.payments = [];
        this.membershipManager = membershipManager;
        this.loadPayments();
        this.initializePaymentSystem();
    }

    // Inicializar sistema de pagamentos
    initializePaymentSystem() {
        this.generateMonthlyPayments();
        this.checkOverduePayments();
        this.setupAutoChecks();
    }

    // Gerar pagamentos mensais para todos os membros
    generateMonthlyPayments() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        this.membershipManager.members.forEach(member => {
            // Verificar se já existe pagamento para este mês
            const existingPayment = this.payments.find(p => 
                p.memberId === member.id && 
                new Date(p.dueDate).getMonth() === currentMonth &&
                new Date(p.dueDate).getFullYear() === currentYear
            );

            if (!existingPayment) {
                const dueDate = new Date(currentYear, currentMonth, 5); // Vencimento no dia 5
                const payment = new Payment(member.id, member.mensalidade, dueDate.toISOString());
                this.payments.push(payment);
            }
        });

        this.savePayments();
    }

    // Verificar pagamentos em atraso
    checkOverduePayments() {
        this.payments.forEach(payment => {
            if (payment.isOverdue()) {
                payment.markAsOverdue();
            }
        });
        this.savePayments();
    }

    // Configurar verificações automáticas
    setupAutoChecks() {
        // Verificar pagamentos em atraso diariamente
        setInterval(() => {
            this.checkOverduePayments();
        }, 24 * 60 * 60 * 1000); // 24 horas

        // Gerar novos pagamentos mensais
        setInterval(() => {
            this.generateMonthlyPayments();
        }, 60 * 60 * 1000); // 1 hora
    }

    // Adicionar pagamento manual
    addPayment(memberId, amount, dueDate, notes = '') {
        const payment = new Payment(memberId, amount, dueDate, 'pending');
        if (notes) payment.notes = notes;
        this.payments.push(payment);
        this.savePayments();
        return payment;
    }

    // Marcar pagamento como pago
    markPaymentAsPaid(paymentId, paymentMethod = 'cash', notes = '') {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment) {
            payment.markAsPaid(paymentMethod, notes);
            this.savePayments();
            return true;
        }
        return false;
    }

    // Cancelar pagamento
    cancelPayment(paymentId, reason = '') {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment) {
            payment.status = 'cancelled';
            payment.notes = reason;
            payment.updatedAt = new Date().toISOString();
            this.savePayments();
            return true;
        }
        return false;
    }

    // Buscar pagamentos por membro
    getPaymentsByMember(memberId) {
        return this.payments.filter(p => p.memberId === memberId);
    }

    // Buscar pagamentos por status
    getPaymentsByStatus(status) {
        return this.payments.filter(p => p.status === status);
    }

    // Buscar pagamentos em atraso
    getOverduePayments() {
        return this.payments.filter(p => p.isOverdue());
    }

    // Calcular estatísticas financeiras
    getFinancialStats() {
        const totalRevenue = this.payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingRevenue = this.payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

        const overdueRevenue = this.payments
            .filter(p => p.status === 'overdue')
            .reduce((sum, p) => sum + p.amount, 0);

        const totalPayments = this.payments.length;
        const paidPayments = this.payments.filter(p => p.status === 'paid').length;
        const overduePayments = this.payments.filter(p => p.status === 'overdue').length;

        return {
            totalRevenue: totalRevenue.toFixed(2),
            pendingRevenue: pendingRevenue.toFixed(2),
            overdueRevenue: overdueRevenue.toFixed(2),
            totalPayments,
            paidPayments,
            overduePayments,
            paymentRate: totalPayments > 0 ? ((paidPayments / totalPayments) * 100).toFixed(1) : 0
        };
    }

    // Gerar relatório mensal
    generateMonthlyReport(month, year) {
        const monthPayments = this.payments.filter(p => {
            const paymentDate = new Date(p.dueDate);
            return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
        });

        const stats = {
            month: month + 1,
            year: year,
            total: monthPayments.length,
            paid: monthPayments.filter(p => p.status === 'paid').length,
            pending: monthPayments.filter(p => p.status === 'pending').length,
            overdue: monthPayments.filter(p => p.status === 'overdue').length,
            revenue: monthPayments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)
        };

        return stats;
    }

    // Salvar pagamentos no localStorage
    savePayments() {
        localStorage.setItem('volleyball_payments', JSON.stringify(this.payments));
    }

    // Carregar pagamentos do localStorage
    loadPayments() {
        const saved = localStorage.getItem('volleyball_payments');
        if (saved) {
            this.payments = JSON.parse(saved).map(p => {
                const payment = new Payment(p.memberId, p.amount, p.dueDate, p.status);
                Object.assign(payment, p);
                return payment;
            });
        }
    }

    // Exportar dados de pagamentos
    exportPaymentData() {
        const data = {
            payments: this.payments,
            stats: this.getFinancialStats(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pagamentos_volei_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Importar dados de pagamentos
    importPaymentData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.payments && Array.isArray(data.payments)) {
                        this.payments = data.payments.map(p => {
                            const payment = new Payment(p.memberId, p.amount, p.dueDate, p.status);
                            Object.assign(payment, p);
                            return payment;
                        });
                        this.savePayments();
                        resolve('Dados de pagamentos importados com sucesso!');
                    } else {
                        reject('Formato de arquivo inválido');
                    }
                } catch (error) {
                    reject('Erro ao processar arquivo: ' + error.message);
                }
            };
            reader.onerror = () => reject('Erro ao ler arquivo');
            reader.readAsText(file);
        });
    }
}