import axios from 'axios'
// import { useUserStore } from '@/stores/modules/user'

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API,
  timeout: 1000 * 30, // 请求超时时间
  // withCredentials: false // 由于后端 CORS 设置，要和后端一致，这里设置 false
})

// request拦截器
service.interceptors.request.use(
  (config) => {
    // const userStore = useUserStore()
    // if (userStore.token) {
    //   config.headers['Authorization'] = userStore.token
    // }
    return config
  },
  (error) => {
    console.error('error: ', error) // for debug
    Promise.reject(error)
  },
)

// respone拦截器
service.interceptors.response.use(
  (response) => {
    const { code, message } = response.data
    if (code === 200) {
      // console.log(response.data);
      return response.data
    } else {
      if (response.data.code === 401) {
        // const userStore = useUserStore()
        // // token超时
        // userStore.Logout()
      }
      // 业务错误
      // ElMessage.error(message) // 提示错误消息
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    // 处理 token 超时问题
    if (error.response && error.response.data && error.response.data.code === 401) {
      // const userStore = useUserStore()
      // // token超时
      // userStore.Logout()
    }
    // ElMessage.error(error.message) // 提示错误信息
    return Promise.reject(error)
  },
)

export default service
