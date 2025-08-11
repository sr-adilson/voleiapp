// ===== SISTEMA DE GESTÃO DE EQUIPAMENTOS =====

// Classe para representar um equipamento
class Equipment {
    constructor(id, name, category, quantity, condition, purchaseDate, lastMaintenance, notes = '') {
        this.id = id;
        this.name = name;
        this.category = category;
        this.quantity = quantity;
        this.availableQuantity = quantity;
        this.condition = condition; // 'excelente', 'bom', 'regular', 'ruim', 'inutilizável'
        this.purchaseDate = purchaseDate;
        this.lastMaintenance = lastMaintenance;
        this.nextMaintenance = this.calculateNextMaintenance();
        this.notes = notes;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Calcular próxima manutenção baseada na categoria
    calculateNextMaintenance() {
        const today = new Date();
        const lastMaintenanceDate = new Date(this.lastMaintenance);
        
        let daysToAdd = 0;
        switch (this.category) {
            case 'bola':
                daysToAdd = 30; // Manutenção mensal para bolas
                break;
            case 'rede':
                daysToAdd = 90; // Manutenção trimestral para redes
                break;
            case 'uniforme':
                daysToAdd = 180; // Manutenção semestral para uniformes
                break;
            case 'equipamento':
                daysToAdd = 60; // Manutenção bimestral para outros equipamentos
                break;
            default:
                daysToAdd = 90;
        }
        
        const nextMaintenance = new Date(lastMaintenanceDate);
        nextMaintenance.setDate(nextMaintenance.getDate() + daysToAdd);
        return nextMaintenance;
    }

    // Verificar se precisa de manutenção
    needsMaintenance() {
        const today = new Date();
        return today >= this.nextMaintenance;
    }

    // Verificar se está disponível para empréstimo
    isAvailable() {
        return this.availableQuantity > 0;
    }

    // Atualizar quantidade disponível
    updateAvailableQuantity(change) {
        this.availableQuantity = Math.max(0, Math.min(this.quantity, this.availableQuantity + change));
        this.updatedAt = new Date();
    }

    // Marcar manutenção realizada
    markMaintenanceDone() {
        this.lastMaintenance = new Date();
        this.nextMaintenance = this.calculateNextMaintenance();
        this.updatedAt = new Date();
    }

    // Atualizar condição
    updateCondition(newCondition) {
        this.condition = newCondition;
        this.updatedAt = new Date();
    }
}

// Classe para representar um empréstimo
class EquipmentLoan {
    constructor(id, equipmentId, memberId, memberName, quantity, loanDate, expectedReturnDate, notes = '') {
        this.id = id;
        this.equipmentId = equipmentId;
        this.memberId = memberId;
        this.memberName = memberName;
        this.quantity = quantity;
        this.loanDate = loanDate;
        this.expectedReturnDate = expectedReturnDate;
        this.actualReturnDate = null;
        this.status = 'ativo'; // 'ativo', 'devolvido', 'atrasado'
        this.notes = notes;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Verificar se está atrasado
    isOverdue() {
        if (this.status === 'devolvido') return false;
        const today = new Date();
        return today > this.expectedReturnDate;
    }

    // Marcar como devolvido
    markReturned() {
        this.actualReturnDate = new Date();
        this.status = 'devolvido';
        this.updatedAt = new Date();
    }

    // Calcular dias de atraso
    getOverdueDays() {
        if (this.status === 'devolvido') return 0;
        const today = new Date();
        const expected = new Date(this.expectedReturnDate);
        const diffTime = today - expected;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

// Classe principal para gerenciar equipamentos
class EquipmentManager {
    constructor(membershipManager) {
        this.membershipManager = membershipManager;
        this.equipment = [];
        this.loans = [];
        this.categories = ['bola', 'rede', 'uniforme', 'equipamento'];
        this.conditions = ['excelente', 'bom', 'regular', 'ruim', 'inutilizável'];
        
        this.loadData();
        this.initializeUI();
    }

    // Carregar dados do localStorage
    loadData() {
        const savedEquipment = localStorage.getItem('voleiapp_equipment');
        const savedLoans = localStorage.getItem('voleiapp_equipment_loans');
        
        if (savedEquipment) {
            this.equipment = JSON.parse(savedEquipment).map(item => {
                const eq = new Equipment(
                    item.id, item.name, item.category, item.quantity,
                    item.condition, item.purchaseDate, item.lastMaintenance, item.notes
                );
                eq.availableQuantity = item.availableQuantity;
                eq.nextMaintenance = item.nextMaintenance;
                eq.createdAt = new Date(item.createdAt);
                eq.updatedAt = new Date(item.updatedAt);
                return eq;
            });
        }
        
        if (savedLoans) {
            this.loans = JSON.parse(savedLoans).map(item => {
                const loan = new EquipmentLoan(
                    item.id, item.equipmentId, item.memberId, item.memberName,
                    item.quantity, item.loanDate, item.expectedReturnDate, item.notes
                );
                loan.actualReturnDate = item.actualReturnDate ? new Date(item.actualReturnDate) : null;
                loan.status = item.status;
                loan.createdAt = new Date(item.createdAt);
                loan.updatedAt = new Date(item.updatedAt);
                return loan;
            });
        }
    }

    // Salvar dados no localStorage
    saveData() {
        localStorage.setItem('voleiapp_equipment', JSON.stringify(this.equipment));
        localStorage.setItem('voleiapp_equipment_loans', JSON.stringify(this.loans));
    }

    // Inicializar interface do usuário
    initializeUI() {
        this.renderEquipmentList();
        this.renderLoansList();
        this.renderEquipmentStats();
        this.setupEventListeners();
        this.checkMaintenanceSchedule();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Formulário de adicionar equipamento
        const addEquipmentForm = document.getElementById('addEquipmentForm');
        if (addEquipmentForm) {
            addEquipmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addEquipment();
            });
        }

        // Formulário de empréstimo
        const loanForm = document.getElementById('loanForm');
        if (loanForm) {
            loanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createLoan();
            });
        }

