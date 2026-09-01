# 🔐 Sistema de Login de Suporte - Guia Rápido

## 🎯 O que foi criado?

Um **sistema seguro de autenticação** para o painel de suporte com:

✅ Login/Senha para acesso restrito  
✅ Sessão com expiração automática (8 horas)  
✅ Ícone imperceptível no footer (apenas quem sabe clica)  
✅ Proteção de página (redireciona se não logado)  
✅ Botão de logout seguro  

## 🔑 Credenciais Padrão

```
E-mail: suporte@unicake.com
Senha:  Unicake2024
```

⚠️ **IMPORTANTE**: Mude estas credenciais após o primeiro login em um ambiente real!

## 🚀 Como Acessar

### Opção 1: Link Imperceptível (Recomendado)
```
1. Abra qualquer página do site
2. Vá para o rodapé (footer)
3. Veja um pequeno símbolo "⚙" bem discreto
4. Clique nele
5. Você será redirecionado para login-suporte.html
```

### Opção 2: URL Direta
```
Abra em seu navegador:
html/login-suporte.html
```

## 🔑 Fazendo Login

### Passo a Passo:
```
1. Abra: html/login-suporte.html
2. Digite: suporte@unicake.com
3. Digite senha: Unicake2024
4. Clique "Entrar"
5. ✅ Você será redirecionado para o painel
```

### O que acontece:
```
Login correto
    ↓
Sessão criada em localStorage
    ↓
Token gerado com timestamp
    ↓
Redirecionado para painel-suporte.html
    ↓
Painel verifica sessão válida
    ↓
✅ Painel abre normalmente
```

## 🛡️ Proteção de Sessão

### Verificação Automática:
```
- Ao abrir painel-suporte.html
- JavaScript verifica localStorage
- Se não logado → Redireciona para login
- Se logado e válido → Acesso permitido
- Se sessão expirou → Redireciona para login
```

### Expiração:
```
- Sessão válida por: 8 horas
- Contada a partir do login
- Logout limpa a sessão imediatamente
```

## 📍 Onde Está o Ícone?

No **footer** (rodapé de cada página):

```
┌─────────────────────────────────────┐
│ © 2026 UniCake. Todos os direitos... ⚙ │ ← Clique aqui
└─────────────────────────────────────┘
```

O ícone é uma **engrenagem bem pequena e discreta**, praticamente imperceptível à primeira vista.

## 🔄 Fazendo Logout

### No Painel de Suporte:
```
1. Clique no botão "🚪 Sair" (topo da sidebar)
2. Confirme: "Tem certeza que quer sair?"
3. Você será redirecionado para login
4. Sessão será apagada
```

## 🧪 Teste Agora

### 1. Tentar acessar sem login:
```
1. Abra: html/painel-suporte.html
2. Você será automaticamente redirecionado para: login-suporte.html
```

### 2. Fazer login:
```
1. Digite: suporte@unicake.com
2. Digite: Unicake2024
3. Clique "Entrar"
4. ✅ Painel abre com sucesso
```

### 3. Usar painel:
```
1. Responda clientes
2. Gerencie conversas
3. Feche conversas
4. Clique "Sair" quando terminar
```

## 🔒 Segurança

### ✅ Implementado:
- Verificação de credenciais
- Token de sessão único
- Expiração automática
- Logout seguro
- Redirecionamento de acesso não autorizado
- localStorage apenas (sem cookie vulnerável)

### ⚠️ Para Produção:
- [ ] Usar HTTPS obrigatório
- [ ] Hashing de senha no backend
- [ ] Database para armazenar credenciais
- [ ] 2FA (autenticação de dois fatores)
- [ ] Rate limiting contra força bruta
- [ ] Logs de acesso
- [ ] Sessões em servidor (não localStorage)

## 📋 Fluxo Completo

