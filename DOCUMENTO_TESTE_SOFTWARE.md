# Documento de Teste de Software - Projeto Unicake

## 1. Introdução

Este documento descreve o plano de teste de software para o projeto Unicake, uma plataforma de e-commerce especializada em confeitaria. O objetivo é garantir a qualidade, funcionalidade e segurança da aplicação através de testes abrangentes.

### 1.1 Objetivo do Projeto
O Unicake é uma aplicação web full-stack que permite aos usuários comprar produtos de confeitaria personalizados, com sistema de carrinho de compras, autenticação de usuários e painel administrativo.

### 1.2 Escopo do Teste
Os testes abrangem:
- Frontend: Páginas HTML/CSS/JS
- Backend: API Node.js com Express
- Banco de Dados: MySQL
- Funcionalidades: Autenticação, carrinho, pagamento, chat, administração

## 2. Estratégia de Teste

### 2.1 Tipos de Teste
- **Testes Funcionais**: Verificar se as funcionalidades atendem aos requisitos
- **Testes de Integração**: Validar a comunicação entre módulos
- **Testes de Segurança**: Identificar vulnerabilidades
- **Testes de Performance**: Avaliar tempo de resposta e carga
- **Testes de Usabilidade**: Verificar experiência do usuário
- **Testes de Compatibilidade**: Diferentes navegadores e dispositivos

### 2.2 Níveis de Teste
- **Unidade**: Componentes individuais (funções JavaScript, rotas API)
- **Integração**: Interação entre frontend e backend
- **Sistema**: Aplicação completa
- **Aceitação**: Validação dos requisitos do usuário

### 2.3 Ferramentas de Teste
- Navegadores: Chrome, Firefox, Edge, Safari
- Ferramentas de desenvolvedor do navegador
- Postman para testes de API
- MySQL Workbench para validação de dados
- Lighthouse para performance

## 3. Ambiente de Teste

### 3.1 Requisitos de Hardware
- Processador: Intel i5 ou superior
- RAM: 8GB mínimo
- Espaço em disco: 2GB
- Conexão à internet estável

### 3.2 Requisitos de Software
- Sistema Operacional: Windows 10+, macOS 10.15+, Linux Ubuntu 18+
- Navegadores: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- Node.js 16+
- MySQL 8.0+
- VS Code com extensões de desenvolvimento

### 3.3 Configuração do Ambiente
1. Clonar repositório
2. Instalar dependências: `npm install` no diretório backend
3. Configurar banco de dados MySQL
4. Executar script de setup: `mysql -u root -p < database.sql`
5. Iniciar servidor: `npm start` no backend
6. Abrir index.html no navegador

## 4. Casos de Teste

### 4.1 Testes de Autenticação

#### TC-AUTH-001: Cadastro de Cliente
**Pré-condições:** Usuário não cadastrado
**Passos:**
1. Acessar página de cadastro
2. Preencher nome, email, telefone, senha
3. Clicar em "Cadastrar"
**Resultado Esperado:** Conta criada, redirecionamento para login
**Critérios de Sucesso:** Usuário pode fazer login com credenciais

#### TC-AUTH-002: Login Válido
**Pré-condições:** Usuário cadastrado
**Passos:**
1. Acessar página de login
2. Inserir email e senha corretos
3. Clicar em "Entrar"
**Resultado Esperado:** Acesso concedido, redirecionamento para home
**Critérios de Sucesso:** Sessão iniciada, dados do usuário carregados

#### TC-AUTH-003: Login Inválido
**Pré-condições:** -
**Passos:**
1. Acessar página de login
2. Inserir credenciais incorretas
3. Clicar em "Entrar"
**Resultado Esperado:** Mensagem de erro, acesso negado
**Critérios de Sucesso:** Não há vazamento de informações

#### TC-AUTH-004: Login Admin com 2FA
**Pré-condições:** Credenciais admin corretas
**Passos:**
1. Fazer login como admin
2. Inserir código 2FA (verificar console)
3. Confirmar
**Resultado Esperado:** Acesso ao painel admin
**Critérios de Sucesso:** 2FA validado corretamente

### 4.2 Testes de Carrinho de Compras

