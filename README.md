# WaifuSocket

node module to interface with the new waifulabs v2 websocket api

## Docs
```js
new WaifuSocket(url, token)
```
Returns a new WaifuSocket instance\
`url`: a waifulabs v2 websocket url without query parameters\
`token`: your waifulabs v2 token

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

```js
ws.close()
```
Closes the WaifuSocket, please don't leave too many sockets alive at once or Sizigi might restrict API access or something

### Waifu
```js
{
  seeds: Number[16],
  image: Buffer, // PNG
}
```