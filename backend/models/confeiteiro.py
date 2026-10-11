class Confeiteiro:
    def __init__(self, id=None, nome=None, nome_loja=None, cnpj=None, email=None, telefone=None, ativo=True, data_cadastro=None):
        self.id = id
        self.nome = nome
        self.nome_loja = nome_loja
        self.cnpj = cnpj
        self.email = email
        self.telefone = telefone
        self.ativo = ativo
        self.data_cadastro = data_cadastro

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "nome_loja": self.nome_loja,
            "cnpj": self.cnpj,
            "email": self.email,
            "telefone": self.telefone,
            "ativo": self.ativo,
            "data_cadastro": self.data_cadastro,
        }
