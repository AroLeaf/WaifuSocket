import WaifuSocket from './index.js';
import DotEnv from 'dotenv';
import fs from 'fs/promises';
DotEnv.config();

const socket = new WaifuSocket(process.env.SOCKET);

socket.on('ready', async () => {
  console.log('ready');
  const grid = await socket.genGrid();
  const big = await socket.genBig(grid[0].seeds, 256);
  console.log(big);
  fs.writeFile('./data/image.png', big.image);
  socket.close();
});