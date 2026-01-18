
export default function PeriodSummary({data,isLoading}){

 // Prepare chart data
  const chartData = data.map((p) => {
    
    return {
      period: p.period_start,
      income:p.income,
      expenses: p.expense,
      net: p.profit_loss,
      balance: p.closing_balance,
      profitLoss: p.profit_loss,
    };
  });

  // Calculate summary statistics
  const summary = data.length > 0 ? {
    totalIncome: chartData.reduce((sum, d) => sum + d.income, 0),
    totalExpenses: chartData.reduce((sum, d) => sum + d.expenses, 0),
    avgMonthlyIncome: chartData.reduce((sum, d) => sum + d.income, 0) / chartData.length,
    avgMonthlyExpenses: chartData.reduce((sum, d) => sum + d.expenses, 0) / chartData.length,
    finalBalance: data[data.length - 1]?.closing_balance || 0,
    totalProfitLoss: chartData.reduce((sum, d) => sum + d.profitLoss, 0),
  } : null;



    return (
        <div className="relative  w-full overflow-hidden">
   {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-green-600/10 rounded-lg p-3 border border-green-600/20">
                <div className="text-[10px] text-gray-400 uppercase mb-1">Total Income</div>
                <div className="text-lg font-bold text-green-400 font-mono">
                  {summary.totalIncome.toFixed(0)}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Avg: {summary.avgMonthlyIncome.toFixed(0)}/mo
                </div>
              </div>

              <div className="bg-red-600/10 rounded-lg p-3 border border-red-600/20">
                <div className="text-[10px] text-gray-400 uppercase mb-1">Total Expenses</div>
                <div className="text-lg font-bold text-red-400 font-mono">
                  {summary.totalExpenses.toFixed(0)}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Avg: {summary.avgMonthlyExpenses.toFixed(0)}/mo
                </div>
              </div>

              <div className={`rounded-lg p-3 border ${
                summary.totalProfitLoss >= 0
                  ? 'bg-blue-600/10 border-blue-600/20'
                  : 'bg-orange-600/10 border-orange-600/20'
              }`}>
                <div className="text-[10px] text-gray-400 uppercase mb-1">Net P/L</div>
                <div className={`text-lg font-bold font-mono ${
                  summary.totalProfitLoss >= 0 ? 'text-blue-400' : 'text-orange-400'
                }`}>
                  {summary.totalProfitLoss >= 0 ? '+' : ''}{summary.totalProfitLoss.toFixed(0)}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {((summary.totalIncome - summary.totalExpenses) / chartData.length).toFixed(0)}/mo
                </div>
              </div>

              <div className="bg-purple-600/10 rounded-lg p-3 border border-purple-600/20">
                <div className="text-[10px] text-gray-400 uppercase mb-1">Final Balance</div>
                <div className="text-lg font-bold text-purple-400 font-mono">
                  {summary.finalBalance.toFixed(0)}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  After {chartData.length} months
                </div>
              </div>
            </div>
          )}

  {/* Loading Overlay */}
  {isLoading && (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-600 border-t-indigo-500" />
      <span className="text-xs text-gray-300 tracking-wide">
        Updating forecast…
      </span>
    </div>
  )}
</div>
    )
}