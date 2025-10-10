document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const myCoursesGrid = document.getElementById('my-courses-grid');
    const logoutBtn = document.getElementById('logout-btn-mycourses');

    // If user is not logged in, redirect them
    if (!token) {
        alert('You need to be logged in to view your courses.');
        window.location.href = 'portal.html';
        return;
    }

    const fetchMyCourses = async () => {
        try {
            myCoursesGrid.innerHTML = '<p>Loading your courses...</p>';
            const response = await fetch('http://192.168.31.140:5000/api/enrollments/mycourses', {
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) {
                throw new Error('Could not fetch your courses.');
            }
            
            const enrollments = await response.json();
            myCoursesGrid.innerHTML = '';

            if (enrollments.length === 0) {
                myCoursesGrid.innerHTML = '<p>You are not actively enrolled in any courses yet.</p>';
                return;
            }

            // Display each enrolled course
            enrollments.forEach(enrollment => {
                // Check if the course data exists to prevent errors
                if (enrollment.course) {
                    const course = enrollment.course;
                    const courseCard = document.createElement('div');
                    courseCard.className = 'course-card';
                    
                    courseCard.innerHTML = `
                        <h2>${course.title}</h2>
                        <p>${course.description}</p>
                        <button class="btn access-btn" data-course-id="${course._id}">Access Course</button>
                    `;
                    myCoursesGrid.appendChild(courseCard);
                }
            });

        } catch (error) {
            myCoursesGrid.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    };

    // Event listener for the "Access Course" button
    myCoursesGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('access-btn')) {
            const courseId = e.target.getAttribute('data-course-id');
            window.location.href = `course-content.html?id=${courseId}`;
        }
    });

    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        alert('You have been logged out.');
        window.location.href = 'index.html';
    });

    // Initial fetch of courses
    fetchMyCourses();
});