import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const RRHHReportes = () => {
  const [activeTab, setActiveTab] = useState('vacaciones');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // =====================
  // Datos simulados
  // =====================
  const vacacionesData = [
    {
      id: 1,
      empleado: 'Laura Gómez',
      jefe: 'Carlos Pérez',
      inicio: '2025-12-10',
      fin: '2025-12-20',
      dias: 8,
      estado: 'Aprobada total',
      tipoAprobacion: 'Total',
    },
    {
      id: 2,
      empleado: 'Jorge Arias',
      jefe: 'Ana Ruiz',
      inicio: '2025-12-15',
      fin: '2025-12-18',
      dias: 3,
      estado: 'Aprobación parcial',
      tipoAprobacion: 'Parcial',
    },
  ];

  const incapacidadesData = [
    {
      id: 101,
      empleado: 'Laura Gómez',
      entidad: 'EPS SaludTotal',
      fechas: '2025-10-01 al 2025-10-05',
      diasEmpresa: 2,
      diasEPS: 3,
      estado: 'Registrada en nómina',
    },
    {
      id: 102,
      empleado: 'Jorge Arias',
      entidad: 'ARL Sura',
      fechas: '2025-11-15 al 2025-11-20',
      diasEmpresa: 0,
      diasEPS: 6,
      estado: 'En validación de certificado',
    },
  ];

  const prestamosData = [
    {
      id: 201,
      empleado: 'Carlos Mendoza',
      monto: 3000000,
      plazoMeses: 12,
      estado: 'En análisis nómina',
      cumpleRequisitos: true,
    },
    {
      id: 202,
      empleado: 'Laura Gómez',
      monto: 800000,
      plazoMeses: 6,
      estado: 'Rechazado por requisitos',
      cumpleRequisitos: false,
    },
  ];

  const certificadosData = [
    {
      id: 301,
      empleado: 'Carlos Mendoza',
      tipo: 'Laboral',
      destino: 'Banco XYZ',
      medio: 'Correo (PDF)',
      estado: 'Enviado',
    },
    {
      id: 302,
      empleado: 'Laura Gómez',
      tipo: 'Ingresos',
      destino: 'Embajada',
      medio: 'Físico',
      estado: 'Listo para entrega',
    },
  ];

  const nominaLotesData = [
    {
      id: 401,
      periodo: 'Nómina Noviembre 2025',
      estado: 'Disponible',
      cargadoPor: 'Analista Nómina',
      fechaPublicacion: '2025-11-30',
    },
    {
      id: 402,
      periodo: 'Nómina Octubre 2025',
      estado: 'Disponible',
      cargadoPor: 'Analista Nómina',
      fechaPublicacion: '2025-10-31',
    },
  ];

  // =====================
  // Estilos básicos
  // =====================
  const cardStyle = {
    border: '1px solid #ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: 'white',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
  };

  const itemStyle = {
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    color: 'black',
    fontSize: '14px',
  };

  const badge = (text, color) => (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 12,
        backgroundColor: color,
        color: 'white',
        fontSize: '11px',
        marginLeft: 8,
      }}
    >
      {text}
    </span>
  );

  const tabButton = (name, label) => (
    <button
      onClick={() => setActiveTab(name)}
      style={{
        padding: '10px 15px',
        border: 'none',
        borderBottom:
          activeTab === name ? '3px solid #007bff' : '3px solid transparent',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontWeight: activeTab === name ? 'bold' : 'normal',
        color: activeTab === name ? '#007bff' : '#555',
        marginRight: 10,
      }}
    >
      {label}
    </button>
  );

  // =====================
  // Contenido por pestaña
  // =====================
  const renderVacaciones = () => (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, color: 'black' }}>Módulo de Vacaciones</h3>
      <p style={{ color: '#555', fontSize: '14px' }}>
        Aquí RRHH ve el estado global de las solicitudes, aprobaciones parciales
        y notificaciones a empleados.
      </p>
      <ul style={listStyle}>
        {vacacionesData.map((v) => (
          <li key={v.id} style={itemStyle}>
            <strong>{v.empleado}</strong> – {v.inicio} al {v.fin} ({v.dias} días).
            Jefe: {v.jefe}.
            {v.tipoAprobacion === 'Total' &&
              badge('Aprobación total', '#28a745')}
            {v.tipoAprobacion === 'Parcial' &&
              badge('Aprobación parcial', '#ffc107')}
            {v.tipoAprobacion === 'Rechazada' &&
              badge('Rechazada', '#dc3545')}
          </li>
        ))}
      </ul>
    </div>
  );

  // Calendario completo con tipos diferenciados
  const renderCalendario = () => {
    const toKey = (date) => date.toISOString().slice(0, 10);

    // Días con vacaciones
    const diasVacaciones = new Set();
    vacacionesData.forEach((v) => {
      const start = new Date(v.inicio);
      const end = new Date(v.fin);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        diasVacaciones.add(toKey(d));
      }
    });

    // Días con incapacidades
    const diasIncapacidad = new Set();
    incapacidadesData.forEach((i) => {
      const [iniStr, finStr] = i.fechas.split(' al ');
      const start = new Date(iniStr);
      const end = new Date(finStr);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        diasIncapacidad.add(toKey(d));
      }
    });

    const selKey = toKey(selectedDate);

    const empleadosVacacionesDia = vacacionesData.filter(
      (v) => selKey >= v.inicio && selKey <= v.fin
    );

    const empleadosIncapDia = incapacidadesData.filter((i) => {
      const [iniStr, finStr] = i.fechas.split(' al ');
      return selKey >= iniStr && selKey <= finStr;
    });

    return (
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, color: 'black' }}>Calendario de Ausencias</h3>
        <p style={{ color: '#555', fontSize: '14px' }}>
          Selecciona un día para ver quién está ausente por vacaciones o
          incapacidad.
        </p>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileClassName={({ date, view }) => {
              if (view !== 'month') return null;
              const key = toKey(date);

              const esVac = diasVacaciones.has(key);
              const esInc = diasIncapacidad.has(key);

              if (esVac && esInc) return 'ausencia-mixta-day';
              if (esVac) return 'vacaciones-day';
              if (esInc) return 'incapacidad-day';
              return null;
            }}
          />

          <div style={{ minWidth: 260 }}>
            <h4 style={{ marginTop: 0, color: 'black' }}>
              Ausencias el {selKey}
            </h4>

            {empleadosVacacionesDia.length === 0 &&
            empleadosIncapDia.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#555' }}>
                No hay ausencias registradas para este día.
              </p>
            ) : (
              <>
                {empleadosVacacionesDia.length > 0 && (
                  <>
                    <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                      Vacaciones:
                    </p>
                    <ul style={listStyle}>
                      {empleadosVacacionesDia.map((v) => (
                        <li key={`v-${v.id}`} style={itemStyle}>
                          <strong>{v.empleado}</strong> – {v.inicio} al {v.fin}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {empleadosIncapDia.length > 0 && (
                  <>
                    <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                      Incapacidades:
                    </p>
                    <ul style={listStyle}>
                      {empleadosIncapDia.map((i) => (
                        <li key={`i-${i.id}`} style={itemStyle}>
                          <strong>{i.empleado}</strong> – {i.fechas} (
                          {i.entidad})
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {/* Leyenda */}
            <div style={{ marginTop: 10, fontSize: '12px', color: '#555' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#ffecb3',
                  marginRight: 5,
                }}
              />
              Vacaciones
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#cce5ff',
                  marginLeft: 15,
                  marginRight: 5,
                }}
              />
              Incapacidad
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg,#ffecb3 50%,#cce5ff 50%)',
                  marginLeft: 15,
                  marginRight: 5,
                }}
              />
              Ambas
            </div>
          </div>
        </div>

        <style>
          {`
            .vacaciones-day {
              background: #ffecb3 !important;
              border-radius: 50% !important;
              position: relative;
            }
            .incapacidad-day {
              background: #cce5ff !important;
              border-radius: 50% !important;
              position: relative;
            }
            .ausencia-mixta-day {
              background: linear-gradient(135deg,#ffecb3 50%,#cce5ff 50%) !important;
              border-radius: 50% !important;
              position: relative;
            }
            .vacaciones-day abbr,
            .incapacidad-day abbr,
            .ausencia-mixta-day abbr {
              font-weight: bold;
              color: #c0392b;
            }
          `}
        </style>
      </div>
    );
  };

  const renderIncapacidades = () => (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, color: 'black' }}>Módulo de Incapacidades</h3>
      <p style={{ color: '#555', fontSize: '14px' }}>
        Bandeja de soportes médicos para validar, registrar en el sistema y
        coordinar con Nómina.
      </p>
      <ul style={listStyle}>
        {incapacidadesData.map((i) => (
          <li key={i.id} style={itemStyle}>
            <strong>{i.empleado}</strong> – {i.fechas} ({i.entidad}). Días a
            cargo empresa: {i.diasEmpresa}, EPS/ARL: {i.diasEPS}.{' '}
            {badge(
              i.estado,
              i.estado.includes('validación') ? '#ffc107' : '#28a745'
            )}
          </li>
        ))}
      </ul>
      <button
        style={{
          marginTop: 10,
          padding: '8px 12px',
          backgroundColor: '#17a2b8',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Abrir bandeja de PDFs (futuro)
      </button>
    </div>
  );

  const renderPrestamos = () => (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, color: 'black' }}>Módulo de Préstamos</h3>
      <p style={{ color: '#555', fontSize: '14px' }}>
        RRHH valida requisitos y coordina con Nómina/Finanzas montos y plazos
        de los préstamos a empleados.
      </p>
      <ul style={listStyle}>
        {prestamosData.map((p) => (
          <li key={p.id} style={itemStyle}>
            <strong>{p.empleado}</strong> – Monto: $
            {p.monto.toLocaleString('es-CO')} – Plazo: {p.plazoMeses} meses.
            {p.cumpleRequisitos
              ? badge('Cumple requisitos', '#28a745')
              : badge('No cumple requisitos', '#dc3545')}
            {badge(p.estado, '#6c757d')}
          </li>
        ))}
      </ul>
      <button
        style={{
          marginTop: 10,
          padding: '8px 12px',
          backgroundColor: '#6f42c1',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Ver detalle de tabla de amortización (futuro)
      </button>
    </div>
  );

  const renderCertificados = () => (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, color: 'black' }}>
        Módulo de Certificados Laborales
      </h3>
      <p style={{ color: '#555', fontSize: '14px' }}>
        Gestión de certificados automáticos (PDF) o físicos, con control de
        entrega y destino.
      </p>
      <ul style={listStyle}>
        {certificadosData.map((c) => (
          <li key={c.id} style={itemStyle}>
            <strong>{c.empleado}</strong> – {c.tipo} para {c.destino}. Medio:{' '}
            {c.medio}.{' '}
            {badge(c.estado, c.estado === 'Enviado' ? '#28a745' : '#ffc107')}
            {c.estado === 'Enviado' && (
              <button
                style={{
                  marginLeft: 10,
                  padding: '5px 10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Reenviar PDF
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  const renderNomina = () => (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, color: 'black' }}>
        Publicación de Desprendibles de Nómina
      </h3>
      <p style={{ color: '#555', fontSize: '14px' }}>
        Control de lotes de desprendibles cargados, validados y publicados para
        descarga por los empleados.
      </p>
      <ul style={listStyle}>
        {nominaLotesData.map((l) => (
          <li key={l.id} style={itemStyle}>
            <strong>{l.periodo}</strong> – Estado:{' '}
            {badge(l.estado, '#28a745')} Cargado por: {l.cargadoPor} el{' '}
            {l.fechaPublicacion}.
          </li>
        ))}
      </ul>
      <button
        style={{
          marginTop: 10,
          padding: '8px 12px',
          backgroundColor: '#20c997',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        Subir nuevo lote de desprendibles (futuro)
      </button>
    </div>
  );

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        color: 'black',
      }}
    >
      <h2 style={{ marginTop: 0, color: '#007bff' }}>
        📊 Centro de Gestión RRHH
      </h2>
      <p style={{ fontSize: '14px', color: '#555' }}>
        Panel unificado para que RRHH gestione vacaciones, incapacidades,
        préstamos, certificados y desprendibles de nómina.
      </p>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #ddd', marginBottom: 20 }}>
        {tabButton('vacaciones', 'Vacaciones')}
        {tabButton('calendario', 'Calendario de ausencias')}
        {tabButton('incapacidades', 'Incapacidades')}
        {tabButton('prestamos', 'Préstamos')}
        {tabButton('certificados', 'Certificados')}
        {tabButton('nomina', 'Desprendibles Nómina')}
      </div>

      {/* Contenido según pestaña */}
      {activeTab === 'vacaciones' && renderVacaciones()}
      {activeTab === 'calendario' && renderCalendario()}
      {activeTab === 'incapacidades' && renderIncapacidades()}
      {activeTab === 'prestamos' && renderPrestamos()}
      {activeTab === 'certificados' && renderCertificados()}
      {activeTab === 'nomina' && renderNomina()}
    </div>
  );
};

export default RRHHReportes;



