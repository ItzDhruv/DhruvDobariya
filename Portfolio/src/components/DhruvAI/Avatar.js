import React from "react";
import "./DhruvAI.css";

function Avatar({ state, displayMode, onActivate }) {
  return (
    <button
      type="button"
      className={`dhruv-ai-avatar state-${state}`}
      aria-label="Open Dhruv AI assistant"
      onClick={onActivate}
    >
      {displayMode === "ai" ? (
        <span className="ai-label" aria-hidden="true">AI</span>
      ) : (
        <div className="ai-face">
          <div className="ai-eyes">
            <span className="ai-eye" />
            <span className="ai-eye" />
          </div>
        </div>
      )}
    </button>
  );
}

export default Avatar;
