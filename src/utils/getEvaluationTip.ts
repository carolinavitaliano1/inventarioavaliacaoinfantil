import type { PortageItem } from '../types'

// Orientações de observação para cada item, organizadas por área e faixa etária.

function pick<T>(arr: T[], seed: string): T {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return arr[h % arr.length]
}

// ─── SOCIALIZAÇÃO ──────────────────────────────────────────────────────────

function tipSocial(t: string, id: string): string {
  if (t.includes('imita') || t.includes('copia'))
    return 'Como avaliar: Realize a ação descrita na frente da criança (ex.: bater palma, fazer "tchau") e aguarde 10 segundos sem solicitar verbalmente. Repita em 3 ocasiões diferentes; considere presente se a criança imita em pelo menos 2 delas.'
  if (t.includes('sorri') || t.includes('sorriso'))
    return 'Como avaliar: Interaja com a criança frente a frente durante 5 minutos (canção, brincadeira de toque). Registre se o sorriso surge de forma recíproca e não apenas reflexa. Pergunte ao cuidador com que frequência ocorre em casa.'
  if (t.includes('adulto') && (t.includes('brinca') || t.includes('participa')))
    return 'Como avaliar: Inicie uma brincadeira simples com a criança (empilhar blocos, rolar bola). Observe se ela mantém engajamento por pelo menos 2–3 trocas sem perder o interesse.'
  if (t.includes('criança') || t.includes('par') || t.includes('grupo'))
    return 'Como avaliar: Observe a criança em contexto com pares (recreio, sala). Anote se ela inicia ou mantém interação espontânea por 2 minutos ou mais, sem intervenção do adulto.'
  if (t.includes('espera') || t.includes('vez') || t.includes('turno'))
    return 'Como avaliar: Use um jogo de turnos simples (jogar dado, empurrar brinquedo um de cada vez). Observe se a criança aguarda sua vez sem intervenção do adulto. Repita em 3 tentativas.'
  if (t.includes('regra') || t.includes('jogo'))
    return 'Como avaliar: Proponha um jogo simples com regras (stop, memória). Observe se a criança compreende e segue as regras durante pelo menos 5 minutos.'
  if (t.includes('ajuda') || t.includes('compartilha') || t.includes('divide'))
    return 'Como avaliar: Crie uma situação em que a criança precisa dividir materiais ou ajudar outra pessoa. Observe se o comportamento ocorre espontaneamente ou apenas com incentivo do adulto.'
  if (t.includes('olho') || t.includes('contato visual') || t.includes('olha'))
    return 'Como avaliar: Durante interação cara a cara, observe se a criança mantém contato visual por 3–5 segundos de forma espontânea. Evite solicitar diretamente. Registre em 3 momentos distintos.'
  return pick([
    'Como avaliar: Observe em situações naturais de interação social — refeições, brincadeiras livres, chegada/saída na escola. Registre se o comportamento ocorre espontaneamente em pelo menos 2 de 3 oportunidades observadas.',
    'Como avaliar: Crie oportunidade estruturada (mas lúdica) para o comportamento emergir. Não solicite diretamente; aguarde a iniciativa da criança por 30–60 segundos antes de oferecer apoio.',
    'Como avaliar: Pergunte ao cuidador se já observou esse comportamento em casa. Combine observação direta + relato familiar para confirmar consistência do comportamento.',
  ], id)
}

// ─── LINGUAGEM ─────────────────────────────────────────────────────────────

