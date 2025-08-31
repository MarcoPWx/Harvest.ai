"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

// Advanced particle system inspired by NatureQuest
function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const prefersReducedMotion = useReducedMotion();

  // Generate stable random values - enhanced to match roadmap/system intensity
  const particles = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      // Enhanced to match roadmap/system
      id: `small-${i}`,
      initialX: Math.random() * 1920,
      initialY: Math.random() * 1080,
      targetX: Math.random() * 1920,
      targetY: Math.random() * 1080,
      duration: Math.random() * 15 + 8, // Matches roadmap/system
      size: Math.random() * 2 + 1, // Matches roadmap/system
      delay: Math.random() * 2,
    }));
  }, []);

  const blobs = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      // Enhanced to match roadmap/system
      id: `blob-${i}`,
      initialX: Math.random() * 1920 - 128,
      initialY: Math.random() * 1080 - 128,
      targetX: Math.random() * 1920 - 128,
      targetY: Math.random() * 1080 - 128,
      duration: Math.random() * 20 + 15, // Matches roadmap/system
      scale: Math.random() * 0.5 + 0.8, // Matches roadmap/system
      delay: Math.random() * 1,
    }));
  }, []);

  const floatingElements = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      // Matches roadmap/system
      id: `float-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5, // Matches roadmap/system
      duration: Math.random() * 8 + 6, // Matches roadmap/system
      size: Math.random() * 3 + 2,
    }));
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });

      const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (!mounted || prefersReducedMotion) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-orange-600/15" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced gradient background - matches roadmap/system intensity */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-transparent to-orange-600/8" />

      {/* Small particles - matches roadmap/system intensity */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            willChange: "transform, opacity",
          }}
          initial={{
            x: particle.initialX * (dimensions.width / 1920),
            y: particle.initialY * (dimensions.height / 1080),
            opacity: 0,
          }}
          animate={{
            x: particle.targetX * (dimensions.width / 1920),
            y: particle.targetY * (dimensions.height / 1080),
            opacity: [0, 0.8, 0], // Matches roadmap/system
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: particle.delay,
          }}
        />
      ))}

      {/* Large orange blobs with gradient - matches roadmap/system intensity */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute opacity-20" // Matches roadmap/system
          style={{
            width: "256px",
            height: "256px",
            willChange: "transform",
            transform: `scale(${blob.scale})`,
          }}
          initial={{
            x: blob.initialX * (dimensions.width / 1920),
            y: blob.initialY * (dimensions.height / 1080),
          }}
          animate={{
            x: blob.targetX * (dimensions.width / 1920),
            y: blob.targetY * (dimensions.height / 1080),
          }}
          transition={{
            duration: blob.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: blob.delay,
          }}
        >
          <div
            className="w-full h-full bg-gradient-to-br from-orange-500/25 via-orange-400/20 to-transparent rounded-full"
            style={{ filter: "blur(25px)", WebkitFilter: "blur(25px)" }}
          />
        </motion.div>
      ))}

      {/* Floating geometric elements - matches roadmap/system intensity */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute w-2 h-2 bg-orange-400/30 rounded-full" // Matches roadmap/system
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          animate={{
            y: [0, -30, 0], // Matches roadmap/system
            x: [0, Math.sin(element.delay) * 15, 0], // Matches roadmap/system
            opacity: [0.3, 0.8, 0.3], // Matches roadmap/system
            scale: [1, 1.5, 1], // Matches roadmap/system
          }}
          transition={{
            duration: element.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: element.delay,
          }}
        />
      ))}

      {/* Glow effects - matches roadmap/system intensity */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full" // Matches roadmap/system
        animate={{
          scale: [1, 1.2, 1], // Matches roadmap/system
          opacity: [0.1, 0.3, 0.1], // Matches roadmap/system
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ filter: "blur(40px)", WebkitFilter: "blur(40px)" }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/5 rounded-full" // Matches roadmap/system
        animate={{
          scale: [1.2, 1, 1.2], // Matches roadmap/system
          opacity: [0.2, 0.4, 0.2], // Matches roadmap/system
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ filter: "blur(35px)", WebkitFilter: "blur(35px)" }}
      />
    </div>
  );
}

export default function Home() {
  // State management
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeDemo, setActiveDemo] = useState<"vision" | "reality">("vision");
  const [selectedUseCase, setSelectedUseCase] = useState(0);
  const [showRealityCheck, setShowRealityCheck] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  // Initialize mounted state and dark mode from system preference
  useEffect(() => {
    setMounted(true);
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
      className={`min-h-screen flex flex-col transition-colors duration-500 relative ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}
    >
      {/* Enhanced Particle Background */}
      <ParticlesBackground />

      {/* Main content with higher z-index */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Honest Navigation Bar */}
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
                    className={`text-sm font-medium text-orange-500 ${
                      darkMode ? "text-orange-400" : "text-orange-500"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/demo"
                    className={`text-sm transition-colors hover:text-orange-500 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Demo
                  </Link>
                  <Link
                    href="/system"
                    className={`text-sm transition-colors hover:text-orange-500 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    System
                  </Link>
                  <Link
                    href="/roadmap"
                    className={`text-sm transition-colors hover:text-orange-500 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Roadmap
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
              {/* Animated Status Badge */}
              <motion.div
                initial={mounted ? { scale: 0, rotate: -180 } : { scale: 1, rotate: 0 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
                className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 mb-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 bg-orange-500 rounded-full mr-3"
                />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  🚀 AI Content Transformation Platform
                </span>
              </motion.div>

              {/* Enhanced Main Headline */}
              <motion.h1
                className={`text-4xl md:text-6xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
                initial={mounted ? { opacity: 0, y: 30 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.span
                  initial={mounted ? { opacity: 0, x: -50 } : { opacity: 1, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="block"
                >
                  Transform Any Content
                </motion.span>
                <motion.span
                  initial={mounted ? { opacity: 0, x: 50 } : { opacity: 1, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mt-2"
                >
                  Into Any Format
                </motion.span>
              </motion.h1>

              {/* Enhanced Subheadline */}
              <motion.p
                className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <span className="font-semibold text-orange-500">AI-powered</span> content
                transformation that turns URLs, PDFs, and text into quizzes, blog posts,
                documentation, and{" "}
                <span className="font-semibold text-orange-500">100+ formats</span>.
                <span className="block mt-2 text-sm text-orange-400">
                  ✨ From chaos to clarity in seconds
                </span>
              </motion.p>

              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.button
                  onClick={() =>
                    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold text-base hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🚀 Try the Demo
                </motion.button>
              </motion.div>
            </div>

            {/* Interactive Demo Section */}
            <div id="demo" className="mt-12">
              <div className="text-center mb-6">
                <h2
                  className={`text-2xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  🚀 Working Demo
                </h2>
                <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                  This is what actually works today. Try it out!
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
                      className={`text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-500`}
                    >
                      Working Now
                    </span>
                  </div>
                </div>

                {/* Demo Content */}
                <div className="p-8">
                  {false ? (
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

        {/* Responsive Footer */}
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
                  AI-powered content transformation platform. Turn any content into professional
                  formats instantly.
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
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/demo"
                    className={`block text-sm transition-colors hover:text-orange-500 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Demo
                  </Link>
                  <Link
                    href="/system"
                    className={`block text-sm transition-colors hover:text-orange-500 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    System
                  </Link>
                  <Link
                    href="/roadmap"
                    className={`block text-sm transition-colors hover:text-orange-500 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
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
      </div>
    </div>
  );
}
