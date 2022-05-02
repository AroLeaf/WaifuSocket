import { AxiosInstance } from 'axios';


export interface SocketWaifu {
  seeds: string;
  image: Buffer;
}

export type grid = [
  SocketWaifu, SocketWaifu, SocketWaifu, SocketWaifu,
  SocketWaifu, SocketWaifu, SocketWaifu, SocketWaifu,
  SocketWaifu, SocketWaifu, SocketWaifu, SocketWaifu,
  SocketWaifu, SocketWaifu, SocketWaifu, SocketWaifu,
];


export interface RestWaifu {
  id: string;
  name: string;
  image: string;
}

export interface DetailedWaifu extends RestWaifu {
  pillow: string;
  imports: number;
  rolls: number;
}


export class Socket {
  sequence: number;
  token: string;
  restart: boolean;
  constructor(token: string);
  connect(): Promise<this>;
  send(event: string, data: any, scope?: string): Promise<number>;
  request(event: string, data: any): Promise<any>;
  close(): void;
}


export class Rest {
  axios: AxiosInstance;
  cookies: string[];
  constructor(base: string);
  credentials(cookie: string);
  save(waifu: { girlName: string, seeds: string }): Promise<RestWaifu>;
  collection(): Promise<RestWaifu[]>;
  details(): Promise<DetailedWaifu>;
}


/**
 * The main WaifuSocket class
 */
export class WaifuSocket {
  socket: Socket;
  rest: Rest;
  
  /**
   * Logs in and connects to the websocket.
   * @param cookie - your "user_remember_me" cookie on waifulabs.com
   */
  login(cookie?: string): Promise<this>;
  
  /**
   * Closes the websocket.
   */
  close(): void;
  
  /**
   * Generates 16 new waifus
   * @param step - 
   * 0: all attributes\
   * 1: color\
   * 2: details\
   * 3: pose
   * @param waifu - a waifu or her seeds
   */
  genGrid(step: 0): Promise<grid>;
  genGrid(step: 1|2|3, waifu: SocketWaifu | string): Promise<grid>;

  /**
   * Generates a large image of a waifu
   * @param waifu - a waifu or her seeds
   * @param size - currently unused
   */
  genBig(waifu: SocketWaifu | string, size?: number): Promise<SocketWaifu>;

  /**
   * Saves a waifu to your collection
   * @param waifu - a waifu or her seeds
   * @param name - a cute waifu needs a cute name
   */
  save(waifu: SocketWaifu | string, name: string): Promise<RestWaifu & { seeds: string }>

  /**
   * Fetches all waifus in your collection
   */
  collection(): Promise<RestWaifu[]>;

  /**
   * Fetches additional info for a saved waifu
   * @param waifu - a waifu or her ID
   */
  fetch(waifu: RestWaifu | string): Promise<DetailedWaifu>;
}