document.addEventListener('DOMContentLoaded', () => {
    const courseBody = document.getElementById('courseBody');
    const searchInput = document.getElementById('searchInput');
    const totalSKSContainer = document.getElementById('totalSKS');
    const semesterDropdown = document.getElementById('semesterDropdown');


    async function fetchCourses(parameter_jadwal) {
        try {
            const response = await fetch(`http://localhost:3000/api/matkul?params=${parameter_jadwal}`);
            const courses = await response.json();
            populateTable(courses);
            calculateTotalSKS(courses);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }


    async function fetchSemesters() {
        try {
            const response = await fetch('http://localhost:3000/api/semester');
            const semesters = await response.json();
            populateDropdown(semesters);

            if (semesters.length > 0) {
                fetchCourses(semesters[0].parameter_jadwal); 
            }
        } catch (error) {
            console.error('Error fetching semester data:', error);
        }
    }

    function populateTable(courses) {
        courseBody.innerHTML = ''; 
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

    function calculateTotalSKS(courses) {
        const totalSKS = courses.reduce((sum, course) => sum + course.sks, 0);
        totalSKSContainer.textContent = `Total SKS: ${totalSKS}`;
    }

    function populateDropdown(semesters) {
        semesterDropdown.innerHTML = '';
        semesters.forEach(semester => {
            const option = document.createElement('option');
            option.value = semester.parameter_jadwal;
            option.textContent = semester.sesi;
            semesterDropdown.appendChild(option);
        });
    }

    semesterDropdown.addEventListener('change', () => {
        const selectedParameter = semesterDropdown.value;
        if (selectedParameter) {
            fetchCourses(selectedParameter);
        }
    });

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

    fetchSemesters();
});
