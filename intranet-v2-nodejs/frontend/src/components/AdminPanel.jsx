// frontend/src/Components/AdminPanel.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = "http://127.0.0.1:8000/api";

// Lista de roles disponibles
const availableRoles = [
  { value: 'employee', label: 'Empleado' },
  { value: 'manager', label: 'Manager' },
  { value: 'rrhh', label: 'Gestión Humana / RRHH' },
  { value: 'admin', label: 'Administrador' },
  { value: 'tecnico', label: 'Técnico' },
];

const AdminPanel = ({ isEmbedded }) => {
  const [newCedula, setNewCedula] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [newJefe, setNewJefe] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newPais, setNewPais] = useState('Colombia');
  const [newFechaIngreso, setNewFechaIngreso] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      const response = await axios.post(`${API_BASE}/admin/create-user`, {
        cedula: newCedula,
        nombre_completo: newUsername,
        cargo: newCargo,
        jefe_directo: newJefe,
        telefono: newTelefono,
        correo: newEmail,
        pais: newPais,
        fecha_ingreso: newFechaIngreso || null,
        contrasena: newPassword,
        rol: newRole,
        // adminEmail podrías usarlo en el backend para auditoría si quieres
      });

      setMessage(response.data.message || 'Usuario creado exitosamente.');
      setNewCedula('');
      setNewUsername('');
      setNewCargo('');
      setNewJefe('');
      setNewTelefono('');
      setNewPais('Colombia');
      setNewFechaIngreso('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('employee');
    } catch (error) {
      console.error('Error al crear usuario:', error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.error || 'Error al crear usuario.');
    }
  };

  const containerStyle = isEmbedded ? {} : { padding: 30, backgroundColor: '#f4f4f4', minHeight: '100vh' };

  const inputBaseStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    color: 'black',
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '800px', margin: isEmbedded ? '20px 0 0 0' : '0 auto' }}>
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
                cursor: 'pointer',
              }}
            >
              Cerrar Sesión
            </button>
            <div style={{ clear: 'both' }}></div>
          </>
        )}

        <div
          style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            marginTop: isEmbedded ? '10px' : '20px',
          }}
        >
          <h3 style={{ color: 'black' }}>
            Añadir Nuevo Usuario (Rol seleccionado: <strong>{newRole}</strong>)
          </h3>

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              placeholder="Cédula"
              value={newCedula}
              onChange={(e) => setNewCedula(e.target.value)}
              required
              style={inputBaseStyle}
            />

            <input
              type="text"
              placeholder="Nombre Completo"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              style={inputBaseStyle}
            />

            <input
              type="text"
              placeholder="Cargo"
              value={newCargo}
              onChange={(e) => setNewCargo(e.target.value)}
              style={inputBaseStyle}
            />

            <input
              type="text"
              placeholder="Jefe Directo"
              value={newJefe}
              onChange={(e) => setNewJefe(e.target.value)}
              style={inputBaseStyle}
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={newTelefono}
              onChange={(e) => setNewTelefono(e.target.value)}
              style={inputBaseStyle}
            />

            <input
              type="text"
              placeholder="País"
              value={newPais}
              onChange={(e) => setNewPais(e.target.value)}
              style={inputBaseStyle}
            />

            <input
              type="date"
              placeholder="Fecha de ingreso"
              value={newFechaIngreso}
              onChange={(e) => setNewFechaIngreso(e.target.value)}
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

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              required
              style={{ ...inputBaseStyle, padding: '10px', backgroundColor: '#f0f0f0' }}
            >
              <option value="" disabled>
                Seleccione el Rol
              </option>
              {availableRoles.map((role) => (
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
                fontSize: '16px',
              }}
            >
              Crear Empleado
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: '15px',
                color: message.includes('exitosamente') ? 'green' : 'red',
                fontWeight: 'bold',
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;


