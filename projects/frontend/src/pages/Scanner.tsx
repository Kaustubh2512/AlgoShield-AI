import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useWallet } from '../context/WalletContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, UploadCloud, Search, ShieldAlert, History, ArrowLeft } from 'lucide-react';
import { ScoreGauge } from '../components/ScoreGauge';
import { VulnerabilityCard } from '../components/VulnerabilityCard';
import { CodeViewer } from '../components/CodeViewer';
import { SuggestionPanel } from '../components/SuggestionPanel';
import { motion } from 'framer-motion';
import SpotlightCard from '../components/SpotlightCard';
import { BackButton } from '../components/BackButton';
import { useSnackbar } from 'notistack';

export const Scanner = () => {
  const { walletAddress } = useWallet();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [appId, setAppId] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedAssetId, setMintedAssetId] = useState<string | null>(null);
  const [fileState, setFileState] = useState<File | null>(null);

  const [suggestions, setSuggestions] = useState<any>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (walletAddress) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/scans/${walletAddress}`)
        .then(res => res.json())
        .then(data => setRecentScans(data.slice(0, 5)))
        .catch(err => console.error(err));
    }
  }, [walletAddress, scanResult]);

  useEffect(() => {
    if (location.state && location.state.scanResult) {
      const restored = location.state.scanResult;
      setScanResult(restored);
      const cachedSuggestions = localStorage.getItem(`algoshield_suggestions_${restored.scan_id}`);
      if (cachedSuggestions) {
        setSuggestions(JSON.parse(cachedSuggestions));
        setShowSuggestions(true);
      } else {
        setSuggestions(null);
        setShowSuggestions(false);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSelectScan = async (scanId: string) => {
    // Check local storage cache
    const cached = localStorage.getItem(`algoshield_scan_${scanId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      setScanResult(parsed);
      const cachedSuggestions = localStorage.getItem(`algoshield_suggestions_${scanId}`);
      if (cachedSuggestions) {
        setSuggestions(JSON.parse(cachedSuggestions));
        setShowSuggestions(true);
      } else {
        setSuggestions(null);
        setShowSuggestions(false);
      }
      return;
    }

    // Otherwise, fetch, format, cache, and restore
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/scan/${scanId}`);
      if (!res.ok) throw new Error('Failed to fetch scan details');
      const data = await res.json();
      
      const formattedData = {
        ...data,
        vulnerabilities: data.vulnerabilities.map((v: any) => ({
          line: v.line || 0,
          issue: v.type || v.issue,
          severity: v.severity,
          suggestion: v.suggestion || "Review the flagged code block."
        }))
      };

      // Cache it
      localStorage.setItem(`algoshield_scan_${scanId}`, JSON.stringify(formattedData));
      
      setScanResult(formattedData);
      setSuggestions(null);
      setShowSuggestions(false);
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to load previous scan details.', { variant: 'error' });
    }
  };

  const handleMint = async () => {
    setIsMinting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/mint-certificate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanResult.scan_id,
          wallet_address: walletAddress
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Minting failed');
      setMintedAssetId(data.asset_id);
      enqueueSnackbar(`Certificate Minted Successfully! Asset ID: ${data.asset_id}`, {
        variant: 'success',
        autoHideDuration: 8000,
      });
    } catch (e: any) {
      enqueueSnackbar(`Minting error: ${e.message}`, { variant: 'error' });
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    if (!walletAddress) {
      navigate('/');
    }
  }, [walletAddress, navigate]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileState(e.dataTransfer.files[0]);
      runScan(e.dataTransfer.files[0]);
    }
  };

  const runScan = async (file?: File) => {
    setIsScanning(true);
    setScanResult(null);
    setMintedAssetId(null);

    const formData = new FormData();
    formData.append('wallet_address', walletAddress || '');
    if (file) {
      formData.append('file', file);
    } else if (appId) {
      formData.append('app_id', appId);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      const data = await response.json();
      const formattedData = {
        ...data,
        vulnerabilities: data.vulnerabilities.map((v: any) => ({
          line: v.line || 0,
          issue: v.type || v.issue,
          severity: v.severity,
          suggestion: v.suggestion || "Review the flagged code block."
        }))
      };

      setScanResult(formattedData);
      // Cache the scan details locally
      localStorage.setItem(`algoshield_scan_${data.scan_id}`, JSON.stringify(formattedData));
    } catch (error) {
      console.error('Scan error:', error);
      enqueueSnackbar('Failed to scan contract. Please try again.', { variant: 'error' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!scanResult) return;
    setSuggestions(null);
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    setResponseTime(null);
    const startTime = performance.now();
    try {
      // Use scan_id if available, otherwise re-send the file
      const formData = new FormData();
      if (scanResult.scan_id) {
        formData.append('scan_id', scanResult.scan_id);
        formData.append('wallet_address', walletAddress || 'anonymous');
      } else if (fileState) {
        formData.append('file', fileState);
        formData.append('wallet_address', walletAddress || 'anonymous');
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/suggest`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Suggestions failed');
      const endTime = performance.now();
      setResponseTime(Number(((endTime - startTime) / 1000).toFixed(1)));
      setSuggestions(data);
      // Cache suggestions
      if (scanResult && scanResult.scan_id) {
        localStorage.setItem(`algoshield_suggestions_${scanResult.scan_id}`, JSON.stringify(data));
      }
    } catch (err: any) {
      console.error('Suggestions error:', err.message);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  if (!walletAddress) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <BackButton />
        {!scanResult ? (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-syne font-bold mb-4">Smart Contract Scanner</h1>
              <p className="text-gray-400">Upload your .teal source or provide an Algorand App ID.</p>
            </div>

            <SpotlightCard className="shadow-2xl !p-0 relative overflow-hidden" spotlightColor="rgba(0, 255, 136, 0.15)">
              {isScanning ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                  <div className="relative">
                    <ShieldCheck className="w-20 h-20 text-primary animate-pulse-glow" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary border-primary/20 animate-spin" />
                  </div>
                  <h3 className="text-2xl font-mono text-primary font-bold">ANALYZING CONTRACT...</h3>
                  <div className="font-mono text-gray-400 text-sm w-full max-w-xs text-left mx-auto">
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>&gt; Extracting AST...</motion.p>
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}>&gt; Running pattern matching...</motion.p>
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.9}}>&gt; Calculating security score...</motion.p>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-8">
                  {/* Drag & Drop Area */}
                  <div 
                    className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-500'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <UploadCloud className={`w-16 h-16 ${dragActive ? 'text-primary' : 'text-gray-500'} mb-4`} />
                    <h3 className="text-xl font-syne font-bold mb-2">Drag & Drop .TEAL file here</h3>
                    <p className="text-gray-400 text-sm mb-4">Or click to browse from your computer.</p>
                    <label className="btn-secondary cursor-pointer">
                      Browse Files
                      <input type="file" className="hidden" accept=".teal,.py,.txt" onChange={(e) => {
                        if (e.target.files) {
                          setFileState(e.target.files[0]);
                          runScan(e.target.files[0]);
                        }
                      }} />
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-gray-500 font-syne">OR</span>
                    <div className="h-px bg-border flex-1" />
                  </div>

                  {/* App ID Input */}
                  <div>
                    <label className="text-sm border-b-2 border-transparent font-mono text-gray-400 mb-2 block">Enter Algorand App ID:</label>
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text" 
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                          placeholder="e.g. 1234567" 
                          className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                      <button onClick={runScan} disabled={!appId} className="btn-primary !py-3 whitespace-nowrap">
                        Run Security Scan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </SpotlightCard>

            {/* Recent Scans Sidebar/Section */}
            <div className="mt-8">
              <SpotlightCard spotlightColor="rgba(255, 255, 255, 0.1)">
                <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                  <History className="w-6 h-6 text-gray-400" />
                  <h2 className="text-xl font-syne font-bold">Recent Scans</h2>
                </div>
                
                <div className="space-y-4">
                  {recentScans.length === 0 ? (
                    <p className="text-gray-400">No recent scans found.</p>
                  ) : (
                    recentScans.map((scan) => {
                      const isActive = scanResult && scanResult.scan_id === scan.scan_id;
                      return (
                        <button
                          key={scan.scan_id}
                          onClick={() => handleSelectScan(scan.scan_id)}
                          title="Reload previous scan"
                          className={`w-full flex justify-between items-center p-4 bg-surface-hover rounded-lg border transition-all duration-300 text-left cursor-pointer hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)]
                            ${isActive ? 'border-primary shadow-[0_0_20px_rgba(0,255,136,0.2)] bg-primary/5' : 'border-border'}
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full border-2 flex justify-center items-center font-mono font-bold text-sm shadow-[0_0_10px_rgba(30,30,30,0.3)]
                              ${scan.score > 70 ? 'border-safe text-safe shadow-[0_0_10px_rgba(0,255,136,0.3)]' : 
                                scan.score > 40 ? 'border-warning text-warning shadow-[0_0_10px_rgba(255,170,0,0.3)]' : 
                                'border-danger text-danger shadow-[0_0_10px_rgba(255,51,51,0.3)]'}`}>
                              {scan.score}
                            </div>
                            <div>
                              <h4 className="font-syne font-bold text-lg">{scan.filename || `App ID: ${scan.app_id || 'Unknown'}`}</h4>
                              <p className="text-xs text-gray-400 font-mono">{new Date(scan.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full font-mono text-xs border
                              ${scan.risk_level === 'Safe' ? 'bg-safe/20 text-safe border-safe/50' : 
                                scan.risk_level === 'Risky' ? 'bg-warning/20 text-warning border-warning/50' : 
                                'bg-danger/20 text-danger border-danger/50'}`}>
                              {scan.risk_level.toUpperCase()}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </SpotlightCard>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-syne font-bold mb-2">Scan Results</h1>
                <p className="text-gray-400">Analysis complete. Review the findings below.</p>
              </div>
              
              <button onClick={() => { setScanResult(null); setMintedAssetId(null); }} className="btn-secondary">
                Scan Another
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Score Summary */}
              <div className="lg:col-span-4 space-y-6">
                <SpotlightCard className="text-center relative overflow-hidden" spotlightColor="rgba(0, 255, 136, 0.2)">
                  <div className={`absolute top-0 left-0 right-0 h-1 ${scanResult.score > 70 ? 'bg-safe' : scanResult.score > 40 ? 'bg-warning' : 'bg-danger'}`} />
                  <h3 className="text-gray-400 font-syne font-bold text-lg mb-6">Security Score</h3>
                  
                  <ScoreGauge score={scanResult.score} />

                  <div className="mt-8 flex justify-center">
                    <div className={`flex items-center gap-2 px-4 py-2 border rounded-full font-mono font-bold
                      ${scanResult.risk_level === 'Safe' ? 'text-safe border-safe/50 bg-safe/10 shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 
                        scanResult.risk_level === 'Risky' ? 'text-warning border-warning/50 bg-warning/10 shadow-[0_0_15px_rgba(255,170,0,0.3)]' : 
                        'text-danger border-danger/50 bg-danger/10 shadow-[0_0_15px_rgba(255,51,51,0.3)]'}
                    `}>
                      <ShieldAlert className="w-5 h-5" />
                      {scanResult.risk_level.toUpperCase()}
                    </div>
                  </div>

                  <div className="mt-8">
                    {mintedAssetId ? (
                      <div className="space-y-3">
                        <div className="bg-safe/10 border border-safe/50 rounded-lg p-4 text-center">
                          <ShieldCheck className="w-10 h-10 text-safe mx-auto mb-2" />
                          <h4 className="text-safe font-bold font-syne text-lg">Certificate Minted!</h4>
                          <p className="text-gray-400 text-xs font-mono mt-1">Asset ID: {mintedAssetId}</p>
                        </div>
                        <button
                          onClick={() => navigate('/certificates')}
                          className="btn-primary w-full"
                        >
                          View in Certificates
                        </button>
                      </div>
                    ) : scanResult.score > 70 ? (
                      <button 
                        onClick={handleMint}
                        disabled={isMinting}
                        className="btn-primary w-full shadow-[0_0_20px_rgba(0,255,136,0.5)] disabled:opacity-50"
                      >
                        {isMinting ? "Minting NFT on Algorand..." : "Mint NFT Certificate"}
                      </button>
                    ) : (
                      <button onClick={handleGetSuggestions} className="w-full bg-surface border border-warning text-warning hover:bg-warning hover:text-black font-bold py-3 px-6 rounded-lg transition-all duration-300">🧠 Get AI Suggestions</button>
                    )}
                  </div>
                </SpotlightCard>
                
                {/* Vulnerabilities List */}
                <SpotlightCard spotlightColor="rgba(255, 51, 51, 0.15)">
                  <h3 className="text-white font-syne font-bold text-xl mb-4 border-b border-border pb-2">Vulnerabilities</h3>
                  <motion.div 
                    initial="hidden" animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    className="space-y-4"
                  >
                    {scanResult.vulnerabilities.map((v: any, i: number) => (
                      <VulnerabilityCard key={i} {...v} />
                    ))}
                  </motion.div>
                </SpotlightCard>
              </div>

              {/* Code Viewer & AI Suggestions */}
              <div className="lg:col-span-8 flex flex-col space-y-6">
                <div>
                  <h3 className="text-white font-syne font-bold text-xl mb-4 pl-2">Contract Code</h3>
                  <CodeViewer 
                    code={scanResult.contract_code} 
                    highlights={scanResult.vulnerabilities.map((v: any) => v.line)} 
                  />
                </div>

                {showSuggestions && (
                  <div className="w-full">
                    <SuggestionPanel 
                      suggestions={suggestions?.suggestions || []} 
                      score={suggestions?.security_score || 0} 
                      summary={suggestions?.summary || ''} 
                      loading={loadingSuggestions}
                      responseTime={responseTime}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Recent Scans Section under Results */}
            <div className="mt-12 border-t border-border pt-8">
              <SpotlightCard spotlightColor="rgba(255, 255, 255, 0.1)">
                <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                  <History className="w-6 h-6 text-gray-400" />
                  <h2 className="text-xl font-syne font-bold">Recent Scans</h2>
                </div>
                
                <div className="space-y-4">
                  {recentScans.length === 0 ? (
                    <p className="text-gray-400">No recent scans found.</p>
                  ) : (
                    recentScans.map((scan) => {
                      const isActive = scanResult && scanResult.scan_id === scan.scan_id;
                      return (
                        <button
                          key={scan.scan_id}
                          onClick={() => handleSelectScan(scan.scan_id)}
                          title="Reload previous scan"
                          className={`w-full flex justify-between items-center p-4 bg-surface-hover rounded-lg border transition-all duration-300 text-left cursor-pointer hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)]
                            ${isActive ? 'border-primary shadow-[0_0_20px_rgba(0,255,136,0.2)] bg-primary/5' : 'border-border'}
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full border-2 flex justify-center items-center font-mono font-bold text-sm shadow-[0_0_10px_rgba(30,30,30,0.3)]
                              ${scan.score > 70 ? 'border-safe text-safe shadow-[0_0_10px_rgba(0,255,136,0.3)]' : 
                                scan.score > 40 ? 'border-warning text-warning shadow-[0_0_10px_rgba(255,170,0,0.3)]' : 
                                'border-danger text-danger shadow-[0_0_10px_rgba(255,51,51,0.3)]'}`}>
                              {scan.score}
                            </div>
                            <div>
                              <h4 className="font-syne font-bold text-lg">{scan.filename || `App ID: ${scan.app_id || 'Unknown'}`}</h4>
                              <p className="text-xs text-gray-400 font-mono">{new Date(scan.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full font-mono text-xs border
                              ${scan.risk_level === 'Safe' ? 'bg-safe/20 text-safe border-safe/50' : 
                                scan.risk_level === 'Risky' ? 'bg-warning/20 text-warning border-warning/50' : 
                                'bg-danger/20 text-danger border-danger/50'}`}>
                              {scan.risk_level.toUpperCase()}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </SpotlightCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
