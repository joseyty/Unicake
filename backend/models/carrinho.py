class Carrinho:
    def __init__(self, id=None, cliente_id=None, data_criacao=None, data_atualizacao=None):
        self.id = id
        self.cliente_id = cliente_id
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "data_criacao": self.data_criacao,
            "data_atualizacao": self.data_atualizacao,
        }
