// En frontend/src/Components/Home.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

// 🛑 Acepta la prop 'isEmbedded'
const Home = ({ isEmbedded }) => {
  // Obtener la información del usuario del localStorage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();

  // Función para manejar el cierre de sesión, usando navigate en lugar de window.location
  const handleLogout = () => { 
    localStorage.clear();
    navigate('/'); 
  };
  
  // Si está incrustado, no necesitamos el padding externo.
  const containerStyle = isEmbedded ? { padding: 0 } : { padding: 24, minHeight: '80vh' };

  return (
    <div style={containerStyle}>
      {user ? (
        <>
          {/* 🛑 Título y botón de Cerrar Sesión: SOLO se muestran si NO están incrustados */}
          {!isEmbedded && (
            <>
              <h1>¡Bienvenida a la intranet!</h1>
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
            </>
          )}

          {/* 🛑 Contenido principal del Empleado (siempre visible si hay usuario) */}
          <div style={{ padding: isEmbedded ? 0 : 20, border: isEmbedded ? 'none' : '1px solid #ccc', borderRadius: '8px', backgroundColor: isEmbedded ? 'transparent' : 'white', color: 'black', }}>
            <h3 style={{ marginTop: isEmbedded ? 0 : '10px' }}>Resumen de la Sesión</h3>
            <p>Estás conectad@ como **{user.username}** ({user.email}).</p>
            <p>Tu rol asignado es: **{user.role}**.</p>
            <p>Aquí irá el contenido y las herramientas específicas del empleado.</p>
          </div>
        </>
      ) : (
        <>
          <h1>Acceso Denegado</h1>
          <p>Por favor, inicia sesión para acceder al panel.</p>
          <button onClick={() => navigate('/')}>Ir al Login</button>
        </>
      )}
    </div>
  );
};

export default Home;