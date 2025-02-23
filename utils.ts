
// fetchInterceptor.js
class FetchInterceptor {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    // 添加请求拦截器
    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    // 添加响应拦截器
    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }

    async request(url, options = {}) {
        let fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;

        // 应用请求拦截器
        for (const interceptor of this.requestInterceptors) {
            const result = interceptor(fullUrl, options);
            if (result) {
                fullUrl = result.url || fullUrl;
                options = result.options || options;
            }
        }

        // 发起请求
        const response = await fetch(fullUrl, options);

        let result = response;
        for (const interceptor of this.responseInterceptors) {
            result = await interceptor(response) || result;
        }

        return result;
    }
}

const api = new FetchInterceptor('https://api.example.com');



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

export default request = (url:string,params:{method:string,data:any},option?:{})=>{
    return api.request(url,{
        method: params.method,
        body:JSON.stringify(params.data),
    })
    // (url, { method: params.method,body: JSON.stringify(params.data) })
    //     .then((data) => console.log('成功响应:', data))
    //     .catch((err) => console.error('请求错误:', err));
}
