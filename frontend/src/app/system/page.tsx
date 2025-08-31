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

export default function SystemPage() {
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

  const architecture = [
    {
      id: "multi-agent",
      name: "Multi-agent AI System",
      icon: "🧠",
      description: "Coordinated AI agents for different content transformation tasks",
      status: "planned",
      readiness: 25,
      features: ["Agent coordination", "Task distribution", "Result aggregation"],
    },
    {
      id: "rag-pipeline",
      name: "RAG Pipeline",
      icon: "🔍",
      description: "Retrieval-Augmented Generation for context-aware transformations",
      status: "planned",
      readiness: 15,
      features: ["Vector embeddings", "Semantic search", "Context injection"],
    },
    {
      id: "semantic-cache",
      name: "Semantic Caching",
      icon: "⚡",
      description: "Intelligent caching based on content similarity",
      status: "concept",
      readiness: 5,
      features: ["Similarity detection", "Cache invalidation", "Performance optimization"],
    },
    {
      id: "byok-system",
      name: "BYOK System",
      icon: "🔐",
      description: "Bring Your Own Key for AI model integration",
      status: "planned",
      readiness: 10,
      features: ["Key management", "Model routing", "Cost optimization"],
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
                    className={`text-sm font-medium text-orange-500 ${
                      darkMode ? "text-orange-400" : "text-orange-500"
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
                  System
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 mt-2"
                >
                  Architecture
                </motion.span>
              </motion.h1>

              <motion.p
                className={`text-lg md:text-xl mb-8 max-w-3xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <span className="font-semibold text-orange-500">Technical foundation</span> powering
                our content transformation platform with multi-agent AI systems and intelligent
                caching.
                <span className="block mt-2 text-sm text-orange-400">
                  ✨ Built for scale, performance, and reliability
                </span>
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* System Architecture Section */}
        <section className="py-12 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {architecture.map((component, index) => (
                <Card3D key={component.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`rounded-xl p-8 backdrop-blur-sm border h-full ${
                      darkMode
                        ? "bg-gray-900/40 border-gray-800/50"
                        : "bg-white/40 border-gray-200/50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{component.icon}</div>
                        <div>
                          <h3
                            className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {component.name}
                          </h3>
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {component.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            component.status === "planned"
                              ? "bg-orange-500"
                              : component.status === "concept"
                                ? "bg-gray-500"
                                : "bg-green-500"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            component.status === "planned"
                              ? "text-orange-500"
                              : component.status === "concept"
                                ? "text-gray-500"
                                : "text-green-500"
                          }`}
                        >
                          {component.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {component.features.map((feature, featureIndex) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 + featureIndex * 0.05 }}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            darkMode
                              ? "bg-gray-800/50 border border-gray-700/50"
                              : "bg-white/50 border border-gray-200/50"
                          }`}
                        >
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          <span
                            className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                        Development Progress
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-16 h-1.5 rounded-full overflow-hidden ${
                            darkMode ? "bg-gray-800/50" : "bg-gray-200/50"
                          }`}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                            style={{ width: `${component.readiness}%` }}
                          />
                        </div>
                        <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-500"}`}>
                          {component.readiness}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Card3D>
              ))}
            </motion.div>

            {/* Architecture Overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16"
            >
              <Card3D>
                <div
                  className={`rounded-xl p-8 backdrop-blur-sm border ${
                    darkMode
                      ? "bg-gray-900/40 border-gray-800/50"
                      : "bg-white/40 border-gray-200/50"
                  }`}
                >
                  <h3
                    className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Architecture Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                      className={`p-4 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-white/50"}`}
                    >
                      <h4
                        className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Frontend Layer
                      </h4>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Next.js with TypeScript, Tailwind CSS, and Framer Motion for smooth
                        interactions
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-white/50"}`}
                    >
                      <h4
                        className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        API Layer
                      </h4>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        FastAPI backend with async processing, rate limiting, and comprehensive
                        error handling
                      </p>
                    </div>
                    <div
                      className={`p-4 rounded-lg ${darkMode ? "bg-gray-800/50" : "bg-white/50"}`}
                    >
                      <h4
                        className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        AI Layer
                      </h4>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Multi-model AI system with semantic caching and intelligent content
                        processing
                      </p>
                    </div>
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
