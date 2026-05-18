import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';
import { Activity, Shield, Hash, ShieldAlert, Mail, CheckCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { AlertBanner } from '../components/AlertBanner';
import { showToast } from '../components/Toast';
import SpotlightCard from '../components/SpotlightCard';

export const Monitor = () => {
  const { walletAddress } = useWallet();
  const navigate = useNavigate();
  
  const [appId, setAppId] = useState('');
  const [accountAddr, setAccountAddr] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showAlertBanner, setShowAlertBanner] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    if (!walletAddress) {
      navigate('/');
    }
  }, [walletAddress, navigate]);

  let timeoutId: any;
  const startMonitoring = async () => {
    if (!appId) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/monitor/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: walletAddress,
          app_id: parseInt(appId),
          account_address: accountAddr || '',
          alert_email: alertEmail || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Start failed');
      
      setJobId(data.job_id);
      setIsMonitoring(true);
      setAlerts([]);
      setEmailConfirmed(!!alertEmail);
    } catch (e: any) {
      showToast(`Failed to start monitoring: ${e.message}`, 'error');
    }
  };

  const stopMonitoring = async () => {
    setIsMonitoring(false);
    setEmailConfirmed(false);
    if (jobId) {
      try {
        await fetch(`http://127.0.0.1:8000/monitor/stop/${jobId}`, {
          method: 'POST'
        });
      } catch (e) {}
    }
    setJobId(null);
  };

  useEffect(() => {
    let interval: any;
    if (isMonitoring && appId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://127.0.0.1:8000/monitor/${appId}/alerts?wallet_address=${walletAddress}`);
          const data = await res.json();
          if (res.ok && data.alerts && data.alerts.length > 0) {
            setAlerts(data.alerts.map((a: any) => ({
              timestamp: new Date(a.timestamp).toLocaleTimeString(),
              type: a.severity + ' Alert',
              description: a.description,
              severity: a.severity,
              txn_id: a.txn_id || a.transaction_id || null,
              id: a.id || a.alert_id
            })));
            setShowAlertBanner(true);
            setTimeout(() => setShowAlertBanner(false), 5000);
          }
        } catch (e) {
          console.error('Poll error', e);
        }
      }, 30000);
    }
    return () => clearInterval(interval);
  }, [isMonitoring, appId, walletAddress]);

  if (!walletAddress) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <AlertBanner 
        show={showAlertBanner} 
        message="A potential Reentrancy attack was just detected logic execution on App ID." 
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-4xl font-syne font-bold mb-2 flex flex-wrap items-center gap-3">
              Live Monitoring
              {isMonitoring && (
                 <span className="flex items-center gap-2 text-sm bg-safe/10 border border-safe text-safe px-3 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]">
                   <span className="w-2 h-2 rounded-full bg-safe"></span>
                   ACTIVE
                 </span>
              )}
              {isMonitoring && emailConfirmed && (
                <span className="flex items-center gap-1 text-xs bg-secondary/10 border border-secondary/50 text-secondary px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  {alertEmail}
                </span>
              )}
            </h1>
            <p className="text-gray-400">Set up 24/7 AI-powered anomaly detection for live smart contracts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Config Card */}
          <div className="lg:col-span-1 space-y-6">
            <SpotlightCard spotlightColor="rgba(0, 212, 255, 0.15)">
              <h3 className="font-syne font-bold text-xl mb-4 border-b border-border pb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-secondary" />
                Target Setup
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-mono text-gray-400 mb-1 block">Algorand App ID:</label>
                  <div className="relative">
                    <Hash className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={appId}
                      onChange={(e) => setAppId(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors font-mono disabled:opacity-50"
                      placeholder="e.g. 1234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-mono text-gray-400 mb-1 block">Monitor Account (Optional):</label>
                  <div className="relative">
                    <Activity className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="text" 
                      value={accountAddr}
                      onChange={(e) => setAccountAddr(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors font-mono disabled:opacity-50"
                      placeholder="e.g. ABCDE...1234"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-mono text-gray-400 mb-1 block">Alert Email (Optional):</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="email" 
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      disabled={isMonitoring}
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-secondary transition-colors font-mono disabled:opacity-50"
                      placeholder="e.g. security@team.com"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  {!isMonitoring ? (
                    <button 
                      onClick={startMonitoring}
                      disabled={!appId} 
                      className="btn-primary w-full disabled:opacity-50 !bg-secondary !text-black hover:!shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                    >
                      Start Monitoring
                    </button>
                  ) : (
                    <button 
                      onClick={stopMonitoring}
                      className="w-full bg-danger/20 border border-danger text-danger font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-danger hover:text-white"
                    >
                      Stop Monitoring
                    </button>
                  )}
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Live Feed */}
          <div className="lg:col-span-2">
            <SpotlightCard className="h-full min-h-[500px] flex flex-col" spotlightColor="rgba(0, 255, 136, 0.15)">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-syne font-bold text-xl flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Live Activity Feed
                </h3>
                {isMonitoring && (
                  <span className="text-sm font-mono text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping inline-block"></span>
                    Polling every 5s...
                  </span>
                )}
              </div>

              <div className="flex-grow bg-background/50 rounded-xl border border-border p-4 overflow-y-auto">
                {!isMonitoring && alerts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                    <Activity className="w-16 h-16 opacity-20" />
                    <p className="font-mono">Monitoring is not active.</p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="font-mono text-primary text-sm">Listening for transactions on App {appId}...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-mono text-gray-400">Recent Alerts ({alerts.length})</h4>
                    <span className="text-xs font-mono text-gray-500">Auto-refresh: 30s</span>
                  </div>
                  {alerts.map((alert, idx) => {
                    const severityConfig = {
                      Critical: { bg: 'bg-danger/10', border: 'border-danger/50', text: 'text-danger', badge: 'bg-danger/20' },
                      High: { bg: 'bg-danger/10', border: 'border-danger/50', text: 'text-danger', badge: 'bg-danger/20' },
                      Risky: { bg: 'bg-warning/10', border: 'border-warning/50', text: 'text-warning', badge: 'bg-warning/20' },
                      Medium: { bg: 'bg-warning/10', border: 'border-warning/50', text: 'text-warning', badge: 'bg-warning/20' },
                      Low: { bg: 'bg-secondary/10', border: 'border-secondary/50', text: 'text-secondary', badge: 'bg-secondary/20' },
                    };
                    const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.Low;

                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={alert.id || idx}
                        className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
                      >
                        <div className="flex items-start gap-3">
                          <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${config.text}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${config.badge} ${config.text}`}>
                                {alert.severity.toUpperCase()}
                              </span>
                              <span className="font-syne font-bold text-white text-sm">{alert.type}</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gray-500">
                              <span>{alert.timestamp}</span>
                              {alert.txn_id && (
                                <a
                                  href={`https://allo.info/tx/${alert.txn_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-secondary hover:text-white transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View Transaction
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                )}
              </div>
            </SpotlightCard>
          </div>
        </div>
      </main>
    </div>
  );
};
