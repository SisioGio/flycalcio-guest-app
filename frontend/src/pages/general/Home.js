import { Link } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import { motion } from "framer-motion";

const HomePage = () => {
  const { auth } = useAuth();

  const features = [
    {
      icon: "📅",
      title: "Upcoming Events",
      text: "See all your assigned events, match days, and important schedules at a glance."
    },
    {
      icon: "🧑‍🤝‍🧑",
      title: "Your Assignments",
      text: "Check your guest assignments, RSVPs, and team participation for each event."
    },
    {
      icon: "⚡",
      title: "Notifications",
      text: "Get real-time updates about event changes or new guest assignments."
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black flex flex-col items-center justify-center px-4 py-12">

      {/* Background floating shapes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-red-600 to-green-600 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={{ duration: 2 }}
        className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-tr from-green-600 to-red-600 blur-3xl"
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-5xl text-center space-y-6 sm:space-y-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-red-600 via-white to-green-600 shadow-2xl shadow-red-500/40"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight px-2 text-white">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-red-600 via-white to-green-600 bg-clip-text text-transparent">
            FlyCalcio
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 sm:text-xl md:text-2xl max-w-2xl mx-auto px-2">
          Your guest dashboard for upcoming events, assignments, and notifications. Stay connected and never miss a match!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 px-2">
          {auth ? (
            <Link
              to="/dashboard"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-white to-green-600 hover:opacity-90 text-black font-semibold shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 via-white to-green-600 hover:opacity-90 text-black font-semibold shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            >
              Get Started
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -4 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur hover:bg-white/10 transition-all"
            >
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-gray-300 text-sm">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
