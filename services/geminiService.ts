import { GoogleGenAI } from "@google/genai";
import { GeneratedResult } from "../types";

const BASE_SYSTEM_PROMPT = `
You are an expert Senior Frontend Engineer and UI/UX Designer specializing in React and Tailwind CSS. 
Your task is to analyze a provided image of a UI sketch, wireframe, or mockup and convert it into clean, production-ready code.

You must output your response in a structured format with specific delimiters so it can be parsed programmatically.

Structure your response exactly as follows:

<<<HTML_START>>>
[Insert the complete, standalone HTML file here. Include the Tailwind CSS CDN script in the head. The body should contain the implementation of the UI seen in the image. Make it look modern and beautiful, interpreting the sketch's intent. Use distinct colors and good spacing.]
<<<HTML_END>>>

<<<REACT_START>>>
[Insert the React component code here. Use functional components with hooks. Assume 'lucide-react' icons are available. Use Tailwind CSS classes for styling. Do not include imports for React itself, just the component definition and any sub-components.]
<<<REACT_END>>>

<<<EXPLANATION_START>>>
[A brief summary of the design decisions you made, how you interpreted the sketch, and any assumptions made about functionality.]
<<<EXPLANATION_END>>>

Rules:
1. The code must be responsive.
2. Use modern Tailwind utility classes.
3. Interpret scribbles or rough shapes as their most likely UI component counterparts.
`;

const parseResponse = (text: string): GeneratedResult => {
  const htmlMatch = text.match(/<<<HTML_START>>>([\s\S]*?)<<<HTML_END>>>/);
  const reactMatch = text.match(/<<<REACT_START>>>([\s\S]*?)<<<REACT_END>>>/);
  const explanationMatch = text.match(/<<<EXPLANATION_START>>>([\s\S]*?)<<<EXPLANATION_END>>>/);

  if (!htmlMatch && !reactMatch) {
    throw new Error("Failed to generate valid code structure. The model output was malformed.");
  }

  return {
    html: htmlMatch ? htmlMatch[1].trim() : "<!-- No HTML generated -->",
    react: reactMatch ? reactMatch[1].trim() : "// No React code generated",
    explanation: explanationMatch ? explanationMatch[1].trim() : "No explanation provided.",
  };
};

export const generateCodeFromSketch = async (base64Image: string, additionalContext?: string): Promise<GeneratedResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please select a key first.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const promptParts = [
      { text: BASE_SYSTEM_PROMPT },
      {
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64
        }
      }
    ];

    if (additionalContext) {
      promptParts.push({ text: `Additional User Instructions: ${additionalContext}. IMPORTANT: Prioritize these instructions over the sketch if they conflict.` });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: promptParts },
      config: {
        temperature: 0.4,
      }
    });

    return parseResponse(response.text || "");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const refineCode = async (
  base64Image: string, 
  currentHtml: string, 
  userInstruction: string
): Promise<GeneratedResult> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const refinementPrompt = `
    ${BASE_SYSTEM_PROMPT}

    CONTEXT:
    The user wants to modify the previously generated code based on new instructions.
    
    CURRENT HTML CODE:
    ${currentHtml}

    USER REFINEMENT INSTRUCTION:
    "${userInstruction}"

    TASK:
    Regenerate the code (HTML and React) implementing the user's changes while maintaining the structure of the sketch provided in the image image.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: refinementPrompt },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          }
        ]
      },
      config: { temperature: 0.4 }
    });

    return parseResponse(response.text || "");
  } catch (error) {
    console.error("Gemini Refinement Error:", error);
    throw error;
  }
};

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const chatWithAssistant = async (history: ChatMessage[], message: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are "Hyper-Glass Assist", a highly creative and technical UI/UX Design Consultant embedded in a prototyping application.
      
      Your Goal: Help the user refine their app ideas, choose color palettes, suggest UX patterns, and clarify technical concepts (React/Tailwind).
      
      Personality: Professional, concise, slightly futuristic/technical tone, helpful, and encouraging.
      
      Context: The user is using an app that converts hand-drawn sketches to code. They might ask about how to draw better sketches for the AI, or how to improve the generated design.`
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }))
  });

  const result = await chat.sendMessage({ message });
  return result.text || "I'm having trouble connecting to the design database. Please try again.";
};