// Versión mejorada del JS: filtros, carrito persistente, toasts, cambiar talla en carrito
const PRODUCTS = [
  { id: 1, nombre: 'Tenis Nike Air', marca: 'Nike', precio: 180000, imagen: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRevt2Bx0-zxv8RWuMsc2SrnifAYw4nvZ81JxkXlolB6KtQ-Daqf2mXIazDk3u9FfYxd9cCJlZQg_Hzugdz65-J1xgD-e2goG6P27DZS3gpZeCCqYGlKZJN9zU', tallas: [36,37,38,39,40,41,42], genero: 'unisex' },
  { id: 2, nombre: 'Adidas Classic', marca: 'Adidas', precio: 150000, imagen: 'https://images.unsplash.com/photo-1519741493670-3a8e44d7f29e?auto=format&fit=crop&w=400&q=80', tallas: [37,38,39,40,41], genero: 'female' },
  { id: 3, nombre: 'Puma Street', marca: 'Puma', precio: 130000, imagen: 'https://images.unsplash.com/photo-1600185369446-cbb5a59b35f4?auto=format&fit=crop&w=400&q=80', tallas: [38,39,40,41,42,43], genero: 'male' },
  { id: 4, nombre: 'Fila Retro', marca: 'Fila', precio: 110000, imagen: 'https://picsum.photos/seed/fila/400/300', tallas: [36,37,38,39], genero: 'female' },
  { id: 5, nombre: 'Runner Pro', marca: 'Generic', precio: 99000, imagen: 'https://picsum.photos/seed/runner/400/300', tallas: [40,41,42,43,44], genero: 'male' }
]

// Storage key
const CART_KEY = 'mdt_cart_v2'

// State
let products = PRODUCTS.slice() // copia
let cart = loadCartFromStorage() || []

// DOM
const productGrid = document.getElementById('productGrid')
const cartCountEl = document.getElementById('cartCount')
const cartItemsEl = document.getElementById('cartItems')
const cartTotalEl = document.getElementById('cartTotal')
const cartModal = document.getElementById('cartModal')
const openCartBtn = document.getElementById('openCartBtn')
const closeCartBtn = document.getElementById('closeCart')
const clearCartBtn = document.getElementById('clearCartBtn')
const checkoutBtn = document.getElementById('checkoutBtn')
const customerName = document.getElementById('customerName')
const customerPhone = document.getElementById('customerPhone')
const customerAddress = document.getElementById('customerAddress')
const toastEl = document.getElementById('toast')

// Filters
const filterGender = document.getElementById('filterGender')
const filterBrand = document.getElementById('filterBrand')
const filterSize = document.getElementById('filterSize')
const applyFiltersBtn = document.getElementById('applyFilters')
const clearFiltersBtn = document.getElementById('clearFilters')
const filtersPanel = document.getElementById('filtersPanel')
const filtersBtn = document.getElementById('filtersBtn')
const searchInput = document.getElementById('searchInput')

// Inicialización
populateFilterOptions()
renderProducts(products)
renderCart()
attachEvents()

/* ------------------ Helpers ------------------ */
function formatCurrency(n){ return '$' + n.toLocaleString('es-CO') }
function showToast(msg, ms = 2200){ if(!toastEl) return; toastEl.textContent = msg; toastEl.hidden = false; setTimeout(()=> toastEl.hidden = true, ms) }

function saveCartToStorage(){ try{ localStorage.setItem(CART_KEY, JSON.stringify(cart)) }catch(e){} }
function loadCartFromStorage(){ try{ const raw = localStorage.getItem(CART_KEY); return raw? JSON.parse(raw): [] }catch(e){ return [] } }

/* ------------------ Productos y filtros ------------------ */
function populateFilterOptions(){
  // marcas
  const marcas = Array.from(new Set(PRODUCTS.map(p => p.marca))).sort()
  filterBrand.innerHTML = '<option value="all">Todas</option>' + marcas.map(m=>`<option value="${m}">${m}</option>`).join('')
  // tallas
  const allSizes = Array.from(new Set(PRODUCTS.flatMap(p=>p.tallas))).sort((a,b)=>a-b)
  filterSize.innerHTML = '<option value="all">Todas</option>' + allSizes.map(s=>`<option value="${s}">${s}</option>`).join('')
}

function applyFilters(){
  const gender = filterGender.value
  const brand = filterBrand.value
  const size = filterSize.value
  const q = (searchInput.value || '').trim().toLowerCase()

  let results = PRODUCTS.filter(p=>{
    if(gender !== 'all' && p.genero !== gender) return false
    if(brand !== 'all' && p.marca !== brand) return false
    if(size !== 'all' && !p.tallas.includes(Number(size))) return false
    if(q){ const hay = (p.nombre + ' ' + p.marca).toLowerCase(); if(!hay.includes(q)) return false }
    return true
  })
  products = results
  renderProducts(products)
}

function clearFilters(){ filterGender.value = 'all'; filterBrand.value = 'all'; filterSize.value = 'all'; searchInput.value = ''; products = PRODUCTS.slice(); renderProducts(products) }

/* ------------------ Render productos ------------------ */
function renderProducts(list){
  productGrid.innerHTML = ''
  if(list.length === 0){ productGrid.innerHTML = '<div class="muted">No se encontraron productos con esos filtros.</div>'; return }

  list.forEach(p => {
    const card = document.createElement('article')
    card.className = 'card'
    card.innerHTML = `
      <img loading="lazy" src="${p.imagen}" alt="${p.nombre} — ${p.marca}" />
      <h4>${p.nombre}</h4>
      <div class="muted">${p.marca}</div>
      <p>${formatCurrency(p.precio)}</p>
      <label for="talla-${p.id}">Talla</label>
      <select id="talla-${p.id}" class="size-select" aria-label="Selecciona talla para ${p.nombre}">
        <option value="">Elige talla</option>
        ${p.tallas.map(t=>`<option value="${t}">${t}</option>`).join('')}
      </select>
      <div style="display:flex;gap:8px;margin-top:auto">
        <button class="btn add-btn" data-id="${p.id}">Agregar</button>
        <button class="btn secondary quick-wa" data-id="${p.id}">Pedir por WhatsApp</button>
      </div>
    `
    productGrid.appendChild(card)
  })
}

/* ------------------ Carrito ------------------ */
function findCartIndex(id, talla){ return cart.findIndex(i=>i.id===id && String(i.talla)===String(talla)) }

function addToCart(id, talla, qty = 1){
  if(!talla){ showToast('Selecciona una talla antes de agregar'); return }
  const idx = findCartIndex(id, talla)
  const prod = PRODUCTS.find(p=>p.id===id)
  if(idx > -1){ cart[idx].cantidad += qty }
  else{ cart.push({ id: prod.id, nombre: prod.nombre, marca: prod.marca, precio: prod.precio, imagen: prod.imagen, talla, cantidad: qty }) }
  saveCartToStorage(); renderCart(); showToast('Agregado al carrito')
}

function changeQuantity(id, talla, delta){ const idx = findCartIndex(id,talla); if(idx===-1) return; cart[idx].cantidad += delta; if(cart[idx].cantidad <= 0) cart.splice(idx,1); saveCartToStorage(); renderCart(); }
function removeFromCart(id, talla){ const idx = findCartIndex(id,talla); if(idx===-1) return; cart.splice(idx,1); saveCartToStorage(); renderCart(); showToast('Producto eliminado') }
function updateCartItemTalla(id, oldTalla, newTalla){ const idx = findCartIndex(id, oldTalla); if(idx===-1) return; // si ya existe con nueva talla, sumar cantidades
  const idxNew = findCartIndex(id, newTalla)
  if(idxNew > -1){ cart[idxNew].cantidad += cart[idx].cantidad; cart.splice(idx,1) }
  else{ cart[idx].talla = newTalla }
  saveCartToStorage(); renderCart(); showToast('Talla actualizada') }

function cartTotals(){ const total = cart.reduce((s,i)=>s + i.precio * i.cantidad, 0); const items = cart.reduce((s,i)=>s + i.cantidad,0); return { total, items } }

function renderCart(){
  if(!cartItemsEl) return
  if(cart.length === 0){ cartItemsEl.innerHTML = '<div class="muted">Tu carrito está vacío.</div>'; cartCountEl.textContent = '0'; cartTotalEl.textContent = formatCurrency(0); return }

  cartItemsEl.innerHTML = ''
  cart.forEach(item => {
    const div = document.createElement('div'); div.className = 'cart-item'
    div.innerHTML = `
      <img src="${item.imagen}" alt="${item.nombre}" />
      <div class="cart-item-details">
        <strong>${item.nombre}</strong>
        <div class="muted">${item.marca} • ${formatCurrency(item.precio)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <div class="qty-controls">
            <button class="qty-minus" data-id="${item.id}" data-talla="${item.talla}">−</button>
            <span class="qty">${item.cantidad}</span>
            <button class="qty-plus" data-id="${item.id}" data-talla="${item.talla}">+</button>
          </div>
          <label>Talla:</label>
          <select class="cart-talla" data-id="${item.id}" data-oldtalla="${item.talla}">
            ${PRODUCTS.find(p=>p.id===item.id).tallas.map(t=>`<option value="${t}" ${String(t)===String(item.talla)?'selected':''}>${t}</option>`).join('')}
          </select>
          <button class="btn secondary remove-item" data-id="${item.id}" data-talla="${item.talla}">Eliminar</button>
        </div>
      </div>
    `
    cartItemsEl.appendChild(div)
  })

  const { total, items } = cartTotals()
  cartCountEl.textContent = String(items)
  cartTotalEl.textContent = formatCurrency(total)
}

/* ------------------ Checkout (WhatsApp) ------------------ */
function checkoutViaWhatsapp(){
  const name = (customerName.value || '').trim()
  const phone = (customerPhone.value || '').trim()
  if(!name){ showToast('Ingresa tu nombre'); return }
  if(cart.length === 0){ showToast('Tu carrito está vacío'); return }

  const lines = cart.map(it => `• ${it.nombre} (${it.marca}) - Talla: ${it.talla} x${it.cantidad} - ${formatCurrency(it.precio * it.cantidad)}`)
  const total = cartTotals().total
  let msg = `Hola, quiero hacer un pedido:%0A%0A${encodeURIComponent(lines.join('%0A'))}%0A%0ATotal: ${encodeURIComponent(formatCurrency(total))}%0ANombre: ${encodeURIComponent(name)}`
  if(customerAddress.value.trim()) msg += `%0ADirección: ${encodeURIComponent(customerAddress.value.trim())}`
  if(phone) msg += `%0ATeléfono: ${encodeURIComponent(phone)}`

  // cambia por tu número de negocio (sin '+')
  const businessPhone = '3217430829'
  const url = `https://wa.me/${businessPhone}?text=${msg}`
  window.open(url, '_blank')
}

/* ------------------ Eventos y delegación ------------------ */
function attachEvents(){
  // Delegación de clicks en productos (agregar / pedido rápido)
  productGrid.addEventListener('click', (e)=>{
    const btnAdd = e.target.closest('.add-btn')
    const btnWa = e.target.closest('.quick-wa')
    if(btnAdd){
      const id = Number(btnAdd.dataset.id)
      const sel = document.getElementById(`talla-${id}`)
      addToCart(id, sel ? sel.value : '')
    }
    if(btnWa){
      const id = Number(btnWa.dataset.id)
      const sel = document.getElementById(`talla-${id}`)
      const selectedSize = sel ? sel.value : ''
      if(!selectedSize){ showToast('Selecciona una talla antes de pedir'); return }
      // abrir WhatsApp con un único producto
      const p = PRODUCTS.find(x=>x.id===id)
      const msg = `Hola, quiero pedir: ${p.nombre} - Talla ${selectedSize}.`;
      const url = `https://wa.me/3217430829?text=${encodeURIComponent(msg)}`
      window.open(url, '_blank')
    }
  })

  // Cart open/close
  openCartBtn.addEventListener('click', ()=>{ cartModal.hidden = false; cartModal.focus(); })
  closeCartBtn.addEventListener('click', ()=>{ cartModal.hidden = true })

  // Clear
  clearCartBtn.addEventListener('click', ()=>{ cart.length = 0; saveCartToStorage(); renderCart(); showToast('Carrito vaciado') })

  // Checkout
  checkoutBtn.addEventListener('click', checkoutViaWhatsapp)

  // Filters
  applyFiltersBtn.addEventListener('click', applyFilters)
  clearFiltersBtn.addEventListener('click', clearFilters)
  filtersBtn.addEventListener('click', ()=>{
    const open = filtersPanel.getAttribute('aria-hidden') === 'false'
    filtersPanel.setAttribute('aria-hidden', String(open))
    filtersBtn.setAttribute('aria-expanded', String(!open))
  })

  // Search live (debounced)
  let tId = null
  searchInput.addEventListener('input', ()=>{ clearTimeout(tId); tId = setTimeout(()=> applyFilters(), 350) })

  // Delegación para acciones dentro del carrito (cantidad, eliminar, cambiar talla)
  cartItemsEl.addEventListener('click', (e)=>{
    if(e.target.matches('.qty-plus')){ changeQuantity(Number(e.target.dataset.id), e.target.dataset.talla, +1) }
    if(e.target.matches('.qty-minus')){ changeQuantity(Number(e.target.dataset.id), e.target.dataset.talla, -1) }
    if(e.target.matches('.remove-item')){ removeFromCart(Number(e.target.dataset.id), e.target.dataset.talla) }
  })

  // Cambiar talla desde el select en carrito
  cartItemsEl.addEventListener('change', (e)=>{
    if(e.target.matches('.cart-talla')){
      const id = Number(e.target.dataset.id)
      const oldTalla = e.target.dataset.oldtalla
      const newTalla = e.target.value
      updateCartItemTalla(id, oldTalla, newTalla)
    }
  })

  // Cerrar modal con Escape
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') cartModal.hidden = true })
}

/* ------------------ Inicial render y guardado ------------------ */
renderCart()
saveCartToStorage()

/* ------------------ Notas ------------------ */
// - Cambia `businessPhone` por tu número de negocio sin el signo + en checkoutViaWhatsapp.
// - Para añadir más productos, edita la constante PRODUCTS.
// - Si quieres que las tallas por género se automaticen, podríamos filtrar las opciones disponibles en el select de cada producto según el genero seleccionado en filtros (lo puedo agregar si quieres).