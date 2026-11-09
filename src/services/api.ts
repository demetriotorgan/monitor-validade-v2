import axios from "axios"

const api = axios.create({
    baseURL: "https://api-monitor-validade-integrado-fron.vercel.app/api"
    // baseURL:"http://localhost:3000/api"
});

export default api;