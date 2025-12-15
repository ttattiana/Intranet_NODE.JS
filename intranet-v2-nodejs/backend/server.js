// backend/server.js

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); 
const bcrypt = require('bcryptjs'); 
const crypto = require('crypto');   
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 8000; 

// =================================================================
// CORS
// =================================================================
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.0.29:5173'
  ]
}));

// ✅ JSON solo para rutas que reciben application/json
app.use(express.json());

// =================================================================
// ARCHIVOS ESTÁTICOS (fotos de herramientas)
// =================================================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =================================================================
// CONFIGURACIÓN MULTER PARA FOTOS DE HERRAMIENTAS
// =================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads', 'tools')); // crea /uploads/tools
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `tool-${unique}${ext}`);
  },
});
const upload = multer({ storage });

// --- 3. FUNCIÓN DE ENVÍO DE OTP (DEBUG) ---
const sendOTPByEmail = async (email, otpCode) => {
  console.log(`\n======================================================`);
  console.log(`[🔴 MODO DEBUG] Envío de email deshabilitado.`);
  console.log(`🔑 OTP generado para ${email}: ${otpCode}`);
  console.log(`======================================================\n`);
  return false;
};

// 4. CONEXIÓN A LA DB
const db = new sqlite3.Database('./database.sqlite', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('🚨 ERROR CRÍTICO ABRIENDO DB:', err.message);
  } else {
    console.log('✅ Conexión a SQLite exitosa.');
    
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          otp TEXT,
          role TEXT DEFAULT 'employee'
        )`,
        (createErr) => {
          if (createErr) {
            console.error('Error al crear tabla users:', createErr.message);
          } else {
            const adminEmail = 'admin@optimacom.com';
            const adminPassword = 'admin'; 
            bcrypt.hash(adminPassword, 10, (hashErr, hashedPassword) => {
              if (hashErr) return console.error("Error al hashear admin pass:", hashErr.message);
              db.run(
                `INSERT OR IGNORE INTO users (username, email, password, role)
                 VALUES (?, ?, ?, 'admin')`,
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
        }
      );

      db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'employee'`, (alterErr) => {
        if (alterErr && !alterErr.message.includes('duplicate column name')) {
          console.error("Error al añadir la columna 'role':", alterErr.message);
        }
      });

      db.run(
        `CREATE TABLE IF NOT EXISTS tool_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tool_id TEXT NOT NULL,
          technician_email TEXT NOT NULL,
          technician_name TEXT,
          action TEXT NOT NULL,
          condition TEXT,
          photo_url TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (createErr) => {
          if (createErr) {
            console.error('Error al crear tabla tool_history:', createErr.message);
          } else {
            console.log('✅ Tabla tool_history creada (o ya existe).');
          }
        }
      );

      db.run("ALTER TABLE tool_history ADD COLUMN technician_name TEXT", (alterErr) => {
        if (alterErr && !alterErr.message.includes("duplicate column name")) {
          console.error("Error al intentar añadir la columna technician_name:", alterErr.message);
        }
      });

      db.run("ALTER TABLE tool_history ADD COLUMN timestamp DATETIME DEFAULT CURRENT_TIMESTAMP", (alterErr) => {
        if (alterErr && !alterErr.message.includes("duplicate column name")) {
          console.error("Error al intentar añadir la columna timestamp:", alterErr.message);
        }
      });
    });
  }
});

// 5. RUTAS BÁSICAS
app.get('/api/test', (req, res) => {
  res.json({ message: 'Conexión Backend OK!' });
});

// LOGIN
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    db.run('UPDATE users SET otp = ? WHERE id = ?', [otp, user.id], async function(updateErr) {
      if (updateErr) {
        console.error("SQLite update error:", updateErr.message);
        return res.status(500).json({ error: 'Error al generar OTP.' });
      }

      const emailSent = await sendOTPByEmail(email, otp);
      if (!emailSent) {
        console.warn(`[⚠️ WARN] Falló el "envío" de email a ${email}. Usar OTP de la consola.`);
      }

      res.json({ 
        message: 'OTP generado. Revisa la terminal del backend para el código.', 
        userRole: user.role,
        emailStatus: emailSent ? 'Enviado' : 'Fallo'
      });
    });
  });
});

// VERIFICAR OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  db.get(
    'SELECT id, username, email, otp, role FROM users WHERE email = ? AND otp = ?',
    [email, otp],
    (err, user) => {
      if (err) {
        console.error("SQLite error:", err.message);
        return res.status(500).json({ error: 'Error interno del servidor.' });
      }
      if (!user) {
        return res.status(401).json({ error: 'OTP inválido o expirado.' });
      }

      db.run('UPDATE users SET otp = NULL WHERE id = ?', [user.id]);
      res.json({ 
        message: 'Verificación exitosa.',
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    }
  );
});

// CREAR USUARIO (ADMIN)
app.post('/api/admin/create-user', async (req, res) => {
  const { newUsername, newEmail, newPassword, adminEmail, newRole } = req.body;
  db.get("SELECT role FROM users WHERE email = ?", [adminEmail], async (err, adminUser) => {
    if (err) {
      return res.status(500).json({ error: 'Error interno del servidor.' });
    }
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    if (!newRole) {
      return res.status(400).json({ error: 'El rol del nuevo usuario es obligatorio.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
        [newUsername, newEmail, hashedPassword, newRole],
        function(insertErr) {
          if (insertErr) {
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

// ⚙️ REGISTRO DE ACCIÓN DE HERRAMIENTAS (Préstamo/Devolución) CON FOTO
app.post('/api/tools/register-action', upload.single('photo'), (req, res) => {
  try {
    // Ahora req.body viene de multipart/form-data
    const { toolId, technicianEmail, action, condition, technicianName, datetime } = req.body;

    if (!toolId || !technicianEmail || !action) {
      return res.status(400).json({ error: "Faltan campos obligatorios (toolId, technicianEmail, action)." });
    }

    // Construir URL de la foto si se subió archivo
    let photoUrl = 'N/A';
    if (req.file) {
      photoUrl = `http://192.168.0.29:${PORT}/uploads/tools/${req.file.filename}`;
    }

    // Si quieres guardar datetime manualmente, ajusta la query (aquí usamos timestamp por defecto)
    db.run(
      "INSERT INTO tool_history (tool_id, technician_email, technician_name, action, condition, photo_url) VALUES (?, ?, ?, ?, ?, ?)",
      [toolId, technicianEmail, technicianName, action, condition, photoUrl],
      function(insertErr) {
        if (insertErr) {
          console.error("SQLite insert error:", insertErr.message);
          return res.status(500).json({ error: 'Error al registrar la acción de la herramienta.' });
        }
        res.status(201).json({ 
          message: `Acción '${action}' registrada para ${toolId} por ${technicianName}.`,
          historyId: this.lastID,
          photoUrl,
        });
      }
    );
  } catch (err) {
    console.error('Error en /api/tools/register-action:', err);
    return res.status(500).json({ error: 'Error interno al registrar la acción.' });
  }
});

