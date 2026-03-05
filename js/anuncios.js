let todasLasCasas = [];
let casasFiltradas = [];
let paginaActual = 1;
const itemsPorPagina = 10;
let filtroTipo = 'todos';

async function cargarDatos() {
    try {
        const respuesta = await fetch('data/anuncios.json');
        todasLasCasas = await respuesta.json();
        casasFiltradas = todasLasCasas;
        actualizarPantalla();
    } catch (e) { console.error("Error cargando datos"); }
}

function filtrarPorTipo(tipo) {
    filtroTipo = tipo;
    paginaActual = 1;
    aplicarFiltros();
}

document.getElementById('buscador').addEventListener('input', () => {
    paginaActual = 1;
    aplicarFiltros();
});

function aplicarFiltros() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    casasFiltradas = todasLasCasas.filter(c => {
        const matchTipo = filtroTipo === 'todos' || c.tipo === filtroTipo;
        const matchTexto = c.titulo.toLowerCase().includes(texto);
        return matchTipo && matchTexto;
    });
    actualizarPantalla();
}

function actualizarPantalla() {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const bloque = casasFiltradas.slice(inicio, fin);

    const contenedor = document.getElementById('contenedor-casas');
    contenedor.innerHTML = '';

    bloque.forEach(casa => {
        let fotos = casa.fotos.map((url, i) => 
            `<img src="${url}" ${i > 0 ? 'loading="lazy"' : ''}>`
        ).join('');

        contenedor.innerHTML += `
            <div class="tarjeta-casa">
                <div class="contenedor-fotos">${fotos}</div>
                <div class="info">
                    <small>${casa.tipo.toUpperCase()}</small>
                    <h3>${casa.titulo}</h3>
                    <p><b>${casa.precio}</b></p>
                </div>
            </div>`;
    });

    // Actualizar botones de página
    const totalPag = Math.ceil(casasFiltradas.length / itemsPorPagina);
    document.getElementById('info-paginacion').innerText = `Página ${paginaActual} de ${totalPag || 1}`;
    document.getElementById('btn-anterior').disabled = paginaActual === 1;
    document.getElementById('btn-siguiente').disabled = paginaActual >= totalPag;
}

function cambiarPagina(n) {
    paginaActual += n;
    actualizarPantalla();
    window.scrollTo(0,0);
}

cargarDatos();