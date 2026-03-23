
CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR (150) NOT NULL,
    email VARCHAR (150) NOT NULL,
    password_hash TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) engine=InnoDB;

CREATE TABLE lojas (
    id int unsigned auto_increment PRIMARY KEY,
    nome varchar(150) not null,
    dono_id INT unsigned not null,
    criado_em TIMESTAMP default current_timestamp,

    constraint fk_dono_loja
    foreign key (dono_id)
    references usuarios(id)
    on delete cascade
    on update cascade
) engine=InnoDB;

create table produtos (
    id int unsigned auto_increment primary key,
    loja_id int unsigned not null,
    name varchar(150) not null,
    categoria varchar(100),
    preco decimal (10,2) not NULL,
    estoque int default 0,
    criado_em timestamp default current_timestamp,

    constraint fk_produto_loja
    foreign key (loja_id),
    references lojas(id)
    on delete cascade
    on update cascade
) engine=InnoDB;

create table pedidos (
    id int unsigned auto_increment primary key,
    id_usuario int unsigned not null,
    loja_id int unsigned not null,
    quantidade decimal(10,2) not null,
    status varchar(50) default 'pending',
    criado_em timestamp default current_timestamp,

    constraint fk_pedidos_usuario
    foreign key (usuario_id)
    references usuarios(id)
    on delete cascade
    on update cascade,

    constraint fk_pedidos_loja
    foreign key (loja_id)
    references lojas(id)
    on delete cascade
    on update cascade
) engine=InnoDB;

create table itens_pedido (
    id int unsigned auto_increment primary key,
    pedidos_id int unsigned not null,
    produto id int unsigned not null,
    quantidade int not null,
    preco decimal (10,2) not null,

    constraint fk_item_pedido
    foreign key pedidos_id
    references pedidos(id)
    on delete cascade
    on update cascade,

    constraint fk_item_produto
    foreign key (produto_id)
    references produtos(id)
    on delete cascade
    on update cascade
) engine=InnoDB;

Create index idx_pedidos_usuario on pedidos(usuario_id);
Create index idx_ on pedidos (loja_id);
Create index idx_ on produtos (loja_id);
Create index idx_ on itens_pedido(pedidos_id);

-- data warehose

create table dim_data (
    usuario_id int primary key,
    full_date date not null,
    dia int,
    mes int,
    ano int,
    dia_semana varchar(20)
);

create table dim_usuario (
    usuario_id int primary key,
    nome varchar (150),
    criado_em timestamp
);

create table dim_loja (
    loja_id int primary key,
    name varchar (150),
    criado_em timestamp
);

create table dim_produto (
    produto_id int primary key,
    nome varchar(150),
    categoria varchar(100)
);

create table fato_vendas(
    venda_id SERIAL primary key,
    produto_id INT,
    loja_id INT,
    usuario_id INT,
    data_id INT,
    quantidade INT,
    valor_total numeric(12,2),

    foreign key (produto_id) references dim_produto(produto_id),
    foreign key (loja_id) references dim_loja(loja_id),
    foreign key (usuario_id) references dim_usuario(usuario_id),
    foreign key (data_id) references dim_data(data_id)
);
