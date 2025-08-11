/**
 * Sistema de Backup e Sincronização
 * Gerencia usuários, permissões, backup automático e sincronização com Google Drive
 */

class User {
    constructor({ id, username, email, role, permissions, createdAt, lastLogin }) {
        this.id = id || this._generateId();
        this.username = username;
        this.email = email;
        this.role = role || 'user'; // admin, manager, user
        this.permissions = permissions || this._getDefaultPermissions(role);
        this.createdAt = createdAt || new Date().toISOString();
        this.lastLogin = lastLogin || null;
        this.isActive = true;
    }

    _generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    _getDefaultPermissions(role) {
        const basePermissions = {
            view_members: true,
            view_payments: true,
            view_attendance: true,
            view_dashboard: true,
            view_notifications: true,
            view_communication: true
        };

        switch (role) {
            case 'admin':
                return {
                    ...basePermissions,
                    edit_members: true,
                    delete_members: true,
                    manage_payments: true,
                    manage_attendance: true,
                    manage_notifications: true,
                    manage_communication: true,
                    manage_users: true,
                    manage_backup: true,
                    export_data: true
                };
            case 'manager':
                return {
                    ...basePermissions,
                    edit_members: true,
                    manage_payments: true,
                    manage_attendance: true,
                    manage_notifications: true,
                    manage_communication: true,
                    export_data: true
                };
            default:
                return basePermissions;
        }
    }

    hasPermission(permission) {
        return this.permissions[permission] === true;
    }

    canAccess(feature) {
        const permissionMap = {
            'members': 'view_members',
            'payments': 'view_payments',
            'attendance': 'view_attendance',
            'dashboard': 'view_dashboard',
            'notifications': 'view_notifications',
            'communication': 'view_communication',
            'backup': 'manage_backup',
            'users': 'manage_users'
        };
        
        return this.hasPermission(permissionMap[feature] || feature);
    }

    updateLastLogin() {
        this.lastLogin = new Date().toISOString();
    }
}

class BackupManager {
    constructor({ membershipManager, paymentManager, attendanceManager, notificationsManager, communicationManager }) {
        this.membershipManager = membershipManager;
        this.paymentManager = paymentManager;
        this.attendanceManager = attendanceManager;
        this.notificationsManager = notificationsManager;
        this.communicationManager = communicationManager;
        
        this.currentUser = null;
        this.users = [];
        this.backupHistory = [];
        this.syncSettings = {
            autoBackup: true,
            backupInterval: 24 * 60 * 60 * 1000, // 24 horas
            googleDriveEnabled: false,
            lastBackup: null,
            lastSync: null
        };
        
        this.loadUsers();
        this.loadBackupHistory();
        this.loadSyncSettings();
        this.setupAutoBackup();
    }

    // ===== GERENCIAMENTO DE USUÁRIOS =====

    initializeUserSystem() {
        // Criar usuário admin padrão se não existir
        if (this.users.length === 0) {
            this.createDefaultAdmin();
        }
        
        this.setupLoginSystem();
        this.setupPermissionChecks();
        this.renderUserInterface();
    }

    createDefaultAdmin() {
        const adminUser = new User({
            username: 'admin',
            email: 'admin@voleiapp.com',
            role: 'admin'
        });
        
        this.users.push(adminUser);
        this.saveUsers();
        
        // Definir como usuário atual
        this.currentUser = adminUser;
        this.currentUser.updateLastLogin();
    }

    createUser(userData) {
        if (!this.currentUser?.hasPermission('manage_users')) {
            throw new Error('Sem permissão para criar usuários');
        }

        const newUser = new User(userData);
        this.users.push(newUser);
        this.saveUsers();
        
        this.showToast(`Usuário ${newUser.username} criado com sucesso!`, 'success');
        this.renderUserInterface();
        
        return newUser;
    }

