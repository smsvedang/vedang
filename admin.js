document.addEventListener('DOMContentLoaded', () => {
    // --- Check for login token ---
    const token = localStorage.getItem('token');
    if (!token) {
        alert('You are not logged in. Redirecting...');
        window.location.href = '/index.html';
        return;
    }

    // --- DOM Elements ---
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const studentsTbody = document.getElementById('students-tbody');
    const coursesTbody = document.getElementById('courses-tbody');
    const enrollmentsTbody = document.getElementById('enrollments-tbody');
    const logoutBtn = document.getElementById('logout-btn');
    const addCourseBtn = document.getElementById('add-course-btn');
    const courseFormContainer = document.getElementById('course-form-container');
    const cancelBtn = document.getElementById('cancel-btn');
    const courseForm = document.getElementById('course-form');
    
    // Modal DOM Elements
    const contentModal = document.getElementById('content-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalCourseTitle = document.getElementById('modal-course-title');
    const addContentForm = document.getElementById('add-content-form');
    const currentContentList = document.getElementById('current-content-list');
    const saveContentBtn = document.getElementById('save-content-btn');

    // State variables
    let currentEditingCourseId = null;
    let tempContentList = [];
    
    // --- API Headers ---
    const apiHeaders = { 'Content-Type': 'application/json', 'x-auth-token': token };

    // --- Navigation Logic ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (!targetId) return;

            navLinks.forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            
            contentSections.forEach(section => {
                section.classList.toggle('active', section.id === targetId);
            });
        });
    });

    // --- RENDER FUNCTIONS ---
    const renderContentList = () => {
        currentContentList.innerHTML = '';
        if (tempContentList.length === 0) {
            currentContentList.innerHTML = '<p>No content added yet.</p>';
            return;
        }
        tempContentList.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'content-list-item';
            div.innerHTML = `
                <span><strong>${item.title}</strong> (${item.type})</span>
                <button class="btn btn-danger btn-sm" data-index="${index}">Remove</button>
            `;
            currentContentList.appendChild(div);
        });
    };

    // --- FETCH FUNCTIONS ---
    const fetchStudents = async () => {
        try {
            const res = await fetch('http://192.168.31.140:5000/api/users', { headers: apiHeaders });
            if (!res.ok) throw new Error('Failed to fetch students.');
            const users = await res.json();
            studentsTbody.innerHTML = '';
            users.forEach(user => {
                const row = `<tr><td>${user.name}</td><td>${user.email}</td><td>${new Date(user.date).toLocaleDateString()}</td></tr>`;
                studentsTbody.innerHTML += row;
            });
        } catch (error) { studentsTbody.innerHTML = `<tr><td colspan="3">${error.message}</td></tr>`; }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch('http://192.168.31.140:5000/api/courses');
            if (!res.ok) throw new Error('Failed to fetch courses.');
            const courses = await res.json();
            coursesTbody.innerHTML = '';
            courses.forEach(course => {
                const row = `<tr>
                    <td>${course.title}</td>
                    <td>₹${course.price}</td>
                    <td class="actions">
                        <button class="btn btn-secondary btn-sm manage-content-btn" data-id="${course._id}">Content</button>
                        <button class="btn btn-danger btn-sm delete-course-btn" data-id="${course._id}">Delete</button>
                    </td>
                </tr>`;
                coursesTbody.innerHTML += row;
            });
        } catch (error) { coursesTbody.innerHTML = `<tr><td colspan="3">${error.message}</td></tr>`; }
    };
    
    const fetchPendingEnrollments = async () => {
        try {
            const res = await fetch('http://192.168.31.140:5000/api/enrollments/pending', { headers: apiHeaders });
            if (!res.ok) throw new Error('Failed to fetch enrollments.');
            const enrollments = await res.json();
            enrollmentsTbody.innerHTML = '';
            if (enrollments.length === 0) {
                enrollmentsTbody.innerHTML = `<tr><td colspan="4">No pending requests.</td></tr>`;
            } else {
                enrollments.forEach(enroll => {
                    const row = `<tr>
                        <td>${enroll.user.name}</td>
                        <td>${enroll.user.email}</td>
                        <td>${enroll.course.title}</td>
                        <td class="actions">
                            <button class="btn confirm-btn" data-id="${enroll._id}">Confirm</button>
                        </td>
                    </tr>`;
                    enrollmentsTbody.innerHTML += row;
                });
            }
        } catch (error) { enrollmentsTbody.innerHTML = `<tr><td colspan="4">${error.message}</td></tr>`; }
    };

    // --- MODAL LOGIC ---
    const openContentModal = async (courseId) => {
    currentEditingCourseId = courseId;
    try {
        // Use the new admin-only route
        const res = await fetch(`http://192.168.31.140:5000/api/courses/admin/${courseId}`, { headers: { 'x-auth-token': token } });
        
        if (!res.ok) {
            // This error will now only happen if the course truly doesn't exist
            throw new Error('Course not found');
        }
        const course = await res.json();
        modalCourseTitle.textContent = `Manage Content for: ${course.title}`;
        tempContentList = course.content || [];
        renderContentList();
        contentModal.classList.remove('hidden');
    } catch (error) { 
        alert(`Error: ${error.message}`);
    }
};
    
    const closeContentModal = () => {
        contentModal.classList.add('hidden');
        tempContentList = [];
        currentEditingCourseId = null;
        addContentForm.reset();
    };

    // --- EVENT LISTENERS ---

    // Course Form (Add New)
    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const courseData = {
            title: document.getElementById('course-title').value,
            description: document.getElementById('course-description').value,
            price: document.getElementById('course-price').value
        };
        try {
            const res = await fetch('http://192.168.31.140:5000/api/courses', { method: 'POST', headers: apiHeaders, body: JSON.stringify(courseData) });
            if (!res.ok) throw new Error('Failed to save course.');
            courseForm.reset();
            courseFormContainer.classList.add('hidden');
            fetchCourses();
        } catch (error) { alert(error.message); }
    });
    
    addCourseBtn.addEventListener('click', () => courseFormContainer.classList.remove('hidden'));
    cancelBtn.addEventListener('click', () => courseFormContainer.classList.add('hidden'));

    // Course Table Actions (Delete/Manage Content)
    coursesTbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('manage-content-btn')) {
            openContentModal(e.target.getAttribute('data-id'));
        }
        if (e.target.classList.contains('delete-course-btn')) {
            const courseId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this course?')) {
                try {
                    const res = await fetch(`http://192.168.31.140:5000/api/courses/${courseId}`, { method: 'DELETE', headers: apiHeaders });
                    if (!res.ok) throw new Error('Failed to delete course.');
                    fetchCourses();
                } catch (error) { alert(error.message); }
            }
        }
    });

    // Enrollment Table Actions (Confirm)
    enrollmentsTbody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('confirm-btn')) {
            const enrollId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you have received the payment?')) {
                try {
                    const res = await fetch(`http://192.168.31.140:5000/api/enrollments/confirm/${enrollId}`, { method: 'PUT', headers: apiHeaders });
                    if (!res.ok) throw new Error('Failed to confirm enrollment.');
                    fetchPendingEnrollments();
                } catch (error) { alert(error.message); }
            }
        }
    });

    // Modal Form and Buttons
    addContentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('content-title').value;
        const type = document.getElementById('content-type').value;
        const url = document.getElementById('content-url').value;
        if (!title || !url) { return alert('Please fill in all content fields.'); }
        tempContentList.push({ title, type, url });
        renderContentList();
        addContentForm.reset();
    });
    
    currentContentList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-danger')) {
            const index = e.target.getAttribute('data-index');
            tempContentList.splice(index, 1);
            renderContentList();
        }
    });

    saveContentBtn.addEventListener('click', async () => {
        try {
            const res = await fetch(`http://192.168.31.140:5000/api/courses/${currentEditingCourseId}`, {
                method: 'PUT',
                headers: apiHeaders,
                body: JSON.stringify({ content: tempContentList })
            });
            if (!res.ok) throw new Error('Failed to save content.');
            alert('Content updated successfully!');
            closeContentModal();
        } catch (error) { alert(error.message); }
    });

    closeModalBtn.addEventListener('click', closeContentModal);
    
    // Logout Button
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
    
    // --- Initial Data Load ---
    fetchStudents();
    fetchCourses();
    fetchPendingEnrollments();
});