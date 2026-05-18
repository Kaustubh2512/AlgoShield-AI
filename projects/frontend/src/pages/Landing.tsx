import React from 'react';
import { Navbar } from '../components/Navbar';
import ASCIIText from '../components/ASCIIText';
import { AnimatedText } from '../components/AnimatedText';
import MagicBento from '../components/MagicBento';
import { ShieldAlert, Award, Activity, Brain, Code, ScanSearch } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LogoLoop from '../components/LogoLoop';
import LegalPanel from '../components/LegalPanel';
import Footer from '../components/Footer';

export const Landing = () => {
  const { walletAddress, connectWallet } = useWallet();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (walletAddress) {
      navigate('/dashboard');
    }
  }, [walletAddress, navigate]);

  const bentoCards = [
    {
      color: 'rgba(0, 212, 255, 0.03)',
      title: 'Smart Contract Scanner',
      description: 'Upload your .teal or point to an App ID for an instant line-by-line AI vulnerability analysis.',
      label: 'SCAN',
      icon: <ShieldAlert className="w-5 h-5" />
    },
    {
      color: 'rgba(255, 170, 0, 0.03)',
      title: 'NFT Security Certificate',
      description: 'Pass the audit with a high score and automatically mint a verifiable on-chain proof of security.',
      label: 'CERTIFY',
      icon: <Award className="w-5 h-5" />
    },
    {
      color: 'rgba(0, 255, 136, 0.03)',
      title: '24/7 Live Monitoring',
      description: 'Enable continuous observation of your smart contract state and get alerted of malicious activities.',
      label: 'MONITOR',
      icon: <Activity className="w-5 h-5" />
    },
    {
      color: 'rgba(132, 0, 255, 0.03)',
      title: 'AI-Powered Analysis',
      description: 'Random Forest ML model trained on 90+ TEAL contracts with RAG suggestions from Phi-3-mini SLM.',
      label: 'AI/ML',
      icon: <Brain className="w-5 h-5" />
    },
    {
      color: 'rgba(0, 255, 136, 0.03)',
      title: 'Developer SDK',
      description: 'Integrate AlgoShield into your CI/CD pipeline with our npm package. Scan on save with directory watcher.',
      label: 'SDK',
      icon: <Code className="w-5 h-5" />
    },
    {
      color: 'rgba(255, 51, 51, 0.03)',
      title: 'Anomaly Detection',
      description: 'Isolation Forest model detects suspicious transaction patterns in real-time with email & Telegram alerts.',
      label: 'SECURITY',
      icon: <ScanSearch className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      
      <div className="absolute inset-0 z-[1] opacity-20 hidden md:block">
        <ASCIIText 
          text="ALGO_SHIELD" 
          asciiFontSize={12} 
          textFontSize={250} 
          enableWaves={true} 
        />
      </div>

      <div className="absolute inset-0 bg-background/70 z-[1]" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow flex flex-col justify-center items-center px-4 py-20">
          <div className="max-w-4xl w-full text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-syne font-bold leading-tight">
                <AnimatedText text="Securing Web3," className="justify-center text-white" />
                <AnimatedText text="One Contract at a Time" className="justify-center text-primary" />
              </h1>
              <p className="text-xl text-slate-300 font-sans max-w-2xl mx-auto">
                AI-powered smart contract security auditing for the Algorand blockchain. Scan, monitor, and certify your builds with terminal precision.
              </p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex justify-center"
            >
              {!walletAddress && (
                <button onClick={connectWallet} className="btn-primary text-lg !py-4 !px-8 border border-secondary shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)]">
                  Connect Pera Wallet to Begin
                </button>
              )}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="mt-24"
            >
              <MagicBento
                cards={bentoCards}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                glowColor="139, 92, 246"
                particleCount={8}
                spotlightRadius={350}
              />
            </motion.div>
          </div>
        </main>

        {/* Dynamic Infinite Moving Loop Marquee */}
        <LogoLoop />

        {/* Interactive Privacy Policy & Terms Panel */}
        <LegalPanel />

        {/* Core Styled Footer */}
        <Footer />
      </div>
    </div>
  );
};
