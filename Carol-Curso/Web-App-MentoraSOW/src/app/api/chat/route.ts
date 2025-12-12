import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import OpenAI from "openai"
import { BASE_IDENTITY, SPHERE_PROMPTS } from "@/lib/mentoraPrompts"

// Create OpenAI client with custom configuration if needed
// The library handles OPENAI_API_KEY processing automatically
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, history, sphere } = await req.json()

    if (!message) {
        return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    // Default to sphere1 if not provided or invalid
    const currentSphere = (sphere as keyof typeof SPHERE_PROMPTS) || "sphere1"
    const sphereInstruction = SPHERE_PROMPTS[currentSphere] || SPHERE_PROMPTS["sphere1"]

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { reports: true },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Contextualize with previous reports
        const reportsContext = user.reports
            .map((r) => `[Relatório Etapa ${r.stageId}]:\n${r.report}`)
            .join("\n\n------------------\n\n")

        const systemPrompt = `
${BASE_IDENTITY}

CONTEXTO DO USUÁRIO (RAG - LAUDOS):
${reportsContext ? reportsContext : "Ainda não há relatórios gerados."}

INSTRUÇÕES DA ESFERA SELECIONADA AGORA:
${sphereInstruction}

DIRETRIZ DE FORMATO DE RESPOSTA (OBRIGATÓRIO):
Você DEVE SEMPRE responder no formato JSON com duas chaves:
1. "reply": A sua resposta textual completa para a aluna, formatada em Markdown.
2. "suggestions": Uma lista (array) de 3 strings curtas com sugestões de perguntas que a aluna pode fazer a seguir para continuar o papo. As sugestões devem ser contextualizadas com o que você acabou de responder.

Exemplo de saída JSON:
{
  "reply": "Sua resposta aqui...",
  "suggestions": ["Como posso aprofundar nisso?", "Me dê um exemplo prático", "Qual o próximo passo?"]
}

DIRETRIZ FINAL:
Responda APENAS com base no contexto acima. Se a aluna perguntar algo fora da sua competência (ex: jurídico, médico), decline educadamente, mas mantendo o JSON.
`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...(history || []),
                { role: "user", content: message },
            ],
            response_format: { type: "json_object" }, // Enforcing structured output
            temperature: 0.7,
        })

        const content = completion.choices[0].message.content
        let parsedResponse

        try {
            parsedResponse = content ? JSON.parse(content) : { reply: "Erro ao processar resposta.", suggestions: [] }
        } catch (e) {
            console.error("Failed to parse JSON response from AI", e)
            // Fallback if parsing fails
            parsedResponse = { reply: content || "Erro no formato da resposta.", suggestions: [] }
        }

        return NextResponse.json({
            reply: parsedResponse.reply,
            suggestions: parsedResponse.suggestions || []
        })
    } catch (error) {
        console.error("Error in chat:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
