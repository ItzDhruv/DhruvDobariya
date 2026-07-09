export async function askDhruvAI(question) {
  const response = await fetch("/api/portfolio-ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error("AI service unavailable");
  }

  const data = await response.json();

  if (!data || typeof data !== "object") {
    throw new Error("Invalid AI response");
  }

  return data;
}
