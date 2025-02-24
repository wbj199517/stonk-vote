// fetchInterceptor.js
class FetchInterceptor {
    baseURL: string;
    requestInterceptors: ((url: string, options: RequestInit) => { url: string; options: RequestInit } | void)[];
    responseInterceptors: ((response: Response) => Promise<Response | any>)[];

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    // 添加请求拦截器
    addRequestInterceptor(interceptor: (url: string, options: RequestInit) => { url: string; options: RequestInit } | void) {
        this.requestInterceptors.push(interceptor);
    }

    // 添加响应拦截器
    addResponseInterceptor(interceptor: (response: Response) => Promise<Response | any>) {
        this.responseInterceptors.push(interceptor);
    }

    async request(url: string, options = {}) {
        let fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;

        // 应用请求拦截器
        for (const interceptor of this.requestInterceptors) {
            const result = interceptor(fullUrl, options);
            if (result) {
                fullUrl = result.url || fullUrl;
                options = result.options || options;
            }
        }

        try {
            // 发起请求
            const response = await fetch(fullUrl, options);

            let result = response;
            for (const interceptor of this.responseInterceptors) {
                result = await interceptor(response) || result;
            }

            return result;
        } catch (error) {
            console.error('Fetch failed:', error);
            throw error;
        }
    }
}

const api = new FetchInterceptor('http://localhost:9000');

// 添加请求拦截器（比如添加 token）
api.addRequestInterceptor((url, options) => {
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    console.log('请求拦截:', url, options);
    return { url, options };
});

// 添加响应拦截器（处理全局错误）
api.addResponseInterceptor(async (response) => {
    if (!response.ok) {
        const errorData = await response.json();
        console.error('响应拦截:', errorData.message);
        throw new Error(errorData.message || '请求失败');
    }
    return response.json(); // 解析JSON数据
});

// 发起请求
export default function request(url: string, params: { method: string; data?: any }, options?: RequestInit): Promise<any> {
    return api.request(url, {
        ...options,
        method: params.method,
        body: params.data ? JSON.stringify(params.data) : undefined,
    });
}