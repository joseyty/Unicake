# 🗄️ Documentação do Banco de Dados UniCake

## Visão Geral

O banco de dados UniCake foi estruturado para gerenciar uma plataforma de venda de bolos e doces personalizados, com funcionalidades de catálogo de produtos, carrinho de compras, pedidos com rastreamento e análise de dados.

**Banco de Dados:** MySQL 8.0+  
**Charset:** UTF-8MB4 (suporte a emojis)

---

## 📊 Estrutura de Tabelas

### Tabelas Principais

#### 1. **usuarios**
Armazena todos os usuários (clientes, confeiteiros, admin)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único |
| `nome` | VARCHAR(150) | Nome completo |
| `email` | VARCHAR(150) UNIQUE | Email único para login |
| `password_hash` | TEXT | Senha criptografada (bcrypt recomendado) |
| `tipo_usuario` | ENUM | 'cliente', 'confeiteiro', 'admin' |
| `telefone` | VARCHAR(20) | Contato do usuário |
| `avatar_url` | VARCHAR(255) | URL da foto de perfil |
| `ativo` | BOOLEAN | Status do usuário |
| `criado_em` | TIMESTAMP | Data de criação |
| `atualizado_em` | TIMESTAMP | Data da última atualização |

---

#### 2. **lojas**
Lojas de confeiteiros registradas na plataforma

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único da loja |
| `nome` | VARCHAR(150) | Nome da loja |
| `dono_id` | INT UNSIGNED FK | ID do proprietário (usuário) |
| `descricao` | TEXT | Descrição e história da loja |
| `endereco` | VARCHAR(255) | Endereço de localização |
| `telefone` | VARCHAR(20) | Telefone da loja |
| `tempo_entrega_minutos` | INT | Tempo médio de entrega |
| `taxa_entrega` | DECIMAL(10,2) | Taxa cobrada por entrega |
| `avaliacao_media` | DECIMAL(3,2) | Média de avaliações (1-5) |
| `total_avaliacoes` | INT | Quantidade de avaliações |
| `imagem_url` | VARCHAR(255) | Foto da loja |
| `ativo` | BOOLEAN | Status da loja |

---

#### 3. **categorias**
Categorias de produtos (Bolos, Cupcakes, Brownies, etc.)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único |
| `nome` | VARCHAR(100) UNIQUE | Nome da categoria |
| `descricao` | TEXT | Descrição |
| `ativo` | BOOLEAN | Status |

---

#### 4. **produtos**
Produtos oferecidos pelas lojas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único |
| `loja_id` | INT UNSIGNED FK | ID da loja proprietária |
| `nome` | VARCHAR(150) | Nome do produto |
| `descricao` | TEXT | Descrição completa |
| `categoria_id` | INT UNSIGNED FK | Categoria do produto |
| `preco` | DECIMAL(10,2) | Preço base |
| `estoque` | INT | Quantidade em estoque |
| `imagem_url` | VARCHAR(255) | Foto do produtos |
| `tempo_preparo_minutos` | INT | Tempo para preparar |
| `ativo` | BOOLEAN | Se disponível para venda |

---

#### 5. **opcoes_produto**
Personalizações disponíveis por produto (recheios, coberturas, tamanhos)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único |
| `produto_id` | INT UNSIGNED FK | Produto que pode ser personalizado |
| `tipo_opcao` | VARCHAR(100) | Tipo: 'recheio', 'cobertura', 'tamanho', etc. |
| `nome` | VARCHAR(150) | Nome da opção |
| `preco_adicional` | DECIMAL(10,2) | Valor extra se selecionada |
| `obrigatoria` | BOOLEAN | Se deve ser obrigatoriamente selecionada |

Exemplo:
- Produto: "Bolo Chocolate Belga"
- Opções: Recheio (obrigatório), Cobertura (obrigatória), Tamanho (obrigatório)

---

