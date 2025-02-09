const axios = require('axios');
const { getToken } = require('./getToken');

async function getJson(token, url) {
    let params;
    if (url === '/api/2024') {
        params = '9EVln1JNwT1WffbEyiCKe1B0gDnLLyaxLLa7ck_kxtWYnlVKwRnqv4FVPk2slIsIfEP8BQagDsV4GzGzf2rVF0QdAl1RPdnZwHrNYahgpQzuL933Y6oIMH2osJiQNG7lyajT5VDUde9lmiZ52ayHRA';
    } else if (url === '/api/2023') {
        params = '9EVln1JNwT1WffbEyiCKe1B0gDnLLyaxLLa7ck_kxtWYnlVKwRnqv4FVPk2slIsIfEP8BQagDsV4GzGzf2rVF0QdAl1RPdnZwHrNYahgpQz4ZCiBqJ3y9EqXYlu4aCAgyajT5VDUde9lmiZ52ayHRA';
    }

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://apibima.upnyk.ac.id/v2/jadkul/detail?params=${params}`,
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

async function getSortedMatkul(url) {
    try {
        const token = await getToken();
        if (token) {
            const grades = await getJson(token, url);
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