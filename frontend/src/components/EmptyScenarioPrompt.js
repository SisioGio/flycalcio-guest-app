import React from 'react';
import { Link } from 'react-router-dom';

export default function EmptyScenarioPrompt() {
  return (
    <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] px-4">
      <div className="max-w-md text-center space-y-3 sm:space-y-4 p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur">

        <div className="text-5xl sm:text-6xl">🎯</div>

        <h2 className="text-xl sm:text-2xl font-bold text-white">No Scenario Selected</h2>

        <p className="text-sm sm:text-base text-gray-400">
          Please select a scenario from the dropdown in the top navigation, or create a new one to get started.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-2 sm:pt-4">
          <Link
            to="/settings"
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white text-sm sm:text-base font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Create Scenario
          </Link>
          <button
            onClick={() => {
              const dropdown = document.querySelector('select');
              if (dropdown) dropdown.focus();
            }}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm sm:text-base font-semibold border border-white/20 transition-all"
          >
            Select Scenario
          </button>
        </div>

        <div className="text-[10px] sm:text-xs text-gray-500 pt-1 sm:pt-2">
          💡 Tip: Scenarios let you create different financial plans and compare strategies
        </div>
      </div>
    </div>
  );
}
