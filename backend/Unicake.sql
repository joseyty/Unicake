CREATE DATABASE unicake;
USE unicake;

-- 👤 Usuários (cliente, admin, confeiteiro)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(100),
  tipo ENUM('cliente', 'admin', 'confeiteiro') DEFAULT 'cliente'
);

-- 🏪 Lojas (confeiteiros)
CREATE TABLE lojas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  descricao TEXT,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 🎂 Produtos
CREATE TABLE produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100),
  descricao TEXT,
  preco DECIMAL(10,2),
  loja_id INT,
  FOREIGN KEY (loja_id) REFERENCES lojas(id)
);

-- 🛒 Carrinho
CREATE TABLE carrinho (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 📦 Itens do carrinho
CREATE TABLE carrinho_itens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  carrinho_id INT,
  produto_id INT,
  quantidade INT,
  FOREIGN KEY (carrinho_id) REFERENCES carrinho(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- 🧾 Pedidos
CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  data DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 📋 Itens do pedido
CREATE TABLE itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  produto_id INT,
  quantidade INT,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (produto_id) REFERENCES produtos(id)
);