import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { QuestionBlock } from "@/components/QuestionBlock"
import { ReportSection } from "@/components/ReportSection"
import { StageClient } from "./client" // We'll create this client component

export default async function StagePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/api/auth/signin")

    const { id } = await params
    const stageId = parseInt(id)

    const user = await prisma.user.findUnique({
        where: { email: session.user?.email! },
        include: {
            answers: { where: { stageId } },
            reports: { where: { stageId } }
        },
    })

    const savedAnswers = user?.answers[0]?.answers ? JSON.parse(user.answers[0].answers) : {}
    const report = user?.reports[0]?.report

    // Define questions for each stage
    let questions: any[] = []
    let stageTitle = ""
    let stageDescription = ""

    if (stageId === 1) {
        stageTitle = "Missão SOW"
        stageDescription = "Responda com o coração para descobrir sua essência."
        questions = [
            {
                id: 1,
                title: "Qual momento da sua vida mais te transformou até hoje?",
                tip: "Pense em um evento que dividiu sua vida em antes e depois.",
                example: "Quando perdi meu emprego e precisei me reinventar, descobrindo minha força.",
            },
            {
                id: 2,
                title: "Que tipo de conselho ou ajuda as pessoas mais pedem pra você?",
                tip: "Isso revela seus dons naturais em ação.",
                example: "Sempre me pedem conselhos sobre relacionamentos ou como organizar a vida.",
            },
            {
                id: 3,
                title: "Quais causas ou comportamentos mexem com você — pro bem ou pro mal?",
                tip: "O que te indigna ou te emociona profundamente?",
                example: "Me indigna ver injustiça com crianças. Me emociona ver mulheres se apoiando.",
            },
            {
                id: 4,
                title: "Se você tivesse que falar pra apenas uma mulher, quem seria ela?",
                tip: "Visualize sua 'persona' de alma.",
                example: "Uma mulher de 30 anos, mãe, que se sente perdida profissionalmente.",
            },
            {
                id: 5,
                title: "Como você sente que se expressa melhor?",
                tip: "Escrevendo, falando, criando imagens, cuidando?",
                example: "Me expresso melhor escrevendo textos longos e profundos.",
            },
            {
                id: 6,
                title: "Se alguém perguntasse: ‘o que só você carrega?’, o que você responderia?",
                tip: "Sua singularidade e essência.",
                example: "Carrego uma capacidade de ver beleza onde ninguém vê.",
            },
            {
                id: 7,
                title: "Quando você sonha com a sua missão, o que deseja transformar na vida de outras mulheres?",
                tip: "O impacto final que você quer causar.",
                example: "Quero que elas se sintam livres para serem quem são.",
            },
            {
                id: 8,
                title: "Você já pensou em transformar o digital em uma extensão da sua missão?",
                tip: "O digital como meio, não fim.",
                example: "Sim, mas tenho medo de me expor. Quero usar para alcançar mais gente.",
            },
        ]
    } else if (stageId === 2) {
        stageTitle = "IKIGAI SOW"
        stageDescription = "Descubra o ponto de encontro entre o que você ama, o que sabe fazer, o que o mundo precisa e o que pode ser pago."
        questions = [
            // BLOCO 1 — O QUE VOCÊ AMA
            {
                id: 1,
                title: "O que você faria mesmo sem ganhar nada por isso?",
                tip: "Pense em atividades que você faz por puro prazer e amor.",
                example: "Escreveria histórias, cuidaria de plantas, aconselharia amigas.",
            },
            {
                id: 2,
                title: "Sobre o que você poderia falar por horas e não se cansar?",
                tip: "Temas que acendem sua alma e te deixam empolgada.",
                example: "Sobre desenvolvimento pessoal, sobre moda sustentável, sobre educação infantil.",
            },
            // BLOCO 2 — O QUE VOCÊ FAZ BEM
            {
                id: 3,
                title: "Quais são as habilidades que as pessoas elogiam em você?",
                tip: "O que os outros reconhecem como um talento natural seu.",
                example: "Minha organização, minha capacidade de escuta, meu olhar estético.",
            },
            {
                id: 4,
                title: "Em quais momentos você sente que está fluindo, com facilidade e leveza?",
                tip: "Quando o tempo passa voando e você nem percebe o esforço.",
                example: "Quando estou criando layouts, quando estou cozinhando, quando estou ensinando.",
            },
            // BLOCO 3 — O QUE O MUNDO PRECISA
            {
                id: 5,
                title: "Que tipo de transformação você sente que o mundo precisa com urgência?",
                tip: "Onde você vê dor ou falta e sente vontade de ajudar.",
                example: "O mundo precisa de mais empatia, de mulheres mais seguras, de educação financeira.",
            },
            {
                id: 6,
                title: "Que tipo de ajuda as pessoas costumam pedir para você?",
                tip: "Isso indica onde você já é vista como solução.",
                example: "Pedem ajuda para resolver conflitos, para organizar a casa, para escrever textos.",
            },
            // BLOCO 4 — PELO QUE VOCÊ PODE SER PAGA
            {
                id: 7,
                title: "Quais talentos ou experiências suas poderiam se tornar um serviço, produto ou mentoria?",
                tip: "Como empacotar o que você sabe em algo valioso.",
                example: "Posso dar mentoria de carreira, vender meus bolos, criar um curso de automaquiagem.",
            },
            {
                id: 8,
                title: "Que tipo de resultado você já gerou na sua vida que poderia gerar também na vida de outras pessoas?",
                tip: "O que você superou ou conquistou que pode ensinar.",
                example: "Superei a timidez, organizei minhas finanças, emagreci com saúde.",
            },
        ]
    } else if (stageId === 3) {
        stageTitle = "Arquétipos"
        stageDescription = "Descubra os arquétipos femininos que definem sua identidade. Escolha até 3 letras (A-L) por pergunta."
        questions = [
            {
                id: 1,
                title: "Quando você imagina o seu papel no mundo, você se vê como…",
                tip: "Escolha até 3 letras que mais combinam com você (A-L)",
                example: "A, C, F (ou apenas uma letra, se preferir)",
            },
            {
                id: 2,
                title: "O que mais te impulsiona a produzir conteúdo (ou se expressar) no digital?",
                tip: "Escolha até 3 letras (A-L)",
                example: "B, D, L",
            },
            {
                id: 3,
                title: "O que você mais valoriza em si mesma como comunicadora?",
                tip: "Escolha até 3 letras (A-L)",
                example: "C, F, K",
            },
            {
                id: 4,
                title: "Qual dessas frases mais parece com algo que você diria?",
                tip: "Escolha até 3 letras (A-L)",
                example: "A, H, J",
            },
            {
                id: 5,
                title: "Em um grupo, as pessoas te reconhecem como…",
                tip: "Escolha até 3 letras (A-L)",
                example: "C, D, L",
            },
            {
                id: 6,
                title: "O que mais te incomoda no mercado digital hoje?",
                tip: "Escolha até 3 letras (A-L)",
                example: "B, E, F",
            },
            {
                id: 7,
                title: "Quando você enfrenta um desafio, seu instinto é…",
                tip: "Escolha até 3 letras (A-L)",
                example: "A, D, K",
            },
            {
                id: 8,
                title: "Qual seria sua assinatura de posicionamento?",
                tip: "Escolha até 3 letras (A-L)",
                example: "C, F, L",
            },
            {
                id: 9,
                title: "O que te faz sentir mais viva?",
                tip: "Escolha até 3 letras (A-L)",
                example: "B, H, L",
            },
            {
                id: 10,
                title: "Qual dessas palavras mais te representa?",
                tip: "Escolha até 3 letras (A-L)",
                example: "A, F, J",
            },
            {
                id: 11,
                title: "Por que você quer empreender no digital (ou se expressar mais)?",
                tip: "Escolha até 3 letras (A-L)",
                example: "C, D, L",
            },
            {
                id: 12,
                title: "Se você tivesse que resumir sua missão em uma frase, seria:",
                tip: "Escolha até 3 letras (A-L)",
                example: "A, F, J",
            },
            {
                id: 13,
                title: "Como você reage quando alguém não acredita em você?",
                tip: "Escolha até 3 letras (A-L)",
                example: "B, D, E",
            },
            {
                id: 14,
                title: "Quando você olha para o futuro, o que mais te inspira?",
                tip: "Escolha até 3 letras (A-L)",
                example: "A, F, L",
            },
            {
                id: 15,
                title: "O que mais te frustra em si mesma?",
                tip: "Escolha até 3 letras (A-L)",
                example: "C, D, K",
            },
            {
                id: 16,
                title: "Como você costuma tomar decisões importantes?",
                tip: "Escolha até 3 letras (A-L)",
                example: "A, C, F",
            },
            {
                id: 17,
                title: "Se você tivesse um superpoder, qual seria?",
                tip: "Escolha até 3 letras (A-L)",
                example: "F, J, L",
            },
            {
                id: 18,
                title: "Qual é a sua maior motivação para trabalhar no digital?",
                tip: "Escolha até 3 letras (A-L)",
                example: "A, C, F",
            },
            {
                id: 19,
                title: "Quando alguém te elogia, o que mais te toca?",
                tip: "Escolha até 3 letras (A-L)",
                example: "C, F, J",
            },
            {
                id: 20,
                title: "Qual é a sua maior força, no fundo da alma?",
                tip: "Escolha até 3 letras (A-L)",
                example: "A, F, L",
            },
        ]
    } else if (stageId === 4) {
        stageTitle = "Branding"
        stageDescription = "Descubra sua identidade de marca pessoal. Responda com verdade e presença."
        questions = [
            // BLOCO 1 — IDENTIDADE (Quem eu sou)
            {
                id: 1,
                title: "Quais são os três valores que você considera totalmente inegociáveis na sua vida?",
                tip: "Extrai base moral, identidade e tom de voz",
                example: "Honestidade, liberdade, compaixão",
            },
            {
                id: 2,
                title: "Quais experiências da sua vida te moldaram profundamente?",
                tip: "Mostra história, narrativa e origem da marca pessoal",
                example: "A perda de um ente querido, uma mudança de carreira, superação de uma doença",
            },
            {
                id: 3,
                title: "Quando as pessoas te descrevem, quais palavras elas mais usam?",
                tip: "Revela percepção externa = parte da experiência de marca",
                example: "Forte, acolhedora, inspiradora",
            },
            {
                id: 4,
                title: "Qual é o traço mais bonito da sua personalidade, na sua opinião?",
                tip: "Revela força identitária",
                example: "Minha capacidade de ouvir sem julgar",
            },
            {
                id: 5,
                title: "E qual é a sua fraqueza que mais te humaniza?",
                tip: "Constrói profundidade e vulnerabilidade estratégica",
                example: "Às vezes sou muito exigente comigo mesma",
            },
            // BLOCO 2 — ESSÊNCIA E MENSAGEM (O que eu acredito)
            {
                id: 6,
                title: "Que verdade você gostaria que todas as mulheres soubessem?",
                tip: "Mantra + mensagem central da marca",
                example: "Que elas são suficientes exatamente como são",
            },
            {
                id: 7,
                title: "O que te irrita, te incomoda ou te entristece no mundo hoje?",
                tip: "Revela causa — posicionamento emocional e ético",
                example: "Ver mulheres se diminuindo para caber em padrões",
            },
            {
                id: 8,
                title: "Qual é a frase, versículo, princípio ou pensamento que guia sua vida?",
                tip: "Revela identidade espiritual e eixo moral",
                example: "Tudo posso naquele que me fortalece - Filipenses 4:13",
            },
            {
                id: 9,
                title: "Se você pudesse escrever uma frase para colocar na bio de todas as mulheres, qual seria?",
                tip: "Revela estilo de comunicação e narrativa",
                example: "Feita de fé, força e propósito",
            },
            // BLOCO 3 — POSICIONAMENTO (Para quem eu existo)
            {
                id: 10,
                title: "Quem são as pessoas que você mais sente chamado para ajudar? Descreva como elas são.",
                tip: "Revela persona natural da marca",
                example: "Mulheres de 30-40 anos que se sentem perdidas profissionalmente",
            },
            {
                id: 11,
                title: "Que dores você entende profundamente porque já viveu ou já estudou?",
                tip: "Revela autoridade vivida e empatia real",
                example: "A dor de se sentir invisível, de não saber qual é seu propósito",
            },
            {
                id: 12,
                title: "O que você acredita que ninguém faz tão bem quanto você — mesmo que você não tenha percebido ainda?",
                tip: "Revela diferencial e território de marca",
                example: "Conectar espiritualidade com estratégia de negócios",
            },
            // BLOCO 4 — PROPOSTA DE VALOR (O que eu entrego)
            {
                id: 13,
                title: "Que resultados você já gerou para si mesma que poderia gerar para outras pessoas?",
                tip: "Revela transformação replicável e proposta de valor",
                example: "Saí de um emprego que me sufocava e criei meu próprio negócio",
            },
            {
                id: 14,
                title: "Quais são suas habilidades naturais (as coisas que parecem fáceis para você, mas não para os outros)?",
                tip: "Revela dons e forças centrais da marca",
                example: "Escrever textos que tocam o coração, organizar ideias complexas",
            },
            {
                id: 15,
                title: "Se você pudesse ensinar uma única coisa ao mundo, qual seria?",
                tip: "Revela o produto central da alma dela",
                example: "Como se reconectar com sua essência e viver com propósito",
            },
            // BLOCO 5 — EXPERIÊNCIA DE MARCA (Como as pessoas se sentem perto de você)
            {
                id: 16,
                title: "Como você deseja que as pessoas se sintam quando entram em contato com você?",
                tip: "Revela atmosfera, estética, sensações e tom",
                example: "Acolhidas, inspiradas, vistas",
            },
            {
                id: 17,
                title: "O que as pessoas dizem que sentem quando conversam com você?",
                tip: "Revela a energia emocional da marca",
                example: "Que se sentem ouvidas, que saem mais leves",
            },
            {
                id: 18,
                title: "Quando você entra em um ambiente, qual é a sensação que você naturalmente traz?",
                tip: "Revela presença e assinatura emocional",
                example: "Calma, confiança, alegria",
            },
            // BLOCO 6 — VISÃO E FUTURO (Para onde você quer levar as pessoas)
            {
                id: 19,
                title: "Quando você olha para sua vida daqui a 5 anos, quem você deseja ser — como mulher e como marca?",
                tip: "Revela ambição, promessa, visão e destino da marca",
                example: "Uma referência em branding espiritual, ajudando milhares de mulheres",
            },
            {
                id: 20,
                title: "Qual transformação você sonha em gerar na vida das mulheres que te acompanham?",
                tip: "Revela a grande missão — o norte da marca pessoal",
                example: "Que elas descubram sua essência e construam marcas autênticas",
            },
        ]
    } else if (stageId === 5) {
        stageTitle = "Persona & Produto"
        stageDescription = "Vamos descobrir quem você pode ajudar e o que você pode entregar ao mundo. Responda com verdade e liberdade."
        questions = [
            // PARTE 1 — IDENTIFICAR SE JÁ EXISTE UM PRODUTO
            {
                id: 1,
                title: "Você já tem um produto, projeto ou serviço?",
                tip: "Responda Sim ou Não. Se sim, descreva nas próximas perguntas",
                example: "Sim / Não",
            },
            {
                id: 2,
                title: "Se você respondeu SIM na pergunta anterior: Descreva seu produto/projeto. O que ele é? Para quem é? O que entrega? (Se respondeu NÃO, deixe em branco)",
                tip: "Seja clara e objetiva",
                example: "Mentoria de branding para mulheres empreendedoras que querem se posicionar com autenticidade",
            },
            {
                id: 3,
                title: "Se você JÁ TEM um produto: Você sente que este produto nasce do seu propósito, ou imagina fazer algo diferente no futuro? Por quê? (Se não tem produto, deixe em branco)",
                tip: "Avalie o alinhamento entre produto atual e propósito",
                example: "Sim, sinto que nasce do meu propósito porque...",
            },
            {
                id: 4,
                title: "Se você NÃO TEM um produto: Você imagina algo que poderia ou gostaria de fazer no digital, na vida pessoal ou em algum trabalho físico? Se sim, descreva. (Se já tem produto, deixe em branco)",
                tip: "Não precisa ser algo definido, apenas uma intenção",
                example: "Gostaria de ensinar mulheres a se reconectarem com sua essência através da escrita",
            },
            // PARTE 2 — PERGUNTAS SOBRE VOCAÇÃO, REJEIÇÃO E DESEJO
            {
                id: 5,
                title: "O que é muito fácil para você fazer — tão natural — que às vezes você nem percebe que é uma habilidade?",
                tip: "Identifica talentos e zona de genialidade",
                example: "Escrever textos que tocam o coração, organizar ideias complexas de forma simples",
            },
            {
                id: 6,
                title: "O que você NÃO suporta de jeito nenhum fazer? Quais tarefas drenam sua energia?",
                tip: "Identifica limites e riscos emocionais",
                example: "Trabalhar com planilhas, atender muitas pessoas ao mesmo tempo",
            },
            {
                id: 7,
                title: "Quais temas você poderia conversar por horas sem cansar? Por quê?",
                tip: "Identifica constância e autenticidade",
                example: "Propósito, espiritualidade, branding pessoal — porque me fazem sentir viva",
            },
            {
                id: 8,
                title: "Quais tipos de pessoas você sente que florescem perto de você?",
                tip: "Identifica público-alvo natural e energia transformadora",
                example: "Mulheres sensíveis que buscam profundidade e autenticidade",
            },
            {
                id: 9,
                title: "E quais tipos de pessoas você não conseguiria atender ou conviver profissionalmente? Por quê?",
                tip: "Identifica desalinhamentos e riscos emocionais",
                example: "Pessoas que só querem fórmulas prontas sem se aprofundar",
            },
            {
                id: 10,
                title: "Se você pudesse ajudar alguém hoje, com algo que você já sabe ou já viveu, quem seria essa pessoa? Descreva.",
                tip: "Identifica dores que você resolve naturalmente",
                example: "Uma mulher de 35 anos que se sente perdida profissionalmente e quer encontrar seu propósito",
            },
            {
                id: 11,
                title: "Que transformação você adoraria proporcionar — mesmo que ainda não saiba como?",
                tip: "Revela a essência da missão",
                example: "Que mulheres descubram sua essência e construam vidas alinhadas com quem realmente são",
            },
            {
                id: 12,
                title: "Que coisas você sente que 'travam' você quando pensa em trabalhar com isso? (medos, inseguranças, dúvidas, limitações)",
                tip: "Identifica obstáculos emocionais e estruturais",
                example: "Medo de não ser boa o suficiente, de não ter autoridade",
            },
            {
                id: 13,
                title: "Se você tivesse que escolher um único caminho para explorar nos próximos meses, qual seria? Por quê?",
                tip: "Identifica direção de curto prazo",
                example: "Criar conteúdo sobre propósito e branding pessoal, porque sinto que é meu chamado",
            },
        ]
    }

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Etapa {stageId}: {stageTitle}</h1>
                <p className="text-gray-400 mt-2">{stageDescription}</p>
            </header>

            <StageClient
                stageId={stageId}
                questions={questions}
                initialAnswers={savedAnswers}
                initialReport={report}
            />
        </div>
    )
}
