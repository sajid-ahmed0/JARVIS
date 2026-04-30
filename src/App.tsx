/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Terminal, Activity, Globe, Youtube, Clock, Power } from 'lucide-react';
import JarvisHUD from './components/JarvisHUD';
import { processCommand } from './services/jarvisService';

// Speech Recognition API setup
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
}

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('SYSTEM READY');
  const [logs, setLogs] = useState<string[]>(['[INITIALIZING CORE OS...]', '[LOADING AI NEURAL NETS...]', '[STABILIZING HUD INTERFACE...]']);
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState('');
  
  const jarvisAudioRef = useRef<HTMLAudioElement | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  };

  const handleSpeechResult = useCallback(async (text: string) => {
    setTranscript(text);
    setStatus('PROCESSING INTENT');
    addLog(`USER_INPUT: "${text}"`);
    setIsThinking(true);
    
    const actions = await processCommand(text);
    
    setIsThinking(false);
    
    for (const action of actions) {
      if (action.type === 'SPEECH') {
        setResponse(action.message);
        addLog(`JARVIS: "${action.message}"`);
        // We could use TTS here if we had a key, but for now we'll use standard browser TTS if desired
        speak(action.message);
      } else if (action.type === 'TOOL') {
        const { name, args } = action.data;
        addLog(`ACTION: ${name} with ${JSON.stringify(args)}`);
        
        if (name === 'open_url') {
          window.open(args.url, '_blank');
          addLog(`OS: Successfully opened ${args.taskDescription}`);
        } else if (name === 'tell_time') {
          const timeStr = new Date().toLocaleTimeString();
          addLog(`OS: Current time is ${timeStr}`);
          setResponse(`The current time is ${timeStr}, sir.`);
          speak(`The current time is ${timeStr}, sir.`);
        }
      }
    }
    
    setStatus('SYSTEM READY');
  }, []);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.9; // Lower pitch for Jarvis-like feel
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognition) {
      addLog("ERROR: Speech Recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setResponse('');
      recognition.start();
      setIsListening(true);
      setStatus('LISTENING...');
      addLog("SENSOR: Audio input activated.");
    }
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      handleSpeechResult(text);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status === 'LISTENING...') {
        setStatus('SYSTEM READY');
      }
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      setStatus('ERROR');
      addLog(`ERROR: Audio sensor failed - ${event.error}`);
    };
  }, [handleSpeechResult, status]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans overflow-hidden p-6">
      {/* Background Scan Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="scan-line absolute inset-0" />
      </div>

      {/* Header HUD */}
      <header className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-jarvis-blue">
            <Activity className="w-4 h-4" />
            <h1 className="font-display font-bold tracking-[0.2em] text-sm md:text-lg">JARVIS-BLUEPRINT-V1</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isThinking ? 'bg-white' : 'bg-jarvis-blue'} animate-pulse`} />
            <span className="font-mono text-[10px] opacity-70 tracking-widest">{status}</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col items-end opacity-50 font-mono text-[10px]">
            <div>CORE_TEMP: 32.4°C</div>
            <div>STABILITY: 99.9%</div>
            <div>UPTIME: 03:24:12</div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="hud-border p-2 rounded-lg bg-jarvis-blue/10 text-jarvis-blue"
            onClick={() => window.location.reload()}
          >
            <Power className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Main HUD Central Area */}
      <main className="relative flex flex-col items-center gap-12 z-10 mt-20">
        <JarvisHUD active={isListening || isThinking} />
        
        {/* Voice Command Area */}
        <div className="flex flex-col items-center gap-6 max-w-2xl text-center">
          <AnimatePresence mode="wait">
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="font-display text-xl text-white/90 italic"
              >
                "{transcript}"
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {response && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={response}
                className="font-sans text-lg text-jarvis-blue border-l-2 border-jarvis-blue pl-4 backdrop-blur-sm bg-jarvis-blue/5 py-3 pr-8"
              >
                {response}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            disabled={isThinking}
            className={`
              mt-4 px-8 py-3 rounded-full font-display font-medium tracking-widest flex items-center gap-3 transition-all
              ${isListening 
                ? 'bg-white text-jarvis-background shadow-[0_0_20px_white]' 
                : 'bg-jarvis-blue/20 text-jarvis-blue hud-border hover:bg-jarvis-blue/30'}
              ${isThinking ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isListening ? (
              <><MicOff className="w-5 h-5" /> RECEPTION_STOP</>
            ) : (
              <><Mic className="w-5 h-5" /> RECEPTION_START</>
            )}
          </motion.button>
        </div>
      </main>

      {/* Side HUD Elements */}
      <aside className="absolute bottom-8 left-8 w-64 md:w-80 hidden lg:block z-10">
        <div className="hud-border bg-jarvis-background/80 backdrop-blur-md p-4 rounded-xl flex flex-col gap-3 max-h-[300px]">
          <div className="flex items-center gap-2 font-display text-xs border-b border-jarvis-blue/20 pb-2">
            <Terminal className="w-3 h-3" />
            <span>SYSTEM_LOGS</span>
          </div>
          <div className="font-mono text-[10px] overflow-y-auto space-y-1 custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className={log.startsWith('[') ? 'text-white/40' : 'text-jarvis-blue'}>{log}</div>
            ))}
          </div>
        </div>
      </aside>

      <aside className="absolute bottom-8 right-8 hidden md:flex flex-col gap-4 z-10">
        <div className="flex gap-4">
           <HUDWidget icon={<Globe />} label="NETWORK" value="CONNECTED" />
           <HUDWidget icon={<Clock />} label="LOCAL_TIME" value={new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} />
        </div>
        <div className="hud-border bg-jarvis-background/80 backdrop-blur-md p-4 rounded-xl">
           <div className="text-[10px] font-mono mb-2 opacity-50">AVAILABLE_COMMANDS</div>
           <div className="flex flex-wrap gap-2">
              <CommandTag label="YouTube Search" />
              <CommandTag label="Google Maps" />
              <CommandTag label="System Status" />
              <CommandTag label="Time Check" />
           </div>
        </div>
      </aside>

      {/* Audio Visualization bars (Decorative) */}
      <div className="absolute bottom-0 w-full flex justify-center gap-1 opacity-20 pointer-events-none">
        {Array.from({length: 40}).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-jarvis-blue"
            animate={{ height: isListening ? [10, Math.random() * 60 + 10, 10] : 10 }}
            transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
          />
        ))}
      </div>
    </div>
  );
}

function HUDWidget({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="hud-border p-3 rounded-xl bg-jarvis-background/80 flex items-center gap-3 w-40">
      <div className="text-jarvis-blue/70">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[8px] font-mono opacity-50 uppercase tracking-tighter">{label}</span>
        <span className="text-[10px] font-mono font-bold tracking-wider">{value}</span>
      </div>
    </div>
  );
}

function CommandTag({ label }: { label: string }) {
  return (
    <div className="px-2 py-1 bg-jarvis-blue/10 border border-jarvis-blue/20 rounded text-[9px] font-mono text-jarvis-blue">
      {label}
    </div>
  );
}
