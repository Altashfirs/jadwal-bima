const http = require('http');
const { getSortedMatkul } = require('./getToken'); // Mengimpor fungsi dari getMatkul.js

// Fungsi untuk menangani permintaan HTTP
async function handleRequest(req, res) {
    // Menambahkan header CORS
    res.setHeader('Access-Control-Allow-Origin', '*'); // Mengizinkan semua origin
    res.setHeader('Access-Control-Allow-Methods', 'GET'); // Mengizinkan metode GET
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Mengizinkan header tertentu

    if (req.method === 'GET' && req.url === '/') {
        try {
            const grades = await getSortedMatkul(); // Mengambil data mata kuliah
            // Mengirimkan data sebagai respons JSON
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(grades, null, 2));
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Terjadi kesalahan saat memproses permintaan.');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Halaman tidak ditemukan.');
    }
}

// Membuat server HTTP
const server = http.createServer(handleRequest);

// Menjalankan server
const port = 3000;
server.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