#### 6. **pedidos**
Pedidos realizados pelos clientes

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único do pedido |
| `usuario_id` | INT UNSIGNED FK | Cliente que fez o pedido |
| `loja_id` | INT UNSIGNED FK | Loja que receberá o pedido |
| `total` | DECIMAL(10,2) | Valor total |
| `taxa_entrega` | DECIMAL(10,2) | Taxa de entrega |
| `status` | ENUM | 'pendente', 'confirmado', 'preparando', 'pronto', 'saiu_para_entrega', 'entregue', 'cancelado' |
| `data_entrega_prevista` | DATETIME | Previsão de entrega |
| `endereco_entrega` | VARCHAR(255) | Rua/avenida |
| `numero` | VARCHAR(20) | Número do local |
| `complemento` | VARCHAR(255) | Apto, sala, etc. |
| `observacoes` | TEXT | Instruções especiais |

---

#### 7. **itens_pedido**
Itens (linhas) de cada pedido

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único |
| `pedido_id` | INT UNSIGNED FK | Pedido ao qual pertence |
| `produto_id` | INT UNSIGNED FK | Qual produto |
| `quantidade` | INT | Quantos |
| `preco_unitario` | DECIMAL(10,2) | Preço cobrado |
| `opcoes` | JSON | Opções selecionadas em formato JSON |

Exemplo `opcoes`:
```json
[
  {"tipo": "recheio", "valor": "Chocolate"},
  {"tipo": "cobertura", "valor": "Morango Fresco"},
  {"tipo": "tamanho", "valor": "Grande"}
]
```

---

#### 8. **carrinho**
Carrinho de compras temporário

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único |
| `usuario_id` | INT UNSIGNED FK | Cliente dono do carrinho |
| `loja_id` | INT UNSIGNED FK | Loja |
| `produto_id` | INT UNSIGNED FK | Produto |
| `quantidade` | INT | Quantidade |
| `opcoes` | JSON | Opções selecionadas |

---

#### 9. **avaliacoes_produto**
Avaliações de clientes sobre produtos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único |
| `produto_id` | INT UNSIGNED FK | Produto avaliado |
| `usuario_id` | INT UNSIGNED FK | Cliente que avaliou |
| `estrelas` | INT | 1 a 5 estrelas |
| `comentario` | TEXT | Texto da avaliação |
| `criado_em` | TIMESTAMP | Data |

**Constraint:** Um usuário só pode avaliar cada produto uma vez (`UNIQUE KEY uk_usuario_produto`)

---

#### 10. **avaliacoes_loja**
Avaliações de clientes sobre as lojas

Similar à tabela `avaliacoes_produto`, mas para lojas

---

#### 11. **historico_pedido**
Log de mudanças de status de cada pedido

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT UNSIGNED PK | ID único |
| `pedido_id` | INT UNSIGNED FK | Pedido |
| `status_anterior` | VARCHAR(50) | Status anterior |
| `status_novo` | VARCHAR(50) | Novo status |
| `observacoes` | TEXT | Por que mudou |

Permite rastreamento completo: Pendente → Confirmado → Preparando → Pronto → Saiu para Entrega → Entregue

---

### Tabelas de Data Warehouse (Análise)

Para relatórios de vendas, usamos modelo **Star Schema** com dimensões e fato:

#### **dim_data**
Dimensão temporal

#### **dim_usuario**
Dimensão de clientes

#### **dim_loja**
Dimensão de lojas

#### **dim_produto**
Dimensão de produtos

#### **fato_vendas**
Fatos de vendas (conecta todas as dimensões)

---

## 🚀 Como Configurar

### Pré-requisitos
- MySQL 8.0 ou superior
- Cliente SQL (MySQL Workbench, DBeaver, etc.)
- Node.js (se usar backend em Node)

### Passo 1: Criar o Banco de Dados

```bash
mysql -u root -p < backend/database.sql
```

Ou manualmente:
```sql
CREATE DATABASE IF NOT EXISTS unicake CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unicake;
-- ... executar todo o arquivo database.sql
```

### Passo 2: Carregar Dados Iniciais (Opcional)

```bash
mysql -u root -p unicake < backend/setup.sql
```

Isto carregará:
- 4 usuários de exemplo
- 5 categorias
- 2 lojas
- 9 produtos com opções
- Avaliações de exemplo

### Passo 3: Configurar Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto (ou em `backend/.env`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=unicake
DB_USER=root
DB_PASSWORD=your_password
DB_CHARSET=utf8mb4

