const products = [
    { id: 1, name: "Batom Matte", category: "boca", priceNumber: 39.90, price: "R$ 39,90", image: "Imagens/batom.png" },
    { id: 2, name: "Base Líquida", category: "rosto", priceNumber: 69.90, price: "R$ 69,90", image: "Imagens/base.png" },
    { id: 3, name: "Máscara de Cílios Volume", category: "olhos", priceNumber: 29.90, price: "R$ 29,90", image: "Imagens/rimel.jpg" },
    { id: 4, name: "Paleta de Sombras Nude", category: "olhos", priceNumber: 35.90, price: "R$ 35,90", image: "Imagens/paletadecores.jpg" },
    { id: 5, name: "Corretivo Cobertura Leve", category: "rosto", priceNumber: 35.90, price: "R$ 35,90", image: "Imagens/corretivoliquido.jpg" },
    { id: 6, name: "Pó Translúcido HD", category: "rosto", priceNumber: 45.90, price: "R$ 45,90", image: "Imagens/po.jpg" },
    { id: 7, name: "Iluminador Líquido Rosé", category: "rosto", priceNumber: 54.90, price: "R$ 54,90", image: "Imagens/iluminador.png" },
    { id: 8, name: "Blush Cremoso Stick", category: "rosto", priceNumber: 42.90, price: "R$ 42,90", image: "Imagens/blush.png" },
    { id: 9, name: "Gloss Labial Plump", category: "boca", priceNumber: 38.90, price: "R$ 38,90", image: "Imagens/gloss.png" },
    { id: 10, name: "Delineador Precision Black", category: "olhos", priceNumber: 29.90, price: "R$ 29,90", image: "Imagens/delineador.png" },
    { id: 11, name: "Primer Blur Polishing", category: "rosto", priceNumber: 54.90, price: "R$ 54,90", image: "Imagens/primer.png" },
    { id: 12, name: "Kit Pincéis Pro (5 Pçs)", category: "acessorios", priceNumber: 99.90, price: "R$ 99,90", image: "Imagens/pinceis.png" },
    { id: 13, name: "Bruma Fixadora Glow", category: "rosto", priceNumber: 52.90, price: "R$ 52,90", image: "Imagens/bruma.png" },
    { id: 14, name: "Sombra Unitária Shimmer", category: "olhos", priceNumber: 24.90, price: "R$ 24,90", image: "Imagens/sombraunit.png" },
    { id: 15, name: "Lip Oil Hidratante", category: "boca", priceNumber: 32.90, price: "R$ 32,90", image: "Imagens/lipoil.png" },
    { id: 16, name: "Gel Fixador de Sobrancelha", category: "olhos", priceNumber: 27.90, price: "R$ 27,90", image: "Imagens/gelsobrancelha.png" }
];

// Estado do App
let cart = [];
let favorites = [];
let currentUser = null;
let orderHistory = [];

document.addEventListener("DOMContentLoaded", () => {
    createLipstickRain();
    applyFilters();
});

// Renderizar Produtos
function renderProducts(list) {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888;">Nenhum produto encontrado.</p>`;
        return;
    }

    list.forEach(p => {
        const isFav = favorites.includes(p.id);
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <button class="fav-card-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${p.id})">
                <i class="fas fa-heart"></i>
            </button>
            <div class="card-img"><img src="${p.image}" alt="${p.name}"></div>
            <div class="card-info">
                <h3>${p.name}</h3>
                <span class="price">${p.price}</span>
                <button class="btn-buy" onclick="addToCart(${p.id})">Adicionar ao Carrinho</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filtros & Busca
function applyFilters() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value;
    const maxPrice = document.getElementById("priceFilter").value;

    const filtered = products.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(query);
        const matchesCat = category === "all" || p.category === category;
        const matchesPrice = maxPrice === "all" || p.priceNumber <= parseFloat(maxPrice);
        return matchesQuery && matchesCat && matchesPrice;
    });

    renderProducts(filtered);
}

// Favoritos
function toggleFavorite(id) {
    const idx = favorites.indexOf(id);
    if (idx > -1) favorites.splice(idx, 1);
    else favorites.push(id);

    document.getElementById("favBadge").textContent = favorites.length;
    applyFilters();
    renderFavModal();
}

function renderFavModal() {
    const container = document.getElementById("favItemsContainer");
    if (favorites.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#888;">Nenhum favorito ainda.</p>`;
        return;
    }

    const favProds = products.filter(p => favorites.includes(p.id));
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
    if (item) item.quantity++;
    else cart.push({ ...products.find(p => p.id === id), quantity: 1 });

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
                    <p style="color:#d86979;">R$ ${(i.priceNumber * i.quantity).toFixed(2)}</p>
                    <small>Qtd: ${i.quantity}</small>
                </div>
            </div>
        `;
    }).join("");

    document.getElementById("cartTotalValue").textContent = `R$ ${total.toFixed(2)}`;
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