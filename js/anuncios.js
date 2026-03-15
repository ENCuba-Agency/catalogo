//let todasLasCasas = [];
let todosLosItems = [];

//let casasFiltradas = [];
let itemsFiltrados = [];

let paginaActual = 1;
const itemsPorPagina = 10;
let filtroTipo = 'todo';

async function cargarDatos() {
    try {
        const respuesta = await fetch('data/anuncios.json');
        //todasLasCasas = await respuesta.json();
        todosLosItems = await respuesta.json();

        //casasFiltradas = todasLasCasas;
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
                           c.id.toLowerCase().includes(texto);

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

        let fotos = item.fotos.map((url, i) => {
        if (i === 0) {
            // La primera foto carga normal para que no se vea vacío
            return `<img src="${url}" alt="${item.titulo}">`;
        } else {
            // Las demás fotos usan lazy loading real
            return `<img src="${url}" loading="lazy" alt="${item.titulo} - vista ${i + 1}">`;
        }
    }).join('');

        contenedor.innerHTML += `
            <div class="tarjeta-item">
                <div class="contenedor-fotos">
                    ${fotos}
                </div>

                <div class="info">
                    <small>${item.tipo.toUpperCase()}</small>
                    <h3>${item.titulo}</h3>
                    <p class="precio-plan"><b>${item.precio}</b><br><span>${item.plan}</span></p>

                    <div class="acciones">
                      <a href="${generarEnlaceWhatsApp(item.id, item.titulo)}" 
                      target="_blank" class="btn-contacto">💬 Contactar por WhatsApp</a>

                        
                    </div>
                </div>
            </div>`;
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
    
    /*
    filtrosContenedor.addEventListener('scroll', () => {
        const scrollMaximo = filtrosContenedor.scrollWidth - filtrosContenedor.clientWidth;
        const scrollActual = filtrosContenedor.scrollLeft;

        // Si llegamos al final, ocultamos la flecha
        if (scrollActual >= (scrollMaximo - 10)) {
            flechaIndicadora.style.opacity = '0';
        } else {
            flechaIndicadora.style.opacity = '1';
        }
    });
    */
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

