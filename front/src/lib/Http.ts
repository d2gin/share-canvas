import axios, {Axios} from "axios";
import type {AxiosRequestConfig, AxiosResponse} from "axios";

export class Http {
    public instance!: Axios;
    protected abortController!: AbortController;
    protected config: any = {
        loading: false,
        requesting: '',
    };

    constructor() {
        this.instance = axios.create({
            baseURL: import.meta.env.VITE_HTTP_API,
            timeout: 60000,
            headers: {},
        });
        // 拦截器
        this.instance.interceptors.request.use((config: AxiosRequestConfig) => {
            return config;
        });
        this.instance.interceptors.response.use((response: AxiosResponse) => {
            if (response.data.code < 0) {
                return Promise.reject(response.data);
            }
            return response.data;
        });
    }

    loading(v: any = true) {
        this.config.loading = v;
        return this;
    }

    get(url: string, params: object | URLSearchParams | null = null) {
        return this.request({url, params});
    }

    post(url: string, data?: object) {
        return this.request({
            url,
            method: "POST",
            data,
        });
    }

    request(option: AxiosRequestConfig | string) {
        if (typeof option == "string") {
            option = {url: option,};
        }
        this.abortController = new AbortController();
        option.signal = this.abortController.signal;
        let loading = () => {
        };
        if (typeof this.config.loading == "string") {
        } else if (typeof this.config.loading == "boolean" && this.config.loading) {
        }
        this.config.requesting = option.url;
        // @ts-ignore
        return this.instance.request(option).finally(loading).finally(() => this.reset());
    }

    abort(url: string | null = null) {
        if (url === null || url === this.config.requesting) {
            this.abortController?.abort();
        }
        return this;
    }

    private reset() {
        this.config = {
            loading: false,
            requesting: '',
        };
    }
}

export default (new Http());

