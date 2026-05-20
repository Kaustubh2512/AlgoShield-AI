#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const AlgoShield = require('../src/index');
const chalk = require('chalk');
const boxen = require('boxen');

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith('--') ? args[0] : null;
const target = args[1] && !args[1].startsWith('--') ? args[1] : null;

const isJson = process.argv.includes('--json');
const thresholdIndex = process.argv.indexOf('--threshold');
const threshold = thresholdIndex > -1 ? parseInt(process.argv[thresholdIndex + 1]) : 70;
const walletIndex = process.argv.indexOf('--wallet');
const walletArg = walletIndex > -1 ? process.argv[walletIndex + 1] : null;
const mintFlag = process.argv.includes('--mint');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q) { return new Promise(r => rl.question(q, r)); }

async function promptWallet() {
  console.log('');
  console.log(`  ${chalk.bold.white('Connect Your PeraWallet')}`);
  console.log(`  ${chalk.gray('Open PeraWallet on your phone, copy your address, and paste it below.')}`);
  console.log(`  ${chalk.gray('(It looks like:')} ${chalk.hex('#66aaff')('ABC...XYZ')}${chalk.gray(')')}`);
  console.log('');
  const addr = await ask(`  ${chalk.hex('#44ff88')('▸')} ${chalk.bold.white('Wallet address:')} `);
  if (!addr || addr.length < 10) {
    console.log(`  ${chalk.red('Invalid address. Please paste a valid Algorand wallet address.')}`);
    return promptWallet();
  }
  console.log(`  ${chalk.green('✓')} ${chalk.gray('Wallet connected:')} ${chalk.white(addr.slice(0, 8) + '...' + addr.slice(-4))}`);
  return addr.trim();
}

async function promptFile() {
  console.log('');
  console.log(`  ${chalk.bold.white('Select Contract to Scan')}`);
  console.log(`  ${chalk.gray('Provide the path to your .teal, .py, or .txt smart contract file.')}`);
  console.log('');
  const filePath = await ask(`  ${chalk.hex('#44ff88')('▸')} ${chalk.bold.white('File path:')} `);
  const resolved = path.resolve(filePath.trim());
  if (!fs.existsSync(resolved)) {
    console.log(`  ${chalk.red('File not found:')} ${chalk.white(resolved)}`);
    return promptFile();
  }
  if (!['.teal', '.py', '.txt'].includes(path.extname(resolved).toLowerCase())) {
    console.log(`  ${chalk.red('Only .teal, .py, and .txt files are supported.')}`);
    return promptFile();
  }
  return resolved;
}

async function promptMint(shield, scanId, walletAddr) {
  console.log('');
  const answer = await ask(`  ${chalk.hex('#44ff88')('▸')} ${chalk.bold.white('Mint NFT certificate?')} ${chalk.gray('(y/n):')} `);
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log(`  ${chalk.gray('Minting your security certificate on-chain...')}`);
    try {
      const cert = await shield.mintCertificate(scanId, walletAddr);
      const certBox = [
        `  ${chalk.bold.hex('#44ff88')('NFT Certificate Minted')}`,
        ``,
        `  ${chalk.gray('Asset ID:')}  ${chalk.white(cert.asset_id)}`,
        `  ${chalk.gray('Transaction:')}  ${chalk.white(cert.txn_id)}`,
        `  ${chalk.gray('Explorer:')}  ${chalk.hex('#66aaff')(cert.explorer_url)}`,
      ].join('\n');
      console.log(boxen(certBox, { padding: 1, borderColor: 'green', borderStyle: 'round' }));
      console.log(`  ${chalk.green('✓')} ${chalk.gray('Certificate minted successfully! View on AlgoExplorer.')}`);
    } catch (e) {
      console.log(`  ${chalk.red('✗ Minting failed:')} ${e.message}`);
    }
  } else {
    console.log(`  ${chalk.gray('Skipped minting. You can mint later with:')} ${chalk.white('algoshield mint ' + scanId + ' --wallet <addr>')}`);
  }
}

