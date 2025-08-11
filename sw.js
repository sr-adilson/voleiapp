/**
 * Service Worker para VoleiApp PWA
 * Gerencia cache offline, sincronização e notificações push
 */

const CACHE_NAME = 'voleiapp-v1.0.0';
const STATIC_CACHE = 'voleiapp-static-v1.0.0';
const DYNAMIC_CACHE = 'voleiapp-dynamic-v1.0.0';

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/payment-manager.js',
  '/attendance-manager.js',
  '/dashboard-manager.js',
  '/notifications-manager.js',
  '/communication-manager.js',
  '/backup-manager.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Recursos dinâmicos para cache
const DYNAMIC_ASSETS = [
  '/api/members',
  '/api/payments',
  '/api/attendance',
  '/api/communications'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Cache estático aberto');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Recursos estáticos em cache');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Erro ao instalar cache estático:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégia: Cache First para recursos estáticos
  if (request.method === 'GET' && STATIC_ASSETS.includes(request.url)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
            .then((fetchResponse) => {
              return caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
    );
    return;
  }
  
  // Estratégia: Network First para dados da API
  if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Retornar dados padrão offline se disponível
              return getOfflineData(request);
            });
        })
    );
    return;
  }
  
  // Estratégia: Stale While Revalidate para outros recursos
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, response.clone());
                });
            }
            return response;
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Sincronização em background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      performBackgroundSync()
    );
  }
});

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Notificação push recebida');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icons/icon-72x72.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Função para sincronização em background
async function performBackgroundSync() {
  try {
    console.log('Iniciando sincronização em background...');
    
    // Sincronizar dados locais
    const syncData = await getLocalDataForSync();
    
    if (syncData.length > 0) {
      console.log('Dados para sincronizar:', syncData.length);
      
      // Simular envio para servidor
      for (const data of syncData) {
        await simulateServerSync(data);
      }
      
      // Limpar dados sincronizados
      await clearSyncedData();
      
      console.log('Sincronização em background concluída');
    }
  } catch (error) {
    console.error('Erro na sincronização em background:', error);
  }
}

// Função para obter dados offline
async function getOfflineData(request) {
  try {
    const url = new URL(request.url);
    
    // Retornar dados padrão baseado no endpoint
    if (url.pathname === '/api/members') {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/api/payments') {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Retornar resposta padrão para outros endpoints
    return new Response(JSON.stringify({ message: 'Dados offline não disponíveis' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro ao obter dados offline:', error);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Função para obter dados locais para sincronização
async function getLocalDataForSync() {
  try {
    // Simular obtenção de dados do IndexedDB ou LocalStorage
    const syncData = [];
    
    // Verificar se há dados pendentes de sincronização
    const pendingData = localStorage.getItem('pendingSync');
    if (pendingData) {
      syncData.push(...JSON.parse(pendingData));
    }
    
    return syncData;
  } catch (error) {
    console.error('Erro ao obter dados para sincronização:', error);
    return [];
  }
}

// Função para simular sincronização com servidor
async function simulateServerSync(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Dado sincronizado:', data);
      resolve();
    }, 100);
  });
}

// Função para limpar dados sincronizados
async function clearSyncedData() {
  try {
    localStorage.removeItem('pendingSync');
    console.log('Dados sincronizados removidos');
  } catch (error) {
    console.error('Erro ao limpar dados sincronizados:', error);
  }
}

// Função para registrar dados pendentes de sincronização
async function registerPendingSync(data) {
  try {
    const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '[]');
    pendingData.push({
      ...data,
      timestamp: Date.now(),
      id: Date.now().toString()
    });
    
    localStorage.setItem('pendingSync', JSON.stringify(pendingData));
    console.log('Dado registrado para sincronização:', data);
  } catch (error) {
    console.error('Erro ao registrar dado para sincronização:', error);
  }
}

// Expor função para uso externo
self.registerPendingSync = registerPendingSync;