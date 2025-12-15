// frontend/src/components/RegistroActivo.jsx (Formulario SIMPLIFICADO de Registro de Activo)

import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = "http://192.168.0.29:8000/api";

const RegistroActivo = () => {
    // Campos del Inventario Maestro (SOLO INFORMACIÓN ESTÁTICA)
    const [toolId, setToolId] = useState('');
    const [name, setName] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [acquisitionDate, setAcquisitionDate] = useState('');
    // Eliminado: locationFija, ya que es semi-dinámico

    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    // =======================================================
    // ✅ FUNCIÓN PARA REGISTRAR EL NUEVO ACTIVO
    // =======================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false);
        setLoading(true);

        const newToolData = {
            tool_id: toolId.toUpperCase(),
            name,
            serial_number: serialNumber,
            acquisition_date: acquisitionDate,
            // location_fija no se envía si se considera dinámico
        };

        try {
            // Endpoint para guardar en la tabla tools_master
            const response = await axios.post(`${API_BASE}/inventory/register-master-tool`, newToolData);
            
            setMessage(`✅ ${response.data.message || 'Activo registrado con éxito en el Inventario Maestro.'}`);
            setIsSuccess(true);
            
            // Limpiar formulario al éxito
            setToolId('');
            setName('');
            setSerialNumber('');
            setAcquisitionDate('');

        } catch (err) {
            console.error('Error al registrar el activo:', err);
            const errorMessage = err.response?.data?.error || 'Error de red al intentar registrar el activo.';
            setMessage(`❌ Fallo en el registro: ${errorMessage}`);
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };
    // =======================================================

    const styles = {
        container: { 
            maxWidth: '600px', 
            margin: '30px auto', 
            padding: '40px', 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
        },
        title: { 
            color: '#dc3545',
            borderBottom: '3px solid #dc3545', 
            paddingBottom: '10px', 
            marginBottom: '30px' 
        },
        form: { 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px' 
        },
        formGroup: { 
            display: 'flex', 
            flexDirection: 'column' 
        },
        label: { 
            marginBottom: '5px', 
            fontWeight: '600', 
            color: '#333' 
        },
        input: { 
            padding: '12px', 
            border: '1px solid #ccc', 
            borderRadius: '5px', 
            fontSize: '1em'
        },
        button: { 
            padding: '15px', 
            backgroundColor: loading ? '#6c757d' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1.1em',
            transition: 'background-color 0.2s'
        },
        messageStyle: (success) => ({
            marginTop: '25px', 
            padding: '15px', 
            backgroundColor: success ? '#d4edda' : '#f8d7da',
            color: success ? '#155724' : '#721c24',
            fontWeight: 'bold', 
            borderRadius: '5px',
            border: success ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
        })
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>➕ Registro Manual de Nuevo Activo</h2>
            <p style={{marginBottom: '25px', color: '#555'}}>Defina las propiedades estáticas de una herramienta nueva. El movimiento será registrado por el módulo de Préstamos/Devoluciones.</p>

            <form onSubmit={handleSubmit} style={styles.form}>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>ID de Herramienta (Único para el QR)</label>
                    <input type="text" value={toolId} onChange={(e) => setToolId(e.target.value)} 
                           style={styles.input} placeholder="Ej: TALADRO-001 (DEBE COINCIDIR CON EL QR)" required />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Nombre/Descripción</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} 
                           style={styles.input} placeholder="Ej: Taladro Percutor Inalámbrico" required />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Número de Serie (Opcional)</label>
                    <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} 
                           style={styles.input} placeholder="Ej: AS-123456" />
                </div>
                
                <div style={styles.formGroup}>
                    <label style={styles.label}>Fecha de Adquisición</label>
                    <input type="date" value={acquisitionDate} onChange={(e) => setAcquisitionDate(e.target.value)} 
                           style={styles.input} required />
                </div>

                {/* 💡 Se elimina el campo de Ubicación Fija/Almacén */}

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Registrando...' : 'Guardar Activo'}
                </button>
            </form>

            {message && (
                <p style={styles.messageStyle(isSuccess)}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default RegistroActivo;