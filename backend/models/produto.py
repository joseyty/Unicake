class Produto:
    def __init__(self, id=None, categoria_id=None, codigo=None, loja=None, nome=None, descricao=None, preco=None, estoque=0, status='ATIVO', data_cadastro=None):
        self.id = id
        self.categoria_id = categoria_id
        self.codigo = codigo
        self.loja = loja
        self.nome = nome
        self.descricao = descricao
        self.preco = preco
        self.estoque = estoque
        self.status = status
        self.data_cadastro = data_cadastro

    def to_dict(self):
        return {
            "id": self.id,
            "categoria_id": self.categoria_id,
            "codigo": self.codigo,
            "loja": self.loja,
            "nome": self.nome,
            "descricao": self.descricao,
            "preco": self.preco,
            "estoque": self.estoque,
            "status": self.status,
            "data_cadastro": self.data_cadastro,
        }
