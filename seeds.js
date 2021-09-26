import WaifuSocket from './index.js';
import DotEnv from 'dotenv';
DotEnv.config();

const ws = new WaifuSocket(process.env.SOCKET);

ws.on('ready', async () => {
  console.log('ready');

  const big = await ws.genBig();
  console.log(grid[0].seeds.split('.'));
  ws.close();
});