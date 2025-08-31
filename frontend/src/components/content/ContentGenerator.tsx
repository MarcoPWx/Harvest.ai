"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Copy, Download, Share2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface ContentGeneratorProps {
  defaultFormat?: string;
  defaultModel?: string;
  maxLength?: number;
  initialContent?: string;
  isLoading?: boolean;
  error?: string;
  isPro?: boolean;
}

const formats = [
  { value: "blog", label: "Blog Post", icon: "📝" },
  { value: "email", label: "Email", icon: "✉️" },
  { value: "summary", label: "Summary", icon: "📋" },
  { value: "presentation", label: "Presentation", icon: "📊" },
  { value: "social", label: "Social Media", icon: "📱" },
];

const models = [
  { value: "gpt-4", label: "GPT-4", badge: "Advanced" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", badge: "Fast" },
  { value: "claude-3-opus", label: "Claude 3 Opus", badge: "Creative" },
  { value: "claude-3-sonnet", label: "Claude 3 Sonnet", badge: "Balanced" },
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "creative", label: "Creative" },
  { value: "persuasive", label: "Persuasive" },
];

export function ContentGenerator({
  defaultFormat = "blog",
  defaultModel = "gpt-4",
  maxLength = 1000,
  initialContent = "",
  isLoading: propIsLoading = false,
  error: propError,
  isPro = false,
}: ContentGeneratorProps) {
  const [content, setContent] = useState(initialContent);
  const [format, setFormat] = useState(defaultFormat);
  const [model, setModel] = useState(defaultModel);
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState([maxLength]);
  const [temperature, setTemperature] = useState([0.7]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(propIsLoading);
  const [error, setError] = useState(propError);
  const [includeKeywords, setIncludeKeywords] = useState(false);
  const [keywords, setKeywords] = useState("");

  const handleGenerate = useCallback(async () => {
    if (!content.trim()) {
      setError("Please enter some content to transform");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock generated content based on format
      const mockContent = {
        blog: `# ${content}\n\nIn today's rapidly evolving digital landscape, ${content.toLowerCase()} has become a crucial topic of discussion. This blog post explores the key aspects and implications of this subject.\n\n## Introduction\n\nThe importance of understanding ${content.toLowerCase()} cannot be overstated. As we delve deeper into this topic, we'll uncover insights that will reshape our perspective.\n\n## Key Points\n\n1. **Innovation**: The role of technology in transforming traditional approaches\n2. **Sustainability**: Building for a better future\n3. **Collaboration**: Working together to achieve common goals\n\n## Conclusion\n\nAs we move forward, ${content.toLowerCase()} will continue to play a pivotal role in shaping our world.`,

        email: `Subject: Re: ${content}\n\nDear [Recipient],\n\nI hope this email finds you well. I wanted to follow up on our discussion about ${content.toLowerCase()}.\n\nAfter careful consideration, I believe we should move forward with the proposed approach. The benefits clearly outweigh any potential challenges.\n\nPlease let me know your thoughts and if you'd like to schedule a meeting to discuss this further.\n\nBest regards,\n[Your Name]`,

        summary: `This content focuses on ${content.toLowerCase()}. The main points include the importance of innovation, the need for sustainable practices, and the value of collaboration in achieving success.`,

        presentation: `Slide 1: ${content}`,

        social: `🚀 Exciting news about ${content.toLowerCase()}! \n\n✨ Key insights:\n• Innovation is transforming the landscape\n• Collaboration drives success\n• The future is bright\n\n#${content.replace(/\s+/g, "")} #Innovation #FutureForward`,
      };

      setGeneratedContent(mockContent[format as keyof typeof mockContent] || mockContent.blog);
      toast.success("Content generated successfully!");
    } catch (err) {
      setError("Failed to generate content. Please try again.");
      toast.error("Generation failed");
    } finally {
      setIsLoading(false);
    }
  }, [content, format]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedContent);
    toast.success("Copied to clipboard!");
  }, [generatedContent]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harvest-ai-${format}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully!");
  }, [generatedContent, format]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: `Harvest.ai ${format} content`,
        text: generatedContent,
      });
    } else {
      handleCopy();
    }
  }, [generatedContent, format, handleCopy]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Harvest.ai Content Generator
          </CardTitle>
          <CardDescription>
            Transform your ideas into polished content using advanced AI models
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Your Content</Label>
                <Textarea
                  id="content"
                  aria-label="content"
                  placeholder="Enter your content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Format</Label>
                <Select value={format} onValueChange={setFormat} disabled={isLoading}>
                  <SelectTrigger id="format" aria-label="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        <span className="flex items-center gap-2">
                          <span>{f.icon}</span>
                          <span>{f.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={model} onValueChange={setModel} disabled={isLoading}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem
                        key={m.value}
                        value={m.value}
                        disabled={!isPro && m.value === "gpt-4"}
                      >
                        <span className="flex items-center justify-between gap-2 w-full">
                          <span>{m.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {m.badge}
                          </Badge>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={setTone} disabled={isLoading}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Max Length: {length[0]} words</Label>
                <Slider
                  id="length"
                  value={length}
                  onValueChange={setLength}
                  max={isPro ? 5000 : 1000}
                  min={100}
                  step={100}
                  disabled={isLoading}
                />
              </div>

              {isPro && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Creativity: {temperature[0].toFixed(1)}</Label>
                    <Slider
                      id="temperature"
                      value={temperature}
                      onValueChange={setTemperature}
                      max={1}
                      min={0}
                      step={0.1}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="keywords"
                      checked={includeKeywords}
                      onCheckedChange={setIncludeKeywords}
                      disabled={isLoading}
                    />
                    <Label htmlFor="keywords">Include Keywords</Label>
                  </div>

                  {includeKeywords && (
                    <div className="space-y-2">
                      <Label htmlFor="keywords-input">Keywords</Label>
                      <Textarea
                        id="keywords-input"
                        placeholder="Enter keywords separated by commas..."
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="min-h-[60px]"
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Generated Content</Label>
                <Card className="min-h-[400px]">
                  <CardContent className="p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-[350px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : generatedContent ? (
                      <pre className="whitespace-pre-wrap font-sans">{generatedContent}</pre>
                    ) : (
                      <p className="text-muted-foreground text-center mt-32">
                        Generated content will appear here
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {generatedContent && !isLoading && (
                <div className="flex gap-2">
                  <Button onClick={handleCopy} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button onClick={handleDownload} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button onClick={handleShare} size="sm" variant="outline">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <Button onClick={handleGenerate} size="sm" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !content.trim()}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
