import OpenAI from 'openai';
import { SYSTEM_PROMPT } from './systemPrompt';

// Initialize OpenAI client
// const openai = new OpenAI({ ... });

// Helper function to call OpenAI API
async function callOpenAI(userMessage, responseFormat = 'text') {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // Debug logging
    console.log('Tentando chamar OpenAI API...');
    if (apiKey) {
        console.log('API Key encontrada (inicia com):', apiKey.substring(0, 7) + '...');
    } else {
        console.error('API Key NÃO encontrada!');
    }

    if (!apiKey) {
        console.error('API Key is missing!');
        throw new Error('Chave da API não configurada. Verifique o arquivo .env');
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('OpenAI API Error Details:', errorData);
            throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erro ao chamar OpenAI:', error);

        let errorMessage = error.message;
        if (errorMessage.includes('Failed to fetch')) {
            errorMessage = 'Erro de conexão. Verifique sua internet, VPN, ou se algum bloqueador de anúncios está impedindo o acesso à API da OpenAI.';
        }

        alert(`Erro na API da OpenAI: ${errorMessage}. Usando dados de exemplo.`);
        throw new Error('Erro ao gerar conteúdo. Por favor, tente novamente.');
    }
}

export async function generateMarketAnalysis(step1Answers) {
    const userMessage = `
Com base nas seguintes respostas da usuária sobre sua identidade e objetivos, gere uma análise de mercado identificando 3 a 5 nichos lucrativos que se alinham com seu perfil:

RESPOSTAS DA ETAPA 1:
1. O que te trouxe até aqui? ${step1Answers[0]}
2. O que você ama fazer? ${step1Answers[1]}
3. Que vivência ou superação você tem? ${step1Answers[2]}
4. Que transformação você gostaria de proporcionar? ${step1Answers[3]}
5. O que você não quer fazer? ${step1Answers[4]}
6. Com quem você deseja se conectar? ${step1Answers[5]}
7. Quais são seus medos no digital? ${step1Answers[6]}
8. Como você quer se comunicar? ${step1Answers[7]}
9. Já imaginou seu primeiro produto? ${step1Answers[8]}
10. Está pronta para começar simples? ${step1Answers[9]}
11. Qual é sua meta de renda mensal? ${step1Answers[10]}
12. Qual é o seu PORQUÊ? ${step1Answers[11]}

NICHOS LUCRATIVOS PARA CONSIDERAR:
- Saúde
- Finanças
- Relacionamentos
- Negócios digitais
- Desenvolvimento pessoal
- Espiritualidade

Retorne APENAS um objeto JSON válido no seguinte formato (sem markdown, sem \`\`\`json):
{
  "niches": [
    {
      "name": "Nome do Nicho",
      "justification": "Justificativa clara e personalizada baseada nas respostas"
    }
  ]
}
`;

    try {
        const response = await callOpenAI(userMessage);
        // Remove markdown code blocks if present
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanResponse);
    } catch (error) {
        console.error('Erro ao gerar análise de mercado:', error);
        // Fallback to mock data if API fails
        return {
            niches: [
                {
                    name: 'Negócios Digitais',
                    justification: 'Com base nas suas respostas, você demonstra interesse em ajudar mulheres a empreenderem no digital.'
                },
                {
                    name: 'Desenvolvimento Pessoal',
                    justification: 'Sua jornada de superação indica que você pode ajudar outras mulheres em suas jornadas pessoais.'
                }
            ]
        };
    }
}

export async function generateStrategicReport(step1Answers, marketAnalysis) {
    const nichesText = marketAnalysis.niches.map(n => `- ${n.name}: ${n.justification}`).join('\n');

    const userMessage = `
Com base nas respostas da usuária e na análise de mercado, gere um relatório estratégico completo:

RESPOSTAS DA USUÁRIA:
${step1Answers.map((answer, i) => `${i + 1}. ${answer}`).join('\n')}

NICHOS IDENTIFICADOS:
${nichesText}

Gere um relatório estratégico que inclua:
1. Oferta (o que ela vai oferecer)
2. Público-Alvo (público-alvo específico)
3. Dores (dores e problemas que resolve)
4. Transformação (transformação que proporciona)
5. Declaração de Missão (declaração de missão)

Retorne APENAS um objeto JSON válido no seguinte formato (sem markdown, sem \`\`\`json):
{
  "oferta": "Descrição clara do que será oferecido",
  "publicoAlvo": "Descrição específica do público-alvo",
  "dores": "Dores e problemas que serão resolvidos",
  "transformacao": "Transformação que será proporcionada",
  "declaracaoMissao": "Declaração de missão clara e inspiradora"
}
`;

    try {
        const response = await callOpenAI(userMessage);
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleanResponse);
    } catch (error) {
        console.error('Erro ao gerar relatório estratégico:', error);
        // Fallback to mock data
        return {
            oferta: 'Produtos digitais Low Ticket que ajudam mulheres a começarem no digital de forma simples e lucrativa',
            publicoAlvo: 'Mulheres que desejam empreender no digital mas não sabem por onde começar',
            dores: 'Sentem-se perdidas com tanto conteúdo disponível, têm medo de errar, não sabem qual produto criar primeiro',
            transformacao: 'De mulheres inseguras e sem direção para empreendedoras confiantes com seu primeiro produto digital validado',
            declaracaoMissao: 'Ajudar mulheres a transformarem suas histórias em produtos Low Ticket vendáveis, com leveza e estratégia'
        };
    }
}

