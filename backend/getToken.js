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

async function getJson(token) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://apibima.upnyk.ac.id/v2/jadkul/detail?params=9EVln1JNwT1WffbEyiCKe1B0gDnLLyaxLLa7ck_kxtWYnlVKwRnqv4FVPk2slIsIfEP8BQagDsV4GzGzf2rVF0QdAl1RPdnZwHrNYahgpQzuL933Y6oIMH2osJiQNG7lyajT5VDUde9lmiZ52ayHRA',
        headers: {
            'Jwt': token,
        }
    };

    try {
        const response = await axios.request(config);
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            return response.data.data; // Mengembalikan data mata kuliah
        } else {
            console.log('Data tidak tersedia atau tidak dalam format yang diharapkan.');
            return [];
        }
    } catch (error) {
        console.log('Error fetching grades:', error);
        return [];
    }
}

function dayToNumber(day) {
    const days = {
        "Senin": 1,
        "Selasa": 2,
        "Rabu": 3,
        "Kamis": 4,
        "Jumat": 5,
        "Sabtu": 6,
        "Minggu": 7
    };
    return days[day] || 0;
}

function sortBySchedule(grades) {
    return grades.sort((a, b) => {

        const scheduleA = a.jadwal[0];
        const scheduleB = b.jadwal[0];


        const [dayA, timeA] = scheduleA.split(' ', 2);
        const [dayB, timeB] = scheduleB.split(' ', 2);


        const dayNumA = dayToNumber(dayA);
        const dayNumB = dayToNumber(dayB);

        const startTimeA = timeA.split(' - ')[0];
        const startTimeB = timeB.split(' - ')[0];

        const [hourA, minuteA] = startTimeA.split(':').map(Number);
        const [hourB, minuteB] = startTimeB.split(':').map(Number);

        return dayNumA - dayNumB || hourA - hourB || minuteA - minuteB;
    });
}

async function getSortedMatkul() {
    try {
        const token = await getToken();
        if (token) {
            const grades = await getJson(token);
            return sortBySchedule(grades);
        }
        return [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

module.exports = {
    getSortedMatkul
};
