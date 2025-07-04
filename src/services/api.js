import axios from "axios"
 
const api = axios.create({
    baseURL: 'https://satoshinakamoto.run/api',
})

export default api;