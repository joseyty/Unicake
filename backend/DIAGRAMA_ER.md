# 📊 Diagrama Entidade-Relacionamento (ER) - UniCake

## Modelo Relacional

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE VENDA - UNICAKE                       │
└─────────────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │   USUARIOS   │
                        ├──────────────┤
                        │ id (PK)      │
                        │ nome         │
                        │ email (UQ)   │
                        │ password_h.  │
                        │ tipo_usuario │
    ◄───┬─────────────┬─┤ ativo       │
        │             │ │ criado_em    │
        │             │ └──────────────┘
        │             │
        │ dono_id     │
        │ (FK)        │ usuario_id (FK)
        │             │
        │      ┌──────┴─────────────┬─────────────────┐
        │      │                    │                 │
    ┌───┴──┬──┴────┐   ┌───────┬────┴─────┐   ┌────┬─┴──────┐
    │ LOJAS           │   │      PEDIDOS    │   │ CARRINHO   │
    ├────────────────┤   ├────────────────┤   ├────────────┤
    │ id (PK)        │   │ id (PK)        │   │ id (PK)    │
    │ nome           │   │ usuario_id (FK)├───│usuario_id(F)│
    │ dono_id (FK)   │   │ loja_id (FK)   │   │ loja_id (F)│
    │ endereco       │   │ total          │   │ produto_id(F)│
    │ tempo_entrega  │   │ taxa_entrega   │   │ quantidade │
    │ taxa_entrega   │   │ status         │   │ opcoes     │
    │ avaliacao_med. │   │ endereco_e.    │   │ criado_em  │
    │ total_aval.    │   │ data_entrega   │   └────────────┘
    │ ativo          │   │ criado_em      │
    │ criado_em      │   └───────┬────────┘
    └────────┬───────┘           │
             │                   │ pedido_id (FK)
             │                   │
             │ loja_id (FK)  ┌───┴────────────┐
             │               │ ITENS_PEDIDO   │
             │               ├────────────────┤
             │               │ id (PK)        │
             │               │ pedido_id (FK) │
             ├───────────────┤ produto_id (FK)│
             │               │ quantidade     │
             │               │ preco_unitario │
             │ loja_id (FK)  │ opcoes (JSON)  │
             │               └────────────────┘
        ┌────┴──────────────┐
        │   PRODUTOS        │
        ├───────────────────┤
        │ id (PK)           │
        │ loja_id (FK)      │
        │ nome              │
        │ categoria_id (FK) │
        │ preco             │
        │ estoque           │
        │ tempo_preparo     │
        │ ativo             │
        └────┬────────┬─────┘
             │        │
             │        │        ┌──────────────────────────┐
             │        └────────┤ OPCOES_PRODUTO           │
             │                 ├──────────────────────────┤
             │ produto_id(FK)  │ id (PK)                  │
             │                 │ produto_id (FK)          │
             │                 │ tipo_opcao (recheio...)  │
             │                 │ nome                     │
             │                 │ preco_adicional          │
             │                 │ obrigatoria              │
             │                 └──────────────────────────┘
             │
             ├─────────────┐   ┌──────────────────────────┐
             │             └───┤ AVALIACOES_PRODUTO       │
             │ produto_id(FK)  ├──────────────────────────┤
             │                 │ id (PK)                  │
             │                 │ produto_id (FK)          │
             │                 │ usuario_id (FK)          │
             │                 │ estrelas (1-5)           │
             │                 │ comentario               │
             │                 └──────────────────────────┘
             │
    ┌────────┴──────┐
    │CATEGORIAS      │        ┌──────────────────────────┐
    ├────────────────┤        │ AVALIACOES_LOJA          │
    │ id (PK)        │        ├──────────────────────────┤
    │ nome (UQ)      │        │ id (PK)                  │
    │ descricao      │        │ loja_id (FK)             │
    │ ativo          │        │ usuario_id (FK)          │
    └────────┬───────┘        │ estrelas (1-5)           │
             │                │ comentario               │
             │ categoria_id   └──────────────────────────┘
             │ (FK)
             └─── referenciado por PRODUTOS
