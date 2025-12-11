import React from 'react';

const RRHHReports = () => {
    // Datos simulados para RRHH
    const incapacidadData = [
        { id: 201, employee: 'Laura G.', start: '2025-10-01', end: '2025-10-05', reason: 'Gripa', status: 'Registrada' },
        { id: 202, employee: 'Jorge A.', start: '2025-11-15', end: '2025-11-20', reason: 'Cirugía', status: 'En trámite' },
    ];

    const certificadosData = [
        { id: 301, employee: 'Carlos M.', type: 'Laboral', requested: '2025-12-01', status: 'Generado' },
        { id: 302, employee: 'Laura G.', type: 'Ingresos', requested: '2025-11-28', status: 'Pendiente' },
    ];

    const listStyle = { 
        listStyleType: 'none', 
        padding: 0 
    };
    
    const itemStyle = {
        padding: '10px', 
        borderBottom: '1px solid #eee',
        color: 'black' // 🛑 MODIFICACIÓN CLAVE: Asegura que el texto de cada elemento de la lista sea negro
    };


    return (
        <div style={{ padding: 20, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
            <h2>📊 Gestión de Reportes y RRHH</h2>
            <p>Acceso a la información de personal, incapacidades y generación de documentos.</p>

            {/* Sección de Incapacidades */}
            <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px', color: 'black' }}>Registro de Incapacidades</h3> {/* Color de encabezado a negro */}
                <ul style={listStyle}>
                    {incapacidadData.map(incap => (
                        <li key={incap.id} style={itemStyle}>
                            <strong>{incap.employee}:</strong> {incap.start} al {incap.end} ({incap.reason}). Estado: <span style={{ color: incap.status === 'Registrada' ? 'green' : 'orange' }}>{incap.status}</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* Sección de Certificados */}
            <div style={{ marginTop: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ borderBottom: '2px solid #28a745', paddingBottom: '10px', color: 'black' }}>Solicitudes de Certificados</h3> {/* Color de encabezado a negro */}
                <ul style={listStyle}>
                    {certificadosData.map(cert => (
                        <li key={cert.id} style={itemStyle}>
                            <strong>{cert.employee}:</strong> Certificado {cert.type}. Estado: <span style={{ color: cert.status === 'Generado' ? 'green' : 'orange' }}>{cert.status}</span> 
                            {cert.status === 'Generado' && (
                                <button style={{ marginLeft: '15px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                                    Descargar
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            
        </div>
    );
};

export default RRHHReports;