-- ========================================
-- SCRIPT DE SETUP DO BANCO DE DADOS UNICAKE
-- Carrega dados iniciais para teste
-- ========================================

USE unicake;

-- ========================================
-- INSERIR USUÁRIOS
-- ========================================

INSERT INTO usuarios (nome, email, password_hash, tipo_usuario, telefone, ativo) VALUES
('Admin UniCake', 'admin@unicake.com', '$2y$10$admin_hash_example', 'admin', '11999999999', TRUE),
('Maria Silva', 'maria@confeitaria.com', '$2y$10$maria_hash_example', 'confeiteiro', '11988888888', TRUE),
('João Santos', 'joao@doces.com', '$2y$10$joao_hash_example', 'confeiteiro', '11987777777', TRUE),
('Cliente Teste', 'cliente@email.com', '$2y$10$cliente_hash_example', 'cliente', '11986666666', TRUE),
('Ana Oliveira', 'ana@confeitaria.com', '$2y$10$ana_hash_example', 'confeiteiro', '11985555555', TRUE);

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
('Confeitaria Maria 🎂', 2, 'Bolos artesanais feitos com amor', 'Rua das Flores, 123 - São Paulo, SP', '11988888888', 30, 5.00, 4.8, 45, TRUE),
('Doces do João 🍰', 3, 'Especialidade em cupcakes gourmet', 'Av. Paulista, 1000 - São Paulo, SP', '11987777777', 25, 3.50, 4.9, 32, TRUE),
('Confeitaria Ana 💕', 5, 'Tortas e bolos para ocasiões especiais', 'Rua Oscar Freire, 500 - São Paulo, SP', '11985555555', 40, 7.00, 4.7, 28, TRUE);

-- ========================================
-- INSERIR PRODUTOS
-- ========================================

INSERT INTO produtos (loja_id, categoria_id, nome, descricao, preco, quantidade_estoque, avaliacao_media, total_avaliacoes, ativo) VALUES
-- Loja 1 - Maria
(1, 1, 'Bolo de Chocolate Gourmet', 'Bolo de chocolate belga com ganache', 85.00, 15, 4.9, 12, TRUE),
(1, 1, 'Bolo de Red Velvet', 'Clássico bolo vermelho com cobertura de cream cheese', 75.00, 10, 4.8, 8, TRUE),
(1, 1, 'Bolo de Cenoura', 'Bolo caseiro com calda de chocolate', 45.00, 20, 4.7, 15, TRUE),
(1, 2, 'Cupcake de Morango', 'Cupcake macio com cobertura de morango', 25.00, 30, 4.8, 18, TRUE),
(1, 5, 'Torta de Chocolate', 'Torta com camadas de chocolate e mousse', 120.00, 8, 4.9, 10, TRUE),

-- Loja 2 - João
(2, 2, 'Cupcake de Baunilha Premium', 'Cupcake premium com cobertura de buttercream', 35.00, 40, 4.9, 25, TRUE),
(2, 2, 'Cupcake de Chocolate com Calda', 'Chocolate cremoso com calda quente', 35.00, 35, 4.8, 22, TRUE),
(2, 3, 'Brownie Clássico', 'Brownie denso e macio de chocolate belga', 18.00, 50, 4.7, 30, TRUE),
(2, 4, 'Trufas de Chocolate', 'Caixa com 12 trufas artesanais', 40.00, 25, 4.9, 20, TRUE),

-- Loja 3 - Ana
(3, 1, 'Bolo de Damasco', 'Bolo leve com cobertura de damasco', 65.00, 12, 4.8, 14, TRUE),
(3, 5, 'Torta de Morango', 'Torta com calda de morango e chantilly', 110.00, 6, 4.9, 9, TRUE),
(3, 4, 'Mini Pavês', 'Caixa com 6 pavês gourmet', 50.00, 18, 4.7, 16, TRUE);

-- ========================================
-- INSERIR OPÇÕES DE PRODUTOS
-- ========================================

INSERT INTO opcoes_produto (produto_id, nome, valor_adicional) VALUES
-- Bolo de Chocolate Gourmet
(1, 'Cobertura de Nozes', 5.00),
(1, 'Cobertura de Morango', 8.00),
(1, 'Recheio extra', 10.00),

-- Cupcake de Baunilha
(6, 'Com granulado colorido', 2.00),
(6, 'Com pérolas comestíveis', 3.00);

-- ========================================
-- INSERIR PEDIDOS
-- ========================================

INSERT INTO pedidos (usuario_id, loja_id, status, valor_total, taxa_entrega, endereco_entrega, observacoes) VALUES
(4, 1, 'entregue', 95.00, 5.00, 'Rua Principal, 100 - São Paulo', 'Entrega realizada'),
(4, 2, 'em_preparo', 70.00, 3.50, 'Rua Principal, 100 - São Paulo', 'Preparando o pedido'),
(4, 1, 'pendente', 150.00, 5.00, 'Rua Principal, 100 - São Paulo', 'Aguardando confirmação');

-- ========================================
-- INSERIR ITENS DE PEDIDO
-- ========================================

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, observacoes) VALUES
(1, 1, 1, 85.00, 'Sem aditivos alergênicos'),
(1, 4, 1, 25.00, 'Extra cobertura'),
(2, 6, 2, 35.00, 'Com granulado'),
(3, 5, 1, 120.00, 'Sem amendoim');

-- ========================================
-- INSERIR AVALIAÇÕES DE PRODUTOS
-- ========================================

INSERT INTO avaliacoes_produto (produto_id, usuario_id, estrelas, comentario) VALUES
(1, 4, 5, 'Excelente! Chegou perfeito e muito saboroso'),
(4, 4, 5, 'Cupcake super macio e delicioso'),
(6, 4, 4, 'Muito bom, mas poderia ter mais recheio');

-- ========================================
-- INSERIR AVALIAÇÕES DE LOJAS
-- ========================================

INSERT INTO avaliacoes_loja (loja_id, usuario_id, estrelas, comentario) VALUES
(1, 4, 5, 'Atendimento excelente e produto de qualidade'),
(2, 4, 5, 'Entrega rápida e cupcakes incríveis'),
(1, 4, 4, 'Ótimos produtos, entrega dentro do prazo');

-- ========================================
-- INSERIR HISTÓRICO DE PEDIDOS
-- ========================================

INSERT INTO historico_pedido (pedido_id, status_anterior, status_novo, observacao) VALUES
(1, NULL, 'pendente', 'Pedido criado'),
(1, 'pendente', 'confirmado', 'Confirmado pelo cliente'),
(1, 'confirmado', 'em_preparo', 'Iniciou o preparo'),
(1, 'em_preparo', 'pronto', 'Pronto para entrega'),
(1, 'pronto', 'entregando', 'Saiu para entrega'),
(1, 'entregando', 'entregue', 'Entregue com sucesso');
