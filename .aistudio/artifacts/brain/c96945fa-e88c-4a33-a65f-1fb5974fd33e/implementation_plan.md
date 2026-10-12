# Poquei: Walkie-Talkie, Supergrupos, Localização em Tempo Real e Guia das Prefeituras do ES

O Poquei receberá uma grande expansão com quatro recursos integrados: modo de comunicação de voz instantânea estilo Walkie-Talkie (Push-to-Talk com efeitos de rádio), compartilhamento de Localização em Tempo Real em pontos icônicos do Espírito Santo, ferramenta de Criação de Supergrupos Enormes (com subtópicos, capacidade para milhares de membros e moderação), além de um Guia Oficial de Contatos Úteis de todas as Prefeituras Capixabas com telefones, WhatsApp e canais municipais diretos.

---

## Decisões Confirmadas com o Usuário

> [!IMPORTANT]
> Decisões alinhadas na Fase 1 de planejamento:
> - **Contatos das Prefeituras**: Guia oficial dedicado com telefones e WhatsApp oficial de todas as prefeituras capixabas, acessível via Hub e atalho na agenda.
> - **Modo Walkie-Talkie**: Modo push-to-talk ágil no chat com bips de rádio característicos (*roger that/câmbio* capixaba) e envio instantâneo.
> - **Criação de Grupos Enormes**: Criação de supergrupos com capacidade para milhares de membros, subtópicos temáticos (canais internos) e regras de moderação.
> - **Localização em Tempo Real**: Envio dinâmico com mapa temático capixaba e estimativa de tempo ao vivo.

---

## 1. Visão Geral e Conceito Central

