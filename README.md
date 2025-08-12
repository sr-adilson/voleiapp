# 🏐 VoleiApp - Sistema de Gestão para Times de Vôlei

Um sistema completo e moderno para gerenciar times de vôlei, com foco em **experiência do usuário (UX)** e **interface moderna**.

## ✨ **Principais Melhorias Implementadas**

### 🎨 **Interface Moderna e Responsiva**
- **Design System** com variáveis CSS para consistência visual
- **Layout Mobile-First** com sidebar colapsável
- **Navegação por Abas** para melhor organização do conteúdo
- **Animações suaves** e transições para feedback visual
- **Sistema de cores** harmonioso e acessível

### 🧭 **Navegação Intuitiva**
- **Sidebar lateral** com menu de navegação claro
- **Sistema de abas** organizadas por funcionalidade
- **Breadcrumbs visuais** com títulos de página dinâmicos
- **Responsivo** para dispositivos móveis e desktop

### 📱 **Experiência Mobile-First**
- **Sidebar colapsável** em telas pequenas
- **Layout adaptativo** para diferentes tamanhos de tela
- **Touch-friendly** com botões e elementos otimizados
- **Navegação por gestos** suportada

### 🎯 **Organização por Funcionalidades**
- **Dashboard**: Visão geral com estatísticas e gráficos
- **Mensalistas**: Gestão completa de membros do time
- **Pagamentos**: Controle financeiro e mensalidades
- **Presença**: Controle de treinos e frequência
- **Equipamentos**: Gestão de materiais (em desenvolvimento)
- **Notificações**: Sistema de alertas (em desenvolvimento)

## 🚀 **Funcionalidades Principais**

### 📊 **Dashboard Inteligente**
- Estatísticas em tempo real
- Gráficos interativos (Chart.js)
- Atividade recente do sistema
- Visão geral rápida do time

### 👥 **Gestão de Mensalistas**
- Cadastro completo com validação
- Busca e filtros avançados
- Edição e exclusão de membros
- Histórico de alterações

### 💳 **Sistema de Pagamentos**
- Controle de mensalidades
- Status de pagamentos (pendente, pago, atrasado)
- Filtros por período e status
- Relatórios financeiros

### 📅 **Controle de Presença**
- Criação de sessões de treino
- Registro de frequência
- Histórico de treinos
- Estatísticas de participação

## 🛠️ **Tecnologias Utilizadas**

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Design**: CSS Grid, Flexbox, CSS Variables
- **Gráficos**: Chart.js para visualizações
- **Ícones**: Font Awesome 6
- **Fontes**: Inter (Google Fonts)
- **PWA**: Service Workers e Manifest

## 📱 **Instalação e Uso**

### **Requisitos**
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Suporte a JavaScript ES6+
- Conexão com internet para fontes e ícones

### **Instalação Local**
1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/voleiapp.git
cd voleiapp
```

2. Abra o arquivo `index.html` em seu navegador

3. Ou use um servidor local:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### **Instalação PWA**
1. Acesse o app no navegador
2. Clique no botão "Instalar" quando aparecer
3. Ou use o menu do navegador para instalar

## 🎨 **Sistema de Design**

### **Paleta de Cores**
- **Primária**: `#4f46e5` (Azul)
- **Secundária**: `#7c3aed` (Roxo)
- **Acento**: `#06b6d4` (Ciano)
- **Sucesso**: `#10b981` (Verde)
- **Aviso**: `#f59e0b` (Amarelo)
- **Erro**: `#ef4444` (Vermelho)

### **Tipografia**
- **Família**: Inter (Google Fonts)
- **Hierarquia**: 6 pesos (300-700)
- **Legibilidade**: Otimizada para telas

### **Componentes**
- **Cards**: Bordas arredondadas e sombras
- **Botões**: Estados hover e focus bem definidos
- **Formulários**: Validação visual e feedback
- **Modais**: Overlay com backdrop blur

## 📱 **Responsividade**

### **Breakpoints**
- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: 768px - 1024px
- **Large**: > 1024px

### **Adaptações Mobile**
- Sidebar colapsável
- Layout em coluna única
- Botões otimizados para touch
- Espaçamentos ajustados

## 🔧 **Estrutura do Projeto**

```
voleiapp/
├── index.html              # Página principal
├── styles.css              # Estilos principais
├── script.js               # Lógica principal
├── dashboard-manager.js    # Gerenciador do dashboard
├── attendance-manager.js   # Gerenciador de presença
├── equipment-manager.js    # Gerenciador de equipamentos
├── payment-manager.js      # Gerenciador de pagamentos
├── notifications-manager.js # Gerenciador de notificações
├── pwa-manager.js          # Gerenciador PWA
├── manifest.json           # Manifesto PWA
├── sw.js                   # Service Worker
└── README.md               # Documentação
```

## 🚀 **Roadmap de Desenvolvimento**

### **Fase 1** ✅ (Concluída)
- [x] Interface moderna e responsiva
- [x] Sistema de navegação por abas
- [x] Dashboard com estatísticas
- [x] Gestão de mensalistas
- [x] Sistema de pagamentos básico

### **Fase 2** 🔄 (Em Desenvolvimento)
- [ ] Gráficos interativos completos
- [ ] Sistema de notificações
- [ ] Gestão de equipamentos
- [ ] Relatórios avançados

### **Fase 3** 📋 (Planejada)
- [ ] Sistema de comunicação
- [ ] Backup e sincronização
- [ ] API REST
- [ ] Multi-tenancy

## 🤝 **Contribuição**

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### **Padrões de Código**
- Use **ES6+** para JavaScript
- Siga o **sistema de design** estabelecido
- Mantenha a **responsividade** em mente
- Teste em **diferentes dispositivos**

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 **Agradecimentos**

- **Inter Font** por Google Fonts
- **Font Awesome** pelos ícones
- **Chart.js** pelos gráficos
- **Comunidade open source** pelo suporte

## 📞 **Suporte**

Se você encontrar algum problema ou tiver sugestões:

- Abra uma **Issue** no GitHub
- Entre em contato via **email**
- Participe das **discussões** do projeto

---

**Desenvolvido com ❤️ para a comunidade de vôlei brasileira**