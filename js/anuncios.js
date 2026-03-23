let todosLosItems = [];

let itemsFiltrados = [];

let paginaActual = 1;
const itemsPorPagina = 10;
let filtroTipo = 'todo';

async function cargarDatos() {
    try {
        const respuesta = await fetch('data/anuncios.json');
        
        todosLosItems = await respuesta.json();

        itemsFiltrados = todosLosItems;

        actualizarPantalla();
    } catch (e) { console.error("Error cargando datos"); }
}

function filtrarPorTipo(tipo) {
    filtroTipo = tipo;
    paginaActual = 1;

    // 1. Quitar la clase 'active' de todos los botones de filtro
    const botones = document.querySelectorAll('.filtros-tipo button');
    botones.forEach(btn => btn.classList.remove('active'));

    // 2. Buscar el botón presionado y ponerle la clase 'active'
    // Buscamos por el atributo onclick que contiene el tipo
    const botonActivo = Array.from(botones).find(btn => 
        btn.getAttribute('onclick').includes(`'${tipo}'`)
    );
    
    if (botonActivo) {
        botonActivo.classList.add('active');
    }

    aplicarFiltros();
}

document.getElementById('buscador').addEventListener('input', () => {
    paginaActual = 1;
    aplicarFiltros();
});

function aplicarFiltros() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    

   itemsFiltrados = todosLosItems.filter(c => {
        const matchTipo = filtroTipo === 'todo' || c.tipo === filtroTipo;
        const matchTexto = c.titulo.toLowerCase().includes(texto) || 
                           //c.id.toLowerCase().includes(texto) || 
                           c.plan.toLowerCase().includes(texto) || 
                           c.precio.toLowerCase().includes(texto) || 
                           c.lugar.toLowerCase().includes(texto)|| 
                           c.descripcion.toLowerCase().includes(texto);

                           

        return matchTipo && matchTexto;
        
    });
    actualizarPantalla();
}

function actualizarPantalla() {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const bloque = itemsFiltrados.slice(inicio, fin);

    const contenedor = document.getElementById('contenedor-items');
    contenedor.innerHTML = '';

    // SI NO HAY RESULTADOS
    if (itemsFiltrados.length === 0) {
        contenedor.innerHTML = `
            <div class="sin-resultados">
                <p>🔍 No encontramos ofertas que coincidan con tu búsqueda.</p>
                <button onclick="limpiarBusqueda()" class="btn-limpiar">Ver todas las ofertas</button>
            </div>`;
        document.querySelector('.paginacion').style.display = 'none'; // Ocultar paginación
        gestionarFlecha(); // <--- Llamada aquí para ocultarla si no hay items

        return;
    }

    // SI HAY RESULTADOS, MOSTRAR PAGINACIÓN Y CARDS
    document.querySelector('.paginacion').style.display = 'flex';


    bloque.forEach(item => {

    let fotosHtml = '';
    if (item.fotos.length > 0) {
        // Generar el HTML de las imágenes
        //let fotosHtml = item.fotos.map((url, i) => {
        fotosHtml = item.fotos.map((url, i) => {
            return `<img src="${url}" ${i > 0 ? 'loading="lazy"' : ''} alt="${item.titulo}">`;
        }).join(''); 
    }

    // Generar los "puntos" indicadores (dots) y flechas
    // Solo se crean si hay más de una foto
    let puntosHtml = '';
    let flechasHtml = '';
    if (item.fotos.length > 1) {
        puntosHtml = `<div class="indicadores-fotos">
            ${item.fotos.map((_, i) => `<span class="punto ${i === 0 ? 'activo' : ''}" onclick="irAFoto(this, ${i})"></span>`).join('')}
        </div>`;
        
        flechasHtml = `
            <button class="btn-carrusel anterior" onclick="deslizarFoto(this, -1)">❮</button>
            <button class="btn-carrusel siguiente" onclick="deslizarFoto(this, 1)">❯</button>
        `;
    }

    if (item.fotos.length > 0) {
        contenedor.innerHTML += `
        <div class="tarjeta-item">
            <div class="contenedor-carrusel">
                <div class="contenedor-fotos" onscroll="actualizarPuntos(this)">
                    ${fotosHtml}
                </div>
                ${puntosHtml}
                ${flechasHtml}
            </div>

            <div class="info">
                <small>${item.tipo.toUpperCase()}</small>
                <h3>${item.titulo}</h3>
                <span><b>${item.lugar}</b></span>
                <p class="precio-plan"><b>${item.precio}</b><br><span><b>${item.plan}</b></span></p>
                <span><b>${item.descripcion}</b><br><br></span>

                <div class="acciones">
                  <a href="${generarEnlaceWhatsApp(item.id, item.titulo)}" 
                  target="_blank" class="btn-contacto">💬 Contactar por WhatsApp</a>
                </div>
            </div>
        </div>`;
    }
    else {
        contenedor.innerHTML += `
        <div class="tarjeta-item">

            <div class="info">
                <small>${item.tipo.toUpperCase()}</small>
                <h3>${item.titulo}</h3>
                <span><b>${item.lugar}</b></span>
                <p class="precio-plan"><b>${item.precio}</b><br><span><b>${item.plan}</b></span></p>
                <span><b>${item.descripcion}</b><br><br></span>

                <div class="acciones">
                  <a href="${generarEnlaceWhatsApp(item.id, item.titulo)}" 
                  target="_blank" class="btn-contacto">💬 Contactar por WhatsApp</a>
                </div>
            </div>
        </div>`;
    }

    
});

    // Actualizar botones de página
    const totalPag = Math.ceil(itemsFiltrados.length / itemsPorPagina);
    document.getElementById('info-paginacion').innerText = `Página ${paginaActual} de ${totalPag || 1}`;
    document.getElementById('btn-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-siguiente').disabled = paginaActual >= totalPag;

    gestionarFlecha(); // <--- Llamada aquí para recalcular al cargar los items
}

