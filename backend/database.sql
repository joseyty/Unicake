
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
    INDEX idx_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE produtos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loja_id INT UNSIGNED NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    categoria_id INT UNSIGNED,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT DEFAULT 0,
    imagem_url VARCHAR(255),
    tempo_preparo_minutos INT DEFAULT 30,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_produto_loja FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_loja_id (loja_id),
    INDEX idx_categoria_id (categoria_id),
    INDEX idx_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para opções de personalização (recheios, coberturas, etc.)
CREATE TABLE opcoes_produto (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produto_id INT UNSIGNED NOT NULL,
    tipo_opcao VARCHAR(100) NOT NULL, -- ex: 'recheio', 'cobertura', 'tamanho'
    nome VARCHAR(150) NOT NULL,
    preco_adicional DECIMAL(10,2) DEFAULT 0.00,
    obrigatoria BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT fk_opcao_produto FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_produto_id (produto_id),
    INDEX idx_tipo_opcao (tipo_opcao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedidos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    loja_id INT UNSIGNED NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    taxa_entrega DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('pendente', 'confirmado', 'preparando', 'pronto', 'saiu_para_entrega', 'entregue', 'cancelado') DEFAULT 'pendente',
    data_entrega_prevista DATETIME,
    endereco_entrega VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(255),
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pedidos_loja FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_loja_id (loja_id),
    INDEX idx_status (status),
    INDEX idx_criado_em (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE itens_pedido (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT UNSIGNED NOT NULL,
    produto_id INT UNSIGNED NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    opcoes JSON, -- Armazena as opções selecionadas em JSON
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_item_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_item_produto FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_pedido_id (pedido_id),
    INDEX idx_produto_id (produto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para carrinho de compras temporário
CREATE TABLE carrinho (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    loja_id INT UNSIGNED NOT NULL,
    produto_id INT UNSIGNED NOT NULL,
    quantidade INT NOT NULL,
    opcoes JSON,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_carrinho_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_carrinho_loja FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_carrinho_produto FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_loja_id (loja_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para avaliações de produtos
CREATE TABLE avaliacoes_produto (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produto_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_aval_produto FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_aval_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_produto_id (produto_id),
    INDEX idx_usuario_id (usuario_id),
    UNIQUE KEY uk_usuario_produto (usuario_id, produto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para avaliações de lojas
CREATE TABLE avaliacoes_loja (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loja_id INT UNSIGNED NOT NULL,
    usuario_id INT UNSIGNED NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_aval_loja FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_aval_usuario_loja FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_loja_id (loja_id),
    INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela para histórico de status de pedidos
CREATE TABLE historico_pedido (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT UNSIGNED NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_hist_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_pedido_id (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABELAS PARA ANÁLISE (DATA WAREHOUSE)
-- ========================================

CREATE TABLE dim_data (
    data_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    data_completa DATE NOT NULL UNIQUE,
    dia INT,
    mes INT,
    ano INT,
    dia_semana VARCHAR(20),
    INDEX idx_data (data_completa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_usuario (
    usuario_id INT UNSIGNED PRIMARY KEY,
    nome VARCHAR(150),
    tipo_usuario VARCHAR(50),
    criado_em TIMESTAMP,
    
    CONSTRAINT fk_dim_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_loja (
    loja_id INT UNSIGNED PRIMARY KEY,
    nome VARCHAR(150),
    dono_id INT UNSIGNED,
    criado_em TIMESTAMP,
    
    CONSTRAINT fk_dim_loja FOREIGN KEY (loja_id)
        REFERENCES lojas(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dim_produto (
    produto_id INT UNSIGNED PRIMARY KEY,
    nome VARCHAR(150),
    categoria VARCHAR(100),
    loja_id INT UNSIGNED,
    
    CONSTRAINT fk_dim_produto FOREIGN KEY (produto_id)
        REFERENCES produtos(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fato_vendas (
    venda_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    produto_id INT UNSIGNED,
    loja_id INT UNSIGNED,
    usuario_id INT UNSIGNED,
    data_id INT UNSIGNED,
    quantidade INT,
    valor_total DECIMAL(12,2),
    
    CONSTRAINT fk_fv_produto FOREIGN KEY (produto_id)
        REFERENCES dim_produto(produto_id) ON DELETE SET NULL,
    CONSTRAINT fk_fv_loja FOREIGN KEY (loja_id)
        REFERENCES dim_loja(loja_id) ON DELETE SET NULL,
    CONSTRAINT fk_fv_usuario FOREIGN KEY (usuario_id)
        REFERENCES dim_usuario(usuario_id) ON DELETE SET NULL,
    CONSTRAINT fk_fv_data FOREIGN KEY (data_id)
        REFERENCES dim_data(data_id) ON DELETE SET NULL,
    INDEX idx_data_id (data_id),
    INDEX idx_loja_id (loja_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ========================================

CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_loja ON pedidos(loja_id);
CREATE INDEX idx_produtos_loja ON produtos(loja_id);
CREATE INDEX idx_itens_pedido_pedido ON itens_pedido(pedido_id);
