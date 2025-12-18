import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { name, image, password } = await req.json()

        // Validation (Basic)
        if (name && name.length < 2) {
            return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 })
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            name: name || undefined,
            image: image || undefined
        }

        // Hash password if provided
        if (password) {
            if (password.length < 6) {
                return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
            }
            updateData.password = await hash(password, 12)
        }

        // Update User
        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData
        })

        return NextResponse.json(updatedUser)

    } catch (error) {
        console.error("Error updating profile:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
