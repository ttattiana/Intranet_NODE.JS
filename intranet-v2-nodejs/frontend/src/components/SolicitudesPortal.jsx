// frontend/src/components/SolicitudesPortal.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = "http://192.168.2.6:8000/api";

const SolicitudesPortal = () => {
  const [activeTab, setActiveTab] = useState('Vacaciones');
  const [requests, setRequests] = useState([]);
  const [loanAmount, setLoanAmount] = useState('');

  // NUEVO: filtros de historial
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [requestType, setRequestType] = useState('');

  // Datos del usuario logueado
  const loggedUser = JSON.parse(localStorage.getItem('intranetUser') || '{}');
  const employeeEmail = loggedUser.email || 'empleado@optimacom.com';
  const employeeName = loggedUser.username || 'Empleado Demo';
  const managerEmail = 'gerente@optimacom.com'; // cambia al real

  // =========================
  // CARGAR HISTORIAL REAL (con filtros)
  // =========================
  const fetchRequests = useCallback(async () => {
    try {
      const params = {};
      // si quieres limitar por empleado, descomenta:
      // params.employeeEmail = employeeEmail;

      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      if (requestType) {
        params.requestType = requestType; // el backend debe filtrar por type
      }

      const res = await axios.get(`${API_BASE}/requests`, { params });
      const rows = res.data?.requests || [];

      const mapped = rows.map((r) => {
        let payload = {};
        try {
          payload = JSON.parse(r.payload || '{}');
        } catch {
          payload = {};
        }

        let tipo = '';
        let detalle = '';
        let motivoEmpleado = '';
        let comentarioManager = r.manager_email || '';

        switch (r.type) {
          case 'VACACIONES':
            tipo = 'Vacaciones';
            detalle = `${payload.startDate || ''} al ${payload.endDate || ''}`;
            motivoEmpleado = payload.reason || '';
            break;
          case 'CERTIFICADO':
            tipo = 'Certificado';
            detalle = payload.certificateType || 'Certificado';
            motivoEmpleado = payload.purpose || '';
            break;
          case 'NOMINA':
            tipo = 'Nómina';
            detalle = payload.period || 'Nómina';
            motivoEmpleado = payload.reason || '';
            break;
          case 'PRESTAMO':
            tipo = 'Préstamo';
            detalle = `Monto: $${payload.amount || 0}`;
            motivoEmpleado = payload.reason || '';
            break;
          case 'INCAPACIDAD':
            tipo = 'Incapacidad';
            detalle = `${payload.startDate || ''} al ${payload.endDate || ''}`;
            motivoEmpleado = payload.diagnosis || '';
            break;
          default:
            tipo = r.type;
            detalle = '';
        }

        let estado = 'Pendiente';
        if (r.status === 'APROBADA') estado = 'Aprobado';
        if (r.status === 'RECHAZADA') estado = 'Rechazado';

        return {
          id: r.id,
          tipo,
          detalle,
          estado,
          motivoEmpleado,
          comentarioManager: payload.managerComment || comentarioManager,
          tipoDocumento: payload.certificateType || null,
        };
      });

      setRequests(mapped);
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
    }
  }, [startDate, endDate, requestType /*, employeeEmail*/]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // =========================
  // HELP GENÉRICO PARA ENVIAR
  // =========================
  const sendRequest = async ({ type, data }) => {
    try {
      const res = await axios.post(`${API_BASE}/requests`, {
        type,
        employeeEmail,
        employeeName,
        managerEmail,
        data,
      });

      alert(`✅ ${res.data?.message || 'Solicitud enviada correctamente.'}`);
      fetchRequests();
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      alert(`❌ Error al enviar la solicitud: ${err.response?.data?.error || 'Error de red'}`);
    }
  };

  // =========================
  // ESTILOS BASE
  // =========================
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

  // =========================
  // ESTADOS DE CADA FORM
  // =========================
  const [vacStart, setVacStart] = useState('');
  const [vacEnd, setVacEnd] = useState('');
  const [vacReason, setVacReason] = useState('');

  const [certType, setCertType] = useState('');
  const [certDest, setCertDest] = useState('');

  const [nominaPeriod, setNominaPeriod] = useState('');
  const [nominaReason, setNominaReason] = useState('');

  const [loanReason, setLoanReason] = useState('');

  const [incStart, setIncStart] = useState('');
  const [incEnd, setIncEnd] = useState('');
  const [incDiagnosis, setIncDiagnosis] = useState('');
  const [incPdf, setIncPdf] = useState(null);

  // =========================
  // SUBMITS
  // =========================
  const handleVacaciones = (e) => {
    e.preventDefault();
    if (!vacStart || !vacEnd) {
      alert('Por favor ingresa fecha de inicio y fin.');
      return;
    }
    sendRequest({
      type: 'VACACIONES',
      data: {
        startDate: vacStart,
        endDate: vacEnd,
        reason: vacReason,
      },
    });
  };

  const handleCertificado = (e) => {
    e.preventDefault();
    if (!certType) {
      alert('Selecciona un tipo de certificado.');
      return;
    }
    sendRequest({
      type: 'CERTIFICADO',
      data: {
        certificateType: certType,
        purpose: certDest,
      },
    });
  };

  const handleNomina = (e) => {
    e.preventDefault();
    if (!nominaPeriod) {
      alert('Indica el mes o rango de nómina.');
      return;
    }
    sendRequest({
      type: 'NOMINA',
      data: {
        period: nominaPeriod,
        reason: nominaReason,
      },
    });
  };

  const handlePrestamo = (e) => {
    e.preventDefault();
    if (!loanAmount) {
      alert('Indica el monto del préstamo.');
      return;
    }
    sendRequest({
      type: 'PRESTAMO',
      data: {
        amount: Number(loanAmount),
        reason: loanReason,
      },
    });
  };

  // NUEVO: incapacidad con PDF
  const handleIncapacidad = async (e) => {
    e.preventDefault();
    if (!incStart || !incEnd) {
      alert('Indica fechas de inicio y fin de la incapacidad.');
      return;
    }
    if (!incPdf) {
      alert('Adjunta el certificado médico en PDF.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('employeeEmail', employeeEmail);
      formData.append('employeeName', employeeName);
      formData.append('managerEmail', managerEmail);
      formData.append('startDate', incStart);
      formData.append('endDate', incEnd);
      formData.append('diagnosis', incDiagnosis);
      formData.append('certPdf', incPdf);

      const res = await axios.post(`${API_BASE}/requests/incapacity`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000,
      });

      alert(res.data?.message || 'Incapacidad registrada correctamente.');
      setIncStart('');
      setIncEnd('');
      setIncDiagnosis('');
      setIncPdf(null);
      fetchRequests();
    } catch (err) {
      console.error('Error al registrar incapacidad:', err);
      alert(`❌ Error al registrar incapacidad: ${err.response?.data?.error || 'Error de red'}`);
    }
  };

  // =========================
  // SIMULACIÓN DESCARGA CERT.
  // =========================
  const handleDownload = (request) => {
    console.log(`Iniciando descarga de ${request.detalle} - ID ${request.id}`);
    alert(`Descargando: ${request.detalle}.`);
  };

  // =========================
  // CONTENIDO PESTAÑAS
  // =========================
  const renderContent = () => {
    switch (activeTab) {
      case 'Vacaciones':
        return (
          <form
            onSubmit={handleVacaciones}
            style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}
          >
            <h3 style={{ color: '#007bff' }}>Formulario de Vacaciones</h3>
            <p>Ingrese las fechas de su solicitud.</p>

            <label style={{ display: 'block', margin: '5px 0' }}>Fecha de Inicio:</label>
            <input
              type="date"
              style={baseInputStyle}
              value={vacStart}
              onChange={(e) => setVacStart(e.target.value)}
            />

            <label style={{ display: 'block', margin: '5px 0' }}>Fecha de Fin:</label>
            <input
              type="date"
              style={baseInputStyle}
              value={vacEnd}
              onChange={(e) => setVacEnd(e.target.value)}
            />

            <label style={{ display: 'block', margin: '5px 0' }}>Motivo/Comentarios:</label>
            <textarea
              placeholder="Motivo/Comentarios"
              rows="4"
              style={{ ...baseInputStyle, resize: 'vertical' }}
              value={vacReason}
              onChange={(e) => setVacReason(e.target.value)}
            />

            <button type="submit" style={buttonStyle('#28a745')}>
              Solicitar Vacaciones
            </button>
          </form>
        );
      case 'Certificados':
        return (
          <form
            onSubmit={handleCertificado}
            style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}
          >
            <h3 style={{ color: '#007bff' }}>Solicitud de Certificado Laboral</h3>
            <p>Seleccione el tipo de certificado que necesita.</p>

            <select
              style={baseInputStyle}
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
            >
              <option value="">Seleccione tipo de certificado</option>
              <option value="Laboral">Certificado Laboral</option>
              <option value="Ingresos">Certificado de Ingresos</option>
            </select>

            <input
              type="text"
              placeholder="Destino del certificado (ej: Banco)"
              style={baseInputStyle}
              value={certDest}
              onChange={(e) => setCertDest(e.target.value)}
            />

            <button type="submit" style={buttonStyle('#007bff')}>
              Solicitar Certificado
            </button>
          </form>
        );
      case 'Nómina':
        return (
          <form
            onSubmit={handleNomina}
            style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}
          >
            <h3 style={{ color: '#007bff' }}>Solicitud de Desprendibles de Nómina</h3>
            <p>Seleccione el mes o rango que requiere.</p>
            <input
              type="text"
              placeholder="Mes/Rango de Nómina (Ej: Enero 2025)"
              style={baseInputStyle}
              value={nominaPeriod}
              onChange={(e) => setNominaPeriod(e.target.value)}
            />
            <input
              type="text"
              placeholder="Motivo de la solicitud"
              style={baseInputStyle}
              value={nominaReason}
              onChange={(e) => setNominaReason(e.target.value)}
            />
            <button type="submit" style={buttonStyle('#007bff')}>
              Solicitar Desprendibles
            </button>
          </form>
        );
      case 'Préstamos':
        return (
          <form
            onSubmit={handlePrestamo}
            style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}
          >
            <h3 style={{ color: '#007bff' }}>Solicitud de Préstamo</h3>
            <p>Monto solicitado (sujeto a cupo).</p>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Monto en pesos"
              value={loanAmount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setLoanAmount(raw);
              }}
              style={baseInputStyle}
            />
            <p style={{ marginTop: '5px', fontSize: '14px', color: '#555' }}>
              Monto en pesos:{' '}
              {loanAmount ? `$ ${Number(loanAmount).toLocaleString('es-CO')}` : '$ 0'}
            </p>

            <textarea
              placeholder="Motivo/Uso de fondos"
              rows="4"
              style={{ ...baseInputStyle, resize: 'vertical' }}
              value={loanReason}
              onChange={(e) => setLoanReason(e.target.value)}
            />
            <button type="submit" style={buttonStyle('#dc3545')}>
              Solicitar Préstamo
            </button>
          </form>
        );
      case 'Incapacidades':
        return (
          <form
            onSubmit={handleIncapacidad}
            style={{ padding: '20px', border: '1px solid #eee', borderRadius: '4px', backgroundColor: 'white' }}
          >
            <h3 style={{ color: '#007bff' }}>Registro de Incapacidades</h3>
            <p>Adjunte el certificado médico y detalles.</p>

            <label style={{ display: 'block', margin: '5px 0' }}>Fecha de Inicio:</label>
            <input
              type="date"
              style={baseInputStyle}
              value={incStart}
              onChange={(e) => setIncStart(e.target.value)}
            />

            <label style={{ display: 'block', margin: '5px 0' }}>Fecha de Fin:</label>
            <input
              type="date"
              style={baseInputStyle}
              value={incEnd}
              onChange={(e) => setIncEnd(e.target.value)}
            />

            <label style={{ display: 'block', margin: '5px 0' }}>
              Diagnóstico / Comentarios:
            </label>
            <textarea
              rows="3"
              style={{ ...baseInputStyle, resize: 'vertical' }}
              value={incDiagnosis}
              onChange={(e) => setIncDiagnosis(e.target.value)}
            />

            <label style={{ display: 'block', margin: '5px 0' }}>
              Adjuntar Certificado (PDF):
            </label>
            <input
              type="file"
              accept="application/pdf"
              style={baseInputStyle}
              onChange={(e) => setIncPdf(e.target.files[0] || null)}
            />

            <button
              type="submit"
              style={{ ...buttonStyle('#ffc107'), color: 'black' }}
            >
              Registrar Incapacidad
            </button>
          </form>
        );
      default:
        return null;
    }
  };

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
      <h2 style={{ color: '#007bff', marginBottom: '20px' }}>
        Portal de Solicitudes
      </h2>

      <div style={{ marginBottom: '1px' }}>
        {['Vacaciones', 'Certificados', 'Nómina', 'Préstamos', 'Incapacidades'].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={tabButtonStyle(tab)}
            >
              {tab}
            </button>
          )
        )}
      </div>

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

      <h3 style={{ color: '#2c3e50', marginBottom: '10px' }}>
        Historial y Seguimiento de Solicitudes
      </h3>

      {/* Filtros de historial */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '15px',
          alignItems: 'center',
        }}
      >
        <div>
          <label>Desde: </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>Hasta: </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label>Tipo: </label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="VACACIONES">Vacaciones</option>
            <option value="CERTIFICADO">Certificados</option>
            <option value="NOMINA">Nómina</option>
            <option value="PRESTAMO">Préstamo</option>
            <option value="INCAPACIDAD">Incapacidad</option>
          </select>
        </div>

        <button
          onClick={fetchRequests}
          style={{
            padding: '6px 12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Buscar
        </button>

        <button
          onClick={() => {
            setStartDate('');
            setEndDate('');
            setRequestType('');
            fetchRequests();
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Limpiar
        </button>
      </div>

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
              Motivo ingresado: *
              {(req.motivoEmpleado || '').substring(0, 50)}
              ...*
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



