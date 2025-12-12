import React, { useState } from 'react';

// 🛑 Datos de ejemplo para simular las solicitudes que ha hecho el empleado
const mockEmployeeRequests = [
  { 
    id: 101, 
    tipo: 'Vacaciones', 
    detalle: '01/10/2025 al 05/10/2025', 
    estado: 'Aprobado', 
    motivoEmpleado: 'Viaje familiar urgente a la costa.', 
    comentarioManager: 'Aprobado. Asegúrate de coordinar la entrega del proyecto Z antes de tu salida.', 
    tipoDocumento: null 
  },
  { 
    id: 102, 
    tipo: 'Incapacidad', 
    detalle: '15/11/2025 al 20/11/2025', 
    estado: 'Rechazado', 
    motivoEmpleado: 'Cirugía menor programada para rodilla izquierda.', 
    comentarioManager: 'Rechazado. Necesitamos el Certificado Médico en formato PDF antes de procesar esta solicitud.', 
    tipoDocumento: null 
  },
  { 
    id: 103, 
    tipo: 'Certificado', 
    detalle: 'Certificado Laboral', 
    estado: 'Generado', 
    motivoEmpleado: 'Para trámite de crédito hipotecario en Banco XYZ.', 
    comentarioManager: 'Aprobado y generado. Documento listo en el sistema.',
    tipoDocumento: 'Laboral' 
  },
  { 
    id: 104, 
    tipo: 'Préstamo', 
    detalle: 'Monto: $500', 
    estado: 'Pendiente', 
    motivoEmpleado: 'Compra de nuevo equipo de trabajo.', 
    comentarioManager: null,
    tipoDocumento: null 
  },
];

