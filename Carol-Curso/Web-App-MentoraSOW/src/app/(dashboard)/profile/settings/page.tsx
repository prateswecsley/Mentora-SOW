"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { User, Mail, Shield, AlertCircle, Save, Camera, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
    const { data: session, update } = useSession()
    const router = useRouter()

    const [name, setName] = useState(session?.user?.name || "")
    const [imageUrl, setImageUrl] = useState(session?.user?.image || "")
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, image: imageUrl }),
            })

            if (!res.ok) throw new Error("Erro ao atualizar perfil")

            await update({ name, image: imageUrl }) // Update client session
            setMessage({ type: 'success', text: "Perfil atualizado com sucesso!" })
            router.refresh()

        } catch (error) {
            setMessage({ type: 'error', text: "Erro ao salvar alterações. Tente novamente." })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
                Configurações do Perfil
            </h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Visual Identity / Preview */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 rounded-full border-4 border-purple-900/50 mx-auto overflow-hidden bg-gray-900 flex items-center justify-center">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${name || 'User'}&background=random`
                                        }}
                                    />
                                ) : (
                                    <User className="w-16 h-16 text-gray-600" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full text-white shadow-lg">
                                <Camera className="w-4 h-4" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white">{name || "Seu Nome"}</h2>
                        <p className="text-sm text-gray-400">{session?.user?.email}</p>
                    </div>
                </div>

                {/* Forms Area */}
                <div className="md:col-span-2 space-y-6">

                    {/* Public Profile Form */}
                    <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
                            <User className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-semibold text-white">Dados do Perfil</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Como você quer ser chamada?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">URL da Foto de Perfil</label>
                                <input
                                    type="text"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="https://exemplo.com/sua-foto.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Dica: Cole um link direto de uma imagem sua (LinkedIn, Gravatar ou hospedada na web).
                                </p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                {message.type === 'success' ? <Shield className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                {message.text}
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Salvando..." : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Security Info Card (Replacing Password Form) */}
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 space-y-4 opacity-80">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-800">
                            <Lock className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-semibold text-white">Segurança & Senha</h3>
                        </div>

                        <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl flex gap-4 items-start">
                            <Shield className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-blue-200 mb-1">Login Seguro sem Senha</h4>
                                <p className="text-sm text-blue-300 leading-relaxed">
                                    Sua conta utiliza autenticação moderna via <strong>Link Mágico (Email)</strong> ou <strong>Social Login (Google/GitHub)</strong>.
                                    Isso significa que você não precisa memorizar ou trocar senhas aqui. Sua segurança é garantida diretamente pelo seu provedor de email.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
