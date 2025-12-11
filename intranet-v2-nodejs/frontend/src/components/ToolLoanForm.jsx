// frontend/src/components/ToolLoanForm.jsx

import React, { useState } from 'react';

// URL base de la API (debe coincidir con tu backend en el puerto 8000)
const API_BASE = 'http://127.0.0.1:8000/api'; 

// Función para obtener el email del técnico logueado (simulado o desde localStorage)
const TECHNICIAN_EMAIL = localStorage.getItem('userEmail') || 'tecnico@optimacom.com'; 

const ToolLoanForm = () => {
    // 🛑 ESTADOS NECESARIOS PARA EL FORMULARIO
    const [toolId, setToolId] = useState('TOOL-945'); // Usado por el escáner QR
    const [action, setAction] = useState('Préstamo'); // 'Préstamo' o 'Devolución'
    const [condition, setCondition] = useState('Buen estado'); // Condición de la herramienta
    const [message, setMessage] = useState(''); // Mensaje de éxito/error
    const [isError, setIsError] = useState(false);

    // 🛑 FUNCIÓN QUE ENVÍA EL REGISTRO AL BACKEND
    const handleRegisterAction = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (!toolId || !TECHNICIAN_EMAIL || !action) {
            setIsError(true);
            setMessage('Error: Faltan datos esenciales (ID de herramienta, Técnico o Acción).');
            return;
        }

        // Datos que coinciden con el endpoint POST /api/tools/register-action
        const dataToSend = {
            toolId: toolId,
            technicianEmail: TECHNICIAN_EMAIL,
            action: action, 
            condition: condition,
            photoUrl: 'N/A' // Pendiente de implementación de subida de archivos
        };

        try {
            const response = await fetch(`${API_BASE}/tools/register-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend),
            });

            const result = await response.json();

            if (!response.ok) {
                // Manejar errores del servidor (e.g., herramienta no existe)
                setIsError(true);
                setMessage(result.error || `Error ${response.status}: Error al registrar.`);
                return;
            }

            // Registro Exitoso
            setIsError(false);
            setMessage(`✅ ${result.message}`);
            // Después del registro, puedes limpiar el ID o cambiar el enfoque
            // setToolId(''); 
            
        } catch (error) {
            setIsError(true);
            setMessage('Error de red: No se pudo conectar con el servidor.');
            console.error('Fetch error:', error);
        }
    };
    
    // Función de simulación de escaneo QR (para desarrollo)
    const simulateScan = () => {
        const simulatedIds = ['TOOL-101', 'TOOL-542', 'TOOL-999'];
        const randomId = simulatedIds[Math.floor(Math.random() * simulatedIds.length)];
        setToolId(randomId);
    };


    return (
        <div style={{ padding: '20px' }}>
            <h2>🛠️ Gestión de Herramientas (Técnicos)</h2>
            <p>Escanea el código QR para registrar la acción de préstamo o devolución.</p>
            
            <div style={{ border: '1px dashed #ccc', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                <button onClick={simulateScan} className="btn-primary">
                    Simular Escaneo QR
                </button>
            </div>

            <form onSubmit={handleRegisterAction} style={{ maxWidth: '400px', margin: '0 auto' }}>
                
                <label>ID de Herramienta Escaneada:</label>
                <input 
                    type="text" 
                    value={toolId} 
                    onChange={(e) => setToolId(e.target.value)} 
                    readOnly 
                    style={{ backgroundColor: '#eef', border: '1px solid #ddd', marginBottom: '15px' }}
                />

                <label>Acción a Registrar:</label>
                <select 
                    value={action} 
                    onChange={(e) => setAction(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '15px' }}
                >
                    <option value="Préstamo">Prestar Herramienta</option>
                    <option value="Devolución">Devolver Herramienta</option>
                </select>

                <label>Condición al Registrar:</label>
                <select 
                    value={condition} 
                    onChange={(e) => setCondition(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '25px' }}
                >
                    <option value="Buen estado">Buen estado</option>
                    <option value="Daño menor">Daño menor</option>
                    <option value="Dañada">Dañada</option>
                </select>

                <button 
                    type="submit" 
                    style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', width: '100%' }}
                >
                    Registrar Acción
                </button>
            </form>

            {/* Mensaje de estado */}
            {message && (
                <p style={{ color: isError ? 'red' : 'green', marginTop: '20px', textAlign: 'center' }}>
                    {message}
                </p>
            )}

            <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.9em' }}>
                Técnico: <strong>{TECHNICIAN_EMAIL}</strong>
            </p>
        </div>
    );
};

export default ToolLoanForm;