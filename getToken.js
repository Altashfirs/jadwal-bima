require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');

async function getToken() {
    const url = 'https://bima.upnyk.ac.id/login'; // URL login
    const username = process.env.NIM; // Ganti dengan username yang valid
    const password = process.env.PASSWORD; // Ganti dengan password Anda

    try {
        // Mengambil halaman login untuk mendapatkan CSRF token
        const loginPageResponse = await axios.get(url);
        const $ = cheerio.load(loginPageResponse.data);

        // Mengambil CSRF token dari elemen yang sesuai
        const csrfToken = $('input[name="_token"]').val();

        // Mengirim permintaan POST untuk login
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

        // Menggunakan Cheerio untuk mem-parsing HTML dan mengambil token
        const $response = cheerio.load(response.data);
        const scripts = $response('script');

        // Mengambil isi dari tag <script> kedua
        const secondScriptContent = $response(scripts[1]).html();

        // Mencari token dalam isi script
        const tokenMatch = secondScriptContent.match(/localStorage\.setItem\("token", "(.*?)"\)/);

        if (tokenMatch && tokenMatch[1]) {
            return tokenMatch[1]; // Return the token
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

// Fungsi utama untuk menjalankan login dan mendapatkan grade
async function getGrade() {
    const token = await getToken(); // Tunggu hingga login selesai
    if (token) {
        return await getJson(token); // Return the grades if token is successfully obtained
    }
    return []; // Return an empty array if token is not obtained
}

// Fungsi untuk mengonversi nama hari ke angka
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
    return days[day] || 0; // Kembalikan 0 jika hari tidak valid
}

// Fungsi untuk mengurutkan mata kuliah berdasarkan jadwal
function sortBySchedule(grades) {
    return grades.sort((a, b) => {
        // Ambil jadwal pertama
        const scheduleA = a.jadwal[0];
        const scheduleB = b.jadwal[0];

        // Ekstrak hari dan waktu dari jadwal
        const [dayA, timeA] = scheduleA.split(' ', 2);
        const [dayB, timeB] = scheduleB.split(' ', 2);

        // Konversi hari ke angka
        const dayNumA = dayToNumber(dayA);
        const dayNumB = dayToNumber(dayB);

        // Ambil waktu mulai dari jadwal
        const startTimeA = timeA.split(' - ')[0]; // Ambil waktu mulai
        const startTimeB = timeB.split(' - ')[0]; // Ambil waktu mulai

        // Konversi waktu ke format yang bisa dibandingkan
        const [hourA, minuteA] = startTimeA.split(':').map(Number);
        const [hourB, minuteB] = startTimeB.split(':').map(Number);

        // Bandingkan hari dan waktu
        return dayNumA - dayNumB || hourA - hourB || minuteA - minuteB; // Urutkan berdasarkan hari, jam, dan menit
    });
}

// Memanggil fungsi getGrade dan mencetak hasilnya ke console dalam format JSON
(async () => {
    try {
        const grades = await getGrade(); // Menunggu hingga getGrade selesai
        const sortedGrades = sortBySchedule(grades); // Mengurutkan berdasarkan jadwal
        console.log('Data Mata Kuliah (Diurutkan berdasarkan Jadwal):');
        console.log(JSON.stringify(sortedGrades, null, 2)); // Cetak hasil dalam format JSON
    } catch (error) {
        console.error('Error:', error);
    }
})()
