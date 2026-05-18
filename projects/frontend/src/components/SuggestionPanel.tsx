import React from 'react';
import { Shield, AlertTriangle, AlertCircle, Info, Code, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Suggestion {
  line?: number;
  vulnerability?: string;
  issue?: string;
  description?: string;
  explanation?: string;
  fix?: string;
  severity?: string;
  source?: string;
  lines?: number[];
}

export interface SuggestionPanelProps {
  suggestions: Suggestion[];
  score: number | null;
  summary?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return 'text-safe';
  if (score >= 40) return 'text-warning';
  return 'text-danger';
};

const getScoreBg = (score: number) => {
  if (score >= 70) return 'bg-safe';
  if (score >= 40) return 'bg-warning';
  return 'bg-danger';
};

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
  const config = {
    CRITICAL: { bg: 'bg-danger/10', border: 'border-danger/50', text: 'text-danger', icon: <AlertCircle className="w-3 h-3" /> },
    HIGH: { bg: 'bg-danger/10', border: 'border-danger/50', text: 'text-danger', icon: <AlertTriangle className="w-3 h-3" /> },
    MEDIUM: { bg: 'bg-warning/10', border: 'border-warning/50', text: 'text-warning', icon: <AlertTriangle className="w-3 h-3" /> },
    LOW: { bg: 'bg-secondary/10', border: 'border-secondary/50', text: 'text-secondary', icon: <Info className="w-3 h-3" /> },
  };

  const style = config[severity.toUpperCase() as keyof typeof config] || config.LOW;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold font-mono border ${style.bg} ${style.text} ${style.border}`}>
      {style.icon}
      {severity.toUpperCase()}
    </span>
  );
};

const ScoreGaugeCompact: React.FC<{ score: number }> = ({ score }) => {
  const color = getScoreColor(score);
  const bg = getScoreBg(score);

  return (
    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-border">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="none"
            className={color}
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold font-mono ${color}`}>{score}</span>
        </div>
      </div>
      <div>
        <h3 className="text-white font-syne font-bold">AI Security Score</h3>
        <p className="text-gray-400 text-sm">0-100 Aggregate Rating</p>
      </div>
    </div>
  );
};

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions = [], score = null, summary }) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-8 text-center bg-surface rounded-xl border border-border"
      >
        {score !== null && <ScoreGaugeCompact score={score} />}
        <div className="mt-6">
          <Shield className="w-16 h-16 text-safe mx-auto mb-4" />
          <h3 className="text-safe text-xl font-syne font-bold">No Vulnerabilities Detected</h3>
          <p className="text-gray-400 mt-2">
            The contract implements all essential security checks and patterns evaluated by our system.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-warning" />
        <h2 className="text-2xl font-syne font-bold text-white">Suggestions & Fixes</h2>
      </div>

      {score !== null && <ScoreGaugeCompact score={score} />}

      {summary && (
        <p className="text-gray-400 text-sm font-mono p-3 bg-white/5 rounded-lg border border-border">{summary}</p>
      )}

      <div className="space-y-4">
        {suggestions.map((sug, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 bg-surface rounded-xl border border-border hover:border-white/10 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-white font-syne font-bold text-lg pr-4">
                {sug.vulnerability || sug.issue || 'Unknown Issue'}
              </h3>
              <SeverityBadge severity={sug.severity || 'MEDIUM'} />
            </div>

            {sug.source && (
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="w-3 h-0.5 bg-primary opacity-60 inline-block" />
                Source: {sug.source}
              </p>
            )}

            {sug.lines && sug.lines.length > 0 && (
              <p className="text-warning text-sm font-mono mb-3">
                Detected near line(s): {sug.lines.join(', ')}
              </p>
            )}

            {sug.line && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-gray-400 font-mono mb-3">
                Line {sug.line}
              </div>
            )}

            {(sug.description || sug.explanation) && (
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                {sug.description || sug.explanation}
              </p>
            )}

            {sug.fix && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <h4 className="text-primary text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Code className="w-3 h-3" />
                  Recommended Fix
                </h4>
                <pre className="text-sm font-mono text-indigo-300 whitespace-pre-wrap overflow-x-auto">
                  <code>{sug.fix}</code>
                </pre>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
