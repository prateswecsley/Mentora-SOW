import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { stageId, answers } = await req.json()

    if (!stageId || !answers) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const savedAnswer = await prisma.userAnswer.upsert({
            where: {
                userId_stageId: {
                    userId: user.id,
                    stageId: stageId,
                },
            },
            update: {
                answers: JSON.stringify(answers),
            },
            create: {
                userId: user.id,
                stageId: stageId,
                answers: JSON.stringify(answers),
            },
        })

        return NextResponse.json(savedAnswer)
    } catch (error) {
        console.error("Error saving answer:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
