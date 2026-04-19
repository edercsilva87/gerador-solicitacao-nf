# Gerador de Solicitacao de NF

Projeto local simples em HTML, CSS e JavaScript para preencher dados de solicitacao de nota fiscal e gerar uma visualizacao no formato usado em email.

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Use `Cadastro Cód. Sap` para incluir, editar ou excluir codigos na base compartilhada de `origem` e `destino`, incluindo os codigos padrao e os manuais.
3. Use `Cadastro Transportadora` para incluir, editar ou excluir transportadoras no mesmo padrao, incluindo itens padrao e manuais.
4. Use as listas prontas de `origem`, `destino` e `transportadora` digitando codigo ou descricao.
5. Preencha os `emails de destino`.
6. Digite o codigo SAP do produto para preencher descricao e valor automaticamente.
7. Ajuste somente quantidade, peso total e codigo patrimonio.
8. A pagina abre com apenas `Produto 1`; use `Adicionar Produto` para incluir novos itens.
9. Use `Cadastrar Produto` para incluir, editar ou excluir produtos no catalogo.
10. Os novos cadastros ficam salvos no navegador pelo `localStorage`.
11. Use a area de preview para conferir o resultado do email com a saudacao e as tabelas.
12. Clique em `Enviar email` para abrir o cliente de email padrao com assunto e destinatarios preenchidos.
13. O campo de destinatarios corporativos aceita mais de um email, separado por `;` ou `,`.

## Arquivos

- `index.html`: estrutura da pagina.
- `styles.css`: visual da interface e das tabelas.
- `script.js`: logica do formulario, preview, listas prontas e persistencia local.
