require('dotenv').config(); // Memuat variabel dari .env
const axios = require('axios');
const getGrade = require('./getToken.js'); // Ensure this is the correct function

const DISCORD_WEBHOOK_URL = process.env.WEBHOOK; // Ganti dengan URL webhook Discord Anda
let previousGrades = []; // Menyimpan nilai sebelumnya

async function sendDiscordNotification(message) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: message
        });
    } catch (error) {
        console.error('Error sending Discord notification:', error);
    }
}

async function checkGrades() {
    const currentGrades = await getGrade(); // Call the function to get grades
    if (currentGrades.length > 0) {
        // console.log('Current Grades:', currentGrades); // Log the current grades

        // Check for new grades
        const newGrades = currentGrades.filter(grade =>
            !previousGrades.some(prev => prev.kode_mk === grade.kode_mk && prev.nilai === grade.nilai)
        );

        if (newGrades.length > 0) {
            const message = `New grades available:\n${newGrades.map(grade => `${grade.nama}`).join('\n')}`;
            await sendDiscordNotification(message);
            previousGrades = currentGrades; // Update previous grades
        } else {
            console.log('No new grades found.');
        }
    } else {
        console.log('Failed to retrieve grades or no grades available.');
    }
}

// Memeriksa nilai setiap 20 menit (1.200.000 ms)
setInterval(checkGrades, 1200000); // 20 menit

// Memanggil fungsi checkGrades untuk pertama kali
checkGrades();