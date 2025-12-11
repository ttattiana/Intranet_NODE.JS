// frontend/src/Components/ToolLoanForm.jsx
// Este sería el componente abierto por la URL del QR
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ToolReports from './ToolHistory';

const API_BASE = "http://127.0.0.1:8000/api";

const ToolLoanForm = () => {
    // Extraer toolId de la URL (simulación de app móvil)
    const urlParams = new URLSearchParams(window.location.search);
    const initialToolId = urlParams.get('toolId') || '';

    const [toolData, setToolData] = useState({
        toolId: initialToolId,
        action: 'Préstamo', // 'Préstamo' o 'Devolución'
        condition: 'Buen estado', // Estado de la herramienta
        photoUrl: '', // URL de la foto subida (simulación)
        technicianEmail: localStorage.getItem('userEmail') || '', // Obtener email del técnico logueado
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Asegurar que la fecha y hora se registran al cargar el formulario
        setToolData(prev => ({
            ...prev,
            dateTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // Formato YYYY-MM-DD HH:MM:SS
        }));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setToolData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = (e) => {
        // 🛑 Lógica REAL de subir imagen: Aquí se subiría el archivo a un servidor
        // (como Cloudinary o tu propio backend) y se obtendría la URL.
        console.log("Simulando subida de foto...");
        setToolData(prev => ({
            ...prev,
            photoUrl: `https://tu-storage.com/images/${toolData.toolId}-${Date.now()}.jpg`
        }));
        alert('Foto simulada subida.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        // 🛑 Lógica para enviar el registro al backend
        try {
            const response = await axios.post(`${API_BASE}/tools/register-action`, toolData);
            setMessage(`✅ Registro exitoso: ${response.data.message}`);
        } catch (error) {
            setMessage(`❌ Error al registrar: ${error.response?.data?.error || 'Error de conexión.'}`);
        }
    };
    
    // Estilos muy básicos para simular una vista móvil
    const containerStyle = { maxWidth: '400px', margin: '20px auto', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '15px' };

    return (
        <div style={containerStyle}>
            <h2>Registro de Herramienta - **{toolData.action}**</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Código de la Herramienta (debe ser fijo) */}
                <label>Serial / Código:</label>
                <input type="text" value={toolData.toolId} readOnly style={{ padding: '10px', backgroundColor: '#ccc' }} />

                {/* Fecha y Hora de Entrega/Préstamo */}
                <label>Fecha y Hora del Registro:</label>
                <input type="text" value={toolData.dateTime || 'Cargando...'} readOnly style={{ padding: '10px', backgroundColor: '#ccc' }} />

                {/* Acción (Préstamo o Devolución) */}
                <label>Acción:</label>
                <select name="action" value={toolData.action} onChange={handleChange} style={{ padding: '10px' }}>
                    <option value="Préstamo">Préstamo</option>
                    <option value="Devolución">Devolución</option>
                </select>
                
                {/* Estado de la Herramienta */}
                <label>Estado de la Herramienta:</label>
                <select name="condition" value={toolData.condition} onChange={handleChange} style={{ padding: '10px' }}>
                    <option value="Buen estado">Buen estado</option>
                    <option value="Daño menor">Daño menor</option>
                    <option value="Dañada">Dañada</option>
                </select>

                {/* Fotografía de la Herramienta */}
                <label>Fotografía (Evidencia):</label>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ padding: '10px' }} />
                {toolData.photoUrl && <p style={{ fontSize: '12px', color: 'green' }}>Foto subida (URL simulada): {toolData.photoUrl.substring(0, 30)}...</p>}

                {/* Técnico Solicitante */}
                <label>Técnico (Email):</label>
                <input type="email" name="technicianEmail" value={toolData.technicianEmail} readOnly style={{ padding: '10px', backgroundColor: '#ccc' }} />
                
                <button type="submit" style={{ padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '20px' }}>
                    Registrar Acción
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', fontWeight: 'bold', color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
};

export default ToolReports;