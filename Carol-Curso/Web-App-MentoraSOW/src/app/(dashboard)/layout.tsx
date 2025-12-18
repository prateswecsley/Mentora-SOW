import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { DashboardLayoutClient } from "./DashboardLayoutClient"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/api/auth/signin")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user?.email || "" },
        include: { reports: true },
    })

    const completedStages = user?.reports.map((r) => r.stageId) || []

    return (
        <DashboardLayoutClient completedStages={completedStages}>
            {children}
        </DashboardLayoutClient>
    )
}
