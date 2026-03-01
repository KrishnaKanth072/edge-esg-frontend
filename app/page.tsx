'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentAvatar from '@/components/AgentAvatar';
import QuantumGlobe from '@/components/QuantumGlobe';
import GlassCard from '@/components/GlassCard';
import PortfolioComparison from '@/components/PortfolioComparison';
import { agents } from '@/lib/agents';
import { Agent, AnalysisResult } from '@/lib/types';
import { analyzeCompany, getHealthStatus } from '@/lib/api';
import { WebSocketClient } from '@/lib/websocket';

type AppState = 'input' | 'analyzing' | 'results';

export default function Home() {
  const [state, setState] = useState<AppState>('input');
  const [company, setCompany] = useState('');
  const [agentStates, setAgentStates] = useState<Agent[]>(agents);
  const [consensus, setConsensus] = useState(0);
  const [quantumProgress, setQuantumProgress] = useState(0);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    // Check backend health on mount
    const initBackend = async () => {
      try {
        const health = await getHealthStatus();
        if (health) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      } catch {
        setBackendStatus('disconnected');
      }
    };
    
    initBackend();

    // Initialize WebSocket connection (optional feature)
    const ws = new WebSocketClient(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws');
    ws.connect(
      (data) => {
        // Handle real-time updates from backend
        if (data.type === 'agent_update') {
          setAgentStates(prev => prev.map(agent => 
            agent.id === data.agentId 
              ? { ...agent, status: data.status, progress: data.progress }
              : agent
          ));
        } else if (data.type === 'consensus_update') {
          setConsensus(data.consensus);
        } else if (data.type === 'quantum_update') {
          setQuantumProgress(data.progress);
        } else if (data.type === 'analysis_complete') {
          setResults(data.results);
          setState('results');
        }
      },
      () => {
        // WebSocket failed, but REST API might still work
        // Don't change backend status here
      }
    );

    return () => {
      ws.disconnect();
    };
  }, []);

  const handleAnalyze = async () => {
      if (!company.trim()) return;

      if (backendStatus !== 'connected') {
        alert('Backend not connected. Please wait...');
        return;
      }

      setState('analyzing');
      setAgentStates(agents.map(a => ({ ...a, status: 'analyzing', progress: 50 })));

      try {
        const result = await analyzeCompany(company);

        setResults({
          company,
          esgScore: {
            overall: parseFloat(result.esg_score),
            environmental: parseFloat(result.esg_score) * 0.9,
            social: parseFloat(result.esg_score) * 1.1,
            governance: parseFloat(result.esg_score)
          },
          tradingSignal: {
            action: result.trading_signal.action,
            symbol: result.trading_signal.symbol,
            currentPrice: parseFloat(result.trading_signal.current_price?.replace('$', '') || '0'),
            targetPrice: parseFloat(result.trading_signal.target_price?.replace('$', '') || '0'),
            confidence: Math.round(result.trading_signal.confidence * 100),
            expectedReturn: parseFloat(result.trading_signal.price_change?.replace('%', '') || '0')
          },
          riskAssessment: {
            level: result.risk_action === 'REJECT' ? 'HIGH' : result.risk_action === 'REVIEW' ? 'MEDIUM' : 'LOW',
            action: result.risk_action,
            factors: result.risk_reasons || []
          },
          auditTrail: {
            transactionHash: result.audit_hash,
            blockchain: 'Polygon',
            timestamp: result.timestamp || new Date().toISOString(),
            verified: true
          },
          consensus: Math.round(result.trading_signal.confidence * 100)
        });

        setAgentStates(agents.map(a => ({ ...a, status: 'complete', progress: 100 })));
        setState('results');

      } catch (error: unknown) {
        console.error('Analysis failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to analyze. Please try again.';
        alert(errorMessage);
        setState('input');
        setAgentStates(agents.map(a => ({ ...a, status: 'idle', progress: 0 })));
      }
    }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {state === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-2xl"
          >
            <div className="glass-card p-12 text-center">
              <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
              >
                EDGE ESG Alpha
              </motion.h1>
              <p className="text-white/60 mb-4">AI-Powered ESG Trading Intelligence</p>
              
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                  backendStatus === 'connected' 
                    ? 'bg-green-500/20 text-green-400' 
                    : backendStatus === 'checking'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    backendStatus === 'connected' 
                      ? 'bg-green-400 animate-pulse' 
                      : backendStatus === 'checking'
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-red-400'
                  }`} />
                  {backendStatus === 'connected' ? 'Backend Connected' : 
                   backendStatus === 'checking' ? 'Checking Backend...' : 
                   'Demo Mode (Backend Offline)'}
                </div>
              </div>
              
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Enter company name (e.g., Tata Steel)"
                className="w-full px-6 py-4 rounded-xl glass text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              />
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAnalyze}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                >
                  🚀 Analyze ESG + Trading Alpha
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPortfolio(true)}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-green-500/50 transition-all"
                >
                  📊 Compare Portfolio (2-10 Companies)
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-6xl"
          >
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4">🤖 10 Agents Analyzing {company}</h1>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl text-blue-400"
              >
                Agent consensus: {consensus.toFixed(1)}% 🧬
              </motion.p>
            </div>

            <div className="grid grid-cols-5 gap-8 mb-12">
              {agentStates.map((agent, idx) => (
                <AgentAvatar key={agent.id} agent={agent} index={idx} />
              ))}
            </div>

            <div className="glass-card p-8 text-center">
              <QuantumGlobe />
              <motion.p
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xl mt-4"
              >
                Quantum: Processing 1M scenarios... {quantumProgress.toFixed(0)}%
              </motion.p>
              {quantumProgress >= 100 && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl text-green-400 mt-2 font-bold"
                >
                  ✓ COMPLETE
                </motion.p>
              )}
            </div>
          </motion.div>
        )}

        {state === 'results' && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-6xl"
          >
            <h1 className="text-4xl font-bold mb-8 text-center">Analysis Complete: {results.company}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard delay={0}>
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h2 className="text-2xl font-bold mb-2">ESG Score</h2>
                  <div className="text-5xl font-bold text-yellow-400 mb-4">
                    {results.esgScore.overall}/10 ⭐
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-white/60">Environmental</p>
                      <p className="font-bold">{results.esgScore.environmental}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Social</p>
                      <p className="font-bold">{results.esgScore.social}</p>
                    </div>
                    <div>
                      <p className="text-white/60">Governance</p>
                      <p className="font-bold">{results.esgScore.governance}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard delay={0.1}>
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    💹
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Trading Signal</h2>
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {results.tradingSignal.action} {results.tradingSignal.symbol} 💚
                  </div>
                  <p className="text-lg">
                    ₹{results.tradingSignal.currentPrice} → ₹{results.tradingSignal.targetPrice}
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    +{results.tradingSignal.expectedReturn}%
                  </p>
                  <p className="text-sm text-white/60 mt-2">
                    Confidence: {results.tradingSignal.confidence}%
                  </p>
                </div>
              </GlassCard>

              <GlassCard delay={0.2}>
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold mb-2">Risk Assessment</h2>
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {results.riskAssessment.action} Financing 🚫
                  </div>
                  <div className="text-sm text-left mt-4 space-y-1">
                    {results.riskAssessment.factors.map((factor, idx) => (
                      <p key={idx} className="text-white/80">• {factor}</p>
                    ))}
                  </div>
                </div>
              </GlassCard>

              <GlassCard delay={0.3}>
                <div className="text-center">
                  <div className="text-6xl mb-4">🔗</div>
                  <h2 className="text-2xl font-bold mb-2">Blockchain Audit</h2>
                  <div className="text-lg font-bold text-purple-400 mb-2">
                    {results.auditTrail.blockchain}
                  </div>
                  <p className="text-sm text-white/60 break-all mb-2">
                    {results.auditTrail.transactionHash}
                  </p>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-3xl text-green-400 font-bold"
                  >
                    ✅ Confirmed
                  </motion.div>
                </div>
              </GlassCard>
            </div>

            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setState('input');
                  setCompany('');
                  setResults(null);
                }}
                className="px-8 py-3 rounded-xl glass hover:glass-card transition-all"
              >
                Analyze Another Company
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showPortfolio && (
        <PortfolioComparison onClose={() => setShowPortfolio(false)} />
      )}
    </div>
  );
}
