import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './ReportView.css';

// Interactive Strategic Card Component
function StrategicCard({ icon, title, content }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`strategic-card-interactive ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="strategic-card-header-interactive">
                <span className="strategic-icon">{icon}</span>
                <h4 className="strategic-title">{title}</h4>
                <span className="expand-indicator">{isExpanded ? '−' : '+'}</span>
            </div>
            {isExpanded && (
                <div className="strategic-card-content">
                    <p>{content}</p>
                </div>
            )}
        </div>
    );
}


function ReportView({ user, onLogout }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [expandedBumps, setExpandedBumps] = useState({});
    const [upsellExpanded, setUpsellExpanded] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) return;

            try {
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setReport(data);
            } catch (error) {
                console.error('Error fetching report:', error);
            }
        };

        fetchReport();
    }, [id]);

    if (!report) {
        return (
            <div className="report-view-container">
                <nav className="navbar">
                    <div className="container">
                        <div className="navbar-content">
                            <h1 className="navbar-title">Mentora SOW</h1>
                            <div className="navbar-actions">
                                <button onClick={() => navigate('/saved-reports')} className="btn btn-secondary">Voltar</button>
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="report-view-main container">
                    <div className="card">
                        <p>Relatório não encontrado.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="report-view-container">
            <nav className="navbar business-navbar">
                <div className="container">
                    <div className="navbar-content">
                        <div className="navbar-left">
                            <h1 className="navbar-title gradient-title">Mentora SOW</h1>
                        </div>
                        <div className="navbar-actions">
                            <button onClick={() => navigate('/saved-reports')} className="btn btn-secondary outline-btn business-logout">Voltar</button>
                            <button onClick={onLogout} className="btn btn-secondary outline-btn business-logout">Sair</button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="report-view-main container">
                <div className="report-header-section">
                    <h2 className="report-main-title">{report.title}</h2>
                    <p className="report-date">Criado em: {new Date(report.created_at).toLocaleDateString('pt-BR')}</p>
                </div>

                {report.content.strategicReport && (
                    <div className="strategic-section-modern">
                        <h3 className="section-title-strategic">📋 Relatório Estratégico</h3>
                        <div className="strategic-cards-grid">
                            <StrategicCard
                                icon="🎯"
                                title="Oferta"
                                content={report.content.strategicReport.oferta}
                            />
                            <StrategicCard
                                icon="👥"
                                title="Público-Alvo"
                                content={report.content.strategicReport.publicoAlvo}
                            />
                            <StrategicCard
                                icon="💔"
                                title="Dores"
                                content={report.content.strategicReport.dores}
                            />
                            <StrategicCard
                                icon="✨"
                                title="Transformação"
                                content={report.content.strategicReport.transformacao}
                            />
                            <StrategicCard
                                icon="🚀"
                                title="Declaração de Missão"
                                content={report.content.strategicReport.declaracaoMissao}
                            />
                        </div>
                    </div>
                )}

                {report.content.products && report.content.products.length > 0 && (
                    <div className="products-section-modern">
                        <h2 className="section-title-modern">✨ Seus Produtos Low Ticket</h2>

                        <div className="products-grid-modern">
                            {report.content.products.map((product, index) => (
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

                                    {product.aiHelp && (
                                        <div className="ai-help-modern">
                                            <span className="ai-icon">🤖</span>
                                            <div>
                                                <strong>Como a IA pode ajudar:</strong>
                                                <p>{product.aiHelp}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {((report.content.orderBumps && report.content.orderBumps.length > 0) || report.content.upsell) && (
                    <div className="extras-section-modern">
                        <h3 className="extras-title gradient-title"><span role="img" aria-label="bump">🚀</span> Order Bumps Sugeridos</h3>
                        <div className="extras-grid">
                            {report.content.orderBumps && report.content.orderBumps.length > 0 && (
                                <div className="extras-column">
                                    {report.content.orderBumps.map((bump, index) => {
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
                                                        <strong>Por que funciona:</strong> {bump.whyItWorks ? bump.whyItWorks : (bump.why || 'Este order bump foi sugerido pela IA por ser complementar ao produto principal.')}
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
                            )}
                        </div>

                        {report.content.upsell && (
                            <div className="extras-section-modern" style={{ marginTop: '2rem' }}>
                                <h3 className="extras-title gradient-title"><span role="img" aria-label="upsell">💎</span> Upsell Estratégico</h3>
                                <div className="upsell-card-modern">
                                    <div className="upsell-header">
                                        <h4>{report.content.upsell.name}</h4>
                                        <span className="upsell-price">{report.content.upsell.price}</span>
                                    </div>
                                    <p className="upsell-description">{report.content.upsell.description}</p>
                                    <div className="upsell-details">
                                        <div className="upsell-detail">
                                            <strong>Por que funciona:</strong> {report.content.upsell.whyItWorks ? report.content.upsell.whyItWorks : (report.content.upsell.why || 'Este upsell aumenta o ticket médio e a satisfação.')}
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary outline-btn expand-btn" onClick={() => setUpsellExpanded((prev) => !prev)}>
                                        {upsellExpanded ? 'Fechar Como Criar' : 'Como Criar'}
                                    </button>
                                    {upsellExpanded && (
                                        <div className="upsell-create-details">
                                            <strong>Como Criar:</strong>
                                            <p>{report.content.upsell.comoCriar ? report.content.upsell.comoCriar : 'Sugestão de criação: descreva passo a passo como implementar este upsell.'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {report.content.finalMessage && (
                    <div className="final-message-modern">
                        <p>{report.content.finalMessage}</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ReportView;
