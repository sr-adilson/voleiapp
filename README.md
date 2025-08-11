# 🏐 Cadastro de Mensalistas - Vôlei

Um aplicativo web moderno e responsivo para gerenciar membros mensalistas de um time de vôlei.

## ✨ Características

### 🎯 Funcionalidades Principais
- **Cadastro de Mensalistas**: Formulário completo com validação em tempo real
- **Gerenciamento CRUD**: Criar, visualizar, editar e excluir registros
- **Busca Inteligente**: Filtrar membros por nome, email, telefone ou posição
- **Estatísticas**: Visualização do total de membros e receita mensal
- **Persistência Local**: Dados salvos automaticamente no navegador

### 🎨 Interface Moderna
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **UI/UX Moderna**: Interface limpa com gradientes e animações suaves
- **Ícones FontAwesome**: Elementos visuais profissionais
- **Feedback Visual**: Alertas animados para ações do usuário

### ⚡ Tecnologias Utilizadas
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilos modernos com Flexbox e Grid
- **JavaScript ES6+**: Programação orientada a objetos
- **LocalStorage**: Persistência de dados no navegador
- **Google Fonts**: Tipografia Inter para melhor legibilidade

## 🚀 Como Usar

### 1. Instalação
1. Clone ou baixe os arquivos do projeto
2. Abra o arquivo `index.html` em um navegador web moderno

### 2. Cadastrar Mensalista
1. Preencha o formulário de cadastro com as informações obrigatórias:
   - Nome completo
   - E-mail
   - Telefone (com máscara automática)
   - Idade (entre 14 e 80 anos)
   - Valor da mensalidade
   - Data de início
2. Opcionalmente, adicione:
   - Posição preferida no vôlei
   - Nível de experiência
   - Observações
3. Clique em "Cadastrar Mensalista"

### 3. Gerenciar Membros
- **Visualizar**: Todos os membros aparecem em cards organizados
- **Buscar**: Use a caixa de busca para encontrar membros específicos
- **Editar**: Clique no botão "Editar" para modificar informações
- **Excluir**: Clique no botão de lixeira para remover um membro

### 4. Estatísticas
- Visualize o total de membros cadastrados
- Acompanhe a receita mensal total
- Estatísticas atualizadas automaticamente

## 📱 Estrutura do Projeto

```
volleyball-membership/
├── index.html          # Página principal
├── styles.css          # Estilos e layout
├── script.js           # Lógica da aplicação
└── README.md           # Documentação
```

## 🎮 Campos do Formulário

### Obrigatórios
- **Nome Completo**: Mínimo 2 caracteres
- **E-mail**: Formato válido e único no sistema
- **Telefone**: Formato brasileiro (XX) XXXXX-XXXX
- **Idade**: Entre 14 e 80 anos
- **Mensalidade**: Valor maior que zero
- **Data de Início**: Data válida

### Opcionais
- **Posição**: Levantador, Ponteiro, Meio de Rede, Oposto, Líbero
- **Experiência**: Iniciante, Intermediário, Avançado
- **Observações**: Campo livre para informações adicionais

## 🔧 Funcionalidades Técnicas

### Validações
- ✅ E-mail único no sistema
- ✅ Formato de telefone brasileiro
- ✅ Validação de idade
- ✅ Valores monetários positivos
- ✅ Campos obrigatórios

### Persistência
- 💾 Dados salvos automaticamente no localStorage
- 🔄 Carregamento automático ao abrir a aplicação
- 📊 Sincronização em tempo real das estatísticas

### Interface
- 📱 100% responsivo para todos os dispositivos
- 🎨 Animações suaves e feedback visual
- ♿ Acessibilidade com foco e navegação por teclado
- 🌙 Suporte a preferências de movimento reduzido

## 🎯 Posições de Vôlei

O sistema reconhece as seguintes posições:
- **Levantador**: Organizador do jogo
- **Ponteiro**: Atacante das pontas
- **Meio de Rede**: Bloqueador central
- **Oposto**: Atacante oposto ao levantador
- **Líbero**: Especialista em defesa

## 📊 Níveis de Experiência

- **Iniciante**: Está começando no vôlei
- **Intermediário**: Já tem experiência básica
- **Avançado**: Jogador experiente

## 🛠️ Desenvolvimento

### Arquitetura
- **MembershipManager Class**: Classe principal que gerencia toda a aplicação
- **Modular Design**: Métodos organizados por funcionalidade
- **Event-Driven**: Sistema baseado em eventos do DOM
- **Error Handling**: Tratamento robusto de erros

### Métodos Principais
- `addMember()`: Adiciona novo mensalista
- `editMember()`: Edita informações existentes
- `deleteMember()`: Remove mensalista
- `searchMembers()`: Filtra lista de membros
- `updateStats()`: Atualiza estatísticas
- `saveMembers()`: Persiste dados no localStorage

## 🎨 Personalização

### Cores Principais
- **Primária**: Gradiente roxo/azul (#4f46e5 → #7c3aed)
- **Sucesso**: Verde (#10b981)
- **Erro**: Vermelho (#ef4444)
- **Background**: Gradiente azul/roxo (#667eea → #764ba2)

### Responsividade
- **Desktop**: Layout de 2 colunas
- **Tablet**: Layout adaptativo
- **Mobile**: Layout de coluna única

## 📄 Licença

Este projeto é livre para uso pessoal e educacional.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Melhorar a documentação
- Otimizar o código

---

**Desenvolvido com ❤️ para a comunidade de vôlei brasileiro** 🇧🇷