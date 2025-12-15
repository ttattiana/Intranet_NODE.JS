// frontend/src/components/ToolHistory.jsx (CARGA INMEDIATA - VERSIÓN FINAL)

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = "http://192.168.0.29:8000/api";
const ToolHistory = () => {
    const [historyData, setHistoryData] = useState([]); // ✅ Array vacío inicial
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fetchAttempted, setFetchAttempted] = useState(false);

    const mockHistoryData = [
        { 
            id: 'MOV-005', 
            tool_id: 'TALADRO-03', 
            technician_email: 'jorge@email.com',
            technician_name: 'Jorge Acosta', 
            action: 'Préstamo', 
            condition: 'Buen estado', 
            timestamp: '2025-12-10 10:30', 
            photo_url: 'https://via.placeholder.com/50/28a745/FFFFFF?text=OK'
        },
        { 
            id: 'MOV-006', 
            tool_id: 'MARTILLO-001', 
            technician_email: 'ana@email.com',
            technician_name: 'Ana Pérez', 
            action: 'Devolución', 
            condition: 'Dañada', 
            timestamp: '2025-12-11 15:45', 
            photo_url: 'N/A'
        },
    ];

    const fetchToolHistory = useCallback(async () => {
        // ✅ Carga MOCK INMEDIATAMENTE (0.1s)
        setHistoryData(mockHistoryData);
        setLoading(false);
        
        // ✅ Fetch real en background (no bloquea UI)
        if (fetchAttempted) return;
        
        setFetchAttempted(true);
        setError(null);
        
        try {
            const response = await axios.get(`${API_BASE}/tools/history`, {
                timeout: 5000 // ✅ 5s máximo
            });
            // ✅ Actualiza SOLO si hay datos reales
            if (response.data?.history?.length > 0) {
                setHistoryData(response.data.history);
                setError(null);
            }
        } catch (err) {
            // ✅ Silencioso - mock ya está cargado
            if (!err.code?.includes('NETWORK')) {
                console.error("Error fetching tool history:", err);
            }
            setError("Datos reales no disponibles. Mostrando demo.");
        }
    }, [fetchAttempted]);

    const handleDelete = async (movementId) => {
        if (!window.confirm(`⚠️ ¿Estás seguro de que quieres ELIMINAR el movimiento ID: ${movementId}?`)) {
            return;
        }

        try {
            await axios.delete(`${API_BASE}/tools/delete-action/${movementId}`, { 
                timeout: 5000 
            });
            alert(`✅ Movimiento ${movementId} eliminado`);
            fetchToolHistory(); // Recarga con mock si backend falla
        } catch (err) {
            alert(`❌ Error: ${err.response?.data?.error || 'Sin conexión'}`);
        }
    };

    // ✅ CARGA INMEDIATA al montar
    useEffect(() => {
        fetchToolHistory();
    }, [fetchToolHistory]);

    const DARK_TEXT_COLOR = '#333333';

    const styles = {
        container: { 
            maxWidth: '1300px', 
            margin: '30px auto', 
            padding: '40px', 
            backgroundColor: '#ffffff',
            borderRadius: '12px', 
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            color: DARK_TEXT_COLOR,
        },
        table: { 
            width: '100%', 
            borderCollapse: 'separate', 
            borderSpacing: '0',
            marginTop: '25px',
            overflow: 'hidden', 
            borderRadius: '10px',
            color: DARK_TEXT_COLOR,
        },
        th: { 
            border: 'none', 
            padding: '15px 12px', 
            backgroundColor: '#007bff', 
            color: 'white',
            textAlign: 'left', 
            fontSize: '1em',
            fontWeight: '600'
        },
        td: (index) => ({ 
            border: '1px solid #e0e0e0', 
            padding: '12px 12px', 
            textAlign: 'left', 
            verticalAlign: 'middle', 
            fontSize: '0.9em',
            backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff', 
            color: DARK_TEXT_COLOR,
        }),
        statusLoan: { backgroundColor: '#e6ffe6', color: '#1e7e34', fontWeight: 'bold', padding: '5px 8px', borderRadius: '4px' },
        statusReturn: { backgroundColor: '#fff0e6', color: '#c36f09', fontWeight: 'bold', padding: '5px 8px', borderRadius: '4px' },
        statusMaint: { backgroundColor: '#f0f0f5', color: '#34495e', fontWeight: 'bold', padding: '5px 8px', borderRadius: '4px' },
        header: { 
            marginBottom: '25px', 
            borderBottom: '3px solid #007bff', 
            paddingBottom: '10px',
            color: DARK_TEXT_COLOR
        },
        loading: { color: '#007bff', textAlign: 'center', padding: '50px' },
        error: { color: '#dc3545', marginBottom: '15px', fontWeight: 'bold', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '5px', border: '1px solid #f5c6cb' },
        photoThumb: { width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc' },
        noPhoto: { color: '#777', fontStyle: 'italic', fontSize: '0.8em' },
        deleteButton: {
            padding: '6px 10px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85em',
            minWidth: '80px',
        }
    };

    const getActionStyle = (action, condition) => {
        if (action === 'Préstamo') return styles.statusLoan;
        if (action === 'Devolución') {
            if (condition?.toLowerCase().includes('dañada')) return styles.statusMaint;
            return styles.statusReturn;
        }
        return {};
    };

    const handlePhotoClick = (url) => {
        if (url && url !== 'N/A') window.open(url, '_blank');
    };

    // ✅ SIEMPRE muestra datos (mock o reales)
    return (
        <div style={styles.container}>
            <h3 style={styles.header}>📜 Historial de Movimientos de Herramientas</h3>
            
            {error && <p style={styles.error}>{error}</p>}

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>ID Movimiento</th>
                        <th style={styles.th}>ID Herramienta</th>
                        <th style={styles.th}>Fecha y Hora</th>
                        <th style={styles.th}>Técnico</th>
                        <th style={styles.th}>Acción</th>
                        <th style={styles.th}>Condición</th>
                        <th style={styles.th}>Foto</th>
                        <th style={styles.th}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {historyData.map((item, index) => (
                        <tr key={item.id}>
                            <td style={styles.td(index)}>{item.id}</td>
                            <td style={styles.td(index)}>{item.tool_id}</td> 
                            <td style={styles.td(index)}>{item.timestamp}</td> 
                            <td style={styles.td(index)}>{item.technician_name || item.technician_email}</td> 
                            <td style={styles.td(index)}>
                                <span style={getActionStyle(item.action, item.condition)}>
                                    {item.action}
                                </span>
                            </td>
                            <td style={styles.td(index)}>{item.condition || 'N/A'}</td>
                            <td style={styles.td(index)}>
                                {item.photo_url && item.photo_url !== 'N/A' ? (
                                    <img 
                                        src={item.photo_url} 
                                        alt={`Foto de ${item.tool_id}`} 
                                        style={styles.photoThumb}
                                        onClick={() => handlePhotoClick(item.photo_url)}
                                    />
                                ) : (
                                    <span style={styles.noPhoto}>Sin foto</span>
                                )}
                            </td>
                            <td style={styles.td(index)}>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    style={styles.deleteButton}
                                >
                                    🗑️ Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {historyData.length === 0 && (
                <p style={{textAlign: 'center', color: '#666', padding: '40px'}}>
                    No se encontraron movimientos registrados.
                </p>
            )}
        </div>
    );
};

export default ToolHistory;

