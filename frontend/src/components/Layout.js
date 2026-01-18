import React from "react";
import Nav from "./Nav";


export default function Layout({ children }) {


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-900 text-white">
      {/* Header + Nav */}
      <header>
        <Nav />
       

     
      </header>

      {/* Main content */}
      <main className="flex-grow p-6 overflow-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-center py-3 text-gray-200">
        &copy; 2026 <span className="font-semibold">Finalyze</span>. All rights reserved.
      </footer>
    </div>
  );
}
