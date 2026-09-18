class Categoria:
    def __init__(self, id=None, nome=None, descricao=None, ativo=True, data_cadastro=None):
        self.id = id
        self.nome = nome
        self.descricao = descricao
        self.ativo = ativo
        self.data_cadastro = data_cadastro

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "ativo": self.ativo,
            "data_cadastro": self.data_cadastro,
        }
