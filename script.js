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
            noResultsMsg.style.cssText = "grid-column: 1/-1; text-align: center; color: #888;";
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

    // Atualiza ícone do botão no card
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
        container.innerHTML = `<p style="text-align:center; color:#888;">Nenhum favorito ainda.</p>`;
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

// Carrinho
function addToCart(id) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity++;
    } else {
        const product = getProductData(id);
        if (product) {
            cart.push({ ...product, quantity: 1 });
        }
    }

    updateCart();
    showToast("Produto adicionado ao carrinho!");
}

function updateCart() {
    document.getElementById("cartBadge").textContent = cart.reduce((a, b) => a + b.quantity, 0);
    const container = document.getElementById("cartItemsContainer");
    
    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#888;">Carrinho vazio.</p>`;
        document.getElementById("cartTotalValue").textContent = "R$ 0,00";
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(i => {
        total += i.priceNumber * i.quantity;
        return `
            <div class="cart-item">
                <img src="${i.image}" alt="${i.name}">
                <div style="flex-grow:1;">
                    <h4>${i.name}</h4>
                    <p style="color:#d86979;">R$ ${(i.priceNumber * i.quantity).toFixed(2).replace('.', ',')}</p>
                    <small>Qtd: ${i.quantity}</small>
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
                <button onclick="login()">Entrar</button>
                <hr style="margin:10px 0; border:none; border-top:1px solid #eee;">
                <p style="font-size:0.85rem; text-align:center;">Não tem conta? Digite seu nome e entre!</p>
            </div>
        `;
    } else {
        body.innerHTML = `
            <div class="user-profile-info">
                <h3>Olá, ${currentUser.name}!</h3>
                <p style="color:#666; font-size:0.9rem;">${currentUser.email}</p>
                <button onclick="logout()" style="margin-top:10px; background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Sair</button>
            </div>
            <h4 style="margin:15px 0 10px 0;">Histórico de Compras</h4>
            <div>
                ${orderHistory.length === 0 ? '<p style="color:#888; font-size:0.85rem;">Nenhuma compra anterior.</p>' : orderHistory.map(o => `
                    <div class="history-item">
                        <strong>Data: ${o.date}</strong>
                        <p style="font-size:0.85rem; color:#555;">${o.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</p>
                    </div>
                `).join("")}
            </div>
        `;
    }
    toggleModal('userModal', true);
}

function login() {
    const email = document.getElementById("loginEmail").value;
    if (!email) return alert("Informe seu e-mail!");
    
    currentUser = { name: email.split("@")[0], email };
    document.getElementById("userNavLabel").textContent = currentUser.name;
    openUserModal();
}

function logout() {
    currentUser = null;
    document.getElementById("userNavLabel").textContent = "Entrar";
    openUserModal();
}

// Modais / Utils
function toggleModal(id, show) {
    document.getElementById(id).classList.toggle("active", show);
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

function createLipstickRain() {
    let container = document.getElementById("lipstick-rain-container") || document.createElement("div");
    container.id = "lipstick-rain-container";
    document.body.prepend(container);

    for (let i = 0; i < 40; i++) {
        const l = document.createElement("span");
        l.className = "falling-lipstick";
        l.innerHTML = "💄";
        l.style.left = `${Math.random() * 98}vw`;
        l.style.animationDuration = `${Math.random() * 6 + 4}s`;
        l.style.animationDelay = `${Math.random() * 8}s`;
        l.style.fontSize = `${Math.random() * 20 + 25}px`;
        container.appendChild(l);
    }
}