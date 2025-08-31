# 🚀 Harvest.ai User Journeys & Flows

## Table of Contents

1. [Authentication Journeys](#authentication-journeys)
2. [Content Generation Journeys](#content-generation-journeys)
3. [Team Collaboration Journeys](#team-collaboration-journeys)
4. [Subscription Management](#subscription-management)
5. [API Integration Journey](#api-integration-journey)
6. [Error Recovery Flows](#error-recovery-flows)

---

## Authentication Journeys

### 🔐 New User Registration Flow

```mermaid
graph LR
    A[Landing Page] --> B{User Action}
    B -->|Sign Up| C[Registration Form]
    C --> D[Enter Details]
    D --> E{Validation}
    E -->|Valid| F[Create Account]
    E -->|Invalid| G[Show Errors]
    G --> D
    F --> H[Send Verification Email]
    H --> I[Show Success Message]
    I --> J[User Checks Email]
    J --> K[Click Verification Link]
    K --> L[Account Verified]
    L --> M[Auto-Login]
    M --> N[Onboarding]
    N --> O[Dashboard]
```

#### Steps:

1. **Landing** - User arrives at harvest.ai
2. **Sign Up Click** - User clicks "Get Started" or "Sign Up"
3. **Form Entry** - User enters:
   - Email address
   - Password (min 8 chars, 1 number, 1 special)
   - Name (optional)
   - Marketing consent (checkbox)
4. **Validation** - Real-time validation:
   - Email format check
   - Password strength meter
   - Duplicate email check
5. **Account Creation** - Backend processing:
   - Create user record
   - Generate verification token
   - Send welcome email
6. **Email Verification** - User action:
   - Check inbox
   - Click verification link
   - Auto-redirect to app
7. **Onboarding** - First-time setup:
   - Choose use case
   - Set preferences
   - Skip or complete profile

### 🔑 Returning User Login Flow

```mermaid
graph LR
    A[Landing/Login Page] --> B[Enter Credentials]
    B --> C{Auth Check}
    C -->|Success| D[Load Session]
    C -->|Failure| E[Show Error]
    C -->|2FA Required| F[2FA Screen]
    E --> B
    F --> G[Enter Code]
    G --> H{Verify Code}
    H -->|Valid| D
    H -->|Invalid| I[Retry]
    D --> J[Dashboard]
```

### 🔄 Password Reset Flow

```mermaid
graph LR
    A[Login Page] --> B[Forgot Password]
    B --> C[Enter Email]
    C --> D[Send Reset Link]
    D --> E[Check Email]
    E --> F[Click Reset Link]
    F --> G[New Password Form]
    G --> H[Set Password]
    H --> I[Confirm Change]
    I --> J[Auto-Login]
```

### 🔗 Social Authentication Flow

```mermaid
graph LR
    A[Login Page] --> B{Provider}
    B -->|Google| C[Google OAuth]
    B -->|GitHub| D[GitHub OAuth]
    B -->|Microsoft| E[MS OAuth]
    C --> F[Consent Screen]
    D --> F
    E --> F
    F --> G{User Approves}
    G -->|Yes| H[Create/Link Account]
    G -->|No| I[Return to Login]
    H --> J[Dashboard]
```

---

## Content Generation Journeys

### 📝 Basic Content Generation Flow

```mermaid
graph TB
    A[Dashboard] --> B[New Generation]
    B --> C[Select Format]
    C --> D[Input Content]
    D --> E[Configure Options]
    E --> F[Select AI Model]
    F --> G[Generate]
    G --> H{Processing}
    H -->|Streaming| I[Show Progress]
    I --> J[Display Result]
    H -->|Error| K[Error Handler]
    K --> L[Retry Option]
    J --> M{User Action}
    M -->|Edit| N[Editor Mode]
    M -->|Regenerate| G
    M -->|Export| O[Export Dialog]
    M -->|Save| P[Save to History]
```

#### Detailed Steps:

1. **Format Selection**
   - Blog Post
   - Email
   - Summary
   - Quiz
   - Presentation
   - Social Media
   - Custom

2. **Content Input**
   - Paste text
   - Upload file
   - Enter URL
   - Voice input
   - Import from history

3. **Configuration Options**
   - Tone: Professional/Casual/Formal/Creative
   - Length: Short/Medium/Long/Custom
   - Language: 50+ languages
   - Style: Informative/Persuasive/Narrative
   - Audience: General/Technical/Academic

4. **AI Model Selection**
   - GPT-4 (Advanced)
   - GPT-3.5 (Fast)
   - Claude 3 Opus (Creative)
   - Claude 3 Sonnet (Balanced)

5. **Generation Process**
   - Show loading spinner
   - Stream partial results
   - Display word count
   - Show estimated time

6. **Result Actions**
   - Edit in place
   - Copy to clipboard
   - Download file
   - Share link
   - Save to templates

### 🔄 Batch Generation Flow

```mermaid
graph TB
    A[Batch Mode] --> B[Upload CSV/JSON]
    B --> C[Map Fields]
    C --> D[Preview Batch]
    D --> E[Configure Each]
    E --> F[Start Batch]
    F --> G[Progress Bar]
    G --> H[Complete]
    H --> I[Download All]
```

### 📚 Template Usage Flow

```mermaid
graph LR
    A[Templates] --> B[Browse/Search]
    B --> C[Select Template]
    C --> D[Fill Variables]
    D --> E[Preview]
    E --> F[Generate]
    F --> G[Customize Result]
```

---

## Team Collaboration Journeys

### 👥 Team Creation Flow

```mermaid
graph TB
    A[User Dashboard] --> B[Create Team]
    B --> C[Team Details]
    C --> D[Invite Members]
    D --> E[Set Permissions]
    E --> F[Configure Settings]
    F --> G[Team Created]
    G --> H[Team Dashboard]
```

#### Permission Levels:

- **Owner** - Full control
- **Admin** - Manage team, content
- **Editor** - Create, edit content
- **Viewer** - Read-only access

### 🤝 Member Invitation Flow

```mermaid
graph LR
    A[Team Settings] --> B[Invite Member]
    B --> C[Enter Email]
    C --> D[Set Role]
    D --> E[Send Invite]
    E --> F[Email Sent]
    F --> G[Member Accepts]
    G --> H[Join Team]
```

### 📊 Shared Content Flow

```mermaid
graph TB
    A[Generate Content] --> B{Share?}
    B -->|Yes| C[Select Team]
    C --> D[Set Permissions]
    D --> E[Share]
    E --> F[Notify Team]
    F --> G[Team Access]
```

---

## Subscription Management

### 💳 Upgrade to Pro Flow

```mermaid
graph TB
    A[Free User] --> B[Hit Limit]
    B --> C[Upgrade Prompt]
    C --> D[View Plans]
    D --> E[Select Pro]
    E --> F[Payment Form]
    F --> G{Payment Method}
    G -->|Card| H[Enter Card]
    G -->|PayPal| I[PayPal Auth]
    G -->|Crypto| J[Crypto Gateway]
    H --> K[Process Payment]
    I --> K
    J --> K
    K -->|Success| L[Activate Pro]
    K -->|Failed| M[Error + Retry]
    L --> N[Pro Features]
```

### 📊 Usage Monitoring Flow

```mermaid
graph LR
    A[Dashboard] --> B[Usage Widget]
    B --> C[Click Details]
    C --> D[Usage Page]
    D --> E{View}
    E -->|Daily| F[Daily Chart]
    E -->|Weekly| G[Weekly Chart]
    E -->|Monthly| H[Monthly Chart]
```

### 🔄 Plan Management Flow

```mermaid
graph TB
    A[Account Settings] --> B[Subscription]
    B --> C{Action}
    C -->|Upgrade| D[Higher Plan]
    C -->|Downgrade| E[Lower Plan]
    C -->|Cancel| F[Cancel Flow]
    D --> G[Payment]
    E --> H[Confirm Changes]
    F --> I[Retention Offer]
    I -->|Accept| J[Keep Plan]
    I -->|Decline| K[Schedule Cancel]
```

---

## API Integration Journey

### 🔌 API Key Generation Flow

```mermaid
graph LR
    A[Developer Settings] --> B[API Keys]
    B --> C[Generate New]
    C --> D[Name Key]
    D --> E[Set Permissions]
    E --> F[Create]
    F --> G[Show Key Once]
    G --> H[Copy Key]
    H --> I[Confirm Saved]
```

### 🚀 API Usage Flow

```mermaid
graph TB
    A[Get API Key] --> B[Read Docs]
    B --> C[Test Endpoint]
    C --> D{Response}
    D -->|Success| E[Implement]
    D -->|Error| F[Debug]
    F --> G[Check Key]
    G --> H[Check Limits]
    H --> C
    E --> I[Production Use]
```

### 📈 API Monitoring Flow

```mermaid
graph LR
    A[API Dashboard] --> B{Metrics}
    B -->|Requests| C[Request Count]
    B -->|Errors| D[Error Rate]
    B -->|Latency| E[Response Time]
    B -->|Usage| F[Token Usage]
```

---

## Error Recovery Flows

### ⚠️ Generation Error Recovery

```mermaid
graph TB
    A[Generation Error] --> B{Error Type}
    B -->|Network| C[Retry Button]
    B -->|Rate Limit| D[Wait Timer]
    B -->|Invalid Input| E[Edit Input]
    B -->|Server Error| F[Contact Support]
    C --> G[Retry Generation]
    D --> H[Show Countdown]
    E --> I[Fix & Retry]
    F --> J[Support Ticket]
```

### 🔧 Payment Error Recovery

```mermaid
graph TB
    A[Payment Failed] --> B{Reason}
    B -->|Declined| C[Try Other Card]
    B -->|Expired| D[Update Card]
    B -->|Insufficient| E[Check Balance]
    B -->|3DS| F[Complete Auth]
    C --> G[New Payment]
    D --> G
    E --> H[Wait/Top-up]
    F --> I[Bank Redirect]
```

### 🔄 Session Recovery Flow

```mermaid
graph LR
    A[Session Expired] --> B[Show Modal]
    B --> C{User Action}
    C -->|Re-login| D[Login Form]
    C -->|Continue as Guest| E[Limited Mode]
    D --> F[Restore Session]
    F --> G[Resume Activity]
```

---

## User State Transitions

### 📊 User Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> Visitor
    Visitor --> Registered: Sign Up
    Registered --> Verified: Email Confirm
    Verified --> Active: First Generation
    Active --> PowerUser: 10+ Generations
    Active --> Inactive: 30 Days No Use
    Inactive --> Active: Return
    Active --> Pro: Upgrade
    Pro --> Churned: Cancel
    Churned --> Active: Reactivate
    PowerUser --> Pro: Upgrade
    Pro --> Enterprise: Scale Up
```

### 🎯 Feature Discovery Flow

```mermaid
graph TB
    A[New User] --> B[Basic Features]
    B --> C{Usage}
    C -->|Low| D[Show Tips]
    C -->|Medium| E[Suggest Features]
    C -->|High| F[Advanced Tools]
    D --> G[Onboarding Tours]
    E --> H[Feature Highlights]
    F --> I[Pro Upsell]
```

---

## Mobile-Specific Flows

### 📱 Mobile Generation Flow

```mermaid
graph TB
    A[Mobile Home] --> B[Quick Action]
    B --> C{Input Method}
    C -->|Voice| D[Record Audio]
    C -->|Camera| E[Scan Text]
    C -->|Type| F[Mobile Keyboard]
    D --> G[Process]
    E --> G
    F --> G
    G --> H[Generate]
    H --> I[Mobile View]
    I --> J{Action}
    J -->|Share| K[Share Sheet]
    J -->|Save| L[Local Storage]
```

### 📲 Mobile Authentication

```mermaid
graph LR
    A[App Launch] --> B{Biometric?}
    B -->|Available| C[FaceID/TouchID]
    B -->|Not Available| D[PIN/Password]
    C --> E[Authenticate]
    D --> E
    E -->|Success| F[App Home]
    E -->|Fail| G[Retry]
```

---

## Analytics & Tracking Events

### 📈 Key User Events

| Event                | Category      | Properties                  | Purpose           |
| -------------------- | ------------- | --------------------------- | ----------------- |
| page_view            | Navigation    | page_name, referrer         | Track navigation  |
| sign_up_started      | Auth          | source, method              | Conversion funnel |
| sign_up_completed    | Auth          | user_id, method             | Success rate      |
| generation_started   | Content       | format, model, length       | Usage patterns    |
| generation_completed | Content       | format, model, time, tokens | Performance       |
| generation_failed    | Content       | error_type, format          | Error tracking    |
| payment_initiated    | Revenue       | plan, amount                | Revenue tracking  |
| payment_completed    | Revenue       | plan, amount, method        | Revenue           |
| feature_discovered   | Engagement    | feature_name                | Feature adoption  |
| team_created         | Collaboration | team_size                   | Team usage        |
| api_key_created      | Developer     | permissions                 | API adoption      |

---

## Accessibility Flows

### ♿ Screen Reader Flow

```mermaid
graph TB
    A[Page Load] --> B[Announce Title]
    B --> C[Focus Main]
    C --> D[Tab Navigation]
    D --> E[Read Labels]
    E --> F[Announce Actions]
    F --> G[Confirm Results]
```

### ⌨️ Keyboard Navigation Flow

```mermaid
graph LR
    A[Tab Key] --> B[Focus Next]
    B --> C[Show Outline]
    C --> D[Enter/Space]
    D --> E[Activate]
    E --> F[Announce Change]
```

---

## Performance Optimization Flows

### ⚡ Lazy Loading Flow

```mermaid
graph TB
    A[Initial Load] --> B[Critical CSS/JS]
    B --> C[Render Shell]
    C --> D[Load Above Fold]
    D --> E[User Scrolls]
    E --> F[Load Next Section]
    F --> G[Prefetch Links]
```

### 🔄 Cache Strategy Flow

```mermaid
graph LR
    A[Request] --> B{In Cache?}
    B -->|Yes| C{Fresh?}
    B -->|No| D[Fetch]
    C -->|Yes| E[Return Cache]
    C -->|No| F[Revalidate]
    D --> G[Update Cache]
    F --> G
    G --> H[Return Data]
```

---

## Security Flows

### 🔐 2FA Setup Flow

```mermaid
graph TB
    A[Security Settings] --> B[Enable 2FA]
    B --> C[Choose Method]
    C --> D{Method}
    D -->|App| E[QR Code]
    D -->|SMS| F[Phone Number]
    D -->|Email| G[Email Confirm]
    E --> H[Scan with App]
    F --> I[Send Code]
    G --> I
    H --> J[Enter Code]
    I --> J
    J --> K[Verify]
    K --> L[Backup Codes]
    L --> M[2FA Active]
```

### 🛡️ Security Challenge Flow

```mermaid
graph TB
    A[Suspicious Activity] --> B[Challenge User]
    B --> C{Challenge Type}
    C -->|CAPTCHA| D[Solve CAPTCHA]
    C -->|Email Code| E[Send Email]
    C -->|Security Question| F[Answer Question]
    D --> G{Verify}
    E --> H[Enter Code]
    F --> G
    H --> G
    G -->|Pass| I[Allow Access]
    G -->|Fail| J[Block + Log]
```

---

## Support & Help Flows

### 💬 Help System Flow

```mermaid
graph TB
    A[User Stuck] --> B[Help Button]
    B --> C{Help Type}
    C -->|Contextual| D[Tooltip]
    C -->|Guide| E[Tutorial]
    C -->|Search| F[Help Center]
    C -->|Contact| G[Support Form]
    D --> H[Quick Fix]
    E --> I[Step-by-Step]
    F --> J[Article]
    G --> K[Ticket Created]
```

### 🎯 Onboarding Tutorial Flow

```mermaid
graph LR
    A[First Login] --> B[Welcome Modal]
    B --> C[Feature Tour]
    C --> D[Interactive Demo]
    D --> E[First Task]
    E --> F[Celebrate Success]
    F --> G[Next Steps]
```

---

## Data Management Flows

### 💾 Export Data Flow

```mermaid
graph TB
    A[Account Settings] --> B[Export Data]
    B --> C[Select Data Type]
    C --> D{Format}
    D -->|JSON| E[Generate JSON]
    D -->|CSV| F[Generate CSV]
    D -->|PDF| G[Generate PDF]
    E --> H[Prepare File]
    F --> H
    G --> H
    H --> I[Send Email]
    I --> J[Download Link]
```

### 🗑️ Account Deletion Flow

```mermaid
graph TB
    A[Account Settings] --> B[Delete Account]
    B --> C[Confirm Reason]
    C --> D[Final Warning]
    D --> E[Enter Password]
    E --> F[Process Deletion]
    F --> G[Export Option]
    G --> H[Schedule Deletion]
    H --> I[Grace Period]
    I --> J[Permanent Delete]
```

---

## Integration Flows

### 🔗 Third-Party Integration Setup

```mermaid
graph TB
    A[Integrations Page] --> B[Select Service]
    B --> C{Service}
    C -->|Slack| D[OAuth Flow]
    C -->|Zapier| E[API Key]
    C -->|Webhooks| F[URL Config]
    D --> G[Authorize]
    E --> H[Enter Key]
    F --> I[Test Webhook]
    G --> J[Connected]
    H --> J
    I --> J
```

### 📤 Content Publishing Flow

```mermaid
graph LR
    A[Generated Content] --> B[Publish]
    B --> C{Platform}
    C -->|WordPress| D[WP API]
    C -->|Medium| E[Medium API]
    C -->|LinkedIn| F[LinkedIn API]
    D --> G[Published]
    E --> G
    F --> G
    G --> H[Share Link]
```

---

## Administrative Flows

### 👨‍💼 Admin Dashboard Flow

```mermaid
graph TB
    A[Admin Login] --> B[Dashboard]
    B --> C{Section}
    C -->|Users| D[User Management]
    C -->|Content| E[Content Moderation]
    C -->|Analytics| F[System Analytics]
    C -->|Settings| G[System Config]
    D --> H[User Actions]
    E --> I[Content Actions]
    F --> J[Reports]
    G --> K[Update Settings]
```

### 🔍 Content Moderation Flow

```mermaid
graph TB
    A[Flagged Content] --> B[Review Queue]
    B --> C[Moderator Review]
    C --> D{Decision}
    D -->|Approve| E[Unflag]
    D -->|Reject| F[Remove]
    D -->|Edit| G[Suggest Changes]
    E --> H[Notify User]
    F --> H
    G --> H
```

---

## Testing & QA Flows

### 🧪 A/B Testing Flow

```mermaid
graph TB
    A[User Arrives] --> B{Experiment Running?}
    B -->|Yes| C[Assign Variant]
    B -->|No| D[Default Experience]
    C --> E{Variant}
    E -->|A| F[Control]
    E -->|B| G[Treatment]
    F --> H[Track Metrics]
    G --> H
    H --> I[Analyze Results]
```

### 🐛 Bug Report Flow

```mermaid
graph TB
    A[User Encounters Bug] --> B[Report Bug]
    B --> C[Capture Context]
    C --> D[Fill Form]
    D --> E[Attach Screenshot]
    E --> F[Submit]
    F --> G[Create Ticket]
    G --> H[Notify Team]
    H --> I[Investigate]
    I --> J[Fix & Deploy]
    J --> K[Notify User]
```

---

## Conclusion

These user journeys represent the complete interaction patterns within Harvest.ai. Each flow has been designed with:

- **User Experience** - Intuitive and efficient
- **Error Handling** - Graceful recovery
- **Performance** - Optimized loading
- **Accessibility** - Inclusive design
- **Security** - Protected at every step
- **Analytics** - Tracked for insights

Regular updates to these flows ensure they remain aligned with user needs and business goals.