- **O que a funcionalidade faz**:
  1. **Modo Walkie-Talkie (Push-to-Talk)**: Barra alternável no chat onde o usuário segura para falar (*Push-to-Talk*), escuta o clique/bip de abertura de frequência, fala e, ao soltar, transmite imediatamente para o contato com estética de rádio VHF/Walkie-Talkie.
  2. **Envio de Localização em Tempo Real**: Modal e card de mensagem que permite compartilhar a localização ao vivo (ex: Calçadão de Camburi, Praia da Costa, Ilha das Caieiras, Convento da Penha, Manguinhos) com mapa interativo, tempo restante da transmissão ao vivo e botão de encerrar.
  3. **Criação de Supergrupos Enormes**: Modal de criação permitindo configurar grupos com capacidade ilimitada de membros, foto, banner, múltiplos subtópicos (ex: *#avisos*, *#geral*, *#rolês*, *#moqueca*) e moderadores.
  4. **Guia Oficial de Prefeituras Capixabas**: Painel completo e pesquisável listando os municípios do ES (Grande Vitória, Litoral Norte, Litoral Sul, Região Serrana e Noroeste), contendo telefones de emergência municipal, WhatsApp do cidadão, ouvidoria, IPTU e serviços diretos com discagem rápida e início de chat oficial.

- **Público-Alvo**: Moradores, turistas e comunidades capixabas que utilizam o mensageiro para trabalhar, navegar pela cidade e manter contato com serviços públicos.

---

## 2. Experiência do Usuário e Design Visual

### Fluxos Principais

1. **Fluxo do Walkie-Talkie**:
   - No rodapé da conversa, ao lado do botão de anexo e gravação padrão, o usuário pode tocar no botão de rádio/walkie-talkie (`Radio` / `Mic`).
   - Abre a barra tátil de Walkie-Talkie com frequências sintonizáveis (ex: `Canal 27 - Camburi FM`, `Canal 10 - Orla`), status "Pressione para Falar", indicador de transmissão de rádio em ondas animadas e som característico de início e fim de transmissão (*câmbio!*).
   - A mensagem gerada no chat possui visual exclusivo de transmissão de rádio com waveform e badge de áudio walkie-talkie.

2. **Fluxo de Localização em Tempo Real**:
   - No menu de anexos (+), o usuário seleciona "Localização em Tempo Real".
   - Um modal interativo surge permitindo escolher a duração (15 min, 1 hora, 8 horas) e o ponto capixaba inicial.
   - Gera um card de mapa dinâmico no chat com radar pulsante em tempo real, distância calculada e atalho para abrir rota.

3. **Fluxo de Criação de Supergrupos Enormes**:
   - Na aba Conversas ou Comunidades, o botão flutuante (+) ganha a opção "Criar Supergrupo Capixaba".
   - Formulário com nome, descrição, categoria territorial do ES, limite de membros (até 200.000 membros), adição de subtópicos iniciais e permissões de moderação.
   - O grupo criado aparece imediatamente na lista de conversas com ícone de supergrupo e acesso aos seus subtópicos.

4. **Fluxo do Guia de Prefeituras do ES**:
   - Acesso em destaque no Hub de Serviços, no menu principal e na lista de contatos.
   - Navegação por regiões: *Grande Vitória* (Vitória, Vila Velha, Serra, Cariacica, Viana, Guarapari, Fundão), *Região Serrana* (Domingos Martins, Venda Nova, Santa Teresa), *Litoral Sul* (Anchieta, Itapemirim, Marataízes), *Norte/Noroeste* (Linhares, São Mateus, Colatina, Cachoeiro de Itapemirim).
   - Busca rápida por cidade ou serviço (Disque-Silêncio, Defesa Civil, Guarda Municipal, Saúde, WhatsApp Cidadão).
   - Ações imediatas: Copiar número, Ligar diretamente e Iniciar conversa oficial verificada.

### Identidade Visual e Estética

- **Paleta de Cores**:
  - Walkie-Talkie: Amarelo âmbar e ciano neon (`#00C2FF`, `#FFB800`) com fundos grafite e frequências analógicas retro-modernas.
  - Prefeituras: Azul oficial capixaba e verde esmeralda com selos de autenticidade governamental.
  - Supergrupos: Roxo e magenta vibrantes (`#FF2E93`) com tags territoriais.
- **Tipografia**: Hierarquia clara, números tabulares para frequências e telefones municipais (`tabular-nums font-mono`).
- **Respeito aos Critérios de Acessibilidade**: Botões de toque com tamanho mínimo $\ge 44\text{px}$, suporte a teclado e contrastes rigorosos.

---

## 3. Decisões de Produto e Arquitetura

```
┌────────────────────────────────────────────────────────────────────────┐
│                              APP (App.tsx)                             │
│  - chats, groups, messagesByChat, prefeiturasDirectory, liveLocations │
└───────────────┬───────────────────────────────┬────────────────────────┘
                │                               │
        ┌───────▼────────┐             ┌────────▼──────────────┐
        │  ChatsScreen   │             │   ChatDetailScreen    │
        │  & HubScreen   │             │  - WalkieTalkieBar    │
        └───────┬────────┘             │  - LiveLocationModal  │
                │                      │  - Audio/Video Call   │
        ┌───────▼─────────────┐        └───────────────────────┘
        │ PrefeiturasModal    │
        │ - Lista de 78 mun.  │
        │ - Telefones/WhatsApp│
        │ - Busca por serviço │
        └─────────────────────┘
                │
        ┌───────▼─────────────┐
        │ CreateSupergroupModal
        │ - Subtópicos        │
        │ - Limite até 200k   │
        └─────────────────────┘
```

1. **Estado e Persistência**:
   - Dados das 78 prefeituras capixabas organizados com números reais/oficiais de emergência, ouvidoria e canais do cidadão no arquivo de mock.
   - Grupos e supergrupos salvos no estado do aplicativo e sincronizados para permitir entrar, criar e visualizar subtópicos.
   - Localização em tempo real sincronizada no feed com contagem regressiva viva e simulação de deslocamento.

2. **Efeitos Sonoros**:
   - Efeito sonoro de Walkie-Talkie (bip de início de transmissão de rádio e estática suave de finalização de câmbio) integrado aos utilitários de áudio.

---

## 4. Plano de Verificação

1. **Walkie-Talkie**: Testar botão de PTT no chat, gravação com bip de rádio e envio para a conversa.
2. **Localização ao Vivo**: Abrir modal de anexos, selecionar localização em tempo real, verificar contagem regressiva e card dinâmico.
3. **Supergrupos**: Criar novo grupo com múltiplos subtópicos e verificar exibição no feed de chats e na tela de detalhes.
4. **Guia das Prefeituras**: Abrir o guia, filtrar por município (Vitória, Vila Velha, Serra, etc.) e testar atalhos de WhatsApp e chamada.
5. **Compilação**: Executar `lint_applet` e `compile_applet` garantindo zero erros de tipagem.
