/**
 * Emergency Templates for Crisis Situations
 * These templates directly serve our North Star: 90-second useful draft
 */

export interface EmergencyTemplate {
  id: string;
  name: string;
  description: string;
  format: "email" | "letter" | "message" | "document";
  crisisKeywords: string[]; // Keywords that trigger this template
  estimatedTime: number; // Seconds to complete
  fields: TemplateField[];
  template: string; // The actual template with {{placeholders}}
  example?: string; // Example output for preview
}

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "date" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select type
  defaultValue?: string;
}

export const EMERGENCY_TEMPLATES: EmergencyTemplate[] = [
  {
    id: "resignation",
    name: "Professional Resignation",
    description: "Formal resignation letter with proper notice period",
    format: "letter",
    crisisKeywords: ["resign", "quit", "leaving", "notice", "two weeks"],
    estimatedTime: 45,
    fields: [
      { key: "yourName", label: "Your Name", type: "text", required: true },
      { key: "managerName", label: "Manager Name", type: "text", required: true },
      { key: "companyName", label: "Company", type: "text", required: true },
      { key: "position", label: "Your Position", type: "text", required: true },
      { key: "lastDay", label: "Last Day", type: "date", required: true },
      {
        key: "reason",
        label: "Reason (optional)",
        type: "textarea",
        required: false,
        placeholder: "Keep it professional and brief",
      },
    ],
    template: `Dear {{managerName}},

I am writing to formally notify you of my resignation from my position as {{position}} at {{companyName}}. My last day of work will be {{lastDay}}.

{{reason ? reason : 'I am grateful for the opportunities for professional growth that you have provided me during my time here. I have enjoyed working with the team and appreciate the support provided to me.'}}

During my remaining time, I will do everything possible to ensure a smooth transition. I am committed to completing my current projects and will assist in training my replacement as needed.

Thank you for the opportunity to be part of {{companyName}}. I wish you and the team continued success.

Sincerely,
{{yourName}}`,
    example: "Professional resignation letter with 2-week notice",
  },

  {
    id: "apology",
    name: "Professional Apology",
    description: "Sincere apology for workplace mistakes or misunderstandings",
    format: "email",
    crisisKeywords: ["sorry", "apology", "apologize", "mistake", "error", "wrong"],
    estimatedTime: 30,
    fields: [
      { key: "recipientName", label: "To", type: "text", required: true },
      {
        key: "incident",
        label: "What happened",
        type: "textarea",
        required: true,
        placeholder: "Brief description",
      },
      { key: "impact", label: "Impact/Consequences", type: "textarea", required: false },
      {
        key: "action",
        label: "Corrective action",
        type: "textarea",
        required: true,
        placeholder: "What you will do",
      },
    ],
    template: `Subject: Sincere Apology Regarding {{incident}}

Dear {{recipientName}},

I want to sincerely apologize for {{incident}}. I take full responsibility for my actions and understand that {{impact ? impact : 'this may have caused inconvenience or concern'}}.

I realize this was inappropriate and unprofessional. To prevent this from happening again, {{action}}.

I value our working relationship and the trust you've placed in me. I am committed to learning from this mistake and ensuring it does not happen again.

Please let me know if there's anything else I can do to make this right.

Sincerely,`,
  },

  {
    id: "urgent-update",
    name: "Urgent Status Update",
    description: "Quick update on critical project or deadline issue",
    format: "email",
    crisisKeywords: ["urgent", "update", "status", "delay", "problem", "issue", "blocked"],
    estimatedTime: 25,
    fields: [
      { key: "project", label: "Project/Task", type: "text", required: true },
      {
        key: "status",
        label: "Current Status",
        type: "select",
        required: true,
        options: ["On Track", "At Risk", "Delayed", "Blocked"],
      },
      { key: "issue", label: "Issue/Challenge", type: "textarea", required: true },
      { key: "solution", label: "Proposed Solution", type: "textarea", required: true },
      { key: "newTimeline", label: "Revised Timeline", type: "text", required: false },
    ],
    template: `Subject: URGENT: {{project}} - Status Update

Team,

I need to provide an urgent update on {{project}}.

**Current Status:** {{status}}

**Issue:** {{issue}}

**Proposed Solution:** {{solution}}

{{newTimeline ? '**Revised Timeline:** ' + newTimeline : ''}}

I am actively working on this and will provide another update by end of day. Please let me know if you need any additional information or have concerns about this approach.

Best regards,`,
  },

  {
    id: "sick-day",
    name: "Sick Day Notice",
    description: "Professional sick leave notification",
    format: "email",
    crisisKeywords: ["sick", "unwell", "ill", "doctor", "medical", "health"],
    estimatedTime: 20,
    fields: [
      { key: "managerName", label: "Manager Name", type: "text", required: true },
      { key: "returnDate", label: "Expected Return", type: "date", required: false },
      {
        key: "coverage",
        label: "Coverage/Handoff",
        type: "textarea",
        required: false,
        placeholder: "Who is covering your work?",
      },
    ],
    template: `Subject: Sick Day - Out of Office

Hi {{managerName}},

I am feeling unwell today and will not be able to come to work. {{returnDate ? 'I expect to return on ' + returnDate + ', but will keep you updated if this changes.' : 'I will keep you updated on my condition and expected return date.'}}

{{coverage ? coverage : 'I will check email periodically if there are any urgent matters, but response may be delayed.'}}

I apologize for any inconvenience this may cause.

Thank you for understanding.

Best regards,`,
  },

  {
    id: "deadline-extension",
    name: "Deadline Extension Request",
    description: "Professional request for more time on a project",
    format: "email",
    crisisKeywords: ["extension", "deadline", "more time", "delay", "extend", "postpone"],
    estimatedTime: 35,
    fields: [
      { key: "project", label: "Project Name", type: "text", required: true },
      { key: "currentDeadline", label: "Current Deadline", type: "date", required: true },
      { key: "requestedDeadline", label: "Requested Deadline", type: "date", required: true },
      { key: "reason", label: "Reason for Extension", type: "textarea", required: true },
      {
        key: "progress",
        label: "Current Progress",
        type: "text",
        required: true,
        placeholder: "e.g., 75% complete",
      },
    ],
    template: `Subject: Extension Request for {{project}}

Dear Team,

I am writing to request an extension for {{project}}, currently due on {{currentDeadline}}.

**Current Progress:** {{progress}}

**Reason for Extension:** {{reason}}

**Requested New Deadline:** {{requestedDeadline}}

I understand the importance of meeting deadlines and apologize for this request. The additional time will ensure I can deliver high-quality work that meets our standards. I am committed to minimizing any impact on dependent tasks or team members.

Please let me know if this extension is possible or if you'd like to discuss alternative solutions.

Thank you for your consideration.

Best regards,`,
  },
];

