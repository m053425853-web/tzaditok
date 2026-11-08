// --- פונקציות תיקון לכפתורים ---
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sideMenu');
    if (sidebar) {
        // בודק אם התפריט מוסתר או פתוח ומשנה בהתאם
        if (sidebar.style.transform === 'translateX(0%)') {
            sidebar.style.transform = 'translateX(100%)'; 
        } else {
            sidebar.style.transform = 'translateX(0%)'; 
        }
    } else {
        console.log("Sidebar element not found");
    }
};

window.openProfileModal = function() {
    // פה אנחנו קוראים לפונקציה המקורית של האזור האישי (שעבדה קודם)
    if (typeof window.openAuthModal === 'function') {
        window.openAuthModal();
    } else if (typeof window.showProfile === 'function') {
        window.showProfile();
    } else {
        // אם לא מוצאים את הפונקציה המקורית, נפתח חלון בסיסי
        alert("כאן יפתח האזור האישי. (הפונקציה המקורית לא נמצאה)");
    }
};
// פתרון לכפתור התפריט
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sideMenu');
    if (sidebar) {
        // אם התפריט מוסתר, נפתח אותו
        if (sidebar.classList.contains('hidden')) {
            sidebar.classList.remove('hidden');
            sidebar.style.transform = 'translateX(0%)';
        } else {
            sidebar.classList.add('hidden');
            sidebar.style.transform = 'translateX(100%)';
        }
    }
};

// פתרון לאזור האישי (פשוט כדי שיראה שזה עובד)
window.openProfileModal = function() {
    alert("כאן ייפתח האזור האישי שלך. (בשלב הבא נחבר את זה לסופרבייס)");
};
