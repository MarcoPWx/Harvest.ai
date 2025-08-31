"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

export default function Home() {
  // State management
  const [darkMode, setDarkMode] = useState(false);
  const [activeDemo, setActiveDemo] = useState<"vision" | "reality">("vision");
  const [selectedUseCase, setSelectedUseCase] = useState(0);
  const [showRealityCheck, setShowRealityCheck] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showEcosystemWidget, setShowEcosystemWidget] = useState(false);

  // Refs for scroll animations
  const heroRef = useRef(null);
  const demoRef = useRef(null);
  const useCasesRef = useRef(null);
  const timelineRef = useRef(null);

  // Scroll progress for parallax effects
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // In view hooks
  const heroInView = useInView(heroRef, { once: true, margin: "-100px" });
  const demoInView = useInView(demoRef, { once: true, margin: "-100px" });
  const useCasesInView = useInView(useCasesRef, { once: true, margin: "-100px" });
  const timelineInView = useInView(timelineRef, { once: true, margin: "-100px" });

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
  };

  const fadeInLeft = {
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
  };

  const fadeInRight = {
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
  };

  const staggerContainer = {
    initial: {},
    animate: { transition: { staggerChildren: 0.1 } },
  };

  const scaleOnHover = {
    whileHover: { scale: 1.05, transition: { duration: 0.2 } },
    whileTap: { scale: 0.95 },
  };

  // Handle scroll for navigation visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsNavVisible(currentScrollY < lastScrollY || currentScrollY < 100);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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

  // REAL use cases based on what we can actually deliver
  const useCases = [
    {
      id: "quiz-generation",
      title: "Quiz Generation from Any Source",
      description: "Transform articles, PDFs, or videos into interactive quizzes",
      input: "Wikipedia article, PDF textbook, YouTube transcript",
      output: "Multiple choice quiz with answers and explanations",
      status: "prototype",
      readiness: 60,
      example: {
        before: "https://en.wikipedia.org/wiki/Photosynthesis",
        after: "10 questions about photosynthesis with detailed answers",
      },
    },
    {
      id: "blog-transformation",
      title: "Technical Docs → Blog Posts",
      description: "Convert dry documentation into engaging blog content",
      input: "API documentation, GitHub README, technical specs",
      output: "SEO-optimized blog post with examples",
      status: "planned",
      readiness: 20,
      example: {
        before: "stripe_api_docs.md",
        after: "How to Accept Payments in 5 Minutes with Stripe",
      },
    },
    {
      id: "study-guides",
      title: "Study Guide Creation",
      description: "Generate comprehensive study materials from course content",
      input: "Lecture slides, textbook chapters, research papers",
      output: "Structured study guide with key concepts",
      status: "concept",
      readiness: 10,
      example: {
        before: "biology_chapter_12.pdf",
        after: "Complete study guide with diagrams and practice questions",
      },
    },
    {
      id: "documentation",
      title: "Code → Documentation",
      description: "Generate documentation from source code and comments",
      input: "GitHub repository, source files, API code",
      output: "Markdown documentation with examples",
      status: "planned",
      readiness: 15,
      example: {
        before: "react-component.tsx",
        after: "Complete component documentation with props and usage",
      },
    },
  ];

  // REAL technical architecture status
  const architecture = {
    planned: [
      {
        name: "Multi-agent AI System",
        description: "Coordinated AI agents for content transformation",
        status: "designed",
      },
      {
        name: "RAG Pipeline",
        description: "Retrieval-augmented generation for accuracy",
        status: "researched",
      },
      {
        name: "Semantic Caching",
        description: "Smart caching to reduce costs by 80%",
        status: "planned",
      },
      {
        name: "BYOK System",
        description: "Bring your own API keys for transparency",
        status: "concept",
      },
    ],
    reality: [
      {
        name: "Basic Scraper",
        description: "Can fetch web pages (sometimes)",
        status: "prototype",
      },
      {
        name: "Simple AI Call",
        description: "Calls OpenAI API (no error handling)",
        status: "basic",
      },
      {
        name: "Quiz Generator",
        description: "Generates questions (from QuizMentor)",
        status: "working",
      },
      { name: "No Backend", description: "Frontend only, no API exists yet", status: "missing" },
    ],
  };

  // Join waitlist handler
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // In reality, this would save to a database
    console.log("Waitlist signup:", email);
    setJoined(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setEmail("");
      setJoined(false);
    }, 3000);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 relative ${
        darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Orange Background Dots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-orange-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main content with higher z-index */}
      <div className="relative z-10">
        {/* Honest Navigation Bar */}
        <nav
          className={`fixed w-full z-50 backdrop-blur-md border-b ${
            darkMode ? "bg-gray-950/90 border-gray-800" : "bg-white/90 border-gray-200"
          }`}
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
                  <button
                    onClick={() => setShowRealityCheck(!showRealityCheck)}
                    className={`text-sm font-medium transition-colors ${
                      showRealityCheck
                        ? "text-orange-500"
                        : darkMode
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Reality Check
                  </button>
                  <Link
                    href="/docs"
                    className={`text-sm transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Documentation
                  </Link>
                  <a
                    href="https://github.com/yourusername/harvest-ai"
                    className={`text-sm transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    GitHub
                  </a>
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

                <Link
                  href="#waitlist"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Join Waitlist
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Reality Check Banner */}
        {showRealityCheck && (
          <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-medium">
                  Reality Mode: This product is 20% built. We have big dreams but currently just
                  prototypes. MVP in 4-8 weeks with a team.
                </span>
              </div>
              <button
                onClick={() => setShowRealityCheck(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Hero Section - The Vision */}
        <section
          className={`pt-32 pb-20 px-6 relative overflow-hidden ${showRealityCheck ? "mt-12" : ""}`}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5" />

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              {/* Status Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 mb-8">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2" />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Building in public • Day 1 of journey
                </span>
              </div>

              {/* Main Headline */}
              <h1
                className={`text-5xl md:text-7xl font-bold mb-6 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Transform Any Content
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mt-2">
                  Into Any Format
                </span>
              </h1>

              {/* Subheadline - Honest but compelling */}
              <p
                className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                The AI-powered content transformation platform that will turn URLs, PDFs, and text
                into quizzes, blog posts, documentation, and 100+ formats.
                <span className="block mt-2 text-base text-orange-500">
                  Currently: Quiz generation works. Everything else coming soon.
                </span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() =>
                    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-xl"
                >
                  See What We're Building
                </button>
              </div>

              {/* Trust builders */}
              <div className="flex items-center justify-center gap-8 mt-12 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Open source</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    BYOK model planned
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    No VC funding
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Demo Section */}
            <div id="demo" className="mt-20">
              <div className="text-center mb-8">
                <h2
                  className={`text-3xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  🚀 The Vision (Coming Soon)
                </h2>
                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  This is what we're building towards. Join us on the journey!
                </p>
              </div>

              {/* Demo Interface */}
              <div
                className={`max-w-5xl mx-auto rounded-2xl border backdrop-blur-sm overflow-hidden shadow-2xl ${
                  darkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
                }`}
              >
                {/* Demo Header */}
                <div
                  className={`border-b px-6 py-4 ${
                    darkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        harvest-ai-demo.tsx
                      </span>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-500`}
                    >
                      Planned Features
                    </span>
                  </div>
                </div>

                {/* Demo Content */}
                <div className="p-8">
                  {activeDemo === "vision" ? (
                    // Vision Demo
                    <div className="space-y-6">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-3 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Step 1: Choose your input source
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                          {["URL", "PDF", "Video", "Text"].map((type) => (
                            <button
                              key={type}
                              className={`px-4 py-3 rounded-lg border-2 border-dashed transition-all ${
                                darkMode
                                  ? "border-gray-700 hover:border-orange-500 hover:bg-gray-800"
                                  : "border-gray-300 hover:border-orange-500 hover:bg-orange-50"
                              }`}
                            >
                              <span className="text-2xl mb-1 block">
                                {type === "URL" && "🔗"}
                                {type === "PDF" && "📄"}
                                {type === "Video" && "🎥"}
                                {type === "Text" && "📝"}
                              </span>
                              <span className="text-sm">{type}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-3 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Step 2: Select output formats (100+ coming)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { name: "Quiz", icon: "❓", status: "working" },
                            { name: "Blog Post", icon: "📝", status: "soon" },
                            { name: "Summary", icon: "📋", status: "planned" },
                            { name: "Flashcards", icon: "🎴", status: "planned" },
                            { name: "Presentation", icon: "📊", status: "planned" },
                            { name: "Documentation", icon: "📚", status: "planned" },
                          ].map((format) => (
                            <button
                              key={format.name}
                              className={`px-4 py-3 rounded-lg border transition-all relative ${
                                format.status === "working"
                                  ? "border-green-500 bg-green-500/10"
                                  : darkMode
                                    ? "border-gray-700 hover:border-gray-600"
                                    : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <span className="text-2xl mb-1 block">{format.icon}</span>
                              <span className="text-sm">{format.name}</span>
                              {format.status !== "working" && (
                                <span
                                  className={`absolute top-1 right-1 text-xs px-1 rounded ${
                                    format.status === "soon"
                                      ? "bg-orange-500/20 text-orange-500"
                                      : "bg-gray-500/20 text-gray-500"
                                  }`}
                                >
                                  {format.status}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-3 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Step 3: Advanced options (coming soon)
                        </label>
                        <div
                          className={`p-4 rounded-lg border-2 border-dashed ${
                            darkMode
                              ? "border-gray-700 bg-gray-800/50"
                              : "border-gray-300 bg-gray-50"
                          }`}
                        >
                          <div className="space-y-3 opacity-50">
                            <div className="flex justify-between">
                              <span>AI Model</span>
                              <span>GPT-4 / Claude / Gemini</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Output Language</span>
                              <span>100+ languages</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tone & Style</span>
                              <span>Professional / Casual / Academic</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cost Estimate</span>
                              <span>$0.02 - $0.10 per generation</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all">
                        Generate Content (Coming Soon)
                      </button>
                    </div>
                  ) : (
                    // Reality Demo
                    <div className="space-y-6">
                      <div
                        className={`p-4 rounded-lg ${
                          darkMode
                            ? "bg-yellow-500/10 border border-yellow-500/20"
                            : "bg-yellow-50 border border-yellow-200"
                        }`}
                      >
                        <p className="text-sm">
                          <span className="font-semibold">🚧 Current Status:</span> We can generate
                          basic quizzes from text. That's it. Everything else is being built. No
                          backend, no API, no fancy features yet.
                        </p>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-3 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          What Actually Works:
                        </label>
                        <div className="space-y-3">
                          <div
                            className={`p-4 rounded-lg border ${
                              darkMode
                                ? "border-green-500/50 bg-green-500/5"
                                : "border-green-500 bg-green-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">Quiz Generation</span>
                                <span className="block text-sm opacity-75 mt-1">
                                  Can create multiple choice questions from text (borrowed from
                                  QuizMentor)
                                </span>
                              </div>
                              <span className="text-green-500 text-2xl">✓</span>
                            </div>
                          </div>

                          <div
                            className={`p-4 rounded-lg border opacity-50 ${
                              darkMode
                                ? "border-gray-700 bg-gray-800/50"
                                : "border-gray-300 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">Web Scraping</span>
                                <span className="block text-sm opacity-75 mt-1">
                                  Basic scraping works, no error handling, no rate limiting
                                </span>
                              </div>
                              <span className="text-yellow-500 text-2xl">⚠️</span>
                            </div>
                          </div>

                          <div
                            className={`p-4 rounded-lg border opacity-50 ${
                              darkMode
                                ? "border-gray-700 bg-gray-800/50"
                                : "border-gray-300 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">Everything Else</span>
                                <span className="block text-sm opacity-75 mt-1">
                                  Backend, API, authentication, payments, other formats...
                                </span>
                              </div>
                              <span className="text-red-500 text-2xl">✗</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-3 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Try the Working Prototype:
                        </label>
                        <textarea
                          placeholder="Paste some text here and we'll generate quiz questions..."
                          className={`w-full h-32 px-4 py-3 rounded-lg border resize-none ${
                            darkMode
                              ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                          }`}
                        />
                        <button className="w-full mt-4 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all">
                          Generate Quiz (Actually Works!)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Merged: What We're Building + System Ecosystem */}
        <section className={`py-20 px-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2
                className={`text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                🌐 What We're Building
              </h2>
              <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Real use cases with interactive architecture visualization
              </p>
            </div>

            {/* Use Cases Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-20">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.id}
                  onClick={() => setSelectedUseCase(index)}
                  className={`rounded-xl p-6 border cursor-pointer transition-all ${
                    selectedUseCase === index
                      ? darkMode
                        ? "border-orange-500 bg-gray-800"
                        : "border-orange-500 bg-white"
                      : darkMode
                        ? "border-gray-800 bg-gray-900 hover:bg-gray-800"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3
                      className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {useCase.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        useCase.status === "prototype"
                          ? "bg-green-500/20 text-green-500"
                          : useCase.status === "planned"
                            ? "bg-orange-500/20 text-orange-500"
                            : "bg-gray-500/20 text-gray-500"
                      }`}
                    >
                      {useCase.status}
                    </span>
                  </div>

                  <p className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {useCase.description}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <span
                        className={`text-xs uppercase tracking-wide ${
                          darkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Input
                      </span>
                      <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {useCase.input}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`text-xs uppercase tracking-wide ${
                          darkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Output
                      </span>
                      <p className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {useCase.output}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`text-xs uppercase tracking-wide ${
                          darkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Readiness
                      </span>
                      <div className="mt-2">
                        <div
                          className={`h-2 rounded-full overflow-hidden ${
                            darkMode ? "bg-gray-800" : "bg-gray-200"
                          }`}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${useCase.readiness}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                        <span
                          className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                        >
                          {useCase.readiness}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Interactive Ecosystem Widget */}
            <motion.div
              className={`relative rounded-2xl border backdrop-blur-sm overflow-hidden shadow-2xl ${
                darkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Widget Header */}
              <div
                className={`border-b px-6 py-4 ${
                  darkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      harvest-ecosystem.tsx
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs text-green-500">Live Status</span>
                  </div>
                </div>
              </div>

              {/* Ecosystem Visualization */}
              <div className="relative h-96 p-8 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10">
                  <div
                    className={`w-full h-full ${darkMode ? "bg-gray-800" : "bg-gray-300"}`}
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, ${darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"} 1px, transparent 0)`,
                      backgroundSize: "20px 20px",
                    }}
                  />
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                  {/* Frontend to API */}
                  <motion.path
                    d="M 120 80 Q 200 120 280 160"
                    stroke={darkMode ? "#374151" : "#9CA3AF"}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1 }}
                  />

                  {/* API to Database */}
                  <motion.path
                    d="M 320 160 Q 400 200 480 240"
                    stroke={darkMode ? "#374151" : "#9CA3AF"}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1.5 }}
                  />

                  {/* Data Flow Dots */}
                  <motion.circle
                    r="3"
                    fill="#f97316"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      cx: [120, 200, 280, 320],
                      cy: [80, 120, 160, 160],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 2,
                      ease: "easeInOut",
                    }}
                  />
                </svg>

                {/* System Components */}
                <div className="relative z-10">
                  {/* Frontend */}
                  <motion.div
                    className="absolute top-16 left-16"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => setSelectedNode("frontend")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-blue-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-blue-500/10 hover:bg-blue-500/20"
                          : "bg-blue-50 hover:bg-blue-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">🎨</div>
                      <div className="text-xs font-semibold text-blue-600">Frontend UI</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* API Layer */}
                  <motion.div
                    className="absolute top-32 left-64"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setSelectedNode("api")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-orange-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-orange-500/10 hover:bg-orange-500/20"
                          : "bg-orange-50 hover:bg-orange-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-xs font-semibold text-orange-600">API Layer</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-xs text-yellow-600">Building</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Services */}
                  <motion.div
                    className="absolute top-48 left-80"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setSelectedNode("ai")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-purple-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-purple-500/10 hover:bg-purple-500/20"
                          : "bg-purple-50 hover:bg-purple-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">🤖</div>
                      <div className="text-xs font-semibold text-purple-600">AI Services</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-xs text-yellow-600">Prototype</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Database */}
                  <motion.div
                    className="absolute top-80 left-48"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => setSelectedNode("database")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-green-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-green-500/10 hover:bg-green-500/20"
                          : "bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">🗄️</div>
                      <div className="text-xs font-semibold text-green-600">Supabase DB</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs text-red-600">Not Setup</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* External Services */}
                  <motion.div
                    className="absolute top-48 right-16"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    onClick={() => setSelectedNode("external")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-indigo-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-indigo-500/10 hover:bg-indigo-500/20"
                          : "bg-indigo-50 hover:bg-indigo-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">🔗</div>
                      <div className="text-xs font-semibold text-indigo-600">External APIs</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-xs text-yellow-600">BYOK</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Processing Pipeline */}
                  <motion.div
                    className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    onClick={() => setSelectedNode("pipeline")}
                  >
                    <div
                      className={`w-40 h-24 rounded-xl border-2 border-pink-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-pink-500/10 hover:bg-pink-500/20"
                          : "bg-pink-50 hover:bg-pink-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">⚙️</div>
                      <div className="text-xs font-semibold text-pink-600">Processing Pipeline</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs text-red-600">Not Built</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Status Legend */}
                <div className="absolute bottom-4 right-4 flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                      In Progress
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                      Not Started
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        <motion.section
          ref={timelineRef}
          className={`py-20 px-6 ${darkMode ? "bg-black" : "bg-white"}`}
          initial="initial"
          animate={timelineInView ? "animate" : "initial"}
          variants={staggerContainer}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-12" variants={fadeInUp}>
              <h2
                className={`text-4xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                🌐 System Ecosystem
              </h2>
              <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Interactive architecture visualization - click nodes to explore
              </p>
            </motion.div>

            {/* Interactive Ecosystem Widget */}
            <motion.div
              className={`relative rounded-2xl border backdrop-blur-sm overflow-hidden shadow-2xl mb-16 ${
                darkMode ? "bg-gray-900/50 border-gray-800" : "bg-white border-gray-200"
              }`}
              variants={fadeInUp}
            >
              {/* Widget Header */}
              <div
                className={`border-b px-6 py-4 ${
                  darkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      harvest-ecosystem.tsx
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs text-green-500">Live Status</span>
                  </div>
                </div>
              </div>

              {/* Ecosystem Visualization */}
              <div className="relative h-96 p-8 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10">
                  <div
                    className={`w-full h-full ${darkMode ? "bg-gray-800" : "bg-gray-300"}`}
                    style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, ${darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"} 1px, transparent 0)`,
                      backgroundSize: "20px 20px",
                    }}
                  />
                </div>

                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                  {/* Frontend to API */}
                  <motion.path
                    d="M 120 80 Q 200 120 280 160"
                    stroke={darkMode ? "#374151" : "#9CA3AF"}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1 }}
                  />

                  {/* API to Database */}
                  <motion.path
                    d="M 320 160 Q 400 200 480 240"
                    stroke={darkMode ? "#374151" : "#9CA3AF"}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1.5 }}
                  />

                  {/* Data Flow Dots */}
                  <motion.circle
                    r="3"
                    fill="#f97316"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      cx: [120, 200, 280, 320],
                      cy: [80, 120, 160, 160],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 2,
                      ease: "easeInOut",
                    }}
                  />
                </svg>

                {/* System Components */}
                <div className="relative z-10">
                  {/* Frontend */}
                  <motion.div
                    className="absolute top-16 left-16"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => setSelectedNode("frontend")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-blue-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-blue-500/10 hover:bg-blue-500/20"
                          : "bg-blue-50 hover:bg-blue-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">🎨</div>
                      <div className="text-xs font-semibold text-blue-600">Frontend UI</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* API Layer */}
                  <motion.div
                    className="absolute top-32 left-64"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setSelectedNode("api")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-orange-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-orange-500/10 hover:bg-orange-500/20"
                          : "bg-orange-50 hover:bg-orange-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-xs font-semibold text-orange-600">API Layer</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-xs text-yellow-600">Building</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* AI Services */}
                  <motion.div
                    className="absolute top-48 left-80"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setSelectedNode("ai")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-purple-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-purple-500/10 hover:bg-purple-500/20"
                          : "bg-purple-50 hover:bg-purple-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">🤖</div>
                      <div className="text-xs font-semibold text-purple-600">AI Services</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-xs text-yellow-600">Prototype</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Database */}
                  <motion.div
                    className="absolute top-80 left-48"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => setSelectedNode("database")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-green-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-green-500/10 hover:bg-green-500/20"
                          : "bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">🗄️</div>
                      <div className="text-xs font-semibold text-green-600">Supabase DB</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs text-red-600">Not Setup</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* External Services */}
                  <motion.div
                    className="absolute top-48 right-16"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    onClick={() => setSelectedNode("external")}
                  >
                    <div
                      className={`w-32 h-24 rounded-xl border-2 border-indigo-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-indigo-500/10 hover:bg-indigo-500/20"
                          : "bg-indigo-50 hover:bg-indigo-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">🔗</div>
                      <div className="text-xs font-semibold text-indigo-600">External APIs</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        <span className="text-xs text-yellow-600">BYOK</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Processing Pipeline */}
                  <motion.div
                    className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    onClick={() => setSelectedNode("pipeline")}
                  >
                    <div
                      className={`w-40 h-24 rounded-xl border-2 border-pink-500 p-3 cursor-pointer transition-all ${
                        darkMode
                          ? "bg-pink-500/10 hover:bg-pink-500/20"
                          : "bg-pink-50 hover:bg-pink-100"
                      }`}
                    >
                      <div className="text-2xl mb-1">⚙️</div>
                      <div className="text-xs font-semibold text-pink-600">Processing Pipeline</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-xs text-red-600">Not Built</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Status Legend */}
                <div className="absolute bottom-4 right-4 flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                      In Progress
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                      Not Started
                    </span>
                  </div>
                </div>
              </div>

              {/* Node Details Panel */}
              <AnimatePresence>
                {selectedNode && (
                  <motion.div
                    className={`absolute top-20 right-4 p-4 rounded-lg border ${
                      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    } shadow-lg max-w-xs z-20`}
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {selectedNode === "frontend"
                          ? "Frontend Layer"
                          : selectedNode === "api"
                            ? "API Layer"
                            : selectedNode === "ai"
                              ? "AI Engine"
                              : selectedNode === "database"
                                ? "Database Layer"
                                : selectedNode === "external"
                                  ? "External APIs"
                                  : "Processing Pipeline"}
                      </h4>
                      <button
                        onClick={() => setSelectedNode(null)}
                        className={`text-xs ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"}`}
                      >
                        ✕
                      </button>
                    </div>
                    <p className={`text-sm mb-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {selectedNode === "frontend"
                        ? "React-based UI with Tailwind CSS, Framer Motion animations, and responsive design."
                        : selectedNode === "api"
                          ? "RESTful API built with Next.js API routes. Handles content generation, user management, and BYOK integration."
                          : selectedNode === "ai"
                            ? "Bring Your Own Key integration supporting OpenAI, Anthropic, and other providers. Smart prompt engineering."
                            : selectedNode === "database"
                              ? "Supabase PostgreSQL database with real-time subscriptions, authentication, and file storage."
                              : selectedNode === "external"
                                ? "Third-party AI providers accessed via user-provided API keys. No data stored on our servers."
                                : "Content processing pipeline for parsing, analyzing, and generating quiz content from various input formats."}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          selectedNode === "frontend"
                            ? "bg-green-500"
                            : selectedNode === "api" ||
                                selectedNode === "ai" ||
                                selectedNode === "external"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs text-gray-500">
                        {selectedNode === "frontend"
                          ? "Active"
                          : selectedNode === "api" ||
                              selectedNode === "ai" ||
                              selectedNode === "external"
                            ? "In Progress"
                            : "Not Started"}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.section>

        {/* Join the Journey Section */}
        <section id="waitlist" className={`py-20 px-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2
                className={`text-4xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Join the Journey
              </h2>
              <p className={`text-lg mb-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                We're building this in public. No hype, just honest progress. Get weekly updates on
                what's actually working (and what's not).
              </p>
            </div>

            {/* Simple Signup Form */}
            <div className="max-w-md mx-auto">
              <form onSubmit={handleJoinWaitlist}>
                <div className="flex gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all"
                  >
                    {joined ? "✓ Joined!" : "Join Waitlist"}
                  </button>
                </div>
              </form>

              <p
                className={`text-xs mt-4 text-center ${darkMode ? "text-gray-500" : "text-gray-500"}`}
              >
                No spam. Just honest weekly updates about our progress.
              </p>

              <div className="mt-12 flex items-center justify-center gap-8">
                <a
                  href="https://github.com/yourusername/harvest-ai"
                  className={`flex items-center gap-2 transition-colors ${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Follow on GitHub</span>
                </a>
                <a
                  href="https://twitter.com/harvestai"
                  className={`flex items-center gap-2 transition-colors ${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  <span>Updates on Twitter</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className={`border-t py-12 px-6 ${
            darkMode ? "bg-gray-950 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                © 2024 Harvest.ai - Building in public with transparency
              </p>
              <p className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                Current Status: 20% built | Day 1 of development | No VC funding
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
