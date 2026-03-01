'use client';

import { useState } from 'react';
import { analyzePortfolio } from '@/lib/api';

export default function PortfolioPage() {
  const [companies, setCompanies] = useState<string[]>(['', '']);
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
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
  } | null>(null);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Portfolio Comparison</h1>
        <p className="text-gray-600 mb-8">Compare multiple companies and get optimal portfolio allocation</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Companies to Compare (2-10)
            </label>
            {companies.map((company, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => updateCompany(index, e.target.value)}
                  placeholder={`Company ${index + 1} (e.g., Tesla, Apple, Microsoft)`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {companies.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeCompany(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {companies.length < 10 && (
              <button
                type="button"
                onClick={addCompany}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                + Add Company
              </button>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Tolerance: {(riskTolerance * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={riskTolerance}
              onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative (More ESG weight)</span>
              <span>Aggressive (More returns weight)</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Analyzing Portfolio...' : 'Compare Portfolio'}
          </button>
        </form>

        {result && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Best ESG</div>
                <div className="text-xl font-bold text-green-600">{result.best_esg_company}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Lowest Risk</div>
                <div className="text-xl font-bold text-blue-600">{result.lowest_risk_company}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Portfolio ESG</div>
                <div className="text-xl font-bold text-green-600">{result.portfolio_esg_score?.toFixed(1)}/10</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Expected Return</div>
                <div className="text-xl font-bold text-purple-600">{result.expected_return?.toFixed(1)}%</div>
              </div>
            </div>

            {/* Company Comparison Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Company Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ESG Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trading Signal</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {result.companies?.map((company, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 font-medium">{company.company_name}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <span className="font-semibold">{company.esg_score.toFixed(1)}</span>
                              <span className="text-gray-500 text-sm ml-1">/10</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              E:{company.environmental.toFixed(1)} S:{company.social.toFixed(1)} G:{company.governance.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              company.risk_level === 'LOW' ? 'bg-green-100 text-green-800' :
                              company.risk_level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              company.risk_level === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {company.risk_level}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                company.trading_signal.action === 'BUY' ? 'bg-green-100 text-green-800' :
                                company.trading_signal.action === 'SELL' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {company.trading_signal.action}
                              </span>
                              <span className="text-sm">{company.trading_signal.price_change}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${(result.optimal_allocation[index] * 100).toFixed(0)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">{(result.optimal_allocation[index] * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Processing Time */}
            <div className="text-center text-sm text-gray-500">
              Analysis completed in {result.processing_time_ms}ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
