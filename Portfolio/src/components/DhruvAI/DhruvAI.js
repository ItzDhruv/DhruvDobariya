import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import ChatPanel from "./ChatPanel";
import { askDhruvAI } from "../../services/portfolioAI";
import "./DhruvAI.css";

const sectionMap = {
  home: { route: "/", selector: "#home" },
  about: { route: "/about", selector: "#about" },
  projects: { route: "/project", selector: "#projects" },
  resume: { route: "/resume", selector: "#resume" },
  contact: { route: "/", selector: "#contact" },
};

const allowedActions = ["none", "navigate", "highlight", "point", "show_contact"];
const allowedTargets = ["home", "about", "projects", "resume", "contact"];
const allowedEmotions = ["neutral", "thinking", "professional", "excited"];

const stripCodeFence = (text) =>
  String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const extractMessageText = (text) => {
  const cleaned = stripCodeFence(text);
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && parsed.message) {
      return String(parsed.message).trim();
    }
  } catch (error) {
    const matched = cleaned.match(/"message"\s*:\s*"((?:\\.|[^"\\])*)(?:"|$)/);
    if (matched) {
      try {
        return JSON.parse(`"${matched[1]}"`).trim();
      } catch (parseError) {
        return matched[1].replace(/\\"/g, '"').trim();
      }
    }
  }

  // Do not expose a malformed JSON wrapper in the chat if Gemini stops mid-response.
  return cleaned
    .replace(/^\{?\s*"?message"?\s*:\s*"?/, "")
    .replace(/["}]+\s*$/, "")
    .trim();
};

function DhruvAI() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChatOpen, setChatOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Hey, I'm Dhruv AI. Ask me about his work.");
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hey, I'm Dhruv AI. Ask me about Dhruv's work.",
    },
  ]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [avatarState, setAvatarState] = useState("idle");
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [introVisible, setIntroVisible] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [highlightedId, setHighlightedId] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const [panelMode, setPanelMode] = useState("normal");
  const [panelSize, setPanelSize] = useState({ width: 520, height: 580 });
  const [avatarDisplay, setAvatarDisplay] = useState("robot");
  const wrapperRef = useRef(null);
  const activityTimeoutRef = useRef(null);
  const activeRequestsRef = useRef(0);
  const resizeStateRef = useRef(null);

  const isMobile = useMemo(() => window.innerWidth < 760, []);
  const isThinking = pendingRequests > 0;

  const getElementByTarget = (target) => {
    const config = sectionMap[target];
    if (!config) return null;
    return document.querySelector(config.selector);
  };

  const setRobotIdle = useCallback(() => {
    const navbar = document.querySelector(".navbar")?.getBoundingClientRect();
    const footer = document.querySelector(".footer")?.getBoundingClientRect();
    const padding = 12;
    const top = (navbar?.bottom || 0) + padding;
    const visibleBottom = Math.min(footer?.top || window.innerHeight, window.innerHeight);
    const bottom = visibleBottom - padding - (isMobile ? 64 : 85);
    const right = window.innerWidth - padding - (isMobile ? 64 : 85);
    const left = padding;

    const bounds = {
      left: Math.max(left, padding),
      top: Math.max(top, padding),
      right: Math.max(right, left + 40),
      bottom: Math.max(bottom, top + 40),
    };

    setPosition({ x: bounds.right, y: bounds.bottom });
    setAvatarState("idle");
  }, [isMobile]);

  const scrollToSection = (target) => {
    const element = getElementByTarget(target);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const highlightTarget = (targetId) => {
    const element = getElementByTarget(targetId);
    if (!element) return;
    element.classList.add("dhruv-ai-highlight");
    setHighlightedId(targetId);
    window.setTimeout(() => {
      element.classList.remove("dhruv-ai-highlight");
      setHighlightedId("");
    }, 3200);
  };

  const openChat = () => {
    setChatOpen(true);
    setIsSleeping(false);
    setAvatarState("excited");
    setClickCount((count) => count + 1);
    if (clickCount >= 2) {
      setStatusMessage("Nice! I noticed you're curious — ask me about Dhruv's backend work.");
    }
  };

  const togglePanelMode = () => {
    setPanelMode((mode) => (mode === "expanded" ? "normal" : "expanded"));
  };

  const startPanelResize = (event) => {
    if (isMobile || panelMode === "expanded") return;
    event.preventDefault();
    const pointer = event.touches?.[0] || event;
    resizeStateRef.current = {
      startX: pointer.clientX,
      startY: pointer.clientY,
      startWidth: panelSize.width,
      startHeight: panelSize.height,
    };
  };

  const inferSafeTarget = (target) => {
    if (!allowedTargets.includes(target)) {
      return "none";
    }
    return target;
  };

  const handleAIResponse = async (messageText) => {
    activeRequestsRef.current += 1;
    setPendingRequests(activeRequestsRef.current);
    setAvatarState("thinking");
    setStatusMessage("Thinking...");
    try {
      const response = await askDhruvAI(messageText);
      const { message, action, target, emotion } = response;
      const safeAction = allowedActions.includes(action) ? action : "none";
      const safeTarget = inferSafeTarget(target);
      const safeEmotion = allowedEmotions.includes(emotion) ? emotion : "neutral";

      if (message) {
        const displayMessage = extractMessageText(message);
        setMessages((prev) => [...prev, { role: "assistant", text: displayMessage }]);
        setStatusMessage(displayMessage);
      }
      setAvatarState(safeEmotion === "thinking" ? "thinking" : safeEmotion);

      if (safeAction === "navigate") {
        if (safeTarget === "contact") {
          navigate("/");
          window.setTimeout(() => {
            scrollToSection("contact");
          }, 700);
        } else if (sectionMap[safeTarget]) {
          navigate(sectionMap[safeTarget].route);
          window.setTimeout(() => {
            scrollToSection(safeTarget);
          }, 700);
        }
      }

      if (safeAction === "highlight" || safeAction === "point") {
        const selectedTarget = safeTarget || "projects";
        if (sectionMap[selectedTarget]) {
          if (selectedTarget === "contact" && location.pathname !== "/") {
            navigate("/");
            window.setTimeout(() => {
              highlightTarget(selectedTarget);
            }, 700);
          } else {
            scrollToSection(selectedTarget);
            highlightTarget(selectedTarget);
          }
        }
      }

      if (safeAction === "show_contact") {
        setChatOpen(true);
        if (location.pathname !== "/") {
          navigate("/");
          window.setTimeout(() => {
            scrollToSection("contact");
          }, 700);
        } else {
          scrollToSection("contact");
        }
      }
    } catch (error) {
      const errorMessage = error.message || "Unknown AI error";
      const isQuotaError = /quota|rate limit|resource_exhausted|too many requests|exceeded/i.test(errorMessage);
      const isNetworkError = /failed to fetch|networkerror|load failed/i.test(errorMessage);
      const isGeminiSetupError =
        errorMessage.startsWith("Gemini API error") ||
        errorMessage.startsWith("Missing REACT_APP_GEMINI_API_KEY") ||
        errorMessage.startsWith("Gemini returned") ||
        isQuotaError ||
        isNetworkError;
      const errorText = isGeminiSetupError
        ? isQuotaError
          ? "Gemini quota is exhausted for this API key/project. Try again later, switch to a key with available quota, or enable billing in Google AI Studio."
          : isNetworkError
          ? "The browser could not reach Gemini. Check your internet connection, API key browser restrictions, ad blocker, or CORS/network settings."
          : errorMessage
        : "Sorry, the portfolio AI is unavailable right now. Please try again in a moment.";
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: errorText,
        },
      ]);
      setStatusMessage(isGeminiSetupError ? "Gemini setup needs attention." : "AI service unavailable.");
      setAvatarState("neutral");
    } finally {
      activeRequestsRef.current = Math.max(0, activeRequestsRef.current - 1);
      setPendingRequests(activeRequestsRef.current);
      if (!isSleeping && activeRequestsRef.current === 0) {
        setTimeout(() => setAvatarState("idle"), 1000);
      }
    }
  };

  const handleSubmit = async () => {
    const message = inputValue.trim();
    if (!message) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInputValue("");
    await handleAIResponse(message);
  };

  useEffect(() => {
    if (isChatOpen) {
      setAvatarDisplay("robot");
      return undefined;
    }

    const displayTimer = window.setInterval(() => {
      setAvatarDisplay((mode) => (mode === "robot" ? "ai" : "robot"));
    }, 3000);

    return () => window.clearInterval(displayTimer);
  }, [isChatOpen]);

  useEffect(() => {
    const handleActivityEvent = () => {
      if (isSleeping) {
        setIsSleeping(false);
        setAvatarState("idle");
        setStatusMessage("Ready when you are.");
      }
      window.clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = window.setTimeout(() => {
        setIsSleeping(true);
        setAvatarState("sleeping");
        setStatusMessage("I'll rest here until you're ready.");
      }, 28000);
    };

    const handleResize = () => {
      setRobotIdle();
    };

    setRobotIdle();
    if (!localStorage.getItem("dhruv-ai-intro")) {
      setIntroVisible(true);
      window.setTimeout(() => {
        setIntroVisible(false);
        localStorage.setItem("dhruv-ai-intro", "seen");
      }, 4200);
    }
    handleActivityEvent();

    window.addEventListener("mousemove", handleActivityEvent);
    window.addEventListener("scroll", handleActivityEvent);
    window.addEventListener("keydown", handleActivityEvent);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleActivityEvent);
      window.removeEventListener("scroll", handleActivityEvent);
      window.removeEventListener("keydown", handleActivityEvent);
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(activityTimeoutRef.current);
    };
  }, [location.pathname, isMobile, isSleeping, setRobotIdle]);

  useEffect(() => {
    if (highlightedId) {
      const element = getElementByTarget(highlightedId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedId]);

  useEffect(() => {
    const handleResizeMove = (event) => {
      if (!resizeStateRef.current) return;
      if (event.cancelable) {
        event.preventDefault();
      }
      const pointer = event.touches?.[0] || event;
      const { startX, startY, startWidth, startHeight } = resizeStateRef.current;
      const nextWidth = Math.min(
        Math.max(380, startWidth + startX - pointer.clientX),
        Math.max(380, window.innerWidth - 140)
      );
      const nextHeight = Math.min(
        Math.max(460, startHeight + startY - pointer.clientY),
        Math.max(460, window.innerHeight - 80)
      );
      setPanelSize({ width: nextWidth, height: nextHeight });
    };

    const stopResize = () => {
      resizeStateRef.current = null;
    };

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", stopResize);
    window.addEventListener("touchmove", handleResizeMove, { passive: false });
    window.addEventListener("touchend", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleResizeMove);
      window.removeEventListener("mouseup", stopResize);
      window.removeEventListener("touchmove", handleResizeMove);
      window.removeEventListener("touchend", stopResize);
    };
  }, []);

  return (
    <div className="dhruv-ai-root" ref={wrapperRef}>
      <div
        className="dhruv-ai-avatar-wrapper"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      >
        <Avatar state={avatarState} displayMode={avatarDisplay} onActivate={openChat} />
        {introVisible && (
          <div className="dhruv-ai-bubble">Hey, I’m Dhruv AI. Ask me about his work.</div>
        )}
        {!introVisible && statusMessage && !isChatOpen && (
          <div className="dhruv-ai-bubble">{statusMessage}</div>
        )}
      </div>
      <ChatPanel
        open={isChatOpen}
        onClose={() => setChatOpen(false)}
        panelMode={panelMode}
        onTogglePanelMode={togglePanelMode}
        panelSize={panelSize}
        onResizeStart={startPanelResize}
        messages={messages}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSubmit}
        isThinking={isThinking}
        onSuggestion={(text) => {
          setInputValue(text);
          setMessages((prev) => [...prev, { role: "user", text }]);
          handleAIResponse(text);
        }}
        isMobile={isMobile}
      />
    </div>
  );
}

export default DhruvAI;