function tipLinguagem(t: string, id: string): string {
  if (t.includes('palavra') || t.includes('vocabulário') || t.includes('nomeia') || t.includes('chama'))
    return 'Como avaliar: Mostre o objeto real ou figura e pergunte "O que é isso?". A palavra deve ser usada funcionalmente, não apenas como eco de imitação imediata. Observe também uso espontâneo durante o dia.'
  if (t.includes('instrução') || t.includes('ordem') || t.includes('comando') || t.includes('siga'))
    return 'Como avaliar: Dê a instrução uma única vez em tom natural, sem gesto de apoio. Aguarde 10 segundos. Considere presente se a criança completa a ação corretamente nas 2 de 3 tentativas.'
  if (t.includes('frase') || t.includes('sentença') || t.includes('combina'))
    return 'Como avaliar: Observe a fala espontânea da criança durante brincadeiras ou refeições. Anote as estruturas de frase mais longas usadas sem solicitação. Não corrija durante a avaliação.'
  if (t.includes('conta') || t.includes('história') || t.includes('sequência') || t.includes('narra'))
    return 'Como avaliar: Mostre uma sequência de figuras ou proponha que conte o que aconteceu em um evento recente. Observe coerência, ordem e detalhes incluídos espontaneamente.'
  if (t.includes('responde') || t.includes('pergunta') || t.includes('quem') || t.includes('o que') || t.includes('onde'))
    return 'Como avaliar: Faça a pergunta em contexto natural (ex.: durante um livro ilustrado ou brincadeira). Evite fornecer pistas visuais ou alternativas. Registre a resposta espontânea da criança.'
  if (t.includes('aponta') || t.includes('indica') || t.includes('gesto'))
    return 'Como avaliar: Peça à criança que mostre objetos em um livro ou no ambiente. Observe também uso espontâneo do gesto de apontar para compartilhar interesse (não apenas para pedir algo).'
  if (t.includes('canta') || t.includes('música') || t.includes('ritmo'))
    return 'Como avaliar: Comece a cantar uma música conhecida e pause, aguardando a criança completar. Observe também se canta espontaneamente durante brincadeiras, sem indução.'
  if (t.includes('compreend') || t.includes('entende'))
    return 'Como avaliar: Evite usar gestos ou olhar direcionado ao responder. Formule a situação naturalmente e observe a reação da criança como indicador de compreensão. Repita em 3 contextos diferentes.'
  return pick([
    'Como avaliar: Observe a comunicação espontânea da criança durante brincadeiras livres. Não solicite o comportamento diretamente; aguarde que ele emerja naturalmente por pelo menos 10 minutos de observação.',
    'Como avaliar: Crie uma situação comunicativa que motive a criança a usar a habilidade descrita (livro, objeto novo, situação-problema). Registre qualidade e frequência da resposta.',
    'Como avaliar: Combine observação direta com relato do cuidador: "A criança faz isso em casa?" A consistência entre contextos (casa/escola) é critério importante na avaliação do desenvolvimento.',
  ], id)
}

// ─── CUIDADOS PRÓPRIOS ──────────────────────────────────────────────────────

function tipCuidados(t: string, id: string): string {
  if (t.includes('come') || t.includes('alimenta') || t.includes('colher') || t.includes('garfo') || t.includes('mastig'))
    return 'Como avaliar: Observe durante a refeição habitual da criança, sem intervir. Anote: usa utensílio corretamente, nível de independência (faz sozinha, com apoio mínimo, dependente do adulto) e postura durante a refeição.'
  if (t.includes('veste') || t.includes('calça') || t.includes('camisa') || t.includes('roupa') || t.includes('botão') || t.includes('zíper'))
    return 'Como avaliar: Observe durante o momento de vestir/despir sem apressar ou antecipar. Forneça apenas o nível de apoio necessário e registre o que a criança consegue fazer independentemente. Repita em dias diferentes.'
  if (t.includes('lava') || t.includes('mãos') || t.includes('higiene') || t.includes('escova') || t.includes('dente'))
    return 'Como avaliar: Observe a rotina de higiene bucal ou lavagem das mãos sem demonstrar os passos. Registre quantas etapas a criança realiza sozinha e onde precisa de suporte verbal ou físico.'
  if (t.includes('banheiro') || t.includes('toalete') || t.includes('urina') || t.includes('micção'))
    return 'Como avaliar: Pergunte ao cuidador sobre a rotina de uso do banheiro e observe ao longo do dia (frequência de acidentes, iniciativa própria, higiene após). A avaliação deve considerar consistência em múltiplos contextos.'
  if (t.includes('dorme') || t.includes('sono') || t.includes('cama'))
    return 'Como avaliar: Baseie-se principalmente no relato do cuidador, solicitando descrição detalhada da rotina de sono. Confirme se o comportamento ocorre de forma consistente (pelo menos 5 das últimas 7 noites).'
  if (t.includes('penteia') || t.includes('cabelo') || t.includes('escova cabelo'))
    return 'Como avaliar: Observe durante a rotina matinal. Forneça o utensílio e veja se a criança inicia o movimento correto sem demonstração. Registre autonomia e qualidade do movimento.'
  return pick([
    'Como avaliar: Observe a criança durante sua rotina diária (banho, refeição, vestir-se). Não antecipe nem realize o passo pela criança; aguarde e registre o nível de independência funcional.',
    'Como avaliar: Questione o cuidador principal sobre a ocorrência desse comportamento em casa, com exemplos concretos. O inventário valoriza o relato familiar como fonte primária para habilidades de autocuidado.',
    'Como avaliar: Crie a situação descrita no item e observe sem pressa. Registre se a criança inicia espontaneamente, completa a tarefa e a frequência com que isso ocorre na rotina habitual.',
  ], id)
}

