"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

// Advanced particle system inspired by NatureQuest
function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const prefersReducedMotion = useReducedMotion();

  // Generate stable random values
  const particles = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: `small-${i}`,
      initialX: Math.random() * 1920,
      initialY: Math.random() * 1080,
      targetX: Math.random() * 1920,
      targetY: Math.random() * 1080,
      duration: Math.random() * 15 + 8,
      size: Math.random() * 2 + 1,
    }));
  }, []);

  const blobs = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: `blob-${i}`,
      initialX: Math.random() * 1920 - 128,
      initialY: Math.random() * 1080 - 128,
      targetX: Math.random() * 1920 - 128,
      targetY: Math.random() * 1080 - 128,
      duration: Math.random() * 20 + 15,
      scale: Math.random() * 0.5 + 0.8,
    }));
  }, []);

  const floatingElements = useMemo(() => {
    return [...Array(8)].map((_, i) => ({
      id: `float-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 6,
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
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-600/10" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/8 via-transparent to-orange-600/8" />

      {/* Small particles */}
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
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}

      {/* Large orange blobs with gradient */}
      {blobs.map((blob) => (
        <motion.div
          key={blob.id}
          className="absolute opacity-20"
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
          }}
        >
          <div
            className="w-full h-full bg-gradient-to-br from-orange-500/25 via-orange-400/20 to-transparent rounded-full"
            style={{ filter: "blur(25px)", WebkitFilter: "blur(25px)" }}
          />
        </motion.div>
      ))}

      {/* Floating geometric elements */}
      {floatingElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute w-2 h-2 bg-orange-400/30 rounded-full"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(element.delay) * 15, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: element.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: element.delay,
          }}
        />
      ))}

      {/* Glow effects */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ filter: "blur(40px)", WebkitFilter: "blur(40px)" }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/5 rounded-full"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
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

// 3D Card component
function Card3D({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rotateX.set((y - 0.5) * 3);
    rotateY.set((x - 0.5) * -3);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const transform = useTransform(
    [springRotateX, springRotateY],
    ([x, y]) => `perspective(1000px) rotateX(${x}deg) rotateY(${y}deg)`,
  );

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        WebkitTransformStyle: "preserve-3d",
        transform,
      }}
    >
      {children}
    </motion.div>
  );
}

export default function RoadmapPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedUseCase, setSelectedUseCase] = useState(0);

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

  return (
    <div
      className={`min-h-screen transition-colors duration-500 relative ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}
    >
      {/* Advanced Particle Background */}
      <ParticlesBackground />

      {/* Main content with higher z-index */}
      <div className="relative z-10">
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
                    className={`text-sm transition-colors hover:text-orange-500 ${
                      darkMode
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-900"
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
                    className={`text-sm font-medium text-orange-500 ${
                      darkMode ? "text-orange-400" : "text-orange-500"
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

        {/* Hero Section */}
        <section className="pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className={`text-3xl md:text-5xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="block"
                >
                  Development
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mt-2"
                >
                  Roadmap
                </motion.span>
              </motion.h1>

              <motion.p
                className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <span className="font-semibold text-orange-500">Real use cases</span> and system
                architecture we plan to support with clear timelines and development priorities.
                <span className="block mt-2 text-sm text-orange-400">
                  ✨ Transparent roadmap with honest progress updates
                </span>
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-12 px-6 relative">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Use Cases */}
              <Card3D>
                <div
                  className={`rounded-xl p-8 backdrop-blur-sm border ${
                    darkMode
                      ? "bg-gray-900/40 border-gray-800/50"
                      : "bg-white/40 border-gray-200/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3
                      className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      Use Cases
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-xs text-orange-500 font-medium">
                        Active Development
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {useCases.map((useCase, index) => (
                      <motion.div
                        key={useCase.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        onClick={() => setSelectedUseCase(index)}
                        className={`rounded-xl p-6 border cursor-pointer transition-all backdrop-blur-sm ${
                          selectedUseCase === index
                            ? darkMode
                              ? "border-orange-500 bg-gray-800/50 shadow-lg shadow-orange-500/20"
                              : "border-orange-500 bg-white/50 shadow-lg shadow-orange-500/20"
                            : darkMode
                              ? "border-gray-800/50 bg-gray-900/30 hover:bg-gray-800/50 hover:border-gray-700/50"
                              : "border-gray-200/50 bg-white/30 hover:bg-white/50 hover:border-gray-300/50"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">🚀</div>
                            <div className="flex-1">
                              <h4
                                className={`text-xl font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                              >
                                {useCase.title}
                              </h4>
                              <p
                                className={`text-sm mb-3 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {useCase.description}
                              </p>
                              <div
                                className={`text-xs p-2 rounded-lg ${
                                  darkMode ? "bg-gray-800/50" : "bg-gray-100/50"
                                }`}
                              >
                                <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  {useCase.input} → {useCase.output}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
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
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-20 h-1.5 rounded-full overflow-hidden ${
                                  darkMode ? "bg-gray-800/50" : "bg-gray-200/50"
                                }`}
                              >
                                <div
                                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                                  style={{ width: `${useCase.readiness}%` }}
                                />
                              </div>
                              <span
                                className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                              >
                                {useCase.readiness}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Example preview */}
                        <div
                          className={`mt-4 p-4 rounded-lg ${
                            darkMode ? "bg-gray-800/30" : "bg-gray-100/30"
                          }`}
                        >
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex-1">
                              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                Input:
                              </span>
                              <span
                                className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {useCase.example.before}
                              </span>
                            </div>
                            <div className="text-gray-500">→</div>
                            <div className="flex-1">
                              <span className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                Output:
                              </span>
                              <span
                                className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                              >
                                {useCase.example.after}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card3D>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