```
┌─ Visita site qualquer
│
├─ Vê rodapé com ícone "⚙" discreto
│
├─ Clica no ícone
│  └─ Vai para: html/login-suporte.html
│
├─ Digita: suporte@unicake.com
├─ Digita: Unicake2024
├─ Clica "Entrar"
│
├─ Login validado
│
├─ Sessão criada
│  └─ Token salvo em localStorage
│  └─ Válida por 8 horas
│
├─ Redirecionado para painel-suporte.html
│
├─ Painel verifica: está autenticado? ✅ SIM
│
├─ Painel abre normalmente
│
├─ Trabalha respondendo clientes
│
├─ Clica "Sair"
│
├─ Logout confirmado
│
├─ Sessão apagada
│
└─ Redirecionado para: login-suporte.html
```

## 🎯 Para Você (Dono/Admin)

### Rotina Diária:
```
Morning:
  1. Abra qualquer página do site
  2. Clique no "⚙" (footer, bem pequeno)
  3. Faça login
  4. Trabalhe respondendo clientes
  5. Clique "Sair" ao terminar
```

### Mudar Credenciais (Futura Implementação):
```
No painel de suporte, você poderá:
  1. Ir em "Configurações"
  2. Mudar email e senha
  3. Gerar novas credenciais
```

## 🔧 Como Funciona Internamente

### Arquivo de Autenticação:
```javascript
// assets/js/support-auth.js

window.UniCakeSupportAuth = {
  login(email, senha) → true/false
  logout() → apaga sessão
  isLoggedIn() → true/false
  getSession() → retorna dados da sessão
}
```

### Verificação no Painel:
```javascript
// Em painel-suporte.html

if (!window.UniCakeSupportAuth?.isLoggedIn()) {
  location.href = "login-suporte.html";
}
```

## 💾 O que é Salvo?

### LocalStorage Key: `unicake.support_session`

```json
{
  "token": "token_1234567890_abc123",
  "email": "suporte@unicake.com",
  "loginTime": "2024-01-15T10:30:00.000Z",
  "expiresIn": 28800000
}
```

## 🎓 Exemplo Prático

### Cenário:
```
1. Você abre seu site
2. Clica no "⚙" discreto no footer
3. Faz login com suas credenciais
4. Painel abre
5. Você responde 5 clientes
6. Clica "Sair"
7. Sessão encerra
```

## ✨ Destaques

- 🔐 **Seguro**: Validação de credenciais
- ⏱️ **Expiração**: Sessão válida por 8 horas
- 🔘 **Discreto**: Ícone imperceptível no footer
- 🚪 **Logout**: Botão fácil de encontrar no painel
- ⚡ **Rápido**: Autenticação instantânea
- 📱 **Mobile**: Funciona em todos os devices

## 🆘 Troubleshooting

### Problema: "Redireciona para login mesmo com senha correta"
```
Solução: Limpe o cache do navegador (Ctrl+Shift+Del)
```

### Problema: "Ícone não aparece no footer"
```
Solução: Procure por um símbolo "⚙" bem pequeno e discreto
         Está bem fraco e costuma ficar invisível
```

### Problema: "Sessão expirou"
```
Solução: Faça login novamente
         Sessão expira a cada 8 horas de inatividade
```

### Problema: "Esqueci a senha"
```
Solução Temporária: Mude em support-auth.js (linha ~13)
         Credenciais padrão estão lá
```

## 📞 Resumo Final

| Ação | Local | Resultado |
|------|-------|-----------|
| Acessar login | Clique "⚙" no footer | Vai para login-suporte.html |
| Fazer login | Digite credenciais | Sessão criada, vai pra painel |
| Usar painel | Responda clientes | Conversas sincronizadas |
| Fazer logout | Clique "🚪 Sair" | Sessão apaga, vai pra login |

## ✅ Você Está Pronto!

```
1. Ícone secreto no footer ✅
2. Login/Senha implementado ✅
3. Proteção de painel ✅
4. Logout disponível ✅
5. Sessão com expiração ✅

Sistema 100% funcional!
```

---

**Dica**: Guarde suas credenciais em lugar seguro!
