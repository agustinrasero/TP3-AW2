const obtenemosProductos = async () => {
    // Solicitamos api
    const datos = await fetch('http://localhost:3000/productos');
    const jsonProductos = await datos.json();
    const productos = jsonProductos;
    // Renderizamos
    renderizar('productos', productos);
};

const renderizar = (id, productos) => {
    // Donde se renderiza
    const contenedor = document.getElementById(id);
    // Construimos el HTML
    let html = '';
    productos.forEach((producto) => {
        html += `<article>
                    <ul>
                        <li class="productos-nombre">${producto.nombre}  </li>
                        <li>Stock: ${producto.stock}
                        <li>Categoria: ${producto.categoria}
                        <li>Marca: ${producto.marca}
                    </ul>
            </article>`;
    });
    // Asignamos el contenido
    contenedor.innerHTML = html;
};
// ---------------------------------------------------------
// Invocar funciones ---------------------------------------
// ---------------------------------------------------------
obtenemosProductos();
