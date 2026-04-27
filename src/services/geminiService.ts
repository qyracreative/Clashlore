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
  narration?: string;
  dialogue?: string;
}

export interface ScriptResponse {
  title: string;
  character_arc_seeds?: string[];
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
    
    SPECIAL FOCUS: CHARACTER ORIGINS
    If the prompt involves a character origin story:
    - Focus deeply on PSYCHOLOGICAL DEPTH and FORMATIVE EVENTS.
    - Show, don't just tell, the trauma or defining moments that shaped their motivations and fatal flaws.
    - Every visual and sound choice should reflect the character's internal state.
    
    CONSTRAINTS:
    - Exacly 30 scenes.
    - Each scene represents approximately 8 seconds of footage.
    - Style: Dark, emotional, dramatic, high visual imagination.
    - Pacing: ${options.shortsMode ? "Extremely fast, viral-friendly pacing." : "Measured, cinematic build-up."}
    - Visual Intensity: ${options.cinematicMode ? "Maximum depth, atmospheric details, artistic lighting. Focus on cinematic storytelling through light and shadow." : "Clear, direct visual prompts."}
    - Visual Specificity: For each scene, describe the lighting (e.g., harsh neon, soft golden hour, dramatic chiaroscuro), color palette (e.g., monochromatic blue, high-contrast teal and orange), and composition (e.g., symmetry, leading lines, rule of thirds).
    - Sound Design: Provide intricate audio details. Include specific Foley (e.g., bone crunch, rain on metal, leather boots on gravel), ambient soundscapes (e.g., distant city hum, unsettling silence, wind whistling through ruins), specific sound effects for actions, and character-specific audio cues (e.g., a specific rhythmic breathing, recurring metallic click, or a signature haunting hum). Distinguish between diegetic (in-world sounds like dialogue or footsteps) and non-diegetic (orchestral swells, rhythmic bass pulse, cinematic stingers), and use musical motifs or stingers for key emotional beats.
    - Transitions: Use high-energy and creative transitions frequently (e.g., whip pans for fast movement, match cuts for symbolic similarity, glitch effects for psychological instability).
    - Language: ALL narration and dialogue MUST be in Indonesian (Bahasa Indonesia).
    
    OUTPUT FORMAT:
    You MUST return JSON in the following schema:
    {
      "title": "A short dramatic title for the episode",
      "character_arc_seeds": ["3-5 short sentences in Indonesian about the character's growth trajectory and flaws"],
      "scenes": [
        {
          "scene_number": index,
          "visual": "Highly evocative visual description including lighting, color palette, and composition details",
          "camera": "Camera movement/angle (e.g., Close-up, Low-angle orbit, Handheld shake)",
          "action": "Character movement or environmental shift",
          "emotion": "Tone (e.g., Despair, Rage, Hopeful long-shot)",
          "sound": "Detailed soundscape including ambient atmosphere, specific Foley for actions, character-specific audio cues, diegetic/non-diegetic cues, and musical stingers",
          "transition": "Transition type (e.g., Hard cut, Match cut, Whip pan, Glitch, Zoom transition, Fade to black)",
          "narration": "Optional evocative narration in Indonesian (Bahasa Indonesia)",
          "dialogue": "Optional character dialogue in Indonesian (Bahasa Indonesia)"
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
          character_arc_seeds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
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
                narration: { type: Type.STRING },
                dialogue: { type: Type.STRING },
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
