// frontend/src/components/ToolReports.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

const ToolReports = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchToolReports();
    }, []);

    const fetchToolReports = async () => {
        setLoading(true);
        setError(null);
        try {
            // 🛑 Llama al endpoint de reportes del backend (asumiendo que existe o se creará)
            // Este endpoint debe retornar el estado actual de todas las herramientas.
            const response = await axios.get(`${API_BASE}/tools/reports/summary`);
            setReportData(response.data);
            
        } catch (err) {
            console.error("Error fetching tool reports:", err);
            // Simulación de datos en caso de error de conexión (para desarrollo)
            setError("Error al conectar con el backend. Mostrando datos de prueba.");
            setReportData(mockReportData); 
        } finally {
            setLoading(false);
        }
    };
    
    // Datos de ejemplo para desarrollo/pruebas
    const mockReportData = [
        { id: 'LLAVE-10', name: 'Llave Inglesa 10mm', status: 'Prestada', loanedTo: 'jorge.a@optima.com', lastActionDate: '2025-11-20' },
        { id: 'TALADRO-03', name: 'Taladro Percutor', status: 'Disponible', loanedTo: 'N/A', lastActionDate: '2025-11-21' },
        { id: 'MARTILLO-01', name: 'Martillo de uña', status: 'En Mantenimiento', loanedTo: 'N/A', lastActionDate: '2025-11-15' },
        { id: 'METRO-15', name: 'Cinta Métrica 15m', status: 'Prestada', loanedTo: 'laura.g@optima.com', lastActionDate: '2025-12-01' },
        { id: 'GUANTES-50', name: 'Guantes de Seguridad', status: 'Disponible', loanedTo: 'N/A', lastActionDate: '2025-12-09' },
    ];


    const styles = {
        container: { maxWidth: '1200px', margin: '20px auto', padding: '30px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
        th: { border: '1px solid #ddd', padding: '12px', backgroundColor: '#34495e', color: 'white', textAlign: 'left' },
        td: { border: '1px solid #ddd', padding: '12px', textAlign: 'left' },
        statusAvailable: { backgroundColor: '#e6ffe6', color: '#28a745', fontWeight: 'bold' },
        statusLoaned: { backgroundColor: '#fff0e6', color: '#ff7f00', fontWeight: 'bold' },
        statusMaint: { backgroundColor: '#f0f0f5', color: '#34495e', fontWeight: 'bold' },
        header: { marginBottom: '25px', borderBottom: '2px solid #007bff', paddingBottom: '10px' },
        loading: { color: '#007bff', textAlign: 'center' },
        error: { color: 'red', marginBottom: '15px', fontWeight: 'bold' }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Disponible':
                return styles.statusAvailable;
            case 'Prestada':
                return styles.statusLoaned;
            case 'En Mantenimiento':
                return styles.statusMaint;
            default:
                return {};
        }
    };

    if (loading && !reportData) {
        return <div style={styles.loading}>Cargando reportes de herramientas...</div>;
    }

    return (
        <div style={styles.container}>
            <h3 style={styles.header}>📈 Reportes de Estado de Inventario</h3>
            
            {error && <p style={styles.error}>{error}</p>}

            {reportData && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Estado Actual</th>
                            <th style={styles.th}>Prestada a (Email)</th>
                            <th style={styles.th}>Última Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((item) => (
                            <tr key={item.id}>
                                <td style={styles.td}>{item.id}</td>
                                <td style={styles.td}>{item.name}</td>
                                <td style={{ ...styles.td, ...getStatusStyle(item.status) }}>{item.status}</td>
                                <td style={styles.td}>{item.loanedTo}</td>
                                <td style={styles.td}>{item.lastActionDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
            {reportData && reportData.length === 0 && (
                <p>No se encontraron herramientas registradas en el inventario.</p>
            )}
        </div>
    );
};

export default ToolReports;