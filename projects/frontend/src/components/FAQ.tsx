import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/5 rounded-xl bg-black/25 overflow-hidden transition-all duration-300 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5 focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <span className="font-mono text-xl text-primary font-bold">{isOpen ? '−' : '+'}</span>
          <span className="font-syne font-semibold text-lg text-white group-hover:text-primary transition-colors">
            {question}
          </span>
        </div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-5 pb-5 pt-2 text-sm text-gray-400 font-sans leading-relaxed border-t border-white/5 bg-black/20">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "What is AlgoShield AI?",
      answer: "AlgoShield AI is an advanced security suite designed specifically for the Algorand blockchain. It utilizes machine learning models and static analysis (AST and RAG pipelines) to scan TEAL/PyTeal smart contracts, identify vulnerabilities, and provide AI-generated remediation suggestions."
    },
    {
      question: "How does the AI smart contract scan work?",
      answer: "The scanner combines deterministic static analysis rules with specialized ML models trained on vulnerability datasets. Once you upload a `.teal` contract or enter an App ID, our AI scans line-by-line to evaluate risks, assign a security score, and generate concrete code fix suggestions."
    },
    {
      question: "What is the security NFT certificate?",
      answer: "When a smart contract achieves an outstanding security score (70 or higher) in our scanner, developers can automatically mint a verified secure certificate as an on-chain Algorand Standard Asset (ASA). This serves as cryptographically verifiable proof of safety for your users and investors."
    },
    {
      question: "Does running a scan cost any ALGO?",
      answer: "No, running security scans on the AlgoShield AI portal is completely free! Minting the verified security NFT certificate, however, requires a tiny Algorand testnet transaction fee to register the ASA on-chain."
    },
    {
      question: "How does the 24/7 live monitoring operate?",
      answer: "Once you enable monitoring for your deployed contract's App ID, our automated background worker constantly polls the Algorand blockchain for new transactions. If it detects anomalies, exploits, or flash-loan-like behaviors, it instantly triggers alerts via email or telegram to warn you."
    }
  ];

  return (
    <section className="w-full max-w-[800px] mx-auto px-4 py-20 relative z-10 space-y-12">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary font-mono text-xs uppercase tracking-[0.2em] mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>FAQ</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-syne font-bold text-white tracking-tight">
          Have a question? <span className="text-secondary">We have answer.</span>
        </h2>
        <p className="text-gray-400 font-sans text-sm max-w-md mx-auto">
          Everything you need to know about the AlgoShield AI smart contract security suite.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem key={index} {...faq} />
        ))}
      </div>
    </section>
  );
};

export default FAQ;
