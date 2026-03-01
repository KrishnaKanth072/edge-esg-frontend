export interface Agent {
  id: string;
  name: string;
  icon: string;
  status: 'idle' | 'analyzing' | 'complete';
  progress: number;
}

export interface ESGScore {
  overall: number;
  environmental: number;
  social: number;
  governance: number;
}

export interface TradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  confidence: number;
  expectedReturn: number;
}

export interface RiskAssessment {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action: 'APPROVE' | 'REJECT' | 'REVIEW';
  factors: string[];
}

export interface AuditTrail {
  transactionHash: string;
  blockchain: string;
  timestamp: string;
  verified: boolean;
}

export interface AnalysisResult {
  company: string;
  esgScore: ESGScore;
  tradingSignal: TradingSignal;
  riskAssessment: RiskAssessment;
  auditTrail: AuditTrail;
  consensus: number;
}

// WebSocket message types
export interface WSAgentUpdate {
  type: 'agent_update';
  agentId: string;
  status: 'idle' | 'analyzing' | 'complete';
  progress: number;
}

export interface WSConsensusUpdate {
  type: 'consensus_update';
  consensus: number;
}

export interface WSQuantumUpdate {
  type: 'quantum_update';
  progress: number;
}

export interface WSAnalysisComplete {
  type: 'analysis_complete';
  results: AnalysisResult;
}

export type WSMessage = WSAgentUpdate | WSConsensusUpdate | WSQuantumUpdate | WSAnalysisComplete;
