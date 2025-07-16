import axios from "axios";

const BASE_URL ="http://localhost:1235";

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});