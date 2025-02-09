require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');

async function getToken() {
    const url = 'https://bima.upnyk.ac.id/login';
    const username = process.env.NIM;
    const password = process.env.PASSWORD;

    try {
        const loginPageResponse = await axios.get(url);
        const $ = cheerio.load(loginPageResponse.data);

        const csrfToken = $('input[name="_token"]').val();

        const response = await axios.post(url, new URLSearchParams({
            'username': username,
            'password': password,
            '_token': csrfToken,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': loginPageResponse.headers['set-cookie'],
                'Referer': url
            }
        });

        const $response = cheerio.load(response.data);
        const scripts = $response('script');

        const secondScriptContent = $response(scripts[1]).html();

        const tokenMatch = secondScriptContent.match(/localStorage\.setItem\("token", "(.*?)"\)/);

        if (tokenMatch && tokenMatch[1]) {
            return tokenMatch[1];
        } else {
            console.log('Token tidak ditemukan.');
        }
    } catch (error) {
        console.error('Login gagal:', error.response ? error.response.data : error.message);
    }
}

module.exports = {
    getToken
};