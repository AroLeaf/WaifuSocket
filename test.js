import WaifuSocket from './index.js';
import DotEnv from 'dotenv';
import fs from 'fs/promises';
DotEnv.config();

const ws = new WaifuSocket(process.env.SOCKET);

ws.on('ready', async () => {
  console.log('ready');
  const grid1 = await ws.genGrid();
  const big1 = await ws.genBig(grid1[0].seeds, 256);
  console.log(big1);
  fs.writeFile('./data/image1.png', big1.image);
  ws.socket.close();
  const grid2 = await ws.genGrid();
  const big2 = await ws.genBig(grid2[0].seeds, 256);
  console.log(big2);
  fs.writeFile('./data/image2.png', big2.image);
  ws.close();
});