const chalk = require('chalk');
const boxen = require('boxen');

const SEV_COLOR = { Critical: chalk.hex('#ff4444'), High: chalk.hex('#ff8833'), Medium: chalk.hex('#ffcc00'), Low: chalk.hex('#66aaff'), Safe: chalk.hex('#44ff88') };
const SEV_ICON  = { Critical: '🔴', High: '🟠', Medium: '🟡', Low: '🔵', Safe: '🟢' };
const SEV_BORDER = { Critical: 'red', High: '#ff8833', Medium: 'yellow', Low: 'blue', Safe: 'green' };

function formatResult(result, filePath) {
  const scoreColor = result.score >= 70 ? chalk.hex('#44ff88') : result.score >= 40 ? chalk.hex('#ffcc00') : chalk.hex('#ff4444');
  const borderColor = result.score >= 70 ? 'green' : result.score >= 40 ? 'yellow' : 'red';
  const riskBadge = result.score >= 70 ? chalk.bgHex('#1a3a1a').hex('#44ff88').bold(' SAFE ') : result.score >= 40 ? chalk.bgHex('#3a2a00').hex('#ffcc00').bold(' RISKY ') : chalk.bgHex('#3a0a0a').hex('#ff4444').bold(' CRITICAL ');

  const headerLines = [
    `  ${chalk.bold.hex('#44ff88')('AlgoShield AI')}  ${chalk.gray('—')}  ${chalk.bold.white('Security Scan Report')}`,
    filePath ? chalk.gray(`  ${filePath}`) : ''
  ].filter(l => l);

  const header = boxen(headerLines.join('\n'), {
    padding: { left: 1, right: 1, top: 0, bottom: 0 },
    borderColor: '#44ff88',
    borderStyle: 'round'
  });

  const scoreLine = `${chalk.gray('Score')}  ${scoreColor.bold(String(result.score) + '/100')}    ${chalk.gray('Risk')}  ${riskBadge}`;
  const labelLine = result.label ? `${chalk.gray('Label')}  ${chalk.white(result.label)}` : '';
  const summaryLine = result.summary ? `\n  ${chalk.gray(result.summary)}` : '';

  const out = ['', header, '', scoreLine, labelLine, summaryLine].filter(l => l);

  const vulns = result.vulnerabilities || [];
  if (vulns.length > 0) {
    const order = { Critical: 0, High: 1, Medium: 2, Low: 3, Safe: 4 };
    vulns.sort((a, b) => (order[a.severity] ?? 4) - (order[b.severity] ?? 4)).forEach(v => {
      const sev = v.severity || 'Medium';
      const color = SEV_COLOR[sev] || chalk.white;
      const icon = SEV_ICON[sev] || '⚠ ';

      const vulnName = v.vulnerability || v.issue || 'Unknown';
      const shortDesc = (v.description || v.explanation || '').split('. ')[0] + '.';

      const cardLines = [
        `  ${icon}  ${color.bold(vulnName)}`,
        `  ${chalk.gray('Line ' + (v.line || '?'))}  ·  ${color.bold(sev.toUpperCase())}  ·  ${chalk.gray('Impact:')} ${chalk.white((v.impact || sev + ' threat').replace(/^[A-Z]+\.\s*/, ''))}`
      ];

      cardLines.push(`\n  ${shortDesc}`);

      const fixText = v.recommended_patch || v.fix;
      if (fixText) {
        cardLines.push(`\n  ${chalk.hex('#44ff88')('▸ Fix:')} ${fixText.split('\n')[0]}`);
      }

      const code = v.patched_code || v.vulnerable_code;
      if (code) {
        const codeLines = code.split('\n').filter(l => l.trim());
        if (codeLines.length > 0) {
          cardLines.push(`\n  ${chalk.gray('── Code ──')}`);
          codeLines.forEach(l => cardLines.push(`  ${chalk.hex('#88ccff')(l)}`));
        }
      }

      const why = v.why_fix_works;
      if (why) {
        cardLines.push(`\n  ${chalk.gray('―')} ${why.split('.')[0]}.`);
      }

      out.push('');
      out.push(boxen(cardLines.join('\n'), {
        padding: { left: 1, right: 1, top: 0, bottom: 0 },
        borderColor: SEV_BORDER[sev] || 'gray',
        borderStyle: 'round'
      }));
    });
  } else {
    out.push(`\n  ${chalk.green('✅  No vulnerabilities found — contract looks clean.')}`);
  }

  out.push('');
  out.push(chalk.gray('  Scan ID: ' + (result.scan_id || 'N/A')));
  const nextStep = result.score >= 70
    ? chalk.hex('#44ff88')('  🏆  Score ≥ 70 — eligible for NFT Certificate at https://algoshield.io')
    : chalk.hex('#ffcc00')('  💡  Fix the vulnerabilities above to improve your score');
  out.push(nextStep);
  out.push('');
  return out.join('\n');
}

function printScanResult(result, { filePath } = {}) {
  console.log(formatResult(result, filePath));
}

function printError(err) {
  console.error(boxen(chalk.red.bold('AlgoShield Error\n\n') + chalk.white(err.message), { padding: 1, borderColor: 'red', borderStyle: 'round' }));
}

module.exports = { formatResult, printScanResult, printError };
