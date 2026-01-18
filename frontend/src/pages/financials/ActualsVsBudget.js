import { useEffect, useMemo } from "react";
import { useActVsBud } from "../../queries/useEntries";
import { useScenario } from "../../utils/ScenarioContext";


export default function ActVsBudReport({period}) {
  const { scenarioId } = useScenario();


  const { data, isLoading, refetch } = useActVsBud(scenarioId, period);

  useEffect(() => {
    if (scenarioId) refetch();
  }, [period, scenarioId, refetch]);

  // Separate expenses and income
  const expenses = useMemo(() => data?.filter(row => row.type === 'expense') || [], [data]);
  const income = useMemo(() => data?.filter(row => row.type === 'income') || [], [data]);

  // Calculate summary totals for expenses
  const expenseSummary = useMemo(() => {
    if (expenses.length === 0) return { totalBudget: 0, totalActual: 0, totalDelta: 0, overBudgetCount: 0 };

    return expenses.reduce((acc, row) => {
      const pct = row.budget ? (row.actual / row.budget) * 100 : 0;
      return {
        totalBudget: acc.totalBudget + parseFloat(row.budget),
        totalActual: acc.totalActual + parseFloat(row.actual),
        totalDelta: acc.totalDelta + parseFloat(row.delta),
        overBudgetCount: acc.overBudgetCount + (pct > 100 ? 1 : 0)
      };
    }, { totalBudget: 0, totalActual: 0, totalDelta: 0, overBudgetCount: 0 });
  }, [expenses]);

  // Calculate summary totals for income
  const incomeSummary = useMemo(() => {
    if (income.length === 0) return { totalBudget: 0, totalActual: 0, totalDelta: 0 };

    return income.reduce((acc, row) => {
      return {
        totalBudget: acc.totalBudget + parseFloat(row.budget),
        totalActual: acc.totalActual + parseFloat(row.actual),
        totalDelta: acc.totalDelta + parseFloat(row.delta)
      };
    }, { totalBudget: 0, totalActual: 0, totalDelta: 0 });
  }, [income]);

  const expensePct = expenseSummary.totalBudget ? (expenseSummary.totalActual / expenseSummary.totalBudget) * 100 : 0;
  const incomePct = incomeSummary.totalBudget ? (incomeSummary.totalActual / incomeSummary.totalBudget) * 100 : 0;

  if (!scenarioId) return <p className="text-gray-400 p-4">Select a scenario</p>;
  if (isLoading) return <p className="text-gray-400 p-4">Loading...</p>;

  const renderEntryCard = (row) => {
    const pct = row.budget ? (row.actual / row.budget) * 100 : 0;
    const withinBudget = pct <= 100;
    const remaining = parseFloat(row.delta);
    const isIncome = row.type === 'income';

    return (
     <div
  key={row.entry_id}
  className={`relative p-2 sm:p-3 rounded-lg border transition ${
    withinBudget
      ? "bg-gray-900 border-gray-800 hover:border-green-500"
      : "bg-red-900/20 border-red-800 hover:border-red-600"
  }`}
>
  {/* Header */}
  <div className="flex justify-between items-center mb-1">
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isIncome ? "bg-green-400" : "bg-red-400"
        }`}
      />
      <p className="font-semibold text-gray-300 text-[11px] truncate">
        {row.entry_name}
      </p>
    </div>

    <span
      className={`text-[10px] font-bold ml-2 shrink-0 ${
        withinBudget ? "text-green-400" : "text-red-400"
      }`}
    >
      {pct.toFixed(0)}%
    </span>
  </div>

  {/* Progress Bar */}
  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
    <div
      className={`h-full ${
        withinBudget ? "bg-green-400" : "bg-red-500"
      } transition-all`}
      style={{ width: `${Math.min(pct, 100)}%` }}
    />
  </div>

  {/* Budget / Actual */}
  <div className="flex justify-between mt-1 text-[10px] text-gray-400">
    <span>
      B:{" "}
      <span className="text-gray-300 font-mono font-semibold">
        ${row.budget}
      </span>
    </span>
    <span>
      A:{" "}
      <span className="text-gray-300 font-mono font-semibold">
        ${row.actual}
      </span>
    </span>
  </div>

  {/* Remaining */}
  <div className="mt-0.5 text-center text-[10px]">
    <span
      className={`font-semibold ${
        remaining >= 0 ? "text-green-400" : "text-red-400"
      }`}
    >
      {remaining >= 0 ? "✓" : "⚠️"}{" "}
      {remaining >= 0 ? "Under" : "Over"} $
      {Math.abs(remaining).toFixed(2)}
    </span>
  </div>
</div>

    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expenses Summary */}
        {expenses.length > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-red-900/20 to-red-800/10 p-4 border border-red-700/50">
            <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
              <span>💸</span> Expenses
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[10px] text-gray-400">Budget</div>
                <div className="text-lg font-bold text-white">${expenseSummary.totalBudget.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Actual</div>
                <div className="text-lg font-bold text-white">${expenseSummary.totalActual.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Remaining</div>
                <div className={`text-lg font-bold ${expenseSummary.totalDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${expenseSummary.totalDelta.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Usage</div>
                <div className={`text-lg font-bold ${expensePct <= 100 ? 'text-green-400' : 'text-red-400'}`}>
                  {expensePct.toFixed(0)}%
                </div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${expensePct <= 100 ? "bg-green-400" : "bg-red-500"} transition-all`}
                style={{ width: `${Math.min(expensePct, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Income Summary */}
        {income.length > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-green-900/20 to-green-800/10 p-4 border border-green-700/50">
            <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
              <span>💰</span> Income
            </h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[10px] text-gray-400">Budget</div>
                <div className="text-lg font-bold text-white">${incomeSummary.totalBudget.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Actual</div>
                <div className="text-lg font-bold text-white">${incomeSummary.totalActual.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Difference</div>
                <div className={`text-lg font-bold ${incomeSummary.totalDelta >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${incomeSummary.totalDelta.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400">Achievement</div>
                <div className={`text-lg font-bold ${incomePct >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {incomePct.toFixed(0)}%
                </div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${incomePct >= 100 ? "bg-green-400" : "bg-yellow-400"} transition-all`}
                style={{ width: `${Math.min(incomePct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expenses Section */}
      {expenses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
            <span>💸</span> Expense Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {expenses.map(renderEntryCard)}
          </div>
        </div>
      )}

      {/* Income Section */}
      {income.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
            <span>💰</span> Income Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {income.map(renderEntryCard)}
          </div>
        </div>
      )}

      {/* No Data State */}
      {(!data || data.length === 0) && (
        <p className="text-center text-gray-400 text-sm p-8">
          No budget entries for this period
        </p>
      )}
    </div>
  );
}
