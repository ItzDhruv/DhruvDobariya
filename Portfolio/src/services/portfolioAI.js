const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.REACT_APP_GEMINI_MODEL || "gemini-2.0-flash";
const allowedActions = ["none", "navigate", "highlight", "point", "show_contact"];
const allowedTargets = ["home", "about", "projects", "resume", "contact"];
const allowedEmotions = ["neutral", "thinking", "professional", "excited"];
const portfolioScopeMessage =
  "I'm Dhruv's portfolio AI, so I can only answer questions about his experience, skills, projects, and professional background.";
const defaultHelpMessage =
  "I can answer questions about Dhruv's Java backend work, blockchain experience, projects, skills, education, and contact details.";

const responseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    action: {
      type: "string",
      enum: allowedActions,
    },
    target: {
      type: "string",
      enum: allowedTargets,
    },
    focusItem: { type: "string" },
    emotion: {
      type: "string",
      enum: allowedEmotions,
    },
  },
  required: ["message", "action", "target", "focusItem", "emotion"],
};

const createGeminiPrompt = (question) => `You are Dhruv AI, a professional portfolio assistant for Dhruv Dobariya. Answer only about Dhruv's professional work, experience, skills, education, projects, and contact details shown in his portfolio. Do not answer unrelated questions. If asked something outside this scope, respond exactly: "I'm Dhruv's portfolio AI, so I can only answer questions about his experience, skills, projects, and professional background.".

Use only the following verified information:
- Name: Dhruv Dobariya
- Software Engineer with experience in backend development and blockchain engineering.
- Currently maintains a core Java module for customer-facing test automation workflows at a SaaS testing platform.
- Previous role as a Blockchain Developer at CodeMinto Infotech from November 2024 to October 2025.
- Experience with Solidity smart contracts, EVM-compatible chains, frontend integration, wallets, and on-chain logic.
- Skills: Java, Solidity, JavaScript, SQL, Spring Boot, REST APIs, Core Java, Linux, Git, Docker, Postman, Maven, Ethereum, Hardhat, Ethers.js, OpenZeppelin.
- Projects and experience: CrownTest remote test automation platform, banking backend with Java/Spring Boot/SQL, DragonRunner Solidity game.
- Education: Bachelor of Technology in Computer Science Engineering from P.P. Savani University, 2022 to 2026.

Always produce only valid JSON with these keys: message, action, target, focusItem, emotion.
- action must be one of: none, navigate, highlight, point, show_contact.
- target must be one of: home, about, projects, resume, contact.
- emotion must be one of: neutral, thinking, professional, excited.
- focusItem should be a short identifier or empty string.

Respond with JSON only, no markdown, no code fences, and no extra explanation.

Question: ${question}`;

const stripCodeFence = (text) =>
  String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const extractMessageField = (text) => {
  const matched = stripCodeFence(text).match(/"message"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (!matched) {
    return "";
  }

  try {
    return JSON.parse(`"${matched[1]}"`).trim();
  } catch (error) {
    return matched[1].replace(/\\"/g, '"').trim();
  }
};

const findJsonObject = (text) => {
  const cleaned = stripCodeFence(text);
  for (let start = cleaned.indexOf("{"); start !== -1; start = cleaned.indexOf("{", start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = start; index < cleaned.length; index += 1) {
      const char = cleaned[index];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (inString) {
        continue;
      }

      if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          return cleaned.slice(start, index + 1);
        }
      }
    }
  }

  return "";
};

const normalizeAIResponse = (value) => ({
  message: String(value.message || "").trim(),
  action: allowedActions.includes(value.action) ? value.action : "none",
  target: allowedTargets.includes(value.target) ? value.target : "home",
  focusItem: String(value.focusItem || "").trim(),
  emotion: allowedEmotions.includes(value.emotion) ? value.emotion : "professional",
});

const createFallbackResponse = (text) => {
  const message = (extractMessageField(text) || stripCodeFence(text)).replace(/\s+/g, " ").trim();
  return normalizeAIResponse({
    message:
      message ||
      defaultHelpMessage,
    action: "none",
    target: "home",
    focusItem: "",
    emotion: "professional",
  });
};

const createLocalPortfolioResponse = (question) => {
  const text = String(question || "").toLowerCase();

  if (/(contact|email|reach|hire|connect)/.test(text)) {
    return normalizeAIResponse({
      message: "You can contact Dhruv from the contact section of this portfolio.",
      action: "show_contact",
      target: "contact",
      focusItem: "contact",
      emotion: "professional",
    });
  }

  if (/(project|crowntest|bank|dragon|solidity|blockchain|java|spring|backend|skill|experience|work|interview|hire)/.test(text)) {
    return normalizeAIResponse({
      message:
        "Dhruv is a software engineer focused on Java backend systems and blockchain engineering. He maintains a core Java module for customer-facing test automation workflows, previously worked as a Blockchain Developer at CodeMinto Infotech, and has experience with Java, Spring Boot, SQL, REST APIs, Solidity, Ethereum, Hardhat, Ethers.js, Docker, Git, and Linux.",
      action: text.includes("project") || text.includes("crowntest") || text.includes("dragon") ? "highlight" : "none",
      target: text.includes("project") || text.includes("crowntest") || text.includes("dragon") ? "projects" : "about",
      focusItem: text.includes("project") || text.includes("crowntest") || text.includes("dragon") ? "projects" : "skills",
      emotion: "professional",
    });
  }

  if (/(education|college|university|degree|study)/.test(text)) {
    return normalizeAIResponse({
      message:
        "Dhruv is pursuing a Bachelor of Technology in Computer Science Engineering from P.P. Savani University, from 2022 to 2026.",
      action: "highlight",
      target: "about",
      focusItem: "education",
      emotion: "professional",
    });
  }

  return normalizeAIResponse({
    message: portfolioScopeMessage,
    action: "none",
    target: "home",
    focusItem: "",
    emotion: "neutral",
  });
};

const extractJson = (text) => {
  const cleaned = stripCodeFence(text);
  try {
    return normalizeAIResponse(JSON.parse(cleaned));
  } catch (error) {
    const jsonText = findJsonObject(cleaned);
    if (!jsonText) {
      throw new Error(`Could not parse JSON from Gemini response: ${cleaned.slice(0, 180)}`);
    }
    return normalizeAIResponse(JSON.parse(jsonText));
  }
};

const readGeminiText = (data) => {
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
  return text || "";
};

export async function askDhruvAI(question) {
  const cleanQuestion = String(question || "").trim();

  if (!API_KEY) {
    return createLocalPortfolioResponse(cleanQuestion);
  }

  const prompt = createGeminiPrompt(cleanQuestion);
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
        topP: 0.9,
        topK: 40,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });

  if (!response.ok) {
    return createLocalPortfolioResponse(cleanQuestion);
  }

  const data = await response.json();
  const geminiResult = readGeminiText(data);

  if (!geminiResult) {
    return createLocalPortfolioResponse(cleanQuestion);
  }

  try {
    return extractJson(geminiResult);
  } catch (error) {
    return createFallbackResponse(geminiResult);
  }
}