// ─── COGNITIVA ─────────────────────────────────────────────────────────────

function tipCognitiva(t: string, id: string): string {
  if (t.includes('classifica') || t.includes('categoriz') || t.includes('agrupa') || t.includes('separa'))
    return 'Como avaliar: Disponha objetos variados (animais, frutas, veículos em miniaturas ou figuras) misturados. Peça à criança que "organize" sem indicar o critério. Observe se classifica espontaneamente e qual atributo usa (cor, forma, categoria).'
  if (t.includes('conta') || t.includes('número') || t.includes('numera') || t.includes('quantidade'))
    return 'Como avaliar: Disponha objetos concretos (blocos, botões). Peça que conte ou indique a quantidade. Observe se há correspondência um-a-um, se comete erros de sequência e se entende a invariância da quantidade.'
  if (t.includes('quebra-cabeça') || t.includes('encaixa') || t.includes('puzzle'))
    return 'Como avaliar: Ofereça o quebra-cabeça desmontado e observe a estratégia usada (tentativa-e-erro, busca por bordas, referência à figura). Não forneça dicas; registre tempo e número de peças corretamente posicionadas.'
  if (t.includes('cor') || t.includes('forma') || t.includes('tamanho') || t.includes('igual') || t.includes('diferente'))
    return 'Como avaliar: Use objetos do ambiente ou cartões coloridos. Faça a comparação em 5 pares distintos. Considere presente se a criança acerta pelo menos 4 de 5 tentativas sem receber feedback entre elas.'
  if (t.includes('memória') || t.includes('lembra') || t.includes('recorda'))
    return 'Como avaliar: Mostre objetos por 10 segundos, cubra-os e peça que nomeie o que viu. Varie os itens e aumente gradualmente. Observe estratégias espontâneas de memorização (repetição, agrupamento).'
  if (t.includes('causa') || t.includes('consequência') || t.includes('por que') || t.includes('solução') || t.includes('resolve'))
    return 'Como avaliar: Apresente um problema concreto (ex.: caixa fechada com brinquedo dentro). Observe sem dar dicas. Registre se a criança tenta diferentes soluções e se persiste até resolver.'
  if (t.includes('sequência') || t.includes('ordem') || t.includes('antes') || t.includes('depois'))
    return 'Como avaliar: Use cartões de sequência (histórias em 3–4 quadros). Misture e peça que organize. Observe a estratégia e se consegue explicar a lógica da ordem escolhida.'
  if (t.includes('concept') || t.includes('compreend') || t.includes('entende') || t.includes('sabe'))
    return 'Como avaliar: Proponha a situação-problema de forma lúdica usando materiais concretos. Observe se a criança demonstra o conceito com ação, não apenas com palavras. Repita em 3 contextos diferentes.'
  return pick([
    'Como avaliar: Proponha a atividade como um jogo, usando materiais concretos do ambiente. Observe se a criança realiza sem ajuda física ou verbal. Repita em 3 tentativas; considere presente em 2/3.',
    'Como avaliar: Prepare o material descrito no item e apresente à criança sem demonstrar. Registre: inicia espontaneamente, usa estratégia adequada, completa com independência ou precisa de apoio.',
    'Como avaliar: Observe a criança em atividade livre (desenho, construção, jogo) e registre as manifestações espontâneas da habilidade cognitiva descrita, sem indução direta.',
  ], id)
}

// ─── PSICOMOTORA ──────────────────────────────────────────────────────────

