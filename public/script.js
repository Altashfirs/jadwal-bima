document.addEventListener('DOMContentLoaded', () => {
    const courseBody = document.getElementById('courseBody');
    const searchInput = document.getElementById('searchInput');
    const totalSKSContainer = document.getElementById('totalSKS');
    const semesterDropdown = document.getElementById('semesterDropdown');

    // Fetch data from the API based on selected parameter_jadwal
    async function fetchCourses(parameter_jadwal) {
        try {
            const response = await fetch(`http://localhost:3000/api/matkul?params=${parameter_jadwal}`);
            console.log(parameter_jadwal)
            const courses = await response.json();
            populateTable(courses);
            calculateTotalSKS(courses);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Fetch semester data from the API
    async function fetchSemesters() {
        try {
            const response = await fetch('http://localhost:3000/api/semester');
            const semesters = await response.json();
            populateDropdown(semesters);
        } catch (error) {
            console.error('Error fetching semester data:', error);
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

    // Populate the dropdown with semester data
    function populateDropdown(semesters) {
        semesterDropdown.innerHTML = ''; // Clear existing options
        semesters.forEach(semester => {
            const option = document.createElement('option');
            option.value = semester.parameter_jadwal; // Store parameter_jadwal as value
            option.textContent = semester.sesi; // Display sesi as text
            semesterDropdown.appendChild(option);
        });
    }

    // Event listener for dropdown selection
    semesterDropdown.addEventListener('change', () => {
        const selectedParameter = semesterDropdown.value; // Get the selected parameter_jadwal
        if (selectedParameter) {
            fetchCourses(selectedParameter); // Fetch courses based on selected parameter
        }
    });

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

    // Initial fetch for semesters
    fetchSemesters();
});
