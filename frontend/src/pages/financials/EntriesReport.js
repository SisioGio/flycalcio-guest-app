import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useForecast } from '../../queries/useEntries';
import { useScenario } from '../../utils/ScenarioContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, Legend } from 'recharts';

export default function EntriesReport({timeFrame,forecastLength}) {
  const { scenarioId } = useScenario();
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [viewMode, setViewMode] = useState('chart');

  const {
    data: report = [],
    isFetching,
  } = useForecast({
    scenarioId,
    timeFrame,
    forecastLength
  });

  // Prepare chart data
  const chartData = report.map((p) => {
    
    return {
      period: p.period_start,
      income:p.income,
      expenses: p.expense,
      net: p.profit_loss,
      balance: p.closing_balance,
      profitLoss: p.profit_loss,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-400 mb-2">{payload[0].payload.period}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3 text-xs">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-mono font-semibold" style={{ color: entry.color }}>
                {entry.value.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${
              viewMode === 'chart'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            📊 Charts
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs rounded-lg transition ${
              viewMode === 'table'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
            }`}
          >
            📋 Details
          </button>
        </div>
        {isFetching && (
          <span className="text-xs text-gray-400 animate-pulse">Updating...</span>
        )}
      </div>

      {/* Report Content */}
      {isFetching ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2 animate-pulse">📊</div>
          <p>Loading forecast...</p>
        </div>
      ) : report.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-semibold mb-1">No forecast data available</p>
          <p className="text-xs text-gray-500">Add entries to see your financial forecast</p>
        </div>
      ) : (
        <>
       

          {/* Chart View */}
          {viewMode === 'chart' ? (
            <div className="space-y-4">
              {/* Income vs Expenses Chart */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="period" stroke="#aaa" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#aaa" style={{ fontSize: '11px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="circle"
                    />
                    <Bar dataKey="income" name="Income" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Balance & P/L Trend Chart */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Balance & Profit/Loss Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="period" stroke="#aaa" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#aaa" style={{ fontSize: '11px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '12px' }}
                      iconType="line"
                    />
                    <Line
                      type="monotone"
                      dataKey="balance"
                      name="Balance"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      dot={{ fill: '#a78bfa', r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="net"
                      name="Net Income"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      dot={{ fill: '#60a5fa', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Net Income by Period */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Monthly Net Income</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="period" stroke="#aaa" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#aaa" style={{ fontSize: '11px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="net" name="Net Income" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#4ade80' : '#f87171'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Table View */
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {report.map((p, idx) => {
                // const totals = calculateTotals(p.entries);

                const isExpanded = expandedPeriod === idx;
                const isPositive = p.profit_loss >= 0;

                return (
                  <div
                    key={idx}
                    className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition"
                  >
                    {/* Period Summary */}
                    <button
                      onClick={() => setExpandedPeriod(isExpanded ? null : idx)}
                      className="w-full p-3 sm:p-4 text-left hover:bg-gray-800/70 transition"
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Period Date */}
                        <div className="flex-shrink-0">
                          <div className="text-xs sm:text-sm font-semibold text-blue-400">
                            {p.period_start}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500">
                            → {p.period_end}
                          </div>
                        </div>

                        {/* Balance Info */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {/* Opening Balance */}
                          <div className="hidden sm:block">
                            <div className="text-gray-500 text-[10px] uppercase">Open</div>
                            <div className="font-mono text-gray-300">{p.opening_balance.toFixed(0)}</div>
                          </div>

                          {/* Profit/Loss */}
                          <div>
                            <div className="text-gray-500 text-[10px] uppercase">P/L</div>
                            <div className={`font-mono font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                              {isPositive ? '+' : ''}{p.profit_loss.toFixed(0)}
                            </div>
                          </div>

                          {/* Closing Balance */}
                          <div>
                            <div className="text-gray-500 text-[10px] uppercase">Close</div>
                            <div className="font-mono font-bold text-white">{p.closing_balance.toFixed(0)}</div>
                          </div>

                          {/* Net Income/Expense */}
                          <div className="hidden sm:block">
                            <div className="text-gray-500 text-[10px] uppercase">Net</div>
                            <div className={`font-mono ${p.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {p.profit_loss >= 0 ? '+' : ''}{p.profit_loss.toFixed(0)}
                            </div>
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Income/Expense Summary Bar */}
                      <div className="mt-3 flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="text-gray-500">💰</span>
                          <span className="text-green-400 font-mono">{p.income.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="text-gray-500">💸</span>
                          <span className="text-red-400 font-mono">{p.expense.toFixed(0)}</span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Entries */}
                    {isExpanded && p.entries.length > 0 && (
                      <div className="border-t border-gray-700 bg-gray-900/30">
                        <div className="p-3 space-y-1">
                          {p.entries.map((e) => (
                            <div
                              key={e.entry_id}
                              className="flex items-center justify-between gap-2 p-2 rounded bg-gray-800/50 hover:bg-gray-800 transition text-xs"
                            >
                              {/* Entry Name & Category */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-200 truncate">{e.entry_name}</div>
                                <div className="text-[10px] text-gray-500 truncate">
                                  {e.category_name} • {e.entry_frequency}
                                </div>
                              </div>

                              {/* Type Badge */}
                              <div className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                e.entry_type === 'income'
                                  ? 'bg-green-600/20 text-green-400'
                                  : 'bg-red-600/20 text-red-400'
                              }`}>
                                {e.entry_type === 'income' ? '↑' : '↓'}
                              </div>

                              {/* Amount */}
                              <div className={`font-mono font-semibold text-right ${
                                e.entry_type === 'income' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {e.entry_type === 'income' ? '+' : '-'}{e.entry_amount.toFixed(0)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
