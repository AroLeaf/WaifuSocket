import WS from 'ws';
import EventEmitter from 'events';
import Axios from 'axios';
import XRegExp from 'xregexp';

const regex = {
  key: XRegExp('_waifulab_key=(?<key>[^;]*)'),
  phx: XRegExp(`
    data-phx-session="(?<phxSession>[^"]*)".*?
    data-phx-static="(?<phxStatic>[^"]*)".*?
    id="(?<id>[^"]*)
  `, 'x'),
  csfr: XRegExp('<meta charset=.*?content="(?<csrf>[^"]*)'),
  token: XRegExp('window.authToken = "(?<token>[^"]*)'),
  image: XRegExp('<div class="collection-card">\\s*<img src="(?<url>.*?)"[\\s\\S]*?>\\s*(?<name>[^>]*)\\n\\s*</div>'),
}

/**
 * An object with a waifu's data
 * @typedef {object} waifu
 * @property {string} seeds - Encrypted seeds of this waifu (bring back numbered seeds pls ;-;)
 * @property {Buffer} image - PNG image of this waifu 
 */

/**
 * a waifu, or her seeds
 * @typedef {waifu|string} waifuSeedable
 */

/** The main WaifuSocket class */
export default class WaifuSocket extends EventEmitter {
  /**
   * Creates a WaifuSocket instance
   * @extends EventEmitter
   * @returns {WaifuSocket} a new WaifuSocket instance
   */
  constructor() {
    super();
    this.rest = Axios.create({
      baseURL: `https://waifulabs.com`,
      withCredentials: true,
      responseType: 'text',
    });
    this.sequence = 0;
    this.restart = true;
    this.once('connect', () => {
      this.emit('ready', this);
    });
    setInterval(() => this.send('heartbeat', {}, 'phoenix'), 30000);
  }

  /**
   * Log in to Waifulabs
   * @param {string} [cookie] 
   * @returns {Promise<WaifuSocket>} A promise resolving to the WaifuSocket instance `login()` was called on
   */
  async login(cookie) {
    console.log(cookie);
    if (cookie) this.rest.defaults.headers.cookie = `user_remember_me=${cookie}`;
    const genPage = await this.rest.get('/generate');
    const { key } = XRegExp.exec(genPage.headers['set-cookie'][0], regex.key)?.groups||{};
    this.rest.defaults.headers.cookie+= `; _waifulab_key=${key}`;
    const colPage = await this.rest.get('/collection');

    const { phxSession, phxStatic, id } = XRegExp.exec(colPage.data, regex.phx)?.groups||{};
    const { csrf } = XRegExp.exec(genPage.data, regex.csfr)?.groups||{};
    const { token } = XRegExp.exec(genPage.data, regex.token)?.groups||{};

    this.creds = { session: phxSession, static: phxStatic, id, csrf, token }
    this.connect();
    return this;
  }

  /** @private */
  connect() {
    if (!this.restart) return;
    this.start = this.sequence + 1;
    this.socket = new WS(`wss://waifulabs.com/creator/socket/websocket?token=${this.creds.token}&vsn=2.0.0`);

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
      this.connect();
    });
  }

  /** @private */
  async send(event, data, scope='api') {
    if (this.socket?.readyState !== WS.OPEN) await new Promise(res => this.once('connect', res));
    const seq = this.sequence++;
    this.socket.send(JSON.stringify([this.start.toString(), seq.toString(), scope, event, data]));
    return seq;
  }

  /** @private */
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

  /**
   * Closes the WaifuSocket
   * @returns {undefined}
   */
  close() {
    this.restart = false;
    this.socket.close();
  }


  /**
   * generates a grid of waifus
   * @param {Number} step - the generation step you want to create a grid for
   * @param {waifuSeedable} [waifu] - a waifu, or her seeds, required for all steps except step 0, where it is ignored
   * @returns {Promise<waifu[]>} a promise that resolves to an array of 16 waifus
   */
  async genGrid(step=0, waifu) {
    const currentGirl = waifu?.seeds || waifu;
    const res = currentGirl
      ? await this.request('generate', { id: 1, params: { step, currentGirl } })
      : await this.request('generate', { id: 1, params: { step } });
    return res.data.response.data.newGirls.map(w=>({ seeds: w.seeds, image: Buffer.from(w.image, 'base64') }));
  }

  /**
   * generates a high resolution waifu
   * @param {waifuSeedable} waifu - a waifu, or her seeds
   * @param {number} size - currently does nothing
   * @returns {Promise<waifu>} a promise that resolves to a waifu with high resolution image
   */
  async genBig(waifu, size=512) {
    const currentGirl = waifu?.seeds || waifu;
    const res = await this.request('generate_big', { params: { currentGirl, size } });
    return {
      image: Buffer.from(res.data.response.data.girl, 'base64'),
      seeds: currentGirl,
    }
  }

  /**
   * 
   * @param {waifuSeedable} waifu - a waifu, or her seeds
   * @param {string} name - the name you want to give to this waifu
   * @returns {object} the response data
   */
  async save(waifu, name) {
    const seeds = waifu?.seeds || waifu;
    const res = this.rest.post('/generate/save', {
      girlName: name, seeds,
      _csrf_token: this.creds.csrf,
    });
    return res.data;
  }
}