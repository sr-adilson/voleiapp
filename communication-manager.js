class CommunicationMessage {
    constructor({ id, type, title, content, author, target, priority, expiresAt, createdAt }) {
        this.id = id || this._generateId();
        this.type = type; // 'announcement', 'message', 'reminder'
        this.title = title;
        this.content = content;
        this.author = author; // ID do membro ou 'system'
        this.target = target; // 'all', 'specific_member_id', ou array de IDs
        this.priority = priority; // 'low', 'medium', 'high', 'urgent'
        this.expiresAt = expiresAt ? new Date(expiresAt) : null;
        this.createdAt = createdAt ? new Date(createdAt) : new Date();
        this.readBy = [];
        this.acknowledgedBy = [];
    }

    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    isExpired() {
        return this.expiresAt && new Date() > this.expiresAt;
    }

    isReadBy(memberId) {
        return this.readBy.includes(memberId);
    }

    isAcknowledgedBy(memberId) {
        return this.acknowledgedBy.includes(memberId);
    }

    markAsRead(memberId) {
        if (!this.isReadBy(memberId)) {
            this.readBy.push(memberId);
        }
    }

    markAsAcknowledged(memberId) {
        if (!this.isAcknowledgedBy(memberId)) {
            this.acknowledgedBy.push(memberId);
        }
    }

    getPriorityColor() {
        const colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'urgent': '#dc3545'
        };
        return colors[this.priority] || '#6c757d';
    }

    getPriorityText() {
        const texts = {
            'low': 'Baixa',
            'medium': 'Média',
            'high': 'Alta',
            'urgent': 'Urgente'
        };
        return texts[this.priority] || 'Normal';
    }

    getTypeText() {
        const texts = {
            'announcement': 'Aviso',
            'message': 'Mensagem',
            'reminder': 'Lembrete'
        };
        return texts[this.type] || 'Comunicação';
    }

    getTypeIcon() {
        const icons = {
            'announcement': 'fa-bullhorn',
            'message': 'fa-envelope',
            'reminder': 'fa-bell'
        };
        return icons[this.type] || 'fa-comment';
    }
}

class CommunicationManager {
    constructor({ membershipManager, paymentManager, attendanceManager }) {
        this.membershipManager = membershipManager;
        this.paymentManager = paymentManager;
        this.attendanceManager = attendanceManager;
        this.messages = [];
        this.currentUser = null; // ID do usuário logado
        this.notifications = [];
        
        this.loadMessages();
        this.setupAutoChecks();
    }

    initializeCommunicationSystem() {
        this.renderAnnouncements();
        this.renderMessages();
        this.renderCommunicationHistory();
        this.setupEventListeners();
        this.checkForNewMessages();
    }

    // Gerenciamento de Mensagens
    addMessage(messageData) {
        const message = new CommunicationMessage(messageData);
        this.messages.push(message);
        this.saveMessages();
        this.renderAnnouncements();
        this.renderMessages();
        this.renderCommunicationHistory();
        
        // Notificar destinatários
        this.notifyRecipients(message);
        
        return message;
    }

