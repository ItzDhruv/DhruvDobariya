const http = require("http");
const https = require("https");
const { URL } = require("url");
require("dotenv").config({ quiet: true });
const PORT = process.env.PORT || 4001;
const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const allowedActions = ["none", "navigate", "highlight", "point", "show_contact"];
const allowedTargets = ["home", "about", "projects", "resume", "contact"];
const allowedEmotions = ["neutral", "thinking", "professional", "excited"];

if (!API_KEY) {
  console.error("GEMINI_API_KEY is required to run the AI backend.");
  process.exit(1);
}
//
const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  });
  res.end(body);
};

const parseBody = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });

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

const createGeminiRequest = (prompt) => {
  const request = JSON.stringify({
    model: GEMINI_MODEL,
    input: prompt,
    generation_config: {
      temperature: 0.2,
      max_output_tokens: 800,
      top_p: 0.9,
      top_k: 40,
    },
  });
  return request;
};

const callGemini = (prompt) =>
  new Promise((resolve, reject) => {
    const requestBody = createGeminiRequest(prompt);
    const url = new URL("https://generativelanguage.googleapis.com/v1beta/interactions");
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
        "x-goog-api-key": API_KEY,
      },
    };

    const req = https.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Gemini request failed: ${res.statusCode} ${body}`));
        }
        try {
          const data = JSON.parse(body);
          const stepText = data?.steps
            ?.flatMap((step) => step.content || [])
            .map((content) => content.text || "")
            .join("")
            .trim();
          const candidate = (data?.output_text || stepText || "").trim();
          if (!candidate) {
            return reject(new Error("Empty Gemini response."));
          }
          resolve(candidate);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.write(requestBody);
    req.end();
  });

const stripCodeFence = (text) =>
  text
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
      "I can answer questions about Dhruv's experience, skills, projects, and professional background.",
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

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (req.method === "POST" && req.url === "/api/portfolio-ai/chat") {
    try {
      const body = await parseBody(req);
      const question = String(body.question || "").trim();
      if (!question) {
        sendJson(res, 400, { error: "Question is required." });
        return;
      }

      const prompt = createGeminiPrompt(question);
      const geminiResult = await callGemini(prompt);
      let parsed;
      try {
        parsed = extractJson(geminiResult);
      } catch (error) {
        console.warn(error.message);
        parsed = createFallbackResponse(geminiResult);
      }

      if (!parsed.message) {
        throw new Error("Gemini returned invalid structured response.");
      }

      sendJson(res, 200, parsed);
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: "AI backend error." });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Dhruv AI backend listening on port ${PORT}`);
});
