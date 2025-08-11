# 🏐 VoleiApp - Sistema Completo de Gestão para Times de Vôlei

Um aplicativo web moderno, responsivo e completo para gerenciar times de vôlei, incluindo controle de membros, pagamentos, treinos, comunicação, backup, PWA e gestão de equipamentos.

## ✨ Funcionalidades Principais

### 🎯 Sistema de Membros
- **Cadastro Completo**: Formulário com validação em tempo real
- **Gerenciamento CRUD**: Criar, visualizar, editar e excluir registros
- **Busca Inteligente**: Filtrar por nome, email, telefone ou posição
- **Estatísticas**: Total de membros e receita mensal
- **Posições de Vôlei**: Levantador, Ponteiro, Meio de Rede, Oposto, Líbero
- **Níveis de Experiência**: Iniciante, Intermediário, Avançado

### 💰 Sistema de Pagamentos
- **Controle Financeiro**: Acompanhamento de mensalidades e pagamentos
- **Geração Automática**: Pagamentos mensais gerados automaticamente
- **Status de Pagamento**: Pendente, Pago, Atrasado, Cancelado
- **Histórico Completo**: Rastreamento de todas as transações
- **Filtros Avançados**: Por mês, ano, status e membro
- **Estatísticas Financeiras**: Receita total, pendente e atrasada

### 📊 Sistema de Presença e Treinos
- **Sessões de Treino**: Criação e gerenciamento de treinos
- **Controle de Presença**: Presente, Ausente, Justificado
- **Estatísticas de Frequência**: Por membro e por sessão
- **Relatórios de Assiduidade**: Acompanhamento de performance

### 📈 Dashboard e Analytics
- **Gráficos Interativos**: Usando Chart.js para visualização de dados
- **Estatísticas Visuais**: Membros, pagamentos, presença
- **Métricas de Performance**: Evolução do time ao longo do tempo
- **Relatórios Dinâmicos**: Dados atualizados em tempo real

### 🔔 Sistema de Notificações
- **Lembretes Automáticos**: Pagamentos vencidos, treinos
- **Notificações Push**: Alertas importantes para o usuário
- **Sistema de Prioridades**: Diferentes tipos de notificação
- **Histórico de Alertas**: Rastreamento de todas as notificações

### 💬 Sistema de Comunicação
- **Anúncios**: Comunicações importantes para o time
- **Mensagens**: Sistema interno de comunicação
- **Histórico de Comunicações**: Arquivo de todas as mensagens
- **Categorização**: Diferentes tipos de comunicação

### ☁️ Sistema de Backup e Sincronização
- **Backup Local**: Exportação de dados em JSON
- **Sincronização**: Simulação de sincronização com nuvem
- **Controle de Usuários**: Sistema básico de permissões
- **Histórico de Backups**: Rastreamento de operações

### 📱 Aplicativo Mobile (PWA)
- **Instalação**: Pode ser instalado como app nativo
- **Funcionamento Offline**: Funciona sem conexão com internet
- **Notificações Push**: Alertas mesmo com app fechado
- **Sincronização**: Dados sincronizados quando online
- **Interface Mobile**: Otimizado para dispositivos móveis

### 🏋️ Sistema de Gestão de Equipamentos
- **Inventário Completo**: Controle de todos os equipamentos
- **Categorias**: Bola, Rede, Uniforme, Outros
- **Controle de Condição**: Excelente, Bom, Regular, Ruim
- **Sistema de Empréstimos**: Controle de equipamentos emprestados
- **Manutenção Preventiva**: Agendamento automático de manutenção
- **Estatísticas**: Relatórios de inventário e uso

## 🚀 Instalação e Configuração

### 📋 Pré-requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Git (opcional, para clonar o repositório)
- Servidor web local (opcional, para desenvolvimento)

### 🔧 Instalação

#### Opção 1: Download Direto
1. Acesse o repositório no GitHub
2. Clique em "Code" → "Download ZIP"
3. Extraia o arquivo ZIP em uma pasta
4. Abra o arquivo `index.html` em seu navegador

#### Opção 2: Clone via Git
```bash
# Clone o repositório
git clone https://github.com/sr-adilson/voleiapp.git

# Entre na pasta do projeto
cd voleiapp

# Abra o arquivo principal
# No Windows: clique duplo em index.html
# No Mac/Linux: open index.html
```

#### Opção 3: Deploy no GitHub Pages
1. Faça fork do repositório
2. Vá em Settings → Pages
3. Selecione a branch `main`
4. Acesse o link gerado

### 🌐 Acesso
- **Local**: Abra `index.html` em seu navegador
- **URL**: `file:///caminho/para/voleiapp/index.html`
- **Servidor Local**: `http://localhost/voleiapp/`

## 📖 Como Usar

### 🏠 Primeira Acesso
1. **Abra o aplicativo** no navegador
2. **Aceite as permissões** de notificação (recomendado)
3. **Instale como PWA** (opcional, mas recomendado para mobile)

### 👥 Gerenciando Membros

