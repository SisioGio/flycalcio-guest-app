import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from './../../utils/apiClient';
import {useAuth} from './../../utils/AuthContext'
export default function InitialBalanceCard() {
  const {auth} = useAuth()
  const [value, setValue] = useState(auth.initial_balance ?? '');

  const updateBalance = useMutation({
    mutationFn: (initial_balance) =>
      apiClient.put('/private/balance', { initial_balance }),
  });

  const handleSubmit = () => {
    if (value === '' || isNaN(value)) return;

    updateBalance.mutate(Number(value));
  };

  return (
    <div className="max-w-md rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-xl border border-gray-700">
      {/* Title */}
      <h3 className="text-lg font-mono text-blue-400 mb-4">
        Initial Balance
      </h3>

      {/* Input */}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-900 text-white
                     focus:outline-none focus:ring focus:ring-blue-500 transition
                     text-lg font-mono"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-mono">
          €
        </span>
      </div>

      {/* Action */}
      <button
        onClick={handleSubmit}
        disabled={updateBalance.isLoading}
        className={`mt-4 w-full px-4 py-3 rounded-xl font-semibold transition
          ${
            updateBalance.isLoading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }
        `}
      >
        {updateBalance.isLoading ? 'Saving…' : 'Update Balance'}
      </button>

      {/* Status */}
      {updateBalance.isSuccess && (
        <p className="mt-3 text-sm text-green-400">
          ✓ Balance updated successfully
        </p>
      )}

      {updateBalance.isError && (
        <p className="mt-3 text-sm text-red-400">
          ✕ Failed to update balance
        </p>
      )}
    </div>
  );
}
