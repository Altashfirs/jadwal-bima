const axios = require('axios');
const { getToken } = require('./getToken');

async function getJson(token) {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://apibima.upnyk.ac.id/v2/jadkul/sesi`,
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

async function getSemester() {
    try {
        const token = await getToken();
        if (token) {
            const grades = await getJson(token);
            return grades;
        }
        return [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

module.exports = {
    getSemester
};