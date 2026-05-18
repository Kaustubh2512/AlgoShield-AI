import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ShieldCheck, FileText, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export const LegalPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');
  const [accepted, setAccepted] = useState(false);

  const privacyPoints = [
    {
      title: 'Zero-Knowledge Contract Scanning',
      desc: 'All smart contract source code uploaded (.teal or App ID) is parsed in memory in a secure sandboxed environment. We do not store your intellectual property or source code permanently in plain text.',
    },
    {
      title: 'Wallet Metadata & Non-Custodial Access',
      desc: 'AlgoShield AI connects with Pera Wallet via a non-custodial protocol. We only read your public wallet address to associate security scores, certificates, and alerts. We never request private keys.',
    },
    {
      title: 'Decentralized Monitoring Privacy',
      desc: 'Continuous anomaly monitoring stores transaction logs in an encrypted PostgreSQL/Supabase database. No real-world identity or IP details are tracked alongside the wallet addresses.',
    },
    {
      title: 'DPDP & GDPR Compliance',
      desc: 'We comply with global data protection guidelines. You retain full control over your scans, alerts history, and email subscriptions. You can request deletion of scan histories at any time.',
    },
  ];

  const termsPoints = [
    {
      title: 'AI Smart Contract Audit Disclaimer',
      desc: 'AlgoShield AI utilizes a hybrid Random Forest ML and Phi-3-mini SLM engine. Scans identify known TEAL patterns and exploits, but they do NOT guarantee 100% vulnerability-free code or replace full manual audits.',
    },
    {
      title: 'ARC-69 Certificate NFTs',
      desc: 'Verified security certificates are minted as ARC-69 NFTs on the Algorand Testnet. Minting requires a score >= 70. These tokens represent cryptographic proof of scanning but are not financial advice.',
    },
    {
      title: 'Prohibited Exploitative Testing',
      desc: 'You agree not to use the automated scanner to probe smart contracts that you do not own or lack explicit permission to audit. Any scraping or reverse-engineering of our scoring model is forbidden.',
    },
    {
      title: 'Limitation of Liability',
      desc: 'AlgoShield AI, its contributors, and Team QANTAS are not liable for any financial losses, hack events, or protocol exploits occurring on smart contracts analyzed by this platform.',
    },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 py-20 pointer-events-auto relative z-10">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
          <Scale className="w-4 h-4 text-secondary" />
          <span className="font-mono text-xs text-secondary tracking-wider uppercase font-semibold">AlgoShield Compliance</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-syne font-bold">
          Legal <span className="text-primary">&amp; Policy</span> Suite
        </h2>
        <p className="text-slate-400 font-sans max-w-xl mx-auto text-sm md:text-base">
          Read our automated scanner service guidelines, privacy safeguards, and non-custodial smart contract terms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Control Bar */}
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
              activeTab === 'privacy'
                ? 'bg-secondary/15 border-secondary/40 shadow-[0_0_20px_rgba(139,92,246,0.15)] text-white'
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className={`w-6 h-6 shrink-0 mt-0.5 ${activeTab === 'privacy' ? 'text-secondary' : 'text-slate-400'}`} />
            <div>
              <h4 className="font-syne font-bold text-base">Privacy Policy</h4>
              <p className="text-xs opacity-75 mt-1 font-sans">Learn how we securely handle your smart contract TEAL files and wallet data.</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto shrink-0 mt-1" />
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
              activeTab === 'terms'
                ? 'bg-primary/15 border-primary/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] text-white'
                : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
            }`}
          >
            <FileText className={`w-6 h-6 shrink-0 mt-0.5 ${activeTab === 'terms' ? 'text-primary' : 'text-slate-400'}`} />
            <div>
              <h4 className="font-syne font-bold text-base">Terms of Service</h4>
              <p className="text-xs opacity-75 mt-1 font-sans">Our smart contract AI audit disclaimers, NFT minting, and code rules.</p>
            </div>
            <ChevronRight className="w-4 h-4 ml-auto shrink-0 mt-1" />
          </button>

          {/* Compliance Card */}
          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/25 space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs text-primary font-bold">COMPLIANCE HUB</span>
            </div>
            <p className="text-xs text-slate-400 leading-[1.6]">
              By initiating smart contract audits or active address monitoring on AlgoShield, you signify your compliance with our safety frameworks.
            </p>
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="rounded border-white/10 text-secondary focus:ring-secondary/50 bg-slate-950 w-4 h-4 transition-colors"
                />
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors select-none font-medium">
                  Acknowledge and agree to terms
                </span>
              </label>
            </div>
            {accepted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-mono"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                CONSENT ENCRYPTED &amp; RECORDED
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-xl p-8 backdrop-blur-md min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'privacy' ? (
              <motion.div
                key="privacy-policy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-grow"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <ShieldCheck className="w-8 h-8 text-secondary" />
                  <div>
                    <h3 className="font-syne font-bold text-2xl text-white">Privacy Policy</h3>
                    <p className="text-xs text-slate-400 font-mono">Last modified: May 17, 2026</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {privacyPoints.map((point, index) => (
                    <div key={index} className="space-y-2 p-4 bg-slate-950/30 border border-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-secondary font-bold">0{index + 1}.</span>
                        <h5 className="font-syne font-bold text-sm text-slate-100">{point.title}</h5>
                      </div>
                      <p className="text-xs text-slate-400 leading-[1.6]">{point.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="terms-of-service"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-grow"
              >
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-syne font-bold text-2xl text-white">Terms of Service</h3>
                    <p className="text-xs text-slate-400 font-mono">Last modified: May 17, 2026</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {termsPoints.map((point, index) => (
                    <div key={index} className="space-y-2 p-4 bg-slate-950/30 border border-white/5 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary font-bold">0{index + 1}.</span>
                        <h5 className="font-syne font-bold text-sm text-slate-100">{point.title}</h5>
                      </div>
                      <p className="text-xs text-slate-400 leading-[1.6]">{point.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/5 text-[11px] text-slate-500 font-mono flex flex-wrap justify-between items-center gap-4">
            <span>Security certified by ARC-69 compliance guidelines.</span>
            <span>Version 1.0.4-compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LegalPanel;
