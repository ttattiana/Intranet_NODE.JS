import React, { useState } from 'react';

const PortalSolicitudes = ({ user }) => {
  const [tabActiva, setTabActiva] = useState('Vacaciones');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estado para todos los formularios
  const [formData, setFormData] = useState({
    motivo: '',
    fechaInicio: '',
    fechaFin: '',
    tipoCertificado: '',
    rangoNomina: '',
    montoPrestamo: '',
    formaPago: 'Cuota mensual nómina',
    archivo: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    setMensaje({ texto: 'Enviando...', tipo: 'info' });

    let url = '';
    let bodyData;
    let isMultipart = false;

    // Configuración según la pestaña activa basada en tu Excel
    switch (tabActiva) {
      case 'Vacaciones':
        url = '/api/solicitudes/vacaciones';
        bodyData = JSON.stringify({
          id_solicitante: user.id,
          motivo: formData.motivo,
          fecha_propuesta: `${formData.fechaInicio} al ${formData.fechaFin}`
        });
        break;
      case 'Préstamos':
        url = '/api/solicitudes/prestamos';
        bodyData = JSON.stringify({
          id_solicitante: user.id,
          motivo: formData.motivo,
          monto: formData.montoPrestamo,
          forma_devolucion: formData.formaPago
        });
        break;
      case 'Incapacidades':
        url = '/api/solicitudes/incapacidades';
        isMultipart = true;
        const data = new FormData();
        data.append('id_solicitante', user.id);
        data.append('motivo', formData.motivo);
        data.append('fecha_inicio', formData.fechaInicio);
        data.append('fecha_fin', formData.fechaFin);
        data.append('archivo', formData.archivo);
        bodyData = data;
        break;
      default:
        return;
    }

    try {
      const response = await fetch(`http://localhost:8000${url}`, {
        method: 'POST',
        headers: isMultipart ? {} : { 'Content-Type': 'application/json' },
        body: bodyData,
      });

      if (response.ok) {
        setMensaje({ texto: `¡Solicitud de ${tabActiva} enviada con éxito!`, tipo: 'success' });
        setFormData({ motivo: '', fechaInicio: '', fechaFin: '', montoPrestamo: '', archivo: null });
      } else {
        throw new Error('Error al enviar');
      }
    } catch (error) {
      setMensaje({ texto: 'Hubo un error al procesar la solicitud.', tipo: 'error' });
    }
  };

  // Estilos rápidos para coincidir con tu imagen
  const inputStyle = {
    backgroundColor: '#333',
    color: 'white',
    border: '1px solid #444',
    padding: '10px',
    borderRadius: '4px',
    width: '100%',
    marginBottom: '15px'
  };

  const tabStyle = (nombre) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    backgroundColor: tabActiva === nombre ? '#007bff' : 'white',
    color: tabActiva === nombre ? 'white' : 'black',
    borderRadius: '4px 4px 0 0',
    marginRight: '5px'
  });

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#007bff' }}>Portal de Solicitudes</h2>

      {/* Pestañas (Tabs) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        {['Vacaciones', 'Certificados', 'Nómina', 'Préstamos', 'Incapacidades'].map((tab) => (
          <div key={tab} style={tabStyle(tab)} onClick={() => setTabActiva(tab)}>
            {tab}
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
        <h3>Formulario de {tabActiva}</h3>
        {mensaje.texto && (
          <div style={{ padding: '10px', marginBottom: '10px', borderRadius: '4px', backgroundColor: mensaje.tipo === 'success' ? '#d4edda' : '#f8d7da' }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={enviarSolicitud}>
          {/* Campos dinámicos según la pestaña */}
          {(tabActiva === 'Vacaciones' || tabActiva === 'Incapacidades') && (
            <>
              <label>Fecha de Inicio:</label>
              <input type="date" name="fechaInicio" style={inputStyle} value={formData.fechaInicio} onChange={handleChange} required />
              <label>Fecha de Fin:</label>
              <input type="date" name="fechaFin" style={inputStyle} value={formData.fechaFin} onChange={handleChange} required />
            </>
          )}

          {tabActiva === 'Préstamos' && (
            <>
              <label>Monto a Solicitar:</label>
              <input type="number" name="montoPrestamo" placeholder="$ 0.00" style={inputStyle} value={formData.montoPrestamo} onChange={handleChange} required />
              <label>Forma de Devolución:</label>
              <select name="formaPago" style={inputStyle} onChange={handleChange}>
                <option>Cuota mensual nómina</option>
                <option>Pago único</option>
                <option>Descuento directo</option>
              </select>
            </>
          )}

          {tabActiva === 'Certificados' && (
            <>
              <label>Tipo de Certificado:</label>
              <select name="tipoCertificado" style={inputStyle} onChange={handleChange}>
                <option>Laboral con Sueldo</option>
                <option>Laboral sin Sueldo</option>
                <option>Para Embajada</option>
              </select>
            </>
          )}

          <label>Motivo/Comentarios:</label>
          <textarea 
            name="motivo" 
            placeholder="Describa el motivo de su solicitud..." 
            style={{ ...inputStyle, height: '100px' }} 
            value={formData.motivo} 
            onChange={handleChange} 
            required
          />

          {tabActiva === 'Incapacidades' && (
            <>
              <label>Comprobante (Archivo):</label>
              <input type="file" name="archivo" style={inputStyle} onChange={handleChange} required />
            </>
          )}

          <button type="submit" style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            width: '100%',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Solicitar {tabActiva}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PortalSolicitudes;





