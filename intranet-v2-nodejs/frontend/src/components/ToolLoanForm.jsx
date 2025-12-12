// frontend/src/components/ToolLoanForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// URL base de la API
const API_BASE = 'http://192.168.0.14:8000/api';

// --- LÓGICA DEL TÉCNICO LOGUEADO ---

// Email del técnico logueado
const TECHNICIAN_EMAIL =
  localStorage.getItem('userEmail') || 'tecnico@optimacom.com';

// ✅ CORRECCIÓN: Obtener el nombre de usuario para mostrarlo en lugar del correo
let TECHNICIAN_NAME_LOGGED = 'Técnico'; // Valor por defecto
try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        // Asumiendo que el objeto guardado en 'user' tiene una propiedad 'username'
        const { username } = JSON.parse(storedUser);
        if (username) {
            TECHNICIAN_NAME_LOGGED = username;
        }
    }
} catch (e) {
    console.error("Error al parsear user de localStorage:", e);
}
// ------------------------------------


const ToolLoanForm = () => {
  const location = useLocation();
  const fileInputRef = useRef(null); // Ref para el input de archivo/cámara

  // 1. Leer toolId desde la URL del QR (?toolId=...)
  const searchParams = new URLSearchParams(location.search);
  // Usar 'MARTILLO-001' como valor por defecto para la vista previa/prueba
  const qrToolId = searchParams.get('toolId') || 'MARTILLO-001';

  // ESTADOS DEL FORMULARIO
  const [toolId, setToolId] = useState(qrToolId);
  const [action, setAction] = useState('Préstamo'); // Préstamo o Devolución
  const [condition, setCondition] = useState('Buen estado');
  const [datetime, setDatetime] = useState(''); // fecha y hora
  // ✅ CORRECCIÓN: Inicializar el nombre con el nombre logueado
  const [technicianName, setTechnicianName] = useState(TECHNICIAN_NAME_LOGGED); 
  const [photoFile, setPhotoFile] = useState(null); // archivo de foto
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 🛑 ESTILOS AJUSTADOS (Mantenidos sin cambios)
  const wrapperStyle = {
    padding: '10px',
    backgroundColor: 'black',
    color: 'white',
    minHeight: '100vh',
    width: '100%',
  };

  const containerStyle = {
    // Ancho ajustado a 700px para campos más grandes
    maxWidth: '700px', 
    margin: '0 auto', 
    padding: '20px',
    backgroundColor: '#1c1c1c', 
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#ccc', 
    fontSize: '1.1em', 
  };

  const inputBaseStyle = {
    width: '100%', 
    padding: '12px',
    border: '1px solid #444',
    borderRadius: '5px',
    marginBottom: '20px',
    backgroundColor: '#343a40',
    color: 'white',
    fontSize: '1em', 
    // CORRECCIÓN: box-sizing asegura que padding/border no alteren el ancho del 100%
    boxSizing: 'border-box', 
  };

  const buttonBaseStyle = {
    padding: '12px 20px',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    width: '100%',
    boxSizing: 'border-box', // Aplicado también a botones para consistencia
  };

  const simulateButtonStyle = {
    ...buttonBaseStyle,
    width: 'auto', 
    backgroundColor: '#4a4a4a',
    color: 'white',
    border: '1px solid #666',
  };

  const registerButtonStyle = {
    ...buttonBaseStyle,
    padding: '15px',
    backgroundColor: '#28a745',
    color: 'white',
    fontSize: '1.1em',
  };

  const photoButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#007bff',
    color: 'white',
    marginBottom: '10px',
  };

  // 2. Prefill fecha/hora (Mantenido sin cambios)
  useEffect(() => {
    const now = new Date();
    const pad = (n) => (n < 10 ? '0' + n : n);
    const formatted =
      now.getFullYear() +
      '-' +
      pad(now.getMonth() + 1) +
      '-' +
      pad(now.getDate()) +
      'T' +
      pad(now.getHours()) +
      ':' +
      pad(now.getMinutes());
    setDatetime(formatted);

    // La inicialización de technicianName ya se hace con el useState inicial
    // usando TECHNICIAN_NAME_LOGGED.
  }, []);

  // ENVÍO AL BACKEND
  const handleRegisterAction = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!toolId || !TECHNICIAN_EMAIL || !action) {
      setIsError(true);
      setMessage(
        'Error: Faltan datos esenciales (ID de herramienta, Técnico o Acción).'
      );
      return;
    }
    
    // ✅ CORRECCIÓN FOTO (Temporal para verla en el historial):
    let finalPhotoUrl = 'N/A';
    if (photoFile) {
        // Esto simula la subida y permite que la imagen se vea en el Frontend.
        // Debe ser reemplazado por una subida real a S3, Cloudinary, etc., en producción.
        finalPhotoUrl = 'https://picsum.photos/id/237/500/300'; 
    }


    const dataToSend = {
      toolId: toolId,
      technicianEmail: TECHNICIAN_EMAIL,
      technicianName: technicianName, // <-- Nombre completo
      action: action,
      condition: condition,
      datetime: datetime,
      photoUrl: finalPhotoUrl, // ✅ Usamos la URL simulada
    };

    try {
      const response = await fetch(`${API_BASE}/tools/register-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsError(true);
        setMessage(result.error || `Error ${response.status}: Error al registrar.`);
        return;
      }

      setIsError(false);
      // ✅ CORRECCIÓN: Mostrar el nombre en el mensaje de éxito
      setMessage(`✅ Acción '${action}' registrada para ${toolId} por ${technicianName}.`);
    } catch (error) {
      setIsError(true);
      setMessage(
        'Error de red: No se pudo conectar con el servidor. Verifique que el Backend esté corriendo.'
      );
      console.error('Fetch error:', error);
    }
  };

  // Simulación de escaneo (Mantenido sin cambios)
  const simulateScan = () => {
    const simulatedIds = ['TALADRO-777', 'MULTIMETRO-888', 'ANDAMIO-999'];
    const randomId =
      simulatedIds[Math.floor(Math.random() * simulatedIds.length)];
    setToolId(randomId);
  };

  // Click handler para simular la selección del input de archivo oculto
  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
          🛠️ Registro Rápido de Herramientas
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#ccc' }}>
          Escanea el código QR para registrar la acción de préstamo o devolución.
        </p>

        {/* Botón de Simulación */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button onClick={simulateScan} style={simulateButtonStyle}>
            Simular Escaneo QR
          </button>
        </div>

        <form onSubmit={handleRegisterAction}>
          {/* Serial de herramienta */}
          <label style={labelStyle}>Serial / ID de Herramienta:</label>
          <input
            type="text"
            value={toolId}
            onChange={(e) => setToolId(e.target.value.toUpperCase())}
            style={inputBaseStyle}
            required
            readOnly 
          />

          {/* Fecha y hora del movimiento */}
          <label style={labelStyle}>Fecha y Hora del Registro:</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            style={inputBaseStyle}
            required
          />

          {/* Nombres y Apellidos del Técnico */}
          <label style={labelStyle}>Nombres y Apellidos del Técnico:</label>
          <input
            type="text"
            value={technicianName}
            onChange={(e) => setTechnicianName(e.target.value)}
            style={inputBaseStyle}
            placeholder="Nombre completo del técnico"
            required
          />

          {/* Acción */}
          <label style={labelStyle}>Acción a Registrar:</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            style={inputBaseStyle}
          >
            <option value="Préstamo">Prestar Herramienta</option>
            <option value="Devolución">Devolver Herramienta</option>
          </select>

          {/* Estado de la herramienta */}
          <label style={labelStyle}>Estado de la Herramienta:</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            style={inputBaseStyle}
          >
            <option value="Buen estado">Buen estado</option>
            <option value="Daño menor">Daño menor</option>
            <option value="Dañada">Dañada</option>
          </select>

          {/* 📸 Foto de la herramienta (Botón de cámara/archivo customizado) */}
          <label style={labelStyle}>Fotografía de la Herramienta (opcional):</label>
          <button
            type="button" 
            onClick={handlePhotoClick}
            style={photoButtonStyle}
          >
            {photoFile ? '✅ Foto Lista (Cambiar)' : '📸 Tomar Foto / Seleccionar Archivo'}
          </button>

          <input
            type="file"
            ref={fileInputRef} 
            accept="image/*"
            capture="environment" 
            onChange={(e) => setPhotoFile(e.target.files[0] || null)}
            style={{ display: 'none' }} 
          />

          {/* Nombre del archivo seleccionado (feedback visual) */}
          {photoFile && (
            <p
              style={{
                fontSize: '14px',
                color: '#2ecc71',
                marginTop: '-10px',
                marginBottom: '20px',
                textAlign: 'center',
                overflowWrap: 'break-word' 
              }}
            >
              Archivo seleccionado: **{photoFile.name}**
            </p>
          )}

          <button type="submit" style={registerButtonStyle}>
            Registrar Acción
          </button>
        </form>

        {/* Mensaje de estado */}
        {message && (
          <p
            style={{
              color: isError ? '#e74c3c' : '#2ecc71',
              marginTop: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {message}
          </p>
        )}
      </div>
      <p
        style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.9em',
          color: '#777', 
        }}
      >
        {/* ✅ CORRECCIÓN FINAL: Mostrar SÓLO el nombre logueado */}
        Técnico logueado: **{TECHNICIAN_NAME_LOGGED}**
      </p>
    </div>
  );
};

export default ToolLoanForm;