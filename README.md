# RADAR UFC

Plataforma web frontend de escuta, manifestações, reclamações e transparência institucional para a Universidade Federal do Ceará.

O RADAR UFC é inspirado no modelo do Reclame Aqui, mas adaptado ao contexto universitário. O foco do projeto é simular, em uma interface web completa, o registro de manifestações, acompanhamento por protocolo, resposta institucional, avaliação do usuário e transparência pública.

## Escopo técnico

Este projeto é **exclusivamente frontend**.

- Sem backend real.
- Sem API real.
- Sem banco de dados.
- Sem autenticação real.
- Sem upload real de arquivos.
- Dados simulados com JavaScript.
- Possível uso de `localStorage` para rascunhos e interações simuladas.

## Objetivo

Desenvolver uma interface web simples, acessível, responsiva e organizada, feita somente com **HTML, CSS e JavaScript puro**, demonstrando os principais fluxos de uma plataforma institucional de manifestações.

## Escopo do MVP

- Página inicial pública.
- Listagem pública de manifestações.
- Busca e filtros no frontend.
- Página de detalhe da manifestação.
- Login e cadastro simulados.
- Registro de manifestação com revisão antes do envio.
- Geração simulada de protocolo.
- Área do usuário simulada.
- Painel de moderação simulado.
- Painel administrativo visual.
- Resposta institucional simulada.
- Avaliação simulada da resposta.
- Página de transparência com métricas fictícias.
- Página “Como funciona”.

## Stack técnica

- HTML5 semântico.
- CSS3 modularizado.
- JavaScript puro.
- Dados mockados em arquivos `.js`.
- `localStorage` para simulação de rascunhos e estados.
- Sem React, Vue, Angular, Next.js, backend ou banco de dados.

## Organização sugerida do código

```text
RADAR-UFC/
  index.html
  pages/
    manifestacoes.html
    detalhe-manifestacao.html
    registrar.html
    login.html
    minhas-manifestacoes.html
    admin-dashboard.html
    moderacao.html
    transparencia.html
    como-funciona.html
  css/
    reset.css
    variables.css
    base.css
    layout.css
    components.css
    pages.css
    responsive.css
  js/
    app.js
    data.js
    components.js
    filters.js
    form-validation.js
    manifestations.js
    storage.js
    moderation.js
    admin.js
    metrics.js
    utils.js
  assets/
    icons/
    images/
  docs/
  tests/
  .github/
```

## Fluxo principal simulado

Usuário acessa o RADAR UFC → busca manifestações existentes → registra nova manifestação → revisa dados → envia → recebe protocolo simulado → manifestação aparece como aguardando moderação → setor/administrador simulado responde → usuário avalia → manifestação fica com status final.

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
- Proteção visual de dados pessoais.
- Linguagem clara e acessível.
- Fluxos sem ambiguidade.
- Interface responsiva.
- Código simples, modular e documentado.
- Desenvolvimento incremental orientado por issues.
