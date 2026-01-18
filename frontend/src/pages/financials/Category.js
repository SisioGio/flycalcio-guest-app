import { useState } from "react";
import apiClient from "../../utils/apiClient";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useCategories } from "../../queries/useCategories";

export default function CategoryCRUD() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useCategories();

  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  /* ---------------- FILTER ---------------- */
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------- MUTATIONS ---------------- */
  const createCategory = useMutation({
    mutationFn: (payload) => apiClient.post("/category", payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setName("");
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, name }) => apiClient.put(`/category/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      resetForm();
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => apiClient.delete("/category", { data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
  });

  /* ---------------- HANDLERS ---------------- */
  const handleSubmit = () => {
    if (!name.trim()) return;

    editingId
      ? updateCategory.mutate({ id: editingId, name })
      : createCategory.mutate({ name });
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
  };

  /* ---------------- RENDER ---------------- */
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading categories…
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* CREATE / EDIT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category…"
          className="md:col-span-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
        />

        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded-lg text-white font-semibold
            ${
              editingId
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-green-600 hover:bg-green-700"
            } transition`}
        >
          {editingId ? "Save" : "Add"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold transition"
          >
            Cancel
          </button>
        )}
      </div>

      {/* SEARCH */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search categories…"
        className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-500 transition"
      />

      {/* Scrollable Cards */}
      <div className="rounded-xl border border-gray-700 bg-gray-900/70 overflow-x-auto">
        <div className="min-w-[400px]">
  {/* Header */}
  <div className="grid grid-cols-[1fr_auto] px-4 py-2 text-xs uppercase tracking-wide text-gray-400 bg-gray-800 sticky top-0 z-10">
    <span>Category</span>
    <span className="pr-2">Actions</span>
  </div>

  {/* Scrollable body */}
  <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-800">
    {filteredCategories.length === 0 && (
      <div className="p-8 text-center space-y-3">
        <div className="text-5xl">🏷️</div>
        <div className="text-gray-400 font-semibold">
          {search ? 'No categories match your search' : 'No categories yet'}
        </div>
        {!search && (
          <p className="text-sm text-gray-500">
            Add categories to organize your financial entries
          </p>
        )}
      </div>
    )}

    {filteredCategories.map((cat) => (
      <div
        key={cat.id}
        className="group grid grid-cols-[1fr_auto] items-center px-4 py-2 hover:bg-gray-800 transition"
      >
        {/* Name */}
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500/80" />
          <span className="font-mono text-sm text-white truncate">
            {cat.name}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => startEdit(cat)}
            className="px-2 py-1 text-xs rounded bg-yellow-500/90 hover:bg-yellow-500 text-white"
          >
            Edit
          </button>
          <button
            onClick={() => deleteCategory.mutate(cat.id)}
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
