import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Settings as SettingsIcon, Lock, Bell, Shield } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/api/auth/signin")
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 transition-colors">
                        ← Voltar ao Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold mt-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        Configurações
                    </h1>
                </div>

                {/* Settings Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl">
                    <div className="space-y-6">
                        {/* Settings Options (Coming Soon) */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600 opacity-50 cursor-not-allowed">
                                <Lock className="w-6 h-6 text-gray-400" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-300">Alterar Senha</h3>
                                    <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
                                </div>
                                <span className="text-xs bg-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full">Em breve</span>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600 opacity-50 cursor-not-allowed">
                                <Bell className="w-6 h-6 text-gray-400" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-300">Notificações</h3>
                                    <p className="text-sm text-gray-500">Gerencie suas preferências de notificação</p>
                                </div>
                                <span className="text-xs bg-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full">Em breve</span>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600 opacity-50 cursor-not-allowed">
                                <Shield className="w-6 h-6 text-gray-400" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-300">Privacidade</h3>
                                    <p className="text-sm text-gray-500">Configure suas opções de privacidade</p>
                                </div>
                                <span className="text-xs bg-yellow-900/50 text-yellow-400 px-3 py-1 rounded-full">Em breve</span>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="mt-8 p-6 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                            <h4 className="text-lg font-semibold text-purple-400 mb-2">🚀 Novidades em Breve</h4>
                            <p className="text-gray-300 text-sm">
                                Estamos trabalhando para trazer mais opções de configuração para você personalizar sua experiência!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
