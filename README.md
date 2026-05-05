# RADAR UFC

Plataforma web de escuta, manifestações, reclamações e transparência institucional para a Universidade Federal do Ceará.

O RADAR UFC é inspirado no modelo do Reclame Aqui, mas adaptado ao contexto universitário. O foco do projeto é permitir que estudantes, servidores, professores, terceirizados e comunidade externa registrem manifestações, acompanhem respostas institucionais, avaliem soluções e consultem indicadores públicos de transparência.

## Objetivo

Desenvolver uma plataforma web simples, acessível e organizada, com frontend em HTML, CSS e JavaScript puro e backend em JavaScript/Node.js, voltada para registro, moderação, acompanhamento, resposta e avaliação de manifestações institucionais.

## Escopo do MVP

- Área pública com página inicial, busca, listagem, detalhes e métricas.
- Cadastro e login de usuários.
- Registro de manifestação com revisão antes do envio.
- Geração de protocolo.
- Área do usuário para acompanhar manifestações.
- Painel de moderação.
- Painel administrativo dos setores.
- Resposta institucional.
- Avaliação da resposta pelo usuário.
- Página de transparência com dados agregados e anonimizados.

## Stack técnica prevista

### Frontend

- HTML5 semântico.
- CSS3 modularizado.
- JavaScript puro.
- Sem React, Vue, Angular, Next.js ou frameworks de UI.

### Backend

- JavaScript com Node.js.
- API REST.
- Validação de dados no servidor.
- Controle de autenticação e permissões.
- Banco de dados a definir na etapa técnica.

### Testes

- Testes funcionais.
- Testes de frontend.
- Testes de backend.
- Testes de integração.
- Testes de responsividade.
- Testes de acessibilidade.
- Testes de segurança básica.

## Documentação principal

A documentação de desenvolvimento está organizada na pasta [`docs`](./docs):

- [`00-visao-geral.md`](./docs/00-visao-geral.md)
- [`01-requisitos.md`](./docs/01-requisitos.md)
- [`02-arquitetura.md`](./docs/02-arquitetura.md)
- [`03-ux-prototipagem.md`](./docs/03-ux-prototipagem.md)
- [`04-plano-testes.md`](./docs/04-plano-testes.md)
- [`05-backlog.md`](./docs/05-backlog.md)
- [`06-roadmap.md`](./docs/06-roadmap.md)
- [`07-api.md`](./docs/07-api.md)
- [`08-modelo-dados.md`](./docs/08-modelo-dados.md)
- [`09-checklist-entrega.md`](./docs/09-checklist-entrega.md)

## Organização sugerida do código

```text
RADAR-UFC/
  frontend/
    index.html
    pages/
    css/
    js/
    assets/
  backend/
    server.js
    routes/
    controllers/
    services/
    repositories/
    middlewares/
    utils/
  docs/
  tests/
  .github/
```

## Fluxo principal

Usuário acessa o RADAR UFC → busca manifestações existentes → registra uma nova manifestação → revisa os dados → envia → recebe protocolo → manifestação passa por moderação → setor responsável analisa → setor responde → usuário avalia → manifestação fica pública com status final, respeitando dados pessoais.

## Status das manifestações

- Rascunho
- Enviada
- Aguardando moderação
- Recusada na moderação
- Ajuste solicitado
- Publicada
- Encaminhada
- Em análise
- Aguardando complemento do usuário
- Respondida
- Resolvida
- Não resolvida
- Encerrada

## Princípios do projeto

- Escuta ativa.
- Transparência institucional.
- Proteção de dados pessoais.
- Linguagem clara e acessível.
- Fluxos sem ambiguidade.
- Interface responsiva.
- Código simples, modular e documentado.
- Desenvolvimento incremental orientado por issues.
