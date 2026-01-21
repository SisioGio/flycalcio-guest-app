import React from "react";
import Nav from "./Nav";


export default function Layout({ children }) {


  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
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
        &copy; 2026 <span className="font-semibold">FlyCalcio</span>. All rights reserved.
      </footer>
    </div>
  );
}
