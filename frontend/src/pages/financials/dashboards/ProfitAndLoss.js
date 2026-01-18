
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';


export default function ProfitAndLoss({data,isLoading}){

 const formatChartData = () => {


    return data.map((period) => {
   

      return {
        date: period.period_start,
        income:period.income,
        expense:period.expense,
        opening_balance: period.opening_balance,
        net_balance: period.closing_balance,
        profit_loss: period.profit_loss,
      };
    });
  };

    return (
        <div className="relative h-[300px] w-full overflow-hidden">
  <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formatChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
              <Line type="monotone" dataKey="profit_loss" stroke="#facc15" strokeWidth={2} />
            </LineChart>
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