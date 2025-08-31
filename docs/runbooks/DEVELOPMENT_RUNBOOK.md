# Development Runbook - Harvest.ai

## 🚀 **Development Environment Setup**

### **Prerequisites**
- Node.js 18+ installed
- Git installed
- Code editor (VS Code recommended)
- OpenAI API key

### **Initial Setup**
```bash
# 1. Clone repository
git clone <repository-url>
cd Harvest.ai

# 2. Install dependencies
cd frontend
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# 4. Start development server
npm run dev
```

### **Environment Variables**
```bash
# Required for development
OPENAI_API_KEY=sk-your_openai_api_key_here

# Optional for enhanced features (if using Redis)
# REDIS_URL=redis://...

# Development configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🏗 **Project Structure**

### **Frontend Architecture**
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── generate/      # Content generation API
│   │   │   └── health/        # Health check API
│   │   ├── demo/              # Demo page
│   │   ├── code/              # Code documentation
│   │   ├── system/            # System architecture
│   │   ├── roadmap/           # Development roadmap
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   ├── lib/                   # Utility functions
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── package.json               # Dependencies
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

### **Key Technologies**
- **Next.js 15.5.0** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **OpenAI API** - AI content generation
- **Redis** - Caching and rate limiting

## 📝 **Coding Standards**

### **TypeScript Guidelines**
```typescript
// Use strict TypeScript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Define interfaces for all data structures
interface GenerateRequest {
  input: string;
  format: 'blog' | 'summary' | 'email' | 'quiz';
  apiKey: string;
  options?: {
    tone?: string;
    length?: string;
    target_audience?: string;
  };
}

// Use proper error handling
try {
  const result = await generateContent(request);
  return result;
} catch (error) {
  console.error('Generation failed:', error);
  throw new Error('Content generation failed');
}
```

### **React Best Practices**
```typescript
// Use functional components with hooks
export default function DemoPage() {
  const [inputContent, setInputContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use proper dependency arrays
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []); // Empty dependency array for initialization
  
  // Handle async operations properly
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateContent(inputContent);
      setResult(result);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Component JSX */}
    </div>
  );
}
```

### **CSS/Tailwind Guidelines**
```css
/* Use Tailwind utility classes */
<div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-950 dark:to-gray-900">

/* Use consistent spacing */
<div className="p-4 md:p-6 lg:p-8">

/* Use semantic color names */
<div className="text-green-600 dark:text-green-400">Success</div>
<div className="text-red-600 dark:text-red-400">Error</div>

/* Use responsive design */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

## 🔧 **Development Workflow**

### **Feature Development**
```bash
# 1. Create feature branch
git checkout -b feature/new-content-format

# 2. Make changes
# Edit files, add tests, update documentation

# 3. Test locally
npm run dev
npm run test
npm run build

# 4. Commit changes
git add .
git commit -m "feat: add new content format"

# 5. Push and create PR
git push origin feature/new-content-format
# Create pull request on GitHub
```

### **API Development**
```typescript
// 1. Define interface
interface NewFormatRequest {
  input: string;
  format: 'new-format';
  apiKey: string;
  options?: Record<string, any>;
}

// 2. Add to API route
export async function POST(request: Request) {
  try {
    const body: NewFormatRequest = await request.json();
    
    // Validate input
    if (!body.input?.trim()) {
      return NextResponse.json(
        { error: 'Input content is required' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await generateNewFormat(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **Component Development**
```typescript
// 1. Create component file
// src/components/NewComponent.tsx

// 2. Define props interface
interface NewComponentProps {
  title: string;
  content: string;
  onAction?: () => void;
}

// 3. Implement component
export default function NewComponent({ title, content, onAction }: NewComponentProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{content}</p>
      {onAction && (
        <button 
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Action
        </button>
      )}
    </div>
  );
}
```

## 🧪 **Testing Strategy**

### **Unit Tests**
```typescript
// tests/api/generate.test.ts
import { POST } from '@/app/api/generate/route';

describe('Generate API', () => {
  it('should generate content successfully', async () => {
    const request = new Request('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: 'Test content',
        format: 'summary',
        apiKey: 'test-key'
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.result).toBeDefined();
  });
});
```

### **Component Tests**
```typescript
// tests/components/DemoPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import DemoPage from '@/app/demo/page';

