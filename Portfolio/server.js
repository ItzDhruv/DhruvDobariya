const http = require("http");
const https = require("https");
const { URL } = require("url");

const PORT = process.env.PORT || 4001;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY is required to run the AI backend.");
  process.exit(1);
}

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
    prompt: { text: prompt },
    temperature: 0.2,
    maxOutputTokens: 420,
    topP: 0.9,
    topK: 40,
  });
  return request;
};

const callGemini = (prompt) =>
  new Promise((resolve, reject) => {
    const requestBody = createGeminiRequest(prompt);
    const url = new URL(`https://generativeai.googleapis.com/v1beta2/models/text-bison-001:generate?key=${API_KEY}`);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
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
          const candidate = data?.candidates?.[0]?.content;
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

const extractJson = (text) => {
  const matched = text.match(/\{[\s\S]*\}$/);
  if (!matched) {
    throw new Error("Could not parse JSON from Gemini response.");
  }
  return JSON.parse(matched[0]);
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
      const parsed = extractJson(geminiResult);

      if (!parsed.message || !parsed.action || !parsed.target || !parsed.emotion) {
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

server.listen(PORT, () => {
  console.log(`Dhruv AI backend listening on port ${PORT}`);
});
