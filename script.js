// Classe principal para gerenciar o sistema de navegação e funcionalidades
class VoleiApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.members = [];
        this.payments = [];
        this.sessions = [];
        this.equipment = [];
        this.notifications = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.initializeNavigation();
        this.initializeEventListeners();
        this.showTab('dashboard');
        this.updateDashboard();
    }

    // Inicializar sistema de navegação
    initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');

        // Navegação por abas
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                this.showTab(tab);
                
                // Atualizar estado ativo
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Toggle sidebar em mobile
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }

        // Fechar sidebar ao clicar fora (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024 && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }

    // Mostrar aba específica
    showTab(tabName) {
        const tabPanes = document.querySelectorAll('.tab-pane');
        const pageTitle = document.getElementById('pageTitle');
        const pageDescription = document.getElementById('pageDescription');

        // Esconder todas as abas
        tabPanes.forEach(pane => pane.classList.remove('active'));

        // Mostrar aba selecionada
        const selectedPane = document.getElementById(tabName);
        if (selectedPane) {
            selectedPane.classList.add('active');
        }

        // Atualizar título e descrição da página
        this.updatePageHeader(tabName);

        // Carregar conteúdo específico da aba
        this.loadTabContent(tabName);

        this.currentTab = tabName;
    }

    // Atualizar cabeçalho da página
    updatePageHeader(tabName) {
        const pageTitle = document.getElementById('pageTitle');
        const pageDescription = document.getElementById('pageDescription');

        const headers = {
            dashboard: {
                title: 'Dashboard',
                description: 'Visão geral do sistema'
            },
            members: {
                title: 'Mensalistas',
                description: 'Gerenciar membros do time'
            },
            payments: {
                title: 'Pagamentos',
                description: 'Controle financeiro e mensalidades'
            },
            attendance: {
                title: 'Presença',
                description: 'Controle de treinos e presenças'
            },
            equipment: {
                title: 'Equipamentos',
                description: 'Gestão de materiais e inventário'
            },
            notifications: {
                title: 'Notificações',
                description: 'Sistema de alertas e comunicações'
            }
        };

        if (headers[tabName]) {
            pageTitle.textContent = headers[tabName].title;
            pageDescription.textContent = headers[tabName].description;
        }
    }

    // Carregar conteúdo específico da aba
    loadTabContent(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'members':
                this.updateMembersTab();
                break;
            case 'payments':
                this.updatePaymentsTab();
                break;
            case 'attendance':
                this.updateAttendanceTab();
                break;
            case 'equipment':
                this.updateEquipmentTab();
                break;
            case 'notifications':
                this.updateNotificationsTab();
                break;
        }
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Botões de ação das abas
        this.initializeActionButtons();
        
        // Formulários
        this.initializeForms();
        
        // Filtros e busca
        this.initializeFilters();
        
        // Modais
        this.initializeModals();
    }

    // Inicializar botões de ação
    initializeActionButtons() {
        // Botão adicionar membro
        const addMemberBtn = document.getElementById('addMemberBtn');
        if (addMemberBtn) {
            addMemberBtn.addEventListener('click', () => {
                this.showModal('addMemberModal');
            });
        }

        // Botão adicionar pagamento
        const addPaymentBtn = document.getElementById('addPaymentBtn');
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => {
                this.showModal('addPaymentModal');
            });
        }

        // Botão adicionar sessão
        const addSessionBtn = document.getElementById('addSessionBtn');
        if (addSessionBtn) {
            addSessionBtn.addEventListener('click', () => {
                this.showModal('addSessionModal');
            });
        }

        // Botão adicionar equipamento
        const addEquipmentBtn = document.getElementById('addEquipmentBtn');
        if (addEquipmentBtn) {
            addEquipmentBtn.addEventListener('click', () => {
                this.showModal('addEquipmentModal');
            });
        }

        // Botão adicionar notificação
        const addNotificationBtn = document.getElementById('addNotificationBtn');
        if (addNotificationBtn) {
            addNotificationBtn.addEventListener('click', () => {
                this.showModal('addNotificationModal');
            });
        }
    }

    // Inicializar formulários
    initializeForms() {
        // Formulário de cadastro de membro
        const registrationForm = document.getElementById('registrationForm');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addMember();
            });
        }

        // Formulário de edição
        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateMember();
            });
        }

        // Formulário de sessão de treino
        const trainingSessionForm = document.getElementById('trainingSessionForm');
        if (trainingSessionForm) {
            trainingSessionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTrainingSession();
            });
        }

        // Máscara para telefone
        this.initializePhoneMasks();
        
        // Data padrão
        this.setDefaultDates();
    }

    // Inicializar filtros
    initializeFilters() {
        // Busca de membros
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMembers(e.target.value);
            });
        }

        // Filtros de posição e experiência
        const positionFilter = document.getElementById('positionFilter');
        const experienceFilter = document.getElementById('experienceFilter');
        
        if (positionFilter) {
            positionFilter.addEventListener('change', () => {
                this.filterMembers();
            });
        }
        
        if (experienceFilter) {
            experienceFilter.addEventListener('change', () => {
                this.filterMembers();
            });
        }

        // Filtros de pagamento
        const monthFilter = document.getElementById('monthFilter');
        const yearFilter = document.getElementById('yearFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        [monthFilter, yearFilter, statusFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => {
                    this.filterPayments();
                });
            }
        });
    }

    // Inicializar modais
    initializeModals() {
        // Fechar modais ao clicar no X
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });

        // Fechar modais com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    // Inicializar máscaras de telefone
    initializePhoneMasks() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', this.formatPhone);
        });
    }

    // Formatar telefone
    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = `(${value}`;
            } else if (value.length <= 6) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else if (value.length <= 10) {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
            } else {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            }
        }
        
        e.target.value = value;
    }

    // Definir datas padrão
    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            if (input.id === 'dataInicio' || input.id === 'sessionDate') {
                input.value = today;
            }
        });
    }

    // Mostrar modal
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    // Esconder modal específico
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Esconder todos os modais
    hideAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.style.overflow = '';
    }

    // Carregar dados salvos
    loadData() {
        this.members = JSON.parse(localStorage.getItem('voleiApp_members') || '[]');
        this.payments = JSON.parse(localStorage.getItem('voleiApp_payments') || '[]');
        this.sessions = JSON.parse(localStorage.getItem('voleiApp_sessions') || '[]');
        this.equipment = JSON.parse(localStorage.getItem('voleiApp_equipment') || '[]');
        this.notifications = JSON.parse(localStorage.getItem('voleiApp_notifications') || '[]');
    }

    // Salvar dados
    saveData() {
        localStorage.setItem('voleiApp_members', JSON.stringify(this.members));
        localStorage.setItem('voleiApp_payments', JSON.stringify(this.payments));
        localStorage.setItem('voleiApp_sessions', JSON.stringify(this.sessions));
        localStorage.setItem('voleiApp_equipment', JSON.stringify(this.equipment));
        localStorage.setItem('voleiApp_notifications', JSON.stringify(this.notifications));
    }

    // ===== DASHBOARD =====
    updateDashboard() {
        this.updateDashboardStats();
        this.updateDashboardCharts();
        this.updateRecentActivity();
    }

    updateDashboardStats() {
        const totalMembers = document.getElementById('totalMembers');
        const totalRevenue = document.getElementById('totalRevenue');
        const totalSessions = document.getElementById('totalSessions');
        const pendingPayments = document.getElementById('pendingPayments');

        if (totalMembers) totalMembers.textContent = this.members.length;
        if (totalRevenue) {
            const monthlyRevenue = this.calculateMonthlyRevenue();
            totalRevenue.textContent = `R$ ${monthlyRevenue.toFixed(2).replace('.', ',')}`;
        }
        if (totalSessions) {
            const currentMonthSessions = this.sessions.filter(s => {
                const sessionDate = new Date(s.date);
                const now = new Date();
                return sessionDate.getMonth() === now.getMonth() && 
                       sessionDate.getFullYear() === now.getFullYear();
            }).length;
            totalSessions.textContent = currentMonthSessions;
        }
        if (pendingPayments) {
            const pending = this.payments.filter(p => p.status === 'pendente').length;
            pendingPayments.textContent = pending;
        }
    }

    updateDashboardCharts() {
        // Chart.js charts serão implementados aqui
        this.initializeCharts();
    }

    updateRecentActivity() {
        const recentActivity = document.getElementById('recentActivity');
        if (!recentActivity) return;

        const activities = this.getRecentActivities();
        recentActivity.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    getRecentActivities() {
        const activities = [];
        
        // Adicionar atividades recentes baseadas nos dados
        if (this.members.length > 0) {
            const latestMember = this.members[this.members.length - 1];
            activities.push({
                icon: 'fas fa-user-plus',
                text: `Novo membro cadastrado: ${latestMember.nome}`,
                time: 'Agora'
            });
        }

        if (this.payments.length > 0) {
            const latestPayment = this.payments[this.payments.length - 1];
            activities.push({
                icon: 'fas fa-credit-card',
                text: `Pagamento registrado: ${latestPayment.memberName}`,
                time: 'Há 2 horas'
            });
        }

        if (this.sessions.length > 0) {
            const latestSession = this.sessions[this.sessions.length - 1];
            activities.push({
                icon: 'fas fa-calendar-check',
                text: `Nova sessão de treino criada`,
                time: 'Ontem'
            });
        }

        return activities.slice(0, 5); // Máximo 5 atividades
    }

    // ===== MEMBROS =====
    updateMembersTab() {
        this.displayMembers();
        this.updateMemberStats();
    }

    displayMembers() {
        const membersList = document.getElementById('membersList');
        if (!membersList) return;

        if (this.members.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Nenhum membro cadastrado</h3>
                    <p>Comece cadastrando o primeiro membro do time</p>
                    <button class="btn btn-primary" onclick="voleiApp.showModal('addMemberModal')">
                        <i class="fas fa-plus"></i> Cadastrar Primeiro Membro
                    </button>
                </div>
            `;
            return;
        }

        membersList.innerHTML = this.members.map(member => `
            <div class="member-card" data-member-id="${member.id}">
                <div class="member-header">
                    <div class="member-info">
                        <h3>${member.nome}</h3>
                        <p class="member-email">${member.email}</p>
                    </div>
                    <div class="member-actions">
                        <button class="btn btn-edit" onclick="voleiApp.editMember('${member.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-danger" onclick="voleiApp.deleteMember('${member.id}')">
                            <i class="fas fa-trash"></i> Excluir
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
                        <span class="detail-value">${member.posicao || 'Não definida'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Experiência</span>
                        <span class="detail-value">${member.experiencia || 'Não definida'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Mensalidade</span>
                        <span class="detail-value">R$ ${member.mensalidade}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Início</span>
                        <span class="detail-value">${this.formatDate(member.dataInicio)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ===== PAGAMENTOS =====
    updatePaymentsTab() {
        this.displayPayments();
        this.updatePaymentStats();
    }

    displayPayments() {
        const paymentsList = document.getElementById('paymentsList');
        if (!paymentsList) return;

        if (this.payments.length === 0) {
            paymentsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-credit-card"></i>
                    <h3>Nenhum pagamento registrado</h3>
                    <p>Comece registrando o primeiro pagamento</p>
                    <button class="btn btn-primary" onclick="voleiApp.showModal('addPaymentModal')">
                        <i class="fas fa-plus"></i> Registrar Pagamento
                    </button>
                </div>
            `;
            return;
        }

        paymentsList.innerHTML = this.payments.map(payment => `
            <div class="payment-card">
                <div class="payment-header">
                    <div class="payment-info">
                        <h4>${payment.memberName}</h4>
                        <p>${this.formatDate(payment.date)}</p>
                    </div>
                    <span class="payment-status ${payment.status}">${payment.status}</span>
                </div>
                <div class="payment-details">
                    <div class="detail-item">
                        <span class="detail-label">Valor</span>
                        <span class="detail-value">R$ ${payment.amount}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Método</span>
                        <span class="detail-value">${payment.method}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ===== PRESENÇA =====
    updateAttendanceTab() {
        this.displaySessions();
    }

    displaySessions() {
        const sessionsList = document.getElementById('trainingSessionsList');
        if (!sessionsList) return;

        if (this.sessions.length === 0) {
            sessionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-check"></i>
                    <h3>Nenhuma sessão de treino</h3>
                    <p>Comece criando a primeira sessão de treino</p>
                </div>
            `;
            return;
        }

        sessionsList.innerHTML = this.sessions.map(session => `
            <div class="session-card">
                <div class="session-header">
                    <h4>Treino - ${this.formatDate(session.date)}</h4>
                    <span class="session-time">${session.time}</span>
                </div>
                <div class="session-details">
                    <p>${session.notes || 'Sem observações'}</p>
                </div>
            </div>
        `).join('');
    }

    // ===== EQUIPAMENTOS =====
    updateEquipmentTab() {
        const equipmentContent = document.getElementById('equipmentContent');
        if (!equipmentContent) return;

        equipmentContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-volleyball-ball"></i>
                <h3>Módulo de Equipamentos</h3>
                <p>Funcionalidade será implementada em breve</p>
            </div>
        `;
    }

    // ===== NOTIFICAÇÕES =====
    updateNotificationsTab() {
        const notificationsContent = document.getElementById('notificationsContent');
        if (!notificationsContent) return;

        notificationsContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h3>Sistema de Notificações</h3>
                <p>Funcionalidade será implementada em breve</p>
            </div>
        `;
    }

    // ===== FUNÇÕES AUXILIARES =====
    calculateMonthlyRevenue() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return this.payments
            .filter(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate.getMonth() === currentMonth && 
                       paymentDate.getFullYear() === currentYear &&
                       payment.status === 'pago';
            })
            .reduce((total, payment) => total + payment.amount, 0);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    // ===== FUNÇÕES DE MEMBROS =====
    addMember() {
        const form = document.getElementById('registrationForm');
        const formData = new FormData(form);
        
        const member = {
            id: Date.now().toString(),
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            idade: parseInt(formData.get('idade')),
            posicao: formData.get('posicao'),
            experiencia: formData.get('experiencia'),
            mensalidade: parseFloat(formData.get('mensalidade')),
            dataInicio: formData.get('dataInicio'),
            observacoes: formData.get('observacoes')
        };

        if (this.validateMember(member)) {
            this.members.push(member);
            this.saveData();
            this.hideModal('addMemberModal');
            form.reset();
            this.setDefaultDates();
            
            if (this.currentTab === 'members') {
                this.updateMembersTab();
            }
            if (this.currentTab === 'dashboard') {
                this.updateDashboard();
            }
            
            this.showToast('Membro cadastrado com sucesso!', 'success');
        }
    }

    validateMember(member) {
        const errors = [];

        if (!member.nome || member.nome.trim().length < 2) {
            errors.push('Nome deve ter pelo menos 2 caracteres');
        }

        if (!this.validateEmail(member.email)) {
            errors.push('E-mail inválido');
        }

        if (!this.validatePhone(member.telefone)) {
            errors.push('Telefone inválido');
        }

        if (!member.idade || member.idade < 14 || member.idade > 80) {
            errors.push('Idade deve estar entre 14 e 80 anos');
        }

        if (!member.mensalidade || member.mensalidade <= 0) {
            errors.push('Valor da mensalidade deve ser maior que zero');
        }

        if (!member.dataInicio) {
            errors.push('Data de início é obrigatória');
        }

        if (errors.length > 0) {
            this.showToast(errors.join(', '), 'error');
            return false;
        }

        return true;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        return phoneRegex.test(phone);
    }

    editMember(memberId) {
        const member = this.members.find(m => m.id === memberId);
        if (!member) return;

        // Preencher formulário de edição
        document.getElementById('editId').value = member.id;
        document.getElementById('editNome').value = member.nome;
        document.getElementById('editEmail').value = member.email;
        document.getElementById('editTelefone').value = member.telefone;
        document.getElementById('editIdade').value = member.idade;
        document.getElementById('editPosicao').value = member.posicao;
        document.getElementById('editExperiencia').value = member.experiencia;
        document.getElementById('editMensalidade').value = member.mensalidade;
        document.getElementById('editDataInicio').value = member.dataInicio;
        document.getElementById('editObservacoes').value = member.observacoes;

        this.showModal('editModal');
    }

    updateMember() {
        const form = document.getElementById('editForm');
        const formData = new FormData(form);
        
        const memberId = formData.get('id');
        const memberIndex = this.members.findIndex(m => m.id === memberId);
        
        if (memberIndex === -1) return;

        const updatedMember = {
            ...this.members[memberIndex],
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            idade: parseInt(formData.get('idade')),
            posicao: formData.get('posicao'),
            experiencia: formData.get('experiencia'),
            mensalidade: parseFloat(formData.get('mensalidade')),
            dataInicio: formData.get('dataInicio'),
            observacoes: formData.get('observacoes')
        };

        if (this.validateMember(updatedMember)) {
            this.members[memberIndex] = updatedMember;
            this.saveData();
            this.hideModal('editModal');
            
            if (this.currentTab === 'members') {
                this.updateMembersTab();
            }
            if (this.currentTab === 'dashboard') {
                this.updateDashboard();
            }
            
            this.showToast('Membro atualizado com sucesso!', 'success');
        }
    }

    deleteMember(memberId) {
        if (confirm('Tem certeza que deseja excluir este membro?')) {
            this.members = this.members.filter(m => m.id !== memberId);
            this.saveData();
            
            if (this.currentTab === 'members') {
                this.updateMembersTab();
            }
            if (this.currentTab === 'dashboard') {
                this.updateDashboard();
            }
            
            this.showToast('Membro excluído com sucesso!', 'success');
        }
    }

    // ===== FUNÇÕES DE SESSÕES =====
    addTrainingSession() {
        const form = document.getElementById('trainingSessionForm');
        const formData = new FormData(form);
        
        const session = {
            id: Date.now().toString(),
            date: formData.get('sessionDate'),
            time: formData.get('sessionTime'),
            notes: formData.get('sessionNotes')
        };

        this.sessions.push(session);
        this.saveData();
        form.reset();
        this.setDefaultDates();
        
        if (this.currentTab === 'attendance') {
            this.updateAttendanceTab();
        }
        if (this.currentTab === 'dashboard') {
            this.updateDashboard();
        }
        
        this.showToast('Sessão de treino criada com sucesso!', 'success');
    }

    // ===== FUNÇÕES DE BUSCA E FILTRO =====
    searchMembers(query) {
        if (!query.trim()) {
            this.displayMembers();
            return;
        }

        const filteredMembers = this.members.filter(member => 
            member.nome.toLowerCase().includes(query.toLowerCase()) ||
            member.email.toLowerCase().includes(query.toLowerCase()) ||
            member.telefone.includes(query) ||
            (member.posicao && member.posicao.toLowerCase().includes(query.toLowerCase()))
        );

        this.displayFilteredMembers(filteredMembers);
    }

    filterMembers() {
        const positionFilter = document.getElementById('positionFilter')?.value;
        const experienceFilter = document.getElementById('experienceFilter')?.value;

        let filteredMembers = this.members;

        if (positionFilter) {
            filteredMembers = filteredMembers.filter(m => m.posicao === positionFilter);
        }

        if (experienceFilter) {
            filteredMembers = filteredMembers.filter(m => m.experiencia === experienceFilter);
        }

        this.displayFilteredMembers(filteredMembers);
    }

    displayFilteredMembers(members) {
        const membersList = document.getElementById('membersList');
        if (!membersList) return;

        if (members.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente ajustar os filtros de busca</p>
                </div>
            `;
            return;
        }

        // Reutilizar a lógica de display com os membros filtrados
        this.members = members;
        this.displayMembers();
        this.members = JSON.parse(localStorage.getItem('voleiApp_members') || '[]'); // Restaurar lista original
    }

    filterPayments() {
        // Implementar filtros de pagamento
    }

    // ===== FUNÇÕES DE CHART =====
    initializeCharts() {
        // Implementar gráficos com Chart.js
        this.initializeMembersChart();
        this.initializeRevenueChart();
    }

    initializeMembersChart() {
        const ctx = document.getElementById('membersChart');
        if (!ctx) return;

        // Implementar gráfico de evolução de membros
    }

    initializeRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        // Implementar gráfico de receita
    }

    // ===== FUNÇÕES DE NOTIFICAÇÃO =====
    showToast(message, type = 'info') {
        // Implementar sistema de toast notifications
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    // ===== FUNÇÕES DE ESTATÍSTICAS =====
    updateMemberStats() {
        // Atualizar estatísticas específicas da aba de membros
    }

    updatePaymentStats() {
        // Atualizar estatísticas específicas da aba de pagamentos
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.voleiApp = new VoleiApp();
});

// Função global para fechar modais
function closeModal(modalId) {
    if (window.voleiApp) {
        window.voleiApp.hideModal(modalId);
    }
}

// Função global para mostrar modais
function showModal(modalId) {
    if (window.voleiApp) {
        window.voleiApp.showModal(modalId);
    }
}