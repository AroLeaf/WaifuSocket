# WaifuSocket
[![npm](https://img.shields.io/npm/v/waifusocket?style=flat-square)](https://npmjs.com/package/waifusocket)

node module to interface with the new waifulabs v2 websocket api

## Install
```sh
npm i waifusocket
```

## Usage example
```js
import fs from 'fs/promises';
import { WaifuSocket } from 'waifusocket';

const socket = await new WaifuSocket().login('SFMyNTY.JUSTSOMERANDOMCOOKIE');

const grid = await ws.genGrid();
console.log(grid.length);

const big = await ws.genBig(grid[0].seeds);
await fs.writeFile('./image.png', big.image);

ws.close();
```