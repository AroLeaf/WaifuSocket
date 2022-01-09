# WaifuSocket

node module to interface with the new waifulabs v2 websocket api

## Install
```sh
npm i waifusocket
```

## Usage
```js
import WaifuSocket from './index.js';
import fs from 'fs/promises';

const ws = await new WaifuSocket().login('thisismycookie');

ws.once('ready', async () => {
  const grid = await ws.genGrid();
  console.log(grid.length);
  const big = await ws.genBig(grid[0].seeds);
  await fs.writeFile('./image.png', big.image);
  ws.close();
});
```

## Docs
```js
new WaifuSocket(betacode, token)
```
Returns a new instance of WaifuSocket

```js
await ws.login(cookie)
```
Logs in with your user_remember_me cookie, returns the WaifuSocket instance it was called on\
`cookie`: your user_remember_me cookie

```js
await ws.genGrid(step, seeds)
```
Returns an array of 16 new [waifu]s\
`step`: the generation step
( 0: base, 1: color, 2: details, 3: pose )\
`seeds`: a [waifu]'s seeds (optional for step 0)

```js
await ws.genBig(seeds)
```
Returns a [waifu] with a big image\
`seeds`: a [waifu]'s seeds

```js
ws.close()
```
Closes the WaifuSocket, please don't leave too many sockets alive at once or Sizigi might restrict API access or something

[waifu]: #waifu
### Waifu
```js
{
  seeds: Number[16],
  image: Buffer, // PNG
}
```