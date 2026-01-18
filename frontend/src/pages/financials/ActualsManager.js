import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from './../../utils/apiClient';
import { useEntries } from '../../queries/useEntries';
import { useScenario } from '../../utils/ScenarioContext';
import ActualsVsBudget from './ActualsVsBudget';
import EmptyScenarioPrompt from '../../components/EmptyScenarioPrompt';
import { format, subMonths } from "date-fns";


export default function ActualsManager() {
    const { scenarioId } = useScenario();
    const queryClient = useQueryClient();
    const [period, setPeriod] = useState(format(new Date(), "yyyy-MM"));
    const amountInputRef = useRef(null);

    const lastNextMonths = Array.from({ length: 13 }, (_, i) => {
      return format(subMonths(new Date(), 6 - i), "yyyy-MM");
    });

    const currentMonth = format(new Date(), "yyyy-MM");


    /* ------------------ DATA ------------------ */
    const { data: entries = [] } = useEntries(scenarioId);

    // Fetch actuals for selected period
    const { data: actuals = [] } = useQuery({
      queryKey: ['actuals',period],
      queryFn: async () => {
        const res = await apiClient.get(`/actuals?period=${period}`,);
        return res.data.data;
      },
      enabled: !!period,
    });

    // Fetch recent actuals (last 20)
    const { data: recentActuals = [] } = useQuery({
      queryKey: ['actuals', 'recent'],
      queryFn: async () => {
        const res = await apiClient.get(`/actuals`);
        return res.data.data.slice(0, 20);
      },
    });

    // Fetch current month actuals for summary
    const { data: currentMonthActuals = [] } = useQuery({
      queryKey: ['actuals', currentMonth],
      queryFn: async () => {
        const res = await apiClient.get(`/actuals?period=${currentMonth}`);
        return res.data.data;
      },
    });


    // Fetch current month actuals for summary
    const { data: actualBalance = 0 } = useQuery({
      queryKey: ['actual_balance'],
      queryFn: async () => {
        const res = await apiClient.get(`/private/balance`);
        return res.data.data.actual_balance;
      },
    });

    /* ------------------ STATE ------------------ */
    const [form, setForm] = useState({
      entry_id: '',
      amount: '',
      actual_date: format(new Date(), "yyyy-MM-dd"), // Auto-fill today's date
      comment: '',
      type:''
    });

    const [editingId, setEditingId] = useState(null);
    const [lastEntry, setLastEntry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    /* ------------------ MUTATIONS ------------------ */
    const createActual = useMutation({
      mutationFn: (payload) => apiClient.post('/actuals', payload),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['actuals']);
        setLastEntry(variables);
        resetForm();
        // Focus on amount input for fast consecutive entries
        setTimeout(() => amountInputRef.current?.focus(), 100);
      },
    });

  const updateActual = useMutation({
    mutationFn: (payload) => apiClient.put('/actuals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['actuals']);
      resetForm();
    },
  });

  const deleteActual = useMutation({
    mutationFn: (id) => apiClient.delete('/actuals', { data: { id } }),
    onSuccess: () => queryClient.invalidateQueries(['actuals']),
  });

  /* ------------------ HELPERS ------------------ */
  const selectedEntry = entries.find(e => e.entry_id === form.entry_id);

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setEditingId(null);
    setForm(prev => ({
      ...prev,           // keep existing values
      amount: '',        // reset only amount
      comment: ''        // reset only comment
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!form.entry_id || !form.amount || !form.actual_date || !form.type) return;

    editingId
      ? updateActual.mutate({ id: editingId, ...form })
      : createActual.mutate(form);
  };

  // Handle keyboard shortcut (Enter to submit)
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

  /* ------------------ RENDER ------------------ */
  if (!scenarioId) {
    return <EmptyScenarioPrompt />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">💰 Actuals Manager</h1>
          <p className="text-sm sm:text-base text-gray-400">Record and track your actual income and expenses</p>
        </div>
      </div>

      {/* Current Month Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl bg-gradient-to-br from-green-900/40 to-green-800/20 p-4 border border-green-700/50">
          <div className="text-green-400 text-xs font-semibold mb-1">Current Balance</div>
          <div className="text-2xl font-bold text-white">${actualBalance.toFixed(2)}</div>
        </div>
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

      {/* Fast Entry Form */}
      <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 shadow-xl border border-gray-700">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="font-mono text-blue-400 text-base sm:text-lg">
            ⚡ Quick Entry
          </h3>
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


      {/* Recent Actuals Section */}
      <div className="rounded-xl bg-gray-900 border border-gray-700 p-4 sm:p-6">
        <h3 className="font-mono text-purple-400 text-base sm:text-lg mb-3">📝 Recent Actuals</h3>
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
      </div>

      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-blue-400 text-base sm:text-lg">📅 Budget vs Actuals by Period</h3>
      </div>

      <div className="mb-3 sm:mb-4 flex space-x-2 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {lastNextMonths.map((m) => {
          const isActive = period === m;
          return (
            <button
              key={m}
              onClick={() => setPeriod(m)}
              className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {format(new Date(m + "-01"), "MMM yyyy")}
            </button>
          );
        })}
      </div>

      {/* Actuals List for Selected Period */}
      <div className="rounded-xl bg-gray-900 border border-gray-700 p-4 sm:p-6">
        <h3 className="font-mono text-blue-400 text-base sm:text-lg mb-3">
          Actuals for {format(new Date(period + "-01"), "MMM yyyy")} ({actuals.length})
        </h3>
        <div className="max-h-[400px] overflow-y-auto space-y-1.5">
          {actuals.length === 0 && (
            <div className="p-8 text-center space-y-3">
              <div className="text-4xl">💸</div>
              <div className="text-gray-400 font-semibold text-sm">
                No actuals for {format(new Date(period + "-01"), "MMMM yyyy")}
              </div>
              <p className="text-xs text-gray-500">
                Record your first actual transaction above
              </p>
            </div>
          )}

          {actuals.map((a) => {
            const entry = entries.find(e => e.entry_id === a.entry_id);
            return (
              <div
                key={a.id}
                className="flex items-center gap-2 p-2 rounded bg-gray-800 border border-gray-700 hover:border-blue-500 transition text-xs"
              >
                <span className="font-mono text-blue-400 flex-shrink-0 text-[10px]">
                  {a.actual_date}
                </span>
                <span className="text-gray-300 truncate flex-1 min-w-0">
                  {entry?.entry_name}
                </span>
                <span className="text-gray-500 text-[10px] flex-shrink-0">
                  {entry?.category_name}
                </span>
                <span
                  className={`font-mono font-semibold flex-shrink-0 ${
                    a.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {a.type === 'income' ? '+' : '-'}${a.amount}
                </span>
                <button
                  onClick={() => startEdit(a)}
                  className="px-2 py-1 text-[10px] rounded bg-yellow-500 hover:bg-yellow-600 text-white flex-shrink-0"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteActual.mutate(a.id)}
                  className="px-2 py-1 text-[10px] rounded bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                >
                  Del
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget vs Actuals Comparison */}
      <ActualsVsBudget period={period}/>

    </div>
  );
}
