
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,  Legend } from 'recharts';

export default function BalanceVsPl({data,isLoading}){

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





    return (
        <div className="relative h-[300px] w-full overflow-hidden">
           <ResponsiveContainer width="100%" height={300}>
                             <LineChart data={chartData}>
                               <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                               <XAxis dataKey="period" stroke="#aaa" style={{ fontSize: '11px' }} />
                               <YAxis stroke="#aaa" style={{ fontSize: '11px' }} />
                             
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
  {/* Loading Overlay */}
  {isLoading && (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-600 border-t-indigo-500" />
      <span className="text-xs text-gray-300 tracking-wide">
        Updating…
      </span>
    </div>
  )}
</div>
    )
}