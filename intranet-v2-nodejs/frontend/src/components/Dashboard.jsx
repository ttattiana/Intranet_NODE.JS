import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Home from './Home';
import AdminPanel from './AdminPanel';
import SolicitudesPortal from './SolicitudesPortal';
import HerramientasModule from './HerramientasModule';
import BandejaAprobacion from './BandejaAprobacion';
import RRHHReportes from './RRHHReportes';
// Componentes de Inventario
import QRGenerator from "./QRGenerator";
import ToolLoanForm from "./ToolLoanForm";
import ToolHistory from "./ToolHistory";
import ToolReports from "./ToolReports";
// ¡IMPORTANTE! Hemos asumido que ha creado este componente para el registro maestro
// import RegistroActivo from "./RegistroActivo"; 


// 1. Componente de perfil (MODIFICADO PARA PERSISTENCIA LOCAL)
const UserProfileUploader = ({ username, role }) => {
    const fileInputRef = useRef(null);
    
    // 🔑 CAMBIO 1: Inicializar el estado de la imagen recuperando de localStorage
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
                
                // 🔑 CAMBIO 2: Guardar la nueva imagen en el estado
                setProfileImage(imageUrl);
                
                // 🔑 CAMBIO 3: Guardar la URL de la imagen en localStorage para persistencia
                localStorage.setItem('userProfileImage', imageUrl);

                // 🚨 PRÓXIMO PASO CRÍTICO: Aquí debe ir la llamada AXIOS para 
                // subir el 'file' al servidor y guardar la URL permanente en la BD 
                // del usuario para que persista en CUALQUIER dispositivo.
                // Ejemplo: axios.post('/api/upload-profile-pic', formData);

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

    // 1. Verificar sesión y tratar caso QR sin login
    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        // Permitir acceso directo vía QR al formulario de préstamo
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

                // CÓDIGO SUGERIDO: Si el backend envía la URL de la foto al login,
                // la guardaría aquí en localStorage para que UserProfileUploader la use.
                // if (parsedUser.photo_url) {
                //     localStorage.setItem('userProfileImage', parsedUser.photo_url);
                // }

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
                } else {
                    setView('home');
                }
            } catch (error) {
                console.error("Error al analizar datos de usuario:", error);
                localStorage.clear();
                navigate('/');
            }
        } else {
            // Sin usuario y no es URL de QR -> ir al login
            navigate('/');
        }
    }, [navigate, location.pathname]);

    const handleViewChange = (newView, path) => {
        setView(newView);
        navigate(`/dashboard/${path}`);
    };

    const handleLogout = () => {
        // Al cerrar sesión, lo ideal es limpiar también la foto de perfil local
        localStorage.clear();
        navigate('/');
    };

    if (!user) {
        return <div style={{ padding: 20 }}>Cargando información del usuario...</div>;
    }

    const { role, username } = user;

    // 3. Dashboard administrador
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
                    // return <RegistroActivo />; // Si desea usar esta vista para el registro maestro
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
                            <p style={{ margin: '15px 0 5px 0', fontSize: '14px', color: '#bdc3c7', fontWeight: 'bold' }}>
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

                <div style={{ flexGrow: 1, padding: '30px' }}>
                    <h1 style={{ color: '#007bff', marginBottom: '30px' }}>
                        Dashboard de Administración
                    </h1>

                    <div style={{ minHeight: '80vh' }}>{renderContent()}</div>
                </div>
            </div>
        );
    };

    // 4. Portal del empleado
    const EmployeeDashboard = () => {
        // Caso especial: acceso vía QR
        if (location.pathname.includes('/tool-loan-form')) {
            return (
                <div style={{ padding: '0', backgroundColor: 'black', minHeight: '100vh', width: '100%' }}>
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
            <div style={{ padding: '30px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1 style={{ color: '#007bff' }}>Portal de Empleado</h1>
                    <p style={{ marginBottom: '30px' }}>
                        Bienvenido, **{username}** (Rol: {role}).
                    </p>

                    <button
                        onClick={handleLogout}
                        style={{
                            float: 'right',
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginBottom: '20px',
                        }}
                    >
                        Cerrar Sesión
                    </button>
                    <div style={{ clear: 'both' }}></div>

                    {renderEmployeeContent()}
                </div>
            </div>
        );
    };

    // 5. Renderizado final
    return role === 'admin' || role === 'manager' || role === 'rrhh'
        ? <AdminDashboard />
        : <EmployeeDashboard />;
};

export default Dashboard;
