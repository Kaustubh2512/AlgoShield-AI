import React from 'react';
import { Github, Cpu, Atom, Layers, Code, Brain, ShieldAlert, Award } from 'lucide-react';

export const LogoLoop: React.FC = () => {
  const items = [
    { icon: <Github className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />, label: 'GitHub Integrations', emoji: '🐙' },
    { 
      icon: (
        <svg className="w-5 h-5 fill-current text-amber-500 group-hover:text-amber-400" viewBox="0 0 100 100">
          <path d="M78.6,83.7h-9.2l-15.6-28.5L34.1,83.7H24.3l25-45.5l-10-18.3H29.6v-8.2h19.5l9.2,16.8l12.7-23.2h9.7L57,48.5L78.6,83.7z" />
        </svg>
      ), 
      label: 'Algorand L1 Blockchain', 
      emoji: '🅰️' 
    },
    { icon: <Cpu className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />, label: 'AlgoShield SDK', emoji: '⚙️' },
    { icon: <Atom className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 animate-[spin_8s_linear_infinite]" />, label: 'React Frontend', emoji: '⚛️' },
    { icon: <Layers className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />, label: 'Blockchain Nodes', emoji: '⛓️' },
    { icon: <Code className="w-5 h-5 text-teal-400 group-hover:text-teal-300" />, label: 'TEAL Smart Contracts', emoji: '💻' },
    { icon: <Brain className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />, label: 'AI Anomaly Detector', emoji: '🧠' },
    { icon: <ShieldAlert className="w-5 h-5 text-rose-500 group-hover:text-rose-400" />, label: 'Vulnerability Scanner', emoji: '🛡️' },
    { icon: <Award className="w-5 h-5 text-amber-500 group-hover:text-amber-400" />, label: 'On-chain NFT Certificates', emoji: '💎' },
  ];

  return (
    <div className="relative w-full overflow-hidden py-10 select-none pointer-events-auto border-t border-b border-white/5 bg-[#0B0F19]/40 backdrop-blur-sm">
      {/* Edge Fades for premium glass transition */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Outer marquee container */}
      <div className="flex w-[200%] items-center overflow-hidden">
        {/* Track 1 */}
        <div className="flex gap-8 shrink-0 items-center justify-around min-w-full animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {items.map((item, idx) => (
            <div 
              key={`t1-${idx}`} 
              className="flex items-center gap-3 px-5 py-2.5 bg-slate-900/60 border border-white/5 rounded-full hover:border-primary/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] group transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-lg">{item.emoji}</span>
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-mono text-xs text-slate-300 group-hover:text-white transition-colors tracking-wide font-semibold">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Track 2 (Duplicate for seamless loop) */}
        <div className="flex gap-8 shrink-0 items-center justify-around min-w-full animate-marquee hover:[animation-play-state:paused] cursor-pointer" aria-hidden="true">
          {items.map((item, idx) => (
            <div 
              key={`t2-${idx}`} 
              className="flex items-center gap-3 px-5 py-2.5 bg-slate-900/60 border border-white/5 rounded-full hover:border-primary/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] group transition-all duration-300 transform hover:scale-105"
            >
              <span className="text-lg">{item.emoji}</span>
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-mono text-xs text-slate-300 group-hover:text-white transition-colors tracking-wide font-semibold">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default LogoLoop;
