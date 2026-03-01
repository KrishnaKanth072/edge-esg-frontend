'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface InvestmentCalculatorProps {
  currentPrice: number;
  symbol: string;
  projections: Array<{
    period: string;
    months: number;
    current_price: number;
    future_price: number;
    return_amount: number;
    return_pct: number;
  }>;
  historicalReturns?: Array<{
    period: string;
    start_date: string;
    end_date: string;
    start_price: number;
    end_price: number;
    return_pct: number;
  }>;
}

export default function InvestmentCalculator({ 
  currentPrice, 
  symbol, 
  projections,
  historicalReturns 
}: InvestmentCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [numShares, setNumShares] = useState(Math.floor(10000 / currentPrice));

  const handleAmountChange = (amount: number) => {
    setInvestmentAmount(amount);
    setNumShares(Math.floor(amount / currentPrice));
  };

  const handleSharesChange = (shares: number) => {
    setNumShares(shares);
    setInvestmentAmount(shares * currentPrice);
  };

  return (
    <div className="space-y-6">
      {/* Investment Input */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">💰 Investment Calculator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Investment Amount (₹)
            </label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-gray-800 font-bold text-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Number of Shares
            </label>
            <input
              type="number"
              value={numShares}
              onChange={(e) => handleSharesChange(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl text-gray-800 font-bold text-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">Current Price per Share:</span>
            <span className="text-2xl font-bold text-blue-600">₹{currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-600 font-semibold">Total Investment:</span>
            <span className="text-2xl font-bold text-green-600">₹{investmentAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Historical Returns */}
      {historicalReturns && historicalReturns.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">📈 Historical Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historicalReturns.map((period, index) => {
              const investmentValue = investmentAmount * (1 + period.return_pct / 100);
              const profit = investmentValue - investmentAmount;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-xl p-5 border-2 ${
                    period.return_pct >= 0 ? 'border-green-300' : 'border-red-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-lg font-bold text-gray-800">{period.period} Ago</div>
                      <div className="text-xs text-gray-500">{period.start_date}</div>
                    </div>
                    <div className={`text-2xl font-bold ${
                      period.return_pct >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {period.return_pct >= 0 ? '+' : ''}{period.return_pct.toFixed(1)}%
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invested:</span>
                      <span className="font-bold text-gray-800">₹{investmentAmount.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Value:</span>
                      <span className="font-bold text-gray-800">₹{investmentValue.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-gray-200 pt-2">
                      <span className="font-semibold text-gray-700">Profit/Loss:</span>
                      <span className={`font-bold text-lg ${
                        profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {profit >= 0 ? '+' : ''}₹{profit.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Future Projections */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">🔮 Future Projections</h3>
        <p className="text-sm text-gray-600 mb-4">Based on expected returns and compound growth</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projections.map((projection, index) => {
            const futureValue = numShares * projection.future_price;
            const profit = futureValue - investmentAmount;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-5 border-2 border-purple-300 hover:shadow-lg transition-all"
              >
                <div className="text-center mb-3">
                  <div className="text-xl font-bold text-purple-600">{projection.period}</div>
                  <div className="text-3xl font-bold text-gray-800 my-2">
                    {projection.return_pct >= 0 ? '+' : ''}{projection.return_pct.toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today's Investment:</span>
                    <span className="font-bold text-gray-800">₹{investmentAmount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Future Value:</span>
                    <span className="font-bold text-gray-800">₹{futureValue.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Share:</span>
                    <span className="font-bold text-gray-800">₹{projection.future_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-purple-200 pt-2">
                    <span className="font-semibold text-gray-700">Expected Profit:</span>
                    <span className={`font-bold text-lg ${
                      profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {profit >= 0 ? '+' : ''}₹{profit.toFixed(0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
        <p className="text-sm text-yellow-800 font-medium">
          ⚠️ <strong>Disclaimer:</strong> These projections are based on algorithmic predictions and historical data. 
          Actual returns may vary significantly. Past performance does not guarantee future results. 
          Please consult a financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  );
}
