-- ========================================
-- SCRIPT DE SETUP DO BANCO DE DADOS UNICAKE
-- Carrega dados iniciais para teste
-- ========================================

-- Limpar dados existentes (comentar se não quiser perder dados)
-- SET FOREIGN_KEY_CHECKS=0;
-- TRUNCATE TABLE fato_vendas;
-- TRUNCATE TABLE historico_pedido;
-- TRUNCATE TABLE avaliacoes_loja;
-- TRUNCATE TABLE avaliacoes_produto;
-- TRUNCATE TABLE carrinho;
-- TRUNCATE TABLE itens_pedido;
-- TRUNCATE TABLE pedidos;
-- TRUNCATE TABLE opcoes_produto;
-- TRUNCATE TABLE produtos;
-- TRUNCATE TABLE categorias;
-- TRUNCATE TABLE lojas;
-- TRUNCATE TABLE usuarios;
-- SET FOREIGN_KEY_CHECKS=1;

USE unicake;

-- ========================================
-- INSERIR USUÁRIOS
-- ========================================

INSERT INTO usuarios (nome, email, password_hash, tipo_usuario, telefone, ativo) VALUES
('Admin UniCake', 'admin@unicake.com', '$2y$10$admin_hash_example', 'admin', '11999999999', TRUE),
('Maria Silva', 'maria@confeitaria.com', '$2y$10$maria_hash_example', 'confeiteiro', '11988888888', TRUE),
('João Santos', 'joao@doces.com', '$2y$10$joao_hash_example', 'confeiteiro', '11987777777', TRUE),
('Cliente Teste', 'cliente@email.com', '$2y$10$cliente_hash_example', 'cliente', '11986666666', TRUE);

-- ========================================
-- INSERIR CATEGORIAS
-- ========================================

INSERT INTO categorias (nome, descricao, ativo) VALUES
('Bolos', 'Bolos personalizados para todos os sabores', TRUE),
('Cupcakes', 'Cupcakes decorados e saborosos', TRUE),
('Brownies', 'Brownies e trufas de chocolate', TRUE),
('Docinhos', 'Doces diversos para festas', TRUE),
('Tortas', 'Tortas especiais e sofisticadas', TRUE);

-- ========================================
-- INSERIR LOJAS
-- ========================================

INSERT INTO lojas (nome, dono_id, descricao, endereco, telefone, tempo_entrega_minutos, taxa_entrega, avaliacao_media, total_avaliacoes, ativo) VALUES
('Confeitaria Maria 🎂', 1, 'Bolos artesanais feitos com amor', 'Rua das Flores, 123 - São Paulo, SP', '11988888888', 30, 5.00, 4.8, 45, TRUE),
('Doces do João 🧁', 2, 'Especialista em cupcakes e trufas', 'Av. Paulista, 456 - São Paulo, SP', '11987777777', 45, 8.00, 4.9, 32, TRUE);

-- ========================================
-- INSERIR PRODUTOS - CONFEITARIA MARIA
-- ========================================

INSERT INTO produtos (loja_id, nome, descricao, categoria_id, preco, estoque, tempo_preparo_minutos, ativo) VALUES
(1, 'Bolo Chocolate Belga', 'Bolo cremoso de chocolate belga com brigadeiro', 1, 89.90, 10, 30, TRUE),
(1, 'Bolo Red Velvet', 'Clássico red velvet com cream cheese', 1, 94.90, 8, 30, TRUE),
(1, 'Bolo Floresta Negra', 'Delicioso bolo com calda de cereja', 1, 99.90, 5, 45, TRUE),
(1, 'Cupcake de Vanilla', 'Cupcake macio de baunilha com cobertura de buttercream', 2, 15.90, 20, 15, TRUE),
(1, 'Brownie Triplo Chocolate', 'Brownie intenso com chocolate meio amargo', 3, 18.90, 15, 20, TRUE);

-- ========================================
-- INSERIR PRODUTOS - DOCES DO JOÃO
-- ========================================

