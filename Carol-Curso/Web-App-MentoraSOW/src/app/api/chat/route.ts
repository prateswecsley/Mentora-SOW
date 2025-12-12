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

DIRETRIZ FINAL:
Responda APENAS com base no contexto acima. Se a aluna perguntar algo fora da sua competência (ex: jurídico, médico), decline educadamente.
`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Ensuring we use the best model for this complex instruction
            messages: [
                { role: "system", content: systemPrompt },
                ...(history || []),
                { role: "user", content: message },
            ],
            temperature: 0.7, // Balanced creativity and adherence
        })

        const reply = completion.choices[0].message.content || "Não consegui processar sua mensagem. Tente novamente."

        return NextResponse.json({ reply })
    } catch (error) {
        console.error("Error in chat:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