    updateUser(userId, updates) {
        if (!this.currentUser?.hasPermission('manage_users')) {
            throw new Error('Sem permissão para editar usuários');
        }

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        // Não permitir editar o próprio usuário para remover permissões de admin
        if (userId === this.currentUser.id && updates.role !== 'admin') {
            throw new Error('Não é possível remover suas próprias permissões de administrador');
        }

        this.users[userIndex] = { ...this.users[userIndex], ...updates };
        this.saveUsers();
        
        this.showToast(`Usuário ${this.users[userIndex].username} atualizado!`, 'success');
        this.renderUserInterface();
    }

    deleteUser(userId) {
        if (!this.currentUser?.hasPermission('manage_users')) {
            throw new Error('Sem permissão para deletar usuários');
        }

        if (userId === this.currentUser.id) {
            throw new Error('Não é possível deletar seu próprio usuário');
        }

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        const deletedUser = this.users.splice(userIndex, 1)[0];
        this.saveUsers();
        
        this.showToast(`Usuário ${deletedUser.username} removido!`, 'success');
        this.renderUserInterface();
    }

    login(username, password) {
        // Sistema simples de autenticação (em produção, usar hash de senha)
        const user = this.users.find(u => u.username === username && u.isActive);
        
        if (!user) {
            throw new Error('Usuário ou senha inválidos');
        }

        // Para demo, aceitar qualquer senha (em produção, verificar hash)
        this.currentUser = user;
        this.currentUser.updateLastLogin();
        this.saveUsers();
        
        this.showToast(`Bem-vindo, ${user.username}!`, 'success');
        this.renderUserInterface();
        this.updateUIForUser();
        
        return user;
    }

    logout() {
        this.currentUser = null;
        this.showToast('Logout realizado com sucesso!', 'info');
        this.renderUserInterface();
        this.updateUIForUser();
    }

    // ===== SISTEMA DE BACKUP =====

    createBackup() {
        if (!this.currentUser?.hasPermission('manage_backup')) {
            throw new Error('Sem permissão para criar backups');
        }

        const backupData = {
            id: 'backup_' + Date.now(),
            timestamp: new Date().toISOString(),
            user: this.currentUser.username,
            data: {
                members: this.membershipManager.getAllMembers(),
                payments: this.paymentManager.getAllPayments(),
                trainingSessions: this.attendanceManager.getAllSessions(),
                notifications: this.notificationsManager.getAllNotifications(),
                communications: this.communicationManager.getAllMessages()
            },
            size: JSON.stringify(this.membershipManager.getAllMembers()).length,
            type: 'manual'
        };

        this.backupHistory.push(backupData);
        this.saveBackupHistory();
        
        // Salvar no localStorage
        localStorage.setItem('voleiapp_backup_' + backupData.id, JSON.stringify(backupData));
        
        this.syncSettings.lastBackup = new Date().toISOString();
        this.saveSyncSettings();
        
        this.showToast('Backup criado com sucesso!', 'success');
        this.renderBackupInterface();
        
        return backupData;
    }

    restoreBackup(backupId) {
        if (!this.currentUser?.hasPermission('manage_backup')) {
            throw new Error('Sem permissão para restaurar backups');
        }

        const backup = this.backupHistory.find(b => b.id === backupId);
        if (!backup) {
            throw new Error('Backup não encontrado');
        }

        // Confirmar restauração
        if (!confirm(`Tem certeza que deseja restaurar o backup de ${new Date(backup.timestamp).toLocaleString()}? Esta ação irá sobrescrever todos os dados atuais.`)) {
            return;
        }

        try {
            // Restaurar dados
            if (backup.data.members) {
                localStorage.setItem('voleiapp_members', JSON.stringify(backup.data.members));
                this.membershipManager.loadMembers();
            }
            
            if (backup.data.payments) {
                localStorage.setItem('voleiapp_payments', JSON.stringify(backup.data.payments));
                this.paymentManager.loadPayments();
            }
            
            if (backup.data.trainingSessions) {
                localStorage.setItem('voleiapp_training_sessions', JSON.stringify(backup.data.trainingSessions));
                this.attendanceManager.loadSessions();
            }
            
            if (backup.data.notifications) {
                localStorage.setItem('voleiapp_notifications', JSON.stringify(backup.data.notifications));
                this.notificationsManager.loadNotifications();
            }
            
            if (backup.data.communications) {
                localStorage.setItem('voleiapp_communications', JSON.stringify(backup.data.communications));
                this.communicationManager.loadMessages();
            }

            this.showToast('Backup restaurado com sucesso!', 'success');
            
            // Recarregar interfaces
            if (window.refreshMembers) window.refreshMembers();
            if (window.refreshPayments) window.refreshPayments();
            if (this.attendanceManager) this.attendanceManager.renderSessions();
            if (this.notificationsManager) this.notificationsManager.renderNotifications();
            if (this.communicationManager) this.communicationManager.renderAll();
            
        } catch (error) {
            this.showToast('Erro ao restaurar backup: ' + error.message, 'error');
        }
    }

