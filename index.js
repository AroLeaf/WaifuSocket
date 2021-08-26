import WS from 'ws';

export default class WaifuSocket extends WS {
  constructor(...args) {
    super(...args);
    this.sequence = 0;

    this.on('open', async () => {
      await this.request('phx_join', {});
      this.emit('ready');
    });

    this.on('message', msg => {
      msg = JSON.parse(msg);
      const data = {
        event: msg[3],
        data: msg[4],
      }
      this.emit('data', data);
      this.emit(msg[1], data);
    })
  }

  send(event, data) {
    this.sequence++;
    super.send(JSON.stringify(['0', this.sequence.toString(), 'api', event, data]));
  }

  request(event, data) {
    return new Promise((resolve) => {
      this.send(event, data);
      this.once(this.sequence.toString(), data => {
        resolve(data);
      });
    });
  }



  async genGrid(step=0, currentGirl=[]) {
    const res = await this.request('generate', { params: { step, currentGirl } });
    return res.data.response.data.newGirls.map(w=>({ seeds: w.seeds, image: Buffer.from(w.image, 'base64') }));
  }

  async genBig(currentGirl, size=512) {
    const res = await this.request('generate_big', { params: { currentGirl, size } });
    return {
      image: Buffer.from(res.data.response.data.girl, 'base64'),
      seeds: currentGirl,
    }
  }
}