    deleteMessage(messageId) {
        const index = this.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            this.messages.splice(index, 1);
            this.saveMessages();
            this.renderAnnouncements();
            this.renderMessages();
            this.renderCommunicationHistory();
        }
    }

    markMessageAsRead(messageId, memberId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.markAsRead(memberId);
            this.saveMessages();
            this.renderMessages();
        }
    }

    markMessageAsAcknowledged(messageId, memberId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.markAsAcknowledged(memberId);
            this.saveMessages();
            this.renderMessages();
        }
    }

    // Filtros e Busca
    getMessagesByType(type) {
        return this.messages.filter(m => m.type === type && !m.isExpired());
    }

    getMessagesByPriority(priority) {
        return this.messages.filter(m => m.priority === priority && !m.isExpired());
    }

    getMessagesForMember(memberId) {
        return this.messages.filter(m => 
            (m.target === 'all' || m.target === memberId || 
             (Array.isArray(m.target) && m.target.includes(memberId))) && 
            !m.isExpired()
        );
    }

    getUnreadMessagesForMember(memberId) {
        return this.getMessagesForMember(memberId).filter(m => !m.isReadBy(memberId));
    }

    // Sistema de Notificações
    notifyRecipients(message) {
        let recipients = [];
        
        if (message.target === 'all') {
            recipients = this.membershipManager.members.map(m => m.id);
        } else if (typeof message.target === 'string') {
            recipients = [message.target];
        } else if (Array.isArray(message.target)) {
            recipients = message.target;
        }

        recipients.forEach(memberId => {
            if (memberId !== message.author) {
                this.addNotification({
                    memberId,
                    messageId: message.id,
                    title: message.title,
                    content: message.content,
                    type: message.type,
                    priority: message.priority
                });
            }
        });
    }

    addNotification(notificationData) {
        const notification = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            ...notificationData,
            createdAt: new Date(),
            read: false
        };
        
        this.notifications.push(notification);
        this.saveNotifications();
        
        // Mostrar notificação push se disponível
        this.showPushNotification(notification);
    }

    markNotificationAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
        }
    }

    // Notificações Push
    showPushNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.content,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showToast('Notificações ativadas!', 'success');
                }
            });
        }
    }

    // Renderização da UI
    renderAnnouncements() {
        const container = document.getElementById('announcementsList');
        if (!container) return;

        const announcements = this.getMessagesByType('announcement');
        
        if (announcements.length === 0) {
            container.innerHTML = '<p class="no-messages">Nenhum aviso no momento.</p>';
            return;
        }

        container.innerHTML = announcements.map(announcement => `
            <div class="announcement-item ${announcement.priority}" data-id="${announcement.id}">
                <div class="announcement-header">
                    <div class="announcement-meta">
                        <i class="fas ${announcement.getTypeIcon()}"></i>
                        <span class="announcement-title">${announcement.title}</span>
                        <span class="announcement-priority" style="color: ${announcement.getPriorityColor()}">
                            ${announcement.getPriorityText()}
                        </span>
                    </div>
                    <div class="announcement-actions">
                        <button class="btn-acknowledge" onclick="communicationManager.acknowledgeAnnouncement('${announcement.id}')">
                            <i class="fas fa-check"></i> Confirmar
                        </button>
                    </div>
                </div>
                <div class="announcement-content">
                    ${announcement.content}
                </div>
                <div class="announcement-footer">
                    <small>
                        <i class="fas fa-user"></i> ${this.getAuthorName(announcement.author)} | 
                        <i class="fas fa-clock"></i> ${this.formatDate(announcement.createdAt)}
                        ${announcement.expiresAt ? ` | Expira: ${this.formatDate(announcement.expiresAt)}` : ''}
                    </small>
                </div>
            </div>
        `).join('');
    }

    renderMessages() {
        const container = document.getElementById('messagesList');
        if (!container) return;

        const messages = this.getMessagesByType('message');
        
        if (messages.length === 0) {
            container.innerHTML = '<p class="no-messages">Nenhuma mensagem no momento.</p>';
            return;
        }

        container.innerHTML = messages.map(message => `
            <div class="message-item ${message.priority} ${this.isMessageRead(message.id) ? 'read' : 'unread'}" data-id="${message.id}">
                <div class="message-header">
                    <div class="message-meta">
                        <i class="fas ${message.getTypeIcon()}"></i>
                        <span class="message-title">${message.title}</span>
                        <span class="message-priority" style="color: ${message.getPriorityColor()}">
                            ${message.getPriorityText()}
                        </span>
                    </div>
                    <div class="message-actions">
                        <button class="btn-mark-read" onclick="communicationManager.markMessageAsRead('${message.id}', '${this.currentUser || 'guest'}')">
                            <i class="fas fa-eye"></i> Marcar como lida
                        </button>
                    </div>
                </div>
                <div class="message-content">
                    ${message.content}
                </div>
                <div class="message-footer">
                    <small>
                        <i class="fas fa-user"></i> ${this.getAuthorName(message.author)} | 
                        <i class="fas fa-clock"></i> ${this.formatDate(message.createdAt)}
                        ${message.target !== 'all' ? ` | Para: ${this.getTargetNames(message.target)}` : ''}
                    </small>
                </div>
            </div>
        `).join('');
    }

    renderCommunicationHistory() {
        const container = document.getElementById('communicationHistory');
        if (!container) return;

        const allMessages = [...this.messages].sort((a, b) => b.createdAt - a.createdAt);
        
        if (allMessages.length === 0) {
            container.innerHTML = '<p class="no-messages">Nenhuma comunicação registrada.</p>';
            return;
        }

        container.innerHTML = allMessages.map(message => `
            <div class="history-item ${message.type} ${message.isExpired() ? 'expired' : ''}" data-id="${message.id}">
                <div class="history-header">
                    <div class="history-meta">
                        <i class="fas ${message.getTypeIcon()}"></i>
                        <span class="history-title">${message.title}</span>
                        <span class="history-type">${message.getTypeText()}</span>
                        <span class="history-priority" style="color: ${message.getPriorityColor()}">
                            ${message.getPriorityText()}
                        </span>
                    </div>
                    <div class="history-status">
                        ${message.isExpired() ? '<span class="expired-badge">Expirado</span>' : ''}
                        ${this.isMessageRead(message.id) ? '<span class="read-badge">Lida</span>' : '<span class="unread-badge">Não lida</span>'}
                    </div>
                </div>
                <div class="history-content">
                    ${message.content}
                </div>
                <div class="history-footer">
                    <small>
                        <i class="fas fa-user"></i> ${this.getAuthorName(message.author)} | 
                        <i class="fas fa-clock"></i> ${this.formatDate(message.createdAt)}
                        ${message.expiresAt ? ` | Expirou: ${this.formatDate(message.expiresAt)}` : ''}
                    </small>
                </div>
            </div>
        `).join('');
    }

    // Event Listeners
    setupEventListeners() {
        // Form de novo aviso
        const announcementForm = document.getElementById('announcementForm');
        if (announcementForm) {
            announcementForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewAnnouncement();
            });
        }

        // Form de nova mensagem
        const messageForm = document.getElementById('messageForm');
        if (messageForm) {
            messageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewMessage();
            });
        }

        // Botões de ação
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-acknowledge')) {
                const messageId = e.target.closest('[data-id]').dataset.id;
                this.acknowledgeAnnouncement(messageId);
            }
        });
    }

    // Handlers de Formulários
    handleNewAnnouncement() {
        const form = document.getElementById('announcementForm');
        const formData = new FormData(form);
        
        const announcementData = {
            type: 'announcement',
            title: formData.get('title'),
            content: formData.get('content'),
            author: this.currentUser || 'system',
            target: 'all',
            priority: formData.get('priority'),
            expiresAt: formData.get('expiresAt') || null
        };

        this.addMessage(announcementData);
        form.reset();
        this.showToast('Aviso criado com sucesso!', 'success');
    }

    handleNewMessage() {
        const form = document.getElementById('messageForm');
        const formData = new FormData(form);
        
        const messageData = {
            type: 'message',
            title: formData.get('title'),
            content: formData.get('content'),
            author: this.currentUser || 'system',
            target: formData.get('target') || 'all',
            priority: formData.get('priority')
        };

        this.addMessage(messageData);
        form.reset();
        this.showToast('Mensagem enviada com sucesso!', 'success');
    }

    // Métodos de Apoio
    acknowledgeAnnouncement(messageId) {
        if (this.currentUser) {
            this.markMessageAsAcknowledged(messageId, this.currentUser);
            this.showToast('Aviso confirmado!', 'success');
        } else {
            this.showToast('Faça login para confirmar avisos', 'warning');
        }
    }

    getAuthorName(authorId) {
        if (authorId === 'system') return 'Sistema';
        const member = this.membershipManager.members.find(m => m.id === authorId);
        return member ? member.name : 'Usuário desconhecido';
    }

    getTargetNames(target) {
        if (target === 'all') return 'Todos';
        if (typeof target === 'string') {
            const member = this.membershipManager.members.find(m => m.id === target);
            return member ? member.name : 'Usuário desconhecido';
        }
        if (Array.isArray(target)) {
            return target.map(id => this.getAuthorName(id)).join(', ');
        }
        return 'Específico';
    }

    isMessageRead(messageId) {
        if (!this.currentUser) return false;
        const message = this.messages.find(m => m.id === messageId);
        return message ? message.isReadBy(this.currentUser) : false;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Verificações Automáticas
    setupAutoChecks() {
        // Verificar mensagens expiradas a cada hora
        setInterval(() => {
            this.checkExpiredMessages();
        }, 60 * 60 * 1000);

        // Verificar novas mensagens a cada 5 minutos
        setInterval(() => {
            this.checkForNewMessages();
        }, 5 * 60 * 1000);
    }

    checkExpiredMessages() {
        const expiredMessages = this.messages.filter(m => m.isExpired());
        if (expiredMessages.length > 0) {
            this.renderAnnouncements();
            this.renderMessages();
            this.renderCommunicationHistory();
        }
    }

    checkForNewMessages() {
        // Aqui você pode implementar verificação de novas mensagens
        // Por exemplo, de uma API externa ou websocket
    }

    // Persistência
    saveMessages() {
        localStorage.setItem('communication_messages', JSON.stringify(this.messages));
    }

    loadMessages() {
        const saved = localStorage.getItem('communication_messages');
        if (saved) {
            this.messages = JSON.parse(saved).map(m => new CommunicationMessage(m));
        }
    }

    saveNotifications() {
        localStorage.setItem('communication_notifications', JSON.stringify(this.notifications));
    }

    loadNotifications() {
        const saved = localStorage.getItem('communication_notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    }

    // Exportação e Importação
    exportCommunicationData() {
        const data = {
            messages: this.messages,
            notifications: this.notifications,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comunicacoes_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Utilitários
    showToast(message, type = 'info') {
        // Implementar sistema de toast se necessário
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    setCurrentUser(userId) {
        this.currentUser = userId;
    }
}

// Inicialização global
window.communicationManager = null;