export async function generateFinalProducts(step1Answers, strategicReport, step4Answers) {
    const userMessage = `
Com base em todas as informações coletadas, gere 3 produtos Low Ticket, 2 order bumps e 1 upsell:

RELATÓRIO ESTRATÉGICO:
- Oferta: ${strategicReport.oferta}
- Público: ${strategicReport.publicoAlvo}
- Problemas: ${strategicReport.dores}
- Transformação: ${strategicReport.transformacao}

RESPOSTAS DA EXTRAÇÃO PROFUNDA:
1. O que exatamente você ensina ou faz? ${step4Answers[0]}
2. Qual o problema mais comum do seu público? ${step4Answers[1]}
3. Que frases eles repetem mentalmente? ${step4Answers[2]}
4. Qual o pior cenário que temem? ${step4Answers[3]}
5. Que conversa íntima têm sobre isso? ${step4Answers[4]}
6. Você já tem materiais prontos? ${step4Answers[5]}
7. O que entregaria em 15 minutos? ${step4Answers[6]}
8. O que gera resultado rápido? ${step4Answers[7]}

REGRAS OBRIGATÓRIAS:
- 3 produtos entre R$29 e R$97
- Formatos permitidos: Workshop, Vídeo aulas curtas, Templates, Checklists, Calculadoras, Auditorias, Consultorias, Masterclasses, Desafios, Mentorias em grupo, Scripts, Guias práticos, Planos de ação
- NUNCA e-books, PDFs textuais ou apostilas
- Resolver UMA dor urgente
- Resultado em 24-72h
- 2 order bumps (1 prático, 1 emocional) com preço ≤ 25% do produto
- 1 upsell entre R$97-R$297
- O terceiro produto deve ter campo "aiHelp"
- CADA PRODUTO DEVE TER UM GUIA DE IMPLEMENTAÇÃO PRÁTICO

Retorne APENAS um objeto JSON válido no seguinte formato (sem markdown, sem \`\`\`json):
{
  "products": [
    {
      "name": "Nome do Produto",
      "promise": "Promessa clara",
      "format": "Formato específico",
      "price": "R$ XX",
      "reasons": ["Razão 1", "Razão 2", "Razão 3"],
      "implementationGuide": {
        "title": "Como Criar e Lançar Este Produto",
        "steps": [
          {
            "step": 1,
            "title": "Título do Passo",
            "description": "Descrição detalhada do que fazer",
            "actionItems": ["Ação 1", "Ação 2", "Ação 3"]
          }
        ],
        "timeline": "Tempo estimado total",
        "tools": ["Ferramenta 1", "Ferramenta 2"],
        "tips": ["Dica 1", "Dica 2"]
      }
    }
  ],
  "orderBumps": [
    {
      "name": "Nome",
      "description": "Descrição",
      "price": "R$ XX",
      "when": "Quando oferecer",
      "why": "Por que funciona",
      "comoCriar": "Passo a passo prático de como criar e entregar este bump"
    }
  ],
  "upsell": {
    "name": "Nome",
    "description": "Descrição",
    "price": "R$ XXX",
    "connection": "Como se conecta",
    "why": "Por que funciona",
    "comoCriar": "Passo a passo prático de como criar e entregar este upsell"
  },
  "finalMessage": "🌟 Você tem tudo o que precisa para começar! Escolha um produto, valide com sua audiência e comece simples. O caminho é construído caminhando. Estou torcendo por você! 💛"
}

IMPORTANTE: 
1. O terceiro produto DEVE ter um campo adicional "aiHelp" explicando como a IA pode ajudar.
2. TODOS os produtos DEVEM ter um "implementationGuide" completo com 4-6 passos práticos e acionáveis.
3. Os order bumps e upsell DEVEM ter o campo "comoCriar" com instruções práticas de execução.
4. Os passos devem ser específicos, não genéricos. Exemplo: ao invés de "Crie conteúdo", diga "Grave 3 vídeos de 15 minutos cada explicando X, Y e Z".

`;

    try {
        const response = await callOpenAI(userMessage);
        const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const products = JSON.parse(cleanResponse);

        // Ensure the third product has aiHelp
        if (products.products.length >= 3 && !products.products[2].aiHelp) {
            products.products[2].aiHelp = 'A IA pode ajudar a criar scripts de vendas, textos persuasivos para páginas de vendas, e sugestões de copy para cada produto baseado no perfil da sua audiência.';
        }

        return products;
    } catch (error) {
        console.error('Erro ao gerar produtos finais:', error);
        // Fallback to mock data
        return {
            products: [
                {
                    name: 'Workshop: Seu Primeiro Produto em 48h',
                    promise: 'Crie e valide seu primeiro produto Low Ticket em apenas 2 dias',
                    format: 'Workshop ao vivo de 2 horas + workbook prático',
                    price: 'R$ 47',
                    reasons: [
                        'Resolve a dor urgente de não saber por onde começar',
                        'Entrega resultado rápido (48 horas)',
                        'Formato leve e prático'
                    ],
                    aiHelp: 'A IA pode ajudar a criar o roteiro do workshop, o conteúdo do workbook e os emails de convite.',
                    implementationGuide: {
                        title: 'Como Criar e Lançar Este Workshop',
                        steps: [
                            {
                                step: 1,
                                title: 'Definição do Tema e Promessa',
                                description: 'Escolha um tema específico que resolva uma dor imediata. Defina a promessa clara: "Em 2 horas você vai sair com X pronto".',
                                actionItems: ['Listar 3 dores principais', 'Escolher a mais urgente', 'Escrever a promessa em uma frase']
                            },
                            {
                                step: 2,
                                title: 'Estruturação do Conteúdo',
                                description: 'Divida o workshop em 3 partes: O que é (Conceito), Como fazer (Prática) e Plano de Ação (Próximos passos).',
                                actionItems: ['Criar tópicos da apresentação', 'Preparar exercícios práticos', 'Criar o workbook de apoio']
                            },
                            {
                                step: 3,
                                title: 'Oferta e Venda',
                                description: 'Crie um checkout simples e divulgue para sua audiência (Instagram/WhatsApp) com 48h de antecedência.',
                                actionItems: ['Configurar link de pagamento', 'Fazer 3 posts no Instagram', 'Enviar mensagem para lista de contatos']
                            },
                            {
                                step: 4,
                                title: 'Entrega ao Vivo',
                                description: 'Faça a entrega pelo Zoom ou Google Meet, grave a sessão e disponibilize o replay depois.',
                                actionItems: ['Testar equipamento', 'Enviar link da sala', 'Realizar o workshop']
                            }
                        ],
                        timeline: '48 horas (2 dias)',
                        tools: ['Zoom/Google Meet', 'Canva (Workbook)', 'Instagram'],
                        tips: ['Foque na prática, não na teoria excessiva.', 'Interaja com as participantes.', 'Venda o próximo passo no final.']
                    }
                },
                {
                    name: 'Checklist: Validação de Produto Low Ticket',
                    promise: 'Valide sua ideia de produto em 24h',
                    format: 'Checklist interativo + vídeo explicativo de 15 minutos',
                    price: 'R$ 29',
                    reasons: [
                        'Elimina o medo de criar algo que não vende',
                        'Resultado em menos de 24 horas',
                        'Super leve e direto ao ponto'
                    ],
                    aiHelp: 'A IA pode gerar os itens do checklist e o roteiro do vídeo explicativo.',
                    implementationGuide: {
                        title: 'Como Criar e Lançar Este Checklist',
                        steps: [
                            {
                                step: 1,
                                title: 'Mapeamento do Processo',
                                description: 'Liste todos os passos necessários para atingir o resultado prometido. Organize em ordem cronológica.',
                                actionItems: ['Listar passos', 'Organizar categorias', 'Simplificar a linguagem']
                            },
                            {
                                step: 2,
                                title: 'Criação do Material',
                                description: 'Crie o checklist no Notion, Trello ou PDF editável. Grave um vídeo curto explicando como usar.',
                                actionItems: ['Montar checklist na ferramenta', 'Gravar vídeo de tela (Loom)', 'Hospedar material']
                            },
                            {
                                step: 3,
                                title: 'Divulgação Rápida',
                                description: 'Faça um story perguntando "Quem quer um checklist para X?". Chame no direct quem responder.',
                                actionItems: ['Postar enquete nos stories', 'Responder interessados', 'Enviar link de compra']
                            }
                        ],
                        timeline: '24 horas',
                        tools: ['Notion/Trello', 'Loom (Vídeo)', 'Instagram Stories'],
                        tips: ['O checklist deve ser autoexplicativo.', 'O vídeo deve ser curto e motivador.', 'Peça feedback imediato.']
                    }
                },
                {
                    name: 'Masterclass: Precificação Magnética',
                    promise: 'Aprenda a precificar seus produtos Low Ticket de forma que atraem compras imediatas',
                    format: 'Masterclass gravada (45 min) + calculadora de preços',
                    price: 'R$ 67',
                    reasons: [
                        'Resolve a dúvida paralisante sobre preço',
                        'Entrega ferramenta prática (calculadora)',
                        'Resultado aplicável imediatamente'
                    ],
                    aiHelp: 'A IA pode ajudar a criar scripts de vendas, textos persuasivos e sugestões de copy baseados no perfil da sua audiência.',
                    implementationGuide: {
                        title: 'Como Criar e Lançar Esta Masterclass',
                        steps: [
                            {
                                step: 1,
                                title: 'Roteiro da Aula',
                                description: 'Estruture a aula focando nos erros comuns de precificação e na sua metodologia simples.',
                                actionItems: ['Definir 3 erros comuns', 'Explicar a lógica de preço', 'Mostrar exemplos práticos']
                            },
                            {
                                step: 2,
                                title: 'Ferramenta Prática',
                                description: 'Crie uma planilha simples ou calculadora que a aluna possa preencher e ter o preço final.',
                                actionItems: ['Criar planilha no Google Sheets', 'Testar fórmulas', 'Criar tutorial de uso']
                            },
                            {
                                step: 3,
                                title: 'Gravação e Venda',
                                description: 'Grave a aula, edite se necessário e configure a área de membros. Venda como solução definitiva.',
                                actionItems: ['Gravar aula', 'Configurar plataforma', 'Criar campanha de email']
                            }
                        ],
                        timeline: '3 a 5 dias',
                        tools: ['OBS/Zoom (Gravação)', 'Google Sheets', 'Email Marketing'],
                        tips: ['Mostre bastidores da sua precificação.', 'Use ancoragem de preço.', 'Ofereça bônus de ação rápida.']
                    }
                }
            ],
            orderBumps: [
                {
                    name: 'Template: Página de Vendas Pronta',
                    description: 'Template editável de página de vendas otimizada',
                    price: 'R$ 17',
                    when: 'No checkout do produto principal',
                    why: 'Complementa perfeitamente qualquer produto',
                    comoCriar: 'Crie um modelo no Canva ou Elementor com seções de: Headline, Problema, Solução, Oferta e Garantia. Disponibilize o link de template.'
                },
                {
                    name: 'Acesso: Comunidade de Apoio 30 dias',
                    description: '30 dias de acesso à comunidade exclusiva',
                    price: 'R$ 27',
                    when: 'No checkout do produto principal',
                    why: 'Atende a necessidade emocional de suporte',
                    comoCriar: 'Crie um grupo no WhatsApp ou Telegram fechado. Defina regras claras. Entregue o link de acesso automaticamente após a compra.'
                }
            ],
            upsell: {
                name: 'Mentoria em Grupo: Lançamento do Seu Low Ticket',
                description: 'Mentoria em grupo de 4 semanas para lançar seu produto',
                price: 'R$ 197',
                connection: 'Próximo passo natural após a compra',
                why: 'Para quem quer acelerar resultados com suporte',
                comoCriar: 'Estruture 4 encontros ao vivo (1 por semana). Defina temas: Planejamento, Criação, Venda e Escala. Venda como o próximo nível de acompanhamento.'
            },
            finalMessage: '🌟 Você tem tudo o que precisa para começar! Escolha um produto, valide com sua audiência e comece simples. O caminho é construído caminhando. Estou torcendo por você! 💛'
        };
    }
}

export { SYSTEM_PROMPT };
