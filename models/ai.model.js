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

const summarizeSingleHandover = async (handoverNote) => {
  const prompt = `You are a medical summarization assistant. Summarize this handover note concisely using the SBAR method (Situation, Background, Assessment, Recommendation).

CRITICAL RULES:
- Only include information that is explicitly stated
- Do NOT add specific numbers or details that aren't provided
- Keep it brief and professional
- Use proper grammar and past tense for completed events
- Format headers as: "Situation:", "Background:", "Assessment:", "Recommendation:" (without any markdown formatting)
- Be concise - 3-4 sentences total
- Focus on key clinical points

Handover note:
Date: ${handoverNote.handover_date}
Shift: ${handoverNote.shift}
Urgency: ${handoverNote.urgency}
Vitals: BP ${handoverNote.vitals.bloodPressure}, Pulse ${handoverNote.vitals.pulse}, Temp ${handoverNote.vitals.temperature}°C, RR ${handoverNote.vitals.respiratoryRate}, O2 Sat ${handoverNote.vitals.oxygenSaturation}%
Content: ${handoverNote.content}

Provide a concise SBAR summary (max 4-5 sentences).`;

  const response = await ollama.chat({
    model: "gemma3n:e2b",
    messages: [{ role: "user", content: prompt }],
  });
  return response.message.content;
};

const summarizeUnitDay = async (unitName, handovers, date) => {
  // Pre-organize by urgency in JavaScript (so AI can't mess it up)
  const critical = handovers.filter((h) => h.urgency === "critical");
  const urgent = handovers.filter((h) => h.urgency === "urgent");
  const routine = handovers.filter((h) => h.urgency === "routine");

  // Format each group
  const formatGroup = (notes) => {
    if (notes.length === 0) return "None";
    return notes
      .map(
        (n) =>
          `${n.patient_first_name} ${n.patient_last_name} (${n.bed}): ${n.content}`,
      )
      .join("\n\n");
  };

  const prompt = `You are a medical summarization assistant. Provide a brief summary for ${unitName} on ${date}. Keep each patient's summary to 1-2 sentences highlighting key clinical points.

CRITICAL RULES:
- Only include information explicitly stated
- Do NOT add numbers or details not provided
- Be concise and factual

CRITICAL CASES:
${formatGroup(critical)}

URGENT CASES:
${formatGroup(urgent)}

ROUTINE CASES:
${formatGroup(routine)}

Summarize each category briefly, maintaining the same structure.`;

  const response = await ollama.chat({
    model: "gemma3n:e2b",
    messages: [{ role: "user", content: prompt }],
  });

  return response.message.content;
};
module.exports = {
  summarizeHandovers,
  summarizeSingleHandover,
  summarizeUnitDay,
};
