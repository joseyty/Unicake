class Endereco:
    def __init__(self, id=None, cliente_id=None, cep=None, estado=None, cidade=None, bairro=None, rua=None, numero=None, complemento=None, referencia=None, data_cadastro=None):
        self.id = id
        self.cliente_id = cliente_id
        self.cep = cep
        self.estado = estado
        self.cidade = cidade
        self.bairro = bairro
        self.rua = rua
        self.numero = numero
        self.complemento = complemento
        self.referencia = referencia
        self.data_cadastro = data_cadastro

    def to_dict(self):
        return {
            "id": self.id,
            "cliente_id": self.cliente_id,
            "cep": self.cep,
            "estado": self.estado,
            "cidade": self.cidade,
            "bairro": self.bairro,
            "rua": self.rua,
            "numero": self.numero,
            "complemento": self.complemento,
            "referencia": self.referencia,
            "data_cadastro": self.data_cadastro,
        }
