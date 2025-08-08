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

document.addEventListener('DOMContentLoaded', () => {
    membershipManager = new MembershipManager();
});

// Adicionar funcionalidades extras no console para desenvolvimento
window.membershipManager = membershipManager;