import { spawn } from 'child_process';
import WebSocket from 'ws';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9388;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  '--user-data-dir=C:\\Users\\ALENDA\\AppData\\Local\\Google\\Chrome\\User Data', // Or let's see default or let's inspect the active user's chrome
  '--no-first-run'
]);

// Wait, we don't want to lock user's chrome if it's already open.
