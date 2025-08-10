const PRODUCTS = [
  { codigo:1, nombre:"Tenis Nike Air", marca:"Nike", precio:180000, tallas:[36,37,38,39,40,41,42], imagen:"https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRevt2Bx0-zxv8RWuMsc2SrnifAYw4nvZ81JxkXlolB6KtQ-Daqf2mXIazDk3u9FfYxd9cCJlZQg_Hzugdz65-J1xgD-e2goG6P27DZS3gpZeCCqYGlKZJN9zU" },
  { codigo:2, nombre:"Adidas Classic", marca:"Adidas", precio:150000, tallas:[37,38,39,40,41], imagen:"https://images.unsplash.com/photo-1519741493670-3a8e44d7f29e?auto=format&fit=crop&w=400&q=80" },
  { codigo:3, nombre:"Puma Street", marca:"Puma", precio:130000, tallas:[38,39,40,41,42,43], imagen:"https://images.unsplash.com/photo-1600185369446-cbb5a59b35f4?auto=format&fit=crop&w=400&q=80" },
  { codigo:4, nombre:"New Balance 530", marca:"New Balance", precio:200000, tallas:[36,37,38,39,], imagen:"https://fershopctg.com/cdn/shop/files/922CA935-BDA3-4B40-A70E-A7DE84131524.png?v=1745800301&width=1445" }

]

const productGrid = document.getElementById('productGrid')
const searchInput = document.getElementById('searchInput')
const genderFilterBtn = document.getElementById('genderFilterBtn')
const genderFilter = document.getElementById('genderFilter')
let selectedGender = 'all'

// Filtrar por género y tallas según definición
function filterByGender(product, gender){
  if(gender === 'all') return true
  if(gender === 'female'){
    return product.tallas.some(t => t >= 36 && t <= 39)
  }
  if(gender === 'male'){
    return product.tallas.some(t => t >= 40 && t <= 44)
  }
  return true
}

function filterProducts(){
  const query = searchInput.value.trim().toLowerCase()
  const filtered = PRODUCTS.filter(p => {
    const nameMarca = (p.nombre + ' ' + p.marca).toLowerCase()
    return nameMarca.includes(query) && filterByGender(p, selectedGender)
  })
  renderProducts(filtered)
}

function renderProducts(list){
  productGrid.innerHTML = ''
  if(list.length === 0){
    productGrid.innerHTML = '<p>No se encontraron productos.</p>'
    return
  }
  list.forEach(p => {
    let tallasVisibles = p.tallas
    if(selectedGender === 'female') tallasVisibles = p.tallas.filter(t => t >= 36 && t <= 39)
    else if(selectedGender === 'male') tallasVisibles = p.tallas.filter(t => t >= 40 && t <= 44)

    productGrid.innerHTML += `
      <article class="card" tabindex="0">
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" />
        <h4>${p.nombre}</h4>
        <small>${p.marca}</small>
        <p><strong>$${p.precio.toLocaleString('es-CO')}</strong></p>
        <p>Tallas: ${tallasVisibles.length ? tallasVisibles.join(', ') : '<em>No disponible para este género</em>'}</p>
      </article>
    `
  })
}

// Mostrar / ocultar filtro género
genderFilterBtn.addEventListener('click', () => {
  const shown = genderFilter.style.display === 'block'
  genderFilter.style.display = shown ? 'none' : 'block'
  genderFilterBtn.setAttribute('aria-expanded', String(!shown))
})

// Cambiar género seleccionado
genderFilter.addEventListener('change', e => {
  if(e.target.name === 'gender'){
    selectedGender = e.target.value
    filterProducts()
  }
})

// Buscar en input
searchInput.addEventListener('input', () => {
  filterProducts()
})

// Inicial render
filterProducts()

let cart = {}

