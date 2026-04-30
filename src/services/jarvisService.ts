import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// Use a getter to avoid crashing at module load if the key is missing
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your environment or GitHub Secrets.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Define Jarvis actions that the AI can trigger.
 */
const openUrlFunction: FunctionDeclaration = {
  name: "open_url",
  parameters: {
    type: Type.OBJECT,
    description: "Opens a URL in a new window/tab.",
    properties: {
      url: {
        type: Type.STRING,
        description: "The full URL to open (e.g., https://www.youtube.com/results?search_query=...) ",
      },
      taskDescription: {
        type: Type.STRING,
        description: "A short description of what is being opened (e.g., 'Searching YouTube for X')",
      }
    },
    required: ["url", "taskDescription"],
  },
};

const tellTimeFunction: FunctionDeclaration = {
  name: "tell_time",
  parameters: {
    type: Type.OBJECT,
    description: "Returns the current local time.",
    properties: {},
  },
};

export const jarvisSystemInstruction = `You are JARVIS, a highly advanced AI assistant inspired by the Marvel Cinematic Universe. 
Your persona is sophisticated, calm, and helpful. 
You can trigger functions to help the user with tasks. 
Always remain in character. Use polite but direct communication.
When the user asks to open something like YouTube or Google, use the 'open_url' tool.
If the user wants to search YouTube for a channel, construct the YouTube search URL.
Current Date: 2026-04-30.`;

interface JarvisAction {
  type: 'TOOL' | 'SPEECH';
  message: string;
  data?: any;
}

export async function processCommand(prompt: string): Promise<JarvisAction[]> {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: jarvisSystemInstruction,
        tools: [{ functionDeclarations: [openUrlFunction, tellTimeFunction] }],
      },
    });

    const actions: JarvisAction[] = [];
    
    // Check for message text
    if (response.text) {
      actions.push({ type: 'SPEECH', message: response.text });
    }

    // Check for function calls
    if (response.functionCalls) {
      for (const call of response.functionCalls) {
        actions.push({ type: 'TOOL', message: `Executing ${call.name}`, data: call });
      }
    }

    return actions;
  } catch (error) {
    console.error("Jarvis Logic Error:", error);
    return [{ type: 'SPEECH', message: "I'm sorry, I've encountered a system glitch. Please repeat your command." }];
  }
}
