import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  Film, 
  Zap, 
  ChevronRight, 
  Monitor,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateCinematicScript, type ScriptResponse } from "./services/geminiService";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(true);
  const [shortsMode, setShortsMode] = useState(false);
  const [copiedSceneIndex, setCopiedSceneIndex] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Handle URL Query Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPrompt = params.get("prompt");
    const urlChar = params.get("char");

    if (urlPrompt) {
      setPrompt(urlPrompt);
      handleGenerate(urlPrompt);
    } else if (urlChar) {
      const charPrompt = `Create a cinematic origin story for the character: ${urlChar}. Focus on their trauma, psychological depth, and eventual rise to power.`;
      setPrompt(charPrompt);
      handleGenerate(charPrompt);
    }
  }, []);

  const handleGenerate = async (targetPrompt?: string) => {
    const activePrompt = targetPrompt || prompt;
    if (!activePrompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const script = await generateCinematicScript(activePrompt, { 
        cinematicMode, 
        shortsMode 
      });
      setResult(script);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("Failed to generate cinematic script. Please check your AI configuration.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = result.scenes.map(s => 
      `Scene ${s.scene_number}:\n- Visual: ${s.visual}\n- Camera: ${s.camera}\n- Action: ${s.action}\n- Emotion: ${s.emotion}\n- Sound: ${s.sound}\n- Transition: ${s.transition}${s.narration ? `\n- Narration: ${s.narration}` : ""}${s.dialogue ? `\n- Dialogue: ${s.dialogue}` : ""}`
    ).join("\n\n");
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!result) return;
    const text = `TITLE: ${result.title}\n\n` + result.scenes.map(s => 
      `Scene ${s.scene_number}:\n- Visual: ${s.visual}\n- Camera: ${s.camera}\n- Action: ${s.action}\n- Emotion: ${s.emotion}\n- Sound: ${s.sound}\n- Transition: ${s.transition}${s.narration ? `\n- Narration: ${s.narration}` : ""}${s.dialogue ? `\n- Dialogue: ${s.dialogue}` : ""}`
    ).join("\n\n");
    
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, "_")}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copySceneToClipboard = (scene: any, index: number) => {
    const text = `Scene ${scene.scene_number}:\n- Visual: ${scene.visual}\n- Camera: ${scene.camera}\n- Action: ${scene.action}\n- Emotion: ${scene.emotion}\n- Sound: ${scene.sound}\n- Transition: ${scene.transition}${scene.narration ? `\n- Narration: ${scene.narration}` : ""}${scene.dialogue ? `\n- Dialogue: ${scene.dialogue}` : ""}`;
    navigator.clipboard.writeText(text);
    setCopiedSceneIndex(index);
    setTimeout(() => setCopiedSceneIndex(null), 2000);
  };

  return (
    <div className="h-screen bg-[#050505] text-zinc-400 font-sans p-4 md:p-6 flex flex-col overflow-hidden selection:bg-orange-600/30">
      {/* Header Section */}
      <header className="flex items-center justify-between mb-6 border-b border-white/10 pb-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center text-black font-black italic shadow-[0_0_15px_rgba(234,88,12,0.2)]">
            E.AI
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight text-xl">EPISODIC<span className="text-orange-600">.AI</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Cinematic Engine v2.4 // Vercel Cloud</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-zinc-900 border border-white/5 p-1 rounded-md">
            <button 
              onClick={() => setCinematicMode(true)}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${cinematicMode ? 'bg-orange-600 text-black shadow-lg' : 'text-zinc-500'}`}
            >
              CINEMATIC
            </button>
            <button 
              onClick={() => setCinematicMode(false)}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${!cinematicMode ? 'bg-orange-600 text-black shadow-lg' : 'text-zinc-500'}`}
            >
              STANDARD
            </button>
          </div>
          <div className="hidden md:flex bg-zinc-900 border border-white/5 p-1 rounded-md">
            <button 
              onClick={() => setShortsMode(false)}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${!shortsMode ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
            >
              LONG
            </button>
            <button 
              onClick={() => setShortsMode(true)}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${shortsMode ? 'bg-orange-600 text-black shadow-lg' : 'text-zinc-500'}`}
            >
              SHORTS
            </button>
          </div>
          <button 
            onClick={copyToClipboard}
            className="bg-white text-black px-4 py-1.5 rounded text-xs font-bold hover:bg-orange-600 hover:text-white transition-all active:scale-95 flex items-center gap-2"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "COPIED" : "COPY SCRIPT"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Sidebar Configuration */}
        <aside className="w-80 flex flex-col gap-4 hidden lg:flex shrink-0">
          <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-lg flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest block">Input Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter character context or scene prompt..."
                className="w-full bg-black border border-white/10 rounded p-3 text-xs h-40 resize-none focus:outline-none focus:border-orange-600/50 text-zinc-200 font-light leading-relaxed scrollbar-hide"
              />
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium">Total Scenes</span>
              <span className="text-xs font-mono text-white">30</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium">Episode Length</span>
              <span className="text-xs font-mono text-white">240s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium">Scene Cadence</span>
              <span className="text-xs font-mono text-white">8s Fixed</span>
            </div>
            <div className="h-[1px] bg-white/10 my-1"></div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-medium">Status</span>
              {loading ? (
                <span className="text-[10px] font-bold text-orange-500 flex items-center gap-2">
                  <Loader2 size={10} className="animate-spin" /> GENERATING
                </span>
              ) : result ? (
                <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> READY
                </span>
              ) : (
                <span className="text-[10px] font-bold text-zinc-600">IDLE</span>
              )}
            </div>
          </div>

          <div className="mt-auto space-y-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded text-[10px] text-red-400 flex items-start gap-2">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <button 
              onClick={() => handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 bg-orange-600 text-black font-black text-sm tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {result ? "REGENERATE EPISODE" : "INITIATE SEQUENCE"}
            </button>
          </div>
        </aside>

        {/* Main Output: Scene List */}
        <main className="flex-1 bg-zinc-900/10 border border-white/10 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 px-5 border-b border-white/10 bg-black/40 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Structured Script Output</span>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-orange-600">{result?.title || "NO_TITLE_LOADED"}</span>
              <span className="text-[10px] font-mono text-zinc-600">01—30</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <Film size={48} />
                <p className="text-xs uppercase tracking-widest font-mono">System ready. Waiting for prompt input.</p>
              </div>
            )}

            {loading && !result && (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-12 h-12 border-2 border-orange-600 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(234,88,12,0.2)]"></div>
                <div className="text-center">
                  <p className="text-xs font-mono text-orange-500 animate-pulse uppercase tracking-[0.3em]">Processing Visual Context</p>
                  <p className="text-[10px] text-zinc-600 mt-2">Constructing 30-scene temporal grid...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6 pb-12">
                {result.character_arc_seeds && result.character_arc_seeds.length > 0 && (
                  <div className="bg-orange-600/5 border border-orange-600/20 rounded-lg p-6 max-w-4xl mx-auto">
                    <h3 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                       CHARACTER ARC SEEDS
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                      {result.character_arc_seeds.map((seed, idx) => (
                        <li key={idx} className="text-zinc-300 text-[11px] leading-relaxed flex gap-3 italic">
                          <span className="text-orange-600/50 font-mono font-bold">{idx + 1}.</span>
                          {seed}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {result.scenes.map((scene, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 border-l-2 border-l-white/20 hover:border-l-orange-600 p-4 rounded transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xs font-black text-white flex items-center gap-2">
                        SCENE {String(scene.scene_number).padStart(2, "0")}
                        <span className="text-zinc-600 font-mono font-normal text-[10px]">[{String(Math.floor((idx * 8) / 60)).padStart(2, "0")}:{String((idx * 8) % 60).padStart(2, "0")}—{String(Math.floor(((idx + 1) * 8) / 60)).padStart(2, "0")}:{String(((idx + 1) * 8) % 60).padStart(2, "0")}]</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copySceneToClipboard(scene, idx)}
                          className={`p-1 rounded transition-all flex items-center gap-1.5 px-2 ${
                            copiedSceneIndex === idx 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-white/5 hover:bg-orange-600 hover:text-white text-zinc-500 border border-white/10'
                          }`}
                        >
                          {copiedSceneIndex === idx ? <Check size={10} /> : <Copy size={10} />}
                          <span className="text-[8px] font-black uppercase tracking-wider">
                            {copiedSceneIndex === idx ? "Copied" : "Copy"}
                          </span>
                        </button>
                        <span className={`text-[9px] border px-2 py-0.5 rounded font-mono transition-all uppercase ${
                          ['match', 'whip', 'glitch', 'zoom', 'morph', 'j-cut', 'l-cut'].some(key => scene.transition.toLowerCase().includes(key))
                            ? 'bg-orange-600/20 border-orange-600/50 text-orange-400 group-hover:bg-orange-600 group-hover:text-black shadow-[0_0_10px_rgba(234,88,12,0.1)]'
                            : 'bg-white/5 border-white/10 text-zinc-500 group-hover:text-orange-500'
                        }`}>
                          {scene.transition}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 text-[11px] leading-relaxed">
                      <div className="grid grid-cols-[50px_1fr] gap-2">
                        <span className="text-zinc-600 uppercase text-[9px] font-black mt-0.5">Visual</span>
                        <p className="grow text-zinc-200">{scene.visual}</p>
                      </div>
                      <div className="grid grid-cols-[50px_1fr] gap-2">
                        <span className="text-zinc-600 uppercase text-[9px] font-black mt-0.5">Camera</span>
                        <p className="grow text-zinc-400 font-mono">{scene.camera}</p>
                      </div>
                      <div className="grid grid-cols-[50px_1fr] gap-2">
                        <span className="text-zinc-600 uppercase text-[9px] font-black mt-0.5">Motion</span>
                        <p className="grow text-zinc-400 italic">{scene.action}</p>
                      </div>

                      {scene.narration && (
                        <div className="grid grid-cols-[50px_1fr] gap-2 bg-zinc-800/20 p-2 rounded border border-white/5">
                          <span className="text-orange-600 uppercase text-[9px] font-black mt-0.5">Narasi</span>
                          <p className="grow text-zinc-300 italic font-medium">"{scene.narration}"</p>
                        </div>
                      )}

                      {scene.dialogue && (
                        <div className="grid grid-cols-[50px_1fr] gap-2 bg-blue-900/10 p-2 rounded border border-blue-500/10">
                          <span className="text-blue-400 uppercase text-[9px] font-black mt-0.5">Dialog</span>
                          <p className="grow text-blue-100 font-bold">"{scene.dialogue}"</p>
                        </div>
                      )}
                      
                      <div className="flex gap-4 pt-2 mt-2 border-t border-white/5">
                        <div className="flex flex-col">
                          <span className="text-zinc-600 uppercase text-[8px] font-black">Tone</span>
                          <span className="text-[9px] font-mono text-zinc-500">{scene.emotion}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-600 uppercase text-[8px] font-black">Audio</span>
                          <span className="text-[9px] font-mono text-zinc-500">{scene.sound}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      </div>

      {/* Footer Bar */}
      <footer className="mt-4 border-t border-white/10 pt-3 flex flex-col md:flex-row justify-between items-center shrink-0">
        <div className="flex gap-6 mb-4 md:mb-0">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">Session ID</span>
            <span className="text-[11px] text-zinc-400 font-mono uppercase">{result ? `ARC_${result.title.slice(0,3)}_${Date.now().toString().slice(-4)}` : "AUTH_PENDING"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">World Model</span>
            <span className="text-[11px] text-zinc-400 font-mono">NEO_REALITY_V4.2</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono font-bold">
          <span className="text-zinc-600">DOWNLOAD:</span>
          <button onClick={downloadTxt} className="text-zinc-400 hover:text-orange-600 transition-colors uppercase">.TXT</button>
          <button className="text-zinc-400 hover:text-orange-600 transition-colors uppercase opacity-50 cursor-not-allowed">.JSON</button>
          <button className="text-zinc-400 hover:text-orange-600 transition-colors uppercase opacity-50 cursor-not-allowed">.CSV</button>
        </div>
      </footer>
    </div>
  );
}
