import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Shield, Key, Coins, CreditCard } from 'lucide-react';

interface FloatingWalletProps {
  delay: number;
  duration: number;
  x: string;
  y: string;
  scale: number;
  icon: React.ReactNode;
  bgGradient: string;
  textColor: string;
  glowColor: string;
  label: string;
}

const WalletItem: React.FC<FloatingWalletProps> = ({ delay, duration, x, y, scale, icon, bgGradient, textColor, glowColor, label }) => {
  return (
    <motion.div
      className="absolute pointer-events-none opacity-85 filter blur-[0.1px]"
      style={{ top: y, left: x, scale }}
      initial={{ y: 0, x: 0 }}
      animate={{
        y: [0, -35, 10, -20, 0],
        x: [0, 15, -10, 25, 0],
        rotate: [0, 8, -5, 12, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <div 
        className={`flex items-center gap-2 p-2 rounded-lg border border-white/20 ${bgGradient} ${textColor} shadow-lg`}
        style={{
          boxShadow: `0 0 15px ${glowColor}`,
        }}
      >
        <div className="p-1 rounded-md bg-white/20">
          {icon}
        </div>
        <span className="font-mono text-[9px] font-bold tracking-widest uppercase opacity-90">{label}</span>
      </div>
    </motion.div>
  );
};

export const FloatingWallets: React.FC = () => {
  const wallets = [
    { 
      delay: 0, 
      duration: 18, 
      x: '8%', 
      y: '22%', 
      scale: 0.55, 
      icon: <Wallet className="w-3.5 h-3.5" />, 
      bgGradient: 'bg-gradient-to-br from-emerald-400 to-teal-600', 
      textColor: 'text-black', 
      glowColor: 'rgba(52, 211, 153, 0.4)',
      label: 'SECURE'
    },
    { 
      delay: 3, 
      duration: 22, 
      x: '84%', 
      y: '14%', 
      scale: 0.58, 
      icon: <CreditCard className="w-3.5 h-3.5" />, 
      bgGradient: 'bg-gradient-to-br from-cyan-400 to-blue-600', 
      textColor: 'text-white', 
      glowColor: 'rgba(56, 189, 248, 0.4)',
      label: 'PERA' 
    },
    { 
      delay: 1.5, 
      duration: 20, 
      x: '88%', 
      y: '68%', 
      scale: 0.52, 
      icon: <Coins className="w-3.5 h-3.5" />, 
      bgGradient: 'bg-gradient-to-br from-amber-300 to-orange-500', 
      textColor: 'text-black', 
      glowColor: 'rgba(251, 191, 36, 0.4)',
      label: 'ALGO' 
    },
    { 
      delay: 4, 
      duration: 24, 
      x: '12%', 
      y: '72%', 
      scale: 0.55, 
      icon: <Key className="w-3.5 h-3.5" />, 
      bgGradient: 'bg-gradient-to-br from-pink-400 to-rose-600', 
      textColor: 'text-white', 
      glowColor: 'rgba(251, 113, 133, 0.4)',
      label: 'KEYS' 
    },
    { 
      delay: 2.5, 
      duration: 19, 
      x: '46%', 
      y: '82%', 
      scale: 0.5, 
      icon: <Shield className="w-3.5 h-3.5" />, 
      bgGradient: 'bg-gradient-to-br from-fuchsia-400 to-purple-600', 
      textColor: 'text-white', 
      glowColor: 'rgba(217, 70, 239, 0.35)',
      label: 'SHIELD' 
    },
  ];

  return (
    <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none select-none">
      {wallets.map((w, i) => (
        <WalletItem key={i} {...w} />
      ))}
    </div>
  );
};

export default FloatingWallets;
