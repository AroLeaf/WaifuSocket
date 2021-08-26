# WaifuSocket

node module to interface with the new waifulabs v2 websocket api

## Docs
---
```
new WaifuSocket(url, ...args)
```
Returns a new WaifuSocket instance\
`url`: a valid waifulabs websocket url\
`args`: any arguments passed into a [ws](https://github.com/websockets/ws) WebSocket

---
```
ws.genGrid(step, seeds)
```
Returns an array of 16 new [waifu](#waifu)s\
`step`: the generation step
( 0: base, 1: color, 2: details, 3: pose )\
`seeds`: a [waifu](#waifu)'s seeds (optional for step 0)

---
```
ws.genBig(seeds)
```
Returns a [waifu](#waifu) with a big image\
`seeds`: a [waifu](#waifu)'s seeds

### Waifu
```
{
  seeds: Number[16],
  image: Buffer, // PNG
}
```