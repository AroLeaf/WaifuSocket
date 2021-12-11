import WS from 'ws';
import EventEmitter from 'events';

export default class WaifuSocket extends EventEmitter {
  constructor(url, token) {
    super();
    this.sequence = 0;
    this.restart = true;
    this.once('connect', () => {
      this.emit('ready');
    });
    this.connect(url, token);
    setInterval(() => this.send('heartbeat', {}, 'phoenix'), 30000);
  }

  connect(betacode, token) {
    if (!this.restart) return;
    this.start = this.sequence + 1;
    this.socket = new WS(`wss://${betacode}.beta.waifulabs.com/creator/socket/websocket?token=${token}&vsn=2.0.0`);

    this.socket.on('open', async () => {
      await this.request('phx_join', {});
      this.emit('connect');
    });

    this.socket.on('message', msg => {
      msg = JSON.parse(msg);
      const data = {
        event: msg[3],
        data: msg[4],
      }
      this.emit(msg[1], data);
    });

    this.socket.on('close', () => {
      this.connect(url, token);
    });
  }

  async send(event, data, scope='api') {
    if (this.socket?.readyState !== WS.OPEN) await new Promise(res => this.once('connect', res));
    const seq = this.sequence++;
    this.socket.send(JSON.stringify([this.start.toString(), seq.toString(), scope, event, data]));
    return seq;
  }

  request(event, data) {
    const wait = (seq, fn) => {
      this.once(seq.toString(), fn)
    };
    return new Promise(async (resolve) => {
      const seq = await this.send(event, data);
      const timeout = setTimeout(async () => wait(await this.send(event, data), data => resolve(data)), 5000);
      wait(seq, data => {
        clearTimeout(timeout);
        resolve(data);
      });
    });
  }

  close() {
    this.restart = false;
    this.socket.close();
  }



  async genGrid(step=0, currentGirl='') {
    const res = currentGirl
      ? await this.request('generate', { id: 1, params: { step, currentGirl } })
      : await this.request('generate', { id: 1, params: { step } });
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