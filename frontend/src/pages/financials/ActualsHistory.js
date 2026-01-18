import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CalendarIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useActualsHistory } from '../../queries/useEntries';
import { useScenario } from '../../utils/ScenarioContext';
import EmptyScenarioPrompt from '../../components/EmptyScenarioPrompt';
import { format, parseISO } from 'date-fns';

export default function ActualsHistory() {
  const { scenarioId } = useScenario();
  const [expandedPeriod, setExpandedPeriod] = useState(0); // Expand current month by default
  const [periodsToShow, setPeriodsToShow] = useState(6);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'categories'

  const {
    data: response,
    isFetching,
    isLoading,
  } = useActualsHistory({
    scenarioId,
    periods: periodsToShow,
  });

  const historyData = response || [];

  if (!scenarioId) {
    return <EmptyScenarioPrompt />;
  }

  // Get current month data
  const currentMonth = historyData[0];
  const hasCurrentData = currentMonth && currentMonth.expense_actual > 0;

  return (
    <div className="space-y-4">
      {/* Quick Stats Header */}
      {currentMonth && (
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-lg p-4 border border-purple-600/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-purple-400">
                {format(parseISO(currentMonth.period_start), 'MMMM yyyy')}
              </h3>
              
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('summary')}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  viewMode === 'summary'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-600/40'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setViewMode('categories')}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  viewMode === 'categories'
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-600/40'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'
                }`}
              >
                Categories
              </button>
            </div>

            
          </div>
                {!hasCurrentData && (
                <span className="block text-center my-1 px-2 py-0.5 text-[10px] rounded-full bg-yellow-600/20 text-yellow-400 border border-yellow-600/30">
                  No data yet
                </span>
              )}
          {/* Current Month Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 uppercase mb-1">Budget</div>
              <div className="text-xl font-bold text-gray-200 font-mono">
                {currentMonth.expense_budget.toFixed(0)}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 uppercase mb-1">Spent</div>
              <div className="text-xl font-bold text-blue-400 font-mono">
                {currentMonth.expense_actual.toFixed(0)}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 uppercase mb-1">Remaining</div>
              <div className={`text-xl font-bold font-mono ${
                (currentMonth.expense_budget - currentMonth.expense_actual) >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {(currentMonth.expense_budget - currentMonth.expense_actual).toFixed(0)}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="text-[10px] text-gray-400 uppercase mb-1">Used</div>
              <div className={`text-xl font-bold font-mono ${
                !hasCurrentData ? 'text-gray-500' :
                (currentMonth.expense_pct * 100) > 100 ? 'text-red-400' : 'text-green-400'
              }`}>
                {(currentMonth.expense_pct * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1.5">
              <span>Budget progress</span>
              <span>
                {currentMonth.categories.filter(c => c.actual_amount > 0).length} of {currentMonth.categories.length} categories
              </span>
            </div>
            <div className="relative w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  (currentMonth.expense_pct * 100) > 100
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : (currentMonth.expense_pct * 100) > 80
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min((currentMonth.expense_pct * 100), 100)}%` }}
              />
              {(currentMonth.expense_pct * 100) > 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-4 h-4 text-white animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Show periods:</span>
          <select
            value={periodsToShow}
            onChange={(e) => setPeriodsToShow(Number(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-purple-500 transition"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </select>
        </div>
        {isFetching && (
          <span className="text-xs text-gray-400 animate-pulse">Updating...</span>
        )}
      </div>

      {/* Report Content */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2 animate-pulse">📊</div>
          <p>Loading history...</p>
        </div>
      ) : historyData.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-semibold mb-1">No historical data available</p>
          <p className="text-xs text-gray-500">Add budget entries to see your history</p>
        </div>
      ) : (
        <div className="space-y-2">
          {historyData.map((period, idx) => {
            const isExpanded = expandedPeriod === idx;
            const expensePercentage = (period.expense_pct * 100);
            const isOverBudget = expensePercentage > 100;
            const hasActuals = period.expense_actual > 0;
            const totalBudget = period.expense_budget;
            const totalActual = period.expense_actual;
            const totalDelta = totalBudget - totalActual;
            const categoriesWithActuals = period.categories.filter(c => c.actual_amount > 0).length;
            const totalCategories = period.categories.length;
            const isComplete = categoriesWithActuals === totalCategories && hasActuals;
            const isCurrent = idx === 0;

            return (
              <div
                key={idx}
                className={`rounded-lg border overflow-hidden transition-all duration-300 ${
                  isCurrent
                    ? 'bg-purple-900/10 border-purple-600/30 shadow-lg'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                } ${isExpanded ? 'ring-2 ring-purple-500/20' : ''}`}
              >
                {/* Period Summary */}
                <button
                  onClick={() => setExpandedPeriod(isExpanded ? null : idx)}
                  className="w-full p-3 sm:p-4 text-left hover:bg-gray-800/30 transition"
                >
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isComplete ? (
                        <CheckCircleIcon className="w-6 h-6 text-green-400" />
                      ) : hasActuals ? (
                        <div className="w-6 h-6 rounded-full border-2 border-blue-400 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600" />
                      )}
                    </div>

                    {/* Period Date */}
                    <div className="flex-shrink-0">
                      <div className={`text-sm font-semibold ${
                        isCurrent ? 'text-purple-400' : 'text-gray-300'
                      }`}>
                        {format(parseISO(period.period_start), 'MMM yyyy')}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {format(parseISO(period.period_start), 'dd')} - {format(parseISO(period.period_end), 'dd')}
                      </div>
                    </div>

                    {/* Compact Metrics */}
                    <div className="flex-1 flex items-center justify-between gap-4 text-xs">
                      {/* Budget Used Bar */}
                      <div className="flex-1 max-w-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-500">Budget</span>
                          <span className={`font-mono font-bold ${
                            !hasActuals ? 'text-gray-500' :
                            isOverBudget ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {expensePercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              isOverBudget
                                ? 'bg-red-500'
                                : expensePercentage > 80
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(expensePercentage, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Amount Summary */}
                      <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-gray-500 text-[10px]">Spent</div>
                          <div className="font-mono text-blue-400 font-semibold">
                            {totalActual.toFixed(0)}
                          </div>
                        </div>
                        <div className="text-gray-600">/</div>
                        <div className="text-right">
                          <div className="text-gray-500 text-[10px]">Budget</div>
                          <div className="font-mono text-gray-300">
                            {totalBudget.toFixed(0)}
                          </div>
                        </div>
                      </div>

                      {/* Category Progress */}
                      <div className="hidden lg:block text-right">
                        <div className="text-gray-500 text-[10px]">Categories</div>
                        <div className="font-mono text-gray-400">
                          {categoriesWithActuals}/{totalCategories}
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
                </button>

                {/* Expanded Categories */}
                {isExpanded && (
                  <div className="border-t border-gray-700/50 bg-gray-900/30 animate-fade-in-up">
                    {viewMode === 'summary' ? (
                      /* Summary View */
                      <div className="p-4 space-y-4">
                        {/* Detailed Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-gray-400 uppercase mb-1">Budget</div>
                            <div className="text-lg font-bold text-gray-300 font-mono">
                              {totalBudget.toFixed(0)}
                            </div>
                          </div>

                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-gray-400 uppercase mb-1">Actual</div>
                            <div className="text-lg font-bold text-blue-400 font-mono">
                              {totalActual.toFixed(0)}
                            </div>
                          </div>

                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-gray-400 uppercase mb-1">Remaining</div>
                            <div className={`text-lg font-bold font-mono ${
                              totalDelta >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {totalDelta >= 0 ? '+' : ''}{totalDelta.toFixed(0)}
                            </div>
                          </div>

                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-[10px] text-gray-400 uppercase mb-1">Progress</div>
                            <div className="text-lg font-bold text-purple-400 font-mono">
                              {categoriesWithActuals}/{totalCategories}
                            </div>
                          </div>
                        </div>

                        {/* Category Summary Cards */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase">Category Breakdown</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {period.categories.map((category, catIdx) => (
                              <CategorySummaryCard key={catIdx} category={category} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Detailed Categories View */
                      <div className="p-3">
                        <div className="space-y-1">
                          {period.categories.map((category, catIdx) => (
                            <CategoryRow key={catIdx} category={category} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CategorySummaryCard({ category }) {
  const hasActual = category.actual_amount > 0;
  const percentage = category.planned_amount > 0 ? (category.actual_amount / category.planned_amount) * 100 : 0;
  const isOverBudget = percentage > 100;
  const isComplete = category.actual_entries_count === category.planned_entries_count && hasActual;

  return (
    <div className={`rounded-lg p-3 border transition-all ${
      isComplete
        ? 'bg-green-600/5 border-green-600/20'
        : hasActual
        ? 'bg-blue-600/5 border-blue-600/20'
        : 'bg-gray-800/30 border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircleIcon className="w-4 h-4 text-green-400" />
          ) : hasActual ? (
            <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full border-2 border-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-200">{category.category}</span>
        </div>
        <span className={`text-xs font-bold font-mono ${
          !hasActual ? 'text-gray-500' :
          isOverBudget ? 'text-red-400' : 'text-green-400'
        }`}>
          {percentage.toFixed(0)}%
        </span>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Spent:</span>
          <span className={`font-mono font-semibold ${hasActual ? 'text-blue-400' : 'text-gray-500'}`}>
            {category.actual_amount.toFixed(0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Budget:</span>
          <span className="font-mono text-gray-400">{category.planned_amount.toFixed(0)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Remaining:</span>
          <span className={`font-mono ${
            category.remaining_amount > 0 ? 'text-green-400' :
            category.remaining_amount < 0 ? 'text-red-400' : 'text-gray-500'
          }`}>
            {category.remaining_amount.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isOverBudget ? 'bg-red-500' :
              percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Entry count */}
      <div className="mt-2 text-[10px] text-gray-500">
        {category.actual_entries_count} of {category.planned_entries_count} entries tracked
      </div>
    </div>
  );
}

function CategoryRow({ category }) {
  const hasActual = category.actual_amount > 0;
  const percentage = category.planned_amount > 0 ? (category.actual_amount / category.planned_amount) * 100 : 0;
  const isOverBudget = percentage > 100;

  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded bg-gray-800/50 hover:bg-gray-800 transition text-xs">
      {/* Category Name & Entry Count */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-200 truncate">{category.category}</div>
        <div className="text-[10px] text-gray-500 truncate">
          {category.actual_entries_count} of {category.planned_entries_count} entries tracked
        </div>
      </div>

      {/* Budget vs Actual */}
      <div className="flex items-center gap-2 text-[10px]">
        <div className="text-right">
          <div className="text-gray-500">Planned</div>
          <div className="font-mono text-gray-300">{category.planned_amount.toFixed(0)}</div>
        </div>
        <div className="text-gray-600">→</div>
        <div className="text-right">
          <div className="text-gray-500">Actual</div>
          <div className={`font-mono font-semibold ${
            !hasActual ? 'text-gray-500' : 'text-blue-400'
          }`}>
            {category.actual_amount.toFixed(0)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-500">Remaining</div>
          <div className={`font-mono ${
            category.remaining_amount > 0 ? 'text-green-400' :
            category.remaining_amount < 0 ? 'text-red-400' : 'text-gray-500'
          }`}>
            {category.remaining_amount.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`px-2 py-1 rounded text-[10px] font-semibold min-w-[60px] text-center ${
        !hasActual ? 'bg-gray-700/50 text-gray-500' :
        isOverBudget ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'
      }`}>
        {!hasActual ? 'No data' :
         isOverBudget ? `+${(percentage - 100).toFixed(0)}%` : `${percentage.toFixed(0)}%`
        }
      </div>
    </div>
  );
}
