const XRegExp = require('xregexp');
const axios = require('axios');

const regex = {
  csrf: XRegExp('<meta content="(?<csrf>.*?)" name="csrf-token"'),
  key: XRegExp('_waifulab_key=(?<key>[^;]*)'),
  token: XRegExp('window.authToken = "(?<token>[^"]*)'),
  page: XRegExp('/collection\\?page=\\d+'),
  waifu: XRegExp('<div class="collection-card">[^]*?<a href="/waifu/(?<id>.*?)"[^]*?<img src="(?<img>[^]*?)"[^]*?<div class="bg-gray-900[^>]*>\\s*(?<name>[^\\s]*)'),
  details: {
    name: XRegExp('<title>Waifu Labs - (?<name>[^<]*)'),
    image: XRegExp('alt="portrait"[^]*?src="(?<image>[^"]*)'),
    pillow: XRegExp('src="(?<pillow>[^"]*)" alt="custom waifu pillow portrait"'),
    birthday: XRegExp('ml-auto text-gray-900">(?<birthday>[^<]*)'),
    stats: XRegExp('Total imports: (?<imports>\\d+)[^]*?Total rolls: (?<rolls>\\d+)'),
  }
}

const find = (text, regex) => XRegExp.exec(text, regex)?.groups || {};

module.exports = class Rest {
  constructor(base) {
    this.axios = axios.create({
      baseURL: base,
      withCredentials: true,
      maxRedirects: 0,
    });
    this.cookies = [];
  }

  async credentials(cookie) {
    if (cookie) this.cookies.push(`user_remember_me=${cookie}`);
    const generate = await this.axios.get('/generate', { headers: { cookie: this.cookies.join(';') } });
    
    const { key } = find(generate.headers['set-cookie'][0], regex.key);
    const { csrf } = find(generate.data, regex.csrf);
    const { token } = find(generate.data, regex.token);
    
    this.cookies.push(`_waifulab_key=${key}`);
    this.csrf = csrf;
    return { csrf, token };
  }
  
  async save(waifu) {
    const save = await this.axios.post(
      '/generate/save_unauth',
      JSON.stringify({ ...waifu, _csrf_token: this.csrf }),
      { headers: { cookie: this.cookies.join(';'), 'Content-Type': 'application/json' } }
    );
    const { key } = find(save.headers['set-cookie'][0], regex.key);
    const cookie = this.cookies[0] + `;_waifulab_key=${key}`;
    const collection = this.axios.get('/collection', { headers: { cookie } }).then(res => res.status);
    const match = XRegExp.exec(collection.data, regex.waifu);
    return match && {...match.groups};
  }

  async collection() {
    const page1 = await this.axios.get('/collection', { headers: { cookie: this.cookies.join(';') } });
    const hrefs = XRegExp.match(page1.data, regex.page, 'all').slice(1, -1);
    const pages = [page1].concat(await Promise.all(hrefs.map(href => this.axios.get(href, { headers: { cookie: this.cookies.join(';') } }))));
    const waifus = [];
    for (const page of pages) {
      XRegExp.forEach(page.data, regex.waifu, match => waifus.push({...match.groups}));
    }
    return waifus;
  }

  async details(id) {
    const page = await this.axios.get('/waifu/' + id, { headers: { cookie: this.cookies.join(';') } });
    const find = regex => XRegExp.exec(page.data, regex)?.groups || {};
    const stats = find(regex.details.stats);
    return {
      ...find(regex.details.name),
      ...find(regex.details.birthday),
      ...find(regex.details.image),
      ...find(regex.details.pillow),
      import: parseInt(stats.imports || 0),
      rolls: parseInt(stats.rolls || 0),
    }
  }
}