INSERT INTO produtos (loja_id, nome, descricao, categoria_id, preco, estoque, tempo_preparo_minutos, ativo) VALUES
(2, 'Festa de Cupcakes (6 un)', 'Kit com 6 cupcakes sortidos e personalizados', 2, 79.90, 12, 40, TRUE),
(2, 'Trufa Gourmet (500g)', 'Caixa com trufas gourmet selecionadas', 3, 65.00, 8, 25, TRUE),
(2, 'Torta de Sorvete Gelada', 'Torta refrigerada com sorvete e cobertura chocolate', 5, 120.00, 4, 60, TRUE),
(2, 'Docinhos da Festa (30 un)', 'Sortimento de 30 docinhos para sua festa', 4, 85.90, 6, 45, TRUE);

-- ========================================
-- INSERIR OPÇÕES DE PERSONALIZAÇÃO
-- ========================================

INSERT INTO opcoes_produto (produto_id, tipo_opcao, nome, preco_adicional, obrigatoria) VALUES
-- Opções para Bolo Chocolate Belga
(1, 'recheio', 'Recheio de Chocolate', 0.00, TRUE),
(1, 'recheio', 'Fruta Vermelha', 15.00, FALSE),
(1, 'recheio', 'Doce de Leite', 12.00, FALSE),
(1, 'cobertura', 'Chocolate em Pó', 0.00, TRUE),
(1, 'cobertura', 'Morango Fresco', 8.00, FALSE),
(1, 'tamanho', 'Pequeno (4 pessoas)', 0.00, TRUE),
(1, 'tamanho', 'Médio (6 pessoas)', 20.00, FALSE),
(1, 'tamanho', 'Grande (10 pessoas)', 40.00, FALSE),
-- Opções para Cupcake de Vanilla
(4, 'sabor_cobertura', 'Morango', 0.00, TRUE),
(4, 'sabor_cobertura', 'Chocolate', 2.00, FALSE),
(4, 'sabor_cobertura', 'Café', 2.00, FALSE);

-- ========================================
-- INSERIR AVALIAÇÕES EXEMPLO
-- ========================================

INSERT INTO avaliacoes_loja (loja_id, usuario_id, estrelas, comentario) VALUES
(1, 4, 5, 'Excelente qualidade! Os bolos chegaram perfeitos e deliciosos. Recomendo!'),
(1, 4, 4, 'Bom atendimento, poderia melhorar o tempo de entrega.');

INSERT INTO avaliacoes_produto (produto_id, usuario_id, estrelas, comentario) VALUES
(1, 4, 5, 'Melhor bolo que já comi!'),
(4, 4, 5, 'Cupcakes maravilhosos, bem decorados!');

-- ========================================
-- INSERIR DIMENSÕES DO DATA WAREHOUSE
-- ========================================

-- Preencher dimensão de data
INSERT INTO dim_data (data_completa, dia, mes, ano, dia_semana)
SELECT DATE(NOW()), DAY(NOW()), MONTH(NOW()), YEAR(NOW()), DAYNAME(NOW());

-- Preencher dimensões dos mestres
INSERT INTO dim_usuario (usuario_id, nome, tipo_usuario, criado_em)
SELECT id, nome, tipo_usuario, criado_em FROM usuarios
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO dim_loja (loja_id, nome, dono_id, criado_em)
SELECT id, nome, dono_id, criado_em FROM lojas
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO dim_produto (produto_id, nome, categoria, loja_id)
SELECT p.id, p.nome, c.nome, p.loja_id
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- ========================================
-- INFORMAÇÕES ÚTEIS
-- ========================================
/*
DADOS DE ACESSO PADRÃO (trocar após primeiro acesso):
- Admin: admin@unicake.com / senha: admin123
- Maria (Confeiteira): maria@confeitaria.com / senha: maria123
- João (Confeiteira): joao@doces.com / senha: joao123
- Cliente Teste: cliente@email.com / senha: cliente123

COMANDOS ÚTEIS:

1. Ver todas as lojas e suas avaliações:
   SELECT id, nome, avaliacao_media, total_avaliacoes FROM lojas;

2. Ver produtos de uma loja:
   SELECT p.id, p.nome, p.preco, p.estoque FROM produtos p 
   WHERE p.loja_id = 1;

3. Ver opções de um produto:
   SELECT tipo_opcao, nome, preco_adicional FROM opcoes_produto 
   WHERE produto_id = 1;

4. Ver pedidos de um usuário:
   SELECT p.id, p.total, p.status, p.criado_em FROM pedidos p
   WHERE p.usuario_id = 1 ORDER BY p.criado_em DESC;

5. Parar e resetar auto_increment:
   ALTER TABLE usuarios AUTO_INCREMENT = 1;
*/
