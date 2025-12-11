// frontend/src/Components/HerramientasModule.jsx

import React, { useState } from 'react';
// En una implementación real, aquí importarías el lector de QR, ej: import { QrReader } from 'react-qr-reader';

const HerramientasModule = () => {
    const [scannedId, setScannedId] = useState('');
    const [action, setAction] = useState('Prestar');
    const [status, setStatus] = useState('Buen estado');
    const [message, setMessage] = useState('');
    
    // Simulación de la lectura del QR (en producción, esto vendría del lector)
    const handleScan = (result) => {
        if (result) {
            // Asume que el QR devuelve un ID de herramienta, ej: 'TOOL-456'
            setScannedId(result);
            setMessage(`🛠️ ID de herramienta escaneado: ${result}`);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('');

        if (!scannedId) {
            setMessage("❌ Escanea un código QR de herramienta primero.");
            return;
        }

        console.log(`Registrando acción: ${action} para ID: ${scannedId}`);

        // 🛑 Lógica real de envío al Backend (actualizar inventario)
        // axios.post(`${API_BASE}/tools/register-action`, { scannedId, action, status, userEmail: localStorage.getItem('userEmail') });

        setTimeout(() => {
            setMessage(`✅ Registro de ${action} de la herramienta ${scannedId} realizado con éxito. Estado: ${status}`);
            setScannedId('');
            setStatus('Buen estado');
            setAction('Prestar');
        }, 1500);
    };

    return (
       <div style={{ padding: 20, backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
            {/* 🛑 MODIFICACIÓN: Título en color negro */}
            <h2 style={{ color: 'black' }}>🛠️ Gestión de Herramientas (Técnicos)</h2>
            
            {/* 🛑 MODIFICACIÓN: Descripción en color negro */}
            <p style={{ color: 'black' }}>Escanea el código QR para registrar la acción de préstamo o devolución.</p>

            <div style={{ margin: '20px 0', border: '2px dashed #0f0e0eff', padding: '20px', textAlign: 'center' }}>
                {/* Aquí iría el componente real de QrReader */}
                <p style={{ fontWeight: 'bold' }}>[Lector de QR Placeholder]</p>
                <button onClick={() => handleScan(`TOOL-${Math.floor(Math.random() * 900) + 100}`)} 
                        style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Simular Escaneo QR
                </button>
            </div>

            {scannedId && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', marginTop: '20px' }}>
                    
                    <input type="text" value={scannedId} readOnly 
                           style={{ padding: '10px', border: '1px solid #007bff', backgroundColor: '#f0f8ff', borderRadius: '4px', fontWeight: 'bold' }} />

                    <select value={action} onChange={(e) => setAction(e.target.value)} required
                            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <option value="Prestar">Prestar Herramienta</option>
                        <option value="Devolver">Devolver Herramienta</option>
                    </select>
                    
                    <select value={status} onChange={(e) => setStatus(e.target.value)} required
                            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <option value="Buen estado">Buen estado</option>
                        <option value="Necesita mantenimiento">Necesita mantenimiento</option>
                        <option value="Dañada">Dañada / Fuera de servicio</option>
                    </select>

                    <button type="submit" style={{ padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                        Registrar Acción
                    </button>
                </form>
            )}

            {message && (
                <p style={{ marginTop: '20px', color: message.startsWith('✅') ? 'green' : (message.startsWith('❌') ? 'red' : 'black'), fontWeight: 'bold' }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default HerramientasModule;