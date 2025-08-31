/**
 * E2E Test Selectors and Helpers
 * Centralized selectors for consistent E2E testing
 */

export const selectors = {
  // Navigation
  nav: {
    container: '[data-testid="navigation"]',
    logo: '[data-testid="nav-logo"]',
    homeLink: '[data-testid="nav-home"]',
    demoLink: '[data-testid="nav-demo"]',
    systemLink: '[data-testid="nav-system"]',
    roadmapLink: '[data-testid="nav-roadmap"]',
    docsLink: '[data-testid="nav-docs"]',
    darkModeToggle: '[data-testid="dark-mode-toggle"]',
    mobileMenuToggle: '[data-testid="mobile-menu-toggle"]',
    mobileMenu: '[data-testid="mobile-menu"]',
  },

  // Home Page
  home: {
    heroSection: '[data-testid="hero-section"]',
    heroTitle: '[data-testid="hero-title"]',
    heroSubtitle: '[data-testid="hero-subtitle"]',
    ctaButton: '[data-testid="cta-button"]',
    demoSection: '[data-testid="demo-section"]',
    featuresSection: '[data-testid="features-section"]',
  },

  // Demo Page
  demo: {
    container: '[data-testid="demo-container"]',
    inputField: '[data-testid="demo-input"]',
    formatSelect: '[data-testid="format-select"]',
    generateButton: '[data-testid="generate-button"]',
    output: '[data-testid="generated-output"]',
    copyButton: '[data-testid="copy-button"]',
    downloadButton: '[data-testid="download-button"]',
    shareButton: '[data-testid="share-button"]',
    progressBar: '[data-testid="progress-bar"]',
    streamingOutput: '[data-testid="streaming-output"]',
  },

  // Authentication
  auth: {
    loginForm: '[data-testid="login-form"]',
    signupForm: '[data-testid="signup-form"]',
    emailInput: '[data-testid="auth-email"]',
    passwordInput: '[data-testid="auth-password"]',
    submitButton: '[data-testid="auth-submit"]',
    errorMessage: '[data-testid="auth-error"]',
    successMessage: '[data-testid="auth-success"]',
    googleButton: '[data-testid="auth-google"]',
    githubButton: '[data-testid="auth-github"]',
  },

  // BYOK (Bring Your Own Key)
  byok: {
    container: '[data-testid="byok-container"]',
    addKeyButton: '[data-testid="add-key-button"]',
    keyNameInput: '[data-testid="key-name"]',
    keyValueInput: '[data-testid="key-value"]',
    providerSelect: '[data-testid="provider-select"]',
    saveButton: '[data-testid="save-key-button"]',
    keysList: '[data-testid="keys-list"]',
    deleteKeyButton: '[data-testid="delete-key"]',
  },

  // Templates
  templates: {
    container: '[data-testid="templates-container"]',
    templateCard: '[data-testid="template-card"]',
    crisisTemplate: '[data-testid="template-crisis"]',
    blogTemplate: '[data-testid="template-blog"]',
    emailTemplate: '[data-testid="template-email"]',
    useTemplateButton: '[data-testid="use-template"]',
  },

  // System Status
  system: {
    container: '[data-testid="system-status"]',
    healthCheck: '[data-testid="health-check"]',
    apiStatus: '[data-testid="api-status"]',
    dbStatus: '[data-testid="db-status"]',
    cacheStatus: '[data-testid="cache-status"]',
    aiStatus: '[data-testid="ai-status"]',
    uptimeMetric: '[data-testid="uptime-metric"]',
    responseTimeMetric: '[data-testid="response-time"]',
    errorRateMetric: '[data-testid="error-rate"]',
  },

  // Epic Management
  epics: {
    container: '[data-testid="epics-container"]',
    epicCard: '[data-testid="epic-card"]',
    createButton: '[data-testid="create-epic"]',
    titleInput: '[data-testid="epic-title"]',
    descriptionInput: '[data-testid="epic-description"]',
    statusSelect: '[data-testid="epic-status"]',
    prioritySelect: '[data-testid="epic-priority"]',
    progressBar: '[data-testid="epic-progress"]',
  },

  // Footer
  footer: {
    container: '[data-testid="footer"]',
    copyright: '[data-testid="footer-copyright"]',
    quickLinks: '[data-testid="footer-links"]',
    statusSection: '[data-testid="footer-status"]',
  },

  // Common UI Elements
  ui: {
    loading: '[data-testid="loading"]',
    error: '[data-testid="error-message"]',
    success: '[data-testid="success-message"]',
    modal: '[data-testid="modal"]',
    modalClose: '[data-testid="modal-close"]',
    toast: '[data-testid="toast"]',
  },
};

/**
 * Helper functions for common E2E operations
 */
export const helpers = {
  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(page: any, selector: string, options = {}) {
    const element = page.locator(selector);
    await element.waitFor({ state: "visible", ...options });
    await element.waitFor({ state: "stable", ...options });
    return element;
  },

  /**
   * Fill form with data
   */
  async fillForm(page: any, formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await page.fill(selector, value);
    }
  },

  /**
   * Check if element has expected text
   */
  async expectText(page: any, selector: string, text: string | RegExp) {
    const element = page.locator(selector);
    await expect(element).toContainText(text);
  },

  /**
   * Login helper
   */
  async login(page: any, email: string, password: string) {
    await page.fill(selectors.auth.emailInput, email);
    await page.fill(selectors.auth.passwordInput, password);
    await page.click(selectors.auth.submitButton);
    await page.waitForSelector(selectors.auth.successMessage);
  },

  /**
   * Generate content helper
   */
  async generateContent(page: any, input: string, format: string) {
    await page.fill(selectors.demo.inputField, input);
    await page.selectOption(selectors.demo.formatSelect, format);
    await page.click(selectors.demo.generateButton);
    await page.waitForSelector(selectors.demo.output);
  },

  /**
   * Add API key helper
   */
  async addApiKey(page: any, name: string, key: string, provider: string) {
    await page.click(selectors.byok.addKeyButton);
    await page.fill(selectors.byok.keyNameInput, name);
    await page.fill(selectors.byok.keyValueInput, key);
    await page.selectOption(selectors.byok.providerSelect, provider);
    await page.click(selectors.byok.saveButton);
  },

  /**
   * Toggle dark mode
   */
  async toggleDarkMode(page: any) {
    await page.click(selectors.nav.darkModeToggle);
    // Wait for theme transition
    await page.waitForTimeout(300);
  },

  /**
   * Check system health
   */
  async checkSystemHealth(page: any) {
    await page.goto("/system");
    const statuses = {
      api: await page.locator(selectors.system.apiStatus).textContent(),
      db: await page.locator(selectors.system.dbStatus).textContent(),
      cache: await page.locator(selectors.system.cacheStatus).textContent(),
      ai: await page.locator(selectors.system.aiStatus).textContent(),
    };
    return statuses;
  },

  /**
   * Use template
   */
  async useTemplate(page: any, templateType: string) {
    const templateSelector = selectors.templates[`${templateType}Template`];
    await page.click(templateSelector);
    await page.click(selectors.templates.useTemplateButton);
  },

  /**
   * Wait for SSE streaming
   */
  async waitForStreaming(page: any) {
    await page.waitForSelector(selectors.demo.progressBar);
    await page.waitForSelector(selectors.demo.streamingOutput);
    // Wait for streaming to complete
    await page.waitForSelector(selectors.demo.output, { timeout: 30000 });
  },
};

// For Playwright's expect
declare global {
  const expect: any;
}
