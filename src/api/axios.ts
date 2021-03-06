import axios from 'axios'
import storage from '../utils/storage'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  parent: '#app',
  showSpinner: false,
  easing: 'case',
  speed: 500,
})

axios.defaults.timeout = 10000

axios.interceptors.request.use(
  config => {
    NProgress.start()
    const token = storage.get('token')
    token && (config.headers.Authorization = token)
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    NProgress.done()
    // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
    // 否则的话抛出错误
    if (response.status === 200) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(response)
    }
  },
  // 服务器状态码不是2开头的的情况
  // 这里可以跟你们的后台开发人员协商好统一的错误状态码
  // 然后根据返回的状态码进行一些操作，例如登录过期提示，错误提示等等
  // 下面列举几个常见的操作，其他需求可自行扩展
  error => {
    if (error.response.status) {
      switch (error.response.status) {
        // 401: 未登录
        // 未登录则跳转登录页面，并携带当前页面的路径
        // 在登录成功后返回当前页面，这一步需要在登录页操作。
        case 401:
          console.log('身份验证失败，请关闭重新进入。')
          break
        // 403 token过期
        // 登录过期对用户进行提示
        // 清除本地token和清空vuex中token对象
        // 跳转登录页面
        case 403:
          console.log('登录过期，请关闭重新进入。')
          // 清除token
          break

        // 404请求不存在
        case 404:
          // console.log('您访问的网页不存在。')
          break
        // 其他错误，直接抛出错误提示
        default:
          console.log(error.response.data.message)
      }
      return Promise.reject(error.response)
    }
  }
)

export default axios

// ElMessage.success({message:})