/**
 * Detect which emergency template to suggest based on input
 */
export function detectEmergencyTemplate(input: string): EmergencyTemplate | null {
  const lowerInput = input.toLowerCase();

  for (const template of EMERGENCY_TEMPLATES) {
    const hasKeyword = template.crisisKeywords.some((keyword) => lowerInput.includes(keyword));
    if (hasKeyword) {
      return template;
    }
  }

  return null;
}

/**
 * Check if input indicates a crisis situation
 */
export function isCrisisSituation(input: string): boolean {
  const crisisIndicators = [
    "urgent",
    "asap",
    "emergency",
    "help",
    "now",
    "today",
    "tomorrow",
    "immediately",
    "deadline",
    "critical",
    "quickly",
    "fast",
  ];

  const lowerInput = input.toLowerCase();
  return crisisIndicators.some((indicator) => lowerInput.includes(indicator));
}

/**
 * Fill template with user-provided values
 */
export function fillTemplate(template: string, values: Record<string, string>): string {
  let filled = template;

  // Handle conditional sections first (ternary-like syntax)
  filled = filled.replace(
    /{{(\w+)\s*\?\s*([^:]+)\s*:\s*'([^']+)'}}/g,
    (match, key, truthy, falsy) => {
      return values[key] ? truthy.replace(key, values[key]) : falsy;
    },
  );

  // Handle simple replacements
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    filled = filled.replace(regex, value || "");
  });

  return filled;
}

/**
 * Get time estimate for crisis situation
 */
export function getCrisisTimeEstimate(template: EmergencyTemplate | null): {
  fillTime: number; // Time to fill in fields
  generateTime: number; // Time to generate
  totalTime: number; // Total estimated time
} {
  if (!template) {
    return { fillTime: 30, generateTime: 30, totalTime: 60 };
  }

  const fillTime = template.fields.filter((f) => f.required).length * 5; // 5 seconds per required field
  const generateTime = template.estimatedTime;

  return {
    fillTime,
    generateTime,
    totalTime: fillTime + generateTime,
  };
}
