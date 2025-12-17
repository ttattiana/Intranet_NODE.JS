// frontend/src/Components/LoginOTP.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../LoginStyles.css';

// 🛑 CAMBIO: Usamos localhost para coincidir con el servidor
const API_BASE = 'http://localhost:8000/api';

const LoginOTP = () => {
    const [step, setStep] = useState('login'); 
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
            // 🛑 CAMBIO CLAVE: Enviamos 'correo' y 'contrasena' para que el backend lo entienda
            const response = await axios.post(`${API_BASE}/login`, {
                correo: form.email,
                contrasena: form.password,
            });

            localStorage.setItem('userEmail', form.email);
            setMessage('✅ OTP generado. Revisa la consola de VS Code en el Backend.');
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
            // 🛑 CAMBIO CLAVE: Enviamos 'correo' en lugar de 'email'
            const res = await axios.post(`${API_BASE}/verify-otp`, {
                correo: form.email,
                otp,
            });

            const user = res.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard'); 
            
        } catch (error) {
            const errMsg = error.response?.data?.error || 'OTP inválido.';
            setMessage(`❌ Error: ${errMsg}`);
        }
    };

    return (
        <div className="login-container"> 
            <div className="login-card"> 
                <img src="/logo.jpg" alt="Logo" className="login-logo" />
                <h2 style={{ textAlign: 'center', marginBottom: 20, color: '#333' }}>
                    {step === 'login' ? 'Iniciar Sesión' : 'Verificación OTP'}
                </h2>

                {step === 'login' && (
                    <form onSubmit={handleLogin}>
                        <input name="email" type="email" placeholder="Correo Electrónico" value={form.email} onChange={handleChange} required />
                        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
                        <button type="submit">Enviar OTP</button>
                    </form>
                )}

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