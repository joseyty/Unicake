-- ========================================
-- BANCO DE DADOS UNICAKE - SCHEMA COMPLETO
-- ========================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS unicake CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unicake;

-- ========================================
-- TABELAS DO NEGÓCIO
-- ========================================

CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    tipo_usuario ENUM('cliente', 'confeiteiro', 'admin') DEFAULT 'cliente',
    telefone VARCHAR(20),
    avatar_url VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_tipo_usuario (tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lojas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    dono_id INT UNSIGNED NOT NULL,
    descricao TEXT,
    endereco VARCHAR(255),
    telefone VARCHAR(20),
    tempo_entrega_minutos INT DEFAULT 30,
    taxa_entrega DECIMAL(10,2) DEFAULT 0.00,
    avaliacao_media DECIMAL(3,2) DEFAULT 5.00,
    total_avaliacoes INT DEFAULT 0,
    imagem_url VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_dono_loja FOREIGN KEY (dono_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_dono_id (dono_id),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categorias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE produtos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loja_id INT UNSIGNED NOT NULL,
    categoria_id INT UNSIGNED NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    quantidade_estoque INT DEFAULT 0,
    imagem_url VARCHAR(255),
    avaliacao_media DECIMAL(3,2) DEFAULT 5.00,
    total_avaliacoes INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_loja_produto FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_categoria_produto FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_loja_id (loja_id),
    INDEX idx_categoria_id (categoria_id),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE opcoes_produto (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produto_id INT UNSIGNED NOT NULL,
    nome VARCHAR(100) NOT NULL,
    valor_adicional DECIMAL(10,2) DEFAULT 0.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_produto_opcao FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_produto_id (produto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedidos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    loja_id INT UNSIGNED NOT NULL,
    status ENUM('pendente', 'confirmado', 'em_preparo', 'pronto', 'entregando', 'entregue', 'cancelado') DEFAULT 'pendente',
    valor_total DECIMAL(10,2) NOT NULL,
    taxa_entrega DECIMAL(10,2) DEFAULT 0.00,
    endereco_entrega VARCHAR(255),
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_pedido FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_loja_pedido FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_loja_id (loja_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE itens_pedido (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT UNSIGNED NOT NULL,
    produto_id INT UNSIGNED NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pedido_item FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_produto_item FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_pedido_id (pedido_id),
    INDEX idx_produto_id (produto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE carrinho (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    produto_id INT UNSIGNED NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    opcoes_selecionadas JSON,
    adicionado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_carrinho FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_produto_carrinho FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_usuario_produto (usuario_id, produto_id),
    INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE avaliacoes_produto (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produto_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_produto_avaliacao FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_avaliacao_prod FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_produto_id (produto_id),
    INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE avaliacoes_loja (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loja_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_loja_avaliacao FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usuario_avaliacao_loja FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_loja_id (loja_id),
    INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE historico_pedido (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT UNSIGNED NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    observacao TEXT,
    alterado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pedido_historico FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_pedido_id (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELAS DE DATA WAREHOUSE (OPCIONAL)
-- ========================================

CREATE TABLE dim_data (
    data_id INT PRIMARY KEY,
    data DATE NOT NULL UNIQUE,
    dia INT,
    mes INT,
    ano INT,
    trimestre INT,
    dia_semana VARCHAR(20),
    eh_fim_de_semana BOOLEAN
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_usuario (
    usuario_id INT UNSIGNED PRIMARY KEY,
    nome VARCHAR(150),
    tipo VARCHAR(20),
    cidade VARCHAR(100),
    criado_em TIMESTAMP,
    CONSTRAINT fk_dim_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_loja (
    loja_id INT UNSIGNED PRIMARY KEY,
    nome VARCHAR(150),
    dono_id INT UNSIGNED,
    cidade VARCHAR(100),
    criado_em TIMESTAMP,
    CONSTRAINT fk_dim_loja FOREIGN KEY (loja_id) REFERENCES lojas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_produto (
    produto_id INT UNSIGNED PRIMARY KEY,
    nome VARCHAR(150),
    categoria_id INT UNSIGNED,
    loja_id INT UNSIGNED,
    preco DECIMAL(10,2),
    CONSTRAINT fk_dim_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fato_vendas (
    venda_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    data_id INT,
    usuario_id INT UNSIGNED,
    loja_id INT UNSIGNED,
    produto_id INT UNSIGNED,
    quantidade INT,
    valor_venda DECIMAL(10,2),
    INDEX idx_data (data_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_loja (loja_id),
    INDEX idx_produto (produto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- CHAT MESSAGES (PARA CHAT EM TEMPO REAL)
-- ========================================

CREATE TABLE chat_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    loja_id INT UNSIGNED,
    mensagem TEXT NOT NULL,
    tipo ENUM('texto', 'imagem', 'arquivo') DEFAULT 'texto',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_usuario_chat FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_loja_chat FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_loja_id (loja_id),
    INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
