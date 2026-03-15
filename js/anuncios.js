//let todasLasCasas = [];
let todosLosItems = [];

//let casasFiltradas = [];
let itemsFiltrados = [];

let paginaActual = 1;
const itemsPorPagina = 10;
let filtroTipo = 'todos';

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
    /*casasFiltradas = todasLasCasas.filter(c => {
        const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;
        const matchTexto = c.titulo.toLowerCase().includes(texto);
        return matchTipo && matchTexto;
        
    })*/
   itemsFiltrados = todosLosItems.filter(c => {
        const matchTipo = filtroTipo === 'todo' || c.tipo === filtroTipo;
        const matchTexto = c.titulo.toLowerCase().includes(texto);

        return matchTipo && matchTexto;
        
    });
    actualizarPantalla();
}

function actualizarPantalla() {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    //const bloque = casasFiltradas.slice(inicio, fin);
    const bloque = itemsFiltrados.slice(inicio, fin);

    const contenedor = document.getElementById('contenedor-items');
    contenedor.innerHTML = '';


    bloque.forEach(item => {
        let fotos = item.fotos.map((url, i) => 
            `<img src="${url}" ${i > 0 ? 'loading="lazy"' : ''}>`
        ).join('');

        contenedor.innerHTML += `
            <div class="tarjeta-item">
                <div class="contenedor-fotos">
                    ${fotos}
                </div>

                <div class="info">
                    <small>${item.tipo.toUpperCase()}</small>
                    <h3>${item.titulo}</h3>
                    <p class="precio-plan"><b>${item.precio}</b></br><span>${item.plan}</span></p>

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
}

function cambiarPagina(n) {
    paginaActual += n;
    actualizarPantalla();
    window.scrollTo(0,0);
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
}

