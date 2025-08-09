// Productos con imagen y tallas disponibles
const productos = [
  {
    id: 1,
    nombre: "Tenis Nike Air",
    precio: 180000,
    imagen: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRevt2Bx0-zxv8RWuMsc2SrnifAYw4nvZ81JxkXlolB6KtQ-Daqf2mXIazDk3u9FfYxd9cCJlZQg_Hzugdz65-J1xgD-e2goG6P27DZS3gpZeCCqYGlKZJN9zU",
    tallas: [36, 37, 38, 39, 40, 41, 42]
  },
  {
    id: 2,
    nombre: "Adidas Classic",
    precio: 150000,
    imagen: "https://images.unsplash.com/photo-1519741493670-3a8e44d7f29e?auto=format&fit=crop&w=400&q=80",
    tallas: [37, 38, 39, 40, 41]
  },
  {
    id: 3,
    nombre: "Puma Street",
    precio: 130000,
    imagen: "https://images.unsplash.com/photo-1600185369446-cbb5a59b35f4?auto=format&fit=crop&w=400&q=80",
    tallas: [38, 39, 40, 41, 42, 43]
  }
];

const carrito = [];

const productGrid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartModal = document.getElementById("cartModal");

// Mostrar productos con selector de talla
productos.forEach(producto => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" />
    <h4>${producto.nombre}</h4>
    <p>$${producto.precio.toLocaleString()}</p>
    <label for="talla-${producto.id}">Talla:</label>
    <select id="talla-${producto.id}" aria-label="Selecciona talla para ${producto.nombre}">
      <option value="" disabled selected>Elige talla</option>
      ${producto.tallas.map(t => `<option value="${t}">${t}</option>`).join('')}
    </select>
    <button class="btn" onclick="agregarAlCarrito(${producto.id})">Agregar 🛍️</button>
  `;
  productGrid.appendChild(card);
});

function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  const select = document.getElementById(`talla-${id}`);
  const talla = select.value;

  if (!talla) {
    alert("Por favor selecciona una talla.");
    select.focus();
    return;
  }

  const existente = carrito.find(item => item.id === id && item.talla === talla);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ ...producto, cantidad: 1, talla });
  }
  actualizarCarrito();
}

function actualizarCarrito() {
  cartItems.innerHTML = "";
  if (carrito.length === 0) {
    cartItems.textContent = "Tu carrito está vacío.";
    cartCount.style.display = "none";
    cartTotal.textContent = "$0";
    return;
  }

  let total = 0;
  carrito.forEach(item => {
    total += item.precio * item.cantidad;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" />
      <div class="cart-item-details">
        <strong>${item.nombre}</strong><br />
        Talla: ${item.talla}<br />
        Cantidad: ${item.cantidad}<br />
        Precio: $${(item.precio * item.cantidad).toLocaleString()}
      </div>
      <div>
        <button aria-label="Aumentar cantidad" onclick="cambiarCantidad(${item.id}, '${item.talla}', 1)">+</button>
        <button aria-label="Disminuir cantidad" onclick="cambiarCantidad(${item.id}, '${item.talla}', -1)">−</button>
        <button aria-label="Eliminar producto" onclick="eliminarProducto(${item.id}, '${item.talla}')">✕</button>
      </div>
    `;
    cartItems.appendChild(div);
  });

  cartTotal.textContent = `$${total.toLocaleString()}`;
  cartCount.textContent = carrito.length;
  cartCount.style.display = carrito.length > 0 ? "inline-block" : "none";
}

function cambiarCantidad(id, talla, delta) {
  const item = carrito.find(i => i.id === id && i.talla === talla);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    eliminarProducto(id, talla);
  } else {
    actualizarCarrito();
  }
}

function eliminarProducto(id, talla) {
  const index = carrito.findIndex(i => i.id === id && i.talla === talla);
  if (index > -1) {
    carrito.splice(index, 1);
    actualizarCarrito();
  }
}

document.getElementById("openCartBtn").addEventListener("click", () => {
  cartModal.style.display = "block";
  cartItems.focus();
});

document.getElementById("closeCart").addEventListener("click", () => {
  cartModal.style.display = "none";
});

document.getElementById("clearCartBtn").addEventListener("click", () => {
  carrito.length = 0;
  actualizarCarrito();
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  const nombre = document.getElementById("customerName").value.trim();
  const direccion = document.getElementById("customerAddress").value.trim();

  if (!nombre) {
    alert("Por favor ingresa tu nombre.");
    return;
  }

  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const itemsTexto = carrito.map(item =>
    `• ${item.nombre} (Talla: ${item.talla}) x${item.cantidad} — $${(item.precio * item.cantidad).toLocaleString()}`
  ).join('\n');

  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const mensaje = `Hola, quiero hacer un pedido:\n\n${itemsTexto}\n\nTotal: $${total.toLocaleString()}\nNombre: ${nombre}\nDirección: ${direccion}`;
  const url = `https://wa.me/3217430829?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
});

actualizarCarrito();

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    // Cierra todos
    document.querySelectorAll('.faq-question').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    document.querySelectorAll('.faq-answer').forEach(ans => ans.hidden = true);

    // Si estaba cerrado, abrir
    if (!expanded) {
      button.setAttribute('aria-expanded', 'true');
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      answer.hidden = false;
    }
  });
});

// Cerrar modal con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && cartModal.style.display === "block") {
    cartModal.style.display = "none";
  }
});
