
import { BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid, ResponsiveContainer } from 'recharts';


export default function MonhtlyIncome({data,isLoading}){
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
    return (
        <div className="relative h-[300px] w-full overflow-hidden">
  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="period" stroke="#aaa" style={{ fontSize: '11px' }} />
                      <YAxis stroke="#aaa" style={{ fontSize: '11px' }} />
                 
                      <Bar dataKey="net" name="Net Income" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#4ade80' : '#f87171'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

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