// OBTENER HISTORIAL
app.get('/api/tools/history', (req, res) => {
  console.log("--> Iniciando PRUEBA DE CONEXIÓN...");
  db.get("SELECT COUNT(*) AS total FROM tool_history", [], (err, row) => {
    if (err) {
      console.error("🚨 FALLA CRÍTICA SQLITE (COUNT):", err.message);
      return res.status(500).json({ error: 'Error de conexión de prueba simple.' });
    }

    console.log(`✅ PRUEBA DE CONEXIÓN EXITOSA. Total de registros: ${row.total}`);
    db.all("SELECT * FROM tool_history ORDER BY timestamp DESC", [], (errFinal, rows) => {
      if (errFinal) {
        console.error("🚨 FALLA CONSULTA REAL SQLITE:", errFinal.message);
        return res.status(500).json({ error: 'Error al obtener el historial de herramientas.' });
      }
      console.log(`✅ CONSULTA REAL EXITOSA. Filas devueltas: ${rows.length}`);
      res.json({ 
        message: 'Historial obtenido exitosamente.',
        history: rows
      });
    });
  });
});

// ELIMINAR REGISTRO
app.delete('/api/tools/delete-action/:id', (req, res) => {
  const { id } = req.params; 
  const sql = `DELETE FROM tool_history WHERE id = ?`;
  db.run(sql, id, function(err) {
    if (err) {
      console.error('Error al intentar eliminar el registro:', err.message);
      return res.status(500).json({ error: 'Error al eliminar el registro de la base de datos.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: `Movimiento con ID ${id} no encontrado.` });
    }
    console.log(`Registro de movimiento ${id} eliminado con éxito.`);
    res.json({ message: `Movimiento ${id} eliminado con éxito.`, deletedId: id });
  });
});

// 6. Iniciar el servidor
app.listen(PORT, '0.0.0.0', () => { 
  console.log(`🚀 Backend corriendo y accesible desde la red en: http://192.168.0.29:${PORT}`);
});