#### Cadastrar Novo Membro
1. Preencha o formulário com:
   - **Nome completo** (obrigatório)
   - **E-mail** (obrigatório, deve ser único)
   - **Telefone** (obrigatório, formato brasileiro)
   - **Idade** (obrigatório, 14-80 anos)
   - **Mensalidade** (obrigatório, valor > 0)
   - **Data de início** (obrigatório)
   - **Posição** (opcional: Levantador, Ponteiro, etc.)
   - **Experiência** (opcional: Iniciante, Intermediário, Avançado)
   - **Observações** (opcional)
2. Clique em "Cadastrar Mensalista"

#### Gerenciar Membros Existentes
- **Visualizar**: Todos os membros aparecem em cards organizados
- **Buscar**: Use a caixa de busca para encontrar membros específicos
- **Editar**: Clique no botão "Editar" para modificar informações
- **Excluir**: Clique no botão de lixeira para remover um membro

### 💰 Gerenciando Pagamentos

#### Pagamentos Automáticos
- Os pagamentos mensais são **gerados automaticamente** para todos os membros
- Cada membro recebe uma mensalidade no primeiro dia de cada mês
- O sistema calcula automaticamente atrasos e juros

#### Controle de Pagamentos
1. **Visualize** todos os pagamentos na aba "Pagamentos"
2. **Filtre** por mês, ano, status ou membro
3. **Marque como pago** quando receber o pagamento
4. **Cancele** pagamentos se necessário
5. **Acompanhe** estatísticas financeiras

### 📊 Acompanhando Estatísticas

#### Dashboard Principal
- **Total de membros** ativos
- **Receita mensal** total
- **Pagamentos pendentes** e atrasados
- **Gráficos** de evolução do time

#### Estatísticas de Equipamentos
- **Total de equipamentos** por categoria
- **Equipamentos disponíveis** vs. emprestados
- **Manutenções pendentes**
- **Histórico de empréstimos**

### 🏋️ Gerenciando Equipamentos

#### Adicionar Equipamento
1. Preencha o formulário com:
   - **Nome** do equipamento
   - **Categoria** (Bola, Rede, Uniforme, Outros)
   - **Quantidade** disponível
   - **Condição** atual
   - **Data de compra**
   - **Observações**
2. Clique em "Adicionar Equipamento"

#### Sistema de Empréstimos
1. **Selecione** o equipamento a ser emprestado
2. **Escolha** o membro que receberá
3. **Defina** a quantidade e data de devolução
4. **Adicione** observações se necessário
5. Clique em "Criar Empréstimo"

#### Controle de Manutenção
- O sistema **alerta automaticamente** quando equipamentos precisam de manutenção
- **Diferentes frequências** por categoria:
  - Bolas: Mensal
  - Redes: Trimestral
  - Uniformes: Semestral
  - Outros: Bimestral

### 📱 Usando como PWA

#### Instalação
1. **Abra o app** no Chrome/Edge
2. Clique no **ícone de instalação** na barra de endereços
3. **Confirme** a instalação
4. O app aparecerá na área de trabalho

#### Funcionalidades Offline
- **Visualização** de dados salvos localmente
- **Edição** de informações (sincroniza quando online)
- **Notificações** push mesmo com app fechado
- **Sincronização automática** quando conectado

### 💬 Sistema de Comunicação

#### Enviar Anúncios
1. **Selecione** o tipo de comunicação
2. **Digite** a mensagem
3. **Escolha** os destinatários
4. Clique em "Enviar"

#### Histórico
- **Visualize** todas as comunicações enviadas
- **Filtre** por tipo e data
- **Exporte** histórico se necessário

### ☁️ Backup e Sincronização

#### Exportar Dados
1. Clique em "Exportar Dados"
2. **Escolha** o tipo de backup
3. **Salve** o arquivo JSON localmente

#### Importar Dados
1. Clique em "Importar Dados"
2. **Selecione** o arquivo JSON
3. **Confirme** a importação

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilos modernos com Flexbox, Grid e variáveis CSS
- **JavaScript ES6+**: Programação orientada a objetos e funcional
- **Chart.js**: Gráficos interativos e responsivos
- **FontAwesome**: Ícones profissionais
- **Google Fonts**: Tipografia Inter para melhor legibilidade

### Funcionalidades Avançadas
- **LocalStorage**: Persistência de dados no navegador
- **Service Worker**: Funcionalidade offline e PWA
- **Push Notifications**: Notificações push
- **Background Sync**: Sincronização em segundo plano
- **Web App Manifest**: Instalação como app nativo

### Arquitetura
- **Modular**: Cada funcionalidade em arquivo separado
- **Orientado a Objetos**: Classes bem estruturadas
- **Event-Driven**: Sistema baseado em eventos
- **Responsivo**: Design adaptativo para todos os dispositivos

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ **Chrome** 80+ (recomendado)
- ✅ **Edge** 80+ (baseado em Chromium)
- ✅ **Firefox** 75+
- ✅ **Safari** 13.1+
- ✅ **Opera** 67+

