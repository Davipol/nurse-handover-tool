const ollama = require("ollama").default;

const summarizeHandovers = async (handoverNotes) => {
  const notesText = handoverNotes
    .map(
      (note) =>
        `Date: ${note.handover_date}
Shift: ${note.shift}
Urgency: ${note.urgency}
Content: ${note.content}
---`,
    )
    .join("\n\n");

  const prompt = `You are a medical summarization assistant. Summarize the following handover notes using the SBAR method.

CRITICAL RULES:
- Only include information that is explicitly stated
- Do NOT add specific numbers or details that aren't provided
- Do NOT invent patient names, times, or values

Handover notes:
${notesText}

Provide a concise, accurate SBAR summary.`;

  const response = await ollama.chat({
    model: "gemma3n:e2b",
    messages: [{ role: "user", content: prompt }],
  });

  return response.message.content;
};

module.exports = { summarizeHandovers };
