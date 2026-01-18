import React, { useState, useEffect, useRef } from 'react';
import { useForecast, useActVsBud, useEntries } from '../../queries/useEntries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient';
import { useScenario } from '../../utils/ScenarioContext';
import ActualsHistory from './ActualsHistory';
import EmptyScenarioPrompt from '../../components/EmptyScenarioPrompt';
import { format } from 'date-fns';
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeSlashIcon, Bars3Icon } from '@heroicons/react/24/outline';
import CashFlow from './dashboards/CashFlow';
import ProfitAndLoss from './dashboards/ProfitAndLoss';
import PeriodSummary from './dashboards/PeriodSummary';
import IncomeVsExpense from './dashboards/IncomeVsExpense';
import BalanceVsPl from './dashboards/BalanceVsPL';
import MonhtlyIncome from './dashboards/MonthlyIncome';

const DASHBOARD_WIDGETS_KEY = 'finance-dashboard-widgets';

const DEFAULT_WIDGETS = {
  cashFlow: { visible: true, expanded: true, order: 0 },
  profitLoss: { visible: true, expanded: true, order: 1 },
  incomeVsExpense: { visible: true, expanded: true, order: 2 },
  balanceVsPl: { visible: true, expanded: true, order: 3 },
  monthlyIncome: { visible: true, expanded: true, order: 4 },
  quickEntry: { visible: true, expanded: true, order: 5 },
  recentActuals: { visible: true, expanded: false, order: 6 },
  currentMonthSummary: { visible: true, expanded: false, order: 7 },
  actualsHistory: { visible: true, expanded: false, order: 8 },
};