// Función auxiliar para resetear todo
function limpiarBusqueda() {
    document.getElementById('buscador').value = '';
    filtrarPorTipo('todo');
}

function cambiarPagina(n) {
    paginaActual += n;
    actualizarPantalla();
    // Esto hace que la pantalla suba al inicio suavemente
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // 'smooth' para que no sea un salto brusco
    });
}

function generarEnlaceWhatsApp(id, titulo) {
    const telefono = "5356113774"; // Reemplaza con tu número real
    const mensajeBase = `Hola ENCuba, estoy interesado en el anuncio: ${titulo} (ID: ${id})`;
    
    // encodeURIComponent es vital para convertir espacios y caracteres especiales a formato URL
    const mensajeCodificado = encodeURIComponent(mensajeBase);
    
    return `https://wa.me/${telefono}?text=${mensajeCodificado}`;
}

cargarDatos();


const filtrosContenedor = document.getElementById('contenedorFiltros');
const flechaIndicadora = document.getElementById('flechaIndicadora');

if (flechaIndicadora) {
    flechaIndicadora.style.cursor = 'pointer'; // Para que en PC salga la manito
    
    flechaIndicadora.addEventListener('click', () => {
        // Desliza 150 píxeles a la derecha cada vez que haces clic
        filtrosContenedor.scrollBy({
            left: 150,
            behavior: 'smooth'
        });
    });
}

if (filtrosContenedor && flechaIndicadora) {

    // Reemplaza tu antiguo event listener por este:
    filtrosContenedor.addEventListener('scroll', gestionarFlecha);
}

function gestionarFlecha() {
    const filtros = document.getElementById('contenedorFiltros');
    const flecha = document.getElementById('flechaIndicadora');

    if (!filtros || !flecha) return;

    // 1. Verificar si el contenido desborda el contenedor (hay scroll)
    const tieneScroll = filtros.scrollWidth > filtros.clientWidth;
    const scrollActual = filtros.scrollLeft;
    const scrollMaximo = filtros.scrollWidth - filtros.clientWidth;

    // 2. Si no hay scroll o ya estamos al final, ocultar
    if (!tieneScroll || scrollActual >= (scrollMaximo - 10)) {
        flecha.classList.add('hidden');
    } else {
        flecha.classList.remove('hidden');
    }
}

// 1. Actualiza los puntos cuando se hace scroll (con el dedo o flecha)
function actualizarPuntos(el) {
    const scrollLeft = el.scrollLeft;
    const anchoFoto = el.clientWidth;
    const indice = Math.round(scrollLeft / anchoFoto);
    
    // Buscar los puntos dentro del contenedor padre de este carrusel
    const puntos = el.parentElement.querySelectorAll('.punto');
    puntos.forEach((p, i) => {
        if (i === indice) p.classList.add('activo');
        else p.classList.remove('activo');
    });
}

// 2. Lógica para las flechas laterales (anterior/siguiente)
function deslizarFoto(btn, direccion) {
    // Buscar el contenedor de fotos hermano de este botón
    const carrusel = btn.parentElement.querySelector('.contenedor-fotos');
    const anchoFoto = carrusel.clientWidth;
    
    carrusel.scrollBy({
        left: anchoFoto * direccion,
        behavior: 'smooth'
    });
}

// 3. Lógica para hacer clic directamente en los puntos
function irAFoto(punto, indice) {
    // Buscar el contenedor de fotos padre de este punto
    const carrusel = punto.parentElement.parentElement.querySelector('.contenedor-fotos');
    const anchoFoto = carrusel.clientWidth;
    
    carrusel.scrollTo({
        left: anchoFoto * indice,
        behavior: 'smooth'
    });
}

