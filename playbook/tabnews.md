# TabNews Style Guide (Português do Brasil)

TabNews (tabnews.com.br) é a comunidade do Filipe Deschamps: devs brasileiros que valorizam **conteúdo de valor concreto** — artigos, tutoriais, experiências reais. A moeda é TabCoin: a comunidade vota, e ela é IMPIEDOSA com conteúdo raso, marketing disfarçado e texto de IA genérico.

## A régua

Você está escrevendo **o artigo definitivo sobre o tema em português** — o que a comunidade vai salvar e linkar quando o assunto aparecer. **2.000–3.200 palavras.** Menos que isso significa que partes do tema ficaram sem exploração, não que o tema é pequeno (tema pequeno nem deveria ter sido escolhido).

Profundidade, nunca enchimento: cada parágrafo novo precisa trazer algo concreto novo — exemplo, código, número com fonte, modo de falha, regra de decisão.

## O que a comunidade pune (evitar a todo custo)

- Autopromoção fora de contexto. Se o post for essencialmente sobre um produto seu, o título DEVE começar com "Pitch:". Nos nossos posts educacionais, menção a projeto próprio só quando for exemplo genuíno do problema técnico discutido — e no máximo uma, em tom de "no meu projeto X eu resolvi assim"
- Texto que cheira a tradução automática ou a ChatGPT: frases infladas, "além disso", "é importante ressaltar", conclusões que resumem o óbvio
- Conteúdo requentado sem experiência própria ou pesquisa de verdade
- Erros de português — a comunidade nota e comenta

## O que performa

- Títulos específicos e diretos, até **70 caracteres** (acima disso corta com reticências)
- Tom de conversa entre devs: direto, sem formalidade corporativa, humor sutil bem-vindo
- Experiência em primeira pessoa: "errei", "quebrei produção", "levei 3 dias pra achar"
- Profundidade técnica com exemplos reais e código
- Posts que geram discussão: terminar com uma pergunta honesta ou uma posição defensável

## Estrutura — arco narrativo

- **NÃO é tradução do post em inglês.** É uma adaptação: mesmos fatos técnicos, texto reescrito do zero para a cultura da comunidade
- Mesmo arco do artigo em inglês: cena do problema → por que a solução óbvia falha (quebre ela na frente do leitor) → o mecanismo por baixo (o núcleo do ensino — vá fundo) → construindo a solução real, passo a passo com código → realidade de produção (edge cases, custos, "o que me mordeu") → erros comuns (3–5, com o porquê) → recap + pergunta pra comunidade
- Abertura nas 2 primeiras linhas com cenário vivido ou afirmação surpreendente
- **Cada seção precisa ter pelo menos um item concreto**: código executável, número com fonte, caso real nomeado, tabela ou diagrama. Seção só de prosa = seção pra reescrever
- Pelo menos **3 blocos de código** e **um caso real de fonte nomeada** (postmortem, blog de engenharia, RFC, docs oficiais)
- **Teste da especificidade**: se uma frase serviria igual num artigo sobre outro tema, delete
- Markdown completo: `##` para seções, blocos de código com linguagem, tabelas quando ajudarem
- Parágrafos curtos, ritmo variado. PT-BR natural: "você", zero "portanto" empilhado
- Exemplos localizados quando fizer sentido (Pix como exemplo de idempotência > Stripe, real > dólar, empresa BR > empresa americana)
- Fechar com pergunta genuína para a comunidade — comentário é o que segura o post no "Relevantes"
