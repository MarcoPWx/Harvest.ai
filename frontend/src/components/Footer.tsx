"use client";

import Link from "next/link";

interface FooterProps {
  darkMode: boolean;
}

export default function Footer({ darkMode }: FooterProps) {
  return (
    <footer
      className={`border-t py-8 sm:py-12 px-4 sm:px-6 lg:px-8 ${
        darkMode ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg mr-3">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span
                className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Harvest.ai
              </span>
            </div>
            <p
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"} max-w-xs mx-auto md:mx-0`}
            >
              AI-powered content transformation platform. Turn any content into professional formats
              instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Quick Links
            </h3>
            <div className="space-y-2">
              <Link
                href="/"
                className={`block text-sm transition-colors hover:text-orange-500 ${
                  darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Home
              </Link>
              <Link
                href="/demo"
                className={`block text-sm transition-colors hover:text-orange-500 ${
                  darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Demo
              </Link>
              <Link
                href="/system"
                className={`block text-sm transition-colors hover:text-orange-500 ${
                  darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                System
              </Link>
              <Link
                href="/roadmap"
                className={`block text-sm transition-colors hover:text-orange-500 ${
                  darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Roadmap
              </Link>
            </div>
          </div>

          {/* Status & Info */}
          <div className="text-center md:text-left">
            <h3 className={`font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Status
            </h3>
            <div className="space-y-2">
              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Demo Working
                </span>
              </div>
              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Early Alpha
                </span>
              </div>
              <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Building in Public
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t pt-6 text-center">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            © 2024 Harvest.ai - Building in public with transparency
          </p>
          <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
            Made with ❤️ for content creators, educators, and developers
          </p>
        </div>
      </div>
    </footer>
  );
}
