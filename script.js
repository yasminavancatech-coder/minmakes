// Estado do App
let cart = [];
let favorites = [];
let currentUser = null;
let orderHistory = [];

document.addEventListener("DOMContentLoaded", () => {
    createLipstickRain();
    applyFilters();
});

// Auxiliar para pegar dados de um card pelo ID
function getProductData(id) {
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (!card) return null;
    return {
        id: parseInt(card.dataset.id),
        name: card.dataset.name,
        category: card.dataset.category,
        priceNumber: parseFloat(card.dataset.price),
        price: `R$ ${parseFloat(card.dataset.price).toFixed(2).replace('.', ',')}`,
        image: card.dataset.image
    };
}

// Filtros & Busca interagindo diretamente com os cards do HTML
function applyFilters() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;
    const maxPrice = document.getElementById("priceFilter").value;

    const cards = document.querySelectorAll(".product-card");
    let visibleCount = 0;

    cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const cardCategory = card.dataset.category;
        const price = parseFloat(card.dataset.price);

        const matchesQuery = name.includes(query);
        const matchesCat = category === "all" || cardCategory === category;
        const matchesPrice = maxPrice === "all" || price <= parseFloat(maxPrice);

        if (matchesQuery && matchesCat && matchesPrice) {
            card.style.display = "flex";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    const grid = document.getElementById("productGrid");
    let noResultsMsg = document.getElementById("noResultsMsg");

    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement("p");
            noResultsMsg.id = "noResultsMsg";
            noResultsMsg.style.cssText = "grid-column: 1/-1; text-align: center; color: #888; font-size: 1.1rem; padding: 2rem 0;";
            noResultsMsg.textContent = "Nenhum produto encontrado.";
            grid.appendChild(noResultsMsg);
        }
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Favoritos
function toggleFavorite(id) {
    const idx = favorites.indexOf(id);
    if (idx > -1) favorites.splice(idx, 1);
    else favorites.push(id);

    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card) {
        const btn = card.querySelector(".fav-card-btn");
        if (favorites.includes(id)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    }

    document.getElementById("favBadge").textContent = favorites.length;
    renderFavModal();
}

function renderFavModal() {
    const container = document.getElementById("favItemsContainer");
    if (favorites.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#888; margin-top:20px;">Nenhum favorito ainda.</p>`;
        return;
    }

    const favProds = favorites.map(id => getProductData(id)).filter(p => p !== null);
    container.innerHTML = favProds.map(p => `
        <div class="cart-item">
            <img src="${p.image}" alt="${p.name}">
            <div style="flex-grow:1;">
                <h4>${p.name}</h4>
                <p style="color:#d86979; font-weight:bold;">${p.price}</p>
            </div>
            <button class="btn-buy" onclick="addToCart(${p.id})">Comprar</button>
        </div>
    `).join("");
}

// Carrinho com suporte a variações
function addToCart(id) {
    const product = getProductData(id);
    if (!product) return;

    // Busca o seletor da opção caso o produto possua variações
    const variantSelect = document.getElementById(`variant-${id}`);
    const selectedVariant = variantSelect ? variantSelect.value : null;

    // Localiza se a mesma variação do mesmo produto já está no carrinho
    const existingItem = cart.find(item => item.id === id && item.variant === selectedVariant);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            variant: selectedVariant,
            quantity: 1
        });
    }

    updateCart();
    showToast("Produto adicionado ao carrinho!");
}

