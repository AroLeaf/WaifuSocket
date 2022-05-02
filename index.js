const Rest = require('./rest.js');
const Socket = require('./socket.js');

class WaifuSocket {
  constructor() {
    this.rest = new Rest('https://waifulabs.com');
  }

  async login(cookie) {
    const creds = await this.rest.credentials(cookie);
    this.socket = new Socket(creds.token);
    return this;
  }

  close() {
    this.socket.close();
  }

  async genGrid(step=0, waifu) {
    const currentGirl = waifu?.seeds || waifu;
    const res = currentGirl
      ? await this.socket.request('generate', { id: 1, params: { step, currentGirl } })
      : await this.socket.request('generate', { id: 1, params: { step } });
    return res.data.response.data.newGirls.map(w=>({ seeds: w.seeds, image: Buffer.from(w.image, 'base64') }));
  }

  async genBig(waifu, size=512) {
    const currentGirl = waifu?.seeds || waifu;
    const res = await this.socket.request('generate_big', { params: { currentGirl, size } });
    return {
      image: Buffer.from(res.data.response.data.girl, 'base64'),
      seeds: currentGirl,
    }
  }

  async save(waifu, name) {
    const seeds = waifu?.seeds || waifu;
    const res = await this.rest.save({ girlName: name, seeds });
    return { ...res, seeds };
  }

  async collection() {
    return this.rest.collection();
  }

  async fetch(waifu) {
    const id = waifu?.id || waifu;
    return this.rest.details(id);
  }
}


module.exports = {
  WaifuSocket,
  Socket,
  Rest,
}