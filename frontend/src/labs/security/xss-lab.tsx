import React, { useState } from 'react';

/**
 * SECURITY LAB: XSS Vulnerability Demo
 * This component is INTENTIONALLY vulnerable for educational purposes.
 * It's sandboxed and should never be used in production.
 */
export const XSSVulnerableComponent: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  
  const handleSubmit = () => {
    // VULNERABILITY: Direct HTML injection without sanitization
    // This is how XSS attacks work in real applications
    setMessages([...messages, userInput]);
  };
  
  return (
    <div className="p-4 border-2 border-red-500 rounded">
      <div className="bg-red-100 p-2 mb-4 rounded">
        ⚠️ SECURITY LAB - This component is intentionally vulnerable
      </div>
      
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Try injecting: <img src=x onerror=alert('XSS')>"
        className="w-full p-2 border rounded"
      />
      
      <button onClick={handleSubmit} className="mt-2 p-2 bg-blue-500 text-white rounded">
        Submit (Vulnerable)
      </button>
      
      <div className="mt-4">
        {messages.map((msg, i) => (
          // VULNERABILITY: dangerouslySetInnerHTML without sanitization
          <div key={i} dangerouslySetInnerHTML={{ __html: msg }} />
        ))}
      </div>
    </div>
  );
};

/**
 * SECURITY LAB: Fixed Version
 * This demonstrates proper input sanitization
 */
export const XSSSecureComponent: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  
  const sanitizeInput = (input: string): string => {
    // Basic HTML entity encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  const handleSubmit = () => {
    // SECURE: Input is sanitized before storage/display
    setMessages([...messages, sanitizeInput(userInput)]);
  };
  
  return (
    <div className="p-4 border-2 border-green-500 rounded">
      <div className="bg-green-100 p-2 mb-4 rounded">
        ✅ SECURE VERSION - Input is properly sanitized
      </div>
      
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Try injecting: <img src=x onerror=alert('XSS')>"
        className="w-full p-2 border rounded"
      />
      
      <button onClick={handleSubmit} className="mt-2 p-2 bg-green-500 text-white rounded">
        Submit (Secure)
      </button>
      
      <div className="mt-4">
        {messages.map((msg, i) => (
          // SECURE: Text content is safely rendered
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
};