const SolicitudesPortal = () => {
  const [activeTab, setActiveTab] = useState('Vacaciones');
  const [requests, setRequests] = useState(mockEmployeeRequests);
  const [loanAmount, setLoanAmount] = useState(''); // monto de préstamo solo dígitos

  // Función de simulación de descarga
  const handleDownload = (request) => {
    console.log(`Iniciando descarga de ${request.detalle} - ID ${request.id}`);
    alert(`Descargando: ${request.detalle}.`);
  };

  // Función para renderizar el contenido de las pestañas
  const renderContent = () => {
    // 🛑 Estilos base de inputs
    const baseInputStyle = { 
      width: '100%',
      padding: '15px',
      margin: '10px 0',
      borderRadius: '4px',
      border: '1px solid #ccc',
      boxSizing: 'border-box',
      backgroundColor: '#333333',
      color: '#ffffff',
    };

    const buttonStyle = (color) => ({ 
      width: '100%', 
      padding: '10px', 
      backgroundColor: color, 
      color: 'white', 
      border: 'none', 
      borderRadius: '4px', 
      cursor: 'pointer' 
    });

    switch (activeTab) {
      case 'Vacaciones':
        return (
          <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}>
            <h3 style={{ color: '#007bff' }}>Formulario de Vacaciones</h3>
            <p>Ingrese las fechas de su solicitud.</p>

            <label style={{ display: 'block', margin: '5px 0' }}>Fecha de Inicio:</label>
            <input type="date" style={baseInputStyle} />

            <label style={{ display: 'block', margin: '5px 0' }}>Fecha de Fin:</label>
            <input type="date" style={baseInputStyle} />

            <label style={{ display: 'block', margin: '5px 0' }}>Motivo/Comentarios:</label>
            <textarea
              placeholder="Motivo/Comentarios"
              rows="4"
              style={{ ...baseInputStyle, resize: 'vertical' }}
            />

            <button style={buttonStyle('#28a745')}>Solicitar Vacaciones</button>
          </div>
        );
      case 'Certificados':
        return (
          <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}>
            <h3 style={{ color: '#007bff' }}>Solicitud de Certificado Laboral</h3>
            <p>Seleccione el tipo de certificado que necesita.</p>

            <select style={baseInputStyle}>
              <option>Seleccione tipo de certificado</option>
              <option>Certificado Laboral</option>
              <option>Certificado de Ingresos</option>
            </select>

            <input
              type="text"
              placeholder="Destino del certificado (ej: Banco)"
              style={baseInputStyle}
            />

            <button style={buttonStyle('#007bff')}>Solicitar Certificado</button>
          </div>
        );
      case 'Nómina':
        return (
          <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}>
            <h3 style={{ color: '#007bff' }}>Solicitud de Desprendibles de Nómina</h3>
            <p>Seleccione el mes o rango que requiere.</p>
            <input
              type="text"
              placeholder="Mes/Rango de Nómina (Ej: Enero 2025)"
              style={baseInputStyle}
            />
            <input
              type="text"
              placeholder="Motivo de la solicitud"
              style={baseInputStyle}
            />
            <button style={buttonStyle('#007bff')}>Solicitar Desprendibles</button>
          </div>
        );
      case 'Préstamos':
        return (
          <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}>
            <h3 style={{ color: '#007bff' }}>Solicitud de Préstamo</h3>
            <p>Monto solicitado (sujeto a cupo).</p>

            {/* Campo solo numérico en pesos */}
            <input
              type="text"
              inputMode="numeric"
              placeholder="Monto en pesos"
              value={loanAmount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, ''); // solo dígitos
                setLoanAmount(raw);
              }}
              style={baseInputStyle}
            />
            <p style={{ marginTop: '5px', fontSize: '14px', color: '#555' }}>
              Monto en pesos: {loanAmount ? `$ ${Number(loanAmount).toLocaleString('es-CO')}` : '$ 0'}
            </p>

            <textarea
              placeholder="Motivo/Uso de fondos"
              rows="4"
              style={{ ...baseInputStyle, resize: 'vertical' }}
            />
            <button style={buttonStyle('#dc3545')}>Solicitar Préstamo</button>
          </div>
        );
      case 'Incapacidades':
  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}>
      <h3 style={{ color: '#007bff' }}>Registro de Incapacidades</h3>
      <p>Adjunte el certificado médico y detalles.</p>

      <label style={{ display: 'block', margin: '5px 0' }}>Fecha de Inicio:</label>
      <input type="date" style={baseInputStyle} />

      <label style={{ display: 'block', margin: '5px 0' }}>Fecha de Fin:</label>
      <input type="date" style={baseInputStyle} />

      <label style={{ display: 'block', margin: '5px 0' }}>Adjuntar Certificado (PDF):</label>
      <input type="file" style={baseInputStyle} />

      <button style={buttonStyle('#ffc107', 'black')}>Registrar Incapacidad</button>
    </div>
  );
      default:
        return null;
    }
  };

  // Estilos para las pestañas
  const tabButtonStyle = (tabName) => ({
    padding: '10px 15px',
    border: 'none',
    backgroundColor: activeTab === tabName ? '#007bff' : '#f0f0f0',
    color: activeTab === tabName ? 'white' : 'black',
    cursor: 'pointer',
    fontWeight: activeTab === tabName ? 'bold' : 'normal',
    marginRight: '5px',
    borderRadius: '4px 4px 0 0',
  });

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', color: 'black' }}>
      <h2 style={{ color: '#007bff', marginBottom: '20px' }}>Portal de Solicitudes</h2>

      {/* Contenedor de Pestañas */}
      <div style={{ marginBottom: '1px' }}>
        {['Vacaciones', 'Certificados', 'Nómina', 'Préstamos', 'Incapacidades'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={tabButtonStyle(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Contenido de Pestaña Activa */}
      <div
        style={{
          border: '1px solid #ccc',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '0 4px 4px 4px',
        }}
      >
        {renderContent()}
      </div>

      <hr style={{ margin: '40px 0' }} />

      {/* Historial y seguimiento */}
      <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>
        Historial y Seguimiento de Solicitudes
      </h3>

      {requests.map((req) => (
        <div
          key={req.id}
          style={{
            border: '1px solid #ddd',
            padding: '15px',
            marginBottom: '15px',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h4>
              {req.tipo} - {req.detalle}
            </h4>
            <span
              style={{
                padding: '5px 10px',
                borderRadius: '4px',
                fontWeight: 'bold',
                color:
                  req.estado === 'Aprobado' || req.estado === 'Generado'
                    ? 'white'
                    : req.estado === 'Pendiente'
                    ? 'orange'
                    : 'white',
                backgroundColor:
                  req.estado === 'Aprobado' || req.estado === 'Generado'
                    ? '#28a745'
                    : req.estado === 'Pendiente'
                    ? '#f8f9fa'
                    : '#dc3545',
                border: req.estado === 'Pendiente' ? '1px solid orange' : 'none',
              }}
            >
              {req.estado}
            </span>
          </div>

          <p>
            <small>
              Motivo ingresado: *{req.motivoEmpleado.substring(0, 50)}...*
            </small>
          </p>

          {req.estado !== 'Pendiente' && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor:
                  req.estado === 'Aprobado' || req.estado === 'Generado'
                    ? '#e6ffe6'
                    : '#ffe6e6',
                borderLeft: `5px solid ${
                  req.estado === 'Aprobado' || req.estado === 'Generado'
                    ? '#28a745'
                    : '#dc3545'
                }`,
                borderRadius: '4px',
              }}
            >
              <p style={{ margin: 0 }}>
                <strong>Respuesta del Manager:</strong>
              </p>
              <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>
                "
                {req.comentarioManager ||
                  'El manager no dejó un comentario específico.'}
                "
              </p>
            </div>
          )}

          {req.tipo === 'Certificado' && req.estado === 'Generado' && (
            <button
              onClick={() => handleDownload(req)}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Descargar Certificado {req.tipoDocumento}
            </button>
          )}
        </div>
      ))}
      {requests.length === 0 && <p>No tienes solicitudes registradas aún.</p>}
    </div>
  );
};

export default SolicitudesPortal;
