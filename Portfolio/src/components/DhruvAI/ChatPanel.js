import React from "react";
import "./DhruvAI.css";

const suggestions = [
  "What does Dhruv currently work on?",
  "Show me his strongest Java project.",
  "What production experience does he have?",
  "Tell me about CrownTest.",
  "What is his backend experience?",
  "What blockchain work has he done?",
  "Why should we interview Dhruv?",
  "How can I contact him?",
];

function ChatPanel({
  open,
  onClose,
  messages,
  inputValue,
  onInputChange,
  onSend,
  isThinking,
  onSuggestion,
  isMobile,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className={`dhruv-ai-panel ${isMobile ? "dhruv-ai-panel-mobile" : ""}`}>
      <div className="dhruv-ai-panel-header">
        <div>
          <h4>Dhruv AI</h4>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#d3c5f5" }}>
            Ask about his experience, skills, projects, and contact.
          </p>
        </div>
        <button onClick={onClose} aria-label="Close Dhruv AI chat">
          ✕
        </button>
      </div>
      <div className="dhruv-ai-panel-messages" aria-live="polite">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`dhruv-ai-message ${message.role}`}
          >
            {message.text}
          </div>
        ))}
        {isThinking && (
          <div className="dhruv-ai-message assistant">Thinking...</div>
        )}
      </div>
      <div className="dhruv-ai-panel-input">
        <input
          type="text"
          aria-label="Ask Dhruv AI a question"
          placeholder="Ask about Dhruv's work..."
          value={inputValue}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSend();
            }
          }}
        />
        <button type="button" onClick={onSend} disabled={!inputValue.trim()}>
          Send
        </button>
      </div>
      <div className="dhruv-ai-suggestions">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="dhruv-ai-suggestion"
            onClick={() => onSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChatPanel;
