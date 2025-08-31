"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  Github,
  Twitter,
  FileText,
  Sparkles,
  ChevronDown,
  Code,
  BookOpen,
  Users,
  Zap,
  Globe,
} from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const productLinks = [
    {
      icon: <Zap className="w-5 h-5 text-harvest-500" />,
      title: "Content Generation",
      description: "Transform any source into any format",
      href: "/features/generation",
    },
    {
      icon: <Globe className="w-5 h-5 text-harvest-500" />,
      title: "Live Scraping",
      description: "Real-time data from any website",
      href: "/features/scraping",
    },
    {
      icon: <Code className="w-5 h-5 text-harvest-500" />,
      title: "API & Integrations",
      description: "Connect with your favorite tools",
      href: "/features/api",
    },
    {
      icon: <Users className="w-5 h-5 text-harvest-500" />,
      title: "Team Collaboration",
      description: "Work together on content",
      href: "/features/teams",
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-lg border-b border-gray-200" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-orange-500 to-orange-400 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-bold text-xl text-gray-900">Harvest.ai</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Product Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsProductDropdownOpen(true)}
                onMouseLeave={() => setIsProductDropdownOpen(false)}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Product
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {isProductDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onMouseEnter={() => setIsProductDropdownOpen(true)}
                    onMouseLeave={() => setIsProductDropdownOpen(false)}
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                  >
                    {productLinks.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.href}
                        className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="mt-0.5">{link.icon}</div>
                        <div>
                          <div className="font-medium text-gray-900">{link.title}</div>
                          <div className="text-sm text-gray-500">{link.description}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/pricing"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              data-testid="nav-docs-link"
            >
              Documentation
            </Link>
            <Link
              href="/blog"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Blog
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              data-testid="nav-signin-link"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="btn-primary flex items-center gap-2"
              data-testid="nav-signup-cta"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            data-testid="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              <Link href="/product" className="block text-gray-600 hover:text-gray-900 font-medium">
                Product
              </Link>
              <Link href="/pricing" className="block text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </Link>
              <Link href="/docs" className="block text-gray-600 hover:text-gray-900 font-medium">
                Documentation
              </Link>
              <Link href="/blog" className="block text-gray-600 hover:text-gray-900 font-medium">
                Blog
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link
                  href="/login"
                  className="block text-center py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign in
                </Link>
                <Link href="/signup" className="block text-center btn-primary">
                  Start Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
