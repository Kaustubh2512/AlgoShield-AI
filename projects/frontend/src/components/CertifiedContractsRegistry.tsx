import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, Activity, Award, CheckCircle2, Clock, Globe } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

interface ContractInfo {
  id: string;
  name: string;
  appId: string;
  category: 'defi' | 'asa' | 'nft' | 'dao';
  categoryLabel: string;
  score: number;
  compiler: string;
  description: string;
  auditor: string;
  monitoring: boolean;
  certifiedDate: string;
}

export const CertifiedContractsRegistry: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Audits' },
    { id: 'defi', label: 'DeFi Pools' },
    { id: 'asa', label: 'ASA Tokens' },
    { id: 'nft', label: 'NFT Markets' },
    { id: 'dao', label: 'Custom DAOs' },
  ];

  const contracts: ContractInfo[] = [
    {
      id: 'algopool',
      name: 'AlgoPool-V2 AMM',
      appId: '7829103',
      category: 'defi',
      categoryLabel: 'DeFi Pool',
      score: 98,
      compiler: 'TEAL v8',
      description: 'Decentralized constant-product automated market maker pool providing concentrated liquidity for standard Algorand assets with slippage limits.',
      auditor: 'AlgoShield Hybrid Engine',
      monitoring: true,
      certifiedDate: 'May 18, 2026',
    },
    {
      id: 'kedarstake',
      name: 'KedarStake-ASA',
      appId: '9283011',
      category: 'asa',
      categoryLabel: 'ASA Token Staking',
      score: 94,
      compiler: 'TEAL v7',
      description: 'Yield-farming and automated rewards staking ledger for standard loyalty ASA tokens with dynamic cooldown constraints and rate limits.',
      auditor: 'AlgoShield RAG Engine',
      monitoring: true,
      certifiedDate: 'May 15, 2026',
    },
    {
      id: 'nftmarket',
      name: 'NFT-Market-Prime',
      appId: '5429112',
      category: 'nft',
      categoryLabel: 'NFT Marketplace',
      score: 91,
      compiler: 'TEAL v8',
      description: 'Atomic transaction-based NFT auction house and secondary trading marketplace with built-in royalty enforcement and bidding escrow safeguards.',
      auditor: 'AlgoShield AST Scanner',
      monitoring: false,
      certifiedDate: 'May 12, 2026',
    },
    {
      id: 'vestadao',
      name: 'VestaDAO-Gov',
      appId: '3391024',
      category: 'dao',
      categoryLabel: 'DAO Governance',
      score: 96,
      compiler: 'TEAL v8',
      description: 'Decentralized autonomous organization voting ledger with timelock controls, multi-signature safety gates, and voting power thresholds.',
      auditor: 'AlgoShield Hybrid Engine',
      monitoring: true,
      certifiedDate: 'May 10, 2026',
    },
    {
      id: 'yieldgrow',
      name: 'YieldGrow-Vaults',
      appId: '1209384',
      category: 'defi',
      categoryLabel: 'DeFi Yield Vault',
      score: 95,
      compiler: 'TEAL v8',
      description: 'Auto-compounding asset management vaults maximizing yield rewards across Algorand DEX nodes through programmatic optimization.',
      auditor: 'AlgoShield RAG Engine',
      monitoring: true,
      certifiedDate: 'May 08, 2026',
    },
    {
      id: 'aeroswap',
      name: 'AeroSwap Liquidity',
      appId: '8872019',
      category: 'defi',
      categoryLabel: 'DeFi Pool',
      score: 97,
      compiler: 'TEAL v7',
      description: 'Multi-token automated liquidity distribution engine featuring weighted pools, customizable dynamic fees, and instant arbitrage safety.',
      auditor: 'AlgoShield Hybrid Engine',
      monitoring: true,
      certifiedDate: 'May 02, 2026',
    },
  ];

  const filteredContracts = contracts.filter((contract) => {
    const matchesCategory = selectedCategory === 'all' || contract.category === selectedCategory;
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          contract.appId.includes(searchQuery) ||
                          contract.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="contracts-registry" className="w-full max-w-[1200px] mx-auto px-4 py-24 relative z-10 space-y-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center gap-2 text-secondary font-mono text-xs uppercase tracking-[0.2em]">
            <Globe className="w-4 h-4 animate-[orbit_12s_linear_infinite]" />
            <span>// LIVE SECURITY REGISTRY</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-syne font-bold text-white tracking-tight">
            Audited & Verified <span className="text-primary">Registry</span>
          </h2>
          <p className="text-gray-400 font-sans text-base">
            Discover and verify smart contracts deployed on the Algorand blockchain audited by AlgoShield AI.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:max-w-xs group">
          <input
            type="text"
            placeholder="Search by name or App ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface/20 border border-white/5 focus:border-primary/40 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 font-sans transition-all duration-300 outline-none backdrop-blur-md"
          />
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2.5 pb-2 border-b border-white/5">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`font-mono text-xs uppercase tracking-wider py-2.5 px-5 rounded-full border transition-all duration-300 ${
              selectedCategory === category.id
                ? 'bg-primary text-black border-primary font-bold shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                : 'bg-transparent text-gray-400 border-white/5 hover:border-white/10 hover:text-white'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        <AnimatePresence mode="popLayout">
          {filteredContracts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full py-16 text-center text-gray-500 font-sans border border-dashed border-white/5 rounded-2xl bg-surface/5"
            >
              No verified contracts found matching your parameters.
            </motion.div>
          ) : (
            filteredContracts.map((contract) => (
              <motion.div
                key={contract.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <SpotlightCard
                  className="h-full flex flex-col justify-between rounded-2xl transition-all duration-300 !p-6"
                  spotlightColor="rgba(0, 255, 136, 0.15)"
                >
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-syne font-bold text-lg text-white">
                            {contract.name}
                          </h3>
                          <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded border border-white/10 text-gray-400 bg-white/[0.02]">
                            {contract.compiler}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-gray-500 mt-1">App ID: #{contract.appId}</p>
                      </div>

                      {/* Monitoring Status Badge */}
                      {contract.monitoring ? (
                        <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full py-1 px-3 shadow-[0_0_10px_rgba(0,255,136,0.1)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-live" />
                          <span className="font-mono text-[9px] text-primary font-bold tracking-wider">LIVE SCAN</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-full py-1 px-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          <span className="font-mono text-[9px] text-gray-500 font-bold tracking-wider">OFFLINE</span>
                        </div>
                      )}
                    </div>

                    {/* Details Box */}
                    <p className="text-xs text-gray-400 font-sans leading-relaxed min-h-[50px]">
                      {contract.description}
                    </p>

                    {/* Monospace Metadata Table */}
                    <div className="bg-black/35 rounded-xl p-4 border border-white/[0.02] space-y-2.5 font-mono text-[11px]">
                      <div className="flex justify-between items-center text-gray-500">
                        <span>AUDIT SCOPE:</span>
                        <span className="text-white text-right font-medium">{contract.categoryLabel}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500">
                        <span>ENGINE TYPE:</span>
                        <span className="text-white text-right">{contract.auditor}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-500">
                        <span>CERTIFIED:</span>
                        <div className="flex items-center gap-1 text-white">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <span>{contract.certifiedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer - Score representation */}
                  <div className="mt-6 pt-4 border-t border-white/[0.03] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Passed Audit</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-500">SCORE:</span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-syne font-bold text-xl text-primary">{contract.score}</span>
                        <span className="font-mono text-[10px] text-gray-500">/100</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default CertifiedContractsRegistry;
