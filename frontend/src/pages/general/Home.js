import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';

const HomePage = () => {
  const { auth } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8">

      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-4 sm:space-y-6">

        {/* Logo & Title */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-2xl shadow-fuchsia-500/40" />
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight px-2">
          Welcome to <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Finalyze</span>
        </h1>

        <p className="text-base sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto px-2">
          Your intelligent financial planning and forecasting companion. Track actuals, manage budgets, and visualize your financial future.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mt-6 sm:mt-8 px-4">
          {auth ? (
            <>
              <Link
                to="/dashboard"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/settings"
                className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 backdrop-blur transition-all"
              >
                Manage Settings
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 backdrop-blur transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Financial Dashboard</h3>
            <p className="text-gray-400 text-sm">
              Visualize your cash flow, profit/loss, and forecast with interactive charts
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-white mb-2">Track Actuals</h3>
            <p className="text-gray-400 text-sm">
              Record actual income and expenses, compare against budget in real-time
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-all">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Scenario Planning</h3>
            <p className="text-gray-400 text-sm">
              Create multiple financial scenarios and compare different strategies
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default HomePage;
