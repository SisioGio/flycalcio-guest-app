import { useState } from 'react';
import apiClient from '../../utils/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEntries } from '../../queries/useEntries';

import { useCategories } from '../../queries/useCategories';

export default function EntriesCRUD({ scenarioId }) {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'income',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    amount: '',
    category_id: '',
  });
  const [search, setSearch] = useState('');

  const { data: categories = [] } = useCategories();
  const { data: entries = [] } = useEntries(scenarioId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value, ...(name === 'start_date' ? { end_date: value } : {}) });
  };

  const resetForm = () => setForm({ name: '', type: 'income', frequency: 'monthly', start_date: '', end_date: '', amount: '', category_id: '' }, setEditingId(null));

  const createEntry = useMutation({ mutationFn: (payload) => apiClient.post('/entries', payload), onSuccess: () => { queryClient.invalidateQueries(['entries', scenarioId]); resetForm(); } });
  const updateEntry = useMutation({ mutationFn: (payload) => apiClient.put('/entries', payload), onSuccess: () => { queryClient.invalidateQueries(['entries', scenarioId]); resetForm(); } });
  const deleteEntry = useMutation({ mutationFn: (id) => apiClient.delete('/entries', { data: { id } }), onSuccess: () => queryClient.invalidateQueries(['entries', scenarioId]) });

  const startEdit = (e) => {
    setEditingId(e.entry_id);
    setForm({
      name: e.entry_name,
      type: e.entry_type,
      frequency: e.entry_frequency,
      start_date: e.entry_start_date,
      end_date: e.entry_end_date,
      amount: e.entry_amount,
      category_id: e.entry_category_id,
    });
  };

  const handleSubmit = () => {
    const payload = { ...form, amount: Number(form.amount), scenario_id: scenarioId };
    editingId ? updateEntry.mutate({ ...payload, id: editingId }) : createEntry.mutate(payload);
  };

  const filtered = entries.filter((e) => e.entry_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

  <input
    name="name"
    value={form.name}
    onChange={handleChange}
    placeholder="Entry name *"
    required
    className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
  />

  <input
    type="number"
    name="amount"
    value={form.amount}
    onChange={handleChange}
    placeholder="Amount *"
    required
    min="0"
    step="0.01"
    className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
  />

  <select
    name="category_id"
    value={form.category_id}
    onChange={handleChange}
    required
    className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring focus:ring-blue-500 transition"
  >
    <option value="">Select Category *</option>
    {categories.map((c) => (
      <option key={c.id} value={c.id}>{c.name}</option>
    ))}
  </select>

  <button
    onClick={handleSubmit}
    disabled={!scenarioId || !form.name || !form.amount || !form.category_id || !form.start_date}
    className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
      !scenarioId || !form.name || !form.amount || !form.category_id || !form.start_date
        ? 'bg-gray-600 cursor-not-allowed'
        : editingId
        ? 'bg-indigo-600 hover:bg-indigo-700'
        : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {editingId ? 'Update' : 'Add Entry'}
  </button>

  {editingId && (
    <button
      onClick={resetForm}
      className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
    >
      Cancel
    </button>
  )}

  {/* Advanced row */}
 <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">

  {/* Type */}
      <div className="sm:col-span-2 md:col-span-1">
      <p className="text-xs text-gray-400 mb-1 ml-1">Type</p>

      <div className="grid grid-cols-2 gap-2">
        {['income', 'expense'].map((type) => (
          <label
            key={type}
            className={`cursor-pointer px-3 sm:px-4 py-2 rounded-lg border text-center text-xs sm:text-sm font-semibold transition
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
            {type === 'income' ? '💰 Income' : '💸 Expense'}
          </label>
        ))}
      </div>
    </div>


  {/* Frequency */}
      <div className="col-span-full sm:col-span-2 md:col-span-2">
      <p className="text-xs text-gray-400 mb-1 ml-1">Frequency</p>

      <div className="grid grid-cols-5 gap-2">
        {[
          { value: 'one_time', label: '⏱ One-time' },
          { value: 'daily', label: '📅 Daily' },
          { value: 'weekly', label: '📅 Weekly' },
          { value: 'monthly', label: '📅 Monthly' },
          { value: 'yearly', label: '🗓 Yearly' },
        ].map((f) => (
          <label
            key={f.value}
            className={`cursor-pointer px-2 sm:px-4 py-2 rounded-lg border text-center text-xs sm:text-sm font-medium transition
              ${
                form.frequency === f.value
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                  : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
          >
            <input
              type="checkbox"
              checked={form.frequency === f.value}
              onChange={() =>
                handleChange({ target: { name: 'frequency', value: f.value } })
              }
              className="hidden"
            />
            {f.label}
          </label>
        ))}
      </div>
    </div>

<div className="grid grid-cols-1 sm:grid-cols-2 col-span-full md:col-span-2 gap-2">


    <div className="relative">
      <span className="text-xs text-gray-400 mb-1 ml-1">
        Start date
      </span>
<div className="grid grid-cols-1 gap-2">
<input
        type="date"
        name="start_date"
        value={form.start_date}
        onChange={(e) => {
          handleChange(e);

          // // Auto-fill end date for one-time
          // if (form.frequency === 'one_time') {
          //   handleChange({
          //     target: {
          //       name: 'end_date',
          //       value: e.target.value,
          //     },
          //   });
          // }
        }}
        className="w-full px-4 py-2 rounded-xl border border-gray-700 bg-gray-900 text-white
                  focus:outline-none focus:ring focus:ring-blue-500 transition"
      />

</div>
      
    </div>

    <div className="relative">
      <span className="text-xs text-gray-400 mb-1 ml-1">
        End date
      </span>
      <div className="grid grid-cols-1 gap-2">
      <input
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              disabled={form.frequency === 'one_time'}
              className={`w-full px-4 py-2 rounded-xl border transition
                ${
                  form.frequency === 'one_time'
                    ? 'bg-gray-800 border-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 border-gray-700 text-white focus:ring focus:ring-blue-500'
                }`}
            />

      </div>
      

      {form.frequency === 'one_time' && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
          Auto
        </span>
      )}
    </div>


</div>




</div>

</div>


    <input
  placeholder="Search entries..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
/>


      <div className="rounded-xl border border-gray-700 bg-gray-900/70 overflow-x-auto">
        <div className="min-w-[800px]">
  {/* Header */}
  <div className="grid grid-cols-[1.5fr_120px_120px_140px_120px_auto] px-4 py-2 text-xs uppercase tracking-wide text-gray-400 bg-gray-800 sticky top-0 z-10">
    <span>Name</span>
    <span>Type</span>
    <span>Freq</span>
    <span>Dates</span>
    <span className="text-right">Amount</span>
    <span />
  </div>

  {/* Body */}
  <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-800">

    {filtered.length === 0 && (
      <div className="p-8 text-center space-y-3">
        <div className="text-5xl">📝</div>
        <div className="text-gray-400 font-semibold">
          {search ? 'No entries match your search' : 'No entries yet'}
        </div>
        {!search && (
          <p className="text-sm text-gray-500">
            Create your first entry above to start budgeting
          </p>
        )}
      </div>
    )}

    {filtered.map((e) => (
      <div
        key={e.entry_id}
        className="group grid grid-cols-[1.5fr_120px_120px_140px_120px_auto] items-center px-4 py-3 hover:bg-gray-800 transition"
      >
        {/* Name */}
        <span className="text-blue-400 font-medium truncate">
          {e.entry_name}
        </span>

        {/* Type */}
        <span className={`text-xs font-semibold ${
          e.entry_type === 'income' ? 'text-green-400' : 'text-red-400'
        }`}>
          {e.entry_type}
        </span>

        {/* Frequency */}
        <span className="text-xs text-gray-300">
          {e.entry_frequency}
        </span>

        {/* Dates */}
        <span className="text-xs text-gray-400">
          {e.entry_start_date} → {e.entry_end_date}
        </span>

        {/* Amount */}
        <span className={`font-mono text-right ${
          e.entry_type === 'income' ? 'text-green-400' : 'text-red-400'
        }`}>
          {e.entry_amount}
        </span>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => startEdit(e)}
            className="px-2 py-1 text-xs rounded bg-yellow-500/90 hover:bg-yellow-500 text-white"
          >
            Edit
          </button>
          <button
            onClick={() => deleteEntry.mutate(e.entry_id)}
            className="px-2 py-1 text-xs rounded bg-red-600/90 hover:bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
  </div>
</div>

    </div>
  );
}