function showHelp() {
  console.log(chalk.bold.hex('#44ff88')('\n┌─────────────────────────────────────────────┐'));
  console.log(chalk.bold.hex('#44ff88')('│           AlgoShield AI — CLI              │'));
  console.log(chalk.bold.hex('#44ff88')('└─────────────────────────────────────────────┘'));
  console.log('');
  console.log(`${chalk.bold.white('Usage:')}`);
  console.log(`  ${chalk.hex('#44ff88')('algoshield')}              ${chalk.gray('Interactive wizard (wallet → scan → mint)')}`);
  console.log(`  ${chalk.hex('#44ff88')('algoshield scan')} ${chalk.gray('<file>')}   ${chalk.gray('Quick scan a contract')}`);
  console.log(`  ${chalk.hex('#44ff88')('algoshield mint')} ${chalk.gray('<id>')}     ${chalk.gray('Mint certificate for a scan')}`);
  console.log(`  ${chalk.hex('#44ff88')('algoshield watch')} ${chalk.gray('<dir>')}   ${chalk.gray('Auto-scan on file changes')}`);
  console.log('');
  console.log(`${chalk.bold.white('Options:')}`);
  console.log(`  ${chalk.gray('--wallet <addr>')}     Wallet address ${chalk.gray('(or prompted interactively)')}`);
  console.log(`  ${chalk.gray('--mint')}              Prompt to mint if score ≥ 70`);
  console.log(`  ${chalk.gray('--threshold <N>')}     Exit code 1 if score < N ${chalk.gray('(default 70)')}`);
  console.log(`  ${chalk.gray('--json')}              Machine-readable JSON output`);
  console.log(`  ${chalk.gray('--api-key <key>')}     API key for backend`);
  console.log('');
  console.log(`${chalk.bold.white('Typical workflow:')}`);
  console.log(`  ${chalk.gray('1.')} ${chalk.white('algoshield')}           ${chalk.gray('— guided wizard (connect wallet → scan → mint)')}`);
  console.log(`  ${chalk.gray('2.')} ${chalk.white('algoshield scan c.teal')} ${chalk.gray('— quick scan, no wallet needed')}`);
  console.log(`  ${chalk.gray('3.')} ${chalk.white('algoshield scan c.teal --wallet ABC --mint')}  ${chalk.gray('— scan + interactive mint')}`);
  console.log('');
}

async function interactiveWizard() {
  console.log(chalk.bold.hex('#44ff88')('\n┌─────────────────────────────────────────────┐'));
  console.log(chalk.bold.hex('#44ff88')('│           AlgoShield AI — CLI              │'));
  console.log(chalk.bold.hex('#44ff88')('└─────────────────────────────────────────────┘'));
  console.log(`\n  ${chalk.gray('An AI-powered security scanner for Algorand smart contracts.')}\n`);

  const walletAddr = await promptWallet();
  const shield = new AlgoShield({ walletAddress: walletAddr });

  let scanResult = null;
  while (true) {
    const filePath = await promptFile();
    console.log(`\n  ${chalk.gray('Scanning contract...')}`);
    try {
      scanResult = await shield.scanFile(filePath);
    } catch (e) {
      console.log(`  ${chalk.red('✗ Scan failed:')} ${e.message}`);
      console.log(`  ${chalk.gray('Make sure the backend server is running on http://localhost:8000')}`);
      rl.close();
      process.exit(1);
    }
    break;
  }

  const r = scanResult;
  console.log('');

  if (r.score >= 70) {
    const safeBox = [
      `  ${chalk.bold.hex('#44ff88')('✓ Contract Passed Security Check')}`,
      ``,
      `  ${chalk.gray('Score:')}  ${chalk.bold.white(r.score + '/100')}`,
      `  ${chalk.gray('Label:')}  ${chalk.bold.white(r.label || 'SAFE')}`,
      `  ${chalk.gray('Scan ID:')}  ${chalk.white(r.scan_id)}`,
    ].join('\n');
    console.log(boxen(safeBox, { padding: 1, borderColor: 'green', borderStyle: 'round' }));
    await promptMint(shield, r.scan_id, walletAddr);

  } else {
    const failBox = [
      `  ${chalk.bold.hex('#ff8833')('⚠ Contract Needs Attention')}`,
      ``,
      `  ${chalk.gray('Score:')}  ${chalk.bold.white(r.score + '/100')}`,
      `  ${chalk.gray('Risk:')}   ${chalk.bold.hex('#ff4444')(' ' + (r.risk_level || 'RISKY').toUpperCase() + ' ')}`,
      `  ${chalk.gray('Label:')}  ${chalk.bold.white(r.label || 'UNKNOWN')}`,
      `  ${chalk.gray('Scan ID:')}  ${chalk.white(r.scan_id)}`,
    ].join('\n');
    console.log(boxen(failBox, { padding: 1, borderColor: '#ff8833', borderStyle: 'round' }));
    console.log(`\n  ${chalk.bold.white('Recommended Fixes')}`);
    console.log(`  ${chalk.gray('Review each vulnerability below and apply the suggested fixes.')}`);

    const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    const vulns = (r.vulnerabilities || []).sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4));
    for (const v of vulns) {
      const sev = v.severity || 'Medium';
      const icon = { Critical: '🔴', High: '🟠', Medium: '🟡', Low: '🔵', Safe: '🟢' }[sev] || '⚠ ';
      const color = { Critical: chalk.hex('#ff4444'), High: chalk.hex('#ff8833'), Medium: chalk.hex('#ffcc00'), Low: chalk.hex('#66aaff') }[sev] || chalk.white;
      const vulnName = v.vulnerability || v.issue || 'Unknown';

      const card = [
        `  ${icon}  ${color.bold(vulnName)}`,
        `  ${chalk.gray('Line ' + (v.line || '?'))}  ·  ${color.bold(sev.toUpperCase())}`,
      ];

      const desc = v.description || v.explanation || '';
      const shortDesc = desc.split('. ')[0] + (desc.includes('. ') ? '.' : '');
      if (shortDesc.length > 10) card.push(`\n  ${shortDesc}`);

      if (v.impact) {
        card.push(`  ${chalk.gray('Impact:')} ${v.impact.split('.')[0]}.`);
      }

      const fixText = v.recommended_patch || v.fix;
      if (fixText) {
        card.push(`\n  ${chalk.hex('#44ff88')('▸ Fix:')} ${fixText.split('\n')[0]}`);
      }

      const code = v.patched_code || v.vulnerable_code;
      if (code) {
        const codeLines = code.split('\n').filter(l => l.trim());
        if (codeLines.length > 0) {
          card.push(`\n  ${chalk.gray('── Code ──')}`);
          codeLines.forEach(l => card.push(`  ${chalk.hex('#88ccff')(l)}`));
        }
      }

      if (v.why_fix_works) {
        card.push(`\n  ${chalk.gray('―')} ${v.why_fix_works.split('.')[0]}.`);
      }

      card.push('');
      console.log(boxen(card.join('\n'), { padding: { left: 1, right: 1, top: 0, bottom: 0 }, borderColor: { Critical: 'red', High: '#ff8833', Medium: 'yellow', Low: 'blue' }[sev] || 'gray', borderStyle: 'round' }));
    }

    console.log(`\n  ${chalk.hex('#ffcc00')('💡  Apply the fixes above, then rescan to check your score.')}`);
    const retry = await ask(`\n  ${chalk.hex('#44ff88')('▸')} ${chalk.bold.white('Rescan with a different file?')} ${chalk.gray('(y/n):')} `);
    if (retry.toLowerCase() === 'y' || retry.toLowerCase() === 'yes') {
      rl.close();
      return interactiveWizard();
    }
  }

  rl.close();
  console.log(`\n  ${chalk.gray('─'.repeat(50))}`);
  console.log(`  ${chalk.gray('Done. Run')} ${chalk.white('algoshield')} ${chalk.gray('to scan another contract.')}\n`);
}

