import React, { useState } from 'react';

// 🛑 Datos de ejemplo (Simulan datos traídos del backend)
const mockRequests = [
    {
        id: 101,
        empleado: 'Laura G.',
        tipo: 'Vacaciones',
        detalle: '01/10/2025 al 05/10/2025',
        estado: 'Pendiente', // <--- Pendiente de acción
        motivo: 'Viaje familiar urgente a la costa. Se adjunta plan de trabajo para cubrimiento de tareas.', 
        comentarioManager: null, 
    },
    {
        id: 102,
        empleado: 'Jorge A.',
        tipo: 'Incapacidad',
        detalle: '15/11/2025 al 20/11/2025',
        estado: 'Rechazado', // <--- Ya fue procesada
        motivo: 'Cirugía menor programada para rodilla izquierda. Certificado adjunto en sistema.',
        comentarioManager: 'Rechazado. Necesitamos el Certificado Médico en formato PDF antes de procesar esta solicitud.', // 🛑 ¡Comentario del Manager visible para RRHH!
    },
    {
        id: 103,
        empleado: 'Carlos M.',
        tipo: 'Préstamo',
        detalle: 'Monto: $500',
        estado: 'Aprobado', // <--- Ya fue procesada
        motivo: 'Compra de computador personal para teletrabajo.',
        comentarioManager: 'Aprobado conforme a política interna. Notificar a nómina.', // 🛑 ¡Comentario del Manager visible para RRHH!
    },
];

