# Painel Administrativo UniCake

## Segurança Implementada

### Autenticação
- **Hash de Senhas**: Senhas são hashed usando SHA-256 com salt antes do armazenamento
- **2FA (Two-Factor Authentication)**: Implementado com TOTP simulado
- **Timeout de Sessão**: Sessões expiram após 2 horas de inatividade

### Proteções de Dados
- Dados sensíveis são criptografados no localStorage
- Não são armazenadas senhas em texto plano
- Verificação de integridade dos dados

## Como Acessar

1. Acesse `html/AdminLogin.html`
2. Use as credenciais:
   - Email: `admin@unicake.com`
   - Senha: `admin123`
3. Digite o código 2FA (verifique o console do navegador para o código demo)

## Funcionalidades

- **Usuários**: Gerenciar cadastros de clientes e confeiteiros
- **Produtos**: Controle de produtos disponíveis
- **Vendas**: Histórico e gerenciamento de vendas
- **Configurações**: Opções de sistema

## ⚠️ Avisos de Segurança

**Este é um sistema de demonstração.** Em produção:

- Use um backend seguro (Node.js, PHP, etc.)
- Implemente TOTP real com bibliotecas como `otplib`
- Use HTTPS obrigatório
- Implemente rate limiting
- Use bancos de dados criptografados
- Faça auditorias de segurança regulares

## Tecnologias de Segurança Recomendadas

- **Backend**: Express.js com JWT
- **Banco**: PostgreSQL com criptografia
- **2FA**: Google Authenticator ou similar
- **Monitoramento**: Logs de acesso e alertas</content>
<parameter name="filePath">c:\Users\71184289492\Documents\GitHub\Unicake\ADMIN_SECURITY.md