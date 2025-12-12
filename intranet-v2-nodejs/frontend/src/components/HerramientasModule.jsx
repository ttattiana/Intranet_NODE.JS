// frontend/src/Components/HerramientasModule.jsx (DISEÑO MEJORADO A TEMA CLARO)

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

    // =======================================================
    // 🎨 ESTILOS MEJORADOS
    // =======================================================
    const styles = {
        container: { 
            padding: '30px', 
            backgroundColor: 'white', 
            borderRadius: '10px', 
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)', 
            maxWidth: '550px',
            margin: '30px auto',
            border: '1px solid #e0e0e0'
        },
        title: { 
            color: '#007bff', 
            borderBottom: '2px solid #007bff', 
            paddingBottom: '10px', 
            marginBottom: '20px' 
        },
        description: { 
            color: '#555', 
            marginBottom: '20px' 
        },
        qrSection: { 
            margin: '25px 0', 
            border: '3px dashed #007bff', // Borde con color de acento
            padding: '30px', 
            textAlign: 'center',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
        },
        qrPlaceholder: { 
            fontWeight: 'bold', 
            color: '#333', 
            fontSize: '1.1em' 
        },
        scanButton: { 
            padding: '12px 20px', 
            backgroundColor: '#28a745', // Verde para acción de escanear
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        },
        form: { 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            marginTop: '30px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        },
        input: { 
            padding: '12px', 
            border: '1px solid #ccc', 
            borderRadius: '5px', 
            backgroundColor: '#fff',
            fontWeight: 'normal',
            fontSize: '1em'
        },
        readOnlyInput: {
            padding: '12px', 
            border: '2px solid #007bff', 
            backgroundColor: '#e9f5ff', 
            borderRadius: '5px', 
            fontWeight: 'bold',
            fontSize: '1em',
            color: '#0056b3'
        },
        submitButton: { 
            padding: '15px', 
            backgroundColor: '#007bff', // Azul para el registro final
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1em',
            transition: 'background-color 0.2s'
        },
        message: (isSuccess) => ({
            marginTop: '25px', 
            padding: '15px', 
            backgroundColor: isSuccess ? '#d4edda' : '#f8d7da',
            color: isSuccess ? '#155724' : '#721c24',
            fontWeight: 'bold', 
            borderRadius: '5px',
            border: isSuccess ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
        })
    };
    // =======================================================


    return (
        <div style={styles.container}>
            <h2 style={styles.title}>🛠️ Gestión de Herramientas (Técnicos)</h2>
            
            <p style={styles.description}>
                Utiliza esta sección para escanear el código QR y registrar rápidamente el préstamo o la devolución de una herramienta.
            </p>

            <div style={styles.qrSection}>
                <p style={styles.qrPlaceholder}>[Lector de QR Placeholder]</p>
                <button onClick={() => handleScan(`TOOL-${Math.floor(Math.random() * 900) + 100}`)} 
                        style={styles.scanButton}>
                    Simular Escaneo QR
                </button>
            </div>

            {scannedId && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    
                    <label style={{ color: '#555', fontWeight: '600' }}>ID de Herramienta Escaneada:</label>
                    <input type="text" value={scannedId} readOnly 
                            style={styles.readOnlyInput} />

                    <label style={{ color: '#555', fontWeight: '600' }}>Acción a Registrar:</label>
                    <select value={action} onChange={(e) => setAction(e.target.value)} required
                            style={styles.input}>
                        <option value="Prestar">Prestar Herramienta</option>
                        <option value="Devolver">Devolver Herramienta</option>
                    </select>
                    
                    <label style={{ color: '#555', fontWeight: '600' }}>Estado de la Herramienta:</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} required
                            style={styles.input}>
                        <option value="Buen estado">Buen estado</option>
                        <option value="Necesita mantenimiento">Necesita mantenimiento</option>
                        <option value="Dañada">Dañada / Fuera de servicio</option>
                    </select>

                    <button type="submit" style={styles.submitButton}>
                        Registrar Acción
                    </button>
                </form>
            )}

            {message && (
                <p style={styles.message(message.startsWith('✅'))}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default HerramientasModule;