"use client"

import { usePathname } from "next/navigation"
import { StageSidebar } from "@/components/StageSidebar"
import { clsx } from "clsx"

interface DashboardLayoutClientProps {
    children: React.ReactNode
    completedStages: number[]
}

export function DashboardLayoutClient({ children, completedStages }: DashboardLayoutClientProps) {
    const pathname = usePathname()

    // Hide sidebar on dashboard and intro pages
    const isDashboard = pathname === "/dashboard"
    const isIntro = pathname?.endsWith("/intro")
    const showSidebar = !isDashboard && !isIntro

    // Determine current stage for sidebar highlighting
    // Extract stage ID from path /stage/[id]
    const match = pathname?.match(/\/stage\/(\d+)/)
    const currentStage = match ? parseInt(match[1]) : 0

    return (
        <div className="flex h-[100dvh] bg-gray-900 relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-gray-900/80 to-gray-900/90" />

            {/* Content */}
            <div className="relative z-10 flex w-full">
                {showSidebar && (
                    <StageSidebar completedStages={completedStages} currentStage={currentStage} />
                )}
                <main className={clsx("flex-1 overflow-y-auto", showSidebar ? "p-8" : "p-0")}>
                    {children}
                </main>
            </div>
        </div>
    )
}
