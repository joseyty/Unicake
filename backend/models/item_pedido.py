class ItemPedido:
    def __init__(self, id=None, pedido_id=None, produto_id=None, nome_produto=None, quantidade=0, preco_unitario=0.0, subtotal=0.0):
        self.id = id
        self.pedido_id = pedido_id
        self.produto_id = produto_id
        self.nome_produto = nome_produto
        self.quantidade = quantidade
        self.preco_unitario = preco_unitario
        self.subtotal = subtotal

    def to_dict(self):
        return {
            "id": self.id,
            "pedido_id": self.pedido_id,
            "produto_id": self.produto_id,
            "nome_produto": self.nome_produto,
            "quantidade": self.quantidade,
            "preco_unitario": self.preco_unitario,
            "subtotal": self.subtotal,
        }
