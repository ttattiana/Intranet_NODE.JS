import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 🛑 Importar useLocation para leer la URL
import Home from './Home'; 
import AdminPanel from './AdminPanel'; 
import SolicitudesPortal from './SolicitudesPortal';
import HerramientasModule from './HerramientasModule'; 
import BandejaAprobacion from './BandejaAprobacion'; 
import RRHHReportes from './RRHHReportes'; 

// 🛑 IMPORTAR LOS NUEVOS COMPONENTES (Inventario)
import QRGenerator from "./QRGenerator";
import ToolLoanForm from "./ToolLoanForm";
import ToolHistory from "./ToolHistory"; // NUEVO
import ToolReports from "./ToolReports"; // NUEVO


// 🛑 1. Componente para mostrar el usuario y permitir la subida de foto
const UserProfileUploader = ({ username, role }) => {
    // Referencia al input de archivo oculto
    const fileInputRef = useRef(null);
    // Estado para guardar la URL de la foto de perfil (para previsualizar)
    const [profileImage, setProfileImage] = useState(null); 

    const handleIconClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Previsualización
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);

            // 🛑 Lógica real: Subir el archivo al servidor (Backend) aquí
            console.log("Archivo listo para subir:", file.name);
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            {/* Contenedor Interactivo de Perfil */}
            <div 
                onClick={handleIconClick}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer', 
                    padding: '10px 0',
                    transition: 'opacity 0.2s',
                    color: 'white'
                }}
                title="Haga clic para cambiar su foto de perfil"
            >
                {/* Foto/Ícono de Perfil */}
                <div style={{ 
                    width: '90px', 
                    height: '90px', 
                    borderRadius: '50%',
                    marginRight: '10px',
                    backgroundColor: '#007bff', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    overflow: 'hidden',
                    border: '2px solid white'
                }}>
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
                
                {/* Texto de Conexión */}
                <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                        Conectado como **{username}**
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#bdc3c7' }}>
                        Rol: {role}
                    </p>
                </div>
            </div>

            {/* Input de archivo oculto */}
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
    const location = useLocation(); // Obtener la ubicación actual (URL)
    const [user, setUser] = useState(null);
    // 🛑 Inicializar el estado de vista leyendo la URL para el formulario móvil
    const [view, setView] = useState('home'); 

    // Estilos de los botones del menú lateral (Administrador)
    const defaultButtonStyle = {
        width: '100%',
        padding: '12px',
        textAlign: 'left',
        border: 'none',
        backgroundColor: 'transparent',
        color: 'white', // Color cambiado a blanco para el sidebar oscuro
        cursor: 'pointer',
        fontSize: '16px',
        margin: '5px 0',
        borderRadius: '4px',
        transition: 'background-color 0.3s'
    };
    
    // Estilo activo para el botón de navegación del administrador
    const activeButtonStyle = {
        ...defaultButtonStyle,
        backgroundColor: '#3498db',
        fontWeight: 'bold',
    };

    // 1. Verificar sesión y cargar datos de usuario
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                
                // 🛑 Lógica para determinar la vista inicial por URL (para el formulario QR y nuevos módulos)
                if (location.pathname.includes('/tool-loan-form')) {
                    setView('toolLoanForm');
                } else if (location.pathname.includes('/generate-qr')) {
                    setView('generateQr');
                } else if (location.pathname.includes('/tool-history')) { // NUEVO: Historial
                    setView('toolHistory');
                } else if (location.pathname.includes('/tool-reports')) { // NUEVO: Reportes
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
            // Si no hay usuario, redirigir al login
            navigate('/');
        }
    }, [navigate, location.pathname]); // Dependencia location.pathname para reaccionar a cambios de URL

    // 🛑 1.1 Función para cambiar la vista y actualizar la URL
    const handleViewChange = (newView, path) => {
        setView(newView);
        navigate(`/dashboard/${path}`);
    };

    // 2. Manejar el cierre de sesión
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (!user) {
        return <div style={{ padding: 20 }}>Cargando información del usuario...</div>; 
    }

    const { role, username } = user;

    // 🛑 3. ESTRUCTURA INTERNA DEL DASHBOARD ADMINISTRADOR (USADO POR ADMIN, MANAGER, RRHH)
    const AdminDashboard = () => {
        // Define el contenido dinámico según la vista activa
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
                // 🛑 VISTAS DE INVENTARIO
                case 'generateQr':
                    return <QRGenerator />;
                case 'toolLoanForm':
                    return <ToolLoanForm />;
                case 'toolHistory': // NUEVO: Historial
                    return <ToolHistory />;
                case 'toolReports': // NUEVO: Reportes
                    return <ToolReports />;
                    
                default:
                    return <Home isEmbedded={true} />;
            }
        };

        return (
            <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
                
                {/* Menú Lateral (Sidebar) */}
                <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', position: 'sticky', top: 0 }}>
                    
                    <h2 style={{ paddingBottom: '10px', marginBottom: '10px' }}>OPTIMACOM Admin</h2>
                    
                    {/* 🛑 INTEGRACIÓN DEL NUEVO COMPONENTE DE PERFIL */}
                    <UserProfileUploader 
                        username={username} 
                        role={role}
                    /> 

                    {/* Botones de Navegación Interna */}
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
                    
                    {/* Botones exclusivos del Administrador */}
                    {role === 'admin' && (
                        <button 
                            onClick={() => handleViewChange('adminPanel', 'admin')} 
                            style={view === 'adminPanel' ? activeButtonStyle : defaultButtonStyle}
                        >
                            Gestión de Usuarios
                        </button>
                    )}
                    
                    {/* Botones para Técnico, Admin, y QR Generator (Inventario) */}
                    {(role === 'admin' || role === 'tecnico') && (
                        <>
                            <button 
                                onClick={() => handleViewChange('herramientas', 'herramientas')} 
                                style={view === 'herramientas' ? activeButtonStyle : defaultButtonStyle}
                            >
                                Gestión de Herramientas
                            </button>
                            {/* 🛑 BOTÓN PARA GENERAR QR */}
                            <button 
                                onClick={() => handleViewChange('generateQr', 'generate-qr')} 
                                style={view === 'generateQr' ? activeButtonStyle : defaultButtonStyle}
                            >
                                🖨️ Generar QR Herramienta
                            </button>
                            {/* 🛑 NUEVO: Historial */}
                            <button 
                                onClick={() => handleViewChange('toolHistory', 'tool-history')} 
                                style={view === 'toolHistory' ? activeButtonStyle : defaultButtonStyle}
                            >
                                📜 Historial de Herramientas
                            </button>
                            {/* 🛑 NUEVO: Reportes */}
                            <button 
                                onClick={() => handleViewChange('toolReports', 'tool-reports')} 
                                style={view === 'toolReports' ? activeButtonStyle : defaultButtonStyle}
                            >
                                📈 Reporte de Inventario
                            </button>
                        </>
                    )}
                    
                    {/* Botones para Manager, RRHH y Admin */}
                    {(role === 'admin' || role === 'manager' || role === 'rrhh') && (
                        <button 
                            onClick={() => handleViewChange('aprobaciones', 'aprobaciones')} 
                            style={view === 'aprobaciones' ? activeButtonStyle : defaultButtonStyle}
                        >
                            📋 Bandeja de Aprobación
                        </button>
                    )}

                    {/* Botones exclusivos de RRHH y Admin */}
                    {(role === 'admin' || role === 'rrhh') && (
                        <button 
                            onClick={() => handleViewChange('rrhhReports', 'rrhh-reports')} 
                            style={view === 'rrhhReports' ? activeButtonStyle : defaultButtonStyle}
                        >
                            📊 Gestión RRHH / Reportes
                        </button>
                    )}
                    
                    {/* Botón de Cerrar Sesión en el sidebar */}
                    <button 
                        onClick={handleLogout} 
                        style={{ ...defaultButtonStyle, marginTop: '50px', backgroundColor: '#e74c3c' }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
                
                {/* Área de Contenido Principal */}
                <div style={{ flexGrow: 1, padding: '30px' }}>
                    <h1 style={{ color: '#007bff', marginBottom: '30px' }}>Dashboard de Administración</h1>
                    
                    <div style={{ minHeight: '80vh' }}>
                        {renderContent()}
                    </div>
                </div>
            </div>
        );
    };

    // 🛑 4. ESTRUCTURA INTERNA DEL PORTAL DEL EMPLEADO (Solo Empleados sin Sidebar)
    const EmployeeDashboard = () => {
        // Lógica de contenido dinámico según el rol (técnico ve más módulos)
        
        // 🛑 Caso especial: Si la URL es el formulario móvil, renderizar solo eso.
        if (location.pathname.includes('/tool-loan-form')) {
            return (
                <div style={{ padding: '30px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <h1 style={{ color: '#007bff' }}>Formulario Rápido de Herramientas</h1>
                        <p style={{ marginBottom: '30px' }}>Bienvenido, **{username}**. Escaneaste un código QR.</p>
                        <ToolLoanForm />
                        {/* El formulario tiene su propia lógica de registro, no necesita logout visible */}
                    </div>
                </div>
            );
        }

        const renderEmployeeContent = () => {
            if (role === 'tecnico') {
                return (
                    <>
                        <Home isEmbedded={true} />
                        <h3 style={{marginTop: '30px'}}>Portal de Solicitudes</h3>
                        <SolicitudesPortal />
                        <h3 style={{marginTop: '30px'}}>🛠️ Módulo de Herramientas</h3>
                        <HerramientasModule />
                    </>
                );
            } 
            // Esto incluye roles 'employee', 'sst' y otros que solo necesitan solicitudes
            else {
                return (
                    <>
                        <Home isEmbedded={true} />
                        <h3 style={{marginTop: '30px'}}>Portal de Solicitudes</h3>
                        <SolicitudesPortal />
                    </>
                );
            }
        };

        return (
            <div style={{ padding: '30px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1 style={{ color: '#007bff' }}>Portal de Empleado</h1>
                    <p style={{ marginBottom: '30px' }}>Bienvenido, **{username}** (Rol: {role}).</p>

                    {/* Botón de Cerrar Sesión */}
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
                            marginBottom: '20px'
                        }}>
                        Cerrar Sesión
                    </button>
                    <div style={{ clear: 'both' }}></div>
                    
                    {/* Contenido Modular del Empleado */}
                    {renderEmployeeContent()}
                </div>
            </div>
        );
    };

    // 5. Renderizado final basado en el rol
    return (role === 'admin' || role === 'manager' || role === 'rrhh') ? <AdminDashboard /> : <EmployeeDashboard />;
};

export default Dashboard;