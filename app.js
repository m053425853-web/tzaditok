// ==========================================
// צדיק-טוק - קובץ לוגיקה ראשי (app.js)
// ==========================================

// 1. אתחול החיבור לסופרבייס (Supabase)
// החיבור עצמו מוגדר בקובץ supabase-client.js, אנחנו מוודאים שהוא קיים.
const sb = window.supabaseClient;

// 2. פונקציות ניווט (תפריטים ומעבר בין דפים)
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
    // סגור תפריט צד אם פתוח
    const sidebar = document.getElementById('sideMenu');
    if (sidebar) sidebar.style.transform = 'translateX(100%)';

    // הסתר את כל התוכן של הדפים
    const pages = document.querySelectorAll('.tab-content');
    pages.forEach(page => page.classList.add('hidden'));

    // הראה את הדף המבוקש
    const targetPage = document.getElementById('tab-' + tabName);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        window.scrollTo(0, 0); // גלול למעלה
    } else {
        alert("הדף " + tabName + " עדיין בבנייה!");
    }
};

// 3. טעינת נתונים מסופרבייס - דף 'ללמוד' (שיעורים)
async function loadLessons() {
    const container = document.getElementById('lessons-container');
    if (!container) return;

    container.innerHTML = '<p style="text-align:center;">טוען שיעורים...</p>';

    const { data, error } = await sb.from('lessons').select('*').order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = `<p style="color:red; text-align:center;">שגיאה: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:gray;">אין שיעורים להצגה.</p>';
        return;
    }

    let html = '';
    data.forEach(lesson => {
        html += `
            <div style="background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-right: 4px solid #e6b95c;">
                <h3 style="margin: 0 0 10px 0; color: #1a2238;">${lesson.title}</h3>
                <p style="margin: 0 0 5px 0; color: #555; font-size: 14px;">👤 ${lesson.rabbi_name}</p>
                <p style="margin: 0; color: #888; font-size: 13px;">${lesson.description || ''}</p>
                ${lesson.video_url ? `<a href="${lesson.video_url}" target="_blank" style="display:inline-block; margin-top:10px; background:#1a2238; color:white; padding:8px 15px; border-radius:20px; text-decoration:none; font-size:13px;">▶ צפה בשיעור</a>` : ''}
            </div>
        `;
    });
    container.innerHTML = html;
}

// 4. טעינת נתונים מסופרבייס - דף 'למצוא'
// פונקציות שמסתירות את התפריט של 'למצוא' ומציגות רק את הנתונים המבוקשים
window.showFindCategory = async function(category, containerId) {
    // הסתר את כל הכפתורים של 'למצוא'
    document.getElementById('find-main-menu').classList.add('hidden');
    
    // הצג את המיכל של הקטגוריה הנבחרת
    const targetContainer = document.getElementById(containerId);
    if (targetContainer) {
        targetContainer.classList.remove('hidden');
        targetContainer.innerHTML = '<p style="text-align:center;">טוען נתונים...</p>';
    }

    // שלוף את הנתונים הרלוונטיים
    let table = '';
    if (category === 'gemachim') table = 'gemachim';
    if (category === 'mikvaot') table = 'mikvaot';
    if (category === 'tzaddikim') table = 'tzaddikim';
    
    if (!table) return;

    const { data, error } = await sb.from(table).select('*');

    if (error) {
        targetContainer.innerHTML = `<p style="color:red;">שגיאה בטעינה: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        targetContainer.innerHTML = '<p style="text-align:center; color:gray;">לא נמצאו תוצאות.</p>';
        return;
    }

    // עיצוב הכרטיסיות
    let html = '<button onclick="window.closeFindCategory()" style="margin-bottom:15px; background:#e6b95c; border:none; padding:8px 15px; border-radius:20px; cursor:pointer;">🔙 חזור לתפריט</button>';
    data.forEach(item => {
        html += `
            <div style="background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 5px 0; color: #1a2238;">${item.name}</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">${item.city || item.address || ''}</p>
                ${item.phone ? `<p style="margin: 5px 0 0 0; color: #1a2238; font-weight: bold;">📞 ${item.phone}</p>` : ''}
            </div>
        `;
    });
    targetContainer.innerHTML = html;
};

window.closeFindCategory = function() {
    // הסתר את כל המיכלים של הנתונים
    document.querySelectorAll('.find-data-container').forEach(el => el.classList.add('hidden'));
    // הצג בחזרה את התפריט הראשי
    document.getElementById('find-main-menu').classList.remove('hidden');
};

// 5. פונקציות אזור אישי ומצב שבת (בסיסי בינתיים)
window.openProfileModal = function() {
    alert("כאן יפתח האזור האישי שלך.");
};

window.toggleShabbatMode = function() {
    alert("שבת שלום! מצב שבת הופעל.");
};

// 6. הפעלת פונקציות בטעינת הדף
document.addEventListener('DOMContentLoaded', () => {
    // טען שיעורים מיד עם עליית האתר
    loadLessons();
});