    deleteBackup(backupId) {
        if (!this.currentUser?.hasPermission('manage_backup')) {
            throw new Error('Sem permissão para deletar backups');
        }

        const backupIndex = this.backupHistory.findIndex(b => b.id === backupId);
        if (backupIndex === -1) {
            throw new Error('Backup não encontrado');
        }

        const deletedBackup = this.backupHistory.splice(backupIndex, 1)[0];
        this.saveBackupHistory();
        
        // Remover do localStorage
        localStorage.removeItem('voleiapp_backup_' + backupId);
        
        this.showToast('Backup removido com sucesso!', 'success');
        this.renderBackupInterface();
    }

    exportBackup(backupId) {
        const backup = this.backupHistory.find(b => b.id === backupId);
        if (!backup) {
            throw new Error('Backup não encontrado');
        }

        const dataStr = JSON.stringify(backup, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `voleiapp_backup_${backupId}_${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Backup exportado com sucesso!', 'success');
    }

    // ===== SINCRONIZAÇÃO COM GOOGLE DRIVE =====

    async enableGoogleDrive() {
        if (!this.currentUser?.hasPermission('manage_backup')) {
            throw new Error('Sem permissão para configurar Google Drive');
        }

        try {
            // Em uma implementação real, aqui seria feita a autenticação OAuth2
            // Para demo, simularemos o processo
            this.showToast('Configurando Google Drive...', 'info');
            
            // Simular configuração
            setTimeout(() => {
                this.syncSettings.googleDriveEnabled = true;
                this.saveSyncSettings();
                this.showToast('Google Drive configurado com sucesso!', 'success');
                this.renderBackupInterface();
            }, 2000);
            
        } catch (error) {
            this.showToast('Erro ao configurar Google Drive: ' + error.message, 'error');
        }
    }

    async syncWithGoogleDrive() {
        if (!this.syncSettings.googleDriveEnabled) {
            throw new Error('Google Drive não está configurado');
        }

        if (!this.currentUser?.hasPermission('manage_backup')) {
            throw new Error('Sem permissão para sincronizar');
        }

        try {
            this.showToast('Sincronizando com Google Drive...', 'info');
            
            // Simular sincronização
            setTimeout(() => {
                this.syncSettings.lastSync = new Date().toISOString();
                this.saveSyncSettings();
                this.showToast('Sincronização concluída com sucesso!', 'success');
                this.renderBackupInterface();
            }, 3000);
            
        } catch (error) {
            this.showToast('Erro na sincronização: ' + error.message, 'error');
        }
    }

    // ===== BACKUP AUTOMÁTICO =====

    setupAutoBackup() {
        if (this.syncSettings.autoBackup) {
            setInterval(() => {
                this.createAutomaticBackup();
            }, this.syncSettings.backupInterval);
        }
    }

    createAutomaticBackup() {
        try {
            const backupData = {
                id: 'auto_backup_' + Date.now(),
                timestamp: new Date().toISOString(),
                user: 'Sistema',
                data: {
                    members: this.membershipManager.getAllMembers(),
                    payments: this.paymentManager.getAllPayments(),
                    trainingSessions: this.attendanceManager.getAllSessions(),
                    notifications: this.notificationsManager.getAllNotifications(),
                    communications: this.communicationManager.getAllMessages()
                },
                size: JSON.stringify(this.membershipManager.getAllMembers()).length,
                type: 'automatic'
            };

            this.backupHistory.push(backupData);
            this.saveBackupHistory();
            
            this.syncSettings.lastBackup = new Date().toISOString();
            this.saveSyncSettings();
            
            console.log('Backup automático criado:', backupData.id);
            
        } catch (error) {
            console.error('Erro no backup automático:', error);
        }
    }

    // ===== INTERFACE DO USUÁRIO =====

    renderUserInterface() {
        const userSection = document.getElementById('userSection');
        if (!userSection) return;

        if (!this.currentUser) {
            // Mostrar formulário de login
            userSection.innerHTML = `
                <div class="login-form">
                    <h3><i class="fas fa-sign-in-alt"></i> Login</h3>
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginUsername">Usuário</label>
                            <input type="text" id="loginUsername" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Senha</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt"></i> Entrar
                        </button>
                    </form>
                </div>
            `;

            this.setupLoginForm();
        } else {
            // Mostrar informações do usuário
            userSection.innerHTML = `
                <div class="user-info">
                    <div class="user-header">
                        <h3><i class="fas fa-user"></i> ${this.currentUser.username}</h3>
                        <button class="btn btn-secondary" onclick="backupManager.logout()">
                            <i class="fas fa-sign-out-alt"></i> Sair
                        </button>
                    </div>
                    <div class="user-details">
                        <p><strong>Função:</strong> ${this.getRoleText(this.currentUser.role)}</p>
                        <p><strong>Último login:</strong> ${this.currentUser.lastLogin ? new Date(this.currentUser.lastLogin).toLocaleString() : 'Nunca'}</p>
                    </div>
                </div>
            `;
        }
    }

    renderBackupInterface() {
        const backupSection = document.getElementById('backupSection');
        if (!backupSection || !this.currentUser) return;

        const canManageBackup = this.currentUser.hasPermission('manage_backup');
        const canManageUsers = this.currentUser.hasPermission('manage_users');

        backupSection.innerHTML = `
            <div class="backup-controls">
                <div class="backup-actions">
                    ${canManageBackup ? `
                        <button class="btn btn-primary" onclick="backupManager.createBackup()">
                            <i class="fas fa-download"></i> Criar Backup
                        </button>
                        <button class="btn btn-secondary" onclick="backupManager.enableGoogleDrive()">
                            <i class="fab fa-google-drive"></i> Configurar Google Drive
                        </button>
                        <button class="btn btn-info" onclick="backupManager.syncWithGoogleDrive()" ${!this.syncSettings.googleDriveEnabled ? 'disabled' : ''}>
                            <i class="fas fa-sync"></i> Sincronizar
                        </button>
                    ` : ''}
                </div>
                
                <div class="backup-status">
                    <p><strong>Último backup:</strong> ${this.syncSettings.lastBackup ? new Date(this.syncSettings.lastBackup).toLocaleString() : 'Nunca'}</p>
                    <p><strong>Google Drive:</strong> ${this.syncSettings.googleDriveEnabled ? 'Configurado' : 'Não configurado'}</p>
                    <p><strong>Última sincronização:</strong> ${this.syncSettings.lastSync ? new Date(this.syncSettings.lastSync).toLocaleString() : 'Nunca'}</p>
                </div>
            </div>

            <div class="backup-history">
                <h4><i class="fas fa-history"></i> Histórico de Backups</h4>
                <div id="backupHistoryList" class="backup-list"></div>
            </div>

            ${canManageUsers ? `
                <div class="user-management">
                    <h4><i class="fas fa-users-cog"></i> Gerenciamento de Usuários</h4>
                    <button class="btn btn-primary" onclick="backupManager.showCreateUserForm()">
                        <i class="fas fa-user-plus"></i> Novo Usuário
                    </button>
                    <div id="usersList" class="users-list"></div>
                </div>
            ` : ''}
        `;

        this.renderBackupHistory();
        if (canManageUsers) {
            this.renderUsersList();
        }
    }

    renderBackupHistory() {
        const backupHistoryList = document.getElementById('backupHistoryList');
        if (!backupHistoryList) return;

        if (this.backupHistory.length === 0) {
            backupHistoryList.innerHTML = '<p class="no-backups">Nenhum backup encontrado.</p>';
            return;
        }

        const canManageBackup = this.currentUser?.hasPermission('manage_backup');
        
        backupHistoryList.innerHTML = this.backupHistory
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(backup => `
                <div class="backup-item ${backup.type}">
                    <div class="backup-header">
                        <div class="backup-info">
                            <h5>${backup.type === 'automatic' ? '🔄 Backup Automático' : '📥 Backup Manual'}</h5>
                            <p><strong>Criado por:</strong> ${backup.user}</p>
                            <p><strong>Data:</strong> ${new Date(backup.timestamp).toLocaleString()}</p>
                            <p><strong>Tamanho:</strong> ${this.formatBytes(backup.size)}</p>
                        </div>
                        <div class="backup-actions">
                            ${canManageBackup ? `
                                <button class="btn btn-sm btn-warning" onclick="backupManager.restoreBackup('${backup.id}')">
                                    <i class="fas fa-undo"></i> Restaurar
                                </button>
                                <button class="btn btn-sm btn-info" onclick="backupManager.exportBackup('${backup.id}')">
                                    <i class="fas fa-download"></i> Exportar
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="backupManager.deleteBackup('${backup.id}')">
                                    <i class="fas fa-trash"></i> Deletar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
    }

    renderUsersList() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        usersList.innerHTML = this.users.map(user => `
            <div class="user-item ${user.isActive ? 'active' : 'inactive'}">
                <div class="user-info">
                    <h5>${user.username}</h5>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Função:</strong> ${this.getRoleText(user.role)}</p>
                    <p><strong>Status:</strong> ${user.isActive ? 'Ativo' : 'Inativo'}</p>
                    <p><strong>Criado em:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div class="user-actions">
                    <button class="btn btn-sm btn-secondary" onclick="backupManager.showEditUserForm('${user.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    ${user.id !== this.currentUser?.id ? `
                        <button class="btn btn-sm btn-danger" onclick="backupManager.deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i> Deletar
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // ===== FORMULÁRIOS =====

    showCreateUserForm() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> Novo Usuário</h3>
                    <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="createUserForm">
                        <div class="form-group">
                            <label for="newUsername">Usuário *</label>
                            <input type="text" id="newUsername" required>
                        </div>
                        <div class="form-group">
                            <label for="newEmail">Email *</label>
                            <input type="email" id="newEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="newRole">Função *</label>
                            <select id="newRole" required>
                                <option value="user">Usuário</option>
                                <option value="manager">Gerente</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Criar Usuário</button>
                            <button type="button" class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupCreateUserForm();
    }

    showEditUserForm(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-edit"></i> Editar Usuário</h3>
                    <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="editUserForm">
                        <input type="hidden" id="editUserId" value="${user.id}">
                        <div class="form-group">
                            <label for="editUsername">Usuário *</label>
                            <input type="text" id="editUsername" value="${user.username}" required>
                        </div>
                        <div class="form-group">
                            <label for="editEmail">Email *</label>
                            <input type="email" id="editEmail" value="${user.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="editRole">Função *</label>
                            <select id="editRole" required>
                                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuário</option>
                                <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Gerente</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="editIsActive" ${user.isActive ? 'checked' : ''}>
                                Usuário Ativo
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Atualizar Usuário</button>
                            <button type="button" class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupEditUserForm();
    }

    setupCreateUserForm() {
        const form = document.getElementById('createUserForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            try {
                const userData = {
                    username: document.getElementById('newUsername').value,
                    email: document.getElementById('newEmail').value,
                    role: document.getElementById('newRole').value
                };

                this.createUser(userData);
                form.parentElement.parentElement.remove();
                
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
    }

    setupEditUserForm() {
        const form = document.getElementById('editUserForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            try {
                const userId = document.getElementById('editUserId').value;
                const updates = {
                    username: document.getElementById('editUsername').value,
                    email: document.getElementById('editEmail').value,
                    role: document.getElementById('editRole').value,
                    isActive: document.getElementById('editIsActive').checked
                };

                this.updateUser(userId, updates);
                form.parentElement.parentElement.remove();
                
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
    }

    setupLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            try {
                const username = document.getElementById('loginUsername').value;
                const password = document.getElementById('loginPassword').value;

                this.login(username, password);
                
            } catch (error) {
                this.showToast(error.message, 'error');
            }
        });
    }

    // ===== PERMISSÕES E CONTROLE DE ACESSO =====

    setupPermissionChecks() {
        // Verificar permissões antes de mostrar seções
        this.checkSectionPermissions();
        
        // Observar mudanças no DOM para aplicar permissões
        const observer = new MutationObserver(() => {
            this.checkSectionPermissions();
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    checkSectionPermissions() {
        if (!this.currentUser) return;

        // Seções que requerem permissões específicas
        const sections = [
            { id: 'members-section', permission: 'members' },
            { id: 'payments-section', permission: 'payments' },
            { id: 'attendance-section', permission: 'attendance' },
            { id: 'dashboard-section', permission: 'dashboard' },
            { id: 'notifications-section', permission: 'notifications' },
            { id: 'communication-section', permission: 'communication' }
        ];

        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
                if (this.currentUser.canAccess(section.permission)) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            }
        });
    }

    updateUIForUser() {
        if (!this.currentUser) {
            // Usuário não logado - mostrar apenas seção de login
            this.hideAllSections();
            this.showSection('backup-section');
        } else {
            // Usuário logado - mostrar seções baseadas em permissões
            this.showAllSections();
            this.checkSectionPermissions();
        }
    }

    hideAllSections() {
        const sections = [
            'members-section', 'payments-section', 'attendance-section',
            'dashboard-section', 'notifications-section', 'communication-section'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'none';
        });
    }

