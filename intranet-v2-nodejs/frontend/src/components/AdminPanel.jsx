// frontend/src/Components/AdminPanel.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://127.0.0.1:8000/api"; 

// 🛑 Lista de roles disponibles
const availableRoles = [
    { value: 'employee', label: 'Empleado' },
    { value: 'manager', label: 'Manager' },
    { value: 'rrhh', label: 'Gestión Humana / RRHH' },
    { value: 'admin', label: 'Administrador' },
    { value: 'tecnico', label: 'Técnico' },
];

const AdminPanel = ({ isEmbedded }) => {
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    // 🛑 1. Nuevo estado para el rol, con valor por defecto
    const [newRole, setNewRole] = useState('employee'); 
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/'); 
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setMessage('');

        const adminEmail = localStorage.getItem('userEmail'); 
        
        if (!adminEmail) {
            setMessage("Error: No se encontró el email del administrador logueado.");
            return;
        }

        try {
            // 🛑 3. Incluir el nuevo campo 'newRole' en el payload de la solicitud
            const response = await axios.post(`${API_BASE}/admin/create-user`, {
                newUsername,
                newEmail,
                newPassword,
                newRole, // ¡Añadido el rol aquí!
                adminEmail
            });
            
            setMessage(response.data.message);
            setNewUsername('');
            setNewEmail('');
            setNewPassword('');
            // No reseteamos newRole, se queda en 'employee' por defecto o la última selección
            setNewRole('employee'); 

        } catch (error) {
            console.error('Error al crear usuario:', error.response ? error.response.data : error.message);
            setMessage(error.response?.data?.error || 'Error al crear usuario.');
        }
    };

    // Estilo base: si está incrustado (isEmbedded=true), no le ponemos el fondo gris ni el padding grande.
    const containerStyle = isEmbedded ? {} : { padding: 30, backgroundColor: '#f4f4f4', minHeight: '100vh' };
    
    // Estilos de los inputs para consistencia visual
    const inputBaseStyle = { 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        color: 'black' // Asegura que el texto sea visible
    };

    return (
        <div style={containerStyle}>
            <div style={{ maxWidth: '800px', margin: isEmbedded ? '20px 0 0 0' : '0 auto' }}>
                
                {/* Título y botón de Cerrar Sesión: SOLO se muestran si NO están incrustados */}
                {!isEmbedded && (
                    <>
                        <h2 style={{ color: '#007bff' }}>Panel de Administración - OPTIMACOM</h2>
                        <button 
                            onClick={handleLogout} 
                            style={{ 
                                float: 'right', 
                                padding: '10px 20px', 
                                backgroundColor: '#dc3545', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '5px', 
                                cursor: 'pointer' 
                            }}>
                            Cerrar Sesión
                        </button>
                        <div style={{ clear: 'both' }}></div>
                    </>
                )}

                {/* Contenedor del Formulario */}
                <div style={{ 
                    backgroundColor: 'white', 
                    padding: '30px', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
                    marginTop: isEmbedded ? '10px' : '20px' 
                }}>
                    {/* Título actualizado para reflejar el rol seleccionado */}
                    <h3 style={{ color: 'black' }}>Añadir Nuevo Usuario (Rol seleccionado: **{newRole}**)</h3>

                    <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            type="text"
                            placeholder="Nombre de Usuario"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                            style={inputBaseStyle}
                        />
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                            style={inputBaseStyle}
                        />
                        <input
                            type="password"
                            placeholder="Contraseña Inicial"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={inputBaseStyle}
                        />
                        
                        {/* 🛑 2. Campo de Selección de Rol */}
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            required
                            style={{ ...inputBaseStyle, padding: '10px', backgroundColor: '#f0f0f0' }} // Fondo claro para diferenciar
                        >
                            <option value="" disabled>Seleccione el Rol</option>
                            {availableRoles.map(role => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>

                        <button 
                            type="submit" 
                            style={{ 
                                padding: '12px', 
                                backgroundColor: '#28a745', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                fontSize: '16px'
                            }}>
                            Crear Empleado
                        </button>
                    </form>
                    {message && <p style={{ 
                        marginTop: '15px', 
                        color: message.includes('exitosamente') ? 'green' : 'red', 
                        fontWeight: 'bold' 
                    }}>{message}</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;

