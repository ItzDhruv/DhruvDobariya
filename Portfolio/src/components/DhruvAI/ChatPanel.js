import React from "react";
import { FaCompressAlt, FaExpandAlt } from "react-icons/fa";
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
  panelMode,
  onTogglePanelMode,
  panelSize,
  onResizeStart,
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

  const isExpanded = panelMode === "expanded";
  const panelStyle =
    isMobile || isExpanded
      ? undefined
      : {
          width: `${panelSize.width}px`,
          maxWidth: `${panelSize.width}px`,
          height: `${panelSize.height}px`,
          maxHeight: `${panelSize.height}px`,
        };

  return (
    <div
      className={`dhruv-ai-panel ${isMobile ? "dhruv-ai-panel-mobile" : ""} ${
        isExpanded ? "dhruv-ai-panel-expanded" : ""
      }`}
      style={panelStyle}
    >
      <div className="dhruv-ai-panel-header">
        <div>
          <h4>Dhruv AI</h4>
          <p>
            Ask about his experience, skills, projects, and contact.
          </p>
        </div>
        <div className="dhruv-ai-panel-actions">
          <button
            type="button"
            onClick={onTogglePanelMode}
            aria-label={isExpanded ? "Minimize Dhruv AI chat" : "Maximize Dhruv AI chat"}
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <FaCompressAlt /> : <FaExpandAlt />}
          </button>
          <button type="button" onClick={onClose} aria-label="Close Dhruv AI chat" title="Close">
            ✕
          </button>
        </div>
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
      {!isMobile && !isExpanded && (
        <button
          type="button"
          className="dhruv-ai-resize-handle"
          aria-label="Resize Dhruv AI chat"
          onMouseDown={onResizeStart}
          onTouchStart={onResizeStart}
        />
      )}
    </div>
  );
}

export default ChatPanel;
