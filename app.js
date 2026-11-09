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
// --- מערכת ניווט חכמה ---

// --- קוד תיקון סופי - ללא שגיאות ---

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sideMenu');
    if (sidebar) {
        sidebar.classList.toggle('hidden');
        if (sidebar.style.transform === 'translateX(0%)') {
            sidebar.style.transform = 'translateX(100%)';
        } else {
            sidebar.style.transform = 'translateX(0%)';
        }
    }
};

window.switchTab = function(tabName) {
    const sidebar = document.getElementById('sideMenu');
    if (sidebar) sidebar.style.transform = 'translateX(100%)';
    
    // מסתיר את כל הדפים ומראה את הדף המבוקש
    const pages = document.querySelectorAll('.tab-content');
    pages.forEach(page => page.classList.add('hidden'));
    
    const targetPage = document.getElementById('tab-' + tabName);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    } else {
        alert("הדף " + tabName + " עדיין בבנייה!");
    }
};

window.openProfileModal = function() {
    alert("כאן יפתח האזור האישי שלך.");
};
