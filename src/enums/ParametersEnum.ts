export enum ParametersEnum {
  ID_ROW_TOTAL = 'total-id',
  ID_ROW_SUBTOTAL = 'subtotal-id',
  ID_ROW_NO_ID = 'no-id',
  TAX_RATE_ID_ZERO = 1,
  TAX_RATE_ID_DEFAULT = 7, // ID DEL IVA DEL 15% POR DEFECTO EN TABLA TARIFA IVA DE BDD
  RETENTION_SOURCE_ID_DEFAULT = 20, // ID DE LA RETENCION DE FUENTE DEL 1.75% POR DEFECTO EN TABLA TARIFA RETENCION DE FUENTE DE BDD
  RETENTION_IVA_ID_DEFAULT = 4, // ID DE LA RETENCION DE IVA DEL 10% POR DEFECTO EN TABLA TARIFA RETENCION DE IVA DE BDD
  RETENCION_IVA_PARAMETER = 'IVA',
  RETENCION_FUENTE_PARAMETER = 'FUENTE',
  MENSAJE_CONFIRMACION_GENERICO = 'Una vez confirmado el documento no se podrá modificar. ¿Desea confirmar el documento?',
  MENSAJE_ANULACION_GENERICO = '¿Está seguro que desea anular documento?. Esta transacción es irreversible.',
  MODO_EDICION_HABILITADO = 'Modo edición deshabilitado',
  MODO_EDICION_DESHABILITADO = 'Modo edición habilitado',
  MODO_LECTURA_HABILITADO = 'Modo lectura habilitado',
  MODO_LECTURA_DESHABILITADO = 'Modo lectura deshabilitado',
  ERROR_SIN_DETALLE = 'No se puede guardar un documento sin detalle',
  ERROR_TRANSPORTISTA_INCOMPLETO = 'Debe seleccionar un transportista y completar toda la información requerida',
  ERROR_DIRECCION_VACIA = 'Debe indicar una dirección',
  ERROR_FECHA_VACIA = 'Debe indicar una fecha',
  MENSAJE_NC_GENERICO = 'NC CLIENTE: $ - FACTURA Nro. - #',
  MENSAJE_ND_GENERICO = 'ND CLIENTE: $ - FACTURA Nro. - #',
  MENSAJE_TRANSACCION_GENERICO = 'Una vez realizada la transacción no se podrá modificar. ¿Desea realizar la transacción?',
  CONSUMIDOR_FINAL_ID = '9999999999999', // IDENTIFICACION DEL CONSUMIDOR FINAL ANTE EL SRI
  MONTO_MAXIMO_CONSUMIDOR_FINAL = 50, // MONTO MAXIMO PARA CONSUMIDOR FINAL
  TIPO_TRANSACCION_ID_FISCAL_VENTA = 'VENTA', // TIPO DE TRANSACCION PARA IDENTIFICACION FISCAL
  TIPO_TRANSACCION_ID_FISCAL_COMPRA = 'COMPRA', // TIPO DE TRANSACCION PARA IDENTIFICACION FISCAL
}
