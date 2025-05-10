import axios from "axios";

export const api  = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, //필요시 쿠키 포함함
})