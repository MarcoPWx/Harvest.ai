import { NextRequest, NextResponse } from "next/server";

// Format types we support
export type FormatType = "blog" | "email" | "summary" | "presentation";

interface FormatRequest {
  content: string;
  outputFormat: FormatType;
  options?: {
    tone?: "professional" | "casual" | "academic" | "friendly";
    length?: "short" | "medium" | "long";
    difficulty?: "easy" | "medium" | "hard";
  };
}

interface FormatResponse {
  formatted: string;
  cost: string;
  quality: number;
  processingTime: number;
}

// Mock formatter for now - replace with actual AI calls later
class ContentFormatter {
  private formatters = {
    blog: this.formatBlog.bind(this),
    email: this.formatEmail.bind(this),
    summary: this.formatSummary.bind(this),
    presentation: this.formatPresentation.bind(this),
  };

  async format(request: FormatRequest): Promise<FormatResponse> {
    const startTime = Date.now();

    const formatter = this.formatters[request.outputFormat];
    if (!formatter) {
      throw new Error(`Unsupported format: ${request.outputFormat}`);
    }

    const formatted = await formatter(request.content, request.options);
    const processingTime = Date.now() - startTime;

    // Mock cost calculation (will be real later)
    const cost = this.calculateCost(request.content, request.outputFormat);
    const quality = this.assessQuality(formatted);

    return {
      formatted,
      cost,
      quality,
      processingTime,
    };
  }

  private async formatBlog(content: string, options?: any): Promise<string> {
    // For MVP, return a simple formatted blog structure
    const title = this.extractTitle(content);
    const intro = this.generateIntro(content);
    const sections = this.generateSections(content);
    const conclusion = this.generateConclusion(content);

    return `# ${title}

## Introduction
${intro}

${sections}

## Conclusion
${conclusion}

---
*Meta Description*: ${intro.substring(0, 160)}...
*Keywords*: ${this.extractKeywords(content).join(", ")}`;
  }

  private async formatEmail(content: string, options?: any): Promise<string> {
    const tone = options?.tone || "professional";
    const subject = this.generateEmailSubject(content);
    const body = this.generateEmailBody(content, tone);

    return `**Subject:** ${subject}

Dear [Recipient],

${body}

Best regards,
[Your Name]

---
*Tone: ${tone}*
*Call to Action: [Please review and provide feedback]*`;
  }

  private async formatSummary(content: string, options?: any): Promise<string> {
    const keyPoints = this.extractKeyPoints(content);
    const takeaways = this.generateTakeaways(content);

    return `## Summary

### Key Points
${keyPoints.map((point) => `• ${point}`).join("\n")}

### Main Takeaways
${takeaways.map((takeaway, i) => `${i + 1}. ${takeaway}`).join("\n")}

### Action Items
• Review the full document for details
• Share with relevant stakeholders
• Schedule follow-up discussion`;
  }

  private async formatPresentation(content: string, options?: any): Promise<string> {
    const slides = this.generateSlides(content);

    return slides
      .map(
        (slide, i) => `
## Slide ${i + 1}: ${slide.title}

${slide.bullets.map((bullet: string) => `• ${bullet}`).join("\n")}

*Speaker Notes: ${slide.notes}*
`,
      )
      .join("\n---\n");
  }

  // Helper methods (simplified for MVP)
  private extractTitle(content: string): string {
    const firstLine = content.split("\n")[0];
    return firstLine.substring(0, 60) || "Untitled Document";
  }

  private generateIntro(content: string): string {
    const sentences = content.split(".").filter((s) => s.trim());
    return sentences[0]?.trim() + "." || "This document explores key concepts and insights.";
  }

  private generateSections(content: string): string {
    const paragraphs = content.split("\n\n").filter((p) => p.trim());
    return paragraphs
      .slice(1, 4)
      .map(
        (p, i) => `
## Section ${i + 1}
${p.trim()}
`,
      )
      .join("\n");
  }

  private generateConclusion(content: string): string {
    return "In conclusion, the key points discussed highlight important considerations for moving forward.";
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction
    const words = content.toLowerCase().split(/\W+/);
    const commonWords = new Set(["the", "is", "at", "which", "on", "and", "a", "an"]);
    const keywords = words.filter((w) => w.length > 4 && !commonWords.has(w)).slice(0, 5);
    return [...new Set(keywords)];
  }

  private generateEmailSubject(content: string): string {
    return `Important: ${this.extractTitle(content)}`;
  }

  private generateEmailBody(content: string, tone: string): string {
    const intro =
      tone === "casual"
        ? "Hey! Wanted to share this with you:"
        : "I hope this email finds you well. I wanted to bring to your attention:";

    return `${intro}

${this.generateIntro(content)}

Please let me know your thoughts on this matter.`;
  }

  private extractKeyPoints(content: string): string[] {
    const sentences = content.split(".").filter((s) => s.trim());
    return sentences.slice(0, 3).map((s) => s.trim());
  }

  private generateTakeaways(content: string): string[] {
    return [
      "Consider the implications for your current workflow",
      "Review the proposed changes carefully",
      "Prepare for implementation phase",
    ];
  }

  private generateSlides(content: string): any[] {
    return [
      {
        title: "Introduction",
        bullets: ["Overview of topic", "Key objectives", "Expected outcomes"],
        notes: "Start with a brief introduction",
      },
      {
        title: "Main Points",
        bullets: ["Point 1: Key insight", "Point 2: Important detail", "Point 3: Critical factor"],
        notes: "Elaborate on each point",
      },
      {
        title: "Conclusion",
        bullets: ["Summary of findings", "Next steps", "Questions?"],
        notes: "Wrap up and open for discussion",
      },
    ];
  }

  private calculateCost(content: string, format: FormatType): string {
    // Simplified cost calculation
    const baseRates = {
      blog: 0.02,
      email: 0.01,
      summary: 0.015,
      presentation: 0.025,
    };

    const wordCount = content.split(/\s+/).length;
    const multiplier = Math.max(1, wordCount / 500);
    const cost = baseRates[format] * multiplier;

    return `$${cost.toFixed(3)}`;
  }

  private assessQuality(formatted: string): number {
    // Simple quality scoring
    const hasStructure = formatted.includes("#") || formatted.includes("**");
    const hasContent = formatted.length > 200;
    const hasSections = formatted.split("\n\n").length > 2;

    let score = 7.0;
    if (hasStructure) score += 1.0;
    if (hasContent) score += 1.0;
    if (hasSections) score += 0.5;

    return Math.min(9.5, score);
  }
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const body: FormatRequest = await request.json();

    // Validation
    if (!body.content || !body.outputFormat) {
      return NextResponse.json(
        { error: "Missing required fields: content and outputFormat" },
        { status: 400 },
      );
    }

    if (body.content.length > 10000) {
      return NextResponse.json(
        { error: "Content too long. Maximum 10,000 characters." },
        { status: 400 },
      );
    }

    // Format the content
    const formatter = new ContentFormatter();
    const result = await formatter.format(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Format API error:", error);
    return NextResponse.json({ error: "Failed to format content" }, { status: 500 });
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: "Format API is running",
    supportedFormats: ["blog", "email", "summary", "presentation"],
    endpoint: "POST /api/format",
    example: {
      content: "Your raw content here",
      outputFormat: "blog",
      options: {
        tone: "professional",
        length: "medium",
      },
    },
  });
}
