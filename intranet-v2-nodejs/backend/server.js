// backend/server.js

// 🛑 1. IMPORTACIONES Y CONFIGURACIÓN INICIAL
// require('dotenv').config(); // COMENTADO: Desactivamos la carga del .env temporalmente

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); 
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');   
// IMPORTACIONES PARA MAILGUN (COMENTADAS)
// const formData = require('form-data');
// const Mailgun = require('mailgun.js');

const app = express();
const PORT = 8000; 

// Configurar CORS para permitir la conexión desde React (5173)
app.use(cors({
    origin: 'http://localhost:5173' 
}));

// Middleware para manejar datos JSON en las peticiones
app.use(express.json()); 

// --- 2. CONFIGURACIÓN DE CORREO (COMENTADA) ---
/*
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
});
*/

// --- 3. FUNCIÓN DE ENVÍO DE OTP (MODIFICADA PARA DEBUG) ---

const sendOTPByEmail = async (email, otpCode) => {
    // 🛑 MODO DEBUG: Se muestra el OTP en la terminal para que puedas iniciar sesión.
    console.log(`\n======================================================`);
    console.log(`[🔴 MODO DEBUG] Envío de email deshabilitado.`);
    console.log(`🔑 OTP generado para ${email}: ${otpCode}`);
    console.log(`======================================================\n`);
    
    return false; // Falso porque el envío real está deshabilitado
};