### Dispositivos
- ✅ **Desktop** (Windows, macOS, Linux)
- ✅ **Tablet** (iPad, Android)
- ✅ **Mobile** (iPhone, Android)
- ✅ **PWA** (instalação como app nativo)

## 🔧 Configuração Avançada

### Variáveis CSS Personalizáveis
```css
:root {
    --primary-color: #4f46e5;
    --primary-dark: #3730a3;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --text-primary: #1f2937;
    --text-secondary: #6b7280;
    --card-bg: #ffffff;
    --input-bg: #f9fafb;
    --border-color: #e5e7eb;
}
```

### Personalização de Cores
1. Abra o arquivo `styles.css`
2. Localize a seção `:root`
3. Modifique as variáveis de cor
4. Salve e recarregue o app

### Adicionar Novas Categorias
1. Abra `equipment-manager.js`
2. Localize o array de categorias
3. Adicione suas categorias personalizadas
4. Atualize os filtros HTML se necessário

## 📊 Estrutura do Projeto

```
voleiapp/
├── index.html                 # Página principal
├── styles.css                 # Estilos e layout
├── script.js                  # Lógica principal e inicialização
├── payment-manager.js         # Sistema de pagamentos
├── attendance-manager.js      # Sistema de presença e treinos
├── dashboard-manager.js       # Dashboard e gráficos
├── notifications-manager.js   # Sistema de notificações
├── communication-manager.js   # Sistema de comunicação
├── backup-manager.js          # Backup e sincronização
├── pwa-manager.js            # Funcionalidades PWA
├── equipment-manager.js       # Gestão de equipamentos
├── manifest.json             # Configuração PWA
├── sw.js                     # Service Worker
├── icons/                    # Ícones PWA
├── screenshots/              # Screenshots para PWA
└── README.md                 # Documentação
```

## 🚨 Solução de Problemas

### Problemas Comuns

#### App não carrega
- **Verifique** se todos os arquivos estão na mesma pasta
- **Confirme** que o navegador suporta JavaScript ES6+
- **Abra** o console do navegador (F12) para ver erros

#### Dados não salvam
- **Verifique** se o LocalStorage está habilitado
- **Confirme** que não está em modo privado/incógnito
- **Teste** em outro navegador

#### PWA não instala
- **Use** Chrome ou Edge (suporte completo)
- **Confirme** que o site está em HTTPS (ou localhost)
- **Verifique** se o manifest.json está correto

#### Equipamentos não aparecem
- **Confirme** que o equipment-manager.js foi carregado
- **Verifique** o console para erros JavaScript
- **Recarregue** a página

### Logs e Debug
- **Console do Navegador**: F12 → Console
- **Application Tab**: F12 → Application → Local Storage
- **Network Tab**: F12 → Network (para PWA)

## 🔒 Segurança e Privacidade

### Dados Locais
- **Todos os dados** ficam armazenados localmente no seu navegador
- **Nenhuma informação** é enviada para servidores externos
- **Backup local** para preservar seus dados

### Permissões
- **Notificações**: Para alertas importantes
- **Instalação**: Para usar como PWA
- **Storage**: Para salvar dados localmente

## 📈 Roadmap e Melhorias

### Funcionalidades Planejadas
- [ ] **Sistema de Torneios**: Organização de campeonatos
- [ ] **Relatórios PDF**: Exportação avançada de relatórios
- [ ] **Integração WhatsApp**: Envio automático de lembretes
- [ ] **Sincronização Cloud**: Backup automático na nuvem
- [ ] **API REST**: Para integração com outros sistemas

### Melhorias Técnicas
- [ ] **Testes Automatizados**: Jest ou Mocha
- [ ] **Linting**: ESLint e Prettier
- [ ] **Bundling**: Webpack ou Vite
- [ ] **TypeScript**: Tipagem estática
- [ ] **PWA Avançado**: Background sync e push notifications

## 🤝 Contribuições

### Como Contribuir
1. **Fork** o repositório
2. **Crie** uma branch para sua feature
3. **Implemente** as mudanças
4. **Teste** todas as funcionalidades
5. **Commit** suas alterações
6. **Push** para sua branch
7. **Abra** um Pull Request

### Padrões de Código
- **JavaScript**: ES6+ com classes
- **CSS**: BEM methodology
- **HTML**: Semântico e acessível
- **Commits**: Conventional Commits

### Reportar Bugs
- **Descreva** o problema detalhadamente
- **Inclua** passos para reproduzir
- **Especifique** navegador e sistema operacional
- **Anexe** screenshots se possível

## 📄 Licença

Este projeto é livre para uso pessoal, educacional e comercial.

## 🙏 Agradecimentos

- **Comunidade de Vôlei** brasileira
- **Contribuidores** do projeto
- **FontAwesome** pelos ícones
- **Chart.js** pelos gráficos
- **Google Fonts** pela tipografia

---

**Desenvolvido com ❤️ para a comunidade de vôlei brasileiro** 🇧🇷

**Versão**: 2.0.0  
**Última Atualização**: Dezembro 2024  
**Status**: Em desenvolvimento ativo