function tipMotora(t: string, id: string): string {
  if (t.includes('pula') || t.includes('salta') || t.includes('pé'))
    return 'Como avaliar: Observe durante brincadeiras livres no pátio. Para testar especificamente, demonstre a ação e peça que imite. Registre: consegue realizar, quantas vezes consecutivas, necessita de apoio para equilíbrio.'
  if (t.includes('sobe') || t.includes('desce') || t.includes('escada') || t.includes('degrau'))
    return 'Como avaliar: Observe ao subir/descer escadas no ambiente natural (escola, casa). Note se usa corrimão, se alterna os pés ou coloca os dois no mesmo degrau, e se precisa de apoio do adulto.'
  if (t.includes('corre') || t.includes('corrida'))
    return 'Como avaliar: Observe durante brincadeira livre ao ar livre. Para avaliação estruturada, marque uma distância e peça que corra até o ponto. Registre: velocidade, coordenação dos membros e equilíbrio durante a corrida.'
  if (t.includes('joga') || t.includes('lança') || t.includes('arremessa') || t.includes('bola'))
    return 'Como avaliar: Use uma bola do tamanho adequado para a faixa etária. Observe 5 tentativas de arremesso/recepção. Registre: distância, direção, uso dos dois braços ou de um só, postura corporal.'
  if (t.includes('desenha') || t.includes('risca') || t.includes('traça') || t.includes('lápis'))
    return 'Como avaliar: Forneça papel A4 e lápis adequado (grosso para crianças menores). Peça a tarefa descrita sem demonstrar. Observe: preensão do lápis (pinça, palmar), pressão exercida, controle do traçado.'
  if (t.includes('recorta') || t.includes('tesoura') || t.includes('corta'))
    return 'Como avaliar: Forneça tesoura de ponta arredondada adequada à mão da criança. Observe a preensão da tesoura, abertura/fechamento coordenados e capacidade de seguir uma linha (reta ou curva).'
  if (t.includes('encaixa') || t.includes('pino') || t.includes('peça') || t.includes('objeto pequeno'))
    return 'Como avaliar: Use materiais de encaixe de tamanho proporcional à habilidade da faixa etária. Observe a preensão utilizada (pinça fina vs. palmar) e a precisão do movimento de inserção.'
  if (t.includes('equilibr') || t.includes('balance') || t.includes('um pé'))
    return 'Como avaliar: Peça à criança que fique em equilíbrio estático (um pé) e cronometre. Repita 3 vezes. Registre tempo médio e lado dominante. Observe se usa visão para compensar o equilíbrio (olha para o chão).'
  return pick([
    'Como avaliar: Observe a habilidade motora durante atividade espontânea no ambiente. Para confirmação, proponha uma tarefa estruturada que exija o movimento descrito. Registre qualidade do padrão motor e necessidade de apoio.',
    'Como avaliar: Demonstre a habilidade uma única vez e peça que a criança tente. Avalie em 3 tentativas. Observe: coordenação, força, precisão e lateralidade. Considere presente se realiza com padrão funcional em 2/3 tentativas.',
    'Como avaliar: Crie situação lúdica que exija naturalmente o movimento descrito (circuito, obstáculo, jogo). Observar a habilidade em contexto motivador fornece informação mais fidedigna do que tarefa isolada.',
  ], id)
}

// ─── FUNÇÃO PRINCIPAL ──────────────────────────────────────────────────────

export function getEvaluationTip(item: PortageItem): string {
  const t = item.text.toLowerCase()
  const area = item.area

  if (area.includes('SOCIABILIZ') || area.includes('SOCIALIZ'))
    return tipSocial(t, item.id)
  if (area.includes('LINGUAGEM'))
    return tipLinguagem(t, item.id)
  if (area.includes('CUIDADOS') || area.includes('AUTOCUIDADO'))
    return tipCuidados(t, item.id)
  if (area.includes('COGNITIV'))
    return tipCognitiva(t, item.id)
  if (area.includes('PSICOMOTOR') || area.includes('MOTOR'))
    return tipMotora(t, item.id)

  return 'Como avaliar: Observe o comportamento em 3 situações naturais diferentes ao longo da semana. Registre se ocorre de forma espontânea, com suporte verbal ou apenas com demonstração física.'
}
