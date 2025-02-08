document.addEventListener('DOMContentLoaded', () => {
    const courseBody = document.getElementById('courseBody');
    const searchInput = document.getElementById('searchInput');
    const totalSKSContainer = document.getElementById('totalSKS');

    // Fetch data from the API
    async function fetchCourses() {
        try {
            const response = await fetch('http://localhost:3000/api');
            const courses = await response.json();
            populateTable(courses);
            calculateTotalSKS(courses);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Populate the table with course data
    function populateTable(courses) {
        courseBody.innerHTML = ''; // Clear existing data
        courses.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.thn_kur}</td>
                <td>${course.kode_mk}</td>
                <td>${course.nama_mk}</td>
                <td>${course.kelas}</td>
                <td>${course.sks}</td>
                <td>${course.jadwal.join(', ')}</td>
                <td>${course.dosen.join(', ')}</td>
            `;
            courseBody.appendChild(row);
        });
    }

    // Calculate total SKS
    function calculateTotalSKS(courses) {
        const totalSKS = courses.reduce((sum, course) => sum + course.sks, 0);
        totalSKSContainer.textContent = `Total SKS: ${totalSKS}`;
    }

    // Search functionality
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const rows = courseBody.getElementsByTagName('tr');

        Array.from(rows).forEach(row => {
            const cells = row.getElementsByTagName('td');
            const match = Array.from(cells).some(cell =>
                cell.textContent.toLowerCase().includes(filter)
            );
            row.style.display = match ? '' : 'none';
        });
    });

    // Initial fetch
    fetchCourses();
});
