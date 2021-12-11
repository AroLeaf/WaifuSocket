# WaifuSocket

node module to interface with the new waifulabs v2 websocket api

## Docs
```js
new WaifuSocket(betacode, token)
```
Returns a new WaifuSocket instance\
`betacode`: the hexadecimal bit at the start of the waifulabs v2 beta link\
`token`: your waifulabs v2 token

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