// 4. CONEXIÓN A LA DB (Sección Corregida y Añadida la tabla tool_history)
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error abriendo la base de datos:', err.message);
    } else {
        console.log('✅ Conexión a SQLite exitosa.');
        
        // LÓGICA DE CREACIÓN/MODIFICACIÓN DE TABLAS
        db.serialize(() => {
            
            // SENTENCIA CREATE TABLE: Asegura que la columna 'role' exista en users
            db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, otp TEXT, role TEXT DEFAULT 'employee')`, (createErr) => {
                if (createErr) {
                    console.error('Error al crear tabla users:', createErr.message);
                } else {
                    // Si la tabla se creó con éxito, inserta un usuario de prueba (Admin)
                    const adminEmail = 'admin@optimacom.com';
                    const adminPassword = 'admin'; 
                    bcrypt.hash(adminPassword, 10, (hashErr, hashedPassword) => {
                        if (hashErr) return console.error("Error al hashear admin pass:", hashErr.message);
                        db.run(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, 'admin')`, 
                            ['Admin', adminEmail, hashedPassword], 
                            function(insertErr) {
                                if (insertErr && !insertErr.message.includes('UNIQUE constraint failed')) {
                                    console.error('Error al insertar Admin:', insertErr.message);
                                } else if (this.changes > 0) {
                                    console.log('✅ Usuario Administrador de prueba insertado.');
                                }
                            }
                        );
                    });
                }
            });

            // SENTENCIA ALTER TABLE: Intenta añadir la columna 'role' si no existe
            db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'employee'`, (alterErr) => {
                if (alterErr && !alterErr.message.includes('duplicate column name')) {
                    console.error("Error al añadir la columna 'role':", alterErr.message);
                } else if (!alterErr) {
                    console.log("✅ Columna 'role' añadida a la tabla 'users'.");
                }
            });
            
            // 🛑 NUEVA SENTENCIA CREATE TABLE para el Historial de Herramientas
            db.run(`CREATE TABLE IF NOT EXISTS tool_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                tool_id TEXT NOT NULL, 
                technician_email TEXT NOT NULL, 
                action TEXT NOT NULL,         -- Préstamo o Devolución
                condition TEXT,               -- Buen estado, Daño menor, Dañada
                photo_url TEXT,               -- URL de la fotografía
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP 
            )`, (createErr) => {
                if (createErr) {
                    console.error('Error al crear tabla tool_history:', createErr.message);
                } else {
                    console.log('✅ Tabla tool_history creada (o ya existe).');
                }
            });
            
        }); // Fin db.serialize()
        
    }
}); 


// 5. DEFINICIÓN DE RUTAS

app.get('/api/test', (req, res) => {
    res.json({ message: 'Conexión Backend OK!' });
});


// 🚨 RUTA 2: LOGIN (Verifica contraseña, genera OTP y Llama a la función DEBUG)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error("SQLite error:", err.message);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        if (!user) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos.' });
        }

        // Comparar la contraseña hasheada
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Usuario o contraseña incorrectos.' });
        }

        // Generar un OTP de 6 dígitos
        const otp = crypto.randomInt(100000, 999999).toString();
        
        // Guardar el OTP en la base de datos
        db.run('UPDATE users SET otp = ? WHERE id = ?', [otp, user.id], async function(updateErr) {
            if (updateErr) {
                console.error("SQLite update error:", updateErr.message);
                return res.status(500).json({ error: 'Error al generar OTP.' });
            }

            // LLAMADA A LA FUNCIÓN DE DEBUG
            const emailSent = await sendOTPByEmail(email, otp);

            if (!emailSent) {
                console.warn(`[⚠️ WARN] Falló el "envío" de email a ${email}. Usar OTP de la consola.`);
            }

            // DEVOLVER RESPUESTA AL CLIENTE
            res.json({ 
                message: 'OTP generado. Revisa la terminal del backend para el código.', 
                userRole: user.role, // Clave para el Frontend
                emailStatus: emailSent ? 'Enviado' : 'Fallo'
            });
        });
    });
});


// 🚨 RUTA 3: VERIFICACIÓN OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    db.get('SELECT id, username, email, otp, role FROM users WHERE email = ? AND otp = ?', [email, otp], (err, user) => {
        if (err) {
            console.error("SQLite error:", err.message);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        
        if (!user) {
            return res.status(401).json({ error: 'OTP inválido o expirado.' });
        }

        // OTP Correcto: Limpiar el campo OTP en la DB
        db.run('UPDATE users SET otp = NULL WHERE id = ?', [user.id]);
        
        // Devolver los datos del usuario + ROL
        res.json({ 
            message: 'Verificación exitosa.',
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    });
});

// 🛡️ RUTA 4: RUTA PROTEGIDA DE ADMINISTRACIÓN (/api/admin/create-user)
app.post('/api/admin/create-user', async (req, res) => {
    // CLAVE 1: Desestructurar el campo newRole del cuerpo de la solicitud (req.body)
    const { newUsername, newEmail, newPassword, adminEmail, newRole } = req.body;
    
    // Paso 1: Verificar el Rol del Solicitante (el Admin logueado)
    db.get("SELECT role FROM users WHERE email = ?", [adminEmail], async (err, adminUser) => {
        if (err) {
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }
        
        // VERIFICACIÓN DE ROL: Si no es admin, denegar acceso.
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
        }
        
        // Validar que se haya enviado el rol
        if (!newRole) {
            return res.status(400).json({ error: 'El rol del nuevo usuario es obligatorio.' });
        }

        // Paso 2: El solicitante es Admin. Proceder a crear el nuevo usuario.
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // CLAVE 2: Usar el valor de newRole en la sentencia INSERT
            db.run("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
                [newUsername, newEmail, hashedPassword, newRole], // <-- Añadido newRole aquí
                function(insertErr) {
                    if (insertErr) {
                        // Código 400 si el email ya existe
                        if (insertErr.message.includes('UNIQUE constraint failed')) {
                            return res.status(400).json({ error: 'Error al crear empleado: el email ya existe.' });
                        }
                        return res.status(500).json({ error: 'Error al crear el usuario en la DB.' });
                    }
                    res.status(201).json({ 
                        message: `Empleado ${newUsername} creado exitosamente con el rol: ${newRole}.`,
                        userId: this.lastID
                    });
                }
            );
        } catch (hashError) {
            res.status(500).json({ error: 'Error al hashear la contraseña.' });
        }
    });
});

// ⚙️ RUTA 5: REGISTRO DE ACCIÓN DE HERRAMIENTAS (Préstamo/Devolución)
app.post('/api/tools/register-action', (req, res) => {
    const { toolId, technicianEmail, action, condition, photoUrl } = req.body;
    
    // Validaciones básicas
    if (!toolId || !technicianEmail || !action) {
        return res.status(400).json({ error: "Faltan campos obligatorios (toolId, technicianEmail, action)." });
    }

    // GUARDAR EL REGISTRO EN LA TABLA TOOL_HISTORY
    db.run(
        "INSERT INTO tool_history (tool_id, technician_email, action, condition, photo_url) VALUES (?, ?, ?, ?, ?)",
        [toolId, technicianEmail, action, condition, photoUrl],
        function(insertErr) {
            if (insertErr) {
                console.error("SQLite insert error:", insertErr.message);
                return res.status(500).json({ error: 'Error al registrar la acción de la herramienta.' });
            }
            res.status(201).json({ 
                message: `Acción '${action}' registrada para ${toolId} por ${technicianEmail}.`,
                historyId: this.lastID
            });
        }
    );
});


// 6. Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
