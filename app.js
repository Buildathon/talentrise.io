// Variables globales
let currentUser = null;
let tokenPrice = 0;
let currentTalent = '';

// Funciones globales mejoradas
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.add('active');
        } else {
            screen.classList.remove('active');
        }
    });
    
    // Scroll al inicio del contenido
    const content = document.querySelector(`#${screenId} .content`);
    if (content) {
        content.scrollTo(0, 0);
    }
}

function setActiveNav(element) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    element.classList.add('active');
}

// Función de notificación mejorada
function showNotification(message, duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'var(--card-bg)';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = 'var(--border-radius)';
    notification.style.zIndex = '1000';
    notification.style.fontWeight = '600';
    notification.style.boxShadow = 'var(--shadow)';
    notification.style.border = '1px solid var(--glass-border)';
    notification.style.backdropFilter = 'blur(10px)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';
    notification.style.maxWidth = '90%';
    notification.style.textAlign = 'center';
    notification.style.animation = 'slideDown 0.3s ease';
    notification.innerHTML = `<i class="fas fa-check-circle" style="color: var(--secondary);"></i> ${message}`;
    
    document.body.appendChild(notification);
    
    // Remover después de la duración especificada
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Animaciones para notificación
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideDown {
        from { top: -100px; opacity: 0; }
        to { top: 20px; opacity: 1; }
    }
    
    @keyframes slideUp {
        from { top: 20px; opacity: 1; }
        to { top: -100px; opacity: 0; }
    }
`;
document.head.appendChild(style);

// Simular interacción con botones de acción
document.querySelectorAll('.action-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const action = this.querySelector('i').className;
        const actionText = this.parentElement.querySelector('.action-text');
        
        if (action.includes('fa-heart')) {
            if (!this.classList.contains('liked')) {
                this.classList.add('liked');
                const currentLikes = parseInt(actionText.textContent.replace(/[^\d]/g, ''));
                actionText.textContent = (currentLikes + 1) + (actionText.textContent.includes('K') ? 'K' : '');
                showNotification('¡Has dado like a este talento! ❤️');
            } else {
                this.classList.remove('liked');
                const currentLikes = parseInt(actionText.textContent.replace(/[^\d]/g, ''));
                actionText.textContent = (currentLikes - 1) + (actionText.textContent.includes('K') ? 'K' : '');
                showNotification('Like removido 💔');
            }
        } else if (action.includes('fa-comment')) {
            showNotification('¡Opina sobre este talento! 💬');
        } else if (action.includes('fa-share')) {
            showNotification('¡Comparte este talento con tus amigos! 📤');
        } else if (action.includes('fa-gem')) {
            const talentName = this.closest('.feed-item').querySelector('.talent-details h3').textContent;
            showNotification(`¡Tokeniza este contenido de ${talentName}! 💎`);
        }
    });
});

// Manejo de formularios mejorado
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    
    // Selector de tipo de usuario
    const userTypeOptions = document.querySelectorAll('.user-type-option');
    userTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remover selección previa
            userTypeOptions.forEach(opt => opt.classList.remove('selected'));
            // Seleccionar la opción actual
            this.classList.add('selected');
        });
    });
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Mostrar spinner de carga
            const registerBtn = document.getElementById('register-btn');
            const registerText = document.getElementById('register-text');
            registerText.innerHTML = '<span class="loading-spinner"></span> Creando cuenta...';
            registerBtn.disabled = true;
            
            // Verificar que se haya seleccionado un tipo de usuario
            const selectedType = document.querySelector('.user-type-option.selected');
            if (!selectedType) {
                showNotification('Por favor selecciona un tipo de usuario');
                registerText.textContent = 'Crear Cuenta';
                registerBtn.disabled = false;
                return;
            }
            
            // Simular registro exitoso
            setTimeout(() => {
                const userType = selectedType.dataset.type;
                const userName = document.getElementById('fullname').value;
                
                showNotification(`¡Cuenta creada exitosamente como ${userType === 'fan' ? 'Fan' : 'Talento'}! 🎉`);
                
                // Resetear formulario
                registerForm.reset();
                userTypeOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Mostrar pantalla de descubrimiento
                setTimeout(() => {
                    showScreen('discovery-screen');
                    // Resetear navegación
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    document.querySelector('.nav-item').classList.add('active');
                    
                    // Restaurar botón
                    registerText.textContent = 'Crear Cuenta';
                    registerBtn.disabled = false;
                }, 1500);
            }, 2000);
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Mostrar spinner de carga
            const loginBtn = document.getElementById('login-btn');
            const loginText = document.getElementById('login-text');
            loginText.innerHTML = '<span class="loading-spinner"></span> Iniciando sesión...';
            loginBtn.disabled = true;
            
            // Simular inicio de sesión exitoso
            setTimeout(() => {
                showNotification('¡Inicio de sesión exitoso! 🎉');
                
                // Resetear formulario
                loginForm.reset();
                
                // Mostrar pantalla de descubrimiento
                setTimeout(() => {
                    showScreen('discovery-screen');
                    // Resetear navegación
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    document.querySelector('.nav-item').classList.add('active');
                    
                    // Restaurar botón
                    loginText.textContent = 'Iniciar Sesión';
                    loginBtn.disabled = false;
                }, 1500);
            }, 2000);
        });
    }
    
    // Logout
    document.querySelector('.settings-item.logout').addEventListener('click', function() {
        showNotification('¡Sesión cerrada! 👋');
        setTimeout(() => {
            showScreen('welcome-screen');
        }, 1500);
    });
    
    // Actualizar valor de tokens al cambiar cantidad
    const tokenAmountInput = document.getElementById('token-amount');
    if (tokenAmountInput) {
        tokenAmountInput.addEventListener('input', function() {
            const amount = parseInt(this.value) || 0;
            const value = (amount * (tokenPrice / 100)).toFixed(2);
            document.getElementById('token-value').value = `$${value}`;
        });
    }
});

// Función para volver atrás mejorada
function goBack() {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen.id === 'fan-benefits' || currentScreen.id.startsWith('profile-')) {
        showScreen('discovery-screen');
    } else {
        showScreen('discovery-screen');
    }
}

// Función para mostrar modal de compra de tokens
function showTokenModal(talentName, tokens, price) {
    currentTalent = talentName;
    tokenPrice = price;
    
    document.getElementById('modal-talent-name').innerHTML = `Estás comprando tokens de <strong>${talentName}</strong>`;
    document.getElementById('token-amount').value = '100';
    document.getElementById('token-value').value = `$${(100 * (price / 100)).toFixed(2)}`;
    
    document.getElementById('token-modal').classList.add('active');
}

// Función para cerrar modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Función para confirmar compra de tokens
function confirmTokenPurchase() {
    const amount = parseInt(document.getElementById('token-amount').value) || 0;
    const value = (amount * (tokenPrice / 100)).toFixed(2);
    
    showNotification(`💎 Compra exitosa: ${amount} tokens de ${currentTalent} por $${value}`);
    closeModal('token-modal');
}

// Función para búsqueda de talentos mejorada
function searchTalents(query) {
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('search-input');
    
    if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
    }

    const talents = [
        {
            id: 'bad-bunny',
            name: 'Bad Bunny',
            username: '@badbunny',
            avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop',
            category: 'Música'
        },
        {
            id: 'shakira',
            name: 'Shakira',
            username: '@shakira',
            avatar: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop',
            category: 'Música'
        },
        {
            id: 'taylor-swift',
            name: 'Taylor Swift',
            username: '@taylorswift',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
            category: 'Música'
        },
        {
            id: 'beyonce',
            name: 'Beyoncé',
            username: '@beyonce',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
            category: 'Música'
        },
        {
            id: 'drake',
            name: 'Drake',
            username: '@drake',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
            category: 'Música'
        }
    ];

    const filteredTalents = talents.filter(talent => 
        talent.name.toLowerCase().includes(query.toLowerCase()) ||
        talent.username.toLowerCase().includes(query.toLowerCase()) ||
        talent.category.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredTalents.length > 0) {
        searchResults.innerHTML = filteredTalents.map(talent => `
            <div class="search-result-item" onclick="showPersonDetail('${talent.id}')">
                <img src="${talent.avatar}" alt="${talent.name}" class="search-result-avatar">
                <div class="search-result-info">
                    <div class="search-result-name">${talent.name}</div>
                    <div class="search-result-username">${talent.username} • ${talent.category}</div>
                </div>
            </div>
        `).join('');
        searchResults.style.display = 'block';
    } else {
        searchResults.innerHTML = '<div style="padding: 15px; text-align: center; color: var(--text-secondary);">No se encontraron resultados</div>';
        searchResults.style.display = 'block';
    }
}

// Función para buscar por categoría
function searchByCategory(category) {
    document.getElementById('search-input').value = category;
    searchTalents(category);
}

// Función para mostrar perfil detallado
function showPersonDetail(personId) {
    const profileScreen = document.getElementById(`profile-${personId}`);
    if (profileScreen) {
        showScreen(`profile-${personId}`);
    } else {
        showNotification('Perfil no disponible');
    }
}