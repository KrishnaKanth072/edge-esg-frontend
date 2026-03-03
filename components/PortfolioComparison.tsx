'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { analyzePortfolio } from '@/lib/api';

interface PortfolioComparisonProps {
  onClose: () => void;
}

interface PortfolioResult {
  companies?: Array<{
    company_name: string;
    esg_score: number;
    environmental: number;
    social: number;
    governance: number;
    risk_level: string;
    trading_signal: {
      action: string;
      price_change: string;
    };
  }>;
  best_esg_company?: string;
  lowest_risk_company?: string;
  portfolio_esg_score?: number;
  expected_return?: number;
  optimal_allocation?: number[];
  processing_time_ms?: number;
}

export default function PortfolioComparison({ onClose }: PortfolioComparisonProps) {
  const [companies, setCompanies] = useState<string[]>(['', '', '']);
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [error, setError] = useState('');

  const addCompany = () => {
    if (companies.length < 10) {
      setCompanies([...companies, '']);
    }
  };

  const removeCompany = (index: number) => {
    if (companies.length > 2) {
      setCompanies(companies.filter((_, i) => i !== index));
    }
  };

  const updateCompany = (index: number, value: string) => {
    const newCompanies = [...companies];
    newCompanies[index] = value;
    setCompanies(newCompanies);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const validCompanies = companies.filter(c => c.trim() !== '');
    if (validCompanies.length < 2) {
      setError('Please enter at least 2 companies');
      return;
    }

    setLoading(true);
    try {
      const data = await analyzePortfolio(validCompanies, riskTolerance);
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze portfolio';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Portfolio Comparison</h2>
              <p className="text-green-100 mt-1">Compare multiple companies and optimize your portfolio</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Companies to Compare (2-10)
                </label>
                <div className="space-y-3">
                  {companies.map((company, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => updateCompany(index, e.target.value)}
                        placeholder={`Company ${index + 1} (e.g., Tesla, Apple, Microsoft)`}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                      />
                      {companies.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeCompany(index)}
                          className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {companies.length < 10 && (
                  <button
                    type="button"
                    onClick={addCompany}
                    className="mt-3 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-semibold"
                  >
                    + Add Company
                  </button>
                )}
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Risk Tolerance: <span className="text-green-600">{(riskTolerance * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Conservative (More ESG)</span>
                  <span>Aggressive (More Returns)</span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? 'Analyzing Portfolio...' : 'Compare Portfolio'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-md p-5 border-2 border-green-200">
                  <div className="text-sm font-semibold text-green-700 mb-1">Best ESG Company</div>
                  <div className="text-2xl font-bold text-green-800">{result.best_esg_company}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md p-5 border-2 border-blue-200">
                  <div className="text-sm font-semibold text-blue-700 mb-1">Lowest Risk</div>
                  <div className="text-2xl font-bold text-blue-800">{result.lowest_risk_company}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-5 border-2 border-purple-200">
                  <div className="text-sm font-semibold text-purple-700 mb-1">Portfolio ESG</div>
                  <div className="text-2xl font-bold text-purple-800">{result.portfolio_esg_score?.toFixed(1)}/10</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md p-5 border-2 border-orange-200">
                  <div className="text-sm font-semibold text-orange-700 mb-1">Expected Return</div>
                  <div className="text-2xl font-bold text-orange-800">{result.expected_return?.toFixed(1)}%</div>
                </div>
              </div>

              {/* Company Comparison */}
              <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 border-b-2 border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-800">Company Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Company</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">ESG Score</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Risk</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Signal</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Allocation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100">
                      {result.companies?.map((company, index: number) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5 font-bold text-gray-800 text-lg">{company.company_name}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-green-600">{company.esg_score.toFixed(1)}</span>
                              <span className="text-gray-500 font-medium">/10</span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1 font-medium">
                              E:{company.environmental.toFixed(1)} S:{company.social.toFixed(1)} G:{company.governance.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                              company.risk_level === 'LOW' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                              company.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                              company.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' :
                              'bg-red-100 text-red-800 border-2 border-red-300'
                            }`}>
                              {company.risk_level}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
                                company.trading_signal.action === 'BUY' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                                company.trading_signal.action === 'SELL' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                                'bg-gray-100 text-gray-800 border-2 border-gray-300'
                              }`}>
                                {company.trading_signal.action}
                              </span>
                              <span className="text-base font-bold text-gray-700">{company.trading_signal.price_change}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 rounded-full h-4 border-2 border-gray-300">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all"
                                  style={{ width: `${((result.optimal_allocation?.[index] ?? 0) * 100).toFixed(0)}%` }}
                                ></div>
                              </div>
                              <span className="text-lg font-bold text-gray-800 min-w-[60px]">
                                {((result.optimal_allocation?.[index] ?? 0) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
                >
                  Compare Different Companies
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all"
                >
                  Close
                </button>
              </div>

              <div className="text-center text-sm text-gray-500 font-medium">
                Analysis completed in {result.processing_time_ms}ms
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
