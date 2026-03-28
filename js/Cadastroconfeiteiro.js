// ── Helpers de erro ───────────────────────────────────────────────────────────
function markError(id, msg) {
  const el  = document.getElementById(id);
  const err = document.getElementById('err-' + id);
  if (el)  el.classList.add('error');
  if (err) err.textContent = msg;
  return false;
}

function clearError(id) {
  const el  = document.getElementById(id);
  const err = document.getElementById('err-' + id);
  if (el)  el.classList.remove('error');
  if (err) err.textContent = '';
}

function setGroupError(errId, ids, msg) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('error');
  });
  const err = document.getElementById(errId);
  if (err) err.textContent = msg;
  return false;
}

function clearGroupError(errId, ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
  const err = document.getElementById(errId);
  if (err) err.textContent = '';
}

// ── Limpar erros ao digitar ───────────────────────────────────────────────────
['nome','telefone','cnpj','cozinha','rep-nome','rep-email','rep-tel'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input',  () => clearError(id));
    el.addEventListener('change', () => clearError(id));
  }
});

['cep','estado'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input',  () => clearGroupError('err-cep-estado', ['cep','estado']));
    el.addEventListener('change', () => clearGroupError('err-cep-estado', ['cep','estado']));
  }
});

['cidade','bairro'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => clearGroupError('err-cidade-bairro', ['cidade','bairro']));
});

['endereco','numero'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => clearGroupError('err-end-num', ['endereco','numero']));
});

['rep-email','rep-tel'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => clearGroupError('err-rep-contact', ['rep-email','rep-tel']));
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'error-toast') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ── Validação e envio ─────────────────────────────────────────────────────────
document.getElementById('mainForm').addEventListener('submit', function (e) {
  e.preventDefault();

  let valid      = true;
  let firstError = null;

  const v = id => document.getElementById(id).value.trim();

  // Nome do restaurante
  if (!v('nome')) {
    markError('nome', 'Campo obrigatório');
    valid = false;
    if (!firstError) firstError = 'nome';
  } else clearError('nome');

  // Telefone
  if (!v('telefone') || !/^\d{8,15}$/.test(v('telefone'))) {
    markError('telefone', 'Informe um telefone válido (apenas números)');
    valid = false;
    if (!firstError) firstError = 'telefone';
  } else clearError('telefone');

  // CNPJ
  if (!v('cnpj') || !/^\d{14}$/.test(v('cnpj'))) {
    markError('cnpj', 'CNPJ deve ter 14 dígitos');
    valid = false;
    if (!firstError) firstError = 'cnpj';
  } else clearError('cnpj');

  // Tipo de Cozinha
  if (!v('cozinha')) {
    markError('cozinha', 'Selecione um tipo de cozinha');
    valid = false;
    if (!firstError) firstError = 'cozinha';
  } else clearError('cozinha');

  // CEP + Estado
  if (!v('cep') || !v('estado')) {
    setGroupError('err-cep-estado', ['cep','estado'], 'CEP e Estado são obrigatórios');
    valid = false;
    if (!firstError) firstError = 'cep';
  } else clearGroupError('err-cep-estado', ['cep','estado']);

  // Cidade + Bairro
  if (!v('cidade') || !v('bairro')) {
    setGroupError('err-cidade-bairro', ['cidade','bairro'], 'Cidade e Bairro são obrigatórios');
    valid = false;
    if (!firstError) firstError = 'cidade';
  } else clearGroupError('err-cidade-bairro', ['cidade','bairro']);

  // Endereço + Número
  if (!v('endereco') || !v('numero')) {
    setGroupError('err-end-num', ['endereco','numero'], 'Endereço e Número são obrigatórios');
    valid = false;
    if (!firstError) firstError = 'endereco';
  } else clearGroupError('err-end-num', ['endereco','numero']);

  // Nome do representante
  if (!v('rep-nome')) {
    markError('rep-nome', 'Campo obrigatório');
    valid = false;
    if (!firstError) firstError = 'rep-nome';
  } else clearError('rep-nome');

  // E-mail + Telefone do representante
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('rep-email'));
  const telOk   = /^\d{8,15}$/.test(v('rep-tel'));
  if (!emailOk || !telOk) {
    setGroupError('err-rep-contact', ['rep-email','rep-tel'],
      !emailOk ? 'Informe um e-mail válido' : 'Informe um telefone válido (apenas números)');
    valid = false;
    if (!firstError) firstError = 'rep-email';
  } else clearGroupError('err-rep-contact', ['rep-email','rep-tel']);

  // Resultado
  if (!valid) {
    showToast('⚠️ Preencha todos os campos obrigatórios antes de enviar.');
    if (firstError) {
      const el = document.getElementById(firstError);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  showToast('✅ Dados enviados com sucesso!', 'success');
});

// ── Forçar apenas dígitos em campos numéricos ─────────────────────────────────
['telefone','cnpj','cep','rep-tel'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => {
    el.value = el.value.replace(/\D/g, '');
  });
});