function updateCart() {
    document.getElementById("cartBadge").textContent = cart.reduce((a, b) => a + b.quantity, 0);
    const container = document.getElementById("cartItemsContainer");
    
    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#888; margin-top:20px;">Carrinho vazio.</p>`;
        document.getElementById("cartTotalValue").textContent = "R$ 0,00";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((i, index) => {
        total += i.priceNumber * i.quantity;
        return `
            <div class="cart-item">
                <img src="${i.image}" alt="${i.name}">
                <div style="flex-grow:1;">
                    <h4>${i.name}</h4>
                    ${i.variant ? `<span class="cart-variant-tag">${i.variant}</span>` : ''}
                    <p style="color:#d86979; font-weight:bold;">R$ ${(i.priceNumber * i.quantity).toFixed(2).replace('.', ',')}</p>
                    <small style="color:#666;">Qtd: ${i.quantity}</small>
                </div>
            </div>
        `;
    }).join("");

    document.getElementById("cartTotalValue").textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function checkout() {
    if (cart.length === 0) return alert("Carrinho vazio!");
    if (currentUser) {
        orderHistory.push({ date: new Date().toLocaleDateString(), items: [...cart] });
    }
    alert("Compra realizada com sucesso!");
    cart = [];
    updateCart();
    toggleModal('cartModal', false);
}

// Área do Cliente
function openUserModal() {
    const body = document.getElementById("userModalBody");
    if (!currentUser) {
        body.innerHTML = `
            <div class="auth-form">
                <h3>Entrar na Conta</h3>
                <input type="email" id="loginEmail" placeholder="E-mail">
                <input type="password" id="loginPass" placeholder="Senha">
                <button class="btn-buy" onclick="login()">Entrar</button>
            </div>
        `;
    } else {
        body.innerHTML = `
            <h3>Olá, ${currentUser.name}!</h3>
            <p style="margin-bottom:15px; color:#666;">${currentUser.email}</p>
            <h4>Histórico de Pedidos:</h4>
            <div style="margin-top:10px;">
                ${orderHistory.length === 0 ? '<p style="font-size:0.9rem; color:#888;">Nenhum pedido realizado.</p>' : 
                orderHistory.map(h => `
                    <div class="history-item">
                        <small style="color:#888;">Data: ${h.date}</small>
                        <p style="font-size:0.85rem; margin-top:4px;">${h.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
                    </div>
                `).join('')}
            </div>
            <button class="btn-buy" style="background:#e74c3c; margin-top:15px;" onclick="logout()">Sair</button>
        `;
    }
    toggleModal('userModal', true);
}

function login() {
    const email = document.getElementById("loginEmail").value;
    if (email) {
        currentUser = { name: email.split('@')[0], email };
        document.getElementById("userNavLabel").textContent = currentUser.name;
        openUserModal();
        showToast("Login realizado com sucesso!");
    }
}

function logout() {
    currentUser = null;
    document.getElementById("userNavLabel").textContent = "Entrar";
    toggleModal('userModal', false);
    showToast("Você saiu da conta.");
}

// Modal & Utilitários
function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.toggle("active", show);
}

function closeOnOverlay(e, id) {
    if (e.target.id === id) toggleModal(id, false);
}

function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

// Alternar Tema Escuro / Claro
function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-mode");
    const icon = document.getElementById("themeIcon");

    if (icon) {
        if (isDark) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        } else {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }
    }
}

// Animação da Chuva de Batons (💄) e Laçinhos (🎀)
function createLipstickRain() {
    let container = document.getElementById("lipstick-rain-container") || document.createElement("div");
    container.id = "lipstick-rain-container";
    document.body.prepend(container);

    for (let i = 0; i < 22; i++) {
        const item = document.createElement("span");
        item.className = "falling-lipstick";
        item.innerHTML = "💄";
        item.style.left = `${Math.random() * 98}vw`;
        item.style.animationDuration = `${Math.random() * 5 + 5}s`;
        item.style.animationDelay = `${Math.random() * 7}s`;
        item.style.fontSize = `${Math.random() * 10 + 20}px`;
        container.appendChild(item);
    }

    for (let i = 0; i < 35; i++) {
        const item = document.createElement("span");
        item.className = "falling-bow";
        item.innerHTML = "🎀";
        item.style.left = `${Math.random() * 98}vw`;
        item.style.animationDuration = `${Math.random() * 6 + 6}s`;
        item.style.animationDelay = `${Math.random() * 8}s`;
        item.style.fontSize = `${Math.random() * 12 + 18}px`;
        container.appendChild(item);
    }
}