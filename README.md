# WaifuSocket

node module to interface with the new waifulabs v2 websocket api

## Docs
```js
new WaifuSocket(url, ...args)
```
Returns a new WaifuSocket instance\
`url`: a valid waifulabs websocket url\
`args`: any arguments passed into a [ws](https://github.com/websockets/ws) WebSocket (apart from url of course)

```js
await ws.genGrid(step, seeds)
```
Returns an array of 16 new [waifu](#waifu)s\
`step`: the generation step
( 0: base, 1: color, 2: details, 3: pose )\
`seeds`: a [waifu](#waifu)'s seeds (optional for step 0)

```js
await ws.genBig(seeds)
```
Returns a [waifu](#waifu) with a big image\
`seeds`: a [waifu](#waifu)'s seeds

### Waifu
```js
{
  seeds: Number[16],
  image: Buffer, // PNG
}
```