# Conexão
DB_CONNECTION_TIMEOUT=10000
DB_ENABLE_LOGS=true
```

---

## 🔍 Queries Úteis

### Ver todas as lojas com avaliação
```sql
SELECT id, nome, avaliacao_media, total_avaliacoes, tempo_entrega_minutos
FROM lojas
WHERE ativo = true
ORDER BY avaliacao_media DESC;
```

### Ver produtos de uma loja
```sql
SELECT p.id, p.nome, p.preco, p.categoria_id, c.nome as categoria
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
WHERE p.loja_id = 1 AND p.ativo = true;
```

### Ver opções de um produto
```sql
SELECT tipo_opcao, nome, preco_adicional, obrigatoria
FROM opcoes_produto
WHERE produto_id = 1
ORDER BY tipo_opcao, nome;
```

### Listar pedidos de um cliente com detalhes
```sql
SELECT 
    p.id as pedido_id,
    p.total,
    p.status,
    l.nome as loja,
    COUNT(ip.id) as total_itens,
    p.criado_em
FROM pedidos p
LEFT JOIN itens_pedido ip ON p.id = ip.pedido_id
LEFT JOIN lojas l ON p.loja_id = l.id
WHERE p.usuario_id = 4
GROUP BY p.id
ORDER BY p.criado_em DESC;
```

### Ver itens de um pedido com opções
```sql
SELECT 
    ip.id,
    pr.nome as produto,
    ip.quantidade,
    ip.preco_unitario,
    (ip.quantidade * ip.preco_unitario) as subtotal,
    ip.opcoes
FROM itens_pedido ip
LEFT JOIN produtos pr ON ip.produto_id = pr.id
WHERE ip.pedido_id = 1;
```

### Calcular receita por loja (últimos 30 dias)
```sql
SELECT 
    l.id,
    l.nome,
    COUNT(DISTINCT p.id) as total_pedidos,
    SUM(p.total) as receita_total,
    AVG(p.total) as ticket_medio
FROM pedidos p
LEFT JOIN lojas l ON p.loja_id = l.id
WHERE p.criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    AND p.status != 'cancelado'
GROUP BY l.id
ORDER BY receita_total DESC;
```

---

## 🔐 Segurança

### Recomendações

1. **Senhas**: Use `bcrypt` com salt (trabalho 10+)
   ```javascript
   // Node.js com bcrypt
   const hashed = await bcrypt.hash(senha, 10);
   ```

2. **SQL Injection**: Use Prepared Statements/Parameterized Queries
   ```javascript
   // ✅ Correto
   db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
   
   // ❌ Incorreto
   db.query('SELECT * FROM usuarios WHERE email = ' + email);
   ```

3. **Backups**: Faça regularmente
   ```bash
   mysqldump -u root -p unicake > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

4. **Princípio de menor privilégio**: Crie usuário só com permissões necessárias
   ```sql
   CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT SELECT, INSERT, UPDATE ON unicake.* TO 'app_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

---

## 📈 Performance

### Índices Criados

Todos os índices já estão criados em:
- Foreign Keys (automático)
- `email` em usuarios (login)
- `usuario_id`, `status` em pedidos (filtros comuns)
- `produto_id`, `loja_id` em produtos (busca)
- Mais em `database.sql`

### Otimizações Futuras

1. Adicionar caching (Redis) para:
   - Lojas populares
   - Produtos mais vendidos
   - Avaliações

2. Particionamento de `pedidos` e `fato_vendas` por data para escalabilidade

3. Índices compostos para queries complexas

---

## 🐛 Troubleshooting

### Erro: "Can't connect to MySQL server"
- Verificar se MySQL está rodando: `mysql -u root -p`
- Verificar variáveis de conexão no `.env`
- Porta padrão: 3306

### Erro: "UTF-8 incorrect"
```sql
ALTER DATABASE unicake CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE usuarios CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Fazer para cada tabela
```

### Erro: "Foreign key constraint fails"
- Verificar se tabela referenciada existe
- Verificar tipo de dados (INT vs INT UNSIGNED)
- Desativar temporariamente: `SET FOREIGN_KEY_CHECKS=0;`

---

## 📞 Suporte

Para mais informações sobre MySQL, consulte:
- [Documentação MySQL Oficial](https://dev.mysql.com/doc/)
- [Best Practices for MySQL](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