const BandejaAprobacion = () => {
    const [requests, setRequests] = useState(mockRequests);
    const [showModal, setShowModal] = useState(false);
    const [currentDetail, setCurrentDetail] = useState(null);
    const [managerComment, setManagerComment] = useState(''); 

    // Función para manejar el clic en el botón de Detalle
    const handleViewDetails = (requestId) => {
        const request = requests.find(req => req.id === requestId);
        setCurrentDetail(request);
        // Al abrir, cargamos el comentario si ya existe
        setManagerComment(request.comentarioManager || ''); 
        setShowModal(true); 
    };
    
    // FUNCIÓN DE ACTUALIZACIÓN DE ESTADO REAL (con comentario)
    const handleAction = (newStatus) => {
        if (!managerComment.trim()) {
            alert("Debe ingresar un comentario o justificación antes de aprobar/rechazar.");
            return;
        }

        const requestId = currentDetail.id;
        
        // 1. Actualiza el estado de la solicitud y guarda el comentario
        setRequests(prevRequests => 
            prevRequests.map(req => 
                req.id === requestId 
                    ? { ...req, estado: newStatus, comentarioManager: managerComment } 
                    : req
            )
        );

        // 2. Notificación a RRHH/Backend para el siguiente paso
        console.log(`Solicitud ${requestId} marcada como: ${newStatus} por el Manager.`);
        
        // Cierra y limpia el modal
        setShowModal(false); 
        setManagerComment('');
        setCurrentDetail(null);
    };

    // Función que renderiza la columna Acción
    const renderActions = (request) => {
        const statusColor = request.estado === 'Aprobado' || request.estado === 'Generado' ? 'green' : request.estado === 'Rechazado' ? 'red' : 'orange';

        // Si NO está Pendiente, solo muestra el estado y el botón Detalle/Acción
        if (request.estado !== 'Pendiente') {
            return (
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ color: statusColor, fontWeight: 'bold' }}>{request.estado}</span>
                    <button 
                        onClick={() => handleViewDetails(request.id)}
                        style={{ padding: '5px 8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        title="Ver Detalle y Comentario del Manager"
                    >
                        👁️ Ver
                    </button>
                </div>
            );
        }

        // Si está Pendiente, solo muestra el botón Detalle para forzar el flujo de aprobación
        return (
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                <button 
                    onClick={() => handleViewDetails(request.id)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#3498db', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                    title="Ver Detalle y tomar acción"
                >
                    👁️ Detalle / Acción
                </button>
            </div>
        );
    };

    // Estilos (sin cambios)
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: 'white'
    };
    const thStyle = {
        border: '1px solid #ddd',
        padding: '12px',
        backgroundColor: '#f2f2f2',
        textAlign: 'left',
        color: 'black'
    };
    const tdStyle = {
        border: '1px solid #ddd',
        padding: '12px',
        textAlign: 'left',
        color: 'black'
    };

    return (
        <div style={{ padding: 20, color: 'black' }}>
            <h2 style={{ color: '#007bff' }}>📋 Bandeja de Aprobación</h2>
            <p>Revisa y gestiona las solicitudes pendientes que requieren tu aprobación como Manager.</p>

            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Empleado</th>
                        <th style={thStyle}>Tipo</th>
                        <th style={thStyle}>Detalle</th>
                        <th style={thStyle}>Estado</th>
                        <th style={{...thStyle, textAlign: 'center'}}>Acción</th> 
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request) => (
                        <tr key={request.id}>
                            <td style={tdStyle}>{request.id}</td>
                            <td style={tdStyle}>{request.empleado}</td>
                            <td style={tdStyle}>{request.tipo}</td>
                            <td style={tdStyle}>{request.detalle}</td>
                            <td style={{...tdStyle, color: request.estado === 'Pendiente' ? 'orange' : 'green', fontWeight: 'bold'}}>
                                {request.estado}
                            </td>
                            <td style={tdStyle}>
                                {renderActions(request)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 🛑 Modal para mostrar detalles y acción (Visita de RRHH/Manager) */}
            {showModal && currentDetail && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'rgba(0,0,0,0.5)', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    zIndex: 1000 
                }}>
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '30px', 
                        borderRadius: '8px', 
                        width: '500px', 
                        maxHeight: '90%', 
                        overflowY: 'auto',
                        color: 'black'
                    }}>
                        <h3>Detalle de Solicitud #{currentDetail.id}</h3>
                        <p><strong>Empleado:</strong> {currentDetail.empleado}</p>
                        <p><strong>Tipo:</strong> {currentDetail.tipo}</p>
                        <p><strong>Detalle:</strong> {currentDetail.detalle}</p>
                        <hr/>
                        
                        {/* Motivo del Empleado */}
                        <p><strong>Motivo del Empleado/Comentarios:</strong></p>
                        <p style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', borderLeft: '3px solid #3498db', color: 'black' }}>
                            {currentDetail.motivo}
                        </p>
                        <hr/>

                        {/* 🛑 SECCIÓN CLAVE PARA RRHH: Muestra el estado y el comentario final */}
                        {currentDetail.estado !== 'Pendiente' ? (
                            <div>
                                <h4>Estatus Final: <span style={{color: currentDetail.estado === 'Aprobado' ? 'green' : 'red'}}>{currentDetail.estado}</span></h4>
                                
                                <div style={{ 
                                    padding: '10px', 
                                    backgroundColor: '#fff3cd', 
                                    border: '1px solid #ffeeba',
                                    borderRadius: '4px' 
                                }}>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>Comentario del Manager (Auditoría RRHH):</p>
                                    <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>
                                        "{currentDetail.comentarioManager || 'El manager no dejó un comentario específico.'}"
                                    </p>
                                </div>
                                <small style={{marginTop: '10px', display: 'block'}}>
                                    *El equipo de RRHH puede proceder con la acción final según el tipo de solicitud.
                                </small>
                            </div>
                        ) : (
                            // Si está Pendiente, muestra el campo de acción para el Manager
                            <>
                                <h4>Comentario del Manager (Obligatorio)</h4>
                                <textarea
                                    value={managerComment}
                                    onChange={(e) => setManagerComment(e.target.value)}
                                    placeholder="Ingrese la justificación de la aprobación o rechazo."
                                    rows="4"
                                    style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', resize: 'vertical' }}
                                />

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                                    {/* Botón Aprobar */}
                                    <button 
                                        onClick={() => handleAction('Aprobado')} 
                                        style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        ✅ Aprobar
                                    </button>

                                    {/* Botón Rechazar */}
                                    <button 
                                        onClick={() => handleAction('Rechazado')} 
                                        style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        ❌ Rechazar
                                    </button>
                                </div>
                            </>
                        )}
                        
                        <button 
                            onClick={() => setShowModal(false)} 
                            style={{ 
                                marginTop: '30px', 
                                padding: '10px 20px', 
                                backgroundColor: '#95a5a6', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Cerrar Vista
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BandejaAprobacion;