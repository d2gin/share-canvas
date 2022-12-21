import {inject} from 'vue';

export interface Message {
    type: string,
    data?: any | null,
    code?: number | 0,
}

export const useWebsocket = (): WebsocketService => <WebsocketService>inject('websocketService');

export class WebsocketService {
    protected io: WebSocket;
    public onMessage: Function | undefined;

    constructor() {
        this.io = new WebSocket(import.meta.env.VITE_WEBSOCKET_API);
        // @ts-ignore
        this.io.onmessage = this.handleMessage.bind(this);
    }

    protected handleMessage(e: MessageEvent) {
        return this.onMessage?.apply(this, [JSON.parse(e.data)]);
    }

    public send(data: Message) {
        // @ts-ignore
        return this.io.send(JSON.stringify(data));
    }
}

export default new WebsocketService();
