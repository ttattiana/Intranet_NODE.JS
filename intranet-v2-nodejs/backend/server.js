const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) return console.error('Error:', err.message);
  console.log('✅ Conectado a la base de datos.');

  db.serialize(() => {
    // Asegurar columna otp (para bases ya creadas sin esta columna)
    db.run(`ALTER TABLE usuarios ADD COLUMN otp TEXT`, (err) => {
      if (!err) {
        console.log('✅ Columna otp agregada a usuarios.');
      }
    });

    // 1. Tabla Usuario
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cedula TEXT,
      nombre_completo TEXT,
      cargo TEXT,
      jefe_directo TEXT,
      telefono TEXT,
      correo TEXT UNIQUE,
      pais TEXT,
      fecha_ingreso TEXT,
      contrasena TEXT,
      rol TEXT,
      otp TEXT
    )`);

    // 2. Tabla Vacaciones
    db.run(`CREATE TABLE IF NOT EXISTS vacaciones (
      id_solicitud INTEGER PRIMARY KEY AUTOINCREMENT,
      id_solicitante INTEGER,
      motivo_solicitud TEXT,
      fecha_solicitud TEXT,
      fecha_propuesta_empleado TEXT,
      fecha_propuesta_superior TEXT,
      estado TEXT DEFAULT 'PENDIENTE',
      aprobado_por TEXT
    )`);

    // 3. Tabla Certificados
    db.run(`CREATE TABLE IF NOT EXISTS certificados (
      id_solicitud INTEGER PRIMARY KEY AUTOINCREMENT,
      id_solicitante INTEGER,
      motivo_solicitud TEXT,
      tipo_certificado TEXT,
      fecha_solicitud TEXT,
      estado TEXT DEFAULT 'PENDIENTE',
      aprobado_por TEXT,
      subido_sistema_por TEXT,
      fecha_subida_sistema TEXT,
      fecha_descarga_empleado TEXT
    )`);

    // 4. Tabla Nomina
    db.run(`CREATE TABLE IF NOT EXISTS nomina (
      id_solicitud INTEGER PRIMARY KEY AUTOINCREMENT,
      id_solicitante INTEGER,
      motivo_solicitud TEXT,
      fecha_solicitud TEXT,
      fecha_rango_nomina TEXT,
      estado TEXT DEFAULT 'PENDIENTE',
      aprobado_por TEXT,
      subido_sistema_por TEXT,
      fecha_subida_sistema TEXT,
      fecha_descarga_empleado TEXT
    )`);

    // 5. Tabla Préstamos
    db.run(`CREATE TABLE IF NOT EXISTS prestamos (
      id_solicitud INTEGER PRIMARY KEY AUTOINCREMENT,
      id_solicitante INTEGER,
      motivo_solicitud TEXT,
      fecha_solicitud TEXT,
      monto_solicitado REAL,
      estado TEXT DEFAULT 'PENDIENTE',
      aprobado_por TEXT,
      monto_aprobado REAL,
      fecha_transaccion TEXT,
      forma_devolucion TEXT,
      fecha_devolucion TEXT
    )`);

    // 6. Tabla Incapacidades
    db.run(`CREATE TABLE IF NOT EXISTS incapacidades (
      id_solicitud INTEGER PRIMARY KEY AUTOINCREMENT,
      id_solicitante INTEGER,
      motivo_incapacidad TEXT,
      fecha_solicitud TEXT,
      fecha_inicio TEXT,
      fecha_fin TEXT,
      comprobante_url TEXT,
      estado TEXT DEFAULT 'PENDIENTE',
      aprobado_por TEXT
    )`);

    // (Opcional) CREACIÓN AUTOMÁTICA DEL USUARIO ADMIN POR DEFECTO
    // Si no lo quieres, puedes comentar todo este bloque.
    bcrypt.hash('admin', 10, (err, hash) => {
      if (err) {
        console.error('Error al hashear la contraseña del admin:', err);
        return;
      }

      db.run(
        `INSERT OR REPLACE INTO usuarios (
           id,
           cedula,
           nombre_completo,
           cargo,
           jefe_directo,
           telefono,
           correo,
           pais,
           fecha_ingreso,
           contrasena,
           rol
         )
         VALUES (
           1,
           '0000000000',
           'Admin Optimacom',
           'Jefe de Sistemas',
           'N/A',
           '0000000000',
           'prueba1@ejemplo.com',
           'Colombia',
           NULL,
           ?,
           'admin'
         )`,
        [hash],
        (err) => {
          if (!err) {
            console.log('\n🚀 USUARIO LISTO: prueba1@ejemplo.com / admin\n');
          } else {
            console.error('Error creando usuario por defecto:', err.message);
          }
        }
      );
    });
  });
});

// LOGIN RUTA
app.post('/api/login', (req, res) => {
  const { correo, contrasena } = req.body;

  db.get('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Error en base de datos.' });
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado.' });

    const match = await bcrypt.compare(contrasena, user.contrasena);
    if (!match) return res.status(400).json({ error: 'Contraseña incorrecta.' });

    const otp = crypto.randomInt(100000, 999999).toString();
    db.run('UPDATE usuarios SET otp = ? WHERE id = ?', [otp, user.id]);
    console.log(`\n🔑 CÓDIGO OTP PARA ${correo}: ${otp}\n`);

    res.json({ message: 'OTP enviado' });
  });
});

// VERIFICAR OTP
app.post('/api/verify-otp', (req, res) => {
  const { correo, otp } = req.body;

  db.get(
    'SELECT * FROM usuarios WHERE correo = ? AND otp = ?',
    [correo, otp],
    (err, user) => {
      if (err || !user) return res.status(401).json({ error: 'OTP incorrecto' });
      res.json({ user });
    }
  );
});

// CREAR USUARIO DESDE PANEL DE ADMINISTRACIÓN
app.post('/api/admin/create-user', (req, res) => {
  const {
    cedula,
    nombre_completo,
    cargo,
    jefe_directo,
    telefono,
    correo,
    pais,
    fecha_ingreso,
    contrasena,
    rol,
  } = req.body;

  // Aquí podrías validar que quien llama sea admin (por token/correo)

  bcrypt.hash(contrasena, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Error al encriptar contraseña.' });

    db.run(
      `INSERT INTO usuarios (
         cedula,
         nombre_completo,
         cargo,
         jefe_directo,
         telefono,
         correo,
         pais,
         fecha_ingreso,
         contrasena,
         rol
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cedula,
        nombre_completo,
        cargo,
        jefe_directo,
        telefono,
        correo,
        pais,
        fecha_ingreso || null,
        hash,
        rol,
      ],
      (err) => {
        if (err) {
          console.error('Error al crear usuario:', err.message);
          return res
            .status(400)
            .json({ error: 'No se pudo crear el usuario (correo o cédula pueden estar repetidos).' });
        }
        res.json({ message: 'Usuario creado exitosamente.' });
      }
    );
  });
});

app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 Servidor en puerto ${PORT}`)
);
