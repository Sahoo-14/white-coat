/* ============================================
   Bhanja College of Nursing — Admin Panel JS
   ============================================ */

(function () {
    'use strict';

    // ============ CONSTANTS ============
    const CREDENTIALS = { username: 'admin', password: 'bhanja2026' };
    const MAX_ATTEMPTS = 3;
    const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

    const STORAGE_KEYS = {
        notices: 'bcn_notices',
        gallery: 'bcn_gallery',
        leads: 'bcn_leads',
        loginAttempts: 'bcn_login_attempts',
        session: 'bcn_admin_session'
    };

    // ============ AUTH FUNCTIONS ============
    function checkAuth() {
        if (!sessionStorage.getItem(STORAGE_KEYS.session)) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    function login(username, password) {
        const lockRemaining = checkLockout();
        if (lockRemaining > 0) return { success: false, locked: true, remaining: lockRemaining };

        if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
            sessionStorage.setItem(STORAGE_KEYS.session, 'authenticated_' + Date.now());
            resetLoginAttempts();
            return { success: true };
        }

        const attempts = getLoginAttempts();
        attempts.count += 1;
        if (attempts.count >= MAX_ATTEMPTS) {
            attempts.lockoutUntil = Date.now() + LOCKOUT_MS;
        }
        localStorage.setItem(STORAGE_KEYS.loginAttempts, JSON.stringify(attempts));

        if (attempts.count >= MAX_ATTEMPTS) {
            return { success: false, locked: true, remaining: LOCKOUT_MS };
        }
        return { success: false, locked: false, attemptsLeft: MAX_ATTEMPTS - attempts.count };
    }

    function logout() {
        sessionStorage.removeItem(STORAGE_KEYS.session);
        window.location.href = 'index.html';
    }

    function getLoginAttempts() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.loginAttempts)) || { count: 0, lockoutUntil: null };
        } catch { return { count: 0, lockoutUntil: null }; }
    }

    function resetLoginAttempts() {
        localStorage.removeItem(STORAGE_KEYS.loginAttempts);
    }

    function checkLockout() {
        const attempts = getLoginAttempts();
        if (attempts.lockoutUntil && Date.now() < attempts.lockoutUntil) {
            return attempts.lockoutUntil - Date.now();
        }
        if (attempts.lockoutUntil && Date.now() >= attempts.lockoutUntil) {
            resetLoginAttempts();
        }
        return 0;
    }

    // ============ DATA FUNCTIONS — NOTICES ============
    function getNotices() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.notices)) || []; }
        catch { return []; }
    }

    function saveNotices(notices) {
        localStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(notices));
    }

    function addNotice(notice) {
        const notices = getNotices();
        notice.id = generateId();
        notice.date = notice.date || new Date().toISOString().split('T')[0];
        notices.unshift(notice);
        saveNotices(notices);
        return notice;
    }

    function updateNotice(id, updates) {
        const notices = getNotices();
        const idx = notices.findIndex(n => n.id === id);
        if (idx !== -1) {
            notices[idx] = { ...notices[idx], ...updates };
            saveNotices(notices);
            return notices[idx];
        }
        return null;
    }

    function deleteNotice(id) {
        const notices = getNotices().filter(n => n.id !== id);
        saveNotices(notices);
    }

    // ============ DATA FUNCTIONS — GALLERY ============
    function getGallery() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.gallery)) || []; }
        catch { return []; }
    }

    function saveGallery(gallery) {
        localStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(gallery));
    }

    function addGalleryItem(item) {
        const gallery = getGallery();
        item.id = generateId();
        gallery.unshift(item);
        saveGallery(gallery);
        return item;
    }

    function deleteGalleryItem(id) {
        const gallery = getGallery().filter(g => g.id !== id);
        saveGallery(gallery);
    }

    // ============ DATA FUNCTIONS — LEADS ============
    function getLeads() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.leads)) || []; }
        catch { return []; }
    }

    function saveLeads(leads) {
        localStorage.setItem(STORAGE_KEYS.leads, JSON.stringify(leads));
    }

    function deleteLead(id) {
        const leads = getLeads().filter(l => l.id !== id);
        saveLeads(leads);
    }

    // ============ UTILITY FUNCTIONS ============
    function generateId() {
        return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch { return dateStr; }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function truncateText(text, len) {
        if (!text) return '';
        return text.length > len ? text.substring(0, len) + '…' : text;
    }

    // ============ ALERT TOAST ============
    let alertTimeout;
    function showAlert(message, type = 'success') {
        let toast = document.getElementById('alertToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'alertToast';
            toast.className = 'alert-toast';
            document.body.appendChild(toast);
        }
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        toast.className = 'alert-toast ' + type;
        toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span>`;
        clearTimeout(alertTimeout);
        requestAnimationFrame(() => { toast.classList.add('show'); });
        alertTimeout = setTimeout(() => { toast.classList.remove('show'); }, 3200);
    }

    // ============ CONFIRM MODAL ============
    function showConfirmModal(message, onConfirm) {
        const overlay = document.getElementById('confirmModal');
        if (!overlay) return onConfirm();
        const msgEl = overlay.querySelector('.confirm-msg');
        if (msgEl) msgEl.textContent = message;
        overlay.classList.add('show');

        const confirmBtn = overlay.querySelector('.btn-confirm-yes');
        const cancelBtn = overlay.querySelector('.btn-confirm-no');
        const closeBtn = overlay.querySelector('.modal-close');

        function close() {
            overlay.classList.remove('show');
            confirmBtn.replaceWith(confirmBtn.cloneNode(true));
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        }

        confirmBtn.onclick = () => { close(); onConfirm(); };
        cancelBtn.onclick = close;
        if (closeBtn) closeBtn.onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
    }

    // ============ SIDEBAR ============
    function initSidebar() {
        const toggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');

        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                if (overlay) overlay.classList.toggle('show');
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            });
        }

        // Highlight active link
        const page = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === page) link.classList.add('active');
            else link.classList.remove('active');
        });

        // Logout buttons
        document.querySelectorAll('.btn-logout').forEach(btn => {
            btn.addEventListener('click', (e) => { e.preventDefault(); logout(); });
        });
    }

    // ============ LOGIN PAGE ============
    function initLoginPage() {
        const form = document.getElementById('loginForm');
        const errorEl = document.getElementById('loginError');
        const lockoutEl = document.getElementById('lockoutTimer');
        const loginBtn = document.getElementById('loginBtn');
        let lockInterval;

        function updateLockoutUI() {
            const remaining = checkLockout();
            if (remaining > 0) {
                const mins = Math.floor(remaining / 60000);
                const secs = Math.floor((remaining % 60000) / 1000);
                lockoutEl.innerHTML = `<i class="fas fa-lock"></i> Account locked. Try again in <strong>${mins}m ${secs}s</strong>`;
                lockoutEl.classList.add('show');
                loginBtn.disabled = true;
                if (!lockInterval) {
                    lockInterval = setInterval(() => {
                        const r = checkLockout();
                        if (r <= 0) {
                            clearInterval(lockInterval);
                            lockInterval = null;
                            lockoutEl.classList.remove('show');
                            loginBtn.disabled = false;
                        } else {
                            const m = Math.floor(r / 60000);
                            const s = Math.floor((r % 60000) / 1000);
                            lockoutEl.innerHTML = `<i class="fas fa-lock"></i> Account locked. Try again in <strong>${m}m ${s}s</strong>`;
                        }
                    }, 1000);
                }
            } else {
                lockoutEl.classList.remove('show');
                loginBtn.disabled = false;
            }
        }

        updateLockoutUI();

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = document.getElementById('username').value.trim();
                const pass = document.getElementById('password').value;

                if (!user || !pass) {
                    errorEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter both fields.';
                    errorEl.classList.add('show');
                    return;
                }

                const result = login(user, pass);
                if (result.success) {
                    window.location.href = 'dashboard.html';
                } else if (result.locked) {
                    errorEl.classList.remove('show');
                    updateLockoutUI();
                } else {
                    errorEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> Invalid credentials. ${result.attemptsLeft} attempt(s) remaining.`;
                    errorEl.classList.add('show');
                }
            });
        }

        // If already logged in redirect
        if (sessionStorage.getItem(STORAGE_KEYS.session)) {
            window.location.href = 'dashboard.html';
        }
    }

    // ============ DASHBOARD ============
    function initDashboard() {
        if (!checkAuth()) return;
        loadDashboardStats();
        loadRecentActivity();
        initSidebar();

        // Quick actions
        const addNoticeBtn = document.getElementById('quickAddNotice');
        const addImageBtn = document.getElementById('quickAddImage');
        const exportBtn = document.getElementById('quickExportLeads');

        if (addNoticeBtn) addNoticeBtn.onclick = () => window.location.href = 'notices.html';
        if (addImageBtn) addImageBtn.onclick = () => window.location.href = 'gallery.html';
        if (exportBtn) exportBtn.onclick = () => {
            exportCSVFromDashboard();
        };
    }

    function loadDashboardStats() {
        const notices = getNotices();
        const gallery = getGallery();
        const leads = getLeads();
        const today = new Date().toISOString().split('T')[0];
        const todayLeads = leads.filter(l => l.date && l.date.startsWith(today));

        setTextContent('statNotices', notices.length);
        setTextContent('statGallery', gallery.length);
        setTextContent('statLeads', leads.length);
        setTextContent('statTodayLeads', todayLeads.length);
    }

    function loadRecentActivity() {
        const notices = getNotices().slice(0, 5);
        const leads = getLeads().slice(0, 5);

        const noticeList = document.getElementById('recentNotices');
        if (noticeList) {
            if (notices.length === 0) {
                noticeList.innerHTML = '<div class="empty-state"><i class="fas fa-clipboard"></i><p>No notices yet</p></div>';
            } else {
                noticeList.innerHTML = '<ul class="activity-list">' + notices.map(n => `
                    <li>
                        <div class="act-icon"><i class="fas fa-bullhorn"></i></div>
                        <div class="act-text">
                            <strong>${escapeHtml(truncateText(n.title, 50))}</strong>
                            <span>${formatDate(n.date)} ${n.showOnTicker ? '<span class="badge badge-info" style="margin-left:.3rem">Ticker</span>' : ''}</span>
                        </div>
                    </li>
                `).join('') + '</ul>';
            }
        }

        const leadList = document.getElementById('recentLeads');
        if (leadList) {
            if (leads.length === 0) {
                leadList.innerHTML = '<div class="empty-state"><i class="fas fa-user-graduate"></i><p>No enquiries yet</p></div>';
            } else {
                leadList.innerHTML = '<ul class="activity-list">' + leads.map(l => `
                    <li>
                        <div class="act-icon" style="background:rgba(22,163,74,.08);color:#16a34a"><i class="fas fa-user"></i></div>
                        <div class="act-text">
                            <strong>${escapeHtml(l.name)}</strong> — ${escapeHtml(l.course || 'N/A')}
                            <span>${escapeHtml(l.mobile || '')} · ${formatDate(l.date)}</span>
                        </div>
                    </li>
                `).join('') + '</ul>';
            }
        }
    }

    function exportCSVFromDashboard() {
        const leads = getLeads();
        if (leads.length === 0) { showAlert('No leads to export', 'warning'); return; }
        downloadCSV(leads, 'bhanja_leads_export.csv');
        showAlert('Leads exported successfully!', 'success');
    }

    // ============ NOTICES PAGE ============
    let editingNoticeId = null;

    function initNotices() {
        if (!checkAuth()) return;
        initSidebar();
        renderNoticeTable();

        const addBtn = document.getElementById('addNoticeBtn');
        if (addBtn) addBtn.onclick = () => openNoticeForm();

        const saveBtn = document.getElementById('saveNoticeBtn');
        if (saveBtn) saveBtn.onclick = saveNoticeForm;

        // Modal close
        const overlay = document.getElementById('noticeModal');
        if (overlay) {
            overlay.querySelector('.modal-close').onclick = () => overlay.classList.remove('show');
            overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('show'); };
        }
    }

    function renderNoticeTable() {
        const tbody = document.getElementById('noticeTableBody');
        if (!tbody) return;
        const notices = getNotices();

        if (notices.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-clipboard"></i><p>No notices found. Add your first notice!</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = notices.map((n, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${escapeHtml(truncateText(n.title, 45))}</strong></td>
                <td>${formatDate(n.date)}</td>
                <td>${n.showOnTicker ? '<span class="badge badge-info">Yes</span>' : '<span class="badge badge-warning">No</span>'}</td>
                <td>${n.isNew ? '<span class="badge badge-success">New</span>' : '<span class="badge badge-primary">Published</span>'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-outline" onclick="Admin.openNoticeForm('${n.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="Admin.confirmDeleteNotice('${n.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function openNoticeForm(id) {
        const overlay = document.getElementById('noticeModal');
        const title = document.getElementById('noticeFormTitle');
        if (!overlay) return;

        document.getElementById('noticeTitle').value = '';
        document.getElementById('noticeBody').value = '';
        document.getElementById('noticePdf').value = '';
        document.getElementById('noticeTicker').checked = false;
        document.getElementById('noticeIsNew').checked = true;

        if (id) {
            const notice = getNotices().find(n => n.id === id);
            if (notice) {
                editingNoticeId = id;
                title.textContent = 'Edit Notice';
                document.getElementById('noticeTitle').value = notice.title || '';
                document.getElementById('noticeBody').value = notice.body || '';
                document.getElementById('noticePdf').value = notice.pdfUrl || '';
                document.getElementById('noticeTicker').checked = !!notice.showOnTicker;
                document.getElementById('noticeIsNew').checked = !!notice.isNew;
            }
        } else {
            editingNoticeId = null;
            title.textContent = 'Add New Notice';
        }

        overlay.classList.add('show');
    }

    function saveNoticeForm() {
        const titleVal = document.getElementById('noticeTitle').value.trim();
        const bodyVal = document.getElementById('noticeBody').value.trim();
        const pdfVal = document.getElementById('noticePdf').value.trim();
        const tickerVal = document.getElementById('noticeTicker').checked;
        const newVal = document.getElementById('noticeIsNew').checked;

        if (!titleVal) { showAlert('Please enter a notice title', 'error'); return; }

        const data = {
            title: titleVal,
            body: bodyVal,
            pdfUrl: pdfVal,
            showOnTicker: tickerVal,
            isNew: newVal
        };

        if (editingNoticeId) {
            updateNotice(editingNoticeId, data);
            showAlert('Notice updated successfully!', 'success');
        } else {
            addNotice(data);
            showAlert('Notice added successfully!', 'success');
        }

        document.getElementById('noticeModal').classList.remove('show');
        renderNoticeTable();
    }

    function confirmDeleteNotice(id) {
        showConfirmModal('Are you sure you want to delete this notice?', () => {
            deleteNotice(id);
            renderNoticeTable();
            showAlert('Notice deleted.', 'info');
        });
    }

    // ============ GALLERY PAGE ============
    function initGallery() {
        if (!checkAuth()) return;
        initSidebar();
        renderGalleryGrid();

        const addBtn = document.getElementById('addGalleryBtn');
        if (addBtn) addBtn.onclick = () => openGalleryForm();

        const saveBtn = document.getElementById('saveGalleryBtn');
        if (saveBtn) saveBtn.onclick = saveGalleryItem;

        const overlay = document.getElementById('galleryModal');
        if (overlay) {
            overlay.querySelector('.modal-close').onclick = () => overlay.classList.remove('show');
            overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('show'); };
        }
    }

    function renderGalleryGrid() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;
        const items = getGallery();

        if (items.length === 0) {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-images"></i><p>No gallery items. Add your first image!</p></div>';
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="gallery-item">
                <div class="item-actions">
                    <button class="btn-del" onclick="Admin.confirmDeleteGalleryItem('${item.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
                <div class="img-wrap">
                    ${item.src ? `<img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.caption)}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><i class="fas fa-image no-img" style="display:none"></i>` : '<i class="fas fa-image no-img"></i>'}
                </div>
                <div class="item-info">
                    <p>${escapeHtml(item.caption || 'Untitled')}</p>
                    <span class="cat-badge">${escapeHtml(item.category || 'uncategorized')}</span>
                </div>
            </div>
        `).join('');
    }

    function openGalleryForm() {
        const overlay = document.getElementById('galleryModal');
        if (!overlay) return;
        document.getElementById('galleryImgUrl').value = '';
        document.getElementById('galleryCaption').value = '';
        document.getElementById('galleryCategory').value = 'campus';
        overlay.classList.add('show');
    }

    function saveGalleryItem() {
        const src = document.getElementById('galleryImgUrl').value.trim();
        const caption = document.getElementById('galleryCaption').value.trim();
        const category = document.getElementById('galleryCategory').value;

        if (!src) { showAlert('Please enter an image URL/path', 'error'); return; }
        if (!caption) { showAlert('Please enter a caption', 'error'); return; }

        addGalleryItem({ src, caption, category });
        document.getElementById('galleryModal').classList.remove('show');
        renderGalleryGrid();
        showAlert('Image added to gallery!', 'success');
    }

    function confirmDeleteGalleryItem(id) {
        showConfirmModal('Delete this gallery image?', () => {
            deleteGalleryItem(id);
            renderGalleryGrid();
            showAlert('Image removed from gallery.', 'info');
        });
    }

    // ============ LEADS PAGE ============
    let leadSortColumn = null;
    let leadSortDir = 'asc';

    function initLeads() {
        if (!checkAuth()) return;
        initSidebar();
        renderLeadsTable();

        const searchInput = document.getElementById('leadSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => applyLeadFilters());
        }

        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        if (dateFrom) dateFrom.addEventListener('change', () => applyLeadFilters());
        if (dateTo) dateTo.addEventListener('change', () => applyLeadFilters());

        const csvBtn = document.getElementById('exportCsvBtn');
        const xlsBtn = document.getElementById('exportXlsBtn');
        if (csvBtn) csvBtn.onclick = () => exportCSV();
        if (xlsBtn) xlsBtn.onclick = () => exportExcel();

        // Lead detail modal close
        const detailOverlay = document.getElementById('leadDetailModal');
        if (detailOverlay) {
            detailOverlay.querySelector('.modal-close').onclick = () => detailOverlay.classList.remove('show');
            detailOverlay.onclick = (e) => { if (e.target === detailOverlay) detailOverlay.classList.remove('show'); };
        }

        // Sort headers
        document.querySelectorAll('.data-table thead th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.col;
                if (leadSortColumn === col) {
                    leadSortDir = leadSortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    leadSortColumn = col;
                    leadSortDir = 'asc';
                }
                // Update header classes
                document.querySelectorAll('.data-table thead th.sortable').forEach(h => {
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                th.classList.add(leadSortDir === 'asc' ? 'sort-asc' : 'sort-desc');
                applyLeadFilters();
            });
        });
    }

    function getFilteredLeads() {
        let leads = getLeads();
        const query = (document.getElementById('leadSearch')?.value || '').trim().toLowerCase();
        const dateFrom = document.getElementById('dateFrom')?.value;
        const dateTo = document.getElementById('dateTo')?.value;

        if (query) {
            leads = leads.filter(l =>
                (l.name || '').toLowerCase().includes(query) ||
                (l.mobile || '').toLowerCase().includes(query) ||
                (l.email || '').toLowerCase().includes(query) ||
                (l.course || '').toLowerCase().includes(query) ||
                (l.address || '').toLowerCase().includes(query)
            );
        }

        if (dateFrom) {
            leads = leads.filter(l => l.date && l.date >= dateFrom);
        }
        if (dateTo) {
            leads = leads.filter(l => l.date && l.date <= dateTo + 'T23:59:59');
        }

        if (leadSortColumn) {
            leads.sort((a, b) => {
                let va = a[leadSortColumn] || '';
                let vb = b[leadSortColumn] || '';
                // Numeric columns
                if (['physics', 'chemistry', 'biology'].includes(leadSortColumn)) {
                    va = parseFloat(va) || 0;
                    vb = parseFloat(vb) || 0;
                    return leadSortDir === 'asc' ? va - vb : vb - va;
                }
                va = va.toString().toLowerCase();
                vb = vb.toString().toLowerCase();
                if (va < vb) return leadSortDir === 'asc' ? -1 : 1;
                if (va > vb) return leadSortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return leads;
    }

    function applyLeadFilters() {
        renderLeadsTable(getFilteredLeads());
    }

    function renderLeadsTable(leads) {
        const tbody = document.getElementById('leadsTableBody');
        if (!tbody) return;
        if (!leads) leads = getFilteredLeads();

        const countEl = document.getElementById('leadCount');
        if (countEl) countEl.textContent = leads.length;

        if (leads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11"><div class="empty-state"><i class="fas fa-user-graduate"></i><p>No enquiries found.</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = leads.map((l, i) => `
            <tr>
                <td>${i + 1}</td>
                <td class="fw-600">${escapeHtml(l.name || '—')}</td>
                <td>${escapeHtml(l.mobile || '—')}</td>
                <td>${escapeHtml(l.email || '—')}</td>
                <td>${escapeHtml(l.course || '—')}</td>
                <td>${l.physics != null ? l.physics + '%' : '—'}</td>
                <td>${l.chemistry != null ? l.chemistry + '%' : '—'}</td>
                <td>${l.biology != null ? l.biology + '%' : '—'}</td>
                <td class="truncate">${escapeHtml(l.address || '—')}</td>
                <td>${formatDate(l.date)}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-outline" onclick="Admin.viewLeadDetail('${l.id}')" title="View"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="Admin.confirmDeleteLead('${l.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function viewLeadDetail(id) {
        const lead = getLeads().find(l => l.id === id);
        if (!lead) return;
        const overlay = document.getElementById('leadDetailModal');
        if (!overlay) return;
        const body = overlay.querySelector('.lead-detail');
        if (body) {
            body.innerHTML = `
                <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${escapeHtml(lead.name || '—')}</span></div>
                <div class="detail-row"><span class="detail-label">Mobile</span><span class="detail-value">${escapeHtml(lead.mobile || '—')}</span></div>
                <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(lead.email || '—')}</span></div>
                <div class="detail-row"><span class="detail-label">Course</span><span class="detail-value">${escapeHtml(lead.course || '—')}</span></div>
                <div class="detail-row"><span class="detail-label">Physics %</span><span class="detail-value">${lead.physics != null ? lead.physics + '%' : '—'}</span></div>
                <div class="detail-row"><span class="detail-label">Chemistry %</span><span class="detail-value">${lead.chemistry != null ? lead.chemistry + '%' : '—'}</span></div>
                <div class="detail-row"><span class="detail-label">Biology %</span><span class="detail-value">${lead.biology != null ? lead.biology + '%' : '—'}</span></div>
                <div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${escapeHtml(lead.address || '—')}</span></div>
                <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(lead.date)}</span></div>
            `;
        }
        overlay.classList.add('show');
    }

    function confirmDeleteLead(id) {
        showConfirmModal('Delete this enquiry permanently?', () => {
            deleteLead(id);
            applyLeadFilters();
            showAlert('Enquiry deleted.', 'info');
        });
    }

    // ============ EXPORT FUNCTIONS ============
    function downloadCSV(leads, filename) {
        const headers = ['S.No', 'Name', 'Mobile', 'Email', 'Course', 'Physics%', 'Chemistry%', 'Biology%', 'Address', 'Date'];
        const rows = leads.map((l, i) => [
            i + 1,
            `"${(l.name || '').replace(/"/g, '""')}"`,
            l.mobile || '',
            l.email || '',
            l.course || '',
            l.physics != null ? l.physics : '',
            l.chemistry != null ? l.chemistry : '',
            l.biology != null ? l.biology : '',
            `"${(l.address || '').replace(/"/g, '""')}"`,
            l.date || ''
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, filename);
    }

    function exportCSV() {
        const leads = getFilteredLeads();
        if (leads.length === 0) { showAlert('No leads to export', 'warning'); return; }
        downloadCSV(leads, 'bhanja_leads_' + new Date().toISOString().split('T')[0] + '.csv');
        showAlert('CSV exported!', 'success');
    }

    function exportExcel() {
        const leads = getFilteredLeads();
        if (leads.length === 0) { showAlert('No leads to export', 'warning'); return; }
        downloadCSV(leads, 'bhanja_leads_' + new Date().toISOString().split('T')[0] + '.xls');
        showAlert('Excel file exported!', 'success');
    }

    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ============ HELPER ============
    function setTextContent(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // ============ PAGE INITIALIZATION ============
    function init() {
        const page = document.body.dataset.page;
        switch (page) {
            case 'login': initLoginPage(); break;
            case 'dashboard': initDashboard(); break;
            case 'notices': initNotices(); break;
            case 'gallery': initGallery(); break;
            case 'leads': initLeads(); break;
        }
    }

    // Expose necessary functions globally
    window.Admin = {
        openNoticeForm,
        confirmDeleteNotice,
        confirmDeleteGalleryItem,
        viewLeadDetail,
        confirmDeleteLead,
        logout
    };

    // Run
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