describe('DemoPage', () => {
  it('should render demo interface', () => {
    render(<DemoPage />);
    
    expect(screen.getByText('Content Transformation Demo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your content here...')).toBeInTheDocument();
  });
  
  it('should handle content generation', async () => {
    render(<DemoPage />);
    
    const input = screen.getByPlaceholderText('Enter your content here...');
    const generateButton = screen.getByText('Generate Content');
    
    fireEvent.change(input, { target: { value: 'Test content' } });
    fireEvent.click(generateButton);
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });
});
```

### **E2E Tests**
```typescript
// tests/e2e/demo-flow.test.ts
import { test, expect } from '@playwright/test';

test('complete demo flow', async ({ page }) => {
  await page.goto('/demo');
  
  // Select format
  await page.click('[data-testid="format-blog"]');
  
  // Enter content
  await page.fill('[data-testid="content-input"]', 'Test content for blog post');
  
  // Enter API key
  await page.fill('[data-testid="api-key-input"]', 'test-key');
  
  // Generate content
  await page.click('[data-testid="generate-button"]');
  
  // Wait for result
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
  
  // Verify result
  const result = await page.textContent('[data-testid="result"]');
  expect(result).toContain('Test content');
});
```

## 🔍 **Code Review Process**

### **Review Checklist**
- [ ] **Functionality**: Does the code work as expected?
- [ ] **TypeScript**: Are types properly defined?
- [ ] **Error Handling**: Are errors handled gracefully?
- [ ] **Performance**: Is the code efficient?
- [ ] **Security**: Are there any security issues?
- [ ] **Accessibility**: Is the UI accessible?
- [ ] **Testing**: Are there adequate tests?
- [ ] **Documentation**: Is the code documented?

### **Review Comments**
```typescript
// Good: Specific and actionable
// Consider using a more specific type instead of 'any'
const options: any = request.body.options;

// Better:
interface GenerateOptions {
  tone?: 'professional' | 'casual' | 'formal';
  length?: 'short' | 'medium' | 'long';
}
const options: GenerateOptions = request.body.options;
```

## 🚀 **Deployment Process**

### **Pre-Deployment Checklist**
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] API keys valid
- [ ] Documentation updated
- [ ] Performance tested

### **Deployment Commands**
```bash
# Build application
npm run build

# Run tests
npm run test

# Deploy to staging
vercel --env staging

# Deploy to production
vercel --prod
```

## 📊 **Performance Guidelines**

### **Frontend Performance**
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handle click
}, [dependencies]);
```

### **API Performance**
```typescript
// Use caching for expensive operations
const cachedResult = await redis.get(cacheKey);
if (cachedResult) {
  return cachedResult;
}

// Use rate limiting
const rateLimit = await checkRateLimit(apiKey);
if (!rateLimit.allowed) {
  return new Response('Rate limit exceeded', { status: 429 });
}

// Use proper error handling
try {
  const result = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
    max_tokens: 1000
  });
  return result;
} catch (error) {
  console.error('OpenAI API error:', error);
  throw new Error('Content generation failed');
}
```

## 🔒 **Security Guidelines**

### **API Security**
```typescript
// Validate all inputs
if (!input?.trim() || input.length > 10000) {
  return new Response('Invalid input', { status: 400 });
}

// Sanitize user input
const sanitizedInput = input.replace(/<script>/gi, '');

// Use environment variables for secrets
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OpenAI API key not configured');
}

// Implement rate limiting
const rateLimit = await checkRateLimit(apiKey);
if (!rateLimit.allowed) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

### **Frontend Security**
```typescript
// Sanitize user input before display
const sanitizedContent = DOMPurify.sanitize(userContent);

// Use HTTPS in production
const apiUrl = process.env.NODE_ENV === 'production' 
  ? 'https://api.example.com' 
  : 'http://localhost:3000';

// Validate API responses
if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}
```

## 📚 **Documentation Standards**

### **Code Documentation**
```typescript
/**
 * Generates content in the specified format using OpenAI API
 * @param input - The input content to transform
 * @param format - The desired output format
 * @param apiKey - The OpenAI API key
 * @param options - Additional generation options
 * @returns Promise<GenerateResponse> - The generated content and metadata
 * @throws Error - If generation fails
 */
async function generateContent(
  input: string,
  format: ContentFormat,
  apiKey: string,
  options?: GenerateOptions
): Promise<GenerateResponse> {
  // Implementation
}
```

### **README Updates**
- Update README.md for new features
- Document API changes
- Update environment variables
- Add usage examples

## 🎯 **Quality Assurance**

### **Code Quality Tools**
```json
// package.json scripts
{
  "scripts": {
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "playwright test",
    "build": "next build",
    "dev": "next dev"
  }
}
```

### **Pre-commit Hooks**
```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Build check
npm run build
```

---

**Last Updated:** August 27, 2025  
**Version:** 1.0  
**Next Review:** September 27, 2025
