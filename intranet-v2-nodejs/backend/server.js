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
    'http://192.168.2.6:5173'
  ]
}));

// JSON para application/json
app.use(express.json());

// =================================================================
// ARCHIVOS ESTÁTICOS (fotos, PDFs, etc.)
// =================================================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =================================================================
// MULTER PARA FOTOS DE HERRAMIENTAS
// =================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads', 'tools')); // /uploads/tools
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `tool-${unique}${ext}`);
  },
});
const upload = multer({ storage });

// =================================================================
// MULTER PARA PDFs DE INCAPACIDADES
// =================================================================
const incapStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads', 'incapacities')); // /uploads/incapacities
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `incap-${unique}${ext}`);
  },
});
const uploadIncap = multer({
  storage: incapStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Solo se permiten archivos PDF'));
    }
    cb(null, true);
  },
});

// --- FUNCIÓN DE ENVÍO DE OTP (DEBUG) ---
const sendOTPByEmail = async (email, otpCode) => {
  console.log(`\n======================================================`);
  console.log(`[🔴 MODO DEBUG] Envío de email deshabilitado.`);
  console.log(`🔑 OTP generado para ${email}: ${otpCode}`);
  console.log(`======================================================\n`);
  return false;
};

// 4. CONEXIÓN A LA DB
const db = new sqlite3.Database(
  './database.sqlite',
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
  if (err) {
    console.error('🚨 ERROR CRÍTICO ABRIENDO DB:', err.message);
  } else {
    console.log('✅ Conexión a SQLite exitosa.');

    db.serialize(() => {
      // USERS
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
                function (insertErr) {
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

      // TOOL HISTORY
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

      // TABLA GENÉRICA DE SOLICITUDES
      db.run(
        `CREATE TABLE IF NOT EXISTS requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,                 -- VACACIONES, CERTIFICADO, NOMINA, PRESTAMO, INCAPACIDAD
          employee_email TEXT NOT NULL,
          employee_name TEXT,
          payload TEXT NOT NULL,              -- JSON con los datos específicos
          status TEXT DEFAULT 'PENDIENTE',    -- PENDIENTE / APROBADA / RECHAZADA
          manager_email TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          decision_at DATETIME
        )`,
        (reqErr) => {
          if (reqErr) {
            console.error('Error al crear tabla requests:', reqErr.message);
          } else {
            console.log('✅ Tabla requests lista.');
          }
        }
      );

      // TABLA DE NOTIFICACIONES
      db.run(
        `CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titulo TEXT,
          mensaje TEXT,
          tipo TEXT,          -- certificado, vacaciones, incapacidad, prestamo, sistema
          paraRol TEXT,       -- RRHH, JEFE, EMPLEADO
          paraUsuarioId INTEGER,
          entidad TEXT,       -- 'request', 'certificado', etc.
          entidadId INTEGER,
          leido INTEGER DEFAULT 0,
          creadoEn DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (nErr) => {
          if (nErr) {
            console.error('Error al crear tabla notifications:', nErr.message);
          } else {
            console.log('✅ Tabla notifications lista.');
          }
        }
      );
    });
  }
});

// =====================================================================
// RUTAS DE NOTIFICACIONES (campanita)
// =====================================================================
const notificacionesRouter = express.Router();

// GET /api/notificaciones?paraRol=RRHH&soloNoLeidas=true
notificacionesRouter.get('/', (req, res) => {
  const { paraRol, soloNoLeidas } = req.query;
  let sql = 'SELECT * FROM notifications WHERE 1=1';
  const params = [];

  if (paraRol) {
    sql += ' AND paraRol = ?';
    params.push(paraRol);
  }
  if (soloNoLeidas === 'true') {
    sql += ' AND leido = 0';
  }

  sql += ' ORDER BY creadoEn DESC LIMIT 20';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener notificaciones:', err.message);
      return res.status(500).json({ error: 'Error al obtener notificaciones.' });
    }
    res.json(rows);
  });
});

// PATCH /api/notificaciones/:id/leida
notificacionesRouter.patch('/:id/leida', (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE notifications SET leido = 1 WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        console.error('Error al marcar notificación como leída:', err.message);
        return res.status(500).json({ error: 'Error al actualizar notificación.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Notificación no encontrada.' });
      }
      res.json({ ok: true });
    }
  );
});

// Montar router
app.use('/api/notificaciones', notificacionesRouter);

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
    db.run('UPDATE users SET otp = ? WHERE id = ?', [otp, user.id], async function (updateErr) {
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
        function (insertErr) {
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

// =====================================================================
// RUTA GENÉRICA PARA CREAR SOLICITUDES
// =====================================================================
app.post('/api/requests', (req, res) => {
  const { type, employeeEmail, employeeName, managerEmail, data } = req.body;

  if (!type || !employeeEmail || !managerEmail || !data) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  const payload = JSON.stringify(data);

  const sql = `
    INSERT INTO requests
    (type, employee_email, employee_name, payload, manager_email)
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [type, employeeEmail, employeeName, payload, managerEmail];

  db.run(sql, params, function (err) {
    if (err) {
      console.error('Error al guardar solicitud:', err.message);
      return res.status(500).json({ error: 'Error al guardar la solicitud.' });
    }

    // Si es un CERTIFICADO, crear notificación para RRHH
    if (type === 'CERTIFICADO') {
      const titulo = 'Nueva solicitud de certificado';
      const mensaje = `El empleado ${employeeName || employeeEmail} solicitó un certificado.`;
      db.run(
        `INSERT INTO notifications (titulo, mensaje, tipo, paraRol, entidad, entidadId)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [titulo, mensaje, 'certificado', 'RRHH', 'request', this.lastID]
      );
    }

    res.status(201).json({
      message: 'Solicitud registrada correctamente.',
      requestId: this.lastID
    });
  });
});

// =====================================================
// RUTA ESPECIAL: INCAPACIDAD CON PDF
// =====================================================
app.post('/api/requests/incapacity', uploadIncap.single('certPdf'), (req, res) => {
  try {
    const { employeeEmail, employeeName, managerEmail, startDate, endDate, diagnosis } = req.body;

    if (!employeeEmail || !managerEmail || !startDate || !endDate) {
      return res.status(400).json({ error: 'Faltan campos obligatorios.' });
    }

    let pdfUrl = null;
    if (req.file) {
      pdfUrl = `/uploads/incapacities/${req.file.filename}`;
    }

    const data = { startDate, endDate, diagnosis, pdfUrl };
    const payload = JSON.stringify(data);

    const sql = `
      INSERT INTO requests
      (type, employee_email, employee_name, payload, manager_email)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = ['INCAPACIDAD', employeeEmail, employeeName, payload, managerEmail];

    db.run(sql, params, function (err) {
      if (err) {
        console.error('Error al guardar incapacidad:', err.message);
        return res.status(500).json({ error: 'Error al guardar la incapacidad.' });
      }

      res.status(201).json({
        message: 'Incapacidad registrada correctamente.',
        requestId: this.lastID,
        pdfUrl,
      });
    });
  } catch (e) {
    console.error('Error en /api/requests/incapacity:', e);
    return res.status(500).json({ error: 'Error interno al registrar la incapacidad.' });
  }
});

// =====================================================================
// LISTAR SOLICITUDES
// =====================================================================
app.get('/api/requests', (req, res) => {
  const {
    status,
    managerEmail,
    employeeEmail,
    startDate,
    endDate,
    requestType,
  } = req.query;

  let sql = 'SELECT * FROM requests';
  const params = [];
  const conditions = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  if (managerEmail) {
    conditions.push('manager_email = ?');
    params.push(managerEmail);
  }
  if (employeeEmail) {
    conditions.push('employee_email = ?');
    params.push(employeeEmail);
  }
  if (requestType) {
    conditions.push('type = ?');
    params.push(requestType);
  }
  if (startDate && endDate) {
    conditions.push('date(created_at) BETWEEN date(?) AND date(?)');
    params.push(startDate, endDate);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener solicitudes:', err.message);
      return res.status(500).json({ error: 'Error al obtener solicitudes.' });
    }
    res.json({ requests: rows });
  });
});

// =====================================================================
// ENDPOINT: DECISIÓN DEL MANAGER
// =====================================================================
app.post('/api/requests/:id/decision', (req, res) => {
  const { id } = req.params;
  const { status, managerComment } = req.body;

  if (!status || !['APROBADA', 'RECHAZADA'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido. Use APROBADA o RECHAZADA.' });
  }

  db.get('SELECT payload FROM requests WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error al obtener solicitud para decisión:', err.message);
      return res.status(500).json({ error: 'Error al obtener la solicitud.' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Solicitud no encontrada.' });
    }

    let payload = {};
    try {
      payload = JSON.parse(row.payload || '{}');
    } catch {
      payload = {};
    }

    payload.managerComment = managerComment || '';
    const newPayload = JSON.stringify(payload);
    const now = new Date().toISOString();

    const sql = `
      UPDATE requests
      SET status = ?, payload = ?, decision_at = ?
      WHERE id = ?
    `;
    const params = [status, newPayload, now, id];

    db.run(sql, params, function (updateErr) {
      if (updateErr) {
        console.error('Error al actualizar decisión:', updateErr.message);
        return res.status(500).json({ error: 'Error al actualizar la decisión.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Solicitud no encontrada para actualización.' });
      }

      res.json({
        message: `Solicitud ${id} actualizada a estado ${status}.`,
        id,
        status,
        managerComment: payload.managerComment,
        decisionAt: now,
      });
    });
  });
});

// =====================================================================
// RUTAS PARA HERRAMIENTAS
// =====================================================================

app.post('/api/tools/register-action', upload.single('photo'), (req, res) => {
  try {
    const { toolId, technicianEmail, action, condition, technicianName, datetime } = req.body;

    if (!toolId || !technicianEmail || !action) {
      return res.status(400).json({ error: "Faltan campos obligatorios (toolId, technicianEmail, action)." });
    }

    let photoUrl = 'N/A';
    if (req.file) {
      photoUrl = `/uploads/tools/${req.file.filename}`;
    }

    db.run(
      "INSERT INTO tool_history (tool_id, technician_email, technician_name, action, condition, photo_url) VALUES (?, ?, ?, ?, ?, ?)",
      [toolId, technicianEmail, technicianName, action, condition, photoUrl],
      function (insertErr) {
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

app.delete('/api/tools/delete-action/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM tool_history WHERE id = ?`;
  db.run(sql, id, function (err) {
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
  console.log(`🚀 Backend corriendo y accesible desde la red en: http://192.168.2.6:${PORT}`);
});





