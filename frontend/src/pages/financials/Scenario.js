import { useState } from 'react';
import apiClient from '../../utils/apiClient';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useScenarios } from '../../queries/useScenarios';

export default function ScenarioCRUD() {
  const queryClient = useQueryClient();
  const { data: scenarios = [], isLoading } = useScenarios();

  const [search, setSearch] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [editingCode, setEditingCode] = useState(null);

  const createScenario = useMutation({
    mutationFn: (payload) => apiClient.post('/scenario', payload),
    onSuccess: () => queryClient.invalidateQueries(['scenarios']),
  });
  const updateScenario = useMutation({
    mutationFn: ({ code, description }) => apiClient.put('/scenario', { code, description }),
    onSuccess: () => queryClient.invalidateQueries(['scenarios']),
  });
  const deleteScenario = useMutation({
    mutationFn: (code) => apiClient.delete('/scenario', { data: { code } }),
    onSuccess: () => queryClient.invalidateQueries(['scenarios']),
  });

  const filtered = scenarios.filter((s) =>
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setCode('');
    setDescription('');
    setEditingCode(null);
  };

  const handleSubmit = () => {
    if (!code.trim()) return;
    if (editingCode) updateScenario.mutate({ code: editingCode, description });
    else createScenario.mutate({ code, description });
    resetForm();
  };

  const startEdit = (s) => {
    setEditingCode(s.code);
    setCode(s.code);
    setDescription(s.description || '');
  };

  if (isLoading)
    return <p className="p-4 text-center text-gray-400">Loading scenarios...</p>;

  return (
    <div className="space-y-6">
      {/* Input + Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Scenario code"
          disabled={!!editingCode}
          className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
        />
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded-lg text-white font-semibold ${
            editingCode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'
          } transition`}
        >
          {editingCode ? 'Update' : 'Add'}
        </button>
        {editingCode && (
          <button
            onClick={resetForm}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search scenarios..."
        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
      />

      {/* Scrollable Cards */}
     <div className="rounded-xl border border-gray-700 bg-gray-900/70 overflow-x-auto">
       <div className="min-w-[600px]">
  {/* Header */}
  <div className="grid grid-cols-[220px_1fr_auto] px-4 py-2 text-xs uppercase tracking-wide text-gray-400 bg-gray-800 sticky top-0 z-10">
    <span>Scenario</span>
    <span>Description</span>
    <span className="pr-2">Actions</span>
  </div>

  {/* Scrollable body */}
  <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-800">

    {filtered.length === 0 && (
      <div className="p-8 text-center space-y-3">
        <div className="text-5xl">🎯</div>
        <div className="text-gray-400 font-semibold">
          {search ? 'No scenarios match your search' : 'No scenarios yet'}
        </div>
        {!search && (
          <p className="text-sm text-gray-500">
            Create scenarios to manage different financial plans
          </p>
        )}
      </div>
    )}

    {filtered.map((s) => (
      <div
        key={s.code}
        className="group grid grid-cols-[220px_1fr_auto] items-center px-4 py-3 hover:bg-gray-800 transition"
      >
        {/* Code */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-fuchsia-500/80" />
          <span className="font-mono text-sm text-blue-400 truncate">
            {s.code}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 truncate pr-4">
          {s.description || "—"}
        </p>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => startEdit(s)}
            className="px-2 py-1 text-xs rounded bg-yellow-500/90 hover:bg-yellow-500 text-white"
          >
            Edit
          </button>
          <button
            onClick={() => deleteScenario.mutate(s.code)}
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
