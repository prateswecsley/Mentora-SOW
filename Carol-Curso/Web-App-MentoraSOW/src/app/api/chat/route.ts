import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, history } = await req.json()

    if (!message) {
        return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

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
            .map((r) => `Relatório Etapa ${r.stageId}:\n${r.report}`)
            .join("\n\n")

        const systemPrompt = `
Você é a Mentora SOW AI, uma mentora espiritual e emocional.
Você já conduziu a aluna por 5 etapas de autoconhecimento e agora está conversando com ela livremente.
Use os relatórios das etapas anteriores como contexto para suas respostas.

Contexto da Aluna:
${reportsContext}

Mantenha o tom acolhedor, profundo e espiritual.
`

        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // GPT-4 Omni - modelo mais avançado
            messages: [
                { role: "system", content: systemPrompt },
                ...(history || []),
                { role: "user", content: message },
            ],
        })

        const reply = completion.choices[0].message.content || "Não consegui processar sua mensagem."

        // Save chat history (simplified for MVP, appending to single record)
        // In a real app, we'd append to a JSON array or separate table rows
        // Here we just update the last interaction timestamp or similar if needed

        return NextResponse.json({ reply })
    } catch (error) {
        console.error("Error in chat:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
