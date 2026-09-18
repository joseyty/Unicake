class Cliente:
    def __init__(self, id=None, nome=None, email=None, telefone=None, data_cadastro=None):
        self.id = id
        self.nome = nome
        self.email = email
        self.telefone = telefone
        self.data_cadastro = data_cadastro

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone,
            "data_cadastro": self.data_cadastro,
        }
