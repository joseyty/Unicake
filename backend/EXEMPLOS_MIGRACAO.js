// ============================================
// EXEMPLOS DE MIGRAÇÃO - De Inseguro para Seguro
// ============================================

// ============================================
// 1. ADMINISTRADOR - ANTES vs DEPOIS
// ============================================

// ❌ ANTES (AdminLogin.js - INSEGURO):
/*
async function handleLogin(e) {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  const hashedPassword = await hashPassword(password);
  const expectedHash = await hashPassword('admin123'); // SENHA HARDCODEADA!
  
  if (email === 'Adsensemir4#@autonance.com' && hashedPassword === expectedHash) {
    localStorage.setItem('ADMIN_AUTH_KEY', JSON.stringify({logged: true})); // localStorage!
    window.location.href = 'AdminPainel.html';
  }
}
*/

// ✅ DEPOIS (AdminLogin.js - SEGURO):
async function handleLogin(e) {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      showToast('Email ou senha incorretos');
      return;
    }

    const data = await response.json();
    
    // Armazenar JWT (não senha!)
    localStorage.setItem('admin_token', data.token);
    
    // Salvar dados não sensíveis
    localStorage.setItem('admin_user', JSON.stringify(data.user));
    
    showToast('Login realizado com sucesso!', 'success');
    setTimeout(() => {
      window.location.href = 'AdminPainel.html';
    }, 1000);

  } catch (error) {
    showToast('Erro ao fazer login');
    console.error(error);
  }
}

// ============================================
// 2. CHAT - ANTES vs DEPOIS
// ============================================

// ❌ ANTES (sql vulnerável):
/*
const query = `
  INSERT INTO chat_messages (user_name, user_email, message, status)
  VALUES ('${user_name}', '${user_email}', '${message}', 'pendente')
`;
db.query(query, (err, result) => { ... });
*/

// ✅ DEPOIS (com prepared statement):
async function saveChatMessage(user_name, user_email, message) {
  const connection = await pool.getConnection();
  
  try {
    // Sanitizar entrada
    const sanitizedName = sanitizeInput(user_name) || 'Visitante';
    const sanitizedEmail = user_email ? sanitizeInput(user_email) : null;
    const sanitizedMessage = sanitizeInput(message);
    
    // Validar
    if (sanitizedMessage.length === 0 || sanitizedMessage.length > 2000) {
      throw new Error('Mensagem inválida');
    }
    
    // Prepared statement - seguro contra SQL injection
    const [result] = await connection.query(
      `INSERT INTO chat_messages (user_name, user_email, message, status)
       VALUES (?, ?, ?, 'pendente')`,
      [sanitizedName, sanitizedEmail, sanitizedMessage]
    );
    
    return result.insertId;
    
  } finally {
    connection.release();
  }
}

// ============================================
// 3. ROTAS PROTEGIDAS - ANTES vs DEPOIS
// ============================================

// ❌ ANTES (sem proteção):
/*
app.get('/api/admin/usuarios', (req, res) => {
  const query = 'SELECT * FROM usuarios';
  db.query(query, (err, result) => {
    res.json(result); // EXPÕE TUDO: emails, senhas...
  });
});
*/

// ✅ DEPOIS (com JWT e ocultar sensíveis):
app.get('/api/admin/usuarios', verifyToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    const connection = await pool.getConnection();
    
    try {
      // Retornar APENAS dados públicos (sem password_hash!)
      const [usuarios] = await connection.query(`
        SELECT id, nome, email, tipo_usuario, ativo, criado_em
        FROM usuarios
        ORDER BY criado_em DESC
      `);
      
      res.json({ usuarios });
      
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ============================================
// 4. REGISTRO - ANTES vs DEPOIS
// ============================================

// ❌ ANTES (sem validação forte):
/*
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = simpleHash(password); // FRACO
  db.query('INSERT INTO usuarios (email, password_hash) VALUES (?, ?)',
    [email, hashedPassword], ...);
});
*/

// ✅ DEPOIS (com validação e bcrypt):
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, password, confirmPassword } = req.body;
    
    // Validar email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    // Validar senha forte
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Senhas não correspondem' });
    }
    
    if (!isStrongPassword(password)) {
      return res.status(400).json({ 
        error: 'Senha fraca. Mínimo 8 char, maiúscula, número, símbolo' 
      });
    }
    
    // Hash com bcrypt (forte!)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const connection = await pool.getConnection();
    
    try {
      // Verificar duplicado
      const [existing] = await connection.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email já registrado' });
      }
      
      // Inserir com prepared statement
      const [result] = await connection.query(
        'INSERT INTO usuarios (nome, email, password_hash, tipo_usuario) VALUES (?, ?, ?, ?)',
        [sanitizeInput(nome), email, hashedPassword, 'cliente']
      );
      
      // Retornar token (não senha!)
      const token = generateToken(result.insertId, 'cliente');
      res.status(201).json({ token, user: { id: result.insertId, nome } });
      
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

// ============================================
// 5. MIDDLEWARE PROTETOR
// ============================================

// Verificar autenticação
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

// Verificar se é admin
function verifyAdmin(req, res, next) {
  if (req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({ error: 'Somente admin' });
  }
  next();
}

// ============================================
// 6. HELPER - SANITIZAÇÃO
// ============================================

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return validator.trim(validator.escape(input));
}

function isValidEmail(email) {
  return validator.isEmail(email);
}

function isStrongPassword(password) {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
}

// ============================================
// 7. USO NO FRONTEND
// ============================================

// Fazer login
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Login falhou');
  }
  
  const { token } = await response.json();
  localStorage.setItem('token', token);
  return token;
}

// Acessar API protegida
async function fetchProtected(endpoint) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.status === 403) {
    // Token expirado, fazer logout
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }
  
  return response.json();
}

// Exemplo de uso
async function loadUserProfile() {
  const data = await fetchProtected('/api/user/profile');
  console.log('Perfil:', data.user);
}
