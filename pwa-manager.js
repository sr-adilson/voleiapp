/**
 * Gerenciador PWA para VoleiApp
 * Gerencia instalação, notificações push, funcionalidades offline e sincronização
 */

class PWAManager {
  constructor() {
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.deferredPrompt = null;
    this.registration = null;
    this.syncManager = null;
    this.notificationPermission = 'default';
    
    this.init();
  }

  async init() {
    try {
      // Verificar se o service worker é suportado
      if ('serviceWorker' in navigator) {
        await this.registerServiceWorker();
      }

      // Verificar se é uma PWA instalada
      this.checkIfInstalled();

      // Configurar listeners de conectividade
      this.setupConnectivityListeners();

      // Configurar listener para instalação
      this.setupInstallListener();

      // Verificar permissões de notificação
      this.checkNotificationPermission();

      // Configurar sincronização em background
      this.setupBackgroundSync();

      console.log('PWA Manager inicializado');
    } catch (error) {
      console.error('Erro ao inicializar PWA Manager:', error);
    }
  }

  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', this.registration);

      // Aguardar o service worker estar ativo
      await navigator.serviceWorker.ready;
      console.log('Service Worker ativo');

      // Verificar se há atualizações
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.showUpdateNotification();
          }
        });
      });

      // Verificar se o service worker foi atualizado
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker atualizado, recarregando página...');
        window.location.reload();
      });

    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }

  checkIfInstalled() {
    // Verificar se a aplicação está rodando como PWA
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      this.isInstalled = true;
      this.onPWAInstalled();
    }
  }

  setupConnectivityListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.onOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.onOffline();
    });
  }

  setupInstallListener() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.onPWAInstalled();
      this.deferredPrompt = null;
    });
  }

  async checkNotificationPermission() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
      
      if (this.notificationPermission === 'default') {
        // Solicitar permissão quando o usuário interagir
        this.setupNotificationPermissionRequest();
      }
    }
  }

  setupNotificationPermissionRequest() {
    // Adicionar botão para solicitar permissão de notificação
    const notificationBtn = document.createElement('button');
    notificationBtn.className = 'btn btn-primary notification-permission-btn';
    notificationBtn.innerHTML = '<i class="fas fa-bell"></i> Ativar Notificações';
    notificationBtn.onclick = () => this.requestNotificationPermission();
    
    // Adicionar ao header ou área apropriada
    const header = document.querySelector('.header');
    if (header) {
      header.appendChild(notificationBtn);
    }
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === 'granted') {
        this.setupPushNotifications();
        this.showToast('Notificações ativadas com sucesso!', 'success');
      } else {
        this.showToast('Permissão de notificação negada', 'warning');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificação:', error);
    }
  }

  async setupPushNotifications() {
    try {
      if (!this.registration) {
        console.log('Service Worker não registrado');
        return;
      }

      // Verificar se o Push Manager é suportado
      if (!('PushManager' in window)) {
        console.log('Push Manager não suportado');
        return;
      }

      // Obter subscription existente
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Criar nova subscription (simulada)
        subscription = await this.createPushSubscription();
      }

      console.log('Push subscription configurada:', subscription);
      
      // Configurar notificações automáticas
      this.setupAutomaticNotifications();

    } catch (error) {
      console.error('Erro ao configurar notificações push:', error);
    }
  }

  async createPushSubscription() {
    // Simular criação de subscription
    // Em produção, isso seria feito com um servidor real
    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/simulated',
      keys: {
        p256dh: 'simulated-p256dh-key',
        auth: 'simulated-auth-key'
      }
    };

    await this.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'simulated-vapid-key'
    });

    return subscription;
  }

  setupAutomaticNotifications() {
    // Configurar notificações automáticas baseadas em eventos do sistema
    this.setupPaymentReminders();
    this.setupTrainingReminders();
    this.setupCommunicationNotifications();
  }

  setupPaymentReminders() {
    // Verificar pagamentos vencidos diariamente
    setInterval(() => {
      this.checkOverduePayments();
    }, 24 * 60 * 60 * 1000); // 24 horas
  }

  setupTrainingReminders() {
    // Verificar treinos próximos a cada hora
    setInterval(() => {
      this.checkUpcomingTrainings();
    }, 60 * 60 * 1000); // 1 hora
  }

  setupCommunicationNotifications() {
    // Verificar novas mensagens a cada 5 minutos
    setInterval(() => {
      this.checkNewMessages();
    }, 5 * 60 * 1000); // 5 minutos
  }

  async checkOverduePayments() {
    try {
      if (window.paymentManager) {
        const overduePayments = window.paymentManager.getOverduePayments();
        
        if (overduePayments.length > 0) {
          this.showNotification(
            'Pagamentos Vencidos',
            `${overduePayments.length} pagamento(s) vencido(s). Verifique o sistema.`,
            'payment-overdue'
          );
        }
      }
    } catch (error) {
      console.error('Erro ao verificar pagamentos vencidos:', error);
    }
  }

  async checkUpcomingTrainings() {
    try {
      if (window.attendanceManager) {
        const upcomingTrainings = window.attendanceManager.getUpcomingTrainings();
        
        if (upcomingTrainings.length > 0) {
          this.showNotification(
            'Treinos Próximos',
            `${upcomingTrainings.length} treino(s) programado(s) para hoje.`,
            'training-reminder'
          );
        }
      }
    } catch (error) {
      console.error('Erro ao verificar treinos próximos:', error);
    }
  }

  async checkNewMessages() {
    try {
      if (window.communicationManager) {
        const newMessages = window.communicationManager.getNewMessages();
        
        if (newMessages.length > 0) {
          this.showNotification(
            'Novas Mensagens',
            `${newMessages.length} nova(s) mensagem(ns) recebida(s).`,
            'new-message'
          );
        }
      }
    } catch (error) {
      console.error('Erro ao verificar novas mensagens:', error);
    }
  }

  async setupBackgroundSync() {
    try {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        this.syncManager = await navigator.serviceWorker.ready;
        console.log('Background Sync configurado');
      }
    } catch (error) {
      console.error('Erro ao configurar Background Sync:', error);
    }
  }

  async registerBackgroundSync(tag) {
    try {
      if (this.syncManager) {
        await this.syncManager.sync.register(tag);
        console.log('Sincronização em background registrada:', tag);
      }
    } catch (error) {
      console.error('Erro ao registrar sincronização em background:', error);
    }
  }

  showInstallPrompt() {
    if (!this.deferredPrompt) return;

    // Criar banner de instalação
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
      <div class="install-content">
        <div class="install-info">
          <i class="fas fa-download"></i>
          <div>
            <h3>Instalar VoleiApp</h3>
            <p>Adicione o VoleiApp à sua tela inicial para acesso rápido e funcionalidades offline</p>
          </div>
        </div>
        <div class="install-actions">
          <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
            Agora não
          </button>
          <button class="btn btn-primary" onclick="window.pwaManager.installPWA()">
            Instalar
          </button>
        </div>
      </div>
    `;

    // Adicionar ao início da página
    document.body.insertBefore(installBanner, document.body.firstChild);

    // Remover automaticamente após 10 segundos
    setTimeout(() => {
      if (installBanner.parentElement) {
        installBanner.remove();
      }
    }, 10000);
  }

  async installPWA() {
    if (!this.deferredPrompt) return;

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('Usuário aceitou instalação PWA');
        this.showToast('PWA instalada com sucesso!', 'success');
      } else {
        console.log('Usuário recusou instalação PWA');
        this.showToast('Instalação cancelada', 'info');
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  }

  showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'update-banner';
    updateBanner.innerHTML = `
      <div class="update-content">
        <i class="fas fa-sync-alt"></i>
        <span>Nova versão disponível!</span>
        <button class="btn btn-primary" onclick="window.location.reload()">
          Atualizar
        </button>
      </div>
    `;

    document.body.insertBefore(updateBanner, document.body.firstChild);
  }

  async showNotification(title, body, tag = 'default') {
    try {
      if (this.notificationPermission !== 'granted') {
        return;
      }

      if (this.registration) {
        await this.registration.showNotification(title, {
          body,
          tag,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
          }
        });
      }
    } catch (error) {
      console.error('Erro ao mostrar notificação:', error);
    }
  }

  onPWAInstalled() {
    console.log('PWA instalada');
    this.showToast('PWA instalada com sucesso!', 'success');
    
    // Remover banner de instalação se existir
    const installBanner = document.querySelector('.install-banner');
    if (installBanner) {
      installBanner.remove();
    }
  }

  onOnline() {
    console.log('Conexão restaurada');
    this.showToast('Conexão restaurada - Sincronizando dados...', 'success');
    
    // Sincronizar dados pendentes
    this.syncPendingData();
    
    // Atualizar indicador de status
    this.updateOnlineStatus(true);
  }

  onOffline() {
    console.log('Conexão perdida');
    this.showToast('Modo offline ativado - Dados salvos localmente', 'warning');
    
    // Atualizar indicador de status
    this.updateOnlineStatus(false);
  }

  async syncPendingData() {
    try {
      if (this.syncManager) {
        await this.registerBackgroundSync('background-sync');
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados pendentes:', error);
    }
  }

  updateOnlineStatus(isOnline) {
    // Atualizar indicador visual de status online/offline
    const statusIndicator = document.querySelector('.online-status');
    if (statusIndicator) {
      statusIndicator.className = `online-status ${isOnline ? 'online' : 'offline'}`;
      statusIndicator.innerHTML = `
        <i class="fas fa-${isOnline ? 'wifi' : 'wifi-slash'}"></i>
        ${isOnline ? 'Online' : 'Offline'}
      `;
    }
  }

  showToast(message, type = 'info') {
    // Implementar sistema de toast notifications
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${this.getToastIcon(type)}"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remover toast após 3 segundos
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  getToastIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }

  // Métodos para integração com outros managers
  registerDataForSync(data) {
    try {
      if (this.registration && this.registration.active) {
        this.registration.active.postMessage({
          type: 'REGISTER_SYNC',
          data
        });
      }
    } catch (error) {
      console.error('Erro ao registrar dados para sincronização:', error);
    }
  }

  getOfflineStatus() {
    return {
      isOnline: this.isOnline,
      isInstalled: this.isInstalled,
      hasNotifications: this.notificationPermission === 'granted',
      hasBackgroundSync: !!this.syncManager
    };
  }

  // Método para limpar cache
  async clearCache() {
    try {
      if (this.registration) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Cache limpo com sucesso');
        this.showToast('Cache limpo com sucesso', 'success');
      }
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      this.showToast('Erro ao limpar cache', 'error');
    }
  }
}

// Variável global para acesso
window.pwaManager = null;