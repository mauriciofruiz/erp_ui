
const PowerBIReport = () => {
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};
    return (
        <div style={containerStyle}>
            <iframe 
            title="Reporte_Facturacion_pruebas" 
            width="1140" 
            height="541.25" 
            src="https://app.powerbi.com/reportEmbed?reportId=8380ff7d-fe4f-4660-a342-c4563b213ff7&autoAuth=true&ctid=5106204a-8f42-456e-ac25-eea5af0eed83" 
            allowFullScreen>
            </iframe>
        </div>
    );
};

export default PowerBIReport;
