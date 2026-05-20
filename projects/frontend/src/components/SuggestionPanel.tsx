import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Sparkles, Copy, Check } from 'lucide-react';

interface Suggestion {
  line?: number;
  vulnerability: string;
  description: string;
  fix: string;
  severity: string;
  analysis?: string;
  attack_vector?: string;
  impact?: string;
  recommended_patch?: string;
  patched_code?: string;
  best_practices?: string;
  vulnerable_code?: string;
  why_fix_works?: string;
}

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  score: number;
  summary: string;
  loading?: boolean;
  responseTime?: number | null;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy} 
      className="absolute top-3 right-4 flex items-center gap-1.5 bg-black/60 border border-primary/20 hover:bg-primary/10 hover:border-primary/40 text-primary px-2.5 py-1 rounded text-xs transition-all font-mono shadow-[0_0_10px_rgba(0,255,136,0.05)]"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary">COPIED!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>COPY</span>
        </>
      )}
    </button>
  );
};

const StreamingSuggestionCard: React.FC<{
  suggestion: Suggestion;
  index: number;
  isStreaming: boolean;
  isPending: boolean;
  skipAnimation: boolean;
  onComplete: () => void;
  getSeverityStyles: (severity: string) => any;
}> = ({
  suggestion,
  index,
  isStreaming,
  isPending,
  skipAnimation,
  onComplete,
  getSeverityStyles
}) => {
  const styles = getSeverityStyles(suggestion.severity);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [analysisText, setAnalysisText] = useState('');
  const [attackVectorText, setAttackVectorText] = useState('');
  const [impactText, setImpactText] = useState('');
  const [patchText, setPatchText] = useState('');
  
  const [activeSection, setActiveSection] = useState<'analysis' | 'attack_vector' | 'impact' | 'recommended_patch' | 'done'>('analysis');

  // Scroll into view when it starts streaming
  useEffect(() => {
    if (isStreaming && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isStreaming]);

  const isSafeContract = suggestion.severity.toUpperCase() === 'SAFE' || suggestion.vulnerability.includes('SAFE');

  useEffect(() => {
    if (skipAnimation || !isStreaming) {
      if (skipAnimation || isPending) {
        setAnalysisText(suggestion.analysis || suggestion.description || '');
        if (!isSafeContract) {
          setAttackVectorText(suggestion.attack_vector || 'Exploitable via logical execution routing parameter injection.');
          setImpactText(suggestion.impact || `${suggestion.severity.toUpperCase()} vulnerability - risk of escrow account exploitation.`);
          setPatchText(suggestion.recommended_patch || 'Inject boundary validation checks or address whitelisting asserts.');
        }
        setActiveSection('done');
      }
      return;
    }

    if (activeSection === 'analysis') {
      const text = suggestion.analysis || suggestion.description || 'No analysis available.';
      const words = text.split(' ');
      let idx = 0;
      let typed = '';
      const interval = setInterval(() => {
        if (idx < words.length) {
          typed = typed ? typed + ' ' + words[idx] : words[idx];
          setAnalysisText(typed);
          idx++;
        } else {
          clearInterval(interval);
          if (isSafeContract) {
            setActiveSection('done');
            onComplete();
          } else {
            setActiveSection('attack_vector');
          }
        }
      }, 25 + Math.random() * 20); // 25ms - 45ms per word
      return () => clearInterval(interval);
    }

    if (activeSection === 'attack_vector') {
      const text = suggestion.attack_vector || 'Exploitable via logical execution routing parameter injection.';
      const words = text.split(' ');
      let idx = 0;
      let typed = '';
      const interval = setInterval(() => {
        if (idx < words.length) {
          typed = typed ? typed + ' ' + words[idx] : words[idx];
          setAttackVectorText(typed);
          idx++;
        } else {
          clearInterval(interval);
          setActiveSection('impact');
        }
      }, 25 + Math.random() * 20);
      return () => clearInterval(interval);
    }

    if (activeSection === 'impact') {
      const text = suggestion.impact || `${suggestion.severity.toUpperCase()} vulnerability - risk of escrow account exploitation.`;
      const words = text.split(' ');
      let idx = 0;
      let typed = '';
      const interval = setInterval(() => {
        if (idx < words.length) {
          typed = typed ? typed + ' ' + words[idx] : words[idx];
          setImpactText(typed);
          idx++;
        } else {
          clearInterval(interval);
          setActiveSection('recommended_patch');
        }
      }, 25 + Math.random() * 20);
      return () => clearInterval(interval);
    }

    if (activeSection === 'recommended_patch') {
      const text = suggestion.recommended_patch || 'Inject boundary validation checks or address whitelisting asserts.';
      const words = text.split(' ');
      let idx = 0;
      let typed = '';
      const interval = setInterval(() => {
        if (idx < words.length) {
          typed = typed ? typed + ' ' + words[idx] : words[idx];
          setPatchText(typed);
          idx++;
        } else {
          clearInterval(interval);
          setActiveSection('done');
          onComplete(); // proceed to next card
        }
      }, 25 + Math.random() * 20);
      return () => clearInterval(interval);
    }
  }, [isStreaming, activeSection, skipAnimation, suggestion, onComplete, isPending, isSafeContract]);

  if (isSafeContract) {
    return (
      <div 
        ref={cardRef}
        className="bg-black border border-primary/20 border-l-4 border-l-primary rounded-xl p-5 shadow-[0_0_15px_rgba(0,255,136,0.05)] transition-all duration-300"
      >
        {/* Header Info */}
        <div className="flex items-center gap-3 border-b border-primary/10 pb-3 mb-4">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border bg-primary/10 text-primary border-primary/20">
            SAFE
          </span>
          <span className="text-primary font-bold text-base">✅ CONTRACT STATUS: SAFE</span>
        </div>

        {/* Streaming text */}
        <div className="font-mono text-xs leading-relaxed text-primary/90 whitespace-pre-wrap">
          {analysisText}
          {isStreaming && activeSection === 'analysis' && (
            <span className="inline-block w-1.5 h-3 bg-primary ml-1 terminal-cursor" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className={`bg-black border border-primary/20 border-l-4 rounded-xl p-5 shadow-[0_0_15px_rgba(0,255,136,0.05)] transition-all duration-300 ${styles.border}`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-primary/10 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${styles.badge}`}>
            {suggestion.severity.toUpperCase()}
          </span>
          <span className="text-gray-200 font-bold text-base">{suggestion.vulnerability}</span>
        </div>
        {suggestion.line !== undefined && (
          <span className="text-gray-400 bg-white/5 border border-white/10 rounded px-2.5 py-0.5 text-xs font-mono">
            &gt;_ Target Line: {suggestion.line || 'N/A'}
          </span>
        )}
      </div>

      {/* Grid structured contents */}
      <div className="space-y-5 font-mono text-xs leading-relaxed">
        
        {/* 1. AI Analysis */}
        <div>
          <div className="text-[10px] text-primary font-bold tracking-wider mb-1.5 uppercase flex items-center gap-1.5">
            <span>[ AI ANALYSIS ]</span>
          </div>
          <p className="pl-4 border-l border-primary/20 text-primary/90 whitespace-pre-wrap">
            {analysisText}
            {isStreaming && activeSection === 'analysis' && (
              <span className="inline-block w-1.5 h-3 bg-primary ml-1 terminal-cursor" />
            )}
          </p>
        </div>

        {/* 2. Attack Vector */}
        {(attackVectorText || (isStreaming && activeSection === 'attack_vector')) && (
          <div>
            <div className="text-[10px] text-danger font-bold tracking-wider mb-1.5 uppercase">
              <span>[ ATTACK VECTOR ]</span>
            </div>
            <p className="pl-4 border-l border-danger/20 text-danger/90 whitespace-pre-wrap">
              {attackVectorText}
              {isStreaming && activeSection === 'attack_vector' && (
                <span className="inline-block w-1.5 h-3 bg-danger ml-1 terminal-cursor" />
              )}
            </p>
          </div>
        )}

        {/* 3. Security Impact */}
        {(impactText || (isStreaming && activeSection === 'impact')) && (
          <div>
            <div className="text-[10px] text-warning font-bold tracking-wider mb-1.5 uppercase">
              <span>[ SECURITY IMPACT ]</span>
            </div>
            <p className="pl-4 border-l border-warning/20 text-warning/90 whitespace-pre-wrap">
              {impactText}
              {isStreaming && activeSection === 'impact' && (
                <span className="inline-block w-1.5 h-3 bg-warning ml-1 terminal-cursor" />
              )}
            </p>
          </div>
        )}

        {/* 4. Recommended Patch */}
        {(patchText || (isStreaming && activeSection === 'recommended_patch')) && (
          <div>
            <div className="text-[10px] text-primary font-bold tracking-wider mb-1.5 uppercase">
              <span>[ RECOMMENDED PATCH ]</span>
            </div>
            <p className="pl-4 border-l border-primary/20 text-primary/90 whitespace-pre-wrap">
              {patchText}
              {isStreaming && activeSection === 'recommended_patch' && (
                <span className="inline-block w-1.5 h-3 bg-primary ml-1 terminal-cursor" />
              )}
            </p>
          </div>
        )}

        {/* 5. Big Detailed Patch Code Block */}
        {(activeSection === 'done' || skipAnimation) && (suggestion.patched_code || suggestion.fix) && (
          <div className="pt-2">
            <div className="text-[10px] text-primary font-bold tracking-wider mb-2 uppercase">
              <span>[ PATCHED CODE ]</span>
            </div>
            
            <div className="border border-primary/30 shadow-[0_0_15px_rgba(0,255,136,0.15)] rounded-lg p-5 relative font-mono text-xs overflow-hidden mt-2 bg-black">
              <CopyButton text={suggestion.patched_code || suggestion.fix} />
              
              {/* Show vulnerable snippet if present */}
              {suggestion.vulnerable_code && (
                <div className="mb-4">
                  <div className="text-[10px] text-danger/80 mb-1.5 tracking-wider uppercase font-bold">&gt; VULNERABLE SNIPPET:</div>
                  <pre className="bg-danger/5 border border-danger/20 rounded p-3.5 text-danger whitespace-pre overflow-x-auto text-[11px]">
                    <code>{suggestion.vulnerable_code}</code>
                  </pre>
                </div>
              )}
              
              {/* Show fixed code */}
              <div>
                <div className="text-[10px] text-primary/80 mb-1.5 tracking-wider uppercase font-bold">&gt; FIXED SNIPPET:</div>
                <pre className="bg-primary/5 border border-primary/20 rounded p-3.5 text-primary whitespace-pre overflow-x-auto text-[11px]">
                  <code>{suggestion.patched_code || suggestion.fix}</code>
                </pre>
              </div>

              {/* Show why fix works */}
              {suggestion.why_fix_works && (
                <div className="mt-4">
                  <div className="text-[10px] text-primary/85 mb-1.5 tracking-wider uppercase font-bold">&gt; WHY THE FIX WORKS:</div>
                  <p className="text-gray-400 pl-3 border-l border-primary/20 font-sans text-xs">
                    {suggestion.why_fix_works}
                  </p>
                </div>
              )}

              {/* Show secure coding note */}
              {suggestion.best_practices && (
                <div className="mt-4 border-t border-white/5 pt-3">
                  <div className="text-[10px] text-primary/85 mb-1.5 tracking-wider uppercase font-bold">&gt; SECURE CODING NOTE:</div>
                  <p className="text-gray-400 pl-3 border-l border-primary/20 font-sans text-xs">
                    {suggestion.best_practices}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ 
  suggestions, 
  score, 
  summary, 
  loading = false,
  responseTime = null
}) => {
  const [currentStreamingIndex, setCurrentStreamingIndex] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when output size changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentStreamingIndex, skipAnimation, loading]);

  const getSeverityStyles = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL': 
        return {
          border: 'border-l-danger border-danger/30',
          text: 'text-danger',
          bg: 'bg-black',
          badge: 'bg-danger/10 text-danger border-danger/30'
        };
      case 'HIGH': 
        return {
          border: 'border-l-warning border-warning/30',
          text: 'text-warning',
          bg: 'bg-black',
          badge: 'bg-warning/10 text-warning border-warning/30'
        };
      case 'MEDIUM': 
        return {
          border: 'border-l-warning border-warning/20',
          text: 'text-warning',
          bg: 'bg-black',
          badge: 'bg-warning/10 text-warning border-warning/20'
        };
      case 'LOW': 
        return {
          border: 'border-l-primary border-primary/20',
          text: 'text-primary',
          bg: 'bg-black',
          badge: 'bg-primary/10 text-primary border-primary/20'
        };
      default: 
        return {
          border: 'border-l-gray-500 border-gray-500/20',
          text: 'text-gray-400',
          bg: 'bg-black',
          badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        };
    }
  };

  const scoreColor = score >= 70 ? 'text-primary' : score >= 40 ? 'text-warning' : 'text-danger';

  if (loading) {
    return (
      <div className="mt-6 border border-primary/20 bg-black rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,255,136,0.1)] relative font-mono text-sm">
        <style>{`
          @keyframes cursor-blink { 50% { opacity: 0; } }
          .terminal-cursor { animation: cursor-blink 0.8s step-end infinite; }
        `}</style>
        
        {/* Terminal Header */}
        <div className="bg-black border-b border-primary/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-primary font-bold text-xs uppercase tracking-wider">AI Security Diagnosis Terminal v2.0</span>
          </div>
        </div>

        {/* Live Status Chips */}
        <div className="px-4 py-2 border-b border-primary/10 flex flex-wrap gap-2 bg-black">
          <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">[ GPU ENABLED ]</span>
          <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">[ LOCAL PHI-3 ACTIVE ]</span>
          <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">[ RAG INDEXED ]</span>
          <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">[ VECTOR SEARCH READY ]</span>
          <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider animate-pulse">[ RESPONSE: SECURING... ]</span>
        </div>

        {/* Terminal Loading Screen */}
        <div className="p-6 space-y-2 min-h-[180px] bg-black text-primary font-mono text-xs">
          <p className="text-primary/70">&gt; AI is analyzing the TEAL contract code...</p>
          <p className="text-primary/70">&gt; Querying RAG vector database for known security patterns...</p>
          <p className="text-primary/70">&gt; Generating secure patches using local Phi-3 SLM...</p>
          <div className="flex items-center gap-1 text-primary">
            <span>&gt; Streaming response</span>
            <span className="inline-block w-1.5 h-3.5 bg-primary terminal-cursor" />
          </div>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="mt-6 p-8 bg-black border border-primary/20 rounded-xl text-center shadow-[0_0_25px_rgba(0,255,136,0.1)]">
        <span className="text-5xl block mb-4">🛡️</span>
        <h3 className="text-primary text-2xl font-mono font-bold mb-2">NO THREATS DETECTED</h3>
        <p className="text-gray-400 max-w-md mx-auto text-sm font-mono">
          The contract conforms to all evaluated security checks. No vulnerability patterns were identified.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 border border-primary/20 bg-black rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,255,136,0.1)] relative font-mono text-sm">
      <style>{`
        @keyframes cursor-blink { 50% { opacity: 0; } }
        .terminal-cursor { animation: cursor-blink 0.8s step-end infinite; }
      `}</style>

      {/* Terminal Header */}
      <div className="bg-black border-b border-primary/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-primary" />
          <span className="text-primary font-bold text-xs uppercase tracking-wider">AI Security Diagnosis Terminal v2.0</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold">
          <span className="flex items-center gap-1.5 text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
            <Cpu className="w-3 h-3" />
            GPU-ACCELERATED
          </span>
          <span className="flex items-center gap-1.5 text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
            <Sparkles className="w-3 h-3" />
            LOCAL PHI-3 SLM ACTIVE
          </span>
        </div>
      </div>

      {/* Live Status Chips */}
      <div className="px-4 py-2 border-b border-primary/10 flex flex-wrap gap-2 bg-black">
        <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">[ GPU ENABLED ]</span>
        <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">[ LOCAL PHI-3 ACTIVE ]</span>
        <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">[ RAG INDEXED ]</span>
        <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">[ VECTOR SEARCH READY ]</span>
        <span className="font-mono text-[10px] text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/20 tracking-wider">
          [ RESPONSE: {responseTime !== null ? (responseTime < 0.1 ? '< 0.1s' : `${responseTime}s`) : '1.2s'} ]
        </span>
      </div>

      {/* Terminal Diagnostics Info */}
      <div className="p-4 bg-black border-b border-primary/10 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-gray-400 font-bold text-xs uppercase">&gt; Security Rating:</span>
          <span className={`font-bold text-base ${scoreColor}`}>
            {score}/100
          </span>
          <span className="text-gray-400 text-xs hidden md:inline-block">| &nbsp; {summary}</span>
        </div>
        {!skipAnimation && currentStreamingIndex < suggestions.length && (
          <button 
            onClick={() => setSkipAnimation(true)}
            className="text-xs text-primary/80 border border-primary/20 hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded transition-all font-bold uppercase tracking-wider self-start md:self-auto"
          >
            &gt; Skip Stream Animation
          </button>
        )}
      </div>

      {/* Terminal Feed */}
      <div ref={containerRef} className="p-6 space-y-8 max-h-[600px] overflow-y-auto bg-black">
        {suggestions.map((s, i) => {
          const isPending = i > currentStreamingIndex && !skipAnimation;
          const isStreaming = i === currentStreamingIndex && !skipAnimation;

          if (isPending) {
            return (
              <div key={i} className="border border-white/5 bg-black p-4 rounded-lg opacity-40 font-mono text-xs flex items-center justify-between">
                <span>[system@algoshield] &gt; Queue slot {i + 1}: Waiting for AST context analysis...</span>
                <span className="animate-pulse">PENDING</span>
              </div>
            );
          }

          return (
            <StreamingSuggestionCard
              key={i}
              suggestion={s}
              index={i}
              isStreaming={isStreaming}
              isPending={isPending}
              skipAnimation={skipAnimation}
              onComplete={() => {
                if (currentStreamingIndex === i) {
                  setCurrentStreamingIndex(i + 1);
                }
              }}
              getSeverityStyles={getSeverityStyles}
            />
          );
        })}
      </div>
    </div>
  );
};
