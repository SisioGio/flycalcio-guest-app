import React, { useState } from 'react';
import ScenarioCRUD from './Scenario';
import EntriesCRUD from './Entries';
import CategoryCRUD from './Category';
import { useScenario } from '../../utils/ScenarioContext';
import InitialBalanceCard from './InitialBalance';

export default function CRMPage() {
  const { scenarioId } = useScenario();
  const [activeTab, setActiveTab] = useState('scenarios');

  const tabs = [
    { id: 'scenarios', label: 'Scenarios', icon: '🎯', color: 'blue' },
    { id: 'categories', label: 'Categories', icon: '🏷️', color: 'pink' },
     { id: 'entries', label: 'Budget Entries', icon: '💰', color: 'green' },
    { id: 'balance', label: 'Initial Balance', icon: '💵', color: 'purple' },
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400',
      green: isActive ? 'bg-green-600/20 border-green-500 text-green-400' : 'border-gray-700 text-gray-400 hover:border-green-500/50 hover:text-green-400',
      pink: isActive ? 'bg-pink-600/20 border-pink-500 text-pink-400' : 'border-gray-700 text-gray-400 hover:border-pink-500/50 hover:text-pink-400',
      purple: isActive ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'border-gray-700 text-gray-400 hover:border-purple-500/50 hover:text-purple-400',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">⚙️ Settings</h1>
          <p className="text-sm sm:text-base text-gray-400">Configure your financial planning workspace</p>
        </div>
   
        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('scenarios')}
            className="px-3 py-1.5 text-xs rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600/20 transition"
          >
            + New Scenario
          </button>
          {scenarioId && (
            <button
              onClick={() => setActiveTab('entries')}
              className="px-3 py-1.5 text-xs rounded-lg bg-green-600/10 border border-green-500/30 text-green-400 hover:bg-green-600/20 transition"
            >
              + New Entry
            </button>
          )}
        </div>
      </div>
  {/* Help Section */}
      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-indigo-600/10 to-fuchsia-600/10 border border-indigo-500/30 backdrop-blur">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="text-xl sm:text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="text-indigo-400 font-semibold mb-1 text-sm sm:text-base">Getting Started</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-400">
              <div>
                <span className="text-blue-400 font-semibold">1. Scenarios:</span> Create different budget plans
              </div>
              <div>
                <span className="text-pink-400 font-semibold">2. Categories:</span> Organize your finances
              </div>
              <div>
                <span className="text-purple-400 font-semibold">3. Balance:</span> Set starting amount
              </div>
              <div>
                <span className="text-green-400 font-semibold">4. Entries:</span> Add income/expenses
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Scenario Warning */}
      {!scenarioId && activeTab === 'entries' && (
        <div className="p-3 sm:p-4 rounded-xl bg-yellow-600/10 border border-yellow-500/30 backdrop-blur">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-yellow-400 font-semibold mb-1 text-sm sm:text-base">No Scenario Selected</h3>
              <p className="text-xs sm:text-sm text-gray-300">
                Please create or select a scenario first before adding entries. Scenarios help you organize different financial plans.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-gray-900/50 rounded-xl p-1 border border-gray-800">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 transition-all text-xs sm:text-sm font-semibold ${
                getColorClasses(tab.color, activeTab === tab.id)
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl shadow-lg border border-gray-800 overflow-hidden">

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">🎯 Scenarios</h2>
                <p className="text-xs sm:text-sm text-gray-400">Create and manage different financial planning scenarios</p>
              </div>
            </div>
            <ScenarioCRUD />
          </div>
        )}

        {/* Entries Tab */}
        {activeTab === 'entries' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-green-400 mb-1">💰 Budget Entries</h2>
                <p className="text-xs sm:text-sm text-gray-400">
                  {scenarioId
                    ? 'Add income and expense entries to build your budget forecast'
                    : 'Select a scenario to start adding entries'}
                </p>
              </div>
            </div>
            <EntriesCRUD scenarioId={scenarioId} />
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-pink-400 mb-1">🏷️ Categories</h2>
                <p className="text-xs sm:text-sm text-gray-400">Organize your financial entries with custom categories</p>
              </div>
            </div>
            <CategoryCRUD />
          </div>
        )}

        {/* Initial Balance Tab */}
        {activeTab === 'balance' && (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">💵 Initial Balance</h2>
                <p className="text-xs sm:text-sm text-gray-400">Set your starting balance for accurate forecasting</p>
              </div>
            </div>
            <InitialBalanceCard />
          </div>
        )}

      </div>

 

    </div>
  );
}
