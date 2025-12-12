import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { User, Mail, Calendar } from "lucide-react"
import Link from "next/link"

export default async function ProfilePage() {
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
                        Meu Perfil
                    </h1>
                </div>

                {/* Profile Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8 shadow-2xl">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-700">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {session.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || ""}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || "U"
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{session.user?.name || "Usuário"}</h2>
                            <p className="text-gray-400">{session.user?.email}</p>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-200 mb-4">Informações da Conta</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm text-gray-400">Nome</span>
                                </div>
                                <p className="text-white font-medium">{session.user?.name || "Não informado"}</p>
                            </div>

                            {/* Email */}
                            <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                                <div className="flex items-center gap-3 mb-2">
                                    <Mail className="w-5 h-5 text-purple-400" />
                                    <span className="text-sm text-gray-400">Email</span>
                                </div>
                                <p className="text-white font-medium">{session.user?.email}</p>
                            </div>
                        </div>

                        {/* Coming Soon Features */}
                        <div className="mt-8 p-6 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                            <h4 className="text-lg font-semibold text-yellow-400 mb-2">🚧 Em Desenvolvimento</h4>
                            <p className="text-gray-300 text-sm">
                                Em breve você poderá editar seu perfil, alterar senha e fazer upload de foto de perfil!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