async function run() {
  if (command === 'scan') {
    if (!target || (!target.endsWith('.teal') && !target.endsWith('.py') && !target.endsWith('.txt'))) {
      console.error(chalk.red('Please provide a .teal, .py, or .txt file to scan.'));
      process.exit(1);
    }
    const wallet = walletArg || (mintFlag ? await promptWallet() : 'sdk-user');
    const shield = new AlgoShield({ walletAddress: wallet });
    if (isJson) shield.config.silent = true;

    const resolvedTarget = path.resolve(target);
    const r = await shield.scanFile(resolvedTarget);
    if (isJson) { console.log(JSON.stringify(r, null, 2)); rl.close(); return; }

    if (r.score >= 70) {
      if (mintFlag || walletArg) {
        await promptMint(shield, r.scan_id, wallet);
      } else {
        console.log(`\n  ${chalk.hex('#44ff88')('🏆  Score ' + r.score + '/100 — you can mint an NFT certificate with:')}`);
        console.log(`  ${chalk.white('algoshield mint ' + r.scan_id + ' --wallet <your-address>')}`);
      }
    } else if (r.score < 70) {
      console.log(`\n  ${chalk.hex('#ffcc00')('💡  Score ' + r.score + '/100. Fix the vulnerabilities and rescan.')}`);
    }

    if (r.score < threshold) process.exit(1);
    rl.close();

  } else if (command === 'mint') {
    if (!target) { console.error(chalk.red('Usage: algoshield mint <scan-id> --wallet <address>')); process.exit(1); }
    const wallet = walletArg || await promptWallet();
    const shield = new AlgoShield({ walletAddress: wallet });
    const r = await shield.getReport(target);
    if (r.score < 70) { console.log(chalk.red(`Score ${r.score}/100 — need ≥ 70 to mint.`)); rl.close(); return; }
    await promptMint(shield, target, wallet);
    rl.close();

  } else if (command === 'watch') {
    rl.close();
    const shield = new AlgoShield({ walletAddress: walletArg || 'sdk-user' });
    shield.watch(target || '.');

  } else {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      showHelp();
      rl.close();
      return;
    }
    return interactiveWizard();
  }
}

run().catch(e => { console.error(chalk.red(`\n  Error: ${e.message}`)); process.exit(1); });
