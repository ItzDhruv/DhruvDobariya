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
  const [isThinking, setIsThinking] = useState(false);
  const [avatarState, setAvatarState] = useState("idle");
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [introVisible, setIntroVisible] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [highlightedId, setHighlightedId] = useState("");
  const [clickCount, setClickCount] = useState(0);
  const wrapperRef = useRef(null);
  const activityTimeoutRef = useRef(null);

  const isMobile = useMemo(() => window.innerWidth < 760, []);

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
    const bottom = (footer?.top || window.innerHeight) - padding - (isMobile ? 64 : 85);
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

  const inferSafeTarget = (target) => {
    if (!allowedTargets.includes(target)) {
      return "none";
    }
    return target;
  };

  const handleAIResponse = async (messageText) => {
    setIsThinking(true);
    setAvatarState("thinking");
    setStatusMessage("Thinking...");
    try {
      const response = await askDhruvAI(messageText);
      const { message, action, target, emotion } = response;
      const safeAction = allowedActions.includes(action) ? action : "none";
      const safeTarget = inferSafeTarget(target);
      const safeEmotion = allowedEmotions.includes(emotion) ? emotion : "neutral";

      if (message) {
        setMessages((prev) => [...prev, { role: "assistant", text: message }]);
        setStatusMessage(message);
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
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, the portfolio AI is unavailable right now. Please try again in a moment.",
        },
      ]);
      setStatusMessage("AI service unavailable.");
      setAvatarState("neutral");
    } finally {
      setIsThinking(false);
      if (!isSleeping) {
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

  return (
    <div className="dhruv-ai-root" ref={wrapperRef}>
      <div
        className="dhruv-ai-avatar-wrapper"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      >
        <Avatar state={avatarState} onActivate={openChat} />
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
