// frontend/src/components/QRGenerator.jsx
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const LOGO_URL = '/logo.jpg';

const QRGenerator = () => {
  const [toolId, setToolId] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  // URL que se abrirá al escanear el QR
  const BASE_URL_FORM = 'http://localhost:5173/dashboard/tool-loan-form';

  const handleGenerateQR = () => {
    if (toolId) {
      const url = `${BASE_URL_FORM}?toolId=${toolId}`;
      setQrUrl(url);
    }
  };

  // Lógica para imprimir solo la etiqueta QR
  const handlePrint = () => {
  if (qrUrl) {
    window.print();
  } else {
    alert('¡Primero debes generar el código QR!');
  }
};

  const containerStyle = {
    maxWidth: '700px',
    margin: '20px auto',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };
  const inputStyle = {
    padding: '12px',
    width: '100%',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '6px',
  };
  const buttonStyle = {
    padding: '12px 25px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
  };
  const generateButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    marginRight: '10px',
  };

  return (
    <div style={containerStyle}>
      <h3>⚙️ Generar QR para Herramientas</h3>
      <p>
        Ingresa el ID o Serial único de la herramienta para generar el código QR que se imprimirá y
        pegará.
      </p>

      <input
        type="text"
        placeholder="ID o Serial de la Herramienta (ej: MARTILLO-001)"
        value={toolId}
        onChange={(e) => setToolId(e.target.value.toUpperCase())}
        style={inputStyle}
      />

      <button
        onClick={handleGenerateQR}
        style={generateButtonStyle}
        disabled={!toolId}
      >
        Generar Código QR
      </button>

      {qrUrl && (
        <div style={{ marginTop: '30px' }}>
          <h4>Vista Previa de la Etiqueta</h4>
          <div
  id="qr-to-print"
  style={{
    textAlign: 'center',
    padding: '20px',
    border: '3px dashed #343a40',
    display: 'inline-block',
    width: '320px',          // fuerza ancho fijo tipo etiqueta
  }}
>
  {/* Logo arriba */}
  <img
    src={LOGO_URL}
    alt="OPTIMACOM"
    style={{ width: 140, marginBottom: 8, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
  />

  {/* Texto título */}
  <div
    style={{
      fontWeight: 'bold',
      marginBottom: '10px',
      fontSize: '16px',
    }}
  >
    OPTIMACOM - TOOL QR
  </div>

  {/* QR centrado */}
  <div style={{ marginBottom: 10 }}>
    <QRCodeSVG
      value={qrUrl}
      size={220}      // un poco menor para que quepa bien
      level="H"
    />
  </div>

  {/* Serial debajo */}
  <div
    style={{
      fontWeight: 'bold',
      fontSize: '16px',
    }}
  >
    Serial: {toolId}
  </div>
</div>

          <button
            onClick={handlePrint}
            style={buttonStyle}
          >
            🖨️ Imprimir Etiqueta QR
          </button>
          <p style={{ marginTop: '15px', color: '#6c757d' }}>
            *La impresión solo incluye la caja punteada y su contenido.
          </p>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;


