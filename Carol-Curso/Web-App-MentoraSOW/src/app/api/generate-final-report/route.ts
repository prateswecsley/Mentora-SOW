import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { openai } from "@/lib/openai"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                reports: {
                    where: {
                        stageId: {
                            in: [1, 2, 3, 4, 5] // Todos os 5 laudos
                        }
                    },
                    orderBy: { stageId: 'asc' }
                },
                answers: {
                    where: {
                        stageId: {
                            in: [1, 2, 3, 4, 5]
                        }
                    },
                    orderBy: { stageId: 'asc' }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Verificar se todas as 5 etapas foram concluídas
        const completedStages = user.reports.map(r => r.stageId)
        const requiredStages = [1, 2, 3, 4, 5]
        const allStagesCompleted = requiredStages.every(stage => completedStages.includes(stage))

        if (!allStagesCompleted) {
            return NextResponse.json({
                error: "Você precisa completar todas as 5 etapas antes de gerar o Laudo Final",
                completedStages,
                missingStages: requiredStages.filter(s => !completedStages.includes(s))
            }, { status: 400 })
        }

        // Organizar laudos por etapa
        const laudos = {
            missao: user.reports.find(r => r.stageId === 1)?.report || "",
            ikigai: user.reports.find(r => r.stageId === 2)?.report || "",
            arquetipos: user.reports.find(r => r.stageId === 3)?.report || "",
            branding: user.reports.find(r => r.stageId === 4)?.report || "",
            personaProduto: user.reports.find(r => r.stageId === 5)?.report || "",
        }

        // Organizar respostas por etapa - parsear JSON string
        const getAnswersForStage = (stageId: number): Record<string, string> => {
            const answerRecord = user.answers.find(a => a.stageId === stageId)
            if (!answerRecord) return {}
            try {
                return JSON.parse(answerRecord.answers)
            } catch {
                return {}
            }
        }

        const respostasPorEtapa = {
            etapa1: getAnswersForStage(1),
            etapa2: getAnswersForStage(2),
            etapa3: getAnswersForStage(3),
            etapa4: getAnswersForStage(4),
            etapa5: getAnswersForStage(5),
        }

        // Formatar respostas para o prompt
        const formatAnswers = (answers: Record<string, string>) => {
            return Object.entries(answers).map(([qId, answer]) => `P${qId}: ${answer}`).join('\n')
        }

        const respostasFormatadas = `
RESPOSTAS DA ETAPA 1 (MISSÃO SOW):
${formatAnswers(respostasPorEtapa.etapa1)}

RESPOSTAS DA ETAPA 2 (IKIGAI SOW):
${formatAnswers(respostasPorEtapa.etapa2)}

RESPOSTAS DA ETAPA 3 (ARQUÉTIPOS):
${formatAnswers(respostasPorEtapa.etapa3)}

RESPOSTAS DA ETAPA 4 (BRANDING):
${formatAnswers(respostasPorEtapa.etapa4)}

RESPOSTAS DA ETAPA 5 (PERSONA & PRODUTO):
${formatAnswers(respostasPorEtapa.etapa5)}
`

        // Criar prompt especializado para o Laudo Final
        const systemPrompt = `
INSTRUÇÕES GERAIS PARA A IA
Você é a Mentora SOW.
Seu papel é gerar o Laudo Final de Posicionamento Pessoal SOW, unindo todos os laudos anteriores.

Você não deve inventar nada. Tudo deve ser construído a partir das informações presentes nesses laudos.
Sua linguagem é espiritual, firme, profunda, acolhedora e estratégica.

LAUDOS RECEBIDOS (USE COMO RAG - CONTEXTO):

═══════════════════════════════════════════════════════════════
LAUDO 1 - MISSÃO SOW
═══════════════════════════════════════════════════════════════
${laudos.missao}

═══════════════════════════════════════════════════════════════
LAUDO 2 - IKIGAI SOW
═══════════════════════════════════════════════════════════════
${laudos.ikigai}

═══════════════════════════════════════════════════════════════
LAUDO 3 - ARQUÉTIPOS
═══════════════════════════════════════════════════════════════
${laudos.arquetipos}

═══════════════════════════════════════════════════════════════
LAUDO 4 - BRANDING PESSOAL
═══════════════════════════════════════════════════════════════
${laudos.branding}

═══════════════════════════════════════════════════════════════
LAUDO 5 - PERSONA & PRODUTO
═══════════════════════════════════════════════════════════════
${laudos.personaProduto}

═══════════════════════════════════════════════════════════════
RESPOSTAS ORIGINAIS DE TODAS AS ETAPAS
═══════════════════════════════════════════════════════════════
${respostasFormatadas}

═══════════════════════════════════════════════════════════════

ESTRUTURA OBRIGATÓRIA DO LAUDO FINAL EM MARKDOWN:

# ⭐ LAUDO FINAL DE POSICIONAMENTO PESSOAL SOW

### ✨ Mensagem de Abertura

[Escreva uma mensagem profunda e acolhedora sobre a jornada completa dela até aqui. Celebre o que ela descobriu sobre si mesma.]

> 📖 [Versículo bíblico relevante sobre identidade e propósito]

---

## 🪞 1. QUEM VOCÊ É

[Usar: essência e valores (LAUDO_MISSAO) + expressão dos arquétipos (LAUDO_ARQUETIPOS) + linguagem identitária (LAUDO_BRANDING). Criar descrição profunda e coerente de 3-4 parágrafos.]

---

## ✝️ 2. O QUE VOCÊ ACREDITA

[Usar: valores inegociáveis (LAUDO_MISSAO) + crenças centrais (LAUDO_BRANDING) + sentido de vida (LAUDO_IKIGAI). Organizar valores e crenças combinando princípios espirituais, fundamentos emocionais e verdades que movem a cliente. 2-3 parágrafos.]

---

## 🌸 3. O QUE VOCÊ FAZ / ENTREGA / VENDE

[Usar: transformação desejada (LAUDO_MISSAO) + Persona Natural (LAUDO_PERSONA_PRODUTO) + talentos e vocação (LAUDO_IKIGAI). Criar síntese sobre o que ela entrega ao mundo. 3-4 parágrafos.]

---

## 🔥 4. SUA MISSÃO

[Usar: missão (LAUDO_MISSAO) + propósito prático (LAUDO_IKIGAI). Construir frase clara sobre: quem ela guia, de onde para onde guia, por meio de quais dons e força. 2 parágrafos.]

---

## 🧭 5. SUA PERSONA IDEAL

[Usar: Persona Natural (LAUDO_PERSONA_PRODUTO) + elementos emocionais (LAUDO_BRANDING) + pessoas que florescem com ela (LAUDO_MISSAO). Descrever dores reais, características emocionais, bloqueios, valores, sensibilidade. 4-5 parágrafos.]

---

## 🌱 6. SUA TRANSFORMAÇÃO (Ponto A → Ponto B)

[Usar: Ponto A e B (LAUDO_PERSONA_PRODUTO) + linguagem transformadora (LAUDO_MISSAO). Criar pares de transformação: estados emocionais, comportamentos, percepções, identidades. 3-4 pares.]

**De:** [Estado inicial]
**Para:** [Estado transformado]

---

## 🔹 7. SEU MÉTODO AUTORAL

[Usar: etapas espirituais (LAUDO_MISSAO) + caminhos práticos (LAUDO_IKIGAI) + pilares (LAUDO_BRANDING) + direções (LAUDO_PERSONA_PRODUTO). Gerar método com 5-8 etapas.]

**Seu Método em [X] Etapas:**
1. [Etapa 1]
2. [Etapa 2]
3. [Etapa 3]
...

---

## 🪞 8. SEU DIFERENCIAL DE COMUNICAÇÃO

[Usar: expressão dos arquétipos (LAUDO_ARQUETIPOS) + tom de voz (LAUDO_BRANDING) + força de identidade (LAUDO_MISSAO). Descrever comunicação a partir da energia dos arquétipos + tom de voz + presença. 2-3 parágrafos.]

---

## 💎 9. SEUS MANTRAS DE MARCA

**5 Palavras Mantras:**
- [Palavra 1]
- [Palavra 2]
- [Palavra 3]
- [Palavra 4]
- [Palavra 5]

**5 Frases Mantras:**
- "[Frase 1]"
- "[Frase 2]"
- "[Frase 3]"
- "[Frase 4]"
- "[Frase 5]"

[Usar: frases marcantes (LAUDO_BRANDING) + afirmações fortes (LAUDO_MISSAO). Relacionar com fé, propósito e identidade.]

---

## 🎨 10. IDENTIDADE VISUAL SOW

[Usar: identidade visual dos arquétipos (LAUDO_ARQUETIPOS) + estilo emocional (LAUDO_BRANDING) + território de mercado (LAUDO_PERSONA_PRODUTO).]

**Cores dos Seus Arquétipos:**
- [Arquétipo 1]: [Cores]
- [Arquétipo 2]: [Cores]
- [Arquétipo 3]: [Cores]

**Fontes Recomendadas:**
- [Tipo de fonte e exemplos]

**Elementos Visuais:**
- [Elementos que representam sua essência]

**Blend Final para Sua Marca:**
[Recomendação de como combinar tudo de forma coerente]

---

## 🗣️ 11. SUA VOZ ARQUÉTIPA

[Usar: voz dos arquétipos (LAUDO_ARQUETIPOS) + tom e intenção (LAUDO_BRANDING). Descrever como ela fala, guia, cura, inspira ou confronta. 2-3 parágrafos.]

> 📖 "Fala com sabedoria, e a instrução da bondade está na sua língua." - Provérbios 31:26

---

## 🌟 12. ESSÊNCIA DA SUA MARCA PESSOAL SOW

[Usar: elementos repetidos nos cinco laudos + síntese de missão + sensação identitária + propósito + direção arquetípica. Criar UMA frase única que expressa: propósito + identidade + impacto.]

**"[Frase única e poderosa que resume toda a essência dela]"**

---

## 🚀 13. DIREÇÃO DE POSICIONAMENTO

[Usar: posicionamento emocional (LAUDO_BRANDING) + Território de Mercado (LAUDO_PERSONA_PRODUTO) + limites (LAUDO_PERSONA_PRODUTO) + missão prática (LAUDO_MISSAO).]

**Como Aparecer:**
[Orientações claras]

**O Que Comunicar:**
[Temas e mensagens principais]

**O Que Evitar:**
[Limites e o que não fazer]

**Temas Que Sustentam Sua Autoridade:**
[Lista de temas]

**Direção de Crescimento:**
[Próximos passos estratégicos]

---

## ✨ Encerramento

[Mensagem final poderosa e inspiradora sobre a jornada completa dela]

> 📖 [Versículo final sobre chamado e propósito]

✨ **"Tudo o que você precisa já foi colocado dentro de você. Agora é hora de colocar em movimento."**

---

REGRAS OBRIGATÓRIAS:
- Use emojis (⭐, ✨, 🪞, ✝️, 🌸, 🔥, 🧭, 🌱, 🔹, 💎, 🎨, 🗣️, 🌟, 🚀, 📖) exatamente como mostrado
- NUNCA invente informações - use APENAS o que está nos laudos
- Cruze informações dos 5 laudos conforme instruído em cada seção
- Mantenha tom profundo, espiritual, firme, acolhedor e estratégico
- Total: 2500-3500 palavras
- Seja específica e profunda em cada seção
`

        // Gerar o laudo final usando GPT-4o
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "Por favor, gere o Laudo Final de Posicionamento Pessoal SOW integrando todos os laudos anteriores." }
            ],
            temperature: 0.8,
            max_tokens: 4000, // Laudo final é extenso
        })

        const finalReport = completion.choices[0].message.content || "Não foi possível gerar o Laudo Final."

        // Salvar o laudo final no banco com stageId = 0
        await prisma.userReport.upsert({
            where: {
                userId_stageId: {
                    userId: user.id,
                    stageId: 0, // 0 = Laudo Final
                }
            },
            update: {
                report: finalReport,
            },
            create: {
                userId: user.id,
                stageId: 0,
                report: finalReport,
            }
        })

        return NextResponse.json({ report: finalReport })

    } catch (error) {
        console.error("Error generating final report:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
