// frontend/src/components/BandejaAprobacion.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://192.168.2.6:8000/api';

const BandejaAprobacion = () => {
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDetail, setCurrentDetail] = useState(null);
  const [managerComment, setManagerComment] = useState('');

  // Usuario logueado (manager)
  const loggedUser = JSON.parse(localStorage.getItem('intranetUser') || '{}');
  const managerEmail = loggedUser.email || 'gerente@optimacom.com';

  // =======================
  // CARGAR SOLICITUDES REALES
  // =======================
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await axios.get(`${API_BASE}/requests`, {
          params: {
            managerEmail, // solo las de este gerente
          },
        });
        const rows = res.data?.requests || [];

        const mapped = rows.map((r) => {
          let payload = {};
          try {
            payload = JSON.parse(r.payload || '{}');
          } catch {
            payload = {};
          }

          let tipo = r.type;
          let detalle = '';
          let motivo = '';

          switch (r.type) {
            case 'VACACIONES':
              tipo = 'Vacaciones';
              detalle = `${payload.startDate || ''} al ${payload.endDate || ''}`;
              motivo = payload.reason || '';
              break;
            case 'CERTIFICADO':
              tipo = 'Certificado';
              detalle = payload.certificateType || '';
              motivo = payload.purpose || '';
              break;
            case 'NOMINA':
              tipo = 'Nómina';
              detalle = payload.period || '';
              motivo = payload.reason || '';
              break;
            case 'PRESTAMO':
              tipo = 'Préstamo';
              detalle = `Monto: $${payload.amount || 0}`;
              motivo = payload.reason || '';
              break;
            case 'INCAPACIDAD':
              tipo = 'Incapacidad';
              detalle = `${payload.startDate || ''} al ${payload.endDate || ''}`;
              motivo = payload.diagnosis || '';
              break;
            default:
              tipo = r.type;
              detalle = '';
          }

          const estadoFront =
            r.status === 'APROBADA'
              ? 'Aprobado'
              : r.status === 'RECHAZADA'
              ? 'Rechazado'
              : 'Pendiente';

          return {
            id: r.id,
            empleado: r.employee_name || r.employee_email,
            tipo,
            detalle,
            estado: estadoFront,
            motivo,
            comentarioManager: payload.managerComment || null,
            pdfUrl: payload.pdfUrl || null,
          };
        });

        setRequests(mapped);
      } catch (err) {
        console.error('Error cargando solicitudes del gerente:', err);
        alert('Error al cargar solicitudes del servidor.');
      }
    };

    loadRequests();
  }, [managerEmail]);

  // =======================
  // DETALLE EN MODAL
  // =======================
  const handleViewDetails = (requestId) => {
    const request = requests.find((req) => req.id === requestId);
    setCurrentDetail(request);
    setManagerComment(request.comentarioManager || '');
    setShowModal(true);
  };

  // =======================
  // APROBAR / RECHAZAR
  // =======================
  const handleAction = async (newStatusFront) => {
    if (!managerComment.trim()) {
      alert('Debe ingresar un comentario o justificación antes de aprobar/rechazar.');
      return;
    }

    const requestId = currentDetail.id;
    const statusBackend = newStatusFront === 'Aprobado' ? 'APROBADA' : 'RECHAZADA';

    try {
      await axios.post(`${API_BASE}/requests/${requestId}/decision`, {
        status: statusBackend,
        managerComment,
      });

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === requestId
            ? { ...req, estado: newStatusFront, comentarioManager: managerComment }
            : req
        )
      );

      setShowModal(false);
      setManagerComment('');
      setCurrentDetail(null);
    } catch (err) {
      console.error('Error al actualizar decisión del manager:', err);
      alert('Error al guardar la decisión en el servidor.');
    }
  };

  // =======================
  // RENDER ACCIONES
  // =======================
  const renderActions = (request) => {
    const statusColor =
      request.estado === 'Aprobado' || request.estado === 'Generado'
        ? 'green'
        : request.estado === 'Rechazado'
        ? 'red'
        : 'orange';

    if (request.estado !== 'Pendiente') {
      return (
        <div
          style={{
            display: 'flex',
            gap: '5px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span style={{ color: statusColor, fontWeight: 'bold' }}>{request.estado}</span>
          <button
            onClick={() => handleViewDetails(request.id)}
            style={{
              padding: '5px 8px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
            title="Ver Detalle y Comentario del Manager"
          >
            👁️ Ver
          </button>
        </div>
      );
    }

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
            alignItems: 'center',
          }}
          title="Ver Detalle y tomar acción"
        >
          👁️ Detalle / Acción
        </button>
      </div>
    );
  };

  // Estilos
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: 'white',
  };
  const thStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    backgroundColor: '#f2f2f2',
    textAlign: 'left',
    color: 'black',
  };
  const tdStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left',
    color: 'black',
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
            <th style={{ ...thStyle, textAlign: 'center' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td style={tdStyle}>{request.id}</td>
              <td style={tdStyle}>{request.empleado}</td>
              <td style={tdStyle}>{request.tipo}</td>
              <td style={tdStyle}>{request.detalle}</td>
              <td
                style={{
                  ...tdStyle,
                  color: request.estado === 'Pendiente' ? 'orange' : 'green',
                  fontWeight: 'bold',
                }}
              >
                {request.estado}
              </td>
              <td style={tdStyle}>{renderActions(request)}</td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={6} style={{ ...tdStyle, textAlign: 'center' }}>
                No hay solicitudes para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Detalle / Acción */}
      {showModal && currentDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              width: '500px',
              maxHeight: '90%',
              overflowY: 'auto',
              color: 'black',
            }}
          >
            <h3>Detalle de Solicitud #{currentDetail.id}</h3>
            <p>
              <strong>Empleado:</strong> {currentDetail.empleado}
            </p>
            <p>
              <strong>Tipo:</strong> {currentDetail.tipo}
            </p>
            <p>
              <strong>Detalle:</strong> {currentDetail.detalle}
            </p>

            {/* Si es incapacidad y hay PDF, mostrar enlace */}
            {currentDetail.tipo === 'Incapacidad' && currentDetail.pdfUrl && (
              <p>
                <strong>Certificado médico:</strong>{' '}
                <a
                  href={`http://192.168.2.6:8000${currentDetail.pdfUrl}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver PDF
                </a>
              </p>
            )}

            <hr />

            <p>
              <strong>Motivo del Empleado/Comentarios:</strong>
            </p>
            <p
              style={{
                backgroundColor: '#f9f9f9',
                padding: '10px',
                borderRadius: '4px',
                borderLeft: '3px solid #3498db',
                color: 'black',
              }}
            >
              {currentDetail.motivo}
            </p>
            <hr />

            {currentDetail.estado !== 'Pendiente' ? (
              <div>
                <h4>
                  Estatus Final:{' '}
                  <span
                    style={{
                      color: currentDetail.estado === 'Aprobado' ? 'green' : 'red',
                    }}
                  >
                    {currentDetail.estado}
                  </span>
                </h4>

                <div
                  style={{
                    padding: '10px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffeeba',
                    borderRadius: '4px',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 'bold' }}>
                    Comentario del Manager (Auditoría RRHH):
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>
                    "
                    {currentDetail.comentarioManager ||
                      'El manager no dejó un comentario específico.'}
                    "
                  </p>
                </div>
                <small style={{ marginTop: '10px', display: 'block' }}>
                  *El equipo de RRHH puede proceder con la acción final según el tipo de solicitud.
                </small>
              </div>
            ) : (
              <>
                <h4>Comentario del Manager (Obligatorio)</h4>
                <textarea
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  placeholder="Ingrese la justificación de la aprobación o rechazo."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '20px',
                    border: '1px solid #ccc',
                    resize: 'vertical',
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '15px',
                  }}
                >
                  <button
                    onClick={() => handleAction('Aprobado')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    ✅ Aprobar
                  </button>

                  <button
                    onClick={() => handleAction('Rechazado')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
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
                width: '100%',
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