// Renderizar productos con selector de talla y botón (sin input cantidad)
// Renderizar productos con selector de talla y botón (sin input cantidad)
function renderProducts(list){
  productGrid.innerHTML = ''
  if(list.length === 0){
    productGrid.innerHTML = '<p>No se encontraron productos.</p>'
    return
  }
  list.forEach(p => {
    let tallasVisibles = p.tallas
    if(selectedGender === 'female') tallasVisibles = p.tallas.filter(t => t >= 36 && t <= 39)
    else if(selectedGender === 'male') tallasVisibles = p.tallas.filter(t => t >= 40 && t <= 44)

    const optionsSizes = tallasVisibles.map(t => `<option value="${t}">${t}</option>`).join('')

    productGrid.innerHTML += `
      <article class="card" tabindex="0">
        <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" />
        <h4>${p.nombre}</h4>
        <small>${p.marca}</small>
        <p><strong>$${p.precio.toLocaleString('es-CO')}</strong></p>
        <p>Tallas: ${tallasVisibles.length ? tallasVisibles.join(', ') : '<em>No disponible para este género</em>'}</p>
        <select class="size-select" aria-label="Selecciona talla para ${p.nombre}">
          ${optionsSizes}
        </select>
        <button class="addToCartBtn" data-codigo="${p.codigo}">Agregar al carrito</button>
      </article>
    `
  })

  // Eventos para agregar al carrito
  document.querySelectorAll('.addToCartBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const codigo = btn.dataset.codigo
      const card = btn.closest('.card')
      const tallaSelect = card.querySelector('.size-select')
      const talla = tallaSelect.value
      if(!talla){
        alert('Por favor selecciona una talla')
        return
      }
      addToCart(codigo, talla, 1)
    })
  })
}

function addToCart(codigo, talla, qty) {
  const key = `${codigo}_${talla}`
  if(cart[key]) {
    cart[key] += qty
  } else {
    cart[key] = qty
  }
  renderCart()
}

function removeFromCart(key) {
  delete cart[key]
  renderCart()
}

// Render carrito con botones + y -
function renderCart() {
  const cartItemsDiv = document.getElementById('cartItems')
  const cartTotalP = document.getElementById('cartTotal')
  const checkoutBtn = document.getElementById('checkoutBtn')

  const keys = Object.keys(cart)
  if(keys.length === 0){
    cartItemsDiv.innerHTML = 'El carrito está vacío.'
    cartTotalP.textContent = ''
    checkoutBtn.style.display = 'none'
    return
  }

  let html = '<ul>'
  let total = 0
  keys.forEach(key => {
    const [codigo, talla] = key.split('_')
    const product = PRODUCTS.find(p => p.codigo == codigo)
    const qty = cart[key]
    const subtotal = product.precio * qty
    total += subtotal
    html += `<li style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
      <img src="${product.imagen}" alt="${product.nombre}" style="width:50px; height:50px; object-fit:contain; border:1px solid #ddd; border-radius:4px;" />
      <div style="flex-grow:1;">
        ${product.nombre} (Talla ${talla}) <br/>
        <button class="qty-btn" data-key="${key}" data-action="decrease" aria-label="Disminuir cantidad de ${product.nombre} talla ${talla}">-</button>
        <span class="qty-display">${qty}</span>
        <button class="qty-btn" data-key="${key}" data-action="increase" aria-label="Aumentar cantidad de ${product.nombre} talla ${talla}">+</button>
      </div>
      <div>
        $${subtotal.toLocaleString('es-CO')}<br/>
        <button class="removeBtn" data-key="${key}" aria-label="Eliminar ${product.nombre} talla ${talla} del carrito" style="background:none; border:none; color:#cc0000; font-weight:bold; cursor:pointer;">X</button>
      </div>
    </li>`
  })
  html += '</ul>'

  cartItemsDiv.innerHTML = html
  cartTotalP.textContent = `Total: $${total.toLocaleString('es-CO')}`
  checkoutBtn.style.display = 'inline-block'

  // Eliminar producto
  document.querySelectorAll('.removeBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key
      removeFromCart(key)
    })
  })

  // Botones + y -
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key
      const action = btn.dataset.action
      if(action === 'increase'){
        cart[key]++
      } else if(action === 'decrease'){
        cart[key]--
        if(cart[key] < 1){
          removeFromCart(key)
          return
        }
      }
      renderCart()
    })
  })
}

// Evento pagar por WhatsApp
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if(Object.keys(cart).length === 0) return alert('El carrito está vacío.')

  let message = 'Hola, quiero hacer el siguiente pedido:%0A'
  let total = 0
  Object.entries(cart).forEach(([key, qty]) => {
    const [codigo, talla] = key.split('_')
    const product = PRODUCTS.find(p => p.codigo == codigo)
    const subtotal = product.precio * qty
    total += subtotal
    message += `- ${product.nombre} (${product.codigo}) (Talla ${talla}) x${qty} = $${subtotal.toLocaleString('es-CO')}%0A`
  })
  message += `Total: $${total.toLocaleString('es-CO')}`

  const whatsappNumber = '3217430829' // tu número sin + ni espacios
  const url = `https://wa.me/${whatsappNumber}?text=${message}`
  window.open(url, '_blank')
})

// Inicializar
filterProducts()
renderCart()
