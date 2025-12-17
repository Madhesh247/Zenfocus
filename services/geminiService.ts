import { GoogleGenAI } from "@google/genai";
import { SessionLog } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';

// Initialize safely
let ai: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

export const getProductivityCoaching = async (
  currentSession: string,
  recentLogs: SessionLog[],
  userQuery?: string
): Promise<string> => {
  if (!ai) return "AI Configuration Missing: Please set your API Key.";

  const historySummary = recentLogs.slice(0, 5).map(log => 
    `- ${log.mode} session (${Math.floor(log.duration / 60)} mins) on ${new Date(log.timestamp).toLocaleTimeString()}`
  ).join('\n');

  const systemInstruction = `
    You are ZenFocus, an elite productivity coach and AI assistant. 
    Your tone is calm, concise, and scientifically grounded (neuroscience/psychology).
    Your goal is to help the user enter a flow state, avoid burnout, and reflect on their work.
    
    Context:
    The user is currently: ${currentSession}.
    Recent activity:
    ${historySummary || "No recent sessions today."}
    
    If the user asks a specific question, answer it. 
    If not, provide a very short (under 30 words) actionable tip or motivational thought based on their context.
    Do not be generic. Be specific to deep work and focus management.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userQuery || "Give me a quick productivity tip based on my status.",
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency for quick tips
      },
    });

    return response.text || "Keep focused. You're doing great.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to AI Coach. Stay focused internally!";
  }
};

export const analyzeDay = async (logs: SessionLog[]): Promise<string> => {
    if (!ai) return "AI unavailable.";
    
    const totalMinutes = Math.floor(logs.reduce((acc, curr) => acc + curr.duration, 0) / 60);
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `I have focused for ${totalMinutes} minutes today across ${logs.length} sessions. Give me a brief summary analysis of my cognitive load and a recommendation for tomorrow. Return as Markdown.`,
        });
        return response.text || "Great work today.";
    } catch (e) {
        return "Could not analyze data at this time.";
    }
}