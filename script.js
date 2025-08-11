// Classe para gerenciar os dados dos mensalistas
class MembershipManager {
    constructor() {
        this.members = [];
        this.loadMembers();
        this.initializeEventListeners();
        this.updateStats();
        this.displayMembers();
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Formulário de cadastro
        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMember();
        });

        // Formulário de edição
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateMember();
        });

        // Busca de membros
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchMembers(e.target.value);
        });

        // Modal de edição
        const modal = document.getElementById('editModal');
        const closeModal = document.querySelector('.close');
        
        closeModal.addEventListener('click', () => {
            this.closeEditModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditModal();
            }
        });

        // Máscara para telefone
        document.getElementById('telefone').addEventListener('input', this.formatPhone);
        document.getElementById('editTelefone').addEventListener('input', this.formatPhone);

        // Set default date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dataInicio').value = today;
    }

    // Validar formulário
    validateForm(formData) {
        const errors = [];

        if (!formData.nome || formData.nome.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (!this.validateEmail(formData.email)) {
            errors.push('E-mail inválido');
        }

        if (!this.validatePhone(formData.telefone)) {
            errors.push('Telefone inválido');
        }

        if (!formData.idade || formData.idade < 14 || formData.idade > 80) {
            errors.push('Idade deve estar entre 14 e 80 anos');
        }

        if (!formData.mensalidade || formData.mensalidade <= 0) {
            errors.push('Valor da mensalidade deve ser maior que zero');
        }

        if (!formData.dataInicio) {
            errors.push('Data de início é obrigatória');
        }

        return errors;
    }

    // Validar e-mail
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar telefone
    validatePhone(phone) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    // Formatar telefone
    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value.replace(/(\d{0,2})/, '($1');
            } else if (value.length <= 6) {
                value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
            } else if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
            }
        }
        
        e.target.value = value;
    }

    // Adicionar novo membro
    addMember() {
        const formData = this.getFormData('registrationForm');
        const errors = this.validateForm(formData);

        if (errors.length > 0) {
            this.showAlert('Erro de validação:\n• ' + errors.join('\n• '), 'error');
            return;
        }

        // Verificar se e-mail já existe
        if (this.members.some(member => member.email === formData.email)) {
            this.showAlert('E-mail já cadastrado!', 'error');
            return;
        }

        // Gerar ID único
        const id = Date.now().toString();
        const member = { id, ...formData, createdAt: new Date().toISOString() };

        this.members.push(member);
        this.saveMembers();
        this.updateStats();
        this.displayMembers();
        
        // Atualizar sistema de pagamentos
        if (window.paymentManager) {
            window.paymentManager.generateMonthlyPayments();
            window.refreshPayments();
        }
        
        // Limpar formulário
        document.getElementById('registrationForm').reset();
        document.getElementById('dataInicio').value = new Date().toISOString().split('T')[0];
        
        this.showAlert('Mensalista cadastrado com sucesso!', 'success');
    }

    // Obter dados do formulário
    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (key === 'idade' || key === 'mensalidade') {
                data[key] = parseFloat(value);
            } else {
                data[key] = value.trim();
            }
        }

        return data;
    }

    // Editar membro
    editMember(id) {
        const member = this.members.find(m => m.id === id);
        if (!member) return;

        // Preencher formulário de edição
        document.getElementById('editId').value = member.id;
        document.getElementById('editNome').value = member.nome;
        document.getElementById('editEmail').value = member.email;
        document.getElementById('editTelefone').value = member.telefone;
        document.getElementById('editIdade').value = member.idade;
        document.getElementById('editPosicao').value = member.posicao || '';
        document.getElementById('editExperiencia').value = member.experiencia || '';
        document.getElementById('editMensalidade').value = member.mensalidade;
        document.getElementById('editDataInicio').value = member.dataInicio;
        document.getElementById('editObservacoes').value = member.observacoes || '';

        // Mostrar modal
        document.getElementById('editModal').style.display = 'block';
    }

    // Atualizar membro
    updateMember() {
        const formData = this.getFormData('editForm');
        const id = document.getElementById('editId').value;
        const errors = this.validateForm(formData);

        if (errors.length > 0) {
            this.showAlert('Erro de validação:\n• ' + errors.join('\n• '), 'error');
            return;
        }

        // Verificar se e-mail já existe (exceto o próprio)
        const existingMember = this.members.find(member => 
            member.email === formData.email && member.id !== id
        );
        
        if (existingMember) {
            this.showAlert('E-mail já cadastrado por outro mensalista!', 'error');
            return;
        }

        // Atualizar membro
        const memberIndex = this.members.findIndex(m => m.id === id);
        if (memberIndex !== -1) {
            this.members[memberIndex] = { 
                ...this.members[memberIndex], 
                ...formData,
                updatedAt: new Date().toISOString()
            };
            
            this.saveMembers();
            this.updateStats();
            this.displayMembers();
            this.closeEditModal();
            
            // Atualizar sistema de pagamentos
            if (window.paymentManager) {
                window.paymentManager.generateMonthlyPayments();
                window.refreshPayments();
            }
            
            this.showAlert('Mensalista atualizado com sucesso!', 'success');
        }
    }

    // Fechar modal de edição
    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('editForm').reset();
    }

    // Deletar membro
    deleteMember(id) {
        const member = this.members.find(m => m.id === id);
        if (!member) return;

        if (confirm(`Tem certeza que deseja excluir o mensalista "${member.nome}"?`)) {
            this.members = this.members.filter(m => m.id !== id);
            this.saveMembers();
            this.updateStats();
            this.displayMembers();
            
            // Atualizar sistema de pagamentos
            if (window.paymentManager) {
                window.paymentManager.generateMonthlyPayments();
                window.refreshPayments();
            }
            
            this.showAlert('Mensalista excluído com sucesso!', 'success');
        }
    }

    // Buscar membros
    searchMembers(query) {
        const filtered = this.members.filter(member => 
            member.nome.toLowerCase().includes(query.toLowerCase()) ||
            member.email.toLowerCase().includes(query.toLowerCase()) ||
            member.telefone.includes(query) ||
            (member.posicao && member.posicao.toLowerCase().includes(query.toLowerCase()))
        );
        
        this.displayMembers(filtered);
    }

    // Exibir membros
    displayMembers(membersToShow = null) {
        const membersList = document.getElementById('membersList');
        const members = membersToShow || this.members;

        if (members.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-volleyball-ball"></i>
                    <h3>${membersToShow ? 'Nenhum resultado encontrado' : 'Nenhum mensalista cadastrado ainda'}</h3>
                    <p>${membersToShow ? 'Tente buscar por outro termo.' : 'Cadastre o primeiro mensalista usando o formulário acima.'}</p>
                </div>
            `;
            return;
        }

        const membersHTML = members.map(member => this.createMemberCard(member)).join('');
        membersList.innerHTML = membersHTML;
    }

    // Criar card do membro
    createMemberCard(member) {
        const positionBadge = member.posicao ? 
            `<span class="position-badge">${this.formatPosition(member.posicao)}</span>` : '';
        
        const experienceBadge = member.experiencia ? 
            `<span class="experience-badge experience-${member.experiencia}">${this.formatExperience(member.experiencia)}</span>` : '';

        const observacoes = member.observacoes ? 
            `<div class="detail-item">
                <span class="detail-label">Observações</span>
                <span class="detail-value">${member.observacoes}</span>
            </div>` : '';

        return `
            <div class="member-card">
                <div class="member-header">
                    <div class="member-info">
                        <h3>${member.nome}</h3>
                        <span class="member-email">${member.email}</span>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-edit" onclick="membershipManager.editMember('${member.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger" onclick="membershipManager.deleteMember('${member.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="member-details">
                    <div class="detail-item">
                        <span class="detail-label">Telefone</span>
                        <span class="detail-value">${member.telefone}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Idade</span>
                        <span class="detail-value">${member.idade} anos</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Posição</span>
                        <span class="detail-value">${positionBadge || 'Não informada'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Experiência</span>
                        <span class="detail-value">${experienceBadge || 'Não informada'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mensalidade</span>
                        <span class="detail-value">R$ ${member.mensalidade.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Data de Início</span>
                        <span class="detail-value">${this.formatDate(member.dataInicio)}</span>
                    </div>
                    ${observacoes}
                </div>
            </div>
        `;
    }

    // Formatar posição
    formatPosition(position) {
        const positions = {
            'levantador': 'Levantador',
            'ponteiro': 'Ponteiro',
            'meio-de-rede': 'Meio de Rede',
            'oposto': 'Oposto',
            'libero': 'Líbero'
        };
        return positions[position] || position;
    }

    // Formatar experiência
    formatExperience(experience) {
        const experiences = {
            'iniciante': 'Iniciante',
            'intermediario': 'Intermediário',
            'avancado': 'Avançado'
        };
        return experiences[experience] || experience;
    }

    // Formatar data
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }

    // Atualizar estatísticas
    updateStats() {
        const totalMembers = this.members.length;
        const totalRevenue = this.members.reduce((sum, member) => sum + member.mensalidade, 0);

        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('totalRevenue').textContent = 
            `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
    }

    // Salvar no localStorage
    saveMembers() {
        localStorage.setItem('volleyballMembers', JSON.stringify(this.members));
    }

    // Carregar do localStorage
    loadMembers() {
        const saved = localStorage.getItem('volleyballMembers');
        if (saved) {
            this.members = JSON.parse(saved);
        }
    }

    // Mostrar alerta
    showAlert(message, type = 'info') {
        // Remove alertas existentes
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // Criar novo alerta
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;

        // Cores baseadas no tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        alert.style.background = colors[type] || colors.info;
        alert.textContent = message;

        // Adicionar ao DOM
        document.body.appendChild(alert);

        // Remover após 5 segundos
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }

    // Exportar dados (funcionalidade extra)
    exportData() {
        const dataStr = JSON.stringify(this.members, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'mensalistas_volei.json';
        link.click();
        
        this.showAlert('Dados exportados com sucesso!', 'success');
    }

    // Importar dados (funcionalidade extra)
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    this.members = importedData;
                    this.saveMembers();
                    this.updateStats();
                    this.displayMembers();
                    this.showAlert('Dados importados com sucesso!', 'success');
                } else {
                    this.showAlert('Formato de arquivo inválido!', 'error');
                }
            } catch (error) {
                this.showAlert('Erro ao importar dados!', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Adicionar estilos CSS para alertas
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(alertStyles);

// Função global para fechar modal (usada no HTML)
function closeEditModal() {
    membershipManager.closeEditModal();
}

// Inicializar aplicação quando o DOM estiver carregado
let membershipManager;
let paymentManager;
let attendanceManager;
let dashboardManager;
let notificationsManager;
let communicationManager;
let backupManager;
let pwaManager;
let equipmentManager;

document.addEventListener('DOMContentLoaded', () => {
    membershipManager = new MembershipManager();
    paymentManager = new PaymentManager(membershipManager);
    
    // Inicializar sistema de pagamentos
    initializePaymentSystem();
    
    // Inicializar outros managers com delay para garantir dependências
    setTimeout(() => {
        if (typeof AttendanceManager !== 'undefined') {
            attendanceManager = new AttendanceManager(membershipManager);
        }
        if (typeof DashboardManager !== 'undefined') {
            dashboardManager = new DashboardManager(membershipManager, paymentManager);
        }
        if (typeof NotificationsManager !== 'undefined') {
            notificationsManager = new NotificationsManager(membershipManager, paymentManager);
        }
        if (typeof CommunicationManager !== 'undefined') {
            communicationManager = new CommunicationManager(membershipManager);
        }
        if (typeof BackupManager !== 'undefined') {
            backupManager = new BackupManager();
        }
        if (typeof PWAManager !== 'undefined') {
            pwaManager = new PWAManager();
        }
        if (typeof EquipmentManager !== 'undefined') {
            equipmentManager = new EquipmentManager(membershipManager);
        }
    }, 100);
});

// ===== SISTEMA DE PAGAMENTOS =====

// Inicializar sistema de pagamentos
function initializePaymentSystem() {
    populateYearFilter();
    displayPayments();
    updatePaymentStats();
    setupPaymentEventListeners();
}

// Configurar event listeners para pagamentos
function setupPaymentEventListeners() {
    // Filtros
    document.getElementById('paymentStatusFilter').addEventListener('change', filterPayments);
    document.getElementById('paymentMonthFilter').addEventListener('change', filterPayments);
    document.getElementById('paymentYearFilter').addEventListener('change', filterPayments);
}

// Popular filtro de anos
function populateYearFilter() {
    const yearFilter = document.getElementById('paymentYearFilter');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearFilter.appendChild(option);
    }
}

// Exibir pagamentos
function displayPayments(paymentsToShow = null) {
    const paymentsList = document.getElementById('paymentsList');
    const payments = paymentsToShow || paymentManager.payments;
    
    if (payments.length === 0) {
        paymentsList.innerHTML = `
            <div class="payments-empty">
                <i class="fas fa-credit-card"></i>
                <h3>Nenhum pagamento encontrado</h3>
                <p>Os pagamentos mensais serão gerados automaticamente para todos os membros.</p>
            </div>
        `;
        return;
    }
    
    paymentsList.innerHTML = payments.map(payment => {
        const member = membershipManager.members.find(m => m.id === payment.memberId);
        if (!member) return '';
        
        return createPaymentItem(payment, member);
    }).join('');
}

// Criar item de pagamento
function createPaymentItem(payment, member) {
    const dueDate = new Date(payment.dueDate);
    const isOverdue = payment.isOverdue();
    const daysOverdue = payment.getDaysOverdue();
    
    return `
        <div class="payment-item" onclick="openPaymentModal('${payment.id}')">
            <div class="payment-info">
                <div class="payment-member">${member.nome}</div>
                <div class="payment-details">
                    <span>Vencimento: ${formatDate(payment.dueDate)}</span>
                    ${isOverdue ? `<span class="text-danger">${daysOverdue} dias em atraso</span>` : ''}
                    <span>${member.posicao ? formatPosition(member.posicao) : 'Sem posição'}</span>
                </div>
            </div>
            <div class="payment-amount">R$ ${payment.amount.toFixed(2)}</div>
            <div class="payment-status ${payment.status}">${payment.getStatusText()}</div>
            <div class="payment-actions">
                ${getPaymentActionButtons(payment)}
            </div>
        </div>
    `;
}

// Obter botões de ação para pagamento
function getPaymentActionButtons(payment) {
    switch (payment.status) {
        case 'pending':
            return `
                <button class="btn-success" onclick="event.stopPropagation(); markPaymentAsPaid('${payment.id}')">
                    <i class="fas fa-check"></i> Marcar Pago
                </button>
                <button class="btn-warning" onclick="event.stopPropagation(); editPayment('${payment.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
            `;
        case 'overdue':
            return `
                <button class="btn-success" onclick="event.stopPropagation(); markPaymentAsPaid('${payment.id}')">
                    <i class="fas fa-check"></i> Marcar Pago
                </button>
                <button class="btn-danger" onclick="event.stopPropagation(); cancelPayment('${payment.id}')">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            `;
        case 'paid':
            return `
                <button class="btn-warning" onclick="event.stopPropagation(); editPayment('${payment.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
            `;
        case 'cancelled':
            return `
                <button class="btn-success" onclick="event.stopPropagation(); reactivatePayment('${payment.id}')">
                    <i class="fas fa-redo"></i> Reativar
                </button>
            `;
        default:
            return '';
    }
}

// Filtrar pagamentos
function filterPayments() {
    const statusFilter = document.getElementById('paymentStatusFilter').value;
    const monthFilter = document.getElementById('paymentMonthFilter').value;
    const yearFilter = document.getElementById('paymentYearFilter').value;
    
    let filteredPayments = paymentManager.payments;
    
    if (statusFilter) {
        filteredPayments = filteredPayments.filter(p => p.status === statusFilter);
    }
    
    if (monthFilter !== '') {
        filteredPayments = filteredPayments.filter(p => {
            const paymentDate = new Date(p.dueDate);
            return paymentDate.getMonth() === parseInt(monthFilter);
        });
    }
    
    if (yearFilter !== '') {
        filteredPayments = filteredPayments.filter(p => {
            const paymentDate = new Date(p.dueDate);
            return paymentDate.getFullYear() === parseInt(yearFilter);
        });
    }
    
    displayPayments(filteredPayments);
}

// Atualizar estatísticas de pagamentos
function updatePaymentStats() {
    const stats = paymentManager.getFinancialStats();
    
    document.getElementById('totalRevenue').textContent = stats.totalRevenue;
    document.getElementById('pendingRevenue').textContent = stats.pendingRevenue;
    document.getElementById('overdueRevenue').textContent = stats.overdueRevenue;
    document.getElementById('paymentRate').textContent = stats.paymentRate;
}

// Marcar pagamento como pago
function markPaymentAsPaid(paymentId) {
    const payment = paymentManager.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const paymentMethod = prompt('Forma de pagamento (dinheiro, cartão, PIX, etc.):', 'dinheiro');
    if (!paymentMethod) return;
    
    const notes = prompt('Observações (opcional):', '');
    
    if (paymentManager.markPaymentAsPaid(paymentId, paymentMethod, notes)) {
        displayPayments();
        updatePaymentStats();
        membershipManager.showAlert('Pagamento marcado como pago com sucesso!', 'success');
    }
}

// Cancelar pagamento
function cancelPayment(paymentId) {
    const reason = prompt('Motivo do cancelamento:', '');
    if (reason === null) return;
    
    if (paymentManager.cancelPayment(paymentId, reason)) {
        displayPayments();
        updatePaymentStats();
        membershipManager.showAlert('Pagamento cancelado com sucesso!', 'success');
    }
}

// Reativar pagamento cancelado
function reactivatePayment(paymentId) {
    const payment = paymentManager.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    payment.status = 'pending';
    payment.notes = '';
    payment.updatedAt = new Date().toISOString();
    paymentManager.savePayments();
    
    displayPayments();
    updatePaymentStats();
    membershipManager.showAlert('Pagamento reativado com sucesso!', 'success');
}

// Editar pagamento
function editPayment(paymentId) {
    const payment = paymentManager.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const newAmount = prompt('Novo valor da mensalidade:', payment.amount);
    if (newAmount === null) return;
    
    const newDueDate = prompt('Nova data de vencimento (YYYY-MM-DD):', payment.dueDate.split('T')[0]);
    if (newDueDate === null) return;
    
    payment.amount = parseFloat(newAmount);
    payment.dueDate = newDueDate;
    payment.updatedAt = new Date().toISOString();
    paymentManager.savePayments();
    
    displayPayments();
    updatePaymentStats();
    membershipManager.showAlert('Pagamento atualizado com sucesso!', 'success');
}

// Abrir modal de pagamento
function openPaymentModal(paymentId) {
    const payment = paymentManager.payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const member = membershipManager.members.find(m => m.id === payment.memberId);
    if (!member) return;
    
    // Preencher informações do modal
    document.getElementById('paymentMemberName').textContent = member.nome;
    document.getElementById('paymentMemberEmail').textContent = member.email;
    document.getElementById('paymentAmount').textContent = `R$ ${payment.amount.toFixed(2)}`;
    document.getElementById('paymentDueDate').textContent = formatDate(payment.dueDate);
    document.getElementById('paymentStatus').textContent = payment.getStatusText();
    
    // Configurar ações
    document.getElementById('paymentActions').innerHTML = getPaymentActionButtons(payment);
    
    // Mostrar histórico
    showPaymentHistory(payment);
    
    // Exibir modal
    document.getElementById('paymentModal').style.display = 'block';
}

// Fechar modal de pagamento
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Mostrar histórico do pagamento
function showPaymentHistory(payment) {
    const historyContainer = document.getElementById('paymentHistory');
    
    const history = [
        {
            date: payment.createdAt,
            action: 'Pagamento criado'
        }
    ];
    
    if (payment.paymentDate) {
        history.push({
            date: payment.paymentDate,
            action: `Marcado como pago (${payment.paymentMethod})`
        });
    }
    
    if (payment.updatedAt !== payment.createdAt) {
        history.push({
            date: payment.updatedAt,
            action: 'Última atualização'
        });
    }
    
    historyContainer.innerHTML = `
        <h4><i class="fas fa-history"></i> Histórico</h4>
        ${history.map(h => `
            <div class="history-item">
                <span class="history-date">${formatDate(h.date)}</span>
                <span class="history-action">${h.action}</span>
            </div>
        `).join('')}
    `;
}

// Importar dados de pagamentos
function handlePaymentImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    paymentManager.importPaymentData(file)
        .then(message => {
            membershipManager.showAlert(message, 'success');
            displayPayments();
            updatePaymentStats();
        })
        .catch(error => {
            membershipManager.showAlert(error, 'error');
        });
    
    // Limpar input
    event.target.value = '';
}

// Atualizar pagamentos quando membros são alterados
function refreshPayments() {
    paymentManager.generateMonthlyPayments();
    displayPayments();
    updatePaymentStats();
}

// Adicionar funcionalidades extras no console para desenvolvimento
window.membershipManager = membershipManager;
window.paymentManager = paymentManager;
window.attendanceManager = attendanceManager;
window.dashboardManager = dashboardManager;
window.notificationsManager = notificationsManager;
window.communicationManager = communicationManager;
window.backupManager = backupManager;
window.pwaManager = pwaManager;
window.equipmentManager = equipmentManager;
window.refreshPayments = refreshPayments;