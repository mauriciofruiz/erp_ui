export enum ComprobanteTypeEnum {
  FACTURA = '01',
  NOTA_O_BOLETA_DE_VENTA = '02',
  LIQUIDACION = '03',
  NOTA_DE_CREDITO = '04',
  NOTA_DE_DEBITO = '05',
  GUIAS_DE_REMISION = '06',
  COMPROBANTE_DE_RETENCION = '07',
}

export enum ComprobanteEstadoEnum {
  GENERADO = 1,
  CONFIRMADO = 2,
  AUTORIZADO = 3,
  ENVIADO = 4,
  RECHAZADO = 5,
  ANULADO = 6,
}
