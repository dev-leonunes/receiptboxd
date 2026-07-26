# Receiptboxd

O Receiptboxd transforma o histórico de filmes de um perfil do Letterboxd em uma experiência de recibo visual. A ideia é permitir que a pessoa escolha um período, consulte os filmes assistidos e compartilhe o resultado.

O projeto está em fase inicial.

## Requisitos

- Node.js 24
- pnpm 11

## Como executar

Instale as dependências:

```bash
pnpm install
```

Crie um arquivo `.env` a partir de `.env.example` e informe as variáveis necessárias:

```env
LETTERBOXD_USER=seu_usuario
TMDB_API_TOKEN=seu_token
```

Execute em modo de desenvolvimento:

```bash
pnpm dev
```

Para compilar e executar a aplicação:

```bash
pnpm start
```

## Scripts

- `pnpm build`: compila o TypeScript para `dist/`.
- `pnpm typecheck`: verifica os tipos sem gerar arquivos.
- `pnpm dev`: executa o código-fonte com recarregamento ao salvar.
- `pnpm start`: compila e executa a versão gerada.
