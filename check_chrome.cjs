const { execSync } = require('child_process');
try {
  const out = execSync('powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq \'chrome.exe\' } | Select-Object ProcessId, CommandLine"', { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.error(e.message);
}
