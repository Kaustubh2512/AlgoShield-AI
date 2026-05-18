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
  color: string;
}

const WalletItem: React.FC<FloatingWalletProps> = ({ delay, duration, x, y, scale, icon, color }) => {
  return (
    <motion.div
      className="absolute pointer-events-none opacity-20 filter blur-[0.5px]"
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
        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm"
        style={{
          boxShadow: `0 0 20px ${color}`,
          borderColor: color,
        }}
      >
        <div className="p-2 rounded-lg bg-white/5 text-white">
          {icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="w-10 h-1.5 rounded bg-white/20" />
          <div className="w-6 h-1 rounded bg-white/10" />
        </div>
      </div>
    </motion.div>
  );
};

export const FloatingWallets: React.FC = () => {
  const wallets = [
    { delay: 0, duration: 18, x: '10%', y: '25%', scale: 0.85, icon: <Wallet className="w-5 h-5 text-primary" />, color: 'rgba(0, 255, 136, 0.2)' },
    { delay: 3, duration: 22, x: '82%', y: '15%', scale: 0.9, icon: <CreditCard className="w-5 h-5 text-secondary" />, color: 'rgba(0, 212, 255, 0.2)' },
    { delay: 1.5, duration: 20, x: '75%', y: '65%', scale: 0.75, icon: <Coins className="w-5 h-5 text-amber-500" />, color: 'rgba(255, 170, 0, 0.2)' },
    { delay: 4, duration: 24, x: '15%', y: '70%', scale: 0.8, icon: <Key className="w-5 h-5 text-pink-400" />, color: 'rgba(236, 72, 153, 0.2)' },
    { delay: 2.5, duration: 19, x: '45%', y: '80%', scale: 0.7, icon: <Shield className="w-5 h-5 text-emerald-400" />, color: 'rgba(52, 211, 153, 0.15)' },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {wallets.map((w, i) => (
        <WalletItem key={i} {...w} />
      ))}
    </div>
  );
};

export default FloatingWallets;
