import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useScenarios } from "../queries/useScenarios";
import { useScenario } from "../utils/ScenarioContext";
import { useAuth } from "../utils/AuthContext";

export default function Nav() {
  const { scenarioId, setScenarioId } = useScenario();
  const { data: scenarios = [], isLoading } = useScenarios();
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-select first scenario if none selected
  useEffect(() => {
    if (!scenarioId && scenarios.length > 0 && !isLoading) {
      setScenarioId(scenarios[0].id);
    }
  }, [scenarios, scenarioId, setScenarioId, isLoading]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const tabs = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/actuals", label: "Actuals" },
    { path: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      {/* TOP BAR */}
      <nav className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/40" />
          <NavLink
            to="/"
            className="text-xl sm:text-2xl font-extrabold tracking-wide text-white"
          >
            Finalyze
          </NavLink>
        </div>

        {/* MOBILE ACTIONS */}
        <div className="flex items-center gap-2 sm:hidden">
          {auth && (
            <select
              value={scenarioId ?? ""}
              onChange={(e) => setScenarioId(e.target.value)}
              className="bg-white/10 text-xs text-white rounded-lg px-2 py-1 border border-white/20"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} className="text-black">
                  {s.code}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white/10 text-white border border-white/20"
          >
            ☰
          </button>
        </div>

        {/* DESKTOP NAV */}
        {auth && (
          <div className="hidden sm:flex gap-2 bg-white/5 p-1 rounded-xl backdrop-blur">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* DESKTOP SCENARIO + AUTH */}
        <div className="hidden sm:flex items-center gap-3">
          {auth && (
            <select
              value={scenarioId ?? ""}
              onChange={(e) => setScenarioId(e.target.value)}
              className="bg-white/5 text-sm text-white rounded-lg px-3 py-2 border border-white/20"
            >
              <option value="" className="text-black">
                Select scenario
              </option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} className="text-black">
                  {s.code}
                </option>
              ))}
            </select>
          )}

          {auth ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all"
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-lg shadow-md"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && auth && (
        <div className="sm:hidden px-3 pb-4 animate-slideDown">
          <div className="rounded-xl bg-black/70 backdrop-blur border border-white/10 p-2 space-y-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg text-sm font-semibold ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}

            <button
              onClick={handleLogout}
              className="w-full mt-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
