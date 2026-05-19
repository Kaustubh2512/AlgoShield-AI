import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Wallet, LogOut, Sun, Moon } from 'lucide-react';

export const Navbar = () => {
  const { walletAddress, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'default') setTheme('black');
    else if (theme === 'black') setTheme('light');
    else setTheme('default');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'default': return <Moon className="w-5 h-5 text-primary" />;
      case 'black': return <Moon className="w-5 h-5 text-slate-400" />;
      case 'light': return <Sun className="w-5 h-5 text-amber-500" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'default': return 'Teal Dark';
      case 'black': return 'Pure Black';
      case 'light': return 'Light Mode';
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="border-b border-white/[0.08] bg-black/40 backdrop-blur-xl sticky top-0 z-50 shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <Shield className="w-8 h-8 text-primary group-hover:text-secondary transition-colors duration-300 shadow-glow" />
            <span className="font-syne font-bold text-2xl tracking-tighter text-gray-100 group-hover:text-white transition-colors">
              AlgoShield <span className="text-primary font-mono text-xl">&gt;_AI</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-full flex items-center justify-center cursor-pointer bg-white/5 border border-white/10 hover:border-primary/50 text-gray-300 hover:bg-white/10 transition-all duration-300"
              title={`Cycle Theme: ${getThemeLabel()}`}
            >
              {getThemeIcon()}
            </button>

            {walletAddress ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-safe animate-pulse"></span>
                    <span className="text-safe text-sm font-bold font-mono tracking-wide">CONNECTED</span>
                  </div>
                  <span className="text-gray-400 font-mono text-xs mt-1">
                    {truncateAddress(walletAddress)}
                  </span>
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="btn-secondary !py-2.5 !px-4 hover:!bg-danger hover:!border-danger"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet} 
                disabled={isConnecting}
                className="btn-primary !py-2.5"
              >
                <Wallet className="w-5 h-5" />
                {isConnecting ? 'Connecting...' : 'Connect Pera Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
