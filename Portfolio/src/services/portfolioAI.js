const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.REACT_APP_GEMINI_MODEL || "gemini-2.5-flash-lite";
const allowedActions = ["none", "navigate", "highlight", "point", "show_contact"];
const allowedTargets = ["home", "about", "projects", "resume", "contact"];
const allowedEmotions = ["neutral", "thinking", "professional", "excited"];
const defaultHelpMessage =
  "I can answer questions about Dhruv's Java backend work, blockchain experience, projects, skills, education, and contact details.";

const responseSchema = {
  type: "object",
  properties: {
    message: { type: "string" },
    action: { type: "string", enum: allowedActions },
    target: { type: "string", enum: allowedTargets },
    focusItem: { type: "string" },
    emotion: { type: "string", enum: allowedEmotions },
  },
  required: ["message", "action", "target", "focusItem", "emotion"],
};

const createGeminiPrompt = (question) => `You are Dhruv AI, a concise portfolio assistant. Answer only about Dhruv Dobariya's professional background. If outside scope, say: "I'm Dhruv's portfolio AI, so I can only answer questions about his experience, skills, projects, and professional background."

Facts:
- Dhruv Dobariya is a Software Engineer focused on Java backend systems and blockchain engineering.
- Current work: maintains a core Java module for customer-facing test automation workflows at a SaaS testing platform.
- Previous role: Blockchain Developer at CodeMinto Infotech, Nov 2024 to Oct 2025.
- Blockchain: Solidity, EVM chains, wallets, frontend integration, on-chain logic.
- Skills: Java, Solidity, JavaScript, SQL, Spring Boot, REST APIs, Core Java, Linux, Git, Docker, Postman, Maven, Ethereum, Hardhat, Ethers.js, OpenZeppelin.
- Projects: CrownTest remote test automation platform, banking backend with Java/Spring Boot/SQL, DragonRunner Solidity game.
- Education: B.Tech CSE, P.P. Savani University, 2022 to 2026.

Always produce only valid JSON with these keys: message, action, target, focusItem, emotion.
Allowed action: none, navigate, highlight, point, show_contact.
Allowed target: home, about, projects, resume, contact.
Allowed emotion: neutral, thinking, professional, excited.
Keep message under 70 words. JSON only.

Question: ${question}`;

const stripCodeFence = (text) =>
  String(text || "")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const extractMessageField = (text) => {
  const matched = stripCodeFence(text).match(/"message"\s*:\s*"((?:\\.|[^"\\])*)(?:"|$)/);
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

const readGeminiError = async (response) => {
  try {
    const data = await response.json();
    return data?.error?.message || response.statusText || "Gemini request failed";
  } catch (error) {
    return response.statusText || "Gemini request failed";
  }
};

const requestGemini = async (prompt) => {
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
        maxOutputTokens: 350,
        topP: 0.9,
        topK: 40,
        responseMimeType: "application/json",
        responseSchema,
      },
    }),
  });

  if (!response.ok) {
    const message = await readGeminiError(response);
    throw new Error(`Gemini API error (${GEMINI_MODEL}): ${message}`);
  }

  return response.json();
};

export async function askDhruvAI(question) {
  const cleanQuestion = String(question || "").trim();

  if (!API_KEY) {
    throw new Error("Missing REACT_APP_GEMINI_API_KEY in .env. Add it, then restart npm start.");
  }

  const prompt = createGeminiPrompt(cleanQuestion);
  const data = await requestGemini(prompt);

  const geminiResult = readGeminiText(data);

  if (!geminiResult) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return extractJson(geminiResult);
  } catch (error) {
    return createFallbackResponse(geminiResult);
  }
}
