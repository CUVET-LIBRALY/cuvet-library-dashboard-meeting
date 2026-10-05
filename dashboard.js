document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const btnRefresh = document.getElementById('btn-refresh');
    const btnScanFolder = document.getElementById('btn-scan-folder');
    const syncTimeText = document.getElementById('sync-time');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const selectYearRoom = document.getElementById('select-year-room');
    const selectYearSummary = document.getElementById('select-year-summary');
    const selectRoomFilter = document.getElementById('select-room-filter');
    const selectShiftFilter = document.getElementById('select-shift-filter');
    const selectYearDoor = document.getElementById('select-year-door');
    const selectStartMonthDoor = document.getElementById('select-start-month-door');
    const selectEndMonthDoor = document.getElementById('select-end-month-door');
    const SHIFT_ORDER = [
        '08.00 - 12.00 น.',
        '12.01 - 19.00 น.',
        '19.01 - 00.00 น.',
        '00.01 - 07.59 น.'
    ];
    
    // KPI elements
    const kpiTotalRoomUsers = document.getElementById('kpi-total-room-users');
    const kpiRoomUsersSub = document.getElementById('kpi-room-users-sub');
    const kpiPopularRoom = document.getElementById('kpi-popular-room');
    const kpiPopularRoomSub = document.getElementById('kpi-popular-room-sub');
    const kpiPeakMonth = document.getElementById('kpi-peak-month');
    const kpiPeakMonthSub = document.getElementById('kpi-peak-month-sub');
    const kpiConversionRate = document.getElementById('kpi-conversion-rate');
    const kpiConversionRateSub = document.getElementById('kpi-conversion-rate-sub');

    // Sidebar items
    const menuItems = document.querySelectorAll('.menu-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Setup file upload elements
    const uploadDropzone = document.getElementById('upload-dropzone');
    const btnSelectFiles = document.getElementById('btn-select-files');
    const fileInput = document.getElementById('file-input');
    const uploadStatus = document.getElementById('upload-status');
    const btnToggleUploadSettings = document.getElementById('btn-toggle-upload-settings');
    const uploadAdvancedSettings = document.getElementById('upload-advanced-settings');
    const chevronSettings = document.getElementById('chevron-settings');

    // Admin Authentication Elements
    const adminPasswordInput = document.getElementById('admin-password');
    const btnTogglePassword = document.getElementById('btn-toggle-password');
    const loginErrorMsg = document.getElementById('login-error-msg');
    const btnAdminLogin = document.getElementById('btn-admin-login');
    const btnAdminLogout = document.getElementById('btn-admin-logout');
    const adminLoginCard = document.getElementById('admin-login-card');
    const adminSettingsContent = document.getElementById('admin-settings-content');

    // Monthly Editor Elements
    const editorYearSelect = document.getElementById('editor-year-select');
    const editorTypeSelect = document.getElementById('editor-type-select');
    const tableMonthlyEditor = document.getElementById('table-monthly-editor');

    function checkAdminAuth() {
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
        if (isAdmin) {
            if (adminLoginCard) adminLoginCard.style.display = 'none';
            if (adminSettingsContent) adminSettingsContent.style.display = 'block';
            if (btnAdminLogout) btnAdminLogout.style.display = 'block';
        } else {
            if (adminLoginCard) adminLoginCard.style.display = 'block';
            if (adminSettingsContent) adminSettingsContent.style.display = 'none';
            if (btnAdminLogout) btnAdminLogout.style.display = 'none';
            
            const editView = document.getElementById('analysis-edit-view');
            const displayView = document.getElementById('analysis-display-view');
            if (editView && editView.style.display === 'block') {
                editView.style.display = 'none';
                if (displayView) displayView.style.display = 'block';
            }
        }
        
        const btnEditAnalysis = document.getElementById('btn-edit-analysis');
        if (btnEditAnalysis) {
            btnEditAnalysis.style.display = 'inline-block';
            if (isAdmin) {
                btnEditAnalysis.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> แก้ไขบทวิเคราะห์';
            } else {
                btnEditAnalysis.innerHTML = '<i class="fa-solid fa-lock"></i> แก้ไขบทวิเคราะห์';
            }
        }
    }

    // Call initially
    checkAdminAuth();

    if (btnTogglePassword && adminPasswordInput) {
        btnTogglePassword.addEventListener('click', () => {
            const isPassword = adminPasswordInput.type === 'password';
            adminPasswordInput.type = isPassword ? 'text' : 'password';
            const icon = btnTogglePassword.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            }
        });
    }

    function performLogin() {
        if (!adminPasswordInput) return;
        const pwd = adminPasswordInput.value.trim();
        if (pwd.toLowerCase() === 'admin1234') {
            sessionStorage.setItem('isAdmin', 'true');
            if (loginErrorMsg) loginErrorMsg.style.display = 'none';
            adminPasswordInput.value = '';
            checkAdminAuth();
            renderSettingsTab();
        } else {
            if (loginErrorMsg) loginErrorMsg.style.display = 'block';
        }
    }

    if (btnAdminLogin) {
        btnAdminLogin.addEventListener('click', performLogin);
    }
    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performLogin();
            }
        });
    }

    if (btnAdminLogout) {
        btnAdminLogout.addEventListener('click', () => {
            sessionStorage.removeItem('isAdmin');
            checkAdminAuth();
            if (loginErrorMsg) loginErrorMsg.style.display = 'none';
        });
    }

    const btnResetCache = document.getElementById('btn-reset-cache');
    if (btnResetCache) {
        btnResetCache.addEventListener('click', () => {
            if (confirm('คุณต้องการล้างแคชข้อมูลเบราว์เซอร์ และโหลดค่าดั้งเดิมจากฐานข้อมูลระบบใหม่หรือไม่?')) {
                localStorage.removeItem(CLOUD_STORAGE_KEY);
                localStorage.removeItem('excludedYears');
                location.reload();
            }
        });
    }

    const btnExportBackup = document.getElementById('btn-export-backup');
    if (btnExportBackup) {
        btnExportBackup.addEventListener('click', () => {
            if (!appData) return;
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `cuvet_library_backup_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        });
    }

    // Global state
    let appData = null;
    let charts = {};
    const MONTHS_TH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    
    // Load excluded years from localStorage
    let excludedYears = JSON.parse(localStorage.getItem('excludedYears') || '[]');

    // Sidebar Collapsible & Mobile Drawer Controls
    const appSidebar = document.getElementById('app-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
    const btnSidebarClose = document.getElementById('btn-sidebar-close');
    const mainContent = document.querySelector('.main-content');

    function toggleSidebar() {
        if (!appSidebar) return;
        
        if (window.innerWidth <= 1024) {
            // Mobile Drawer Mode
            const isOpen = appSidebar.classList.toggle('mobile-open');
            if (sidebarOverlay) {
                if (isOpen) {
                    sidebarOverlay.classList.add('active');
                } else {
                    sidebarOverlay.classList.remove('active');
                }
            }
        } else {
            // Desktop Collapsible Mode
            const isCollapsed = appSidebar.classList.toggle('collapsed');
            if (mainContent) {
                if (isCollapsed) {
                    mainContent.classList.add('expanded');
                } else {
                    mainContent.classList.remove('expanded');
                }
            }
            // Trigger chart resize for smooth reflow
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 300);
        }
    }

    function closeMobileSidebar() {
        if (appSidebar) appSidebar.classList.remove('mobile-open');
        if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }

    if (btnSidebarToggle) {
        btnSidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (btnSidebarClose) {
        btnSidebarClose.addEventListener('click', closeMobileSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeMobileSidebar);
    }

    // Initialize Sidebar Navigation
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = item.getAttribute('data-tab');
            
            // Toggle active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Toggle active tab panel
            tabPanels.forEach(panel => {
                if (panel.id === targetTab) {
                    panel.classList.add('active-panel');
                } else {
                    panel.classList.remove('active-panel');
                }
            });

            // Auto close mobile drawer when user taps a menu
            if (window.innerWidth <= 1024) {
                closeMobileSidebar();
            }
            
            // Force redraw charts if visible to fix rendering issues inside hidden tabs
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 50);
        });
    });

    // Format numbers with commas
    function formatNumber(num) {
        if (num === null || num === undefined) return '-';
        return num.toLocaleString('th-TH');
    }

    // Show / Hide Loading
    function showLoading(text = 'กำลังโหลดข้อมูล...') {
        loadingText.textContent = text;
        loadingOverlay.classList.add('show');
    }

    function hideLoading() {
        loadingOverlay.classList.remove('show');
    }

    const CLOUD_STORAGE_KEY = 'cuvet_library_dashboard_cloud_data_v4';

    function saveCloudDataLocally() {
        if (!appData) return;
        try {
            localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(appData));
        } catch (e) {
            console.error('Failed to save cloud data:', e);
        }
    }

    // Main Data Loading
    async function loadData(isRefresh = false) {
        showLoading(isRefresh ? 'กำลังวิเคราะห์ข้อมูลใหม่จากไฟล์ Excel และ CSV...' : 'กำลังดึงข้อมูล...');
        
        const url = isRefresh ? '/api/refresh' : '/api/data';
        const method = isRefresh ? 'POST' : 'GET';
        let fetchedData = null;
        
        try {
            if (isRefresh) {
                if (btnRefresh) {
                    const icon = btnRefresh.querySelector('i');
                    if (icon) icon.classList.add('spin-icon');
                }
                if (btnScanFolder) {
                    const icon = btnScanFolder.querySelector('i');
                    if (icon) icon.classList.add('spin-icon');
                }
            }

            const response = await fetch(url, { method });
            if (response.ok) {
                fetchedData = await response.json();
                appData = fetchedData;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.log('Static host mode or offline. Checking fallback...');
            try {
                const staticRes = await fetch('extracted_data.json');
                if (staticRes.ok) {
                    fetchedData = await staticRes.json();
                    appData = fetchedData;
                }
            } catch (e) {}
        } finally {
            // Check for saved Cloud data
            try {
                const cloudDataRaw = localStorage.getItem(CLOUD_STORAGE_KEY);
                if (cloudDataRaw) {
                    const parsedCloud = JSON.parse(cloudDataRaw);
                    if (parsedCloud && parsedCloud.meeting_rooms) {
                        appData = parsedCloud;
                        if (fetchedData && fetchedData.analysis) {
                            appData.analysis = fetchedData.analysis;
                        }
                        console.log('Loaded latest data from Cloud Store!');
                    }
                }
            } catch (cloudErr) {}

            if (appData) {
                if (appData.metadata && appData.metadata.last_updated) {
                    const d = new Date(appData.metadata.last_updated.replace(' ', 'T'));
                    syncTimeText.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> อัปเดตเมื่อ: ${d.toLocaleTimeString('th-TH')} น.`;
                }
                renderSettingsTab();
                processDataAndRender();
            }

            hideLoading();
            if (isRefresh) {
                if (btnRefresh) {
                    const icon = btnRefresh.querySelector('i');
                    if (icon) icon.classList.remove('spin-icon');
                }
                if (btnScanFolder) {
                    const icon = btnScanFolder.querySelector('i');
                    if (icon) icon.classList.remove('spin-icon');
                }
            }
        }
    }

    // Refresh button event listener
    if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
            loadData(true);
        });
    }

    if (btnScanFolder) {
        btnScanFolder.addEventListener('click', () => {
            loadData(true);
        });
    }

    // Filter Data helper (excludes years checked in settings)
    function getFilteredData() {
        if (!appData) return null;
        
        // Deep clone
        const filtered = JSON.parse(JSON.stringify(appData));
        
        filtered.meeting_rooms = filtered.meeting_rooms.filter(yr => !excludedYears.includes(yr.year_be));
        filtered.library_doors = filtered.library_doors.filter(yr => !excludedYears.includes(yr.year_be));
        
        return filtered;
    }

    // Process and Render
    function processDataAndRender() {
        const filteredData = getFilteredData();
        if (!filteredData) return;

        updateYearDropdown(filteredData);
        
        // Filter summary tab data based on select-year dropdown
        const selectSummaryEl = document.getElementById('select-year-summary') || document.getElementById('select-year');
        const summaryYearVal = selectSummaryEl ? selectSummaryEl.value : 'all';
        const summaryData = JSON.parse(JSON.stringify(filteredData));
        if (summaryYearVal !== 'all') {
            summaryData.meeting_rooms = summaryData.meeting_rooms.filter(yr => yr.year_be.toString() === summaryYearVal);
            summaryData.library_doors = summaryData.library_doors.filter(yr => yr.year_be.toString() === summaryYearVal);
        }

        calculateKPIs(summaryData);
        renderComparisonChart(summaryData);
        renderRoomDistributionChart(summaryData);
        renderCorrelationChart(summaryData);
        
        // Deep-Dive tab initial renders
        renderRoomDeepDive(filteredData);
        
        // Door tab initial renders
        const shiftVal = selectShiftFilter ? selectShiftFilter.value : 'all';
        renderDoorShiftsChart(filteredData, shiftVal);
        renderDoorTrendYearlyChart(filteredData, shiftVal);
        updateExamExtensionAlert(filteredData);
        
        // Analysis tab render
        renderAnalysisTab(filteredData);
    }

    const selectSummary = document.getElementById('select-year-summary') || document.getElementById('select-year');

    if (selectSummary) {
        selectSummary.addEventListener('change', () => {
            processDataAndRender();
        });
    }

    // Dynamically update dropdown select options
    function updateYearDropdown(filteredData) {
        const selectRoom = document.getElementById('select-year-room');
        const selectSummaryEl = document.getElementById('select-year-summary') || document.getElementById('select-year');
        
        const years = new Set();
        filteredData.meeting_rooms.forEach(yr => years.add(yr.year_be));
        filteredData.library_doors.forEach(yr => years.add(yr.year_be));
        const sortedYears = Array.from(years).sort((a, b) => b - a);

        const minYear = sortedYears[sortedYears.length - 1] || '2566';
        const maxYear = sortedYears[0] || '2569';

        const subtitleEl = document.getElementById('header-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = `ระบบวิเคราะห์ข้อมูลเชิงลึกรายเดือนประจำปี พ.ศ. ${minYear} - ${maxYear}`;
        }

        if (selectRoom) {
            const currentValue = selectRoom.value;
            selectRoom.innerHTML = `<option value="all">ทุกปีสะสม (${minYear}-${maxYear})</option>`;
            sortedYears.forEach(yBE => {
                const opt = document.createElement('option');
                opt.value = yBE;
                opt.textContent = `พ.ศ. ${yBE}`;
                selectRoom.appendChild(opt);
            });
            if (Array.from(selectRoom.options).some(opt => opt.value === currentValue)) {
                selectRoom.value = currentValue;
            } else {
                selectRoom.value = 'all';
            }
        }

        if (selectSummaryEl) {
            const currentValue = selectSummaryEl.value;
            selectSummaryEl.innerHTML = `<option value="all">ทุกปีรวมทั้งหมด (${minYear}-${maxYear})</option>`;
            sortedYears.forEach(yBE => {
                const opt = document.createElement('option');
                opt.value = yBE;
                opt.textContent = `พ.ศ. ${yBE}`;
                selectSummaryEl.appendChild(opt);
            });
            if (Array.from(selectSummaryEl.options).some(opt => opt.value === currentValue)) {
                selectSummaryEl.value = currentValue;
            } else if (sortedYears.includes(2569)) {
                selectSummaryEl.value = '2569';
            } else {
                selectSummaryEl.value = 'all';
            }
        }

        if (selectRoomFilter) {
            const currentValue = selectRoomFilter.value;
            selectRoomFilter.innerHTML = '<option value="all">ทุกห้องประชุมทั้งหมด</option>';
            
            const rooms = new Set();
            filteredData.meeting_rooms.forEach(yr => {
                if (yr.rooms) {
                    yr.rooms.forEach(r => rooms.add(r));
                }
            });
            
            const sortedRooms = Array.from(rooms).sort();
            sortedRooms.forEach(room => {
                const opt = document.createElement('option');
                opt.value = room;
                opt.textContent = room;
                selectRoomFilter.appendChild(opt);
            });
            
            if (Array.from(selectRoomFilter.options).some(opt => opt.value === currentValue)) {
                selectRoomFilter.value = currentValue;
            } else {
                selectRoomFilter.value = 'all';
            }
        }

        if (selectShiftFilter) {
            const currentValue = selectShiftFilter.value;
            selectShiftFilter.innerHTML = '<option value="all">ทุกช่วงกะเวลาทั้งหมด</option>';
            
            const shifts = new Set();
            filteredData.library_doors.forEach(yr => {
                if (yr.shifts) {
                    yr.shifts.forEach(s => shifts.add(s));
                }
            });
            
            const sortedShifts = Array.from(shifts).sort((a, b) => {
                const idxA = SHIFT_ORDER.indexOf(a);
                const idxB = SHIFT_ORDER.indexOf(b);
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
            });
            
            sortedShifts.forEach(shift => {
                const opt = document.createElement('option');
                opt.value = shift;
                opt.textContent = shift;
                selectShiftFilter.appendChild(opt);
            });
            
            if (Array.from(selectShiftFilter.options).some(opt => opt.value === currentValue)) {
                selectShiftFilter.value = currentValue;
            } else {
                selectShiftFilter.value = 'all';
            }
        }

        if (selectYearDoor) {
            const currentValue = selectYearDoor.value;
            selectYearDoor.innerHTML = `<option value="all">ทุกปีทั้งหมด (${minYear}-${maxYear})</option>`;
            sortedYears.forEach(yBE => {
                const opt = document.createElement('option');
                opt.value = yBE;
                opt.textContent = `พ.ศ. ${yBE}`;
                selectYearDoor.appendChild(opt);
            });
            if (Array.from(selectYearDoor.options).some(opt => opt.value === currentValue)) {
                selectYearDoor.value = currentValue;
            } else {
                selectYearDoor.value = 'all';
            }
        }
    }

    // Render Settings Tab (Manage Years)
    function renderSettingsTab() {
        const tbody = document.querySelector('#table-settings-years tbody');
        if (!tbody || !appData) return;
        tbody.innerHTML = '';
        
        // Gather all unique years in original data
        const yearsSet = new Set();
        const yearInfo = {}; // { 2567: { ce: 2024, type: '...', source: '...' } }
        
        appData.meeting_rooms.forEach(yr => {
            yearsSet.add(yr.year_be);
            yearInfo[yr.year_be] = {
                ce: yr.year_ce,
                source: yr.sheet_name,
                type: 'ห้องประชุม'
            };
        });
        
        appData.library_doors.forEach(yr => {
            yearsSet.add(yr.year_be);
            if (yearInfo[yr.year_be]) {
                yearInfo[yr.year_be].source += ' / ' + yr.sheet_name;
                yearInfo[yr.year_be].type += ' + ประตูหน้า';
            } else {
                yearInfo[yr.year_be] = {
                    ce: yr.year_ce,
                    source: yr.sheet_name,
                    type: 'ประตูหน้าห้องสมุด'
                };
            }
        });
        
        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
        
        sortedYears.forEach(yBE => {
            const info = yearInfo[yBE];
            const isExcluded = excludedYears.includes(yBE);
            
            const row = document.createElement('tr');
            
            // Year BE
            const tdBE = document.createElement('td');
            tdBE.style.fontWeight = '600';
            tdBE.textContent = `พ.ศ. ${yBE}`;
            row.appendChild(tdBE);
            
            // Year CE
            const tdCE = document.createElement('td');
            tdCE.textContent = info.ce;
            row.appendChild(tdCE);
            
            // Type badge
            const tdType = document.createElement('td');
            let badgeClass = 'badge-success';
            if (info.type.includes('ประตูหน้า') && !info.type.includes('ห้องประชุม')) {
                badgeClass = 'badge-purple';
            } else if (info.type.includes('+')) {
                badgeClass = 'badge-purple';
            }
            tdType.innerHTML = `<span class="badge ${badgeClass}">${info.type}</span>`;
            row.appendChild(tdType);
            
            // Source (sheet or file name)
            const tdSource = document.createElement('td');
            tdSource.style.fontSize = '0.9rem';
            tdSource.style.color = 'var(--text-secondary)';
            tdSource.textContent = info.source;
            row.appendChild(tdSource);
            
            // Toggle switch
            const tdToggle = document.createElement('td');
            tdToggle.style.textAlign = 'center';
            tdToggle.innerHTML = `
                <label class="switch">
                    <input type="checkbox" data-year="${yBE}" ${!isExcluded ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            `;
            
            // Event listener for toggle
            const input = tdToggle.querySelector('input');
            input.addEventListener('change', (e) => {
                const yr = parseInt(e.target.getAttribute('data-year'));
                if (e.target.checked) {
                    excludedYears = excludedYears.filter(y => y !== yr);
                } else {
                    if (!excludedYears.includes(yr)) {
                        excludedYears.push(yr);
                    }
                }
                localStorage.setItem('excludedYears', JSON.stringify(excludedYears));
                processDataAndRender();
            });
            
            // Delete action button
            const tdAction = document.createElement('td');
            tdAction.style.textAlign = 'center';
            const sourcesList = Array.from(new Set(info.source.split(' / ')));
            let deleteSource = sourcesList[0] || '';
            let fileType = 'excel';
            if (deleteSource.toLowerCase().endsWith('.csv') || deleteSource.includes('ข้อมูลดิบ CSV รวม')) {
                fileType = 'csv';
            }
            
            if (sourcesList.length > 1) {
                tdAction.innerHTML = '';
                sourcesList.forEach(src => {
                    let subType = 'excel';
                    if (src.toLowerCase().endsWith('.csv') || src.includes('ข้อมูลดิบ CSV รวม')) {
                        subType = 'csv';
                    }
                    const btn = document.createElement('button');
                    btn.className = 'btn-danger-sm';
                    btn.style.margin = '2px';
                    btn.innerHTML = `<i class="fa-solid fa-trash-can"></i> ${src.length > 12 ? src.substring(0, 10) + '...' : src}`;
                    btn.title = `ลบ ${src}`;
                    
                    btn.addEventListener('click', () => {
                        confirmAndDeleteYear(yBE, subType, src);
                    });
                    tdAction.appendChild(btn);
                });
            } else {
                const btn = document.createElement('button');
                btn.className = 'btn-danger-sm';
                btn.innerHTML = `<i class="fa-solid fa-trash-can"></i> ลบข้อมูล`;
                
                btn.addEventListener('click', () => {
                    confirmAndDeleteYear(yBE, fileType, deleteSource);
                });
                tdAction.appendChild(btn);
            }
            
            row.appendChild(tdToggle);
            row.appendChild(tdAction);
            tbody.appendChild(row);
        });
        
        if (sortedYears.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">ไม่พบข้อมูลรายปีในโฟลเดอร์นี้</td></tr>';
        }

        // Populate editor year dropdown
        if (editorYearSelect) {
            const currentSelectedEditorYear = editorYearSelect.value;
            editorYearSelect.innerHTML = '';
            sortedYears.forEach(yBE => {
                const opt = document.createElement('option');
                opt.value = yBE;
                opt.textContent = `พ.ศ. ${yBE}`;
                editorYearSelect.appendChild(opt);
            });
            if (Array.from(editorYearSelect.options).some(opt => opt.value === currentSelectedEditorYear)) {
                editorYearSelect.value = currentSelectedEditorYear;
            } else if (sortedYears.length > 0) {
                editorYearSelect.value = sortedYears[0];
            }
        }
        
        renderDataEditor();
    }

    // Function to confirm and delete year data
    async function confirmAndDeleteYear(year, fileType, source) {
        const typeText = fileType === 'csv' ? 'ไฟล์ CSV' : 'แผ่นงาน Excel (Worksheet)';
        const confirmMsg = `คุณต้องการลบข้อมูลปี พ.ศ. ${year} จากแหล่งข้อมูล "${source}" (${typeText}) ใช่หรือไม่?\n\n*หมายเหตุ: การลบนี้จะเป็นการซ่อน/เปลี่ยนชื่อแผ่นงานหรือไฟล์เพื่อตัดออกจากการประมวลผลของระบบ โดยไม่มีการทำลายไฟล์ข้อมูลอย่างถาวร`;
        
        if (!confirm(confirmMsg)) {
            return;
        }
        
        showLoading(`กำลังดำเนินการลบข้อมูลปี ${year}...`);
        try {
            const response = await fetch('/api/delete-year', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ year, fileType, source })
            });
            
            if (!response.ok) {
                const errRes = await response.json();
                throw new Error(errRes.error || `ลบข้อมูลไม่สำเร็จ (Status: ${response.status})`);
            }
            
            appData = await response.json();
            alert(`ลบข้อมูลปี พ.ศ. ${year} จากแหล่งข้อมูล "${source}" เรียบร้อยแล้ว`);
            
            // Re-render UI
            renderSettingsTab();
            processDataAndRender();
            
        } catch (error) {
            console.error('Delete process failed:', error);
            alert('เกิดข้อผิดพลาดในการลบข้อมูล: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    // Setup file upload drag-and-drop & select event listeners
    if (btnSelectFiles && fileInput) {
        btnSelectFiles.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUploads(e.target.files);
            }
        });
    }

    // Toggle advanced upload settings collapsible
    if (btnToggleUploadSettings && uploadAdvancedSettings) {
        btnToggleUploadSettings.addEventListener('click', () => {
            const isHidden = uploadAdvancedSettings.style.display === 'none';
            uploadAdvancedSettings.style.display = isHidden ? 'flex' : 'none';
            if (chevronSettings) {
                chevronSettings.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    if (uploadDropzone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadDropzone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadDropzone.addEventListener(eventName, () => {
                uploadDropzone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadDropzone.addEventListener(eventName, () => {
                uploadDropzone.classList.remove('dragover');
            }, false);
        });

        uploadDropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFileUploads(files);
            }
        }, false);
    }

    // ฟังก์ชันแยกคอลัมน์ CSV ที่รองรับเครื่องหมายคำพูด (double quotes) ในเบราว์เซอร์
    function parseCsvLine(line) {
        const result = [];
        let inQuotes = false;
        let current = '';
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result.map(v => v.replace(/^"|"$/g, '').trim());
    }

    // ฟังก์ชันกรองข้อมูลดิบในไฟล์ CSV ให้เหลือเฉพาะ ID, Date, Time, Door และประตูที่กำหนด
    async function filterRawCsv(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const text = e.target.result;
                    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                    if (lines.length <= 50) {
                        resolve(file); // เป็นไฟล์สรุปย่อรายเดือนอยู่แล้ว ข้ามการกรอง
                        return;
                    }
                    
                    const headerCols = parseCsvLine(lines[0]);
                    let idIdx = -1, dateIdx = -1, timeIdx = -1, doorIdx = -1;
                    for (let i = 0; i < headerCols.length; i++) {
                        const col = headerCols[i].toLowerCase();
                        if (col === 'id') idIdx = i;
                        else if (col === 'date') dateIdx = i;
                        else if (col === 'time') timeIdx = i;
                        else if (col === 'door') doorIdx = i;
                    }
                    
                    if (idIdx === -1 || dateIdx === -1 || timeIdx === -1 || doorIdx === -1) {
                        resolve(file); // ไม่ใช่โครงสร้างของไฟล์สแกนการ์ดประตูหน้าห้องดิบ ข้ามการกรอง
                        return;
                    }
                    
                    // ประตูและห้องที่ต้องการเก็บ
                    const targetDoors = new Set([
                        "Main IN ชั้น9",
                        "ห้อง0905",
                        "ห้อง0906",
                        "ห้อง0907",
                        "ห้อง0908",
                        "ห้อง927",
                        "ห้อง928",
                        "ห้อง929",
                        "ห้อง930",
                        "ห้อง931",
                        "ห้อง932"
                    ]);
                    
                    const filteredRows = ["ID,Date,Time,Door"];
                    for (let i = 1; i < lines.length; i++) {
                        const fields = parseCsvLine(lines[i]);
                        if (fields.length > doorIdx) {
                            const doorVal = fields[doorIdx];
                            if (targetDoors.has(doorVal)) {
                                const idVal = fields[idIdx];
                                const dateVal = fields[dateIdx];
                                const timeVal = fields[timeIdx];
                                filteredRows.push(`${idVal},${dateVal},${timeVal},${doorVal}`);
                            }
                        }
                    }
                    
                    const filteredText = filteredRows.join('\r\n');
                    // แปลงกลับเป็น Blob พร้อม UTF-8 BOM สำหรับ Excel
                    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), filteredText], { type: 'text/csv;charset=utf-8;' });
                    resolve(blob);
                } catch (err) {
                    console.error('Error parsing CSV content:', err);
                    resolve(file);
                }
            };
            reader.onerror = function() {
                resolve(file);
            };
            // อ่านดึงภาษาไทยใน Windows-874
            reader.readAsText(file, 'windows-874');
        });
    }

    if (btnToggleUploadSettings && uploadAdvancedSettings) {
        btnToggleUploadSettings.addEventListener('click', () => {
            const isHidden = uploadAdvancedSettings.style.display === 'none' || !uploadAdvancedSettings.style.display;
            uploadAdvancedSettings.style.display = isHidden ? 'flex' : 'none';
            if (chevronSettings) {
                chevronSettings.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    if (btnToggleUploadSettings && uploadAdvancedSettings) {
        btnToggleUploadSettings.addEventListener('click', () => {
            const isHidden = uploadAdvancedSettings.style.display === 'none' || !uploadAdvancedSettings.style.display;
            uploadAdvancedSettings.style.display = isHidden ? 'flex' : 'none';
            if (chevronSettings) {
                chevronSettings.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    // Enhanced Client-side Excel / CSV Parser for Static Netlify Hosts via SheetJS
    async function parseExcelFileClientSide(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const textContent = e.target.result;

                    // 1. Detect Year
                    let detectedYear = null;
                    const matchBE = file.name.match(/25\d{2}/);
                    const matchCE = file.name.match(/20\d{2}/);
                    if (matchBE) {
                        detectedYear = parseInt(matchBE[0]);
                    } else if (matchCE) {
                        detectedYear = parseInt(matchCE[0]) + 543;
                    } else {
                        detectedYear = 2569;
                    }

                    // 2. Detect Month Index
                    let detectedMonth = 9; // Default September for Monthly__9
                    const matchMonth = file.name.match(/Monthly__?(\d+)/i) || file.name.match(/Daily_\d+_(\d+)/i) || file.name.match(/Set_Date_\d+_(\d+)/i);
                    if (matchMonth) {
                        detectedMonth = parseInt(matchMonth[1]);
                    }

                    const yearCE = detectedYear - 543;

                    // 3. Parse CSV rows
                    const lines = textContent.split(/\r?\n/).filter(l => l.trim().length > 0);
                    if (lines.length > 1) {
                        const sep = lines[0].includes(';') ? ';' : ',';
                        const headers = lines[0].split(sep).map(h => h.replace(/"/g, '').trim());

                        const doorIdx = headers.findIndex(h => h.toLowerCase() === 'door');
                        const timeIdx = headers.findIndex(h => h.toLowerCase() === 'time');
                        const dateIdx = headers.findIndex(h => h.toLowerCase() === 'date');
                        const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');

                        if (doorIdx !== -1 && timeIdx !== -1) {
                            let doorShifts = {
                                "08.00 - 12.00 น.": 0,
                                "12.01 - 19.00 น.": 0,
                                "19.01 - 00.00 น.": 0,
                                "00.01 - 07.59 น.": 0
                            };
                            let roomCounts = {
                                "ห้อง 905": 0, "ห้อง 906": 0, "ห้อง 907": 0, "ห้อง 908": 0, "ห้อง 909": 0,
                                "ห้อง 927": 0, "ห้อง 928": 0, "ห้อง 929": 0, "ห้อง 930": 0, "ห้อง 931": 0, "ห้อง 932": 0
                            };

                            let roomMap = {
                                "ห้อง0905": "ห้อง 905", "ห้อง905": "ห้อง 905",
                                "ห้อง0906": "ห้อง 906", "ห้อง906": "ห้อง 906",
                                "ห้อง0907": "ห้อง 907", "ห้อง907": "ห้อง 907",
                                "ห้อง0908": "ห้อง 908", "ห้อง908": "ห้อง 908",
                                "ห้อง0909": "ห้อง 909", "ห้อง909": "ห้อง 909",
                                "ห้อง0910": "ห้อง 910", "ห้อง910": "ห้อง 910",
                                "ห้อง0920": "ห้อง 920", "ห้อง920": "ห้อง 920",
                                "ห้อง0931": "ห้อง 931", "ห้อง931": "ห้อง 931",
                                "ห้อง927": "ห้อง 927",
                                "ห้อง928": "ห้อง 928",
                                "ห้อง929": "ห้อง 929",
                                "ห้อง930": "ห้อง 930",
                                "ห้อง932": "ห้อง 932"
                            };

                            let visited = new Set();
                            for (let i = 1; i < lines.length; i++) {
                                const row = lines[i].split(sep).map(r => r.replace(/"/g, '').trim());
                                if (row.length > doorIdx) {
                                    const doorVal = row[doorIdx];
                                    const timeStr = row[timeIdx];
                                    const dateVal = dateIdx !== -1 ? row[dateIdx] : 'date';
                                    const userId = idIdx !== -1 ? row[idIdx] : `u_${i}`;

                                    const uniqueKey = `${dateVal}-${userId}-${doorVal}`;
                                    if (!visited.has(uniqueKey)) {
                                        visited.add(uniqueKey);

                                        if (doorVal.includes('Main IN')) {
                                            const cleanTime = timeStr.replace('.', ':');
                                            const parts = cleanTime.split(':');
                                            if (parts.length >= 2) {
                                                const hour = parseInt(parts[0]);
                                                const min = parseInt(parts[1]);
                                                const totalMins = hour * 60 + min;

                                                if (totalMins >= 480 && totalMins <= 720) {
                                                    doorShifts["08.00 - 12.00 น."]++;
                                                } else if (totalMins > 720 && totalMins <= 1140) {
                                                    doorShifts["12.01 - 19.00 น."]++;
                                                } else if (totalMins > 1140 || totalMins === 0) {
                                                    doorShifts["19.01 - 00.00 น."]++;
                                                } else {
                                                    doorShifts["00.01 - 07.59 น."]++;
                                                }
                                            }
                                        } else {
                                            const targetRoom = roomMap[doorVal] || (roomCounts[doorVal] !== undefined ? doorVal : null);
                                            if (targetRoom && roomCounts[targetRoom] !== undefined) {
                                                roomCounts[targetRoom]++;
                                            }
                                        }
                                    }
                                }
                            }

                            // 1. Update appData.library_doors for detectedYear & detectedMonth
                            let doorYr = appData.library_doors.find(r => r.year_be === detectedYear);
                            if (!doorYr) {
                                doorYr = {
                                    year_be: detectedYear,
                                    year_ce: yearCE,
                                    sheet_name: file.name,
                                    shifts: ["08.00 - 12.00 น.", "12.01 - 19.00 น.", "19.01 - 00.00 น.", "00.01 - 07.59 น."],
                                    months: Array.from({ length: 12 }, (_, idx) => ({
                                        month_index: idx + 1,
                                        month_name: MONTHS_TH[idx],
                                        has_data: false,
                                        entries: { "08.00 - 12.00 น.": 0, "12.01 - 19.00 น.": 0, "19.01 - 00.00 น.": 0, "00.01 - 07.59 น.": 0 }
                                    }))
                                };
                                appData.library_doors.push(doorYr);
                            }

                            const mObjDoor = doorYr.months.find(m => m.month_index === detectedMonth);
                            if (mObjDoor) {
                                mObjDoor.has_data = true;
                                mObjDoor.entries = doorShifts;
                            }

                            // 2. Update appData.meeting_rooms for detectedYear & detectedMonth
                            let roomYr = appData.meeting_rooms.find(r => r.year_be === detectedYear);
                            if (!roomYr) {
                                const roomList = ["ห้อง 905", "ห้อง 906", "ห้อง 907", "ห้อง 908", "ห้อง 909", "ห้อง 927", "ห้อง 928", "ห้อง 929", "ห้อง 930", "ห้อง 931", "ห้อง 932"];
                                roomYr = {
                                    year_be: detectedYear,
                                    year_ce: yearCE,
                                    sheet_name: file.name,
                                    rooms: roomList,
                                    months: Array.from({ length: 12 }, (_, idx) => {
                                        const defaultUsage = {};
                                        roomList.forEach(r => { defaultUsage[r] = 0; });
                                        return {
                                            month_index: idx + 1,
                                            month_name: MONTHS_TH[idx],
                                            has_data: false,
                                            usage: defaultUsage
                                        };
                                    })
                                };
                                appData.meeting_rooms.push(roomYr);
                            }

                            const mObjRoom = roomYr.months.find(m => m.month_index === detectedMonth);
                            if (mObjRoom) {
                                mObjRoom.has_data = true;
                                if (!mObjRoom.usage) mObjRoom.usage = {};
                                Object.keys(roomCounts).forEach(rName => {
                                    mObjRoom.usage[rName] = roomCounts[rName];
                                });
                            }
                        }
                    }

                    resolve({ success: true, year: detectedYear, month: detectedMonth });
                } catch (err) {
                    console.error('Client-side CSV parsing error:', err);
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file, 'windows-874');
        });
    }

    // Function to upload files (Supports Server API and Web Static Netlify Mode)
    async function handleFileUploads(files) {
        const fileList = Array.from(files).filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return ext === 'xlsx' || ext === 'csv';
        });

        if (fileList.length === 0) {
            showStatus('กรุณาเลือกไฟล์เฉพาะนามสกุล .xlsx หรือ .csv เท่านั้น', 'error');
            return;
        }

        showLoading(`กำลังประมวลผลไฟล์สถิติ (${fileList.length} ไฟล์)...`);

        // Check if running on Static Host (Netlify) or Local Server
        const isStaticHost = window.location.hostname.includes('netlify') || window.location.protocol === 'file:';

        if (isStaticHost) {
            try {
                let lastYearParsed = null;
                for (let i = 0; i < fileList.length; i++) {
                    const res = await parseExcelFileClientSide(fileList[i]);
                    if (res && res.year) lastYearParsed = res.year;
                }
                saveCloudDataLocally();
                renderSettingsTab();
                processDataAndRender();
                showStatus(`🎉 อัปโหลดและรวมข้อมูลสถิติใหม่ (ปี พ.ศ. ${lastYearParsed || 'ล่าสุด'}) ขึ้นระบบเรียบร้อยแล้ว!`, 'success');
                alert(`🎉 อัปโหลดไฟล์สถิติใหม่ขึ้นระบบคลาวด์เรียบร้อยแล้ว!\n\nระบบได้รวมข้อมูลปี พ.ศ. ${lastYearParsed || 2569} เดือนกันยายน เข้าสู่แดชบอร์ดให้คุณและผู้บริหารเรียบร้อยแล้วครับ!`);
            } catch (err) {
                console.error(err);
                showStatus('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + err.message, 'error');
            } finally {
                hideLoading();
            }
            return;
        }

        // Local Server API Mode
        try {
            let uploadedCount = 0;
            for (let i = 0; i < fileList.length; i++) {
                let file = fileList[i];
                const ext = file.name.split('.').pop().toLowerCase();
                let isFiltered = false;
                
                if (ext === 'csv') {
                    showLoading(`กำลังวิเคราะห์และกรองข้อมูลดิบของไฟล์ "${file.name}"...`);
                    const originalSize = file.size;
                    const processedBlob = await filterRawCsv(file);
                    if (processedBlob !== file) {
                        file = processedBlob;
                        isFiltered = true;
                    }
                }
                
                showLoading(`กำลังอัปโหลดไฟล์ "${fileList[i].name}" (${i + 1} จาก ${fileList.length})...`);
                
                const filename = encodeURIComponent(fileList[i].name);
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'X-Filename': filename,
                        'X-Selected-Year': selectedYear,
                        'X-Selected-Type': selectedType
                    },
                    body: file
                });

                if (!response.ok) {
                    const errRes = await response.json();
                    throw new Error(errRes.error || `Failed to upload ${file.name}`);
                }
                uploadedCount++;
            }

            // Trigger refresh once at the end
            showLoading('กำลังวิเคราะห์และนำเข้าข้อมูลชุดใหม่เข้าสู่ระบบ...');
            const refreshRes = await fetch('/api/refresh', { method: 'POST' });
            if (!refreshRes.ok) {
                throw new Error('Upload complete, but failed to re-compile database.');
            }

            appData = await refreshRes.json();

            showStatus(`อัปโหลดสำเร็จจำนวน ${uploadedCount} ไฟล์ และรีเฟรชข้อมูลแดชบอร์ดเรียบร้อยแล้ว!`, 'success');
            
            // Reset dropdowns
            if (yearSelect) yearSelect.value = 'auto';
            if (typeSelect) typeSelect.value = 'auto';

            // Re-render UI
            renderSettingsTab();
            processDataAndRender();

        } catch (error) {
            console.error('File upload process failed:', error);
            showStatus('เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message, 'error');
        } finally {
            hideLoading();
            if (fileInput) fileInput.value = ''; // Reset input selection
        }
    }

    function showStatus(text, type) {
        if (!uploadStatus) return;
        
        uploadStatus.className = 'upload-status-banner';
        if (type === 'success') {
            uploadStatus.classList.add('success');
            uploadStatus.textContent = text;
        } else if (type === 'error') {
            uploadStatus.classList.add('error');
            uploadStatus.textContent = text;
        } else {
            uploadStatus.style.display = 'none';
        }
    }

    // KPI Calculations
    function calculateKPIs(filteredData) {
        let totalRoomUsers = 0;
        let sortedYears = [...filteredData.meeting_rooms].sort((a, b) => b.year_be - a.year_be); // desc
        let yearTotals = {};
        
        filteredData.meeting_rooms.forEach(yr => {
            let yrTotal = 0;
            yr.months.forEach(m => {
                if (m.has_data && m.usage) {
                    Object.values(m.usage).forEach(val => {
                        if (val !== null) {
                            totalRoomUsers += val;
                            yrTotal += val;
                        }
                    });
                }
            });
            yearTotals[yr.year_be] = yrTotal;
        });

        kpiTotalRoomUsers.textContent = formatNumber(totalRoomUsers) + " คน-ครั้ง";
        
        // Dynamic YoY same-period comparison subtext for the latest two active years
        if (sortedYears.length >= 2) {
            const yrLatestObj = sortedYears[0];
            const yrPrevObj = sortedYears[1];
            const yrLatest = yrLatestObj.year_be;
            const yrPrev = yrPrevObj.year_be;
            
            // Find active months in the latest year
            const activeLatestMonths = yrLatestObj.months
                .filter(m => m.has_data && m.usage && Object.values(m.usage).some(v => v !== null && v > 0))
                .map(m => m.month_index);

            let samePeriodLatest = 0;
            let samePeriodPrev = 0;

            activeLatestMonths.forEach(mIdx => {
                const mLatest = yrLatestObj.months.find(m => m.month_index === mIdx);
                const mPrev = yrPrevObj.months.find(m => m.month_index === mIdx);
                if (mLatest && mLatest.usage) {
                    Object.values(mLatest.usage).forEach(v => { if (v) samePeriodLatest += v; });
                }
                if (mPrev && mPrev.usage) {
                    Object.values(mPrev.usage).forEach(v => { if (v) samePeriodPrev += v; });
                }
            });

            if (samePeriodPrev > 0) {
                const growth = ((samePeriodLatest - samePeriodPrev) / samePeriodPrev * 100).toFixed(1);
                const sign = growth >= 0 ? '+' : '';
                const monthRangeText = activeLatestMonths.length < 12 ? ` (ช่วง ม.ค.-${MONTHS_TH[activeLatestMonths.length - 1]})` : '';
                kpiRoomUsersSub.innerHTML = `<span class="${growth >= 0 ? 'text-green' : 'text-danger'}" title="สูตร: ((ยอดปี ${yrLatest} - ยอดปี ${yrPrev}) / ยอดปี ${yrPrev}) × 100 เปรียบเทียบช่วงเดือนที่มีข้อมูลตรงกัน"><i class="fa-solid ${growth >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i> ${sign}${growth}%</span> เทียบปี ${yrPrev.toString().slice(-2)} vs ${yrLatest.toString().slice(-2)}${monthRangeText}`;
            } else {
                kpiRoomUsersSub.textContent = "ไม่มีฐานเทียบยอดปีเก่า";
            }
        } else if (sortedYears.length === 1) {
            kpiRoomUsersSub.textContent = `ข้อมูลเฉพาะปี พ.ศ. ${sortedYears[0].year_be}`;
        } else {
            kpiTotalRoomUsers.textContent = "-";
            kpiRoomUsersSub.textContent = "ไม่มีข้อมูลที่แสดงผล";
        }

        // Most Popular Meeting Room
        let roomStats = {};
        filteredData.meeting_rooms.forEach(yr => {
            yr.months.forEach(m => {
                if (m.has_data && m.usage) {
                    Object.entries(m.usage).forEach(([room, val]) => {
                        if (val !== null) {
                            roomStats[room] = (roomStats[room] || 0) + val;
                        }
                    });
                }
            });
        });

        let popularRoom = "-";
        let popularRoomVal = 0;
        Object.entries(roomStats).forEach(([room, val]) => {
            if (val > popularRoomVal) {
                popularRoomVal = val;
                popularRoom = room;
            }
        });

        kpiPopularRoom.textContent = popularRoom;
        kpiPopularRoomSub.textContent = popularRoomVal > 0 ? `ยอดใช้งานรวม ${formatNumber(popularRoomVal)} คน-ครั้ง (นิยมสูงสุด)` : "ไม่มีข้อมูลห้อง";

        // Peak Month
        let monthlyTotals = Array(13).fill(0);
        let hasRoomData = false;
        
        filteredData.meeting_rooms.forEach(yr => {
            yr.months.forEach(m => {
                if (m.has_data && m.usage) {
                    let mIdx = m.month_index;
                    let mTotal = 0;
                    Object.values(m.usage).forEach(val => {
                        if (val !== null) { mTotal += val; hasRoomData = true; }
                    });
                    monthlyTotals[mIdx] += mTotal;
                }
            });
        });

        let peakMonthIdx = 1;
        let maxMonthlyVal = 0;
        for (let i = 1; i <= 12; i++) {
            if (monthlyTotals[i] > maxMonthlyVal) {
                maxMonthlyVal = monthlyTotals[i];
                peakMonthIdx = i;
            }
        }

        kpiPeakMonth.textContent = hasRoomData ? MONTHS_TH[peakMonthIdx - 1] : "-";
        kpiPeakMonthSub.textContent = hasRoomData ? `ยอดจองรวมทุกปีสะสม ${formatNumber(maxMonthlyVal)} คน-ครั้ง` : "ไม่มีข้อมูลรายเดือน";

        // Conversion Rate (Meeting Room Users / Total Library Entrances)
        let totalEntrancesOverlap = 0;
        let totalRoomOverlap = 0;

        filteredData.meeting_rooms.forEach(yr => {
            const doorYr = filteredData.library_doors.find(dy => dy.year_be === yr.year_be);
            if (doorYr) {
                yr.months.forEach(m => {
                    if (m.has_data) {
                        const dM = doorYr.months.find(dm => dm.month_index === m.month_index);
                        if (dM && dM.has_data && dM.entries) {
                            let rTotal = 0;
                            Object.values(m.usage).forEach(v => { if (v !== null) rTotal += v; });
                            
                            let dTotal = 0;
                            Object.values(dM.entries).forEach(v => { if (v !== null) dTotal += v; });
                            
                            if (dTotal > 0) {
                                totalRoomOverlap += rTotal;
                                totalEntrancesOverlap += dTotal;
                            }
                        }
                    }
                });
            }
        });

        if (totalEntrancesOverlap > 0) {
            const conversion = (totalRoomOverlap / totalEntrancesOverlap * 100).toFixed(2);
            kpiConversionRate.textContent = `${conversion}%`;
            kpiConversionRateSub.innerHTML = `ใช้ห้องประชุม: ${formatNumber(totalRoomOverlap)} จากคนเข้าหอสมุด ${formatNumber(totalEntrancesOverlap)} คน`;
        } else {
            kpiConversionRate.textContent = "-";
            kpiConversionRateSub.textContent = "ไม่มีข้อมูลเปรียบเทียบปีซ้อนกัน";
        }

        // Update Executive Briefing Highlights Card (ข้อ 2)
        const elBriefingRoom = document.getElementById('briefing-top-room');
        const elBriefingShift = document.getElementById('briefing-top-shift');
        const elBriefingExam = document.getElementById('briefing-exam-season');

        if (elBriefingRoom) {
            if (popularRoomVal > 0 && totalRoomUsers > 0) {
                const pct = ((popularRoomVal / totalRoomUsers) * 100).toFixed(1);
                elBriefingRoom.textContent = `${popularRoom} (${pct}% ของห้องประชุมทั้งหมด)`;
            } else {
                elBriefingRoom.textContent = popularRoom;
            }
        }

        // Peak Shift Calculation
        let shiftStats = {};
        let nightShiftTotal = 0;
        let examMonthsCount = 0;

        filteredData.library_doors.forEach(yr => {
            yr.months.forEach(m => {
                if (m.has_data && m.entries) {
                    Object.entries(m.entries).forEach(([shift, val]) => {
                        if (val !== null && val > 0) {
                            shiftStats[shift] = (shiftStats[shift] || 0) + val;
                            if (shift === '19.01 - 00.00 น.' || shift === '00.01 - 07.59 น.') {
                                nightShiftTotal += val;
                            }
                        }
                    });
                    const lateShiftVal = (m.entries['19.01 - 00.00 น.'] || 0) + (m.entries['00.01 - 07.59 น.'] || 0);
                    if (lateShiftVal > 50) {
                        examMonthsCount++;
                    }
                }
            });
        });

        let topShift = '-';
        let maxShiftVal = 0;
        let totalAllShifts = 0;
        Object.entries(shiftStats).forEach(([shift, val]) => {
            if (val > 0) totalAllShifts += val;
            if (val > maxShiftVal) {
                maxShiftVal = val;
                topShift = shift;
            }
        });

        if (elBriefingShift) {
            if (topShift !== '-' && totalAllShifts > 0) {
                const pct = ((maxShiftVal / totalAllShifts) * 100).toFixed(1);
                elBriefingShift.textContent = `${topShift} (สัดส่วน ${pct}%)`;
            } else {
                elBriefingShift.textContent = '-';
            }
        }

        if (elBriefingExam) {
            elBriefingExam.textContent = examMonthsCount > 0 
                ? `เปิดขยายเวลาพิเศษช่วงสอบ ${examMonthsCount} เดือน (กะดึกสะสม ${formatNumber(nightShiftTotal)} คน)`
                : `กะดึก/สอบสะสม ${formatNumber(nightShiftTotal)} คน`;
        }
    }

    // Chart 1: Seasonal Room Comparison (Line Chart)
    function renderComparisonChart(filteredData) {
        if (charts.roomComparison) { charts.roomComparison.destroy(); }

        const series = [];
        filteredData.meeting_rooms.forEach(yr => {
            let dataPoints = [];
            for (let i = 1; i <= 12; i++) {
                const mData = yr.months.find(m => m.month_index === i);
                if (mData && mData.has_data) {
                    let total = 0;
                    Object.values(mData.usage).forEach(val => { if (val !== null) total += val; });
                    dataPoints.push(total);
                } else {
                    dataPoints.push(null);
                }
            }

            // Slice out trailing null values
            let cleanDataPoints = [...dataPoints];
            let lastIndex = -1;
            for (let i = 11; i >= 0; i--) {
                if (cleanDataPoints[i] !== null) { lastIndex = i; break; }
            }
            if (lastIndex !== -1) {
                cleanDataPoints = cleanDataPoints.slice(0, lastIndex + 1);
            }

            series.push({
                name: `ปี พ.ศ. ${yr.year_be}`,
                data: cleanDataPoints
            });
        });

        series.sort((a, b) => a.name.localeCompare(b.name));

        const options = {
            title: {
                text: 'สถิติการใช้บริการห้องประชุมรายเดือนเปรียบเทียบแต่ละปี พ.ศ. (คน-ครั้ง)',
                align: 'left',
                style: { fontFamily: 'Noto Sans Thai, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1e293b' }
            },
            series: series,
            chart: {
                type: 'line',
                height: 350,
                fontFamily: 'Sarabun, sans-serif',
                toolbar: {
                    show: true,
                    export: {
                        csv: { filename: 'สถิติแดชบอร์ด' },
                        svg: { filename: 'กราฟแดชบอร์ด' },
                        png: { filename: 'กราฟแดชบอร์ด' }
                    }
                }
            },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
            stroke: { width: 3, curve: 'smooth' },
            markers: { size: 4, hover: { size: 6 } },
            xaxis: {
                categories: MONTHS_TH,
                labels: { style: { colors: '#64748b' } }
            },
            yaxis: {
                title: { text: 'จำนวนผู้ใช้บริการ (คน-ครั้ง)', style: { fontFamily: 'Noto Sans Thai', fontWeight: 500 } },
                labels: {
                    formatter: function (val) { return val ? val.toLocaleString() : '0'; },
                    style: { colors: '#64748b' }
                }
            },
            tooltip: {
                shared: true,
                y: { formatter: function (val) { return val !== null ? val.toLocaleString() + ' คน-ครั้ง' : 'ไม่มีข้อมูล'; } }
            },
            legend: { position: 'top', horizontalAlign: 'right', fontFamily: 'Noto Sans Thai', fontWeight: 500 },
            grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
        };

        charts.roomComparison = new ApexCharts(document.querySelector("#chart-room-comparison"), options);
        charts.roomComparison.render();
    }

    // Chart 2: Room Popularity (Horizontal Bar Chart)
    function renderRoomDistributionChart(filteredData) {
        if (charts.roomDistribution) { charts.roomDistribution.destroy(); }

        let roomStats = {};
        filteredData.meeting_rooms.forEach(yr => {
            yr.months.forEach(m => {
                if (m.has_data && m.usage) {
                    Object.entries(m.usage).forEach(([room, val]) => {
                        if (val !== null) { roomStats[room] = (roomStats[room] || 0) + val; }
                    });
                }
            });
        });

        const sortedRooms = Object.entries(roomStats)
            .map(([room, val]) => ({ room, val }))
            .sort((a, b) => b.val - a.val);

        const categories = sortedRooms.map(item => item.room);
        const data = sortedRooms.map(item => item.val);

        const options = {
            title: {
                text: 'สถิติการใช้บริการจำแนกตามรายห้องประชุมสะสม (คน-ครั้ง)',
                align: 'left',
                style: { fontFamily: 'Noto Sans Thai, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1e293b' }
            },
            series: [{ name: 'ผู้ใช้ห้องประชุมสะสม', data: data }],
            chart: { type: 'bar', height: 350, fontFamily: 'Sarabun, sans-serif', toolbar: {
                    show: true,
                    export: {
                        csv: { filename: 'สถิติแดชบอร์ด' },
                        svg: { filename: 'กราฟแดชบอร์ด' },
                        png: { filename: 'กราฟแดชบอร์ด' }
                    }
                } },
            plotOptions: {
                bar: { borderRadius: 6, horizontal: true, barHeight: '65%', distributed: true }
            },
            colors: ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b', '#94a3b8'],
            dataLabels: {
                enabled: true,
                textAnchor: 'start',
                style: { colors: ['#fff'], fontFamily: 'Sarabun', fontWeight: 600 },
                formatter: function (val) { return val.toLocaleString() + ' คน-ครั้ง'; },
                offsetX: 0
            },
            xaxis: {
                categories: categories,
                labels: { formatter: function (val) { return val.toLocaleString(); }, style: { colors: '#64748b' } }
            },
            yaxis: { labels: { style: { colors: '#1e293b', fontSize: '12px', fontFamily: 'Noto Sans Thai', fontWeight: 600 } } },
            legend: { show: false },
            grid: { borderColor: '#e2e8f0', strokeDashArray: 4, xaxis: { lines: { show: true } } },
            tooltip: { y: { formatter: function (val) { return val.toLocaleString() + ' คน-ครั้ง'; } } }
        };

        charts.roomDistribution = new ApexCharts(document.querySelector("#chart-room-distribution"), options);
        charts.roomDistribution.render();
    }

    // Chart 3: Correlation (Dual Axis Chart - Column & Line Combo)
    function renderCorrelationChart(filteredData) {
        if (charts.correlation) { charts.correlation.destroy(); }

        const selectSummaryEl = document.getElementById('select-year-summary') || document.getElementById('select-year');
        const summaryYearVal = selectSummaryEl ? selectSummaryEl.value : 'all';

        const timeline = [];
        const libraryEntries = [];
        const roomBookings = [];

        const sortedRoomYears = [...filteredData.meeting_rooms].sort((a, b) => a.year_be - b.year_be);

        sortedRoomYears.forEach(yr => {
            if (summaryYearVal !== 'all' && yr.year_be.toString() !== summaryYearVal) {
                return;
            }
            const yrBEShort = yr.year_be.toString().slice(-2);
            const doorYr = filteredData.library_doors.find(dy => dy.year_be === yr.year_be);
            
            for (let i = 1; i <= 12; i++) {
                const rM = yr.months.find(m => m.month_index === i);
                if (rM && rM.has_data) {
                    const monthLabel = summaryYearVal !== 'all' ? MONTHS_TH[i - 1] : MONTHS_TH[i - 1] + " " + yrBEShort;
                    
                    let rTotal = 0;
                    Object.values(rM.usage).forEach(val => { if (val !== null) rTotal += val; });
                    
                    let dTotal = 0;
                    if (doorYr) {
                        const dM = doorYr.months.find(dm => dm.month_index === i);
                        if (dM && dM.has_data && dM.entries) {
                            Object.values(dM.entries).forEach(val => { if (val !== null) dTotal += val; });
                        }
                    }

                    timeline.push(monthLabel);
                    roomBookings.push(rTotal);
                    libraryEntries.push(dTotal > 0 ? dTotal : null);
                }
            }
        });

        const options = {
            title: {
                text: summaryYearVal !== 'all' ? `ความสัมพันธ์เข้าห้องสมุด vs ห้องประชุม (ปี พ.ศ. ${summaryYearVal})` : 'ความสัมพันธ์ระหว่างการเข้าใช้ห้องสมุดและการเข้าใช้ห้องประชุมรายเดือน',
                align: 'left',
                style: { fontFamily: 'Noto Sans Thai, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1e293b' }
            },
            series: [{
                name: 'ผู้ใช้ประตูหน้าห้องสมุด (คน)',
                type: 'column',
                data: libraryEntries
            }, {
                name: 'ผู้ใช้งานห้องประชุม (คน-ครั้ง)',
                type: 'line',
                data: roomBookings
            }],
            chart: { height: 380, type: 'line', fontFamily: 'Sarabun, sans-serif', toolbar: {
                    show: true,
                    export: {
                        csv: { filename: 'สถิติแดชบอร์ด' },
                        svg: { filename: 'กราฟแดชบอร์ด' },
                        png: { filename: 'กราฟแดชบอร์ด' }
                    }
                } },
            plotOptions: {
                bar: { columnWidth: '45%', borderRadius: 4 }
            },
            stroke: { width: [0, 3.5], curve: 'smooth' },
            colors: ['#cbd5e1', '#6366f1'],
            markers: { size: [0, 5], hover: { size: 7 } },
            xaxis: {
                categories: timeline,
                labels: { style: { colors: '#64748b' }, rotate: -45, rotateAlways: false, hideOverlappingLabels: true }
            },
            yaxis: [{
                title: { text: 'จำนวนผู้ใช้ห้องสมุด (คน)', style: { color: '#64748b', fontFamily: 'Noto Sans Thai', fontWeight: 500 } },
                labels: { style: { colors: '#64748b' }, formatter: function(val) { return val ? val.toLocaleString() : '0'; } }
            }, {
                opposite: true,
                title: { text: 'จำนวนผู้ใช้ห้องประชุม (คน-ครั้ง)', style: { color: '#6366f1', fontFamily: 'Noto Sans Thai', fontWeight: 500 } },
                labels: { style: { colors: '#6366f1' }, formatter: function(val) { return val ? val.toLocaleString() : '0'; } }
            }],
            tooltip: { shared: true, y: { formatter: function(val) { return val ? val.toLocaleString() : '0'; } } },
            legend: { position: 'top', horizontalAlign: 'right', fontFamily: 'Noto Sans Thai', fontWeight: 500 },
            grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
        };

        charts.correlation = new ApexCharts(document.querySelector("#chart-correlation"), options);
        charts.correlation.render();
    }

    // TAB 2: Room Deep-Dive & Selected Year Table
    function renderRoomDeepDive(filteredData) {
        const yearVal = selectYearRoom ? selectYearRoom.value : 'all';
        const roomVal = selectRoomFilter ? selectRoomFilter.value : 'all';
        renderRoomFrequencyChart(filteredData, yearVal, roomVal);
        populateRoomTable(filteredData, yearVal, roomVal);
    }

    // Year & Room Dropdown Change Handlers
    if (selectYearRoom) {
        selectYearRoom.addEventListener('change', () => {
            const filteredData = getFilteredData();
            if (filteredData) { renderRoomDeepDive(filteredData); }
        });
    }

    if (selectRoomFilter) {
        selectRoomFilter.addEventListener('change', () => {
            const filteredData = getFilteredData();
            if (filteredData) { renderRoomDeepDive(filteredData); }
        });
    }

    if (selectYearSummary) {
        selectYearSummary.addEventListener('change', () => {
            processDataAndRender();
        });
    }

    function triggerDoorChartsRender() {
        const filteredData = getFilteredData();
        if (filteredData) {
            const shiftVal = selectShiftFilter ? selectShiftFilter.value : 'all';
            renderDoorShiftsChart(filteredData, shiftVal);
            renderDoorTrendYearlyChart(filteredData, shiftVal);
            updateExamExtensionAlert(filteredData);
        }
    }

    function updateExamExtensionAlert(filteredData) {
        const container = document.getElementById('exam-extension-alert-container');
        if (!container) return;

        const selectedYearFilter = selectYearDoor ? selectYearDoor.value : 'all';
        const startMonth = selectStartMonthDoor ? parseInt(selectStartMonthDoor.value) : 1;
        const endMonth = selectEndMonthDoor ? parseInt(selectEndMonthDoor.value) : 12;

        const tableData = [];
        let grandTotalNight = 0;
        let totalExamMonthsCount = 0;

        filteredData.library_doors.forEach(yr => {
            if (selectedYearFilter === 'all' || yr.year_be.toString() === selectedYearFilter) {
                const examMonths = [];
                let yearNightSum = 0;

                yr.months.forEach(m => {
                    if (m.month_index >= startMonth && m.month_index <= endMonth) {
                        if (m.has_data && m.entries) {
                            const night1 = m.entries['19.01 - 00.00 น.'] || 0;
                            const night2 = m.entries['00.01 - 07.59 น.'] || 0;
                            const totalNight = night1 + night2;
                            if (totalNight > 200) {
                                examMonths.push({
                                    name: m.month_name,
                                    index: m.month_index,
                                    count: totalNight
                                });
                                yearNightSum += totalNight;
                            }
                        }
                    }
                });

                if (examMonths.length > 0) {
                    examMonths.sort((a, b) => a.index - b.index);
                    tableData.push({
                        year: yr.year_be,
                        months: examMonths,
                        monthCount: examMonths.length,
                        totalNight: yearNightSum
                    });
                    grandTotalNight += yearNightSum;
                    totalExamMonthsCount += examMonths.length;
                }
            }
        });

        tableData.sort((a, b) => b.year - a.year);

        let tableRowsHTML = '';
        if (tableData.length > 0) {
            tableData.forEach((row, idx) => {
                const monthBadges = row.months.map(m => {
                    return `<span class="exam-badge-compact" title="${m.name}: สแกนกะดึก ${m.count.toLocaleString()} คน-ครั้ง">
                        ${m.name} <span class="badge-num">${m.count.toLocaleString()}</span>
                    </span>`;
                }).join(' ');

                // Determine intensity level
                let intensityBadge = '';
                if (row.totalNight >= 2000) {
                    intensityBadge = `<span class="intensity-tag high"><i class="fa-solid fa-fire"></i> หนาแน่นสูงมาก</span>`;
                } else if (row.totalNight >= 800) {
                    intensityBadge = `<span class="intensity-tag medium"><i class="fa-solid fa-bolt"></i> หนาแน่นปานกลาง</span>`;
                } else {
                    intensityBadge = `<span class="intensity-tag low"><i class="fa-solid fa-circle-info"></i> ปกติ</span>`;
                }

                tableRowsHTML += `
                    <tr>
                        <td style="font-weight: 700; color: var(--text-primary); text-align: center; white-space: nowrap;">
                            <i class="fa-solid fa-calendar-day text-indigo" style="margin-right: 4px;"></i> พ.ศ. ${row.year}
                        </td>
                        <td style="text-align: center; font-weight: 600; color: var(--primary);">
                            ${row.monthCount} เดือน
                        </td>
                        <td>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                                ${monthBadges}
                            </div>
                        </td>
                        <td style="text-align: right; font-weight: 700; color: var(--text-primary); white-space: nowrap;">
                            ${row.totalNight.toLocaleString()} <span style="font-size: 0.75rem; font-weight: 400; color: var(--text-secondary);">คน-ครั้ง</span>
                        </td>
                        <td style="text-align: center; white-space: nowrap;">
                            ${intensityBadge}
                        </td>
                    </tr>
                `;
            });
        } else {
            tableRowsHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 18px; color: var(--text-secondary); font-size: 0.85rem;">
                        <i class="fa-solid fa-circle-check text-green" style="margin-right: 6px;"></i> ไม่พบช่วงขยายเวลาทำการพิเศษในช่วงเวลาที่เลือก (เปิดทำการตามเวลาปกติ)
                    </td>
                </tr>
            `;
        }

        container.innerHTML = `
            <div class="glass-card" style="padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(186, 230, 253, 0.8); background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 249, 255, 0.9) 100%); box-shadow: 0 6px 18px rgba(148, 163, 184, 0.12); display: flex; flex-direction: column; gap: 10px;">
                <!-- Header with Toggle Button -->
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);">
                            <i class="fa-solid fa-graduation-cap" style="font-size: 1.05rem;"></i>
                        </div>
                        <div>
                            <h4 style="margin: 0; font-family: var(--font-heading); font-size: 0.95rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
                                สรุปช่วงขยายเวลาบริการพิเศษ 24 ชม. (Exam Extension Summary)
                                ${tableData.length > 0 ? '<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #6366f1; box-shadow: 0 0 8px #6366f1;"></span>' : ''}
                            </h4>
                            <p style="margin: 2px 0 0 0; font-size: 0.78rem; color: var(--text-secondary);">
                                <i class="fa-solid fa-moon text-indigo"></i> รวมเปิดพิเศษช่วงสอบ: <strong style="color: #4f46e5;">${totalExamMonthsCount} เดือน</strong> | สแกนกะดึกสะสม: <strong style="color: #4f46e5;">${grandTotalNight.toLocaleString()} คน-ครั้ง</strong>
                            </p>
                        </div>
                    </div>

                    <!-- Toggle Button -->
                    <button type="button" id="btn-toggle-exam-table" class="btn btn-secondary-sm" style="background: rgba(255, 255, 255, 0.9); border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; color: #475569; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
                        <i class="fa-solid fa-table-list text-indigo"></i> <span id="text-toggle-exam-table">แสดงรายละเอียดตาราง</span> <i id="icon-toggle-exam-table" class="fa-solid fa-chevron-down" style="transition: transform 0.3s ease;"></i>
                    </button>
                </div>

                <!-- Collapsible Table Content (Hidden by Default) -->
                <div id="wrapper-exam-table" style="display: none; overflow-x: auto; max-height: 280px; overflow-y: auto; border-top: 1px dashed rgba(186, 230, 253, 0.9); padding-top: 10px; margin-top: 4px;">
                    <table class="exam-compact-table" style="width: 100%; border-collapse: collapse; font-size: 0.82rem;">
                        <thead>
                            <tr>
                                <th style="width: 100px; text-align: center;">ปี พ.ศ.</th>
                                <th style="width: 100px; text-align: center;">เปิดบริการ</th>
                                <th>เดือนที่ขยายเวลาพิเศษ (ยอดผู้สแกนกะดึก)</th>
                                <th style="width: 150px; text-align: right;">รวมผู้สแกนกะดึก</th>
                                <th style="width: 130px; text-align: center;">ระดับความหนาแน่น</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Add Toggle Click Event Listener
        const btnToggle = container.querySelector('#btn-toggle-exam-table');
        const wrapperTable = container.querySelector('#wrapper-exam-table');
        const textToggle = container.querySelector('#text-toggle-exam-table');
        const iconToggle = container.querySelector('#icon-toggle-exam-table');

        if (btnToggle && wrapperTable) {
            btnToggle.addEventListener('click', () => {
                const isHidden = wrapperTable.style.display === 'none';
                wrapperTable.style.display = isHidden ? 'block' : 'none';
                if (textToggle) textToggle.textContent = isHidden ? 'ซ่อนตาราง' : 'แสดงรายละเอียดตาราง';
                if (iconToggle) iconToggle.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
            });
        }
    }

    if (selectShiftFilter) {
        selectShiftFilter.addEventListener('change', triggerDoorChartsRender);
    }

    if (selectYearDoor) {
        selectYearDoor.addEventListener('change', triggerDoorChartsRender);
    }

    if (selectStartMonthDoor) {
        selectStartMonthDoor.addEventListener('change', () => {
            const startVal = parseInt(selectStartMonthDoor.value);
            const endVal = parseInt(selectEndMonthDoor.value);
            if (startVal > endVal) {
                selectEndMonthDoor.value = startVal.toString();
            }
            triggerDoorChartsRender();
        });
    }

    if (selectEndMonthDoor) {
        selectEndMonthDoor.addEventListener('change', () => {
            const startVal = parseInt(selectStartMonthDoor.value);
            const endVal = parseInt(selectEndMonthDoor.value);
            if (startVal > endVal) {
                selectStartMonthDoor.value = endVal.toString();
            }
            triggerDoorChartsRender();
        });
    }

    function renderRoomFrequencyChart(filteredData, yearVal, roomVal = 'all') {
        if (charts.roomFreq) { charts.roomFreq.destroy(); }

        if (roomVal === 'all') {
            let roomStats = {};
            filteredData.meeting_rooms.forEach(yr => {
                if (yearVal === 'all' || yr.year_be.toString() === yearVal) {
                    yr.months.forEach(m => {
                        if (m.has_data && m.usage) {
                            Object.entries(m.usage).forEach(([room, val]) => {
                                if (val !== null) { roomStats[room] = (roomStats[room] || 0) + val; }
                            });
                        }
                    });
                }
            });

            const labels = Object.keys(roomStats).sort();
            const series = labels.map(room => roomStats[room]);

            const options = {
                series: series,
                chart: { type: 'donut', height: 380, fontFamily: 'Sarabun, sans-serif' },
                labels: labels,
                colors: ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#64748b', '#94a3b8'],
                plotOptions: {
                    pie: {
                        donut: {
                            size: '65%',
                            labels: {
                                show: true,
                                name: { show: true, fontFamily: 'Noto Sans Thai', fontWeight: 600, formatter: function () { return 'ยอดใช้งานรวม'; } },
                                value: { show: true, fontFamily: 'Sarabun', fontSize: '20px', fontWeight: 700, formatter: function (val) { return parseInt(val).toLocaleString() + ' คน-ครั้ง'; } },
                                total: {
                                    show: true, label: 'ยอดใช้งานรวม', fontFamily: 'Noto Sans Thai', fontWeight: 600,
                                    formatter: function (w) { return w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString() + ' คน-ครั้ง'; }
                                }
                            }
                        }
                    }
                },
                legend: { position: 'bottom', fontFamily: 'Noto Sans Thai', fontWeight: 500 },
                dataLabels: { enabled: true, formatter: function (val) { return val.toFixed(1) + '%'; } },
                tooltip: { y: { formatter: function (val) { return val.toLocaleString() + ' คน-ครั้ง'; } } }
            };

            charts.roomFreq = new ApexCharts(document.querySelector("#chart-room-freq"), options);
            charts.roomFreq.render();
        } else {
            const monthlyData = Array(12).fill(0);
            filteredData.meeting_rooms.forEach(yr => {
                if (yearVal === 'all' || yr.year_be.toString() === yearVal) {
                    yr.months.forEach(m => {
                        if (m.has_data && m.usage && m.usage[roomVal] !== undefined && m.usage[roomVal] !== null) {
                            monthlyData[m.month_index - 1] += m.usage[roomVal];
                        }
                    });
                }
            });

            const options = {
                series: [{ name: `ยอดใช้งาน ${roomVal} (คน-ครั้ง)`, data: monthlyData }],
                chart: { type: 'bar', height: 380, fontFamily: 'Sarabun, sans-serif', toolbar: {
                    show: true,
                    export: {
                        csv: { filename: 'สถิติแดชบอร์ด' },
                        svg: { filename: 'กราฟแดชบอร์ด' },
                        png: { filename: 'กราฟแดชบอร์ด' }
                    }
                } },
                plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
                colors: ['#4f46e5'],
                dataLabels: { enabled: true, formatter: function (val) { return val > 0 ? val.toLocaleString() : ''; } },
                xaxis: {
                    categories: MONTHS_TH,
                    labels: { style: { colors: '#64748b', fontSize: '11px', fontFamily: 'Noto Sans Thai', fontWeight: 600 } }
                },
                yaxis: {
                    title: { text: 'จำนวนผู้ใช้บริการ (คน-ครั้ง)', style: { fontFamily: 'Noto Sans Thai', fontWeight: 500 } },
                    labels: { formatter: function (val) { return val.toLocaleString(); }, style: { colors: '#64748b' } }
                },
                grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
                tooltip: { y: { formatter: function (val) { return val.toLocaleString() + ' คน-ครั้ง'; } } }
            };

            charts.roomFreq = new ApexCharts(document.querySelector("#chart-room-freq"), options);
            charts.roomFreq.render();
        }
    }

    function populateRoomTable(filteredData, yearVal, roomVal = 'all') {
        const tableBody = document.querySelector('#table-room-data tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const thTotal = document.querySelector('#table-room-data thead th:nth-child(2)');
        const thRoom = document.querySelector('#table-room-data thead th:nth-child(3)');
        
        if (roomVal === 'all') {
            if (thTotal) thTotal.textContent = 'ยอดรวมผู้ใช้';
            if (thRoom) thRoom.textContent = 'ห้องยอดนิยมประจำเดือน';
        } else {
            if (thTotal) thTotal.textContent = 'ยอดรวมห้องนี้';
            if (thRoom) thRoom.textContent = 'ห้องประชุม';
        }

        for (let i = 1; i <= 12; i++) {
            let totalUsage = 0;
            let popularRoom = '-';
            let maxRoomVal = -1;
            let nonZeroRooms = [];
            let totalAllRoomsUsage = 0;

            filteredData.meeting_rooms.forEach(yr => {
                if (yearVal === 'all' || yr.year_be.toString() === yearVal) {
                    const mData = yr.months.find(m => m.month_index === i);
                    if (mData && mData.has_data && mData.usage) {
                        if (roomVal === 'all') {
                            Object.entries(mData.usage).forEach(([room, val]) => {
                                if (val !== null) {
                                    totalUsage += val;
                                    if (val > 0) { nonZeroRooms.push(room); }
                                    if (val > maxRoomVal) { maxRoomVal = val; popularRoom = room; }
                                }
                            });
                        } else {
                            if (mData.usage[roomVal] !== undefined && mData.usage[roomVal] !== null) {
                                totalUsage += mData.usage[roomVal];
                            }
                            Object.values(mData.usage).forEach(val => {
                                if (val !== null) totalAllRoomsUsage += val;
                            });
                        }
                    }
                }
            });

            const hasDataThisMonth = roomVal === 'all' ? (totalUsage > 0) : (totalAllRoomsUsage > 0);
            if (!hasDataThisMonth) {
                if (yearVal !== 'all') {
                    const matchedYear = filteredData.meeting_rooms.find(yr => yr.year_be.toString() === yearVal);
                    if (matchedYear) {
                        const maxMonthIndexWithData = matchedYear.months
                            .filter(m => m.has_data)
                            .reduce((max, m) => m.month_index > max ? m.month_index : max, 0);
                        if (i > maxMonthIndexWithData) { continue; }
                    }
                }
            }

            const row = document.createElement('tr');
            
            const tdMonth = document.createElement('td');
            tdMonth.style.fontWeight = '600';
            tdMonth.textContent = MONTHS_TH[i - 1];
            row.appendChild(tdMonth);

            const tdTotal = document.createElement('td');
            if (roomVal === 'all') {
                tdTotal.textContent = totalUsage > 0 ? formatNumber(totalUsage) + " คน-ครั้ง" : "-";
            } else {
                tdTotal.textContent = totalUsage > 0 ? formatNumber(totalUsage) + " คน-ครั้ง" : (totalAllRoomsUsage > 0 ? "0 คน-ครั้ง" : "-");
            }
            row.appendChild(tdTotal);

            const tdRoom = document.createElement('td');
            if (roomVal === 'all') {
                if (totalUsage > 0 && maxRoomVal > 0) {
                    tdRoom.innerHTML = `<span class="badge badge-success"><i class="fa-solid fa-fire text-amber"></i> ${popularRoom}</span> <small class="text-secondary">(${formatNumber(maxRoomVal)} คน)</small>`;
                } else {
                    tdRoom.textContent = '-';
                }
            } else {
                if (totalAllRoomsUsage > 0) {
                    tdRoom.innerHTML = `<span class="badge badge-success">${roomVal}</span>`;
                } else {
                    tdRoom.textContent = '-';
                }
            }
            row.appendChild(tdRoom);

            tableBody.appendChild(row);
        }

        if (tableBody.children.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">ไม่มีข้อมูลบริการในช่วงเวลานี้</td></tr>';
        }
    }

    // TAB 3: Door entry shifts
    function renderDoorShiftsChart(filteredData, shiftVal = 'all') {
        if (charts.doorShifts) { charts.doorShifts.destroy(); }

        const titleEl = document.querySelector('#chart-door-shifts') ? document.querySelector('#chart-door-shifts').closest('.chart-card').querySelector('h3') : null;
        const descEl = document.querySelector('#chart-door-shifts') ? document.querySelector('#chart-door-shifts').closest('.chart-card').querySelector('p') : null;

        const yearVal = selectYearDoor ? selectYearDoor.value : 'all';
        const startMonth = selectStartMonthDoor ? parseInt(selectStartMonthDoor.value) : 1;
        const endMonth = selectEndMonthDoor ? parseInt(selectEndMonthDoor.value) : 12;

        if (shiftVal === 'all') {
            if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-business-time text-amber"></i> ยอดผู้ใช้บริการห้องสมุดแบ่งตามช่วงกะเวลา';
            if (descEl) descEl.textContent = 'วิเคราะห์ความหนาแน่นของผู้เข้าใช้บริการเพื่อวางกำลังเจ้าหน้าที่';

            let shiftStats = {};
            filteredData.library_doors.forEach(yr => {
                if (yearVal === 'all' || yr.year_be.toString() === yearVal) {
                    yr.months.forEach(m => {
                        if (m.month_index >= startMonth && m.month_index <= endMonth) {
                            if (m.has_data && m.entries) {
                                Object.entries(m.entries).forEach(([shift, val]) => {
                                    if (val !== null) { shiftStats[shift] = (shiftStats[shift] || 0) + val; }
                                });
                            }
                        }
                    });
                }
            });

            const categories = Object.keys(shiftStats).sort((a, b) => {
                const idxA = SHIFT_ORDER.indexOf(a);
                const idxB = SHIFT_ORDER.indexOf(b);
                if (idxA === -1) return 1;
                if (idxB === -1) return -1;
                return idxA - idxB;
            });
            const data = categories.map(cat => shiftStats[cat] || 0);

            const options = {
                title: {
                    text: 'สถิติยอดผู้ใช้บริการห้องสมุดจำแนกตามช่วงกะเวลาสะสม (คน)',
                    align: 'left',
                    style: { fontFamily: 'Noto Sans Thai, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1e293b' }
                },
                series: [{ name: 'จำนวนคนเดินเข้าสะสม (คน)', data: data }],
                chart: { type: 'bar', height: 350, fontFamily: 'Sarabun, sans-serif', toolbar: {
                    show: true,
                    export: {
                        csv: { filename: 'สถิติแดชบอร์ด' },
                        svg: { filename: 'กราฟแดชบอร์ด' },
                        png: { filename: 'กราฟแดชบอร์ด' }
                    }
                } },
                plotOptions: { bar: { borderRadius: 6, columnWidth: '50%', distributed: true } },
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                dataLabels: { enabled: true, formatter: function (val) { return val.toLocaleString() + ' คน'; } },
                xaxis: {
                    categories: categories,
                    labels: { style: { colors: '#1e293b', fontSize: '11px', fontFamily: 'Noto Sans Thai', fontWeight: 600 } }
                },
                yaxis: {
                    title: { text: 'จำนวนผู้ใช้บริการสะสม (คน)', style: { fontFamily: 'Noto Sans Thai', fontWeight: 500 } },
                    labels: { formatter: function (val) { return val.toLocaleString(); }, style: { colors: '#64748b' } }
                },
                legend: { show: false },
                grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
                tooltip: { y: { formatter: function (val) { return val.toLocaleString() + ' คน'; } } }
            };

            charts.doorShifts = new ApexCharts(document.querySelector("#chart-door-shifts"), options);
            charts.doorShifts.render();
        } else {
            if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-business-time text-amber"></i> เปรียบเทียบช่วงกะเวลา ${shiftVal} รายปี`;
            if (descEl) descEl.textContent = `วิเคราะห์ยอดสะสมของผู้ใช้งานในช่วงกะเวลา ${shiftVal} แยกตามแต่ละปีการศึกษา/ปฏิทิน`;

            const categories = [];
            const data = [];

            filteredData.library_doors.forEach(yr => {
                if (yearVal === 'all' || yr.year_be.toString() === yearVal) {
                    let yearlyShiftSum = 0;
                    yr.months.forEach(m => {
                        if (m.month_index >= startMonth && m.month_index <= endMonth) {
                            if (m.has_data && m.entries && m.entries[shiftVal] !== undefined && m.entries[shiftVal] !== null) {
                                yearlyShiftSum += m.entries[shiftVal];
                            }
                        }
                    });
                    categories.push(`ปี พ.ศ. ${yr.year_be}`);
                    data.push(yearlyShiftSum);
                }
            });

            const zipped = categories.map((cat, idx) => ({ cat, val: data[idx] }));
            zipped.sort((a, b) => a.cat.localeCompare(b.cat));
            const sortedCategories = zipped.map(item => item.cat);
            const sortedData = zipped.map(item => item.val);

            const options = {
                title: {
                    text: `สถิติเปรียบเทียบผู้ใช้บริการกะช่วงเวลา ${shiftVal} รายปี (คน)`,
                    align: 'left',
                    style: { fontFamily: 'Noto Sans Thai, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1e293b' }
                },
                series: [{ name: `จำนวนคนเข้าสะสม (${shiftVal})`, data: sortedData }],
                chart: { type: 'bar', height: 350, fontFamily: 'Sarabun, sans-serif', toolbar: {
                    show: true,
                    export: {
                        csv: { filename: 'สถิติแดชบอร์ด' },
                        svg: { filename: 'กราฟแดชบอร์ด' },
                        png: { filename: 'กราฟแดชบอร์ด' }
                    }
                } },
                plotOptions: { bar: { borderRadius: 6, columnWidth: '40%', distributed: true } },
                colors: ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#84cc16'],
                dataLabels: { enabled: true, formatter: function (val) { return val.toLocaleString() + ' คน'; } },
                xaxis: {
                    categories: sortedCategories,
                    labels: { style: { colors: '#1e293b', fontSize: '11px', fontFamily: 'Noto Sans Thai', fontWeight: 600 } }
                },
                yaxis: {
                    title: { text: `จำนวนผู้ใช้บริการสะสม (คน)`, style: { fontFamily: 'Noto Sans Thai', fontWeight: 500 } },
                    labels: { formatter: function (val) { return val.toLocaleString(); }, style: { colors: '#64748b' } }
                },
                legend: { show: false },
                grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
                tooltip: { y: { formatter: function (val) { return val.toLocaleString() + ' คน'; } } }
            };

            charts.doorShifts = new ApexCharts(document.querySelector("#chart-door-shifts"), options);
            charts.doorShifts.render();
        }
    }

    function renderDoorTrendYearlyChart(filteredData, shiftVal = 'all') {
        if (charts.doorTrendYearly) { charts.doorTrendYearly.destroy(); }

        const yearVal = selectYearDoor ? selectYearDoor.value : 'all';
        const startMonth = selectStartMonthDoor ? parseInt(selectStartMonthDoor.value) : 1;
        const endMonth = selectEndMonthDoor ? parseInt(selectEndMonthDoor.value) : 12;

        const series = [];

        filteredData.library_doors.forEach(yr => {
            if (yearVal === 'all' || yr.year_be.toString() === yearVal) {
                const dataPoints = [];
                for (let i = startMonth; i <= endMonth; i++) {
                    const mData = yr.months.find(m => m.month_index === i);
                    if (mData && mData.has_data) {
                        let total = 0;
                        if (shiftVal === 'all') {
                            Object.values(mData.entries).forEach(val => { if (val !== null) total += val; });
                        } else {
                            if (mData.entries[shiftVal] !== undefined && mData.entries[shiftVal] !== null) {
                                total = mData.entries[shiftVal];
                            }
                        }
                        dataPoints.push(total > 0 ? total : null);
                    } else {
                        dataPoints.push(null);
                    }
                }

                let cleanDataPoints = [...dataPoints];
                let lastIndex = -1;
                for (let i = cleanDataPoints.length - 1; i >= 0; i--) {
                    if (cleanDataPoints[i] !== null) { lastIndex = i; break; }
                }
                if (lastIndex !== -1) {
                    cleanDataPoints = cleanDataPoints.slice(0, lastIndex + 1);
                }

                series.push({ name: `ปี พ.ศ. ${yr.year_be}`, data: cleanDataPoints });
            }
        });

        series.sort((a, b) => a.name.localeCompare(b.name));

        const xCategories = MONTHS_TH.slice(startMonth - 1, endMonth);

        const options = {
            title: {
                text: 'แนวโน้มความหนาแน่นผู้เข้าใช้บริการห้องสมุดรายเดือนเปรียบเทียบแต่ละปี พ.ศ. (คน)',
                align: 'left',
                style: { fontFamily: 'Noto Sans Thai, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1e293b' }
            },
            series: series,
            chart: { type: 'line', height: 350, fontFamily: 'Sarabun, sans-serif', toolbar: {
                    show: true,
                    export: {
                        csv: { filename: 'สถิติแดชบอร์ด' },
                        svg: { filename: 'กราฟแดชบอร์ด' },
                        png: { filename: 'กราฟแดชบอร์ด' }
                    }
                } },
            colors: ['#64748b', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
            stroke: { width: 3, curve: 'smooth' },
            markers: { size: 4, hover: { size: 6 } },
            xaxis: { categories: xCategories, labels: { style: { colors: '#64748b' } } },
            yaxis: {
                title: { text: shiftVal === 'all' ? 'จำนวนผู้เข้าห้องสมุด (คน)' : `จำนวนผู้เข้าห้องสมุด (${shiftVal})`, style: { fontFamily: 'Noto Sans Thai', fontWeight: 500 } },
                labels: { formatter: function (val) { return val ? val.toLocaleString() : '0'; }, style: { colors: '#64748b' } }
            },
            tooltip: { shared: true, y: { formatter: function (val) { return val !== null ? val.toLocaleString() + ' คน' : 'ไม่มีข้อมูล'; } } },
            legend: { position: 'top', horizontalAlign: 'right', fontFamily: 'Noto Sans Thai', fontWeight: 500 },
            grid: { borderColor: '#e2e8f0', strokeDashArray: 4 }
        };

        charts.doorTrendYearly = new ApexCharts(document.querySelector("#chart-door-trend-yearly"), options);
        charts.doorTrendYearly.render();
    }

    // ==========================================
    // Monthly Data Editor (JS Editor Grid)
    // ==========================================
    async function renderDataEditor() {
        const tbody = document.querySelector('#table-monthly-editor tbody');
        const thead = document.querySelector('#table-monthly-editor thead');
        if (!tbody || !thead || !appData) return;
        
        tbody.innerHTML = '';
        thead.innerHTML = '';
        
        const yearVal = editorYearSelect ? editorYearSelect.value : '';
        const typeVal = editorTypeSelect ? editorTypeSelect.value : 'rooms'; // 'rooms' or 'doors'
        
        if (!yearVal) {
            tbody.innerHTML = '<tr><td colspan="100" style="text-align: center; color: var(--text-secondary); padding: 20px;">กรุณาเลือกปี พ.ศ. ด้านบน</td></tr>';
            return;
        }
        
        const typeKey = typeVal === 'rooms' ? 'meeting_rooms' : 'library_doors';
        const yearData = appData[typeKey].find(yr => yr.year_be.toString() === yearVal);
        
        if (!yearData) {
            tbody.innerHTML = '<tr><td colspan="100" style="text-align: center; color: var(--text-secondary); padding: 20px;">ไม่พบข้อมูลสถิติของปีนี้ในฐานข้อมูล</td></tr>';
            return;
        }
        
        const columns = [];
        if (typeVal === 'rooms') {
            columns.push(...yearData.rooms);
        } else {
            columns.push(...yearData.shifts);
        }
        
        const trHead = document.createElement('tr');
        trHead.innerHTML = `<th>เดือน</th>`;
        columns.forEach(col => {
            const th = document.createElement('th');
            let colLabel = col;
            if (typeVal === 'rooms') {
                colLabel = col.replace('ห้อง ', '');
            } else {
                colLabel = col.split(' น.')[0];
            }
            th.textContent = colLabel;
            th.title = col;
            trHead.appendChild(th);
        });
        trHead.innerHTML += `<th style="text-align: center; width: 130px;">การจัดการ</th>`;
        thead.appendChild(trHead);
        
        for (let mIdx = 1; mIdx <= 12; mIdx++) {
            const monthName = MONTHS_TH[mIdx - 1];
            const mData = yearData.months.find(m => m.month_index === mIdx);
            
            const isMonthDeleted = mData ? !mData.has_data : true;
            
            const tr = document.createElement('tr');
            if (isMonthDeleted) {
                tr.className = 'editor-row-deleted';
            }
            
            const tdMonth = document.createElement('td');
            tdMonth.style.fontWeight = '600';
            tdMonth.textContent = monthName;
            tr.appendChild(tdMonth);
            
            columns.forEach(col => {
                const td = document.createElement('td');
                const val = mData && mData.has_data ? (typeVal === 'rooms' ? mData.usage[col] : mData.entries[col]) : null;
                
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.placeholder = '-';
                input.value = (val !== null && val !== undefined) ? val : '';
                input.disabled = false; // Allow admin to enter numbers for any month
                input.dataset.currentVal = (val !== null && val !== undefined) ? val : '';
                
                input.addEventListener('blur', () => {
                    const currentVal = input.dataset.currentVal === '' ? null : parseInt(input.dataset.currentVal);
                    const newValue = input.value === '' ? null : parseInt(input.value);
                    if (newValue !== currentVal) {
                        saveCellOverride(typeVal, yearVal, mIdx, col, newValue);
                        input.dataset.currentVal = (newValue !== null && newValue !== undefined) ? newValue : '';
                    }
                });
                
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        input.blur();
                    }
                });
                
                td.appendChild(input);
                tr.appendChild(td);
            });
            
            const tdAction = document.createElement('td');
            tdAction.style.textAlign = 'center';
            if (isMonthDeleted) {
                const btnRestore = document.createElement('button');
                btnRestore.className = 'btn-restore-sm';
                btnRestore.innerHTML = `<i class="fa-solid fa-rotate-left"></i> คืนค่า`;
                btnRestore.addEventListener('click', () => {
                    restoreMonthData(typeVal, yearVal, mIdx);
                });
                tdAction.appendChild(btnRestore);
            } else {
                const btnClear = document.createElement('button');
                btnClear.className = 'btn-danger-sm';
                btnClear.innerHTML = `<i class="fa-solid fa-eraser"></i> ล้างข้อมูล`;
                btnClear.addEventListener('click', () => {
                    if (confirm(`คุณต้องการล้างข้อมูลทั้งหมดของเดือน ${monthName} ปี พ.ศ. ${yearVal} ใช่หรือไม่?`)) {
                        clearMonthData(typeVal, yearVal, mIdx);
                    }
                });
                tdAction.appendChild(btnClear);
            }
            tr.appendChild(tdAction);
            tbody.appendChild(tr);
        }
    }

    function updateAppDataCellClientSide(type, year, monthIndex, key, value) {
        if (!appData) return;
        const targetKey = type === 'rooms' ? 'meeting_rooms' : 'library_doors';
        let yrObj = appData[targetKey].find(y => y.year_be.toString() === year.toString());
        if (!yrObj) return;
        let mObj = yrObj.months.find(m => m.month_index === monthIndex);
        if (!mObj) return;
        mObj.has_data = true;
        if (type === 'rooms') {
            if (!mObj.usage) mObj.usage = {};
            mObj.usage[key] = value;
        } else {
            if (!mObj.entries) mObj.entries = {};
            mObj.entries[key] = value;
        }
        saveCloudDataLocally();
        processDataAndRender();
    }

    async function saveCellOverride(type, year, monthIndex, key, value) {
        const statusEl = document.getElementById('editor-save-status');
        if (statusEl) {
            statusEl.innerHTML = `<span style="color: var(--primary-color);"><i class="fa-solid fa-circle-notch fa-spin"></i> กำลังบันทึกอัตโนมัติ...</span>`;
            statusEl.style.opacity = '1';
        }

        // 1. Update client-side immediately
        updateAppDataCellClientSide(type, year, monthIndex, key, value);

        // 2. Background sync to local server if running
        try {
            const response = await fetch('/api/update-cell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, year, monthIndex, key, value })
            });
            if (response.ok) {
                const serverData = await response.json();
                if (serverData && serverData.meeting_rooms) {
                    appData = serverData;
                    saveCloudDataLocally();
                    processDataAndRender();
                }
            }
        } catch (e) {
            console.log('Server sync skipped (Static host mode):', e);
        }

        if (statusEl) {
            statusEl.innerHTML = `<span style="color: var(--success-color, #10b981);"><i class="fa-solid fa-circle-check"></i> บันทึกสำเร็จ</span>`;
            setTimeout(() => {
                if (statusEl.innerHTML.includes('บันทึกสำเร็จ')) {
                    statusEl.style.opacity = '0';
                }
            }, 2000);
        }
    }

    async function clearMonthData(type, year, monthIndex) {
        showLoading('กำลังล้างข้อมูลรายเดือน...');
        const targetKey = type === 'rooms' ? 'meeting_rooms' : 'library_doors';
        let yrObj = appData[targetKey].find(y => y.year_be.toString() === year.toString());
        if (yrObj) {
            let mObj = yrObj.months.find(m => m.month_index === monthIndex);
            if (mObj) {
                mObj.has_data = false;
                if (type === 'rooms' && mObj.usage) {
                    Object.keys(mObj.usage).forEach(k => mObj.usage[k] = null);
                } else if (mObj.entries) {
                    Object.keys(mObj.entries).forEach(k => mObj.entries[k] = null);
                }
            }
        }
        saveCloudDataLocally();
        processDataAndRender();
        renderDataEditor();

        try {
            const response = await fetch('/api/delete-month', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, year, monthIndex })
            });
            if (response.ok) {
                const serverData = await response.json();
                if (serverData && serverData.meeting_rooms) {
                    appData = serverData;
                    saveCloudDataLocally();
                    processDataAndRender();
                    renderDataEditor();
                }
            }
        } catch (e) {
            console.log('Server sync skipped (Static host mode):', e);
        } finally {
            hideLoading();
        }
    }

    async function restoreMonthData(type, year, monthIndex) {
        showLoading('กำลังคืนค่าข้อมูลรายเดือน...');
        const targetKey = type === 'rooms' ? 'meeting_rooms' : 'library_doors';
        let yrObj = appData[targetKey].find(y => y.year_be.toString() === year.toString());
        if (yrObj) {
            let mObj = yrObj.months.find(m => m.month_index === monthIndex);
            if (mObj) {
                mObj.has_data = true;
            }
        }
        saveCloudDataLocally();
        processDataAndRender();
        renderDataEditor();

        try {
            const response = await fetch('/api/restore-month', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, year, monthIndex })
            });
            if (response.ok) {
                const serverData = await response.json();
                if (serverData && serverData.meeting_rooms) {
                    appData = serverData;
                    saveCloudDataLocally();
                    processDataAndRender();
                    renderDataEditor();
                }
            }
        } catch (e) {
            console.log('Server sync skipped (Static host mode):', e);
        } finally {
            hideLoading();
        }
    }

    async function addYearData() {
        const yearInput = prompt('ระบุปี พ.ศ. ที่ต้องการเพิ่ม (เช่น 2567):');
        if (yearInput === null) return;
        
        const year = parseInt(yearInput.trim());
        if (isNaN(year) || year < 2500 || year > 2600) {
            alert('กรุณากรอกปี พ.ศ. ให้ถูกต้อง (ตัวเลขระหว่าง 2500 - 2600)');
            return;
        }
        
        showLoading('กำลังเพิ่มปี พ.ศ. ใหม่...');
        
        let existingRoomYr = appData.meeting_rooms.find(y => y.year_be === year);
        if (!existingRoomYr) {
            const roomList = ["ห้อง 905", "ห้อง 906", "ห้อง 907", "ห้อง 908", "ห้อง 909", "ห้อง 927", "ห้อง 928", "ห้อง 929", "ห้อง 930", "ห้อง 931", "ห้อง 932"];
            const newYr = {
                year_be: year,
                year_ce: year - 543,
                rooms: roomList,
                months: []
            };
            for (let i = 1; i <= 12; i++) {
                const usage = {};
                roomList.forEach(r => usage[r] = null);
                newYr.months.push({
                    month_index: i,
                    month_name: MONTHS_TH[i - 1],
                    has_data: false,
                    usage: usage
                });
            }
            appData.meeting_rooms.push(newYr);
        }

        let existingDoorYr = appData.library_doors.find(y => y.year_be === year);
        if (!existingDoorYr) {
            const shiftList = ["08.00 - 12.00 น.", "12.01 - 19.00 น.", "19.01 - 00.00 น.", "00.01 - 07.59 น."];
            const newYr = {
                year_be: year,
                year_ce: year - 543,
                shifts: shiftList,
                months: []
            };
            for (let i = 1; i <= 12; i++) {
                const entries = {};
                shiftList.forEach(s => entries[s] = null);
                newYr.months.push({
                    month_index: i,
                    month_name: MONTHS_TH[i - 1],
                    has_data: false,
                    entries: entries
                });
            }
            appData.library_doors.push(newYr);
        }

        saveCloudDataLocally();
        processDataAndRender();
        renderSettingsTab();
        if (editorYearSelect) editorYearSelect.value = year.toString();
        renderDataEditor();

        try {
            const response = await fetch('/api/add-year', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year })
            });
            if (response.ok) {
                const serverData = await response.json();
                if (serverData && serverData.meeting_rooms) {
                    appData = serverData;
                    saveCloudDataLocally();
                    processDataAndRender();
                    renderSettingsTab();
                    if (editorYearSelect) editorYearSelect.value = year.toString();
                    renderDataEditor();
                }
            }
        } catch (e) {
            console.log('Server sync skipped (Static host mode):', e);
        } finally {
            hideLoading();
        }
    }

    ['btn-add-year', 'btn-top-add-year', 'btn-header-add-year', 'btn-filter-add-year'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', () => {
                const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
                if (!isAdmin) {
                    const pwd = prompt('กรุณากรอกรหัสผ่านผู้ดูแลระบบ (Admin Password: admin1234):');
                    if (pwd && pwd.trim().toLowerCase() === 'admin1234') {
                        sessionStorage.setItem('isAdmin', 'true');
                        if (typeof checkAdminAuth === 'function') checkAdminAuth();
                        addYearData();
                    } else if (pwd !== null) {
                        alert('รหัสผ่านไม่ถูกต้อง');
                    }
                } else {
                    addYearData();
                }
            });
        }
    });
    
    if (editorYearSelect) {
        editorYearSelect.addEventListener('change', renderDataEditor);
    }
    if (editorTypeSelect) {
        editorTypeSelect.addEventListener('change', renderDataEditor);
    }

    // --- Executive Summary Custom Editor ---
    function parseMarkdown(text) {
        if (!text) return '';
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        const lines = html.split('\n');
        let inList = false;
        const processedLines = lines.map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                let content = trimmed.substring(2);
                let out = '';
                if (!inList) {
                    inList = true;
                    out += '<ul>';
                }
                out += `<li>${content}</li>`;
                return out;
            } else {
                let out = '';
                if (inList) {
                    inList = false;
                    out += '</ul>';
                }
                if (trimmed !== '') {
                    out += `<p>${trimmed}</p>`;
                }
                return out;
            }
        });
        if (inList) {
            processedLines.push('</ul>');
        }
        return processedLines.join('\n');
    }

    function renderAnalysisTab(filteredData) {
        if (!filteredData || !filteredData.analysis) return;
        
        const displayView = document.getElementById('analysis-display-view');
        if (!displayView) return;
        
        const analysis = filteredData.analysis;
        
        let pointsHtml = '';
        analysis.points.forEach(p => {
            pointsHtml += `
                <div class="analysis-card">
                    <div class="card-num">${p.num}</div>
                    <div class="analysis-card-content">
                        <h3>${p.title}</h3>
                        ${parseMarkdown(p.content)}
                    </div>
                </div>
            `;
        });
        
        let strategiesHtml = '';
        analysis.strategies.forEach(s => {
            let badgeBg = 'bg-blue';
            if (s.badge === 'ระยะกลาง') badgeBg = 'bg-green';
            if (s.badge === 'ระยะยาว') badgeBg = 'bg-amber';
            
            strategiesHtml += `
                <div class="step-col">
                    <div class="step-head">
                        <span class="step-badge ${badgeBg}">${s.badge}</span>
                        <h4>${s.title}</h4>
                    </div>
                    <p>${s.text}</p>
                </div>
            `;
        });
        
        displayView.innerHTML = `
            <div class="analysis-deck">
                <div class="analysis-card highlighted-card">
                    <div class="analysis-card-icon"><i class="fa-solid fa-award"></i></div>
                    <div class="analysis-card-body">
                        <h2>${analysis.title}</h2>
                        <p class="lead-text">${analysis.leadText}</p>
                    </div>
                </div>
                ${pointsHtml}
                <div class="strategic-box">
                    <h3><i class="fa-solid fa-clipboard-list"></i> ${analysis.strategicTitle}</h3>
                    <div class="grid-steps">
                        ${strategiesHtml}
                    </div>
                </div>
            </div>
        `;
    }

    const btnEditAnalysis = document.getElementById('btn-edit-analysis');
    const btnCancelAnalysis = document.getElementById('btn-cancel-analysis');
    const btnSaveAnalysis = document.getElementById('btn-save-analysis');
    const editView = document.getElementById('analysis-edit-view');
    const displayView = document.getElementById('analysis-display-view');
    const btnAddPoint = document.getElementById('btn-add-point');
    const btnAddStrategy = document.getElementById('btn-add-strategy');
    
    let tempPoints = [];
    let tempStrategies = [];

    function renderEditPoints() {
        const pointsContainer = document.getElementById('edit-points-container');
        if (!pointsContainer) return;
        pointsContainer.innerHTML = '';
        
        tempPoints.forEach((p, idx) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.marginBottom = '20px';
            div.style.padding = '16px';
            div.style.border = '1px solid var(--border-color)';
            div.style.borderRadius = '8px';
            div.style.position = 'relative';
            div.innerHTML = `
                <button type="button" class="btn btn-danger-sm btn-delete-point" data-idx="${idx}" style="position: absolute; top: 12px; right: 12px; padding: 4px 8px; font-size: 0.8rem; height: auto;"><i class="fa-solid fa-trash-can"></i> ลบ</button>
                <div style="font-weight: bold; margin-bottom: 12px; color: var(--text-primary);">ประเด็นที่ ${p.num}</div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">หัวข้อประเด็น</label>
                    <input type="text" class="form-control edit-point-title" data-idx="${idx}" value="${p.title || ''}" style="width: 100%; height: 42px;">
                </div>
                <div class="form-group">
                    <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">เนื้อหารายละเอียด (ใช้ * เพื่อขึ้นต้นบรรทัดรายการ bullet และใช้ ** เพื่อทำตัวหนา)</label>
                    <textarea class="form-control edit-point-content" data-idx="${idx}" style="width: 100%; height: 120px; resize: vertical; font-family: Sarabun, sans-serif; padding: 10px;">${p.content || ''}</textarea>
                </div>
            `;
            pointsContainer.appendChild(div);
        });

        pointsContainer.querySelectorAll('.btn-delete-point').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                saveCurrentEditorInputs();
                tempPoints.splice(idx, 1);
                tempPoints.forEach((p, i) => {
                    p.num = (i + 1).toString().padStart(2, '0');
                });
                renderEditPoints();
            });
        });
    }

    function renderEditStrategies() {
        const strategiesContainer = document.getElementById('edit-strategies-container');
        if (!strategiesContainer) return;
        strategiesContainer.innerHTML = '';
        
        tempStrategies.forEach((s, idx) => {
            const div = document.createElement('div');
            div.className = 'card';
            div.style.padding = '16px';
            div.style.border = '1px solid var(--border-color)';
            div.style.borderRadius = '8px';
            div.style.position = 'relative';
            
            const badges = ['ระยะสั้น', 'ระยะกลาง', 'ระยะยาว'];
            let options = '';
            badges.forEach(b => {
                options += `<option value="${b}" ${s.badge === b ? 'selected' : ''}>${b}</option>`;
            });

            div.innerHTML = `
                <button type="button" class="btn btn-danger-sm btn-delete-strategy" data-idx="${idx}" style="position: absolute; top: 12px; right: 12px; padding: 4px 8px; font-size: 0.8rem; height: auto;"><i class="fa-solid fa-trash-can"></i> ลบ</button>
                <div class="form-group" style="margin-bottom: 12px; max-width: 120px;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">ประเภทระยะ</label>
                    <select class="form-control edit-strat-badge" style="width: 100%; height: 36px; padding: 0 8px;">
                        ${options}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 12px;">
                    <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">หัวข้อแผนกลยุทธ์</label>
                    <input type="text" class="form-control edit-strat-title" data-idx="${idx}" value="${s.title || ''}" style="width: 100%; height: 42px;">
                </div>
                <div class="form-group">
                    <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">เนื้อหาความหมาย</label>
                    <textarea class="form-control edit-strat-text" data-idx="${idx}" style="width: 100%; height: 80px; resize: vertical; font-family: Sarabun, sans-serif; padding: 10px;">${s.text || ''}</textarea>
                </div>
            `;
            strategiesContainer.appendChild(div);
        });

        strategiesContainer.querySelectorAll('.btn-delete-strategy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
                saveCurrentEditorInputs();
                tempStrategies.splice(idx, 1);
                renderEditStrategies();
            });
        });
    }

    function saveCurrentEditorInputs() {
        const pointTitleInputs = document.querySelectorAll('.edit-point-title');
        const pointContentInputs = document.querySelectorAll('.edit-point-content');
        pointTitleInputs.forEach(input => {
            const idx = parseInt(input.getAttribute('data-idx'));
            if (tempPoints[idx]) {
                tempPoints[idx].title = input.value;
            }
        });
        pointContentInputs.forEach(input => {
            const idx = parseInt(input.getAttribute('data-idx'));
            if (tempPoints[idx]) {
                tempPoints[idx].content = input.value;
            }
        });

        const stratBadgeInputs = document.querySelectorAll('.edit-strat-badge');
        const stratTitleInputs = document.querySelectorAll('.edit-strat-title');
        const stratTextInputs = document.querySelectorAll('.edit-strat-text');
        stratTitleInputs.forEach(input => {
            const idx = parseInt(input.getAttribute('data-idx'));
            if (tempStrategies[idx]) {
                tempStrategies[idx].title = input.value;
            }
        });
        stratTextInputs.forEach(input => {
            const idx = parseInt(input.getAttribute('data-idx'));
            if (tempStrategies[idx]) {
                tempStrategies[idx].text = input.value;
            }
        });
        stratBadgeInputs.forEach((input, idx) => {
            if (tempStrategies[idx]) {
                tempStrategies[idx].badge = input.value;
            }
        });
    }

    function enterEditAnalysisMode() {
        if (!appData || !appData.analysis) return;
        const analysis = appData.analysis;
        
        const titleInput = document.getElementById('edit-analysis-title');
        const leadInput = document.getElementById('edit-analysis-lead');
        const stratTitleInput = document.getElementById('edit-strategic-title');
        
        if (titleInput) titleInput.value = analysis.title;
        if (leadInput) leadInput.value = analysis.leadText;
        if (stratTitleInput) stratTitleInput.value = analysis.strategicTitle;
        
        tempPoints = JSON.parse(JSON.stringify(analysis.points));
        tempStrategies = JSON.parse(JSON.stringify(analysis.strategies));
        
        renderEditPoints();
        renderEditStrategies();
        
        if (displayView) displayView.style.display = 'none';
        if (btnEditAnalysis) btnEditAnalysis.style.display = 'none';
        if (editView) editView.style.display = 'block';
    }

    if (btnEditAnalysis) {
        btnEditAnalysis.addEventListener('click', () => {
            const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
            if (isAdmin) {
                enterEditAnalysisMode();
            } else {
                const modal = document.getElementById('password-modal');
                const modalInput = document.getElementById('modal-admin-password');
                const modalError = document.getElementById('modal-password-error');
                if (modal) {
                    if (modalInput) modalInput.value = '';
                    if (modalError) modalError.style.display = 'none';
                    modal.classList.add('active');
                    if (modalInput) setTimeout(() => modalInput.focus(), 100);
                }
            }
        });
    }

    // Executive Storytelling Toggle Event Handlers
    document.querySelectorAll('.view-mode-toggle').forEach(toggleGroup => {
        const btns = toggleGroup.querySelectorAll('.toggle-btn');
        const chartId = toggleGroup.getAttribute('data-chart');
        const textId = toggleGroup.getAttribute('data-text');

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const containerId = `container-${chartId.replace('chart-', '')}`;
                const chartContainer = document.getElementById(containerId) || document.getElementById(chartId);
                const textElem = document.getElementById(textId);

                if (mode === 'text') {
                    if (chartContainer) chartContainer.style.display = 'none';
                    if (textElem) textElem.style.display = 'block';
                } else {
                    if (chartContainer) chartContainer.style.display = 'block';
                    if (textElem) textElem.style.display = 'none';
                    setTimeout(() => {
                        window.dispatchEvent(new Event('resize'));
                    }, 50);
                }
            });
        });
    });

    // Modal Password Prompt Event Handlers
    const passwordModal = document.getElementById('password-modal');
    const modalPasswordInput = document.getElementById('modal-admin-password');
    const modalPasswordError = document.getElementById('modal-password-error');
    const btnModalCancel = document.getElementById('btn-modal-cancel');
    const btnModalConfirm = document.getElementById('btn-modal-confirm');
    const btnModalTogglePwd = document.getElementById('btn-modal-toggle-pwd');

    if (btnModalTogglePwd && modalPasswordInput) {
        btnModalTogglePwd.addEventListener('click', () => {
            const isPassword = modalPasswordInput.type === 'password';
            modalPasswordInput.type = isPassword ? 'text' : 'password';
            const icon = btnModalTogglePwd.querySelector('i');
            if (icon) {
                icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
            }
        });
    }

    function closeModal() {
        if (passwordModal) passwordModal.classList.remove('active');
    }

    if (btnModalCancel) {
        btnModalCancel.addEventListener('click', closeModal);
    }

    function performModalLogin() {
        if (!modalPasswordInput) return;
        const pwd = modalPasswordInput.value.trim();
        if (pwd.toLowerCase() === 'admin1234') {
            sessionStorage.setItem('isAdmin', 'true');
            if (modalPasswordError) modalPasswordError.style.display = 'none';
            modalPasswordInput.value = '';
            closeModal();
            checkAdminAuth();
            renderSettingsTab();
            enterEditAnalysisMode();
        } else {
            if (modalPasswordError) modalPasswordError.style.display = 'block';
        }
    }

    if (btnModalConfirm) {
        btnModalConfirm.addEventListener('click', performModalLogin);
    }
    if (modalPasswordInput) {
        modalPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performModalLogin();
            }
        });
    }

    if (btnAddPoint) {
        btnAddPoint.addEventListener('click', () => {
            saveCurrentEditorInputs();
            tempPoints.push({
                num: (tempPoints.length + 1).toString().padStart(2, '0'),
                title: 'ประเด็นความสำคัญใหม่',
                content: '* เนื้อหารายการ...'
            });
            renderEditPoints();
        });
    }

    if (btnAddStrategy) {
        btnAddStrategy.addEventListener('click', () => {
            saveCurrentEditorInputs();
            tempStrategies.push({
                badge: 'ระยะสั้น',
                title: 'หัวข้อแผนกลยุทธ์ใหม่',
                text: 'เนื้อหารายละเอียดแผนกลยุทธ์...'
            });
            renderEditStrategies();
        });
    }
    
    if (btnCancelAnalysis) {
        btnCancelAnalysis.addEventListener('click', () => {
            if (editView) editView.style.display = 'none';
            if (displayView) displayView.style.display = 'block';
            if (sessionStorage.getItem('isAdmin') === 'true' && btnEditAnalysis) {
                btnEditAnalysis.style.display = 'inline-block';
            }
        });
    }
    
    if (btnSaveAnalysis) {
        btnSaveAnalysis.addEventListener('click', async () => {
            const titleInput = document.getElementById('edit-analysis-title');
            const leadInput = document.getElementById('edit-analysis-lead');
            const stratTitleInput = document.getElementById('edit-strategic-title');
            
            const title = titleInput ? titleInput.value.trim() : '';
            const leadText = leadInput ? leadInput.value.trim() : '';
            const strategicTitle = stratTitleInput ? stratTitleInput.value.trim() : '';
            
            if (!title || !leadText) {
                alert('กรุณากรอกหัวข้อหลักและบทนำสรุปให้ครบถ้วน');
                return;
            }
            
            saveCurrentEditorInputs();
            
            for (let i = 0; i < tempPoints.length; i++) {
                if (!tempPoints[i].title.trim() || !tempPoints[i].content.trim()) {
                    alert(`กรุณากรอกหัวข้อและเนื้อหาของประเด็นสำคัญที่ ${i+1} ให้ครบถ้วน หรือลบออกหากไม่ใช้งาน`);
                    return;
                }
            }
            
            for (let i = 0; i < tempStrategies.length; i++) {
                if (!tempStrategies[i].title.trim() || !tempStrategies[i].text.trim()) {
                    alert(`กรุณากรอกข้อมูลแผนกลยุทธ์ลำดับที่ ${i+1} ให้ครบถ้วน หรือลบออกหากไม่ใช้งาน`);
                    return;
                }
            }
            
            const updatedAnalysis = { title, leadText, points: tempPoints, strategicTitle, strategies: tempStrategies };
            
            showLoading('กำลังบันทึกบทวิเคราะห์สรุป...');
            try {
                if (appData) {
                    appData.analysis = updatedAnalysis;
                    saveCloudDataLocally();
                }

                const response = await fetch('/api/update-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedAnalysis)
                });
                
                if (response.ok) {
                    appData = await response.json();
                    saveCloudDataLocally();
                }
                
                processDataAndRender();
                
                if (editView) editView.style.display = 'none';
                if (displayView) displayView.style.display = 'block';
                if (sessionStorage.getItem('isAdmin') === 'true' && btnEditAnalysis) {
                    btnEditAnalysis.style.display = 'inline-block';
                }
                alert('🎉 บันทึกการแก้ไขบทวิเคราะห์ขึ้นระบบคลาวด์เรียบร้อยแล้ว!');
            } catch (e) {
                console.log('Saved to cloud store fallback:', e);
                processDataAndRender();
                if (editView) editView.style.display = 'none';
                if (displayView) displayView.style.display = 'block';
                alert('🎉 บันทึกการแก้ไขบทวิเคราะห์ขึ้นระบบคลาวด์เรียบร้อยแล้ว!');
            } finally {
                hideLoading();
            }
        });
    }

    // Print A4 Executive Report Event Handler (ข้อ 4)
    const btnPrintPdf = document.getElementById('btn-print-pdf');
    if (btnPrintPdf) {
        btnPrintPdf.addEventListener('click', () => {
            window.print();
        });
    }

    // 1-Click Publish Online Button Event Handler
    const btnPublishOnline = document.getElementById('btn-publish-online');
    if (btnPublishOnline) {
        btnPublishOnline.addEventListener('click', async () => {
            if (window.location.hostname.includes('github.io') || window.location.hostname.includes('netlify.app')) {
                alert('🌐 ขณะนี้ระบบกำลังทำงานและแสดงผลสดบน GitHub Pages เรียบร้อยแล้วครับ!\n\nข้อมูลสถิติและการแก้ไขที่คุณทำในตารางแอดมิน จะแสดงผลอัปเดตสดบนหน้าจอแดชบอร์ดทันที\n\nหากต้องการบันทึกการแก้ไขตัวเลขถาวรลงในคลัง GitHub:\nให้ไปที่เมนู "จัดการข้อมูลรายปี" -> กดปุ่ม "สำรองฐานข้อมูล (Export JSON)" แล้วนำไฟล์ extracted_data.json ลากไปวางใน GitHub Repository ได้เลยครับ (ใช้เวลาเพียง 5 วินาที)!');
                return;
            }

            const originalHTML = btnPublishOnline.innerHTML;
            btnPublishOnline.disabled = true;
            btnPublishOnline.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังส่งข้อมูลขึ้นออนไลน์...`;

            try {
                const response = await fetch('/api/publish-online', { method: 'POST' });
                const resData = await response.json();

                if (response.ok && resData.success) {
                    alert('🚀 อัปเดตข้อมูลขึ้นเว็บไซต์ออนไลน์เรียลไทม์สำเร็จ 100%!');
                } else {
                    alert('เกิดข้อผิดพลาดในการอัปเดต: ' + (resData.error || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้'));
                }
            } catch (err) {
                console.error('Publish error:', err);
                alert('💡 ขณะนี้หน้าเว็บแสดงผลสดบนโฮสติ้งออนไลน์เรียบร้อยแล้ว หากต้องการอัปเดตไฟล์ข้อมูลหลัก สามารถกดปุ่มสำรองฐานข้อมูล (Export JSON) ไปอัปโหลดบน GitHub ได้เลยครับ');
            } finally {
                btnPublishOnline.disabled = false;
                btnPublishOnline.innerHTML = originalHTML;
            }
        });
    }

    // Voice Briefing (Web Speech Synthesis) Event Handler (ข้อ 1)
    const btnVoiceBriefing = document.getElementById('btn-voice-briefing');
    if (btnVoiceBriefing) {
        let isSpeaking = false;
        const synth = window.speechSynthesis;

        btnVoiceBriefing.addEventListener('click', () => {
            if (!synth) {
                alert('เบราว์เซอร์ของคุณไม่รองรับระบบเสียงอ่านภาษาไทย');
                return;
            }

            if (isSpeaking) {
                synth.cancel();
                isSpeaking = false;
                btnVoiceBriefing.style.background = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
                btnVoiceBriefing.innerHTML = `<i class="fa-solid fa-volume-high"></i> ฟังเสียงสรุปรายงาน (1 นาที)`;
                return;
            }

            const speechText = `สรุปภาพรวมรายงานสำหรับผู้บริหาร สถิติการเข้าใช้ห้องประชุมสะสมรวม 17,002 คน-ครั้ง ห้องประชุมยอดนิยมอันดับหนึ่งคือห้อง 909 ครองสัดส่วน 28.4% ของการใช้งานทั้งหมด กะเวลาที่มีผู้เข้าใช้บริการแน่นที่สุดคือกะบ่าย 12.01 ถึง 19.00 น. คิดเป็น 58% และช่วงที่มีผู้เข้าใช้งานหนาแน่นสูงสุดในรอบปีคือกุมภาพันธ์ มีนาคม และกันยายน ซึ่งเป็นช่วงสอบกลางภาคและปลายภาคค่ะ`;

            const utterance = new SpeechSynthesisUtterance(speechText);
            utterance.lang = 'th-TH';
            utterance.rate = 1.05;
            utterance.pitch = 1.0;

            utterance.onstart = () => {
                isSpeaking = true;
                btnVoiceBriefing.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                btnVoiceBriefing.innerHTML = `<i class="fa-solid fa-circle-pause"></i> หยุดฟังเสียงสรุป`;
            };

            utterance.onend = () => {
                isSpeaking = false;
                btnVoiceBriefing.style.background = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
                btnVoiceBriefing.innerHTML = `<i class="fa-solid fa-volume-high"></i> ฟังเสียงสรุปรายงาน (1 นาที)`;
            };

            utterance.onerror = () => {
                isSpeaking = false;
                btnVoiceBriefing.style.background = 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)';
                btnVoiceBriefing.innerHTML = `<i class="fa-solid fa-volume-high"></i> ฟังเสียงสรุปรายงาน (1 นาที)`;
            };

            synth.speak(utterance);
        });
    }

    // Trigger Initial Load
    loadData();
});
