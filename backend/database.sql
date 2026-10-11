-- Banco da Unicake para Microsoft SQL Server.
-- Executar com: sqlcmd -S .\SQLEXPRESS -E -C -f 65001 -i database.sql

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

IF DB_ID(N'unicake_db') IS NULL
    CREATE DATABASE unicake_db;
GO

USE unicake_db;
GO

IF OBJECT_ID(N'dbo.categoria', N'U') IS NULL
CREATE TABLE dbo.categoria (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_categoria PRIMARY KEY,
    nome NVARCHAR(100) NOT NULL CONSTRAINT uk_categoria_nome UNIQUE,
    descricao NVARCHAR(MAX) NULL,
    ativo BIT NOT NULL CONSTRAINT df_categoria_ativo DEFAULT 1,
    data_cadastro DATETIME2(0) NOT NULL CONSTRAINT df_categoria_data DEFAULT SYSDATETIME()
);
GO

IF OBJECT_ID(N'dbo.produto', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.produto (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_produto PRIMARY KEY,
        categoria_id INT NOT NULL,
        -- codigo: identificador usado pelo site (assets/js/data.js), ex.: 'bolo-chocolate'
        codigo NVARCHAR(60) NULL,
        loja NVARCHAR(150) NULL,
        nome NVARCHAR(150) NOT NULL,
        descricao NVARCHAR(MAX) NULL,
        preco DECIMAL(10,2) NOT NULL,
        estoque INT NOT NULL CONSTRAINT df_produto_estoque DEFAULT 0,
        status NVARCHAR(20) NOT NULL CONSTRAINT df_produto_status DEFAULT 'ATIVO',
        data_cadastro DATETIME2(0) NOT NULL CONSTRAINT df_produto_data DEFAULT SYSDATETIME(),
        CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) REFERENCES dbo.categoria(id),
        CONSTRAINT chk_produto_status CHECK (status IN ('ATIVO', 'INATIVO')),
        CONSTRAINT chk_produto_preco CHECK (preco >= 0),
        CONSTRAINT chk_produto_estoque CHECK (estoque >= 0)
    );
    CREATE INDEX idx_produto_categoria ON dbo.produto (categoria_id);
    CREATE INDEX idx_produto_nome ON dbo.produto (nome);
    CREATE INDEX idx_produto_status ON dbo.produto (status);
    CREATE UNIQUE INDEX uk_produto_codigo ON dbo.produto (codigo) WHERE codigo IS NOT NULL;
END
GO

IF OBJECT_ID(N'dbo.cliente', N'U') IS NULL
CREATE TABLE dbo.cliente (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_cliente PRIMARY KEY,
    nome NVARCHAR(150) NOT NULL,
    email NVARCHAR(150) NOT NULL CONSTRAINT uk_cliente_email UNIQUE,
    telefone NVARCHAR(30) NULL,
    data_cadastro DATETIME2(0) NOT NULL CONSTRAINT df_cliente_data DEFAULT SYSDATETIME()
);
GO

IF OBJECT_ID(N'dbo.endereco', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.endereco (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_endereco PRIMARY KEY,
        cliente_id INT NOT NULL,
        cep NVARCHAR(20) NOT NULL,
        estado NVARCHAR(100) NOT NULL,
        cidade NVARCHAR(150) NOT NULL,
        bairro NVARCHAR(150) NOT NULL,
        rua NVARCHAR(200) NOT NULL,
        numero NVARCHAR(20) NOT NULL,
        complemento NVARCHAR(200) NULL,
        referencia NVARCHAR(200) NULL,
        data_cadastro DATETIME2(0) NOT NULL CONSTRAINT df_endereco_data DEFAULT SYSDATETIME(),
        CONSTRAINT fk_endereco_cliente FOREIGN KEY (cliente_id) REFERENCES dbo.cliente(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_endereco_cliente ON dbo.endereco (cliente_id);
END
GO

IF OBJECT_ID(N'dbo.carrinho', N'U') IS NULL
CREATE TABLE dbo.carrinho (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_carrinho PRIMARY KEY,
    cliente_id INT NOT NULL CONSTRAINT uk_carrinho_cliente UNIQUE,
    data_criacao DATETIME2(0) NOT NULL CONSTRAINT df_carrinho_criacao DEFAULT SYSDATETIME(),
    data_atualizacao DATETIME2(0) NOT NULL CONSTRAINT df_carrinho_atualizacao DEFAULT SYSDATETIME(),
    CONSTRAINT fk_carrinho_cliente FOREIGN KEY (cliente_id) REFERENCES dbo.cliente(id) ON DELETE CASCADE
);
GO

IF OBJECT_ID(N'dbo.item_carrinho', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.item_carrinho (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_item_carrinho PRIMARY KEY,
        carrinho_id INT NOT NULL,
        produto_id INT NOT NULL,
        quantidade INT NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        data_atualizacao DATETIME2(0) NOT NULL CONSTRAINT df_item_carrinho_atualizacao DEFAULT SYSDATETIME(),
        CONSTRAINT fk_item_carrinho_carrinho FOREIGN KEY (carrinho_id) REFERENCES dbo.carrinho(id) ON DELETE CASCADE,
        CONSTRAINT fk_item_carrinho_produto FOREIGN KEY (produto_id) REFERENCES dbo.produto(id),
        CONSTRAINT chk_item_carrinho_quantidade CHECK (quantidade > 0),
        CONSTRAINT uk_item_carrinho UNIQUE (carrinho_id, produto_id)
    );
    CREATE INDEX idx_item_carrinho_produto ON dbo.item_carrinho (produto_id);
END
GO

IF OBJECT_ID(N'dbo.cupom', N'U') IS NULL
CREATE TABLE dbo.cupom (
    -- codigo sem hífens/espaços, como o site normaliza (ex.: 'UNICAKEESSENCIAL')
    codigo NVARCHAR(40) NOT NULL CONSTRAINT pk_cupom PRIMARY KEY,
    descricao NVARCHAR(200) NULL,
    tipo NVARCHAR(20) NOT NULL,
    valor DECIMAL(10,2) NOT NULL CONSTRAINT df_cupom_valor DEFAULT 0,
    frete_gratis BIT NOT NULL CONSTRAINT df_cupom_frete DEFAULT 0,
    subtotal_minimo DECIMAL(10,2) NOT NULL CONSTRAINT df_cupom_minimo DEFAULT 0,
    ativo BIT NOT NULL CONSTRAINT df_cupom_ativo DEFAULT 1,
    CONSTRAINT chk_cupom_tipo CHECK (tipo IN ('PERCENTUAL', 'FIXO', 'FRETE_GRATIS')),
    CONSTRAINT chk_cupom_valor CHECK (valor >= 0)
);
GO

IF OBJECT_ID(N'dbo.pedido', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.pedido (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_pedido PRIMARY KEY,
        cliente_id INT NOT NULL,
        -- NULL nas compras feitas pelo site, que ainda não coleta endereço
        endereco_id INT NULL,
        subtotal DECIMAL(10,2) NOT NULL CONSTRAINT df_pedido_subtotal DEFAULT 0,
        desconto DECIMAL(10,2) NOT NULL CONSTRAINT df_pedido_desconto DEFAULT 0,
        taxa_entrega DECIMAL(10,2) NOT NULL CONSTRAINT df_pedido_taxa DEFAULT 0,
        cupom_codigo NVARCHAR(40) NULL,
        valor_total DECIMAL(10,2) NOT NULL CONSTRAINT df_pedido_total DEFAULT 0,
        status NVARCHAR(30) NOT NULL CONSTRAINT df_pedido_status DEFAULT 'PENDENTE',
        observacoes NVARCHAR(MAX) NULL,
        data_criacao DATETIME2(0) NOT NULL CONSTRAINT df_pedido_criacao DEFAULT SYSDATETIME(),
        data_atualizacao DATETIME2(0) NOT NULL CONSTRAINT df_pedido_atualizacao DEFAULT SYSDATETIME(),
        CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES dbo.cliente(id),
        CONSTRAINT fk_pedido_endereco FOREIGN KEY (endereco_id) REFERENCES dbo.endereco(id),
        CONSTRAINT fk_pedido_cupom FOREIGN KEY (cupom_codigo) REFERENCES dbo.cupom(codigo),
        CONSTRAINT chk_pedido_status CHECK (status IN ('PENDENTE', 'CONFIRMADO', 'EM_PREPARACAO', 'PRONTO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO')),
        CONSTRAINT chk_pedido_valores CHECK (subtotal >= 0 AND desconto >= 0 AND taxa_entrega >= 0 AND valor_total >= 0)
    );
    CREATE INDEX idx_pedido_cliente ON dbo.pedido (cliente_id);
    CREATE INDEX idx_pedido_status ON dbo.pedido (status);
END
GO

IF OBJECT_ID(N'dbo.item_pedido', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.item_pedido (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_item_pedido PRIMARY KEY,
        pedido_id INT NOT NULL,
        produto_id INT NOT NULL,
        -- cópia do nome no momento da compra, para o histórico não mudar se o produto for editado
        nome_produto NVARCHAR(150) NOT NULL,
        quantidade INT NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_item_pedido_pedido FOREIGN KEY (pedido_id) REFERENCES dbo.pedido(id) ON DELETE CASCADE,
        CONSTRAINT fk_item_pedido_produto FOREIGN KEY (produto_id) REFERENCES dbo.produto(id),
        CONSTRAINT chk_item_pedido_quantidade CHECK (quantidade > 0)
    );
    CREATE INDEX idx_item_pedido_pedido ON dbo.item_pedido (pedido_id);
    CREATE INDEX idx_item_pedido_produto ON dbo.item_pedido (produto_id);
END
GO

IF OBJECT_ID(N'dbo.pagamento', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.pagamento (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_pagamento PRIMARY KEY,
        pedido_id INT NOT NULL,
        metodo NVARCHAR(20) NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        status NVARCHAR(20) NOT NULL CONSTRAINT df_pagamento_status DEFAULT 'PENDENTE',
        codigo_transacao NVARCHAR(100) NULL,
        data_criacao DATETIME2(0) NOT NULL CONSTRAINT df_pagamento_criacao DEFAULT SYSDATETIME(),
        data_pagamento DATETIME2(0) NULL,
        data_atualizacao DATETIME2(0) NOT NULL CONSTRAINT df_pagamento_atualizacao DEFAULT SYSDATETIME(),
        CONSTRAINT fk_pagamento_pedido FOREIGN KEY (pedido_id) REFERENCES dbo.pedido(id) ON DELETE CASCADE,
        CONSTRAINT chk_pagamento_metodo CHECK (metodo IN ('PIX', 'CARTAO', 'DINHEIRO')),
        CONSTRAINT chk_pagamento_status CHECK (status IN ('PENDENTE', 'APROVADO', 'RECUSADO', 'ESTORNADO', 'CANCELADO')),
        CONSTRAINT chk_pagamento_valor CHECK (valor >= 0)
    );
    CREATE INDEX idx_pagamento_pedido ON dbo.pagamento (pedido_id);
    CREATE INDEX idx_pagamento_status ON dbo.pagamento (status);
END
GO

IF OBJECT_ID(N'dbo.confeiteiro', N'U') IS NULL
CREATE TABLE dbo.confeiteiro (
    id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_confeiteiro PRIMARY KEY,
    nome NVARCHAR(150) NOT NULL,
    nome_loja NVARCHAR(150) NOT NULL,
    -- 14 caracteres sem pontuação; aceita o CNPJ alfanumérico
    cnpj CHAR(14) NOT NULL CONSTRAINT uk_confeiteiro_cnpj UNIQUE,
    email NVARCHAR(150) NOT NULL CONSTRAINT uk_confeiteiro_email UNIQUE,
    telefone NVARCHAR(30) NULL,
    -- senha guardada apenas como hash PBKDF2-SHA256 (hex) com salt próprio
    senha_hash CHAR(64) NOT NULL,
    senha_salt CHAR(32) NOT NULL,
    ativo BIT NOT NULL CONSTRAINT df_confeiteiro_ativo DEFAULT 1,
    data_cadastro DATETIME2(0) NOT NULL CONSTRAINT df_confeiteiro_data DEFAULT SYSDATETIME()
);
GO

IF OBJECT_ID(N'dbo.sessao_confeiteiro', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sessao_confeiteiro (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_sessao_confeiteiro PRIMARY KEY,
        confeiteiro_id INT NOT NULL,
        -- SHA-256 do token entregue ao navegador; o token em si não é gravado
        token_hash CHAR(64) NOT NULL CONSTRAINT uk_sessao_confeiteiro_token UNIQUE,
        data_criacao DATETIME2(0) NOT NULL CONSTRAINT df_sessao_confeiteiro_criacao DEFAULT SYSDATETIME(),
        data_expiracao DATETIME2(0) NOT NULL,
        CONSTRAINT fk_sessao_confeiteiro FOREIGN KEY (confeiteiro_id) REFERENCES dbo.confeiteiro(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_sessao_confeiteiro ON dbo.sessao_confeiteiro (confeiteiro_id);
END
GO

-- Produtos cadastrados pelos confeiteiros: dono do produto e caminho da foto enviada
IF COL_LENGTH(N'dbo.produto', N'confeiteiro_id') IS NULL
BEGIN
    ALTER TABLE dbo.produto ADD
        confeiteiro_id INT NULL CONSTRAINT fk_produto_confeiteiro FOREIGN KEY REFERENCES dbo.confeiteiro(id),
        imagem NVARCHAR(200) NULL;
END
GO

-- Conta de cliente no servidor: senha com hash (NULL para quem entra só com Google) e sessões
IF COL_LENGTH(N'dbo.cliente', N'senha_hash') IS NULL
    ALTER TABLE dbo.cliente ADD
        senha_hash CHAR(64) NULL,
        senha_salt CHAR(32) NULL,
        google_sub NVARCHAR(64) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'uk_cliente_google' AND object_id = OBJECT_ID(N'dbo.cliente'))
    CREATE UNIQUE INDEX uk_cliente_google ON dbo.cliente (google_sub) WHERE google_sub IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.sessao_cliente', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.sessao_cliente (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_sessao_cliente PRIMARY KEY,
        cliente_id INT NOT NULL,
        -- SHA-256 do token entregue ao navegador; o token em si não é gravado
        token_hash CHAR(64) NOT NULL CONSTRAINT uk_sessao_cliente_token UNIQUE,
        data_criacao DATETIME2(0) NOT NULL CONSTRAINT df_sessao_cliente_criacao DEFAULT SYSDATETIME(),
        data_expiracao DATETIME2(0) NOT NULL,
        CONSTRAINT fk_sessao_cliente FOREIGN KEY (cliente_id) REFERENCES dbo.cliente(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_sessao_cliente ON dbo.sessao_cliente (cliente_id);
END
GO

-- Controle de acesso: senhas erradas por conta; na 5ª seguida o login trava por 2 minutos
IF OBJECT_ID(N'dbo.tentativa_login', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.tentativa_login (
        tipo VARCHAR(12) NOT NULL,
        email NVARCHAR(150) NOT NULL,
        falhas INT NOT NULL CONSTRAINT df_tentativa_falhas DEFAULT 0,
        ultima_falha DATETIME2(0) NOT NULL CONSTRAINT df_tentativa_ultima DEFAULT SYSDATETIME(),
        bloqueado_ate DATETIME2(0) NULL,
        CONSTRAINT pk_tentativa_login PRIMARY KEY (tipo, email),
        CONSTRAINT ck_tentativa_tipo CHECK (tipo IN ('CLIENTE', 'CONFEITEIRO'))
    );
END
GO

-- Suporte: quem pode abrir o painel de chamados. Para liberar alguém (que já tenha conta de cliente):
--   UPDATE dbo.cliente SET administrador = 1 WHERE email = 'pessoa@email.com';
IF COL_LENGTH(N'dbo.cliente', N'administrador') IS NULL
    ALTER TABLE dbo.cliente ADD administrador BIT NOT NULL CONSTRAINT df_cliente_administrador DEFAULT 0;
GO

-- Chamados enviados pela página Suporte (feedbacks, reclamações, bugs, dúvidas) e a resposta da equipe
IF OBJECT_ID(N'dbo.chamado', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.chamado (
        id INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_chamado PRIMARY KEY,
        -- NULL quando quem escreveu não estava logado
        cliente_id INT NULL,
        nome NVARCHAR(150) NOT NULL,
        email NVARCHAR(150) NOT NULL,
        tipo VARCHAR(20) NOT NULL,
        mensagem NVARCHAR(2000) NOT NULL,
        status VARCHAR(20) NOT NULL CONSTRAINT df_chamado_status DEFAULT 'ABERTO',
        resposta NVARCHAR(2000) NULL,
        respondido_por INT NULL,
        data_criacao DATETIME2(0) NOT NULL CONSTRAINT df_chamado_criacao DEFAULT SYSDATETIME(),
        data_resposta DATETIME2(0) NULL,
        CONSTRAINT fk_chamado_cliente FOREIGN KEY (cliente_id) REFERENCES dbo.cliente(id) ON DELETE SET NULL,
        CONSTRAINT ck_chamado_tipo CHECK (tipo IN ('PEDIDO', 'PRODUTO', 'RECLAMACAO', 'BUG', 'FEEDBACK', 'EMPRESAS', 'OUTRO')),
        CONSTRAINT ck_chamado_status CHECK (status IN ('ABERTO', 'RESPONDIDO', 'RESOLVIDO'))
    );
    CREATE INDEX idx_chamado_cliente ON dbo.chamado (cliente_id);
    CREATE INDEX idx_chamado_status ON dbo.chamado (status);
END
GO

-- Cartão fidelidade: o confeiteiro escolhe até 10 dos seus produtos para participar
IF COL_LENGTH(N'dbo.produto', N'fidelidade') IS NULL
    ALTER TABLE dbo.produto ADD fidelidade BIT NOT NULL CONSTRAINT df_produto_fidelidade DEFAULT 0;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_produto_confeiteiro' AND object_id = OBJECT_ID(N'dbo.produto'))
    CREATE INDEX idx_produto_confeiteiro ON dbo.produto (confeiteiro_id);
GO

-- Dados iniciais: espelham o catálogo e os cupons do site (assets/js/data.js)

INSERT INTO dbo.categoria (nome, descricao)
SELECT v.nome, v.descricao
FROM (VALUES
    (N'Bolos', N'Bolos artesanais'),
    (N'Cupcakes', N'Cupcakes decorados'),
    (N'Tortas', N'Tortas e sobremesas'),
    (N'Doces gourmet', N'Doces variados'),
    (N'Cookies e brownies', N'Cookies e brownies'),
    (N'Kits festa', N'Kits para festas e eventos'),
    (N'Personalizados', N'Produtos personalizados')
) AS v (nome, descricao)
WHERE NOT EXISTS (SELECT 1 FROM dbo.categoria c WHERE c.nome = v.nome);
GO

INSERT INTO dbo.produto (categoria_id, codigo, loja, nome, descricao, preco, estoque)
SELECT c.id, v.codigo, v.loja, v.nome, v.descricao, v.preco, 100
FROM (VALUES
    (N'bolo-chocolate', N'Bolos', N'Confeitaria da Maria', N'Bolo de chocolate trufado', N'Massa fofinha, brigadeiro cremoso e cobertura de chocolate.', 17.49),
    (N'cupcake-red', N'Cupcakes', N'Cupcake & Cia', N'Cupcake red velvet', N'Massa red velvet com cream cheese suave.', 7.90),
    (N'torta-limao', N'Tortas', N'Bomboniere Bolos', N'Torta de limao', N'Creme de limao, merengue tostado e base crocante.', 39.90),
    (N'brigadeiros', N'Doces gourmet', N'Doce Encanto', N'Caixa de brigadeiros gourmet', N'Sabores variados com confeitos artesanais.', 24.90),
    (N'brownie-nozes', N'Cookies e brownies', N'Cupcake & Cia', N'Brownie com nozes', N'Brownie intenso com nozes e calda de chocolate.', 9.90),
    (N'kit-infantil', N'Kits festa', N'Doce Encanto', N'Kit festa infantil', N'Bolo, docinhos e cupcakes para ate 15 pessoas.', 89.90),
    (N'bolo-foto', N'Personalizados', N'Confeitaria da Maria', N'Bolo personalizado com foto', N'Arte comestivel, recheio a escolha e acabamento premium.', 69.90),
    (N'cookies-recheados', N'Cookies e brownies', N'Cupcake & Cia', N'Cookies recheados', N'Cookies macios com recheios de chocolate, doce de leite e baunilha.', 14.90)
) AS v (codigo, categoria, loja, nome, descricao, preco)
INNER JOIN dbo.categoria c ON c.nome = v.categoria
WHERE NOT EXISTS (SELECT 1 FROM dbo.produto p WHERE p.codigo = v.codigo);
GO

INSERT INTO dbo.cupom (codigo, descricao, tipo, valor, frete_gratis, subtotal_minimo)
SELECT v.codigo, v.descricao, v.tipo, v.valor, v.frete_gratis, v.subtotal_minimo
FROM (VALUES
    (N'UNICAKE10', N'10% de desconto em qualquer pedido.', N'PERCENTUAL', 10, 0, 0),
    (N'UNICAKEESSENCIAL', N'Frete grátis para assinantes do plano Essencial.', N'FRETE_GRATIS', 0, 1, 50),
    (N'UNICAKEEMPRESARIAL', N'15% de desconto e frete grátis para o plano Empresarial.', N'PERCENTUAL', 15, 1, 100),
    (N'UNICAKEPROFISSIONAL', N'20% de desconto e frete grátis para o plano Profissional.', N'PERCENTUAL', 20, 1, 150)
) AS v (codigo, descricao, tipo, valor, frete_gratis, subtotal_minimo)
WHERE NOT EXISTS (SELECT 1 FROM dbo.cupom c WHERE c.codigo = v.codigo);
GO

SELECT 'Banco e tabelas criados com sucesso.' AS status;
GO
