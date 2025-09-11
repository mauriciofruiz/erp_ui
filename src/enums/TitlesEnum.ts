export enum TitlesEnum {
  BUSQUEDA_AVANZADA = 'Búsqueda Avanzada',
  MODO_LECTURA = '(Modo Lectura)',
  MODO_EDICION = '(Modo Edición)',

  NUEVA_FACTURA_VENTA = 'Nueva Factura PDV',
  FACTURA_PDV_LECTURA = `Factura PDV ${TitlesEnum.MODO_LECTURA} - N° `,
  FACTURA_PDV_EDICION = `Factura PDV ${TitlesEnum.MODO_EDICION} - N° `,

  NUEVO_CIERRE_CAJA = 'Nuevo Cierre de Caja',
  CIERRE_CAJA_LECTURA = `Cierre de Caja ${TitlesEnum.MODO_LECTURA} - N° `,
  CIERRE_CAJA_EDICION = `Cierre de Caja ${TitlesEnum.MODO_EDICION} - N° `,

  NUEVA_GUIA_REMISION = 'Nueva Guía de Remisión',
  GUIA_REMISION_LECTURA = `Guía de Remisión ${TitlesEnum.MODO_LECTURA} - N° `,
  GUIA_REMISION_EDICION = `Guía de Remisión ${TitlesEnum.MODO_EDICION} - N° `,

  NUEVA_NOTA_CREDITO = 'Nueva Nota de Crédito',
  NOTA_CREDITO_LECTURA = `Nota de Crédito ${TitlesEnum.MODO_LECTURA} - N° `,
  NOTA_CREDITO_EDICION = `Nota de Crédito ${TitlesEnum.MODO_EDICION} - N° `,

  COBROS_CLIENTES_LECTURA = `Cobros Cliente ${TitlesEnum.MODO_LECTURA} - N° `,

  NUEVA_ORDEN_COMPRA = 'Nueva Orden de Compra',
  ORDEN_COMPRA_LECTURA = `Orden de Compra ${TitlesEnum.MODO_LECTURA} - N° `,
  ORDEN_COMPRA_EDICION = `Orden de Compra ${TitlesEnum.MODO_EDICION} - N° `,

  NUEVA_NOTA_DEBITO = 'Nueva Nota de Débito',
  NOTA_DEBITO_LECTURA = `Nota de Débito ${TitlesEnum.MODO_LECTURA} - N° `,
  NOTA_DEBITO_EDICION = `Nota de Débito ${TitlesEnum.MODO_EDICION} - N° `,
  NUEVA_RETENCION_CLIENTE = 'Nueva Retención Cliente',
  RETENCION_CLIENTE_LECTURA = `Retención Cliente ${TitlesEnum.MODO_LECTURA} - N° `,
  RETENCION_CLIENTE_EDICION = `Retención Cliente ${TitlesEnum.MODO_EDICION} - N° `,

  CIERRE_PRODUCCION = 'Cierre de Producción',

  MENSAJE_CIERRE_PERIODO = 'La fecha de emisión no puede ser anterior a la fecha de cierre del módulo ',
  MENSAJE_CIERRE_PERIODO_ADQUSICIONES = MENSAJE_CIERRE_PERIODO +
    'de ADQUISICIONES',

  MENSAJE_CIERRE_PERIODO_CONTABILIDAD = MENSAJE_CIERRE_PERIODO +
    'de CONTABILIDAD',

  MENSAJE_CIERRE_PERIODO_VENTAS = MENSAJE_CIERRE_PERIODO + 'de VENTAS',

  MENSAJE_CIERRE_PERIODO_PRODUCCION = MENSAJE_CIERRE_PERIODO + 'de PRODUCCIÓN',

  MENSAJE_CIERRE_PERIODO_INVENTARIO = MENSAJE_CIERRE_PERIODO + 'de INVENTARIO',

  MENSAJE_CIERRE_PERIODO_BANCOS = MENSAJE_CIERRE_PERIODO + 'de BANCOS',

  NUEVO_DEPOSITO = 'Nuevo Depósito',
  DEPOSITO_LECTURA = `Depósito ${TitlesEnum.MODO_LECTURA} - N° `,
  DEPOSITO_EDICION = `Depósito ${TitlesEnum.MODO_EDICION} - N° `,
  
}
