// Lista dos 16 Produtos com a marca minmakes no nome
const products = [
    { name: "Batom Matte minmakes", price: "R$ 49,90", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400" },
    { name: "Base Líquida minmakes", price: "R$ 89,90", image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400" },
    { name: "Máscara de Cílios Volume minmakes", price: "R$ 39,90", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400" },
    { name: "Paleta de Sombras Nude minmakes", price: "R$ 119,90", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400" },
    { name: "Corretivo Cobertura Leve minmakes", price: "R$ 35,90", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400" },
    { name: "Pó Translúcido HD minmakes", price: "R$ 45,90", image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400" },
    { name: "Iluminador Líquido Rosé minmakes", price: "R$ 54,90", image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400" },
    { name: "Blush Cremoso Stick minmakes", price: "R$ 42,90", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400" },
    { name: "Gloss Labial Plump minmakes", price: "R$ 38,90", image: "https://images.unsplash.com/photo-1608248597309-1e35d1f88775?w=400" },
    { name: "Delineador Precision Black minmakes", price: "R$ 29,90", image: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=400" },
    { name: "Primer Blur Polishing minmakes", price: "R$ 64,90", image: "https://images.unsplash.com/photo-1590156206657-3b2d18471e89?w=400" },
    { name: "Kit Pincéis Pro (5 Pçs) minmakes", price: "R$ 99,90", image: "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400" },
    { name: "Bruma Fixadora Glow minmakes", price: "R$ 52,90", image: "https://images.unsplash.com/photo-1617897903246-719242758050?w=400" },
    { name: "Sombra Unitária Shimmer minmakes", price: "R$ 24,90", image: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=400" },
    { name: "Lip Oil Hidratante minmakes", price: "R$ 32,90", image: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400" },
    { name: "Gel Fixador de Sobrancelha minmakes", price: "R$ 27,90", image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400" }
];

// Renderização Dinâmica dos Cards
document.addEventListener("DOMContentLoaded", () => {
    const productGrid = document.getElementById("productGrid");

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="card-img">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="card-info">
                <h3>${product.name}</h3>
                <span class="price">${product.price}</span>
                <button class="btn-buy" onclick="addToCart('${product.name}')">Comprar</button>
            </div>
        `;

        productGrid.appendChild(card);
    });
});

// Animação Toast ao Clicar em Comprar
function addToCart(productName) {
    const toast = document.getElementById("toast");
    toast.textContent = `"${productName}" foi adicionado ao carrinho!`;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}