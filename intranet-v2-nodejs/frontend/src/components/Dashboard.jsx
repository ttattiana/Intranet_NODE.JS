// frontend/src/components/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Home from './Home';
import AdminPanel from './AdminPanel';
import SolicitudesPortal from './SolicitudesPortal';
import HerramientasModule from './HerramientasModule';
import BandejaAprobacion from './BandejaAprobacion';
import RRHHReportes from './RRHHReportes';
import QRGenerator from "./QRGenerator";
import ToolLoanForm from "./ToolLoanForm";
import ToolHistory from "./ToolHistory";
import ToolReports from "./ToolReports";
import NotificationBell from './NotificationBell';

const API_BASE = "http://192.168.2.6:8000/api";

// ==========================
// Componente de perfil
// ==========================
const UserProfileUploader = ({ username, role }) => {
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('userProfileImage') || null
  );

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        setProfileImage(imageUrl);
        localStorage.setItem('userProfileImage', imageUrl);
        console.log("Foto actualizada y guardada localmente.");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div
        onClick={handleIconClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '10px 0',
          transition: 'opacity 0.2s',
          color: 'white',
        }}
        title="Haga clic para cambiar su foto de perfil"
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            marginRight: '10px',
            backgroundColor: '#007bff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            border: '2px solid white',
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Perfil"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '20px', color: 'white' }}>👤</span>
          )}
        </div>

        <div>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            Conectado como **{username}**
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#bdc3c7' }}>
            Rol: {role}
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />

      <hr style={{ borderTop: '1px solid #778899', margin: '10px 0' }} />
    </div>
  );
};

