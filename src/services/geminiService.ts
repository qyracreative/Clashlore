import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface Scene {
  scene_number: number;
  visual: string;
  camera: string;
  action: string;
  emotion: string;
  sound: string;
  transition: string;
}

export interface ScriptResponse {
  title: string;
  scenes: Scene[];
}

export async function generateCinematicScript(
  prompt: string,
  options: { cinematicMode: boolean; shortsMode: boolean }
): Promise<ScriptResponse> {
  if (!apiKey) throw new Error("API Key missing");

  const systemInstruction = `
    You are a world-class cinematic scriptwriter and visual director for viral short-form video (TikTok, YouTube Shorts).
    Your goal is to transform a story prompt into a 30-scene cinematic script.
    
    CONSTRAINTS:
    - Exacly 30 scenes.
    - Each scene represents approximately 8 seconds of footage.
    - Style: Dark, emotional, dramatic, high visual imagination.
    - Pacing: ${options.shortsMode ? "Extremely fast, viral-friendly pacing." : "Measured, cinematic build-up."}
    - Visual Intensity: ${options.cinematicMode ? "Maximum depth, atmospheric details, artistic lighting." : "Clear, direct visual prompts."}
    
    OUTPUT FORMAT:
    You MUST return JSON in the following schema:
    {
      "title": "A short dramatic title for the episode",
      "scenes": [
        {
          "scene_number": index,
          "visual": "Detailed visual description",
          "camera": "Camera movement/angle (e.g., Close-up, Low-angle orbit, Handheld shake)",
          "action": "Character movement or environmental shift",
          "emotion": "Tone (e.g., Despair, Rage, Hopeful long-shot)",
          "sound": "Specific sound effect or ambient atmosphere",
          "transition": "Transition type (e.g., Hard cut, Fade to black, Mirror wipe)"
        }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform this story into a 30-scene script: ${prompt}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["title", "scenes"],
        properties: {
          title: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["scene_number", "visual", "camera", "action", "emotion", "sound", "transition"],
              properties: {
                scene_number: { type: Type.NUMBER },
                visual: { type: Type.STRING },
                camera: { type: Type.STRING },
                action: { type: Type.STRING },
                emotion: { type: Type.STRING },
                sound: { type: Type.STRING },
                transition: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as ScriptResponse;
}
