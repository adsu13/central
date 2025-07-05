import axios from "axios"
 
const api = axios.create({
    //baseURL: 'https://satoshinakamoto.run/api',
    baseURL: 'http://localhost:8080',
})

export default api;