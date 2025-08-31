/**
 * Template Generator Service
 * Analyzes user content and generates reusable templates
 */

export interface ContentAnalysis {
  structure: string[];
  style: {
    tone: string;
    formality: string;
    perspective: string;
  };
  patterns: string[];
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  description: string;
  example: string;
  type: "text" | "number" | "date" | "list" | "paragraph";
}

export interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: TemplateVariable[];
  examples: string[];
  metadata: {
    sourceContent?: string;
    generatedAt: Date;
    tone: string;
    useCase: string;
  };
}

export class TemplateGenerator {
  /**
   * Generate a template from user's content
   * This extracts patterns and creates a reusable template
   */
  async generateFromContent(
    content: string,
    options?: {
      name?: string;
      category?: string;
      provider?: "openai" | "anthropic";
      model?: string;
    },
  ): Promise<GeneratedTemplate> {
    // Step 1: Analyze the content structure
    const analysis = await this.analyzeContent(content, options?.provider, options?.model);

    // Step 2: Extract variable patterns
    const variables = this.extractVariables(content, analysis);

    // Step 3: Generate the template
    const template = this.createTemplate(content, variables);

    // Step 4: Generate examples
    const examples = this.generateExamples(template, variables);

    return {
      id: `template-${Date.now()}`,
      name: options?.name || this.inferTemplateName(analysis),
      description: this.generateDescription(analysis),
      category: options?.category || this.inferCategory(analysis),
      template,
      variables,
      examples,
      metadata: {
        sourceContent: content.substring(0, 500), // Store preview
        generatedAt: new Date(),
        tone: analysis.style.tone,
        useCase: this.inferUseCase(analysis),
      },
    };
  }

  /**
   * Analyze content using AI to understand structure and patterns
   */
  private async analyzeContent(
    content: string,
    provider: string = "openai",
    model: string = "gpt-3.5-turbo",
  ): Promise<ContentAnalysis> {
    const prompt = `Analyze this content and identify:
1. The structure and sections
2. The writing style (tone, formality, perspective)
3. Repeated patterns or formats
4. Variables that could be extracted (like names, dates, products, etc.)

Content:
"""
${content}
"""

Provide a structured analysis in JSON format.`;

    // Call the AI API through our gateway
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model,
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing writing patterns and creating templates.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3, // Low temperature for consistent analysis
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to analyze content");
    }

    const data = await response.json();

    // Parse the AI response
    try {
      return JSON.parse(data.content);
    } catch {
      // Fallback to basic analysis if AI response isn't valid JSON
      return this.basicContentAnalysis(content);
    }
  }

  /**
   * Basic content analysis without AI
   */
  private basicContentAnalysis(content: string): ContentAnalysis {
    const lines = content.split("\n");
    const sentences = content.split(/[.!?]+/);

    return {
      structure: this.identifyStructure(lines),
      style: {
        tone: this.detectTone(content),
        formality: this.detectFormality(content),
        perspective: this.detectPerspective(content),
      },
      patterns: this.findPatterns(lines),
      variables: this.findPotentialVariables(content),
    };
  }

  /**
   * Extract variables from content
   */
  private extractVariables(content: string, analysis: ContentAnalysis): TemplateVariable[] {
    const variables: TemplateVariable[] = [];

    // Find bracketed placeholders [like this]
    const bracketPattern = /\[([^\]]+)\]/g;
    const brackets = content.matchAll(bracketPattern);
    for (const match of brackets) {
      variables.push({
        name: match[1].toLowerCase().replace(/\s+/g, "_"),
        description: match[1],
        example: match[1],
        type: "text",
      });
    }

    // Find common variable patterns
    const patterns = [
      { regex: /\b\d{4}-\d{2}-\d{2}\b/g, type: "date", name: "date" },
      { regex: /\$[\d,]+\.?\d*/g, type: "number", name: "price" },
      { regex: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, type: "text", name: "name" },
      { regex: /\b\w+@\w+\.\w+\b/g, type: "text", name: "email" },
      { regex: /https?:\/\/[^\s]+/g, type: "text", name: "url" },
    ];

    patterns.forEach(({ regex, type, name }) => {
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        if (!variables.find((v) => v.name === name)) {
          variables.push({
            name,
            description: `${name} field`,
            example: matches[0],
            type: type as TemplateVariable["type"],
          });
        }
      }
    });

    // Add variables from AI analysis
    if (analysis.variables) {
      analysis.variables.forEach((v) => {
        if (!variables.find((existing) => existing.name === v.name)) {
          variables.push(v);
        }
      });
    }

    return variables;
  }

  /**
   * Create template with variable placeholders
   */
  private createTemplate(content: string, variables: TemplateVariable[]): string {
    let template = content;

    // Replace identified variables with placeholders
    variables.forEach((variable) => {
      if (variable.example) {
        // Escape special regex characters in the example
        const escapedExample = variable.example.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(escapedExample, "g");
        template = template.replace(regex, `{{${variable.name}}}`);
      }
    });

    // Add section markers for better structure
    template = this.addSectionMarkers(template);

    return template;
  }

  /**
   * Generate example uses of the template
   */
  private generateExamples(template: string, variables: TemplateVariable[]): string[] {
    const examples: string[] = [];

    // Generate 3 examples with different variable values
    for (let i = 0; i < 3; i++) {
      let example = template;
      variables.forEach((variable) => {
        const value = this.generateExampleValue(variable, i);
        example = example.replace(new RegExp(`{{${variable.name}}}`, "g"), value);
      });
      examples.push(example);
    }

    return examples;
  }

  /**
   * Generate example values for variables
   */
  private generateExampleValue(variable: TemplateVariable, index: number): string {
    const examples: Record<string, string[]> = {
      name: ["John Smith", "Sarah Johnson", "Michael Chen"],
      company: ["TechCorp", "InnovateCo", "FutureSoft"],
      product: ["CloudSync Pro", "DataFlow Analytics", "SecureVault Plus"],
      date: ["2024-01-15", "2024-02-20", "2024-03-10"],
      email: ["john@example.com", "sarah@company.com", "michael@business.org"],
      price: ["$99.99", "$149.00", "$199.99"],
      url: ["https://example.com", "https://company.com", "https://product.io"],
    };

    const exampleSet = examples[variable.name] || examples[variable.type] || [];
    return exampleSet[index] || variable.example || `[${variable.name}]`;
  }

  // Helper methods
  private identifyStructure(lines: string[]): string[] {
    const structure: string[] = [];

    lines.forEach((line) => {
      if (line.startsWith("#")) structure.push("heading");
      else if (line.startsWith("-") || line.startsWith("*")) structure.push("list");
      else if (line.match(/^\d+\./)) structure.push("numbered-list");
      else if (line.length > 100) structure.push("paragraph");
      else if (line.length === 0) structure.push("break");
    });

    return structure;
  }

  private detectTone(content: string): string {
    const formalWords = /\b(therefore|furthermore|however|nevertheless|accordingly)\b/gi;
    const casualWords = /\b(hey|cool|awesome|yeah|stuff|things)\b/gi;

    const formalCount = (content.match(formalWords) || []).length;
    const casualCount = (content.match(casualWords) || []).length;

    if (formalCount > casualCount * 2) return "formal";
    if (casualCount > formalCount * 2) return "casual";
    return "neutral";
  }

  private detectFormality(content: string): string {
    const contractions = /\b(don't|won't|can't|isn't|aren't|wouldn't|couldn't)\b/gi;
    const hasContractions = contractions.test(content);

    return hasContractions ? "informal" : "formal";
  }

  private detectPerspective(content: string): string {
    const firstPerson = /\b(I|me|my|we|our|us)\b/gi;
    const secondPerson = /\b(you|your|yours)\b/gi;

    const firstCount = (content.match(firstPerson) || []).length;
    const secondCount = (content.match(secondPerson) || []).length;

    if (firstCount > secondCount) return "first-person";
    if (secondCount > firstCount) return "second-person";
    return "third-person";
  }

  private findPatterns(lines: string[]): string[] {
    const patterns: string[] = [];

    // Look for repeated structures
    const lineStarts = lines.map((l) => l.trim().split(" ")[0]).filter(Boolean);
    const startCounts: Record<string, number> = {};

    lineStarts.forEach((start) => {
      startCounts[start] = (startCounts[start] || 0) + 1;
    });

    Object.entries(startCounts).forEach(([start, count]) => {
      if (count >= 3) {
        patterns.push(`Repeated ${start} structure`);
      }
    });

    return patterns;
  }

  private findPotentialVariables(content: string): TemplateVariable[] {
    const variables: TemplateVariable[] = [];

    // Look for capitalized phrases that might be names/companies
    const properNouns = content.match(/\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g) || [];
    const nounCounts: Record<string, number> = {};

    properNouns.forEach((noun) => {
      nounCounts[noun] = (nounCounts[noun] || 0) + 1;
    });

    Object.entries(nounCounts).forEach(([noun, count]) => {
      if (count >= 2) {
        variables.push({
          name: noun.toLowerCase().replace(/\s+/g, "_"),
          description: `${noun} reference`,
          example: noun,
          type: "text",
        });
      }
    });

    return variables;
  }

  private addSectionMarkers(template: string): string {
    const lines = template.split("\n");
    const processedLines: string[] = [];

    lines.forEach((line, index) => {
      // Add comments for section breaks
      if (index > 0 && line.startsWith("#") && !lines[index - 1].startsWith("#")) {
        processedLines.push("<!-- Section Break -->");
      }
      processedLines.push(line);
    });

    return processedLines.join("\n");
  }

  private inferTemplateName(analysis: ContentAnalysis): string {
    const { style, structure } = analysis;
    const names: Record<string, string> = {
      "formal-paragraph": "Professional Document",
      "casual-list": "Casual List",
      "neutral-mixed": "General Template",
    };

    const key = `${style.tone}-${structure[0] || "mixed"}`;
    return names[key] || "Custom Template";
  }

  private generateDescription(analysis: ContentAnalysis): string {
    return `A ${analysis.style.tone} template written in ${analysis.style.perspective} perspective`;
  }

  private inferCategory(analysis: ContentAnalysis): string {
    const { patterns, style } = analysis;

    if (patterns.some((p) => p.includes("email"))) return "Email";
    if (patterns.some((p) => p.includes("blog"))) return "Blog";
    if (style.formality === "formal") return "Business";
    return "General";
  }

  private inferUseCase(analysis: ContentAnalysis): string {
    const { style, patterns } = analysis;

    if (patterns.length > 0) return patterns[0];
    return `${style.tone} writing`;
  }
}

// Export singleton instance
export const templateGenerator = new TemplateGenerator();