// ==========================
// Dashboard principal
// ==========================
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');

  const defaultButtonStyle = {
    width: '100%',
    padding: '12px',
    textAlign: 'left',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '5px 0',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  };

  const activeButtonStyle = {
    ...defaultButtonStyle,
    backgroundColor: '#3498db',
    fontWeight: 'bold',
  };

  // Verificar sesión y rutas especiales
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser && location.pathname.includes('/tool-loan-form')) {
      const guestUser = { username: 'Invitado QR', role: 'tecnico' };
      setUser(guestUser);
      setView('toolLoanForm');
      return;
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        if (location.pathname.includes('/tool-loan-form')) {
          setView('toolLoanForm');
        } else if (location.pathname.includes('/generate-qr')) {
          setView('generateQr');
        } else if (location.pathname.includes('/tool-history')) {
          setView('toolHistory');
        } else if (location.pathname.includes('/tool-reports')) {
          setView('toolReports');
        } else if (location.pathname.includes('/admin')) {
          setView('adminPanel');
        } else if (location.pathname.includes('/solicitudes')) {
          setView('solicitudes');
        } else if (location.pathname.includes('/aprobaciones')) {
          setView('aprobaciones');
        } else if (location.pathname.includes('/rrhh-reports')) {
          setView('rrhhReports');
        } else {
          setView('home');
        }
      } catch (error) {
        console.error("Error al analizar datos de usuario:", error);
        localStorage.clear();
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate, location.pathname]);

  const handleViewChange = (newView, path) => {
    setView(newView);
    navigate(`/dashboard/${path}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user) {
    return <div style={{ padding: 20 }}>Cargando información del usuario...</div>;
  }

  const { role, username, email } = user;

  // =========================
  // Dashboard administrador / manager / RRHH
  // =========================
  const AdminDashboard = () => {

    const renderContent = () => {
      switch (view) {
        case 'home':
          return <Home isEmbedded={true} />;
        case 'adminPanel':
          return <AdminPanel isEmbedded={true} />;
        case 'solicitudes':
          return <SolicitudesPortal />;
        case 'herramientas':
          return <HerramientasModule />;
        case 'aprobaciones':
          return <BandejaAprobacion />;
        case 'rrhhReports':
          return <RRHHReportes />;
        case 'generateQr':
          return <QRGenerator />;
        case 'toolLoanForm':
          return <ToolLoanForm />;
        case 'toolHistory':
          return <ToolHistory />;
        case 'toolReports':
          return <ToolReports />;
        default:
          return <Home isEmbedded={true} />;
      }
    };

    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
        <div
          style={{
            width: '250px',
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '20px',
            position: 'sticky',
            top: 0,
          }}
        >
          <h2 style={{ paddingBottom: '10px', marginBottom: '10px' }}>
            OPTIMACOM Admin
          </h2>

          <UserProfileUploader username={username} role={role} />

          <button
            onClick={() => handleViewChange('home', '')}
            style={view === 'home' ? activeButtonStyle : defaultButtonStyle}
          >
            Inicio / Home
          </button>
          <button
            onClick={() => handleViewChange('solicitudes', 'solicitudes')}
            style={view === 'solicitudes' ? activeButtonStyle : defaultButtonStyle}
          >
            Portal de Solicitudes
          </button>

          {role === 'admin' && (
            <button
              onClick={() => handleViewChange('adminPanel', 'admin')}
              style={view === 'adminPanel' ? activeButtonStyle : defaultButtonStyle}
            >
              Gestión de Usuarios
            </button>
          )}

          {(role === 'admin' || role === 'tecnico') && (
            <>
              <p
                style={{
                  margin: '15px 0 5px 0',
                  fontSize: '14px',
                  color: '#bdc3c7',
                  fontWeight: 'bold',
                }}
              >
                Gestión de Herramientas
              </p>
              <button
                onClick={() => handleViewChange('herramientas', 'herramientas')}
                style={view === 'herramientas' ? activeButtonStyle : defaultButtonStyle}
              >
                🔨 Módulo de Operación
              </button>
              <button
                onClick={() => handleViewChange('generateQr', 'generate-qr')}
                style={view === 'generateQr' ? activeButtonStyle : defaultButtonStyle}
              >
                🖨️ Generar QR / Activos
              </button>
              <button
                onClick={() => handleViewChange('toolHistory', 'tool-history')}
                style={view === 'toolHistory' ? activeButtonStyle : defaultButtonStyle}
              >
                📜 Historial de Herramientas
              </button>
              <button
                onClick={() => handleViewChange('toolReports', 'tool-reports')}
                style={view === 'toolReports' ? activeButtonStyle : defaultButtonStyle}
              >
                📈 Reporte de Inventario
              </button>
            </>
          )}

          {(role === 'admin' || role === 'manager' || role === 'rrhh') && (
            <button
              onClick={() => handleViewChange('aprobaciones', 'aprobaciones')}
              style={view === 'aprobaciones' ? activeButtonStyle : defaultButtonStyle}
            >
              📋 Bandeja de Aprobación
            </button>
          )}

          {(role === 'admin' || role === 'rrhh') && (
            <button
              onClick={() => handleViewChange('rrhhReports', 'rrhh-reports')}
              style={view === 'rrhhReports' ? activeButtonStyle : defaultButtonStyle}
            >
              📊 Gestión RRHH / Reportes
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              ...defaultButtonStyle,
              marginTop: '50px',
              backgroundColor: '#e74c3c',
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        <div style={{ flexGrow: 1, padding: '30px', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <h1 style={{ color: '#007bff' }}>Dashboard de Administración</h1>

            {/* Campanita global conectada a /api/notificaciones */}
            <NotificationBell rol={role === 'rrhh' ? 'RRHH' : 'JEFE'} />
          </div>

          <div style={{ minHeight: '80vh' }}>{renderContent()}</div>
        </div>
      </div>
    );
  };

  // =========================
  // Portal del empleado + campanita + sidebar
  // =========================
  const EmployeeDashboard = () => {
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);

    // Polling para empleado: respuestas del gerente
    useEffect(() => {
      const employeeEmail = email;
      if (!employeeEmail) return;

      const interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API_BASE}/requests`, {
            params: { employeeEmail },
          });
          const rows = res.data?.requests || [];

          const seen = JSON.parse(localStorage.getItem('seenDecisions') || '[]');

          const nuevas = rows
            .filter((r) => r.status !== 'PENDIENTE' && !seen.includes(r.id))
            .map((r) => {
              let payload = {};
              try {
                payload = JSON.parse(r.payload || '{}');
              } catch {
                payload = {};
              }
              const tipo = r.type;
              const estado =
                r.status === 'APROBADA' ? 'aprobada' : 'rechazada';
              const comentario = payload.managerComment || 'Sin comentario.';
              return {
                id: r.id,
                message: `Tu solicitud de ${tipo} fue ${estado}. Comentario: ${comentario}`,
              };
            });

          if (nuevas.length > 0) {
            setNotifications((prev) => [...prev, ...nuevas]);
            const nuevosIds = nuevas.map((n) => n.id);
            localStorage.setItem(
              'seenDecisions',
              JSON.stringify([...seen, ...nuevosIds])
            );
          }
        } catch (e) {
          console.error('Error obteniendo notificaciones:', e);
        }
      }, 30000); // 30s

      return () => clearInterval(interval);
    }, [email]);

    // Acceso directo vía QR
    if (location.pathname.includes('/tool-loan-form')) {
      return (
        <div
          style={{
            padding: '0',
            backgroundColor: 'black',
            minHeight: '100vh',
            width: '100%',
          }}
        >
          <div style={{ maxWidth: '100%', margin: '0' }}>
            <ToolLoanForm />
          </div>
        </div>
      );
    }

    const renderEmployeeContent = () => {
      if (role === 'tecnico') {
        return (
          <>
            <Home isEmbedded={true} />
            <h3 style={{ marginTop: '30px' }}>Portal de Solicitudes</h3>
            <SolicitudesPortal />
            <h3 style={{ marginTop: '30px' }}>🛠️ Módulo de Herramientas</h3>
            <HerramientasModule />
          </>
        );
      } else {
        return (
          <>
            <Home isEmbedded={true} />
            <h3 style={{ marginTop: '30px' }}>Portal de Solicitudes</h3>
            <SolicitudesPortal />
          </>
        );
      }
    };

    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
        {/* Sidebar empleado */}
        <div
          style={{
            width: '250px',
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '20px',
            position: 'sticky',
            top: 0,
          }}
        >
          <h2 style={{ paddingBottom: '10px', marginBottom: '10px' }}>
            OPTIMACOM Empleado
          </h2>

          <UserProfileUploader username={username} role={role} />

          <button
            style={activeButtonStyle}
          >
            Portal de Solicitudes
          </button>

          {role === 'tecnico' && (
            <>
              <p
                style={{
                  margin: '15px 0 5px 0',
                  fontSize: '14px',
                  color: '#bdc3c7',
                  fontWeight: 'bold',
                }}
              >
                Gestión de Herramientas
              </p>
              <button
                style={defaultButtonStyle}
              >
                🔨 Módulo de Operación
              </button>
            </>
          )}

          <button
            onClick={handleLogout}
            style={{
              ...defaultButtonStyle,
              marginTop: '50px',
              backgroundColor: '#e74c3c',
            }}
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Columna derecha */}
        <div style={{ flexGrow: 1, padding: '30px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1 style={{ color: '#007bff' }}>Portal de Empleado</h1>
              <p style={{ marginBottom: '10px' }}>
                Bienvenido, **{username}** (Rol: {role}).
              </p>
            </div>

            {/* Campanita de notificaciones para empleado (se mantiene como estaba) */}
            <div style={{ position: 'relative' }}>
              <div
                style={{ cursor: 'pointer', fontSize: '24px' }}
                onClick={() => setShowNotif((s) => !s)}
                title="Notificaciones de solicitudes"
              >
                🔔
                {notifications.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      backgroundColor: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}
                  >
                    {notifications.length}
                  </span>
                )}
              </div>

              {showNotif && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 30,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    width: 320,
                    maxHeight: 300,
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}
                >
                  {notifications.length === 0 ? (
                    <p style={{ padding: 10, margin: 0, color: 'black' }}>
                      No tienes notificaciones nuevas.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: 10,
                          borderBottom: '1px solid #eee',
                          fontSize: '14px',
                          color: 'black',
                        }}
                      >
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ minHeight: '80vh', marginTop: '20px' }}>
            {renderEmployeeContent()}
          </div>
        </div>
      </div>
    );
  };

  // Render final según rol
  return role === 'admin' || role === 'manager' || role === 'rrhh'
    ? <AdminDashboard />
    : <EmployeeDashboard />;
};

export default Dashboard;


