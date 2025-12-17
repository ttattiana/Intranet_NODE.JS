import React, { useEffect, useState } from 'react';

const bellStyle = {
  position: 'absolute',
  top: 15,
  right: 30,
  cursor: 'pointer',
};

const dropdownStyle = {
  position: 'absolute',
  top: 40,
  right: 30,
  width: 320,
  maxHeight: 350,
  overflowY: 'auto',
  backgroundColor: 'white',
  border: '1px solid #ddd',
  borderRadius: 6,
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  zIndex: 1000,
  fontSize: 13,
};

function NotificationBell({ rol = 'RRHH' }) {
  const [open, setOpen] = useState(false);
  const [notis, setNotis] = useState([]);

  const cargar = async () => {
    try {
      const res = await fetch(
        `http://192.168.2.6:8000/api/notificaciones?paraRol=${rol}&soloNoLeidas=true`
      );
      const data = await res.json();
      setNotis(data);
    } catch (e) {
      console.error('Error cargando notificaciones', e);
    }
  };

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 30000); // refresca cada 30s
    return () => clearInterval(id);
  }, [rol]);

  const marcarLeida = async (id) => {
    try {
      await fetch(`http://192.168.2.6:8000/api/notificaciones/${id}/leida`, {
        method: 'PATCH',
      });
      setNotis((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error('Error marcando notificación como leída', e);
    }
  };

  const total = notis.length;

  return (
    <>
      <div style={bellStyle} onClick={() => setOpen((o) => !o)}>
        <span role="img" aria-label="notificaciones" style={{ fontSize: 26 }}>
          🔔
        </span>
        {total > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: 11,
              fontWeight: 'bold',
            }}
          >
            {total}
          </span>
        )}
      </div>

      {open && (
        <div style={dropdownStyle}>
          <div
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid #eee',
              fontWeight: 'bold',
              color: 'black',
            }}
          >
            Notificaciones ({total})
          </div>
          {total === 0 ? (
            <div style={{ padding: 10, color: 'black' }}>
              No tienes notificaciones nuevas.
            </div>
          ) : (
            notis.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid #f1f1f1',
                  color: 'black',
                }}
              >
                <div style={{ fontWeight: 'bold', color: 'black' }}>
                  {n.titulo}
                </div>
                <div style={{ color: '#555', marginBottom: 6 }}>
                  {n.mensaje}
                </div>
                <button
                  style={{
                    fontSize: 11,
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: 'none',
                    backgroundColor: '#007bff',
                    color: 'white',
                    cursor: 'pointer',
                    marginRight: 6,
                  }}
                  onClick={() => marcarLeida(n.id)}
                >
                  Marcar como leída
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}

export default NotificationBell;

