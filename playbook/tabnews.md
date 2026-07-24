# TabNews Style Guide (Português do Brasil)

TabNews (tabnews.com.br) é a comunidade do Filipe Deschamps: devs brasileiros que valorizam **conteúdo de valor concreto** — artigos, tutoriais, experiências reais. A moeda é TabCoin: a comunidade vota, e ela é IMPIEDOSA com conteúdo raso, marketing disfarçado e texto de IA genérico.

## A régua

Você está escrevendo um artigo que entrega um modelo mental útil e algo aplicável no mesmo dia. Ele precisa ter substância sem virar tarefa de casa: mire em **4–8 minutos de leitura**, normalmente **1.000–1.700 palavras**. A faixa flexível de **900–2.000 palavras** é aceitável quando o tema realmente pede.

Esses números orientam a edição; não são uma catraca rígida. Nunca encha um texto curto para bater meta e nunca corte uma explicação necessária só para caber no teto. Se ficou longo, estreite o recorte e remova exemplos repetidos. Cada parágrafo precisa trazer algo concreto novo — exemplo, código, número com fonte, modo de falha ou regra de decisão.

A régua real de completude: no final, quem leu consegue explicar o mecanismo, aplicar a solução, reconhecer pelo menos uma falha de produção e tomar uma decisão técnica concreta. Um artigo gostoso de 1.400 palavras que faz isso vale mais que uma enciclopédia de 3.000.

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
- Mesmo arco do artigo em inglês: cena do problema → por que a solução óbvia falha → mecanismo por baixo → solução real → realidade de produção → fechamento com pergunta. Junte etapas quando isso melhorar o ritmo; prefira **5–7 seções com propósito** a um catálogo longo
- Abertura nas 2 primeiras linhas com cenário vivido ou afirmação surpreendente
- Ao longo do artigo, use pelo menos **3 artefatos concretos**: código executável, número com fonte, caso real nomeado, tabela ou diagrama. Coloque cada um onde ele esclarece o raciocínio; não enfie um artefato artificial em toda transição curta
- Normalmente use **2–3 blocos de código** e **um caso real de fonte nomeada** (postmortem, blog de engenharia, RFC, docs oficiais). Se o tema for conceitual, um exemplo excelente mais um diagrama pode funcionar melhor que código inventado
- **Teste da especificidade**: se uma frase serviria igual num artigo sobre outro tema, delete
- Markdown completo: `##` para seções, blocos de código com linguagem, tabelas quando ajudarem
- Parágrafos curtos, ritmo variado. PT-BR natural: "você", zero "portanto" empilhado
- Linguagem um pouco mais técnica que a sessão social: nomeie APIs, mecanismos e falhas reais, mas explique tudo com palavras simples e sem vocabulário rebuscado
- Exemplos localizados quando fizer sentido (Pix como exemplo de idempotência > Stripe, real > dólar, empresa BR > empresa americana)
- Fechar com pergunta genuína para a comunidade — comentário é o que segura o post no "Relevantes"
