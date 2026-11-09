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

// 1. פתיחה וסגירה של התפריט
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sideMenu');
    if (sidebar) {
        if (sidebar.style.transform === 'translateX(0%)') {
            sidebar.style.transform = 'translateX(100%)'; // סגור
        } else {
            sidebar.style.transform = 'translateX(0%)'; // פתוח
        }
    }
};

// 2. מעבר בין דפים (מהתפריט העליון והתחתון)
window.switchTab = function(tabName) {
    // סוגר את התפריט אם הוא פתוח
    const sidebar = document.getElementById('sideMenu');
    if (sidebar) sidebar.style.transform = 'translateX(100%)';

    // מציג הודעה שהכפתור עבד (בינתיים, עד שנחבר את הדפים באמת)
    alert("עובר לדף: " + tabName);
    
    // כאן בעתיד נחליף את התוכן של הדף עצמו
};

// 3. פתיחת האזור האישי
window.openProfileModal = function() {
    alert("כאן יפתח האזור האישי שלך.");
};

// 4. הפעלת מצב שבת
window.toggleShabbatMode = function() {
    alert("שבת שלום! מצב שבת הופעל.");
};
window.toggleSidebar = function() {
    const sidebar = document.getElementById('sideMenu');
    if (sidebar) {
        // אם התפריט מוסתר (יש לו class hidden) - נסיר אותו כדי שיופיע
        sidebar.classList.toggle('hidden');
        // אם התפריט פתוח, נזיז אותו פנימה
        if (sidebar.style.transform === 'translateX(0%)') {
            sidebar.style.transform = 'translateX(100%)';
        } else {
            sidebar.style.transform = 'translateX(0%)';
        }
    }
};
