class Pagamento:
    def __init__(self, id=None, pedido_id=None, metodo=None, valor=0.0, status='PENDENTE', codigo_transacao=None, data_criacao=None, data_pagamento=None, data_atualizacao=None):
        self.id = id
        self.pedido_id = pedido_id
        self.metodo = metodo
        self.valor = valor
        self.status = status
        self.codigo_transacao = codigo_transacao
        self.data_criacao = data_criacao
        self.data_pagamento = data_pagamento
        self.data_atualizacao = data_atualizacao

    def to_dict(self):
        return {
            "id": self.id,
            "pedido_id": self.pedido_id,
            "metodo": self.metodo,
            "valor": self.valor,
            "status": self.status,
            "codigo_transacao": self.codigo_transacao,
            "data_criacao": self.data_criacao,
            "data_pagamento": self.data_pagamento,
            "data_atualizacao": self.data_atualizacao,
        }
