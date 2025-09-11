function getServiceUrls() {
  if (import.meta.env.PROD) {
    return {
      adquisicionServiceUrl: import.meta.env.VITE_ADQUISICION_SERVICE_URL,
      inventarioServiceUrl: import.meta.env.VITE_INVENTARIO_SERVICE_URL,
      contabilidadServiceUrl: import.meta.env.VITE_CONTABILIDAD_SERVICE_URL,
      tbaServiceUrl: import.meta.env.VITE_TBA_SERVICE_URL,
      reportesServiceUrl: import.meta.env.VITE_REPORTES_SERVICE_URL,
      ventasServiceUrl: import.meta.env.VITE_VENTAS_SERVICE_URL,
    };
  }
  return {
    adquisicionServiceUrl: 'http://localhost:8081', //NO CAMBIAR
    inventarioServiceUrl: 'http://localhost:8083', //NO CAMBIAR
    contabilidadServiceUrl: 'http://localhost:8084', //NO CAMBIAR
    tbaServiceUrl: 'http://localhost:8087', //NO CAMBIAR
    reportesServiceUrl: 'http://localhost:8089', //NO CAMBIAR
    ventasServiceUrl: 'http://localhost:8085', //NO CAMBIAR
  };
}

export default getServiceUrls;