export default function DashboardPage() {
  const { scenarioId } = useScenario();
  const currentPeriod = format(new Date(), 'yyyy-MM');
  const queryClient = useQueryClient();
  const amountInputRef = useRef(null);
  const [forecastLength,setForecastLength]  =useState(6)

  const [timeFrame,setTimeFrame] = useState("monthly")

  // Slider limits per time frame
  const maxLengthMap = {
    daily: 90,       // up to 30 days
    weekly: 52,      // up to 52 weeks
    monthly: 24,     // up to 60 months
    yearly: 2,      // up to 10 years
  }

  const maxLength = maxLengthMap[timeFrame] || 12


  // Load widget preferences from localStorage
  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem(DASHBOARD_WIDGETS_KEY);
    if (saved) {
      const savedWidgets = JSON.parse(saved);
      // Merge saved widgets with defaults to handle new widgets
      const mergedWidgets = { ...DEFAULT_WIDGETS };
      Object.keys(DEFAULT_WIDGETS).forEach(key => {
        if (savedWidgets[key]) {
          mergedWidgets[key] = savedWidgets[key];
        }
      });
      return mergedWidgets;
    }
    return DEFAULT_WIDGETS;
  });

  const { data: forecastData = [], isLoading } = useForecast({
    scenarioId,
    timeFrame: timeFrame,
    forecastLength: forecastLength
  });

  const { data: actualVsBudget = [] } = useActVsBud(scenarioId, currentPeriod);

  // Fetch current balance
  const { data: balanceData } = useQuery({
    queryKey: ['balance'],
    queryFn: async () => {
      const res = await apiClient.get('/private/balance');
      return res.data.data;
    },
  });

  // Fetch current month actuals
  const { data: currentMonthActuals = [] } = useQuery({
    queryKey: ['actuals', currentPeriod],
    queryFn: async () => {
      const res = await apiClient.get(`/actuals?period=${currentPeriod}`);
      return res.data.data;
    },
  });

  // Fetch entries for actuals
  const { data: entries = [] } = useEntries(scenarioId);

  // Fetch recent actuals (last 20)
  const { data: recentActuals = [] } = useQuery({
    queryKey: ['actuals', 'recent'],
    queryFn: async () => {
      const res = await apiClient.get(`/actuals`);
      return res.data.data.slice(0, 20);
    },
  });

  // Actuals form state
  const [form, setForm] = useState({
    entry_id: '',
    amount: '',
    actual_date: format(new Date(), "yyyy-MM-dd"),
    comment: '',
    type: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [lastEntry, setLastEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Mutations for actuals
  const createActual = useMutation({
    mutationFn: (payload) => apiClient.post('/actuals', payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['actuals']);
      queryClient.invalidateQueries(['balance']);
      setLastEntry(variables);
      resetForm();
      setTimeout(() => amountInputRef.current?.focus(), 100);
    },
  });

  const updateActual = useMutation({
    mutationFn: (payload) => apiClient.put('/actuals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['actuals']);
      queryClient.invalidateQueries(['balance']);
      resetForm();
    },
  });

  const deleteActual = useMutation({
    mutationFn: (id) => apiClient.delete('/actuals', { data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['actuals']);
      queryClient.invalidateQueries(['balance']);
    },
  });

  // Helper functions for actuals
  const selectedEntry = entries.find(e => e.entry_id === form.entry_id);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditingId(null);
    setForm({
      entry_id: '',
      amount: '',
      actual_date: format(new Date(), "yyyy-MM-dd"),
      comment: '',
      type: ''
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form.entry_id || !form.amount || !form.actual_date || !form.type) return;

    editingId
      ? updateActual.mutate({ id: editingId, ...form })
      : createActual.mutate(form);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setForm({
      entry_id: a.entry_id,
      amount: a.amount,
      actual_date: a.actual_date,
      comment: a.comment || '',
      type: a.type
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const duplicateLastEntry = () => {
    if (lastEntry) {
      setForm({
        ...lastEntry,
        actual_date: format(new Date(), "yyyy-MM-dd")
      });
      amountInputRef.current?.focus();
    }
  };

  // Auto-select entry type based on selected entry
  useEffect(() => {
    if (form.entry_id && selectedEntry && !editingId) {
      setForm(prev => ({
        ...prev,
        type: selectedEntry.entry_type
      }));
    }
  }, [form.entry_id, selectedEntry, editingId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.relative')) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Sort entries: most recently used first
  const sortedEntries = [...entries].sort((a, b) => {
    const aLastUsed = recentActuals.find(act => act.entry_id === a.entry_id);
    const bLastUsed = recentActuals.find(act => act.entry_id === b.entry_id);
    if (aLastUsed && !bLastUsed) return -1;
    if (!aLastUsed && bLastUsed) return 1;
    return 0;
  });

  // Filter entries based on search term
  const filteredEntries = sortedEntries.filter(e =>
    e.entry_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group entries by category
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const category = entry.category_name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(entry);
    return acc;
  }, {});

  // Get selected entry details
  const selectedEntryDetails = entries.find(e => e.entry_id === form.entry_id);

  // Calculate current month summary
  const currentMonthSummary = {
    totalIncome: currentMonthActuals
      .filter(a => a.type === 'income')
      .reduce((sum, a) => sum + parseFloat(a.amount), 0),
    totalExpense: currentMonthActuals
      .filter(a => a.type === 'expense')
      .reduce((sum, a) => sum + parseFloat(a.amount), 0),
    count: currentMonthActuals.length
  };

  // Save widget preferences to localStorage
  useEffect(() => {
    localStorage.setItem(DASHBOARD_WIDGETS_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const toggleWidget = (widgetKey) => {
    setWidgets((prev) => ({
      ...prev,
      [widgetKey]: {
        ...prev[widgetKey],
        expanded: !prev[widgetKey].expanded,
      },
    }));
  };

  const toggleWidgetVisibility = (widgetKey) => {
    setWidgets((prev) => ({
      ...prev,
      [widgetKey]: {
        ...prev[widgetKey],
        visible: !prev[widgetKey].visible,
      },
    }));
  };

  const resetWidgets = () => {
    setWidgets(DEFAULT_WIDGETS);
  };

  const moveWidget = (fromKey, toKey) => {
    setWidgets((prev) => {
      const entries = Object.entries(prev);
      const fromIndex = entries.findIndex(([key]) => key === fromKey);
      const toIndex = entries.findIndex(([key]) => key === toKey);

      if (fromIndex === -1 || toIndex === -1) return prev;

      // Reorder the entries
      const newEntries = [...entries];
      const [movedItem] = newEntries.splice(fromIndex, 1);
      newEntries.splice(toIndex, 0, movedItem);

      // Update order values
      const updated = {};
      newEntries.forEach(([key, config], index) => {
        updated[key] = { ...config, order: index };
      });

      return updated;
    });
  };

  // Calculate KPIs
  const calculateKPIs = () => {
    console.log('Balance Data:', balanceData);
    const currentBalance = balanceData?.actual_balance || 0;

    // Separate expenses and income from actualVsBudget
    const expenses = actualVsBudget.filter(item => item.type === 'expense');
    const income = actualVsBudget.filter(item => item.type === 'income');

    const expenseBudget = expenses.reduce((sum, item) => sum + parseFloat(item.budget || 0), 0);
    const expenseActual = expenses.reduce((sum, item) => sum + parseFloat(item.actual || 0), 0);
    const expensePercentage = expenseBudget > 0 ? (expenseActual / expenseBudget) * 100 : 0;

    const incomeBudget = income.reduce((sum, item) => sum + parseFloat(item.budget || 0), 0);
    const incomeActual = income.reduce((sum, item) => sum + parseFloat(item.actual || 0), 0);
    const incomePercentage = incomeBudget > 0 ? (incomeActual / incomeBudget) * 100 : 0;

    const netIncome = incomeActual - expenseActual;
    const savingsRate = incomeActual > 0 ? (netIncome / incomeActual) * 100 : 0;

    // Budget adherence: how well you're sticking to budget (expenses should be <=100%, income >=100%)
    const expenseScore = expenseBudget > 0 ? Math.max(0, 100 - Math.abs(100 - expensePercentage)) : 100;
    const incomeScore = incomeBudget > 0 ? Math.min(100, incomePercentage) : 100;
    const budgetAdherence = expenses.length + income.length > 0
      ? (expenseScore + incomeScore) / 2
      : 0;

    return {
      currentBalance,
      expenseBudget,
      expenseActual,
      expensePercentage,
      expenseRemaining: expenseBudget - expenseActual,
      incomeBudget,
      incomeActual,
      incomePercentage,
      netIncome,
      savingsRate,
      budgetAdherence,
    };
  };

  const kpis = calculateKPIs();



  if (!scenarioId) {
    return <EmptyScenarioPrompt />;
  }



  const widgetComponents = {
    cashFlow: {
      title: 'Cash Flow / Net Balance',
      icon: '',
      color: 'blue',
      component: (
        <CashFlow data={forecastData} isLoading={isLoading}/>
      ),
    },
    profitLoss: {
      title: 'Profit / Loss Over Time',
      icon: '',
      color: 'pink',
      component: (
        <ProfitAndLoss data={forecastData} isLoading={isLoading}/>
      ),
    },
    incomeVsExpense: {
      title: 'Income vs Expense',
      icon: '',
      color: 'blue',
      component: (
        <IncomeVsExpense data={forecastData} isLoading={isLoading}/>
      ),
    },
    balanceVsPl: {
      title: 'Balance & Profit/Loss Trend',
      icon: '',
      color: 'green',
      component: (
        <BalanceVsPl data={forecastData} isLoading={isLoading}/>
      ),
    },

    monthlyIncome: {
      title: 'Monthly Net Income',
      icon: '',
      color: 'purple',
      component: (
        <MonhtlyIncome data={forecastData} isLoading={isLoading}/>
      ),
    },
    quickEntry: {
      title: 'Quick Entry',
      icon: '',
      color: 'blue',
      component: (
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-3">
            {lastEntry && (
              <button
                onClick={duplicateLastEntry}
                className="text-xs px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition"
              >
                Duplicate Last
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyPress}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3">

              {/* Custom Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-2 rounded-lg border bg-gray-900 text-left focus:outline-none focus:ring focus:ring-blue-500 transition ${
                    form.entry_id ? 'border-blue-500 text-white' : 'border-gray-700 text-gray-400'
                  }`}
                >
                  {selectedEntryDetails ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedEntryDetails.entry_type === 'income' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        <span className="font-medium">{selectedEntryDetails.entry_name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{selectedEntryDetails.category_name}</span>
                    </div>
                  ) : (
                    <span>Select Entry *</span>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="sticky top-0 p-2 bg-gray-800 border-b border-gray-700">
                      <input
                        type="text"
                        placeholder="Search entries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Dropdown List */}
                    <div className="overflow-y-auto max-h-64">
                      {Object.keys(groupedEntries).length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No entries found
                        </div>
                      ) : (
                        Object.entries(groupedEntries).map(([category, categoryEntries]) => (
                          <div key={category}>
                            {/* Category Header */}
                            <div className="sticky top-0 px-3 py-1.5 bg-gray-700 text-xs font-semibold text-gray-300 uppercase tracking-wide">
                              {category}
                            </div>
                            {/* Category Entries */}
                            {categoryEntries.map((entry) => {
                              const isRecent = recentActuals.some(a => a.entry_id === entry.entry_id);
                              return (
                                <button
                                  key={entry.entry_id}
                                  type="button"
                                  onClick={() => {
                                    handleChange({ target: { name: 'entry_id', value: entry.entry_id } });
                                    setIsDropdownOpen(false);
                                    setSearchTerm('');
                                  }}
                                  className={`w-full px-3 py-2 text-left hover:bg-gray-700 transition text-sm flex items-center justify-between group ${
                                    form.entry_id === entry.entry_id ? 'bg-blue-600/20' : ''
                                  }`}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className={`w-2 h-2 rounded-full ${entry.entry_type === 'income' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                    <span className="text-gray-200 font-medium">{entry.entry_name}</span>
                                    {isRecent && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-600/30 text-purple-300 rounded">
                                        Recent
                                      </span>
                                    )}
                                  </div>
                                  <span className={`text-xs ${entry.entry_type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                    {entry.entry_type === 'income' ? '💰' : '💸'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={amountInputRef}
                type="number"
                name="amount"
                placeholder="Amount *"
                value={form.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
                autoFocus
              />

              <input
                type="date"
                name="actual_date"
                value={form.actual_date}
                onChange={handleChange}
                required
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-500 transition"
              />

              <input
                name="comment"
                placeholder="Comment (optional)"
                value={form.comment}
                onChange={handleChange}
                className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-500 transition"
              />

              <div className="grid grid-cols-2 gap-2">
                {['income', 'expense'].map((type) => (
                  <label
                    key={type}
                    className={`cursor-pointer px-4 py-2 rounded-lg border text-center font-semibold transition
                      ${
                        form.type === type
                          ? type === 'income'
                            ? 'bg-green-600/20 border-green-500 text-green-400'
                            : 'bg-red-600/20 border-red-500 text-red-400'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.type === type}
                      onChange={() =>
                        handleChange({ target: { name: 'type', value: type } })
                      }
                      className="hidden"
                    />
                    {type === 'income' ? '💰' : '💸'}
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!form.entry_id || !form.amount || !form.actual_date || !form.type}
                  className={`flex-1 px-5 py-2 rounded-xl font-semibold transition
                    ${
                      !form.entry_id || !form.amount || !form.actual_date || !form.type
                        ? 'bg-gray-600 cursor-not-allowed'
                        : editingId
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                >
                  {editingId ? '✓' : '+'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

            </div>
          </form>
        </div>
      ),
    },
    recentActuals: {
      title: 'Recent Actuals',
      icon: '',
      color: 'purple',
      component: (
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {recentActuals.length === 0 && (
            <div className="p-8 text-center space-y-3">
              <div className="text-4xl">📊</div>
              <div className="text-gray-400 font-semibold text-sm">No recent actuals</div>
              <p className="text-xs text-gray-500">Your recent transactions will appear here</p>
            </div>
          )}

          {recentActuals.map((a) => {
            const entry = entries.find(e => e.entry_id === a.entry_id);
            return (
              <div
                key={a.id}
                className="flex items-center gap-2 p-2 rounded bg-gray-800 border border-gray-700 hover:border-purple-500 transition text-xs"
              >
                <span className="font-mono text-purple-400 flex-shrink-0 text-[10px]">
                  {a.actual_date}
                </span>
                <span className="text-gray-300 truncate flex-1 min-w-0 font-medium">
                  {entry?.entry_name}
                </span>
                <span className="text-gray-500 text-[10px] flex-shrink-0">
                  {entry?.category_name}
                </span>
                <span
                  className={`font-mono font-bold flex-shrink-0 ${
                    a.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {a.type === 'income' ? '+' : '-'}${a.amount}
                </span>
                <button
                  onClick={() => startEdit(a)}
                  className="px-2 py-1 text-[10px] rounded bg-yellow-500 hover:bg-yellow-600 text-white flex-shrink-0"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteActual.mutate(a.id)}
                  className="px-2 py-1 text-[10px] rounded bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                >
                  🗑️
                </button>
              </div>
            );
          })}
        </div>
      ),
    },
    currentMonthSummary: {
      title: `Current Month Summary - ${format(new Date(), 'MMMM yyyy')}`,
      icon: '',
      color: 'green',
      component: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl bg-gradient-to-br from-green-900/40 to-green-800/20 p-4 border border-green-700/50">
            <div className="text-green-400 text-xs font-semibold mb-1">Income This Month</div>
            <div className="text-2xl font-bold text-white">${currentMonthSummary.totalIncome.toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-red-900/40 to-red-800/20 p-4 border border-red-700/50">
            <div className="text-red-400 text-xs font-semibold mb-1">Expenses This Month</div>
            <div className="text-2xl font-bold text-white">${currentMonthSummary.totalExpense.toFixed(2)}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-4 border border-blue-700/50">
            <div className="text-blue-400 text-xs font-semibold mb-1">Net This Month</div>
            <div className={`text-2xl font-bold ${currentMonthSummary.totalIncome - currentMonthSummary.totalExpense >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${(currentMonthSummary.totalIncome - currentMonthSummary.totalExpense).toFixed(2)}
            </div>
          </div>
        </div>
      ),
    },
   
    actualsHistory: {
      title: 'Actuals vs Budget History',
      icon: '',
      color: 'purple',
      component: <ActualsHistory />,
    },
  };

  // Get visible widgets sorted by order
  const visibleWidgets = Object.entries(widgets)
    .filter(([, config]) => config.visible)
    .sort((a, b) => a[1].order - b[1].order);

  

    
   
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Financial Dashboard</h1>
        
        </div>

        {/* Widget Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetWidgets}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition"
          >
            Reset Layout
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        className="
          flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory
          sm:grid sm:grid-cols-2
          lg:grid-cols-5
          sm:gap-4
          scrollbar-hide
        "
      >
        {/* Current Balance */}
        <div className="snap-start min-w-[260px] sm:min-w-0 rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-800/20 p-4 border border-blue-700/50 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-blue-400 text-xs font-semibold uppercase tracking-wide">
              Current Balance
            </div>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${kpis.currentBalance.toFixed(2)}
          </div>
          <div className="text-[10px] text-gray-400">
            Total balance including actuals
          </div>
        </div>

        {/* Expenses */}
        <div className="snap-start min-w-[260px] sm:min-w-0 rounded-xl bg-gradient-to-br from-red-900/40 to-red-800/20 p-4 border border-red-700/50 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-red-400 text-xs font-semibold uppercase tracking-wide">
              Expenses
            </div>
            <span className="text-2xl">💸</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-2xl font-bold text-white">
              ${kpis.expenseActual.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">
              / ${kpis.expenseBudget.toFixed(0)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`text-xs font-semibold ${
                kpis.expensePercentage <= 100
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {kpis.expensePercentage.toFixed(0)}% of budget
            </div>
            {kpis.expenseRemaining > 0 && (
              <div className="text-[10px] text-gray-400">
                (${kpis.expenseRemaining.toFixed(0)} left)
              </div>
            )}
          </div>
        </div>

        {/* Income */}
        <div className="snap-start min-w-[260px] sm:min-w-0 rounded-xl bg-gradient-to-br from-green-900/40 to-green-800/20 p-4 border border-green-700/50 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-green-400 text-xs font-semibold uppercase tracking-wide">
              Income
            </div>
            <span className="text-2xl">📈</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <div className="text-2xl font-bold text-white">
              ${kpis.incomeActual.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">
              / ${kpis.incomeBudget.toFixed(0)}
            </div>
          </div>
          <div
            className={`text-xs font-semibold ${
              kpis.incomePercentage >= 100
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            {kpis.incomePercentage.toFixed(0)}% achieved
          </div>
        </div>

        {/* Net Income */}
        <div className="snap-start min-w-[260px] sm:min-w-0 rounded-xl bg-gradient-to-br from-purple-900/40 to-purple-800/20 p-4 border border-purple-700/50 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-purple-400 text-xs font-semibold uppercase tracking-wide">
              Net Income
            </div>
            <span className="text-2xl">💎</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            ${kpis.netIncome.toFixed(2)}
          </div>
          <div
            className={`text-xs font-semibold ${
              kpis.savingsRate >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {kpis.savingsRate >= 0 ? "Saving" : "Deficit"}{" "}
            {Math.abs(kpis.savingsRate).toFixed(0)}%
          </div>
        </div>

        {/* Budget Score */}
        <div className="snap-start min-w-[260px] sm:min-w-0 rounded-xl bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 p-4 border border-yellow-700/50 transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">
              Budget Score
            </div>
            <span className="text-2xl">🎯</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {kpis.budgetAdherence.toFixed(0)}/100
          </div>
          <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                kpis.budgetAdherence >= 80
                  ? "bg-green-400"
                  : kpis.budgetAdherence >= 60
                  ? "bg-yellow-400"
                  : "bg-red-400"
              }`}
              style={{ width: `${kpis.budgetAdherence}%` }}
            />
          </div>
        </div>
      </div>


      {/* Simulate year / time frame selection */}
<div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">

  {/* Time Frame Boxes */}
  <div
    className="
      flex sm:grid
      sm:grid-cols-4
      lg:col-span-4
      gap-2 sm:gap-3
      overflow-x-auto sm:overflow-visible
      pb-1
    "
  >
    {[
      { label: "Daily", value: "daily", emoji: "📅" },
      { label: "Weekly", value: "weekly", emoji: "🗓️" },
      { label: "Monthly", value: "monthly", emoji: "📆" },
      { label: "Yearly", value: "yearly", emoji: "📈" },
    ].map(({ label, value, emoji }) => {
      const active = timeFrame === value

      return (
        <button
          key={value}
          onClick={() => setTimeFrame(value)}
          className={`
            shrink-0 sm:shrink
            min-w-[90px] sm:min-w-0
            rounded-lg sm:rounded-xl
            px-3 py-2 sm:p-4
            border transition-all
            flex items-center gap-2
            text-left
            ${
              active
                ? "bg-gradient-to-br from-emerald-900/60 to-emerald-800/40 border-emerald-600 shadow scale-[1.02]"
                : "bg-gradient-to-br from-gray-900/40 to-gray-800/20 border-gray-700/50 hover:border-emerald-600/60"
            }
          `}
        >
          <span className="text-lg sm:text-2xl">{emoji}</span>
          <div className="flex flex-col leading-tight">
            <span className="text-xs sm:text-sm font-semibold text-white">
              {label}
            </span>
            {active && (
              <span className="text-[10px] text-emerald-300">
                Selected
              </span>
            )}
          </div>
        </button>
      )
    })}
  </div>

  {/* Forecast Length Slider */}
  <div
    className="
      lg:col-span-2
      flex flex-col gap-2
      rounded-lg sm:rounded-xl
      border border-white/10
      bg-black/30
      p-3 sm:p-4
    "
  >
    <label className="text-[11px] sm:text-xs text-gray-400">
      Forecast Length ({forecastLength} {timeFrame})
    </label>

    <input
      type="range"
      min={1}
      max={maxLength}
      value={forecastLength}
      onChange={(e) => setForecastLength(Number(e.target.value))}
      className="w-full h-1.5 sm:h-2 rounded-lg bg-gray-700 accent-indigo-500"
    />

    <div className="flex justify-between text-[10px] sm:text-xs text-gray-400">
      <span>1</span>
      <span>{maxLength}</span>
    </div>
  </div>
</div>




        <PeriodSummary data={forecastData} isLoading={isLoading}/>

      {/* Widget Visibility Toggles */}
<div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
      Widget Visibility
    </h3>
  </div>

  <div className="flex flex-wrap gap-1.5">
    {Object.entries(widgetComponents).map(([key, widget]) => {
      const visible = widgets[key].visible

      return (
        <button
          key={key}
          onClick={() => toggleWidgetVisibility(key)}
          className={`
            flex items-center gap-1
            px-2.5 py-1
            rounded-md
            text-[11px] font-medium
            transition
            whitespace-nowrap
            ${
              visible
                ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                : "bg-gray-800 text-gray-500 border border-gray-700"
            }
          `}
        >
          {visible ? (
            <EyeIcon className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <EyeSlashIcon className="w-3.5 h-3.5 shrink-0" />
          )}

          <span className="truncate max-w-[110px] sm:max-w-none">
            {widget.icon} {widget.title.split(" - ")[0]}
          </span>
        </button>
      )
    })}
  </div>
</div>


      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        {visibleWidgets.map(([key, config]) => {
          const widget = widgetComponents[key];
          if (!widget) return null;

          return (
            <DashboardWidget
              key={key}
              widgetKey={key}
              title={widget.title}
              icon={widget.icon}
              color={widget.color}
              expanded={config.expanded}
              onToggle={() => toggleWidget(key)}
              onMove={moveWidget}
            >
              {widget.component}
            </DashboardWidget>
          );
        })}
      </div>
    </div>
  );
}

function DashboardWidget({ widgetKey, title, icon, color, expanded, onToggle, onMove, children }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const colorClasses = {
    blue: 'text-blue-400 border-blue-600/30 bg-blue-600/5',
    pink: 'text-pink-400 border-pink-600/30 bg-pink-600/5',
    purple: 'text-purple-400 border-purple-600/30 bg-purple-600/5',
    green: 'text-green-400 border-green-600/30 bg-green-600/5',
  };

  const glowClasses = {
    blue: 'shadow-blue-500/20',
    pink: 'shadow-pink-500/20',
    purple: 'shadow-purple-500/20',
    green: 'shadow-green-500/20',
  };

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetKey);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fromKey = e.dataTransfer.getData('text/plain');
    if (fromKey && fromKey !== widgetKey) {
      onMove(fromKey, widgetKey);
    }
    setIsDragOver(false);
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg border overflow-hidden
        transition-all duration-500 ease-in-out
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isDragOver ? 'ring-4 ring-purple-500/50 scale-105' : ''}
        ${expanded
          ? `lg:col-span-2 ${glowClasses[color]} shadow-2xl scale-[1.01] border-${color.split('-')[0]}-600/50`
          : 'hover:shadow-xl hover:scale-[1.02] border-gray-800 hover:border-gray-700'
        }
        cursor-move
      `}
    >
      {/* Widget Header */}
      <div
        className={`
          w-full p-4 sm:p-6 flex items-center justify-between
          transition-all duration-300
          ${expanded
            ? `${colorClasses[color]} border-b border-${color.split('-')[0]}-600/20`
            : 'hover:bg-gray-800/50'
          }
        `}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Drag Handle */}
          <Bars3Icon className="w-5 h-5 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing transition" />

          <span
            className={`
              text-xl sm:text-2xl transition-transform duration-300
              ${expanded ? 'scale-110 animate-pulse' : ''}
            `}
          >
            {icon}
          </span>
          <h2 className={`font-bold text-sm sm:text-base transition-all duration-300 ${colorClasses[color].split(' ')[0]}`}>
            {title}
          </h2>
          {expanded && (
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] rounded-full bg-gray-800 text-gray-400 animate-fade-in">
              Expanded
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="flex-shrink-0 hover:bg-gray-700/50 rounded-lg p-1 transition"
        >
          {expanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400 transition-transform duration-300 rotate-180" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Widget Content */}
      <div
        className={`
          overflow-auto transition-all duration-500 ease-in-out
          ${expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 animate-fade-in-up">
          {children}
        </div>
      </div>
    </div>
  );
}
