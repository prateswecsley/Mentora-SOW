import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './NewReport.css';
import { STEP1_QUESTIONS, STEP4_QUESTIONS } from '../utils/questions';
import { generateMarketAnalysis, generateStrategicReport, generateFinalProducts } from '../utils/aiService';

function NewReport({ user, onLogout }) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [step1Answers, setStep1Answers] = useState(Array(12).fill(''));
    const [marketAnalysis, setMarketAnalysis] = useState(null);
    const [strategicReport, setStrategicReport] = useState(null);
    const [step4Answers, setStep4Answers] = useState(Array(8).fill(''));
    const [finalProducts, setFinalProducts] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedBumps, setExpandedBumps] = useState({});
    const [upsellExpanded, setUpsellExpanded] = useState(false);

    const handleStep1Submit = async () => {
        if (step1Answers.some(answer => !answer.trim())) {
            alert('Por favor, responda todas as 12 perguntas.');
            return;
        }

        setIsLoading(true);
        try {
            const analysis = await generateMarketAnalysis(step1Answers);
            setMarketAnalysis(analysis);
            setCurrentStep(2);
        } catch (error) {
            alert('Erro ao gerar análise de mercado. Tente novamente.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2Continue = async () => {
        setIsLoading(true);
        try {
            const report = await generateStrategicReport(step1Answers, marketAnalysis);
            setStrategicReport(report);
            setCurrentStep(3);
        } catch (error) {
            alert('Erro ao gerar relatório estratégico. Tente novamente.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep3Validation = (isValid) => {
        if (isValid) {
            setCurrentStep(4);
        } else {
            setCurrentStep(1);
        }
    };

    const handleStep4Submit = async () => {
        if (step4Answers.some(answer => !answer.trim())) {
            alert('Por favor, responda todas as 8 perguntas.');
            return;
        }

        setIsLoading(true);
        try {
            const products = await generateFinalProducts(step1Answers, strategicReport, step4Answers);
            const sanitizedBumps = (products.orderBumps || []).map(b => ({
                ...b,
                comoCriar: b.comoCriar || b.howTo || 'Como criar: descreva passo a passo a implementação deste bump.'
            }));
            const sanitizedUpsell = products.upsell
                ? {
                    ...products.upsell,
                    comoCriar: products.upsell.comoCriar || products.upsell.howTo || 'Como criar: descreva passo a passo a implementação deste upsell.'
                }
                : null;
            const sanitized = {
                ...products,
                orderBumps: sanitizedBumps,
                upsell: sanitizedUpsell
            };
            setFinalProducts(sanitized);
            setExpandedBumps({});
            setUpsellExpanded(false);

            const newReport = {
                user_id: user.id,
                title: `Relatório ${new Date().toLocaleDateString('pt-BR')}`,
                summary: strategicReport.oferta,
                content: {
                    marketAnalysis,
                    strategicReport,
                    products: sanitized.products,
                    orderBumps: sanitized.orderBumps,
                    upsell: sanitized.upsell,
                    finalMessage: sanitized.finalMessage,
                    answers: [...step1Answers, ...step4Answers]
                }
            };

            const { error } = await supabase
                .from('reports')
                .insert([newReport]);

            if (error) throw error;

            setCurrentStep(5);
        } catch (error) {
            alert('Erro ao gerar produtos finais. Tente novamente.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="new-report-container">
            <nav className="navbar business-navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-left">
                            <h1 className="navbar-title gradient-title">Mentora SOW</h1>
                        </div>
                        <div className="navbar-actions">
                            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary outline-btn business-logout">Voltar</button>
                            <button onClick={onLogout} className="btn btn-secondary outline-btn business-logout">Sair</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="new-report-main container">
                <div className="progress-bar">
                    <div className="progress-steps">
                        {[1, 2, 3, 4, 5].map(step => (
                            <div key={step} className={`progress-step ${currentStep >= step ? 'active' : ''}`}>
                                {step}
                            </div>
                        ))}
                    </div>
                </div>

                {currentStep === 1 && (
                    <div className="step-content card">
                        <h2 className="step-title">Etapa 1 — Identidade 🌷</h2>
                        <div className="step-intro">
                            <p>Olá, mulher maravilhosa! 🌷 Que bom ter você aqui.</p>
                            <p>Eu estou aqui para caminhar com você e te ajudar a transformar sua história em um produto Low Ticket vendável, simples e estratégico.</p>
                            <p>Nós vamos juntas por etapas. Primeiro, preciso conhecer você profundamente.</p>
                            <p><strong>Vou te fazer 12 perguntas iniciais (Etapa 1 – Identidade e Chamada).</strong></p>
                            <p>✨ Importante: responda com calma, profundidade e o máximo de detalhes possível.</p>
                            <p>💡 Lembre-se: a qualidade do seu produto digital está diretamente ligada à qualidade das suas respostas.</p>
                        </div>

                        <div className="questions-grid-modern">
                            {STEP1_QUESTIONS.map((q, index) => (
                                <div key={index} className="question-card-modern">
                                    <div className="question-card-header">
                                        <span className="question-number">{index + 1}</span>
                                        <h3 className="question-text">{q.question}</h3>
                                    </div>
                                    <div className="question-card-body">
                                        <div className="question-tip">
                                            <span className="tip-icon">💡</span>
                                            <span className="tip-text">{q.tip}</span>
                                        </div>
                                        <div className="question-example">
                                            <span className="example-icon">✨</span>
                                            <span className="example-text">{q.example}</span>
                                        </div>
                                        <textarea
                                            className="question-textarea"
                                            placeholder="Sua resposta..."
                                            value={step1Answers[index]}
                                            onChange={(e) => {
                                                const newAnswers = [...step1Answers];
                                                newAnswers[index] = e.target.value;
                                                setStep1Answers(newAnswers);
                                            }}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleStep1Submit}
                            className="btn btn-primary step-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processando...' : 'Continuar para Etapa 2'}
                        </button>
                    </div>
                )}

                {currentStep === 2 && marketAnalysis && (
                    <div className="step-content card">
                        <h2 className="step-title">Etapa 2 — Análise de Mercado 🔎</h2>
                        <div className="analysis-content">
                            <h3>Nichos Identificados:</h3>
                            {marketAnalysis.niches.map((niche, index) => (
                                <div key={index} className="niche-card">
                                    <h4>{niche.name}</h4>
                                    <p>{niche.justification}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleStep2Continue}
                            className="btn btn-primary step-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processando...' : 'Continuar para Etapa 3'}
                        </button>
                    </div>
                )}

                {currentStep === 3 && strategicReport && (
                    <div className="step-content card">
                        <h2 className="step-title">Etapa 3 — Relatório Estratégico 📄</h2>
                        <div className="report-content">
                            <div className="report-section">
                                <h3>Oferta</h3>
                                <p>{strategicReport.oferta}</p>
                            </div>
                            <div className="report-section">
                                <h3>Público-Alvo</h3>
                                <p>{strategicReport.publicoAlvo}</p>
                            </div>
                            <div className="report-section">
                                <h3>Dores</h3>
                                <p>{strategicReport.dores}</p>
                            </div>
                            <div className="report-section">
                                <h3>Transformação</h3>
                                <p>{strategicReport.transformacao}</p>
                            </div>
                            <div className="report-section">
                                <h3>Declaração de Missão</h3>
                                <p>{strategicReport.declaracaoMissao}</p>
                            </div>
                        </div>

                        <div className="validation-final-card">
                            <div className="validation-final-content">
                                <div className="validation-final-header">
                                    <span className="validation-final-icon">📋</span>
                                    <span className="validation-final-title">Diagnóstico Estratégico</span>
                                </div>
                                <p className="validation-final-desc">Esse é o diagnóstico estratégico que preparei com base no que você compartilhou até agora.</p>
                                <div className="validation-final-question">👉 <strong>Faz sentido para você?</strong></div>
                                <div className="validation-final-instructions">
                                    <span className="validation-final-yes">Se sim, salve esse relatório porque ele será fundamental para as próximas etapas.</span><br />
                                    <span className="validation-final-no">Se não, me diga o que gostaria de ajustar (público, dor ou missão). Assim alinhamos à sua verdade.</span>
                                </div>
                                <div className="validation-final-buttons">
                                    <button
                                        onClick={() => handleStep3Validation(true)}
                                        className="btn btn-primary gradient-btn"
                                    >
                                        Sim, faz sentido!
                                    </button>
                                    <button
                                        onClick={() => handleStep3Validation(false)}
                                        className="btn btn-secondary outline-btn adjust-btn"
                                    >
                                        Quero ajustar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="step-content card">
                        <h2 className="step-title">Etapa 4 — Extração Profunda ⛏️</h2>
                        <div className="step-intro">
                            <p>Agora vamos afunilar isso em um produto Low Ticket vendável. Para isso, vou te fazer 8 perguntas práticas. Responda com o máximo de clareza possível.</p>
                        </div>

                        <div className="questions-grid-modern">
                            {STEP4_QUESTIONS.map((q, index) => (
                                <div key={index} className="question-card-modern">
                                    <div className="question-card-header">
                                        <span className="question-number">{index + 1}</span>
                                        <h3 className="question-text">{q.question}</h3>
                                    </div>
                                    <div className="question-card-body">
                                        <div className="question-tip">
                                            <span className="tip-icon">💡</span>
                                            <span className="tip-text">{q.tip}</span>
                                        </div>
                                        <div className="question-example">
                                            <span className="example-icon">✨</span>
                                            <span className="example-text">{q.example}</span>
                                        </div>
                                        <textarea
                                            className="question-textarea"
                                            placeholder="Sua resposta..."
                                            value={step4Answers[index]}
                                            onChange={(e) => {
                                                const newAnswers = [...step4Answers];
                                                newAnswers[index] = e.target.value;
                                                setStep4Answers(newAnswers);
                                            }}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleStep4Submit}
                            className="btn btn-primary step-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Gerando Produtos...' : 'Gerar Meus Produtos'}
                        </button>
                    </div>
                )}

                {currentStep === 5 && finalProducts && (
                    <div className="step-content">
                        <h2 className="step-title-modern">Seus Produtos Low Ticket 🎉</h2>
                        <p className="step-subtitle">Produtos estratégicos personalizados para o seu negócio</p>

                        <div className="products-grid-modern">
                            {finalProducts.products.map((product, index) => (
                                <div key={index} className="product-card-modern">
                                    <div className="product-header-modern">
                                        <div className="product-badge">Produto {index + 1}</div>
                                        <div className="product-price-badge">{product.price}</div>
                                    </div>

                                    <h3 className="product-name-modern">{product.name}</h3>
                                    <p className="product-promise-modern">{product.promise}</p>

                                    <div className="product-meta-modern">
                                        <div className="meta-item">
                                            <span className="meta-icon">📦</span>
                                            <span className="meta-text">{product.format}</span>
                                        </div>
                                    </div>

                                    <div className="product-reasons-modern">
                                        <h4>Por que funciona:</h4>
                                        <ul>
                                            {product.reasons.map((reason, i) => (
                                                <li key={i}>
                                                    <span className="reason-icon">✓</span>
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {product.implementationGuide && (
                                        <details className="implementation-guide-modern">
                                            <summary className="guide-summary">
                                                <span className="guide-icon">📋</span>
                                                {product.implementationGuide.title}
                                            </summary>
                                            <div className="guide-content">
                                                <div className="guide-meta">
                                                    <div className="guide-timeline">
                                                        <span className="timeline-icon">⏱️</span>
                                                        <strong>Tempo:</strong> {product.implementationGuide.timeline}
                                                    </div>
                                                </div>

                                                <div className="guide-steps">
                                                    {product.implementationGuide.steps.map((step, i) => (
                                                        <div key={i} className="guide-step">
                                                            <div className="step-number">{step.step}</div>
                                                            <div className="step-content-guide">
                                                                <h5>{step.title}</h5>
                                                                <p>{step.description}</p>
                                                                {step.actionItems && step.actionItems.length > 0 && (
                                                                    <ul className="action-items">
                                                                        {step.actionItems.map((action, j) => (
                                                                            <li key={j}>{action}</li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {product.implementationGuide.tools && product.implementationGuide.tools.length > 0 && (
                                                    <div className="guide-tools">
                                                        <h5>🛠️ Ferramentas Recomendadas:</h5>
                                                        <div className="tools-list">
                                                            {product.implementationGuide.tools.map((tool, i) => (
                                                                <span key={i} className="tool-tag">{tool}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {product.implementationGuide.tips && product.implementationGuide.tips.length > 0 && (
                                                    <div className="guide-tips">
                                                        <h5>💡 Dicas Importantes:</h5>
                                                        <ul>
                                                            {product.implementationGuide.tips.map((tip, i) => (
                                                                <li key={i}>{tip}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </details>
                                    )}

                                    <div className="ai-help-modern">
                                        <span className="ai-icon">🤖</span>
                                        <div>
                                            <strong>Ajuda da IA:</strong>
                                            <p>Posso te ajudar a criar o conteúdo deste produto. Basta me pedir!</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {finalProducts.orderBumps && finalProducts.orderBumps.length > 0 && (
                            <div className="extras-section-modern">
                                <h3 className="extras-title gradient-title"><span role="img" aria-label="bump">🚀</span> Order Bumps Sugeridos</h3>
                                <div className="extras-grid">
                                    {finalProducts.orderBumps.map((bump, index) => {
                                        const isExpanded = expandedBumps[index] || false;
                                        return (
                                            <div key={index} className="bump-card-modern">
                                                <div className="bump-header">
                                                    <h4>{bump.name}</h4>
                                                    <span className="bump-price">{bump.price}</span>
                                                </div>
                                                <p className="bump-description">{bump.description}</p>
                                                <div className="bump-details">
                                                    <div className="bump-detail">
                                                        <strong>Por que funciona:</strong> {bump.whyItWorks ? bump.whyItWorks : 'Este order bump foi sugerido pela IA por ser complementar ao produto principal, agregando valor e aumentando a chance de conversão.'}
                                                    </div>
                                                </div>
                                                <button className="btn btn-secondary outline-btn expand-btn" onClick={() => setExpandedBumps(prev => ({ ...prev, [index]: !isExpanded }))}>
                                                    {isExpanded ? 'Fechar Como Criar' : 'Como Criar'}
                                                </button>
                                                {isExpanded && (
                                                    <div className="bump-create-details">
                                                        <strong>Como Criar:</strong>
                                                        <p>{bump.comoCriar ? bump.comoCriar : 'Sugestão de criação: descreva passo a passo como implementar este bump, incluindo exemplos, ferramentas e dicas práticas.'}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {finalProducts.upsell && (
                            <div className="extras-section-modern">
                                <h3 className="extras-title gradient-title"><span role="img" aria-label="upsell">💎</span> Upsell Estratégico</h3>
                                <div className="upsell-card-modern">
                                    <div className="upsell-header">
                                        <h4>{finalProducts.upsell.name}</h4>
                                        <span className="upsell-price">{finalProducts.upsell.price}</span>
                                    </div>
                                    <p className="upsell-description">{finalProducts.upsell.description}</p>
                                    <div className="upsell-details">
                                        <div className="upsell-detail">
                                            <strong>Por que funciona:</strong> {finalProducts.upsell.whyItWorks ? finalProducts.upsell.whyItWorks : 'Este upsell foi sugerido pela IA por ser uma oferta estratégica que aprofunda o resultado do cliente, aumentando o ticket médio e a satisfação.'}
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary outline-btn expand-btn" onClick={() => setUpsellExpanded((prev) => !prev)}>
                                        {upsellExpanded ? 'Fechar Como Criar' : 'Como Criar'}
                                    </button>
                                    {upsellExpanded && (
                                        <div className="upsell-create-details">
                                            <strong>Como Criar:</strong>
                                            <p>{finalProducts.upsell.comoCriar ? finalProducts.upsell.comoCriar : 'Sugestão de criação: descreva passo a passo como implementar este upsell, incluindo exemplos, ferramentas e dicas práticas.'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {finalProducts.finalMessage && (
                            <div className="final-message-modern">
                                {finalProducts.finalMessage}
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-primary step-btn"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default NewReport;