    showAllSections() {
        const sections = [
            'members-section', 'payments-section', 'attendance-section',
            'dashboard-section', 'notifications-section', 'communication-section'
        ];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) section.style.display = 'block';
        });
    }

    showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
    }

    // ===== UTILITÁRIOS =====

    getRoleText(role) {
        const roles = {
            'admin': 'Administrador',
            'manager': 'Gerente',
            'user': 'Usuário'
        };
        return roles[role] || role;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showToast(message, type = 'info') {
        // Implementar sistema de toast ou usar alert para demo
        if (type === 'error') {
            alert('❌ ' + message);
        } else if (type === 'success') {
            alert('✅ ' + message);
        } else {
            alert('ℹ️ ' + message);
        }
    }

    // ===== PERSISTÊNCIA =====

    saveUsers() {
        localStorage.setItem('voleiapp_users', JSON.stringify(this.users));
    }

    loadUsers() {
        const usersData = localStorage.getItem('voleiapp_users');
        if (usersData) {
            this.users = JSON.parse(usersData).map(userData => new User(userData));
        }
    }

    saveBackupHistory() {
        localStorage.setItem('voleiapp_backup_history', JSON.stringify(this.backupHistory));
    }

    loadBackupHistory() {
        const historyData = localStorage.getItem('voleiapp_backup_history');
        if (historyData) {
            this.backupHistory = JSON.parse(historyData);
        }
    }

    saveSyncSettings() {
        localStorage.setItem('voleiapp_sync_settings', JSON.stringify(this.syncSettings));
    }

    loadSyncSettings() {
        const settingsData = localStorage.getItem('voleiapp_sync_settings');
        if (settingsData) {
            this.syncSettings = { ...this.syncSettings, ...JSON.parse(settingsData) };
        }
    }
}

// Variável global para acesso
window.backupManager = null;