// Cada entrada corresponde al ejercicio con el mismo índice en datasets.json.
export const EXPLANATIONS = [
  [
    {
      result: 'Aparecen solo los nombres de quienes vendieron una casa de más de 1 000 000.',
      reason: 'La relación entre vendedores, ventas y casas permite asociar cada precio con su vendedor. Al conservar los precios mayores al límite y proyectar nombre, se descartan las demás columnas y los nombres repetidos.',
    },
    {
      result: 'Las fechas corresponden a ventas de Hugo Perez de casas cuyo precio supera 1 000 000.',
      reason: 'Las relaciones conectadas aportan el vendedor, la fecha y el precio de cada venta. Las tres condiciones deben cumplirse a la vez; la proyección deja únicamente fecha y elimina fechas duplicadas.',
    },
    {
      result: 'Carlos Mendoza aparece como vendedor con numVend 6000 y los datos solicitados.',
      reason: 'La unión agrega una relación con la nueva fila al conjunto original. Como ambas tienen las mismas columnas y tipos, los vendedores anteriores se conservan.',
    },
    {
      result: 'Solo las casas de Chih tienen su precio aumentado en 500 000; las demás mantienen sus datos.',
      reason: 'Se identifican las casas de Chih, se retiran sus versiones anteriores y se agregan sus versiones con el precio actualizado. Así no quedan simultáneamente el precio viejo y el nuevo.',
    },
    {
      result: 'La relación conserva todas las columnas de Casa y ninguna fila cuya ciudad sea Juarez.',
      reason: 'La selección identifica las casas de Juarez. La diferencia entre Casa y esa selección deja exactamente las demás filas, con el esquema original.',
    },
  ],
  [
    {
      result: 'Ana Lopez figura en Clientes con el número, la dirección, el teléfono y la población pedidos.',
      reason: 'La unión incorpora la nueva fila con las mismas columnas y tipos que Clientes. Las filas que ya estaban en la relación permanecen.',
    },
    {
      result: 'El producto 160 aparece con la descripción Calentador solar y precio 4500.',
      reason: 'La unión añade la fila completa a Productos. Al compartir esquema, el resultado reúne el producto nuevo y los existentes.',
    },
    {
      result: 'La venta 3471 relaciona el producto 100 con el cliente 10 y cantidad 1.',
      reason: 'La unión añade esa fila a Venta con sus cuatro columnas originales. Las ventas previas permanecen en el resultado.',
    },
    {
      result: 'La venta con idVenta 3468 ya no aparece; las demás ventas conservan sus columnas.',
      reason: 'La selección aísla la venta 3468 y la diferencia la retira de Venta. Ninguna otra fila cumple ese identificador.',
    },
    {
      result: 'Permanecen las ventas cuyos productos no cuestan menos de 1500, con las columnas originales de Venta.',
      reason: 'Al conectar Venta con Productos se conoce el precio de cada producto vendido. La selección encuentra las ventas de productos baratos; la proyección recupera solo columnas de Venta y la diferencia las retira.',
    },
    {
      result: 'La venta 3468 tiene codProducto 157 y conserva sus demás datos; las otras ventas siguen presentes.',
      reason: 'La versión anterior de la venta se identifica y se retira. La unión agrega la versión corregida, evitando dos filas para la misma venta.',
    },
    {
      result: 'Pedro tiene el teléfono 555688722 y los demás clientes conservan sus datos.',
      reason: 'Se retira la fila anterior de Pedro y se agrega la fila completa con el teléfono nuevo. La diferencia y la unión mantienen intactas las demás filas y columnas de Clientes.',
    },
  ],
  [
    {
      result: 'Aparecen únicamente títulos de libros cuyos autores tienen nacionalidad MX.',
      reason: 'La conexión entre Libro y Autor vincula cada título con la nacionalidad de quien lo escribió. La selección conserva MX y la proyección deja solo titulo, sin duplicados.',
    },
    {
      result: 'Aparecen editoriales de México que publican libros de Sistemas escritos por autores de otra nacionalidad.',
      reason: 'La conexión reúne datos de libros, autores y editoriales. Las condiciones sobre país, tema y nacionalidad se aplican juntas; la proyección conserva solo editorial y elimina repetidos.',
    },
    {
      result: 'Carlos Ruiz aparece en Autor con clave 2100, nacionalidad ESP y profesión Escritor.',
      reason: 'La unión incorpora una fila con el mismo esquema de Autor y conserva a los autores que ya existían.',
    },
    {
      result: 'Los libros 159753 y 159851 tienen tema Base de Datos; los demás mantienen su tema.',
      reason: 'Se seleccionan ambas claves y se retiran sus versiones anteriores. Luego se unen las filas completas con el tema nuevo, conservando los demás atributos de cada libro.',
    },
    {
      result: 'Cada fila muestra el título de un libro y la editorial de un autor Catedratico.',
      reason: 'Las conexiones vinculan Libro con Autor y Editorial. La selección restringe la profesión y la proyección conserva solo titulo y editorial, eliminando parejas repetidas.',
    },
    {
      result: 'Los libros escritos por Rogers ya no están en Libro; permanecen todas las columnas originales.',
      reason: 'La conexión identifica los libros de ese autor. Al proyectar las columnas de Libro antes de la diferencia, se pueden retirar esas filas sin alterar el esquema ni los demás libros.',
    },
  ],
  [
    { result: 'Aparecen Spark y Aveo, los dos Chevrolet reparados en marzo de 2013.', reason: 'La reunión conecta cada vehículo con sus reparaciones. La selección combina marca e intervalo de fechas; la proyección deja una fila por vehículo aunque tenga varios trabajos.' },
    { result: 'Nova y Spark recibieron los seis servicios del catálogo.', reason: 'La proyección de reparaciones forma pares de placa y código. La división conserva las placas relacionadas con cada código de Servicios; la reunión recupera sus datos descriptivos.' },
    { result: 'Aparecen cuatro reparaciones de Federico en Mustang y Lancer.', reason: 'Las reuniones enlazan mecánico, vehículo y servicio por sus claves comunes. La selección conserva a Federico y la proyección muestra solo los datos pedidos.' },
    { result: 'Aparecen seis servicios y sus horas para el vehículo 15554.', reason: 'La reunión aporta el nombre y tipo de cada servicio a las reparaciones. La selección restringe la placa y la proyección conserva las horas y los datos solicitados.' },
    { result: 'Aparecen cuatro reparaciones de Pintura con el color de cada vehículo.', reason: 'La reunión conecta reparación, servicio y vehículo. La selección identifica Pintura y la proyección conserva descripcionVehiuculo como color.' },
  ],
];