#### TC-CART-001: Adicionar Produto ao Carrinho
**Pré-condições:** Produto disponível, usuário logado
**Passos:**
1. Acessar detalhe do produto
2. Selecionar opções (sabor, recheio, etc.)
3. Definir quantidade
4. Clicar "Adicionar ao Carrinho"
**Resultado Esperado:** Produto adicionado, drawer do carrinho atualizado
**Critérios de Sucesso:** Preço calculado corretamente com opções

#### TC-CART-002: Aplicar Cupom de Desconto
**Pré-condições:** Produtos no carrinho
**Passos:**
1. Acessar carrinho
2. Inserir código do cupom (BOLO10, BOLO20, FRETE)
3. Aplicar cupom
**Resultado Esperado:** Desconto aplicado ao total
**Critérios de Sucesso:** Cálculo correto do desconto

#### TC-CART-003: Remover Item do Carrinho
**Pré-condições:** Itens no carrinho
**Passos:**
1. Acessar carrinho
2. Clicar em remover item
3. Confirmar remoção
**Resultado Esperado:** Item removido, total recalculado
**Critérios de Sucesso:** Carrinho atualizado corretamente

### 4.3 Testes de Busca e Filtros

#### TC-SEARCH-001: Busca por Nome de Produto
**Pré-condições:** -
**Passos:**
1. Digitar nome do produto na busca
2. Pressionar Enter ou aguardar sugestões
**Resultado Esperado:** Produtos relacionados exibidos
**Critérios de Sucesso:** Resultados relevantes retornados

#### TC-SEARCH-002: Aplicar Filtros Múltiplos
**Pré-condições:** Página de busca carregada
**Passos:**
1. Selecionar categoria
2. Ajustar range de preço
3. Filtrar por avaliação
4. Ordenar resultados
**Resultado Esperado:** Lista filtrada e ordenada
**Critérios de Sucesso:** Todos os filtros aplicados simultaneamente

### 4.4 Testes de Chat

#### TC-CHAT-001: Enviar Mensagem
**Pré-condições:** Chat flutuante disponível
**Passos:**
1. Abrir chat
2. Digitar mensagem
3. Enviar
**Resultado Esperado:** Mensagem enviada, resposta automática
**Critérios de Sucesso:** Mensagem salva no banco de dados

#### TC-CHAT-002: Responder Mensagem (Admin)
**Pré-condições:** Mensagem pendente no admin
**Passos:**
1. Acessar painel admin
2. Selecionar mensagem pendente
3. Digitar resposta
4. Enviar
**Resultado Esperado:** Status alterado para respondido
**Critérios de Sucesso:** Cliente recebe resposta

### 4.5 Testes de Pagamento

#### TC-PAY-001: Pagamento com PIX
**Pré-condições:** Carrinho com itens, usuário logado
**Passos:**
1. Ir para checkout
2. Selecionar PIX
3. Confirmar pedido
**Resultado Esperado:** QR Code gerado, pedido criado
**Critérios de Sucesso:** Status do pedido atualizado

#### TC-PAY-002: Pagamento com Cartão
**Pré-condições:** Carrinho pronto
**Passos:**
1. Selecionar cartão de crédito
2. Preencher dados válidos
3. Confirmar
**Resultado Esperado:** Pagamento processado
**Critérios de Sucesso:** Validação de dados do cartão

### 4.6 Testes de Segurança

#### TC-SEC-001: Tentativa de SQL Injection
**Pré-condições:** Campo de busca acessível
**Passos:**
1. Inserir código SQL malicioso em campo de busca
2. Executar busca
**Resultado Esperado:** Consulta segura, nenhum dado comprometido
**Critérios de Sucesso:** Sistema não executa código injetado

#### TC-SEC-002: Rate Limiting
**Pré-condições:** API acessível
**Passos:**
1. Fazer múltiplas requisições rápidas
2. Verificar resposta após limite
**Resultado Esperado:** Requisições bloqueadas após limite
**Critérios de Sucesso:** Proteção contra ataques de força bruta

#### TC-SEC-003: Acesso Não Autorizado
**Pré-condições:** Usuário não logado
**Passos:**
1. Tentar acessar URL do painel admin
**Resultado Esperado:** Redirecionamento para login
**Critérios de Sucesso:** Acesso negado sem autenticação

### 4.7 Testes de Performance