        // Filtros
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterEquipment());
        }

        const conditionFilter = document.getElementById('conditionFilter');
        if (conditionFilter) {
            conditionFilter.addEventListener('change', () => this.filterEquipment());
        }
    }

    // Adicionar novo equipamento
    addEquipment() {
        const nameInput = document.getElementById('equipmentName');
        const categoryInput = document.getElementById('equipmentCategory');
        const quantityInput = document.getElementById('equipmentQuantity');
        const conditionInput = document.getElementById('equipmentCondition');
        const purchaseDateInput = document.getElementById('equipmentPurchaseDate');
        const notesInput = document.getElementById('equipmentNotes');

        const name = nameInput.value.trim();
        const category = categoryInput.value;
        const quantity = parseInt(quantityInput.value);
        const condition = conditionInput.value;
        const purchaseDate = purchaseDateInput.value;
        const notes = notesInput.value.trim();

        if (!name || !category || !quantity || !condition || !purchaseDate) {
            this.showToast('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (quantity <= 0) {
            this.showToast('A quantidade deve ser maior que zero', 'error');
            return;
        }

        const id = Date.now().toString();
        const equipment = new Equipment(
            id, name, category, quantity, condition, purchaseDate, purchaseDate, notes
        );

        this.equipment.push(equipment);
        this.saveData();
        this.renderEquipmentList();
        this.renderEquipmentStats();

        // Limpar formulário
        nameInput.value = '';
        categoryInput.value = '';
        quantityInput.value = '';
        conditionInput.value = '';
        purchaseDateInput.value = '';
        notesInput.value = '';

        this.showToast('Equipamento adicionado com sucesso!', 'success');
    }

    // Editar equipamento
    editEquipment(id) {
        const equipment = this.equipment.find(eq => eq.id === id);
        if (!equipment) return;

        // Preencher modal de edição
        document.getElementById('editEquipmentId').value = equipment.id;
        document.getElementById('editEquipmentName').value = equipment.name;
        document.getElementById('editEquipmentCategory').value = equipment.category;
        document.getElementById('editEquipmentQuantity').value = equipment.quantity;
        document.getElementById('editEquipmentCondition').value = equipment.condition;
        document.getElementById('editEquipmentPurchaseDate').value = equipment.purchaseDate;
        document.getElementById('editEquipmentNotes').value = equipment.notes;

        // Mostrar modal
        const editModal = document.getElementById('editEquipmentModal');
        if (editModal) {
            editModal.style.display = 'block';
        }
    }

    // Atualizar equipamento
    updateEquipment() {
        const id = document.getElementById('editEquipmentId').value;
        const equipment = this.equipment.find(eq => eq.id === id);
        if (!equipment) return;

        const name = document.getElementById('editEquipmentName').value.trim();
        const category = document.getElementById('editEquipmentCategory').value;
        const quantity = parseInt(document.getElementById('editEquipmentQuantity').value);
        const condition = document.getElementById('editEquipmentCondition').value;
        const purchaseDate = document.getElementById('editEquipmentPurchaseDate').value;
        const notes = document.getElementById('editEquipmentNotes').value.trim();

        if (!name || !category || !quantity || !condition || !purchaseDate) {
            this.showToast('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        if (quantity < equipment.quantity - equipment.availableQuantity) {
            this.showToast('A quantidade não pode ser menor que os itens emprestados', 'error');
            return;
        }

        equipment.name = name;
        equipment.category = category;
        equipment.quantity = quantity;
        equipment.condition = condition;
        equipment.purchaseDate = purchaseDate;
        equipment.notes = notes;
        equipment.updatedAt = new Date();

        this.saveData();
        this.renderEquipmentList();
        this.renderEquipmentStats();
        this.closeEditModal();
        this.showToast('Equipamento atualizado com sucesso!', 'success');
    }

    // Fechar modal de edição
    closeEditModal() {
        const editModal = document.getElementById('editEquipmentModal');
        if (editModal) {
            editModal.style.display = 'none';
        }
    }

    // Deletar equipamento
    deleteEquipment(id) {
        const equipment = this.equipment.find(eq => eq.id === id);
        if (!equipment) return;

        // Verificar se há empréstimos ativos
        const activeLoans = this.loans.filter(loan => 
            loan.equipmentId === id && loan.status === 'ativo'
        );

        if (activeLoans.length > 0) {
            this.showToast('Não é possível deletar equipamento com empréstimos ativos', 'error');
            return;
        }

        if (confirm(`Tem certeza que deseja deletar o equipamento "${equipment.name}"?`)) {
            this.equipment = this.equipment.filter(eq => eq.id !== id);
            this.saveData();
            this.renderEquipmentList();
            this.renderEquipmentStats();
            this.showToast('Equipamento deletado com sucesso!', 'success');
        }
    }

    // Criar empréstimo
    createLoan() {
        const equipmentId = document.getElementById('loanEquipment').value;
        const memberId = document.getElementById('loanMember').value;
        const quantity = parseInt(document.getElementById('loanQuantity').value);
        const expectedReturnDate = document.getElementById('loanReturnDate').value;
        const notes = document.getElementById('loanNotes').value.trim();

        if (!equipmentId || !memberId || !quantity || !expectedReturnDate) {
            this.showToast('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        const equipment = this.equipment.find(eq => eq.id === equipmentId);
        if (!equipment) {
            this.showToast('Equipamento não encontrado', 'error');
            return;
        }

        if (quantity > equipment.availableQuantity) {
            this.showToast('Quantidade solicitada maior que disponível', 'error');
            return;
        }

        const member = this.membershipManager.members.find(m => m.id === memberId);
        if (!member) {
            this.showToast('Membro não encontrado', 'error');
            return;
        }

        const id = Date.now().toString();
        const loan = new EquipmentLoan(
            id, equipmentId, memberId, member.name, quantity, new Date(), expectedReturnDate, notes
        );

        this.loans.push(loan);
        equipment.updateAvailableQuantity(-quantity);
        
        this.saveData();
        this.renderLoansList();
        this.renderEquipmentList();
        this.renderEquipmentStats();

        // Limpar formulário
        document.getElementById('loanEquipment').value = '';
        document.getElementById('loanMember').value = '';
        document.getElementById('loanQuantity').value = '';
        document.getElementById('loanReturnDate').value = '';
        document.getElementById('loanNotes').value = '';

        this.showToast('Empréstimo criado com sucesso!', 'success');
    }

    // Devolver equipamento
    returnEquipment(loanId) {
        const loan = this.loans.find(l => l.id === loanId);
        if (!loan) return;

        const equipment = this.equipment.find(eq => eq.id === loan.equipmentId);
        if (!equipment) return;

        loan.markReturned();
        equipment.updateAvailableQuantity(loan.quantity);

        this.saveData();
        this.renderLoansList();
        this.renderEquipmentList();
        this.renderEquipmentStats();
        this.showToast('Equipamento devolvido com sucesso!', 'success');
    }

    // Marcar manutenção realizada
    markMaintenanceDone(equipmentId) {
        const equipment = this.equipment.find(eq => eq.id === equipmentId);
        if (!equipment) return;

        equipment.markMaintenanceDone();
        this.saveData();
        this.renderEquipmentList();
        this.renderEquipmentStats();
        this.showToast('Manutenção marcada como realizada!', 'success');
    }

    // Filtrar equipamentos
    filterEquipment() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const conditionFilter = document.getElementById('conditionFilter').value;
        const searchTerm = document.getElementById('equipmentSearch').value.toLowerCase();

        let filteredEquipment = this.equipment;

        if (categoryFilter !== 'todos') {
            filteredEquipment = filteredEquipment.filter(eq => eq.category === categoryFilter);
        }

        if (conditionFilter !== 'todos') {
            filteredEquipment = filteredEquipment.filter(eq => eq.condition === conditionFilter);
        }

        if (searchTerm) {
            filteredEquipment = filteredEquipment.filter(eq => 
                eq.name.toLowerCase().includes(searchTerm) ||
                eq.notes.toLowerCase().includes(searchTerm)
            );
        }

        this.renderEquipmentList(filteredEquipment);
    }

    // Renderizar lista de equipamentos
    renderEquipmentList(equipmentList = null) {
        const container = document.getElementById('equipmentList');
        if (!container) return;

        const list = equipmentList || this.equipment;
        
        if (list.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum equipamento encontrado</p>';
            return;
        }

        container.innerHTML = list.map(equipment => {
            const needsMaintenance = equipment.needsMaintenance();
            const maintenanceClass = needsMaintenance ? 'maintenance-needed' : '';
            const maintenanceIcon = needsMaintenance ? '<i class="fas fa-tools maintenance-icon"></i>' : '';
            
            return `
                <div class="equipment-item ${maintenanceClass}">
                    <div class="equipment-header">
                        <h3>${equipment.name} ${maintenanceIcon}</h3>
                        <div class="equipment-actions">
                            <button class="btn btn-sm btn-secondary" onclick="window.equipmentManager.editEquipment('${equipment.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="window.equipmentManager.deleteEquipment('${equipment.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="equipment-details">
                        <div class="equipment-info">
                            <span class="category-badge ${equipment.category}">${equipment.category}</span>
                            <span class="condition-badge ${equipment.condition}">${equipment.condition}</span>
                        </div>
                        <div class="equipment-quantity">
                            <span class="quantity-info">
                                <i class="fas fa-boxes"></i>
                                ${equipment.availableQuantity}/${equipment.quantity} disponível
                            </span>
                        </div>
                    </div>
                    <div class="equipment-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Compra: ${new Date(equipment.purchaseDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-tools"></i>
                            <span>Última manutenção: ${new Date(equipment.lastMaintenance).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-clock"></i>
                            <span>Próxima manutenção: ${new Date(equipment.nextMaintenance).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                    ${equipment.notes ? `<div class="equipment-notes"><i class="fas fa-sticky-note"></i> ${equipment.notes}</div>` : ''}
                    <div class="equipment-actions-bottom">
                        <button class="btn btn-sm btn-primary" onclick="window.equipmentManager.markMaintenanceDone('${equipment.id}')">
                            <i class="fas fa-tools"></i> Manutenção Realizada
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderizar lista de empréstimos
    renderLoansList() {
        const container = document.getElementById('loansList');
        if (!container) return;

        if (this.loans.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum empréstimo encontrado</p>';
            return;
        }

        container.innerHTML = this.loans.map(loan => {
            const equipment = this.equipment.find(eq => eq.id === loan.equipmentId);
            const isOverdue = loan.isOverdue();
            const overdueClass = isOverdue ? 'overdue' : '';
            const overdueIcon = isOverdue ? '<i class="fas fa-exclamation-triangle overdue-icon"></i>' : '';
            
            return `
                <div class="loan-item ${overdueClass}">
                    <div class="loan-header">
                        <h3>${equipment ? equipment.name : 'Equipamento não encontrado'} ${overdueIcon}</h3>
                        <div class="loan-status ${loan.status}">${loan.status}</div>
                    </div>
                    <div class="loan-details">
                        <div class="loan-info">
                            <span><i class="fas fa-user"></i> ${loan.memberName}</span>
                            <span><i class="fas fa-boxes"></i> ${loan.quantity} unidade(s)</span>
                        </div>
                        <div class="loan-dates">
                            <span><i class="fas fa-calendar-plus"></i> Empréstimo: ${new Date(loan.loanDate).toLocaleDateString('pt-BR')}</span>
                            <span><i class="fas fa-calendar-check"></i> Devolução esperada: ${new Date(loan.expectedReturnDate).toLocaleDateString('pt-BR')}</span>
                            ${loan.actualReturnDate ? `<span><i class="fas fa-calendar-times"></i> Devolvido: ${new Date(loan.actualReturnDate).toLocaleDateString('pt-BR')}</span>` : ''}
                        </div>
                    </div>
                    ${loan.notes ? `<div class="loan-notes"><i class="fas fa-sticky-note"></i> ${loan.notes}</div>` : ''}
                    ${loan.status === 'ativo' ? `
                        <div class="loan-actions">
                            <button class="btn btn-sm btn-success" onclick="window.equipmentManager.returnEquipment('${loan.id}')">
                                <i class="fas fa-undo"></i> Devolver
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Renderizar estatísticas
    renderEquipmentStats() {
        const container = document.getElementById('equipmentStats');
        if (!container) return;

        const totalEquipment = this.equipment.length;
        const totalItems = this.equipment.reduce((sum, eq) => sum + eq.quantity, 0);
        const availableItems = this.equipment.reduce((sum, eq) => sum + eq.availableQuantity, 0);
        const loanedItems = totalItems - availableItems;
        const needsMaintenance = this.equipment.filter(eq => eq.needsMaintenance()).length;
        const overdueLoans = this.loans.filter(loan => loan.isOverdue()).length;

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-boxes"></i>
                </div>
                <div class="stat-content">
                    <h3>${totalEquipment}</h3>
                    <p>Tipos de Equipamentos</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-cubes"></i>
                </div>
                <div class="stat-content">
                    <h3>${totalItems}</h3>
                    <p>Total de Itens</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <h3>${availableItems}</h3>
                    <p>Disponíveis</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-handshake"></i>
                </div>
                <div class="stat-content">
                    <h3>${loanedItems}</h3>
                    <p>Emprestados</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-tools"></i>
                </div>
                <div class="stat-content">
                    <h3>${needsMaintenance}</h3>
                    <p>Precisam de Manutenção</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="stat-content">
                    <h3>${overdueLoans}</h3>
                    <p>Empréstimos Atrasados</p>
                </div>
            </div>
        `;
    }

    // Verificar agenda de manutenção
    checkMaintenanceSchedule() {
        const needsMaintenance = this.equipment.filter(eq => eq.needsMaintenance());
        
        if (needsMaintenance.length > 0) {
            this.showToast(`${needsMaintenance.length} equipamento(s) precisam de manutenção`, 'warning');
        }
    }

    // Exportar dados
    exportData() {
        const data = {
            equipment: this.equipment,
            loans: this.loans,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voleiapp-equipment-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Dados exportados com sucesso!', 'success');
    }

    // Mostrar toast
    showToast(message, type = 'info') {
        if (window.pwaManager && window.pwaManager.showToast) {
            window.pwaManager.showToast(message, type);
        } else {
            // Fallback simples
            alert(message);
        }
    }
}

// Variável global para acesso
window.equipmentManager = null;