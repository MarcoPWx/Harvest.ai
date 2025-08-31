"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("blog");
  const [estimatedCost, setEstimatedCost] = useState("$0.00");
  const [activeTab, setActiveTab] = useState("creators");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Output formats Harvest.ai actually supports
  const formats = [
    { id: "blog", name: "Blog Post", icon: "📝", time: "30s", cost: "$0.21", popular: true },
  ];

  return <div>Backup</div>;
}