```

---

## 🔑 Legenda

- **PK** = Primary Key (Chave Primária)
- **FK** = Foreign Key (Chave Estrangeira)
- **UQ** = Unique (Único)
- **◄──** = Relacionamento principal

---

## 📍 Relacionamentos Principais

### 1. Usuários → Lojas (1:N)
```
Um usuário pode ser dono de múltiplas lojas
1 USUARIO = N LOJAS
```

### 2. Lojas → Produtos (1:N)
```
Uma loja tem múltiplos produtos
1 LOJA = N PRODUTOS
```

### 3. Produtos → Opções (1:N)
```
Um produto pode ter múltiplas opções de personalização
1 PRODUTO = N OPCOES_PRODUTO
```

### 4. Usuários → Pedidos (1:N)
```
Um cliente pode fazer múltiplos pedidos
1 USUARIO = N PEDIDOS
```

### 5. Lojas → Pedidos (1:N)
```
Uma loja recebe múltiplos pedidos
1 LOJA = N PEDIDOS
```

### 6. Pedidos → Itens (1:N)
```
Um pedido tem múltiplos itens
1 PEDIDO = N ITENS_PEDIDO
```

### 7. Produtos → Itens (1:N)
```
Um produto pode estar em múltiplos itens de pedido
1 PRODUTO = N ITENS_PEDIDO
```

### 8. Usuários → Avaliações (1:N)
```
Um usuário pode fazer múltiplas avaliações
1 USUARIO = N AVALIACOES_PRODUTO
1 USUARIO = N AVALIACOES_LOJA
```

### 9. Produtos → Avaliações (1:N)
```
Um produto pode ter múltiplas avaliações
1 PRODUTO = N AVALIACOES_PRODUTO
```

### 10. Lojas → Avaliações (1:N)
```
Uma loja pode ter múltiplas avaliações
1 LOJA = N AVALIACOES_LOJA
```

---

## 🔐 Constraints Importantes

### Chaves Únicas (UNIQUE)

| Tabela | Campo | Razão |
|--------|-------|-------|
| `usuarios` | `email` | Cada email é único para login |
| `categorias` | `nome` | Evita categorias duplicadas |
| `avaliacoes_produto` | `(usuario_id, produto_id)` | Um usuário avalia cada produto 1x |

### Integridade Referencial (ON DELETE CASCADE)

Quando uma linha é deletada:

```sql
usuarios → lojas: Se usuario é deletado, lojas do usuario são deletadas
usuarios → pedidos: Se usuario é deletado, pedidos são deletados
lojas → produtos: Se loja é deletada, produtos são deletados
lojas → pedidos: Se loja é deletada, pedidos são deletados
pedidos → itens_pedido: Se pedido é deletado, itens são deletados
produtos → itens_pedido: Se produto é deletado, itens são deletados (em produção, preferir restrição)
```

---

## 📊 Fluxo de Dados Típico

```
1. Cliente (usuário) entra no site
   └─ Consulta LOJAS → PRODUTOS → opcoes_produto

2. Cliente seleciona produtos e personaliza opções
   └─ Insere items em CARRINHO

3. Cliente finaliza compra
   └─ Cria PEDIDOS e ITENS_PEDIDO
   └─ Limpa CARRINHO

4. Confeiteiro acompanha pedido
   └─ Atualiza status em PEDIDOS
   └─ Registra histórico em HISTORICO_PEDIDO

5. Cliente avalia após entrega
   └─ Insere em AVALIACOES_PRODUTO e AVALIACOES_LOJA
   └─ Atualiza média em LOJAS

6. Sistema gera relatórios
   └─ Consulta DIM_* e FATO_VENDAS para análises
```

---

## 🛠️ Tabelas de Suporte

### HISTORICO_PEDIDO
Auditoria de mudanças de status:
```
Pedido #123
- pendente → confirmado (02:15)
- confirmado → preparando (02:30)
- preparando → pronto (11:00)
- pronto → saiu_para_entrega (11:15)
- saiu_para_entrega → entregue (12:30)
```

### Data Warehouse (DIM + FATO)
Para análises como:
- Receita por loja / mês
- Produtos mais vendidos
- Tempo médio de preparação
- Satisfação do cliente média

---

## 📈 NoSQL vs SQL (Por quê SQL aqui)

### JSON em SQL ✅
A tabela `itens_pedido` usa uma coluna **JSON** para armazenar opções:

```json
"opcoes": [
  {"tipo": "recheio", "valor": "Chocolate", "preco_adicional": 0},
  {"tipo": "tamanho", "valor": "Grande", "preco_adicional": 25.00}
]
```

**Vantagens:**
- Flexibilidade nas opções (novos tipos sem alterar tabela)
- Mantém histórico de qual opção foi escolhida
- Menos tabelas de relacionamento

**Mas SQL mantém integridade:**
- Relacionamentos definidos
- Transações ACID
- Integridade de dados
- Fácil de fazer relatórios

---

## 💡 Extensões Futuras

### Possíveis novas tabelas:

```
CUPONS
├── id
├── codigo
├── desconto_porcento
├── validade
└── usos_restantes

AVALIACOES_ENTREGA
├── id
├── pedido_id (FK)
├── tempo_real_minutos
├── avaliacao_entregador
└── comentario

ENDERECOSCOMPRAS
├── id
├── usuario_id (FK)
├── tipo (residencial/comercial)
├── endereco
├── numero
└── padrao (boolean)

NOTIFICACOES
├── id
├── usuario_id (FK)
├── tipo (pedido_saiu, produto_novo, promo)
├── titulo
└── lido_em
```

---

Generate by: UniCake DB Schema v2.0 (2026-04-07)
