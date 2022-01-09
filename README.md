# WaifuSocket

node module to interface with the new waifulabs v2 websocket api

## Install
```sh
npm i waifusocket
```

## Usage example
```js
import WaifuSocket from './index.js';
import fs from 'fs/promises';

const ws = await new WaifuSocket().login();

ws.once('ready', async () => {
  const grid = await ws.genGrid();
  console.log(grid.length);
  const big = await ws.genBig(grid[0].seeds);
  await fs.writeFile('./image.png', big.image);
  ws.close();
});
```

## Docs
### `new WaifuSocket()`
Returns a new instance of WaifuSocket

### `await ws.login([cookie])`
Logs in with your user_remember_me cookie, returns the WaifuSocket instance it was called on\
`cookie`: your user_remember_me cookie, only required to save waifus

### `await ws.genGrid(step, [waifu])`
Returns an array of 16 new [waifu]s\
`step`: the generation step
( 0: base, 1: color, 2: details, 3: pose )\
`waifu`: a [waifu] or her seeds (required for all steps except step 0, where it is ignored)

### `await ws.genBig(waifu)`
Returns a [waifu] with a high resolution image\
`waifu`: a [waifu] or her seeds

### `await ws.save(waifu, name)`
Saves a waifu to your account\
`waifu`: a [waifu] or her seeds\
`name`: the name you want to give your waifu

### `ws.close()`
Closes the WaifuSocket, please don't leave too many sockets alive at once or Sizigi might restrict API access or something

[waifu]: #waifu
### waifu
```js
{
  seeds: string,
  image: Buffer, // PNG
}
```