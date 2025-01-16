import axios from 'axios';

// const ip = '192.168.0.101'
// const port = '3050'
const address = process.env.EXPO_PUBLIC_API_URL;
// const address ="https://athena-automat.com/";
const client = axios.create({
    baseURL: `http://${address}/api/v1`,
    timeout: 1000,
    headers: {
        'Content-Type': 'application/json',
    },
});
export default client;
