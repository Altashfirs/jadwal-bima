const http = require('http');
const url = require('url');
const { getSortedMatkul } = require('./getMatkul');
const { getSemester } = require('./getSemester');

async function handleRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;

    if (req.method === 'GET' && parsedUrl.pathname === '/api/semester') {
        try {
            const semester = await getSemester();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(semester, null, 2));
        } catch (error) {
            console.error('Error:', error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Terjadi kesalahan saat memproses permintaan.');
        }
    } else if (req.method === 'GET' && parsedUrl.pathname.startsWith('/api/matkul')) { // Correct condition
        try {
            const matkul = await getSortedMatkul(query.params);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(matkul, null, 2));
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

