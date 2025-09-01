"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

export default function Layout({ children, currentPage = "home" }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from system preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("harvest-dark-mode");
    setDarkMode(stored ? stored === "true" : prefersDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("harvest-dark-mode", newMode.toString());
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 relative ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}
    >
      {/* Main content with higher z-index */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation Bar */}
        <nav
          className={`fixed w-full z-50 backdrop-blur-md border-b ${
            darkMode ? "bg-gray-950/90 border-gray-800" : "bg-white/90 border-gray-200"
          }`}
          style={{ WebkitBackdropFilter: "blur(16px)", backdropFilter: "blur(16px)" }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">H</span>
                  </div>
                  <div>
                    <span
                      className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Harvest.ai
                    </span>
                    <span className="text-xs text-orange-500 block -mt-1">Early Alpha</span>
                  </div>
                </Link>

                <div className="hidden md:flex items-center space-x-6">
                  <Link
                    href="/"
                    className={`text-sm ${currentPage === "home" ? "font-medium text-orange-500" : "transition-colors hover:text-orange-500"} ${
                      darkMode
                        ? currentPage === "home"
                          ? "text-orange-400"
                          : "text-gray-400 hover:text-white"
                        : currentPage === "home"
                          ? "text-orange-500"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/demo"
                    className={`text-sm ${currentPage === "demo" ? "font-medium text-orange-500" : "transition-colors hover:text-orange-500"} ${
                      darkMode
                        ? currentPage === "demo"
                          ? "text-orange-400"
                          : "text-gray-400 hover:text-white"
                        : currentPage === "demo"
                          ? "text-orange-500"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Demo
                  </Link>
                  <Link
                    href="/system"
                    className={`text-sm ${currentPage === "system" ? "font-medium text-orange-500" : "transition-colors hover:text-orange-500"} ${
                      darkMode
                        ? currentPage === "system"
                          ? "text-orange-400"
                          : "text-gray-400 hover:text-white"
                        : currentPage === "system"
                          ? "text-orange-500"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    System
                  </Link>
                  <Link
                    href="/roadmap"
                    className={`text-sm ${currentPage === "roadmap" ? "font-medium text-orange-500" : "transition-colors hover:text-orange-500"} ${
                      darkMode
                        ? currentPage === "roadmap"
                          ? "text-orange-400"
                          : "text-gray-400 hover:text-white"
                        : currentPage === "roadmap"
                          ? "text-orange-500"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Roadmap
                  </Link>
                  <Link
                    href="/docs"
                    className={`text-sm ${currentPage === "docs" ? "font-medium text-orange-500" : "transition-colors hover:text-orange-500"} ${
                      darkMode
                        ? currentPage === "docs"
                          ? "text-orange-400"
                          : "text-gray-400 hover:text-white"
                        : currentPage === "docs"
                          ? "text-orange-500"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Docs
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode
                      ? "bg-gray-800 hover:bg-gray-700 text-yellow-500"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 pt-16">{children}</main>

        {/* Footer */}
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
}
