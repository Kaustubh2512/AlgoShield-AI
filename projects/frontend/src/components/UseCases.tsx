import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Code, Activity, Layers, ArrowUpRight } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

interface UseCaseItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  spotlightColor: string;
  glowClass: string;
  spanClass: string;
}

export const UseCases: React.FC = () => {
  const useCases: UseCaseItem[] = [
    {
      id: 'defi',
      tag: '// DEFI & AMMS',
      title: 'Protocol Vulnerability Safeguards',
      description: 'Audit decentralized exchanges, lending pools, and synthetic asset contracts prior to deployment. Prevent flash-loan exploits, pool drain attacks, and PyTeal state-manipulation vulnerabilities.',
      icon: ShieldCheck,
      spotlightColor: 'rgba(0, 255, 136, 0.15)', // Green highlight
      glowClass: 'text-primary drop-shadow-[0_0_12px_rgba(0,255,136,0.5)]',
      spanClass: 'lg:col-span-2',
    },
    {
      id: 'token',
      tag: '// ASA & LAUNCHPADS',
      title: 'Fair Launch & Staking Verification',
      description: 'Ensure token distributions, reward calculators, and liquidity lockers are structured securely. Guarantee owner permission limits and protect your community from backdoors or minting exploits.',
      icon: Layers,
      spotlightColor: 'rgba(0, 255, 136, 0.15)', // Green highlight
      glowClass: 'text-primary drop-shadow-[0_0_12px_rgba(0,255,136,0.5)]',
      spanClass: 'lg:col-span-2',
    },
    {
      id: 'cicd',
      tag: '// DEV OPS PIPELINES',
      title: 'Automated CI/CD Vulnerability Scans',
      description: 'Integrate the security scanner seamlessly into your Git workflows (GitHub Actions / GitLab CI). Scan every commit and pull request automatically, raising security blocks before merges occur.',
      icon: Code,
      spotlightColor: 'rgba(0, 255, 136, 0.15)', // Green highlight
      glowClass: 'text-primary drop-shadow-[0_0_12px_rgba(0,255,136,0.5)]',
      spanClass: 'lg:col-span-2',
    },
    {
      id: 'cert',
      tag: '// TRUST & PROOF',
      title: 'On-Chain Verifiable Security Certificates',
      description: 'Prove contract safety instantly. Achieve a high scan score to automatically mint an Algorand Standard Asset (ASA) security certificate. Embed the cryptographically verified badge on your dApp UI to foster total ecosystem trust.',
      icon: Award,
      spotlightColor: 'rgba(0, 255, 136, 0.15)', // Green highlight
      glowClass: 'text-primary drop-shadow-[0_0_12px_rgba(0,255,136,0.5)]',
      spanClass: 'lg:col-span-3',
    },
    {
      id: 'monitor',
      tag: '// LIVE THREAT ALERTS',
      title: '24/7 Smart Contract Threat Monitoring',
      description: 'Go beyond pre-launch audits. Maintain active telemetry on deployed App IDs. Our real-time background scanners inspect every blockchain transaction, triggering immediate alerts (Discord/Telegram) on anomalous actions.',
      icon: Activity,
      spotlightColor: 'rgba(0, 255, 136, 0.15)', // Green highlight
      glowClass: 'text-primary drop-shadow-[0_0_12px_rgba(0,255,136,0.5)]',
      spanClass: 'lg:col-span-3',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="use-cases" className="w-full max-w-[1200px] mx-auto px-4 py-24 relative z-10 space-y-16">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-primary font-mono text-xs uppercase tracking-[0.2em] mb-2">
          <span>// WHAT ALGORITHMS SHIELD</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-syne font-bold text-white tracking-tight">
          One Suite. <span className="text-secondary">Infinite Protection.</span>
        </h2>
        <p className="text-gray-400 font-sans text-base max-w-xl mx-auto">
          From developer commit to live Mainnet execution, AlgoShield secures the complete lifecycle of Algorand smart contracts.
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {useCases.map((useCase) => {
          const IconComponent = useCase.icon;
          return (
            <motion.div 
              key={useCase.id} 
              variants={itemVariants}
              className={`${useCase.spanClass} h-full`}
            >
              <SpotlightCard 
                className="h-full flex flex-col justify-between rounded-2xl transition-all duration-300 group !p-8"
                spotlightColor={useCase.spotlightColor}
              >
                <div className="space-y-6">
                  {/* Card Header Tag and Icon */}
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-gray-500 font-medium tracking-wider">
                      {useCase.tag}
                    </span>
                    <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                      <IconComponent className={`w-7 h-7 ${useCase.glowClass}`} />
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-3">
                    <h3 className="font-syne font-bold text-xl sm:text-2xl text-white group-hover:text-primary transition-colors flex items-center gap-2">
                      {useCase.title}
                    </h3>
                    <p className="text-sm text-gray-400 font-sans leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </div>

                {/* Footer Micro-detail */}
                <div className="mt-8 pt-4 border-t border-white/[0.03] flex items-center justify-between text-xs font-mono text-gray-500 group-hover:text-white transition-colors duration-300">
                  <span>LEARN ARCHITECTURE</span>
                  <ArrowUpRight className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default UseCases;
