// Ordered like datasets.json so the laboratory guide uses the active database.
export const GUIDE_EXAMPLES = [
  {
    goal: 'Ver la ciudad y el precio de las casas que cuestan más de un millón.',
    join: 'Vendedor ⋈ Ventas',
    steps: [
      { title: 'Parte de una tabla', expression: 'Casa', text: 'Casa es la relación de entrada. Cada fila es una casa y cada columna describe uno de sus datos.' },
      { title: 'Filtra las filas', expression: 'σ precio > 1000000 (Casa)', text: 'σ (selección) conserva las casas cuyo precio supera 1000000. Las columnas se mantienen.' },
      { title: 'Elige las columnas', expression: 'π ciudad, precio (σ precio > 1000000 (Casa))', text: 'π (proyección) conserva ciudad y precio del resultado anterior. También elimina filas duplicadas.' },
    ],
  },
  {
    goal: 'Ver la descripción y el precio de los productos que cuestan más de 2000.',
    join: 'Clientes ⋈ Venta',
    steps: [
      { title: 'Parte de una tabla', expression: 'Productos', text: 'Productos es la relación de entrada. Cada fila es un producto y cada columna describe uno de sus datos.' },
      { title: 'Filtra las filas', expression: 'σ precio > 2000 (Productos)', text: 'σ (selección) conserva los productos cuyo precio supera 2000. Las columnas se mantienen.' },
      { title: 'Elige las columnas', expression: 'π descripcion, precio (σ precio > 2000 (Productos))', text: 'π (proyección) conserva descripcion y precio del resultado anterior. También elimina filas duplicadas.' },
    ],
  },
  {
    goal: 'Ver el título y las páginas de los libros con más de 500 páginas.',
    join: 'Libro ⋈ Autor',
    steps: [
      { title: 'Parte de una tabla', expression: 'Libro', text: 'Libro es la relación de entrada. Cada fila es un libro y cada columna describe uno de sus datos.' },
      { title: 'Filtra las filas', expression: 'σ pagunas > 500 (Libro)', text: 'σ (selección) conserva los libros con más de 500 páginas. La columna se llama pagunas en esta base; escríbela tal como aparece.' },
      { title: 'Elige las columnas', expression: 'π titulo, pagunas (σ pagunas > 500 (Libro))', text: 'π (proyección) conserva titulo y pagunas del resultado anterior. También elimina filas duplicadas.' },
    ],
  },
  {
    goal: 'Ver la placa y el modelo de los vehículos Chevrolet.',
    join: 'Vehiculos ⋈ Reparaciones',
    steps: [
      { title: 'Parte de una tabla', expression: 'Vehiculos', text: 'Vehiculos contiene una fila por placa y describe cada automóvil.' },
      { title: 'Filtra las filas', expression: "σ marca = 'Chevrolet' (Vehiculos)", text: 'La selección conserva solo los vehículos cuya marca es Chevrolet.' },
      { title: 'Elige las columnas', expression: "π placaVehiculo, modelo (σ marca = 'Chevrolet' (Vehiculos))", text: 'La proyección muestra la placa y el modelo, sin columnas adicionales ni filas duplicadas.' },
    ],
  },
];

const operationSettings = [
  {
    source: 'Casa', condition: "ciudad = 'Chih'", subset: "ciudad = 'Juarez'",
    join: 'Vendedor ⋈ Ventas',
    division: 'π numVend, numCasa (Ventas) ÷ π numCasa (σ numVend = 3465 (Ventas))',
    divisionText: 'Busca vendedores relacionados con todas las casas vendidas por Hugo. Aquí, Hugo cumple ambas relaciones.',
  },
  {
    source: 'Productos', condition: 'precio > 2000', subset: 'precio < 1500',
    join: 'Clientes ⋈ Venta',
    division: 'π numCliente, codProducto (Venta) ÷ π codProducto (σ numCliente = 14 (Venta))',
    divisionText: 'Busca clientes que compraron todos los productos que compró el cliente 14.',
  },
  {
    source: 'Libro', condition: 'pagunas > 500', subset: "tema = 'Sistemas'",
    join: 'Libro ⋈ Autor',
    division: 'π cveAutor, numSerie (Libro) ÷ π numSerie (σ cveAutor = 1752 (Libro))',
    divisionText: 'Busca autores relacionados con todos los libros de la autora 1752.',
  },
  {
    source: 'Vehiculos', condition: "marca = 'Chevrolet'", subset: "marca = 'Toyota'",
    join: 'Vehiculos ⋈ Reparaciones',
    division: 'π placaVehiculo, codigoServicio (Reparaciones) ÷ π codigoServicio (Servicios)',
    divisionText: 'Busca vehículos que recibieron todos los servicios del catálogo.',
  },
];

export const GUIDE_OPERATIONS = operationSettings.map(({ source, condition, subset, join, division, divisionText }) => {
  const filtered = `σ ${condition} (${source})`;
  const other = `σ ${subset} (${source})`;
  return [
    { symbol: '⋈', title: 'Join natural', expression: join, inputs: join.split(' ⋈ '), text: 'Relaciona las filas que comparten el mismo valor en las columnas comunes. Las columnas comunes aparecen una sola vez.' },
    { symbol: '∪', title: 'Unión', expression: `${filtered} ∪ (${other})`, inputs: [filtered, other], text: 'Reúne las filas de ambos filtros sin repetirlas. Las dos relaciones tienen las mismas columnas y tipos.' },
    { symbol: '−', title: 'Diferencia', expression: `${source} − (${filtered})`, inputs: [source, filtered], text: 'Parte de la tabla original y retira las filas que cumplen el filtro.' },
    { symbol: '∩', title: 'Intersección', expression: `${source} ∩ (${filtered})`, inputs: [source, filtered], text: 'Conserva únicamente las filas que aparecen en ambas relaciones.' },
    { symbol: '÷', title: 'División', expression: division, inputs: division.split(' ÷ '), text: divisionText },
  ];
});
