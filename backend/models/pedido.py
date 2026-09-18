class Pedido:
    def __init__(self, id=None, cliente_id=None, endereco_id=None, valor_total=0.0, status='PENDENTE', observacoes=None, data_criacao=None, data_atualizacao=None):
        self.id = id
        self.cliente_id = cliente_id
        self.endereco_id = endereco_id
        self.valor_total = valor_total
        self.status = status
        self.observacoes = observacoes
        self.data_criacao = data_criacao
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "endereco_id": self.endereco_id,
            "valor_total": self.valor_total,
            "status": self.status,
            "observacoes": self.observacoes,
            "data_criacao": self.data_criacao,
            "data_atualizacao": self.data_atualizacao,
        }
