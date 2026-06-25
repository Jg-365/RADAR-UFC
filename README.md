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

## Organização do código

Arquitetura orientada a features, com camadas separadas e fonte de dados trocável (mock agora, API depois).

```text
RADAR-UFC/
  docs/
  src/
    html/                paginas (uma por rota)
    assets/
      icons/sprite.svg   biblioteca unica de icones
      images/            logos
    css/
      tokens/            cores, espacamento, tipografia
      base/              reset, elementos
      layout/            grid, header, footer
      components/        botao, campo, tabela, timeline...
      pages/             estilos por pagina
      main.css           ponto de entrada (imports)
    js/
      core/              config, dom, storage, event-bus, http
      shared/            enums, labels, validators, formatters, rotas
      models/            classes de dominio
      data/              repositorios mock + seed
      services/          regras de aplicacao
      ui/                shell, tema, icones, componentes
      features/          controladores por feature
      app.js             bootstrap
  .github/
```

## Como executar

Servir a pasta `src/` por HTTP (ES Modules exigem servidor):

```bash
cd src && python3 -m http.server 8000
```

Abrir `http://localhost:8000/html/index.html`.

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