#### TC-PERF-001: Tempo de Carregamento da Página
**Pré-condições:** Conexão estável
**Passos:**
1. Acessar página inicial
2. Medir tempo de carregamento
**Resultado Esperado:** Carregamento em menos de 3 segundos
**Critérios de Sucesso:** Página totalmente funcional

#### TC-PERF-002: Busca com Muitos Resultados
**Pré-condições:** Muitos produtos cadastrados
**Passos:**
1. Fazer busca ampla
2. Verificar tempo de resposta
**Resultado Esperado:** Resultados em menos de 1 segundo
**Critérios de Sucesso:** Interface responsiva

### 4.8 Testes de Usabilidade

#### TC-USAB-001: Responsividade Mobile
**Pré-condições:** Dispositivo móvel ou emulação
**Passos:**
1. Acessar site em tela pequena
2. Navegar pelas páginas
**Resultado Esperado:** Layout adaptado, funcional
**Critérios de Sucesso:** Usabilidade mantida em mobile

#### TC-USAB-002: Navegação por Teclado
**Pré-condições:** Navegador com suporte
**Passos:**
1. Usar Tab para navegar
2. Enter para selecionar
**Resultado Esperado:** Acesso completo sem mouse
**Critérios de Sucesso:** Acessibilidade garantida

## 5. Critérios de Aceitação

### 5.1 Funcionalidades Críticas
- Autenticação deve funcionar 100% dos casos
- Carrinho deve calcular preços corretamente
- Pagamento deve processar pedidos
- Chat deve enviar/receber mensagens

### 5.2 Desempenho
- Tempo de resposta < 2s para operações críticas
- Interface responsiva em todos os dispositivos
- Sem erros JavaScript no console

### 5.3 Segurança
- Não há vulnerabilidades críticas
- Dados sensíveis criptografados
- Rate limiting ativo

### 5.4 Usabilidade
- Navegação intuitiva
- Mensagens de erro claras
- Design consistente

## 6. Plano de Execução

### 6.1 Fases de Teste
1. **Fase 1 (Semanas 1-2)**: Testes unitários e funcionais básicos
2. **Fase 2 (Semanas 3-4)**: Testes de integração e sistema
3. **Fase 3 (Semanas 5-6)**: Testes de segurança e performance
4. **Fase 4 (Semana 7)**: Testes de aceitação e regressão

### 6.2 Responsabilidades
- **Testador**: Executar casos de teste, documentar defeitos
- **Desenvolvedor**: Corrigir defeitos identificados
- **Product Owner**: Validar correções e aprovar releases

### 6.3 Métricas de Qualidade
- Cobertura de testes: > 80%
- Taxa de defeitos: < 5 por 1000 linhas de código
- Tempo médio de correção: < 24 horas para críticos

## 7. Relatório de Defeitos

### 7.1 Classificação de Severidade
- **Crítico**: Sistema inoperante, dados corrompidos
- **Alto**: Funcionalidade principal afetada
- **Médio**: Funcionalidade secundária afetada
- **Baixo**: Problemas cosméticos

### 7.2 Estados do Defeito
- Novo
- Em Análise
- Em Correção
- Corrigido
- Reaberto
- Fechado

### 7.3 Template de Relatório
```
ID: DEF-001
Título: [Breve descrição]
Severidade: [Crítico/Alto/Médio/Baixo]
Status: [Novo/Em Análise/etc]
Descrição: [Detalhes do problema]
Passos para Reproduzir: [1. 2. 3.]
Resultado Esperado: [...]
Resultado Obtido: [...]
Ambiente: [Navegador, SO, etc.]
Anexos: [Screenshots, logs]
```

## 8. Riscos e Mitigação

### 8.1 Riscos Identificados
- Dependência de terceiros (APIs de pagamento)
- Mudanças nos requisitos durante desenvolvimento
- Falhas de segurança não detectadas
- Problemas de performance em produção

### 8.2 Plano de Mitigação
- Testes automatizados para regressão
- Revisões de código por pares
- Auditorias de segurança regulares
- Monitoramento de performance em produção

## 9. Conclusão

Este documento estabelece uma base sólida para os testes do projeto Unicake. A execução sistemática dos casos de teste garantirá a entrega de um produto de qualidade, seguro e funcional. Recomenda-se a revisão periódica deste documento conforme o projeto evolui.

**Data de Criação:** 14 de abril de 2026
**Versão:** 1.0
**Autor:** Equipe de QA Unicake