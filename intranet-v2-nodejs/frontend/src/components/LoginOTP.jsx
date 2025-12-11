// frontend/src/Components/LoginOTP.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../LoginStyles.css';

// API_BASE apunta a tu backend de Node.js/Express
const API_BASE = 'http://127.0.0.1:8000/api';

const LoginOTP = () => {
    // 🛑 CAMBIO CLAVE: Empezamos directamente en 'login' y eliminamos 'register'
    const [step, setStep] = useState('login'); // login -> otp
    // Eliminamos 'username' ya que solo se usa en el registro público
    const [form, setForm] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            // El backend ahora devuelve el rol del usuario para usarlo después de la verificación OTP
            const response = await axios.post(`${API_BASE}/login`, {
                email: form.email,
                password: form.password,
            });

            // 🛑 Guardar el email en local storage para usarlo en la verificación de rol
            localStorage.setItem('userEmail', form.email);
            // Guardar el rol temporalmente para la redirección después de la verificación
            localStorage.setItem('userRole', response.data.userRole);

            setMessage('✅ OTP generado. Ingresa el código (revisa tu correo electrónico registrado).');
            setStep('otp');

        } catch (error) {
            const errMsg = error.response?.data?.error || 'Error desconocido en login.';
            setMessage(`❌ Error en login: ${errMsg}`);
        }
    };


    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post(`${API_BASE}/verify-otp`, {
                email: form.email,
                otp,
            });

            // El backend devuelve el objeto user, que ahora incluye el rol
            const user = res.data.user;
            
            // Guardar información del usuario
            localStorage.setItem('user', JSON.stringify(user));
            
            // 🛑 CAMBIO DE REDIRECCIÓN CLAVE: Redirigir siempre a /dashboard
            navigate('/dashboard'); 
            
        } catch (error) {
            const errMsg = error.response?.data?.error || 'OTP inválido.';
            setMessage(`❌ Error: ${errMsg}`);
        }
    };


    // --- Renderizado del Componente ---

    return (
        // 👈 Clase CSS para el fondo, centrado y 100% de la pantalla
        <div className="login-container"> 
            {/* 👈 Clase CSS para la tarjeta con sombra y bordes redondeados */}
            <div className="login-card"> 
                <img 
                    src="/logo.jpg" 
                    alt="Logo de la Empresa" 
                    className="login-logo" 
                />
                <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#333' }}>
                    {/* 🛑 Título solo para Login o Verificación */}
                    {step === 'login' ? 'Iniciar Sesión' : 'Verificación OTP'}
                </h2>

                {/* Formulario de Login */}
                {step === 'login' && (
                    <form onSubmit={handleLogin}>
                        <input name="email" type="email" placeholder="Correo Electrónico" value={form.email} onChange={handleChange} required />
                        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
                        <button type="submit">Enviar OTP</button>
                    </form>
                )}

                {/* Formulario de Verificación OTP */}
                {step === 'otp' && (
                    <form onSubmit={handleVerify}>
                        <input type="text" placeholder="Código OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        <button type="submit">Verificar</button>
                    </form>
                )}

                {message && <p style={{ marginTop: 15, fontSize: 14, textAlign: 'center', color: message.startsWith('❌') ? 'red' : 'green' }}>{message}</p>}
            </div>
        </div>
    );
};

export default LoginOTP;