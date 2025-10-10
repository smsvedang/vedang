document.addEventListener('DOMContentLoaded', async () => {
    const courseTitleHeading = document.getElementById('course-title-heading');
    const courseContentDisplay = document.getElementById('course-content-display');
    const token = localStorage.getItem('token');

    // Get course ID from the URL (e.g., ?id=12345)
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');

    if (!courseId) {
        courseContentDisplay.innerHTML = '<p style="color:red;">No course ID provided.</p>';
        return;
    }
    
    if (!token) {
        window.location.href = 'portal.html';
        return;
    }

    try {
        const response = await fetch(`http://192.168.31.140:5000/api/courses/${courseId}`, {
            headers: { 'x-auth-token': token }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.msg || 'Failed to load course content.');
        }

        // Display course title
        courseTitleHeading.textContent = data.title;
        courseContentDisplay.innerHTML = '';

        // Display course content
        if (data.content && data.content.length > 0) {
            data.content.forEach(item => {
                const contentItem = document.createElement('div');
                contentItem.className = 'course-content-item';
                let itemHTML = `<h3>${item.title}</h3>`;
                if (item.type === 'video') {
                    // Embed YouTube video if link is in correct format
                    const videoId = item.url.split('v=')[1];
                    itemHTML += `<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
                } else if (item.type === 'pdf' || item.type === 'link') {
                    itemHTML += `<a href="${item.url}" target="_blank" class="btn">View Resource</a>`;
                }
                contentItem.innerHTML = itemHTML;
                courseContentDisplay.appendChild(contentItem);
            });
        } else {
            courseContentDisplay.innerHTML = '<p>No content has been added to this course yet.</p>';
        }

    } catch (error) {
        courseTitleHeading.textContent = 'Access Denied';
        courseContentDisplay.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
});