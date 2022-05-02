const EventEmitter = require('events');
const Websocket = require('ws');

module.exports = class Socket extends EventEmitter {
  constructor(token) {
    super();
    this.token = token;
    this.sequence = 0;
    this.restart = true;
  }


  async connect() {
    return new Promise(resolve => {
      if (!this.restart) return;
      this.start = this.sequence + 1;
      this.socket = new Websocket(`wss://waifulabs.com/creator/socket/websocket?token=${this.token}&vsn=2.0.0`);

      this.socket.on('open', async () => {
        await this.request('phx_join', {});
        this.heartbeat = setInterval(() => this.send('heartbeat', {}, 'phoenix'), 30000);
        resolve(this);
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
        clearInterval(this.heartbeat);
        this.connect();
      });
    });
  }


  async send(event, data, scope='api') {
    if (this.socket?.readyState !== Websocket.OPEN) await new Promise(res => this.once('connect', res));
    const seq = this.sequence++;
    this.socket.send(JSON.stringify([this.start.toString(), seq.toString(), scope, event, data]));
    return seq;
  }


  async request(event, data) {
    const seq = await this.send(event, data);
    let resolved = false;
    return new Promise(async (resolve) => {
      this.once(seq.toString(), data => resolved || (resolve(data), resolved = true));
      setTimeout(async () => resolved || (resolve(this.request(event, data), resolved = true)), 10_000);
    });
  }

  
  close() {
    this.restart = false;
    this.socket.close();
  }
}