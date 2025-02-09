const http = require('http');
const { getSortedMatkul } = require('./getMatkul');
const { getSemester } = require('./getSemester');

// Fungsi untuk menangani permintaan HTTP
async function handleRequest(req, res) {
    // Menambahkan header CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'GET' && (req.url === '/api/2024' || req.url === '/api/2023')) {
        try {
            const matkul = await getSortedMatkul(req.url);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(matkul, null, 2));
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Terjadi kesalahan saat memproses permintaan.');
        }
    } else if (req.method === 'GET' && req.url === '/api/semester') {
        try {
            const semester = await getSemester(req.url);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(semester, null, 2));
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

const server = http.createServer(handleRequest);

const port = 3000;
server.listen(port, () => {
    console.log(`Server berjalan di ${port}`);
});
