// ==============================================================================
// CHAUDHARY DEVI LAL UNIVERSITY (CDLU), SIRSA
// 13th TRIVENI YUVA MAHOTSAV 2026 - ADMIN & SUPER ADMIN CONTROLLER
// Complete management: Registered Students, Judge Roles & Emails, Live Scoreboard
// ==============================================================================

const AdminApp = (function() {
    let currentAdmin = null;
    let activeTab = 'overview';
    let pendingCollegeImport = null;

    function loadSavedSession() {
        try {
            const saved = sessionStorage.getItem('cdlu_active_admin');
            if (saved) {
                currentAdmin = JSON.parse(saved);
                renderAdminDashboard();
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function login(email, password) {
        if (!email || !password) {
            Swal.fire({
                icon: 'warning',
                title: 'विवरण भरें',
                text: 'कृपया एडमिन ईमेल और पासवर्ड दर्ज करें।'
            });
            return false;
        }

        const res = DBService.verifyAdmin(email, password);
        if (!res.success) {
            Swal.fire({
                icon: 'error',
                title: 'लॉगिन विफल (Login Failed)',
                text: res.message
            });
            return false;
        }

        currentAdmin = res.admin;
        sessionStorage.setItem('cdlu_active_admin', JSON.stringify(currentAdmin));

        Swal.fire({
            icon: 'success',
            title: 'एडमिन लॉगिन सफल!',
            text: `स्वागत है, ${currentAdmin.name}`,
            timer: 1500,
            showConfirmButton: false
        });

        renderAdminDashboard();
        return true;
    }

    function logout() {
        currentAdmin = null;
        sessionStorage.removeItem('cdlu_active_admin');
        document.getElementById('admin-auth-container').classList.remove('hidden');
        document.getElementById('admin-dashboard-container').classList.add('hidden');
        Swal.fire({
            icon: 'info',
            title: 'एडमिन लॉगआउट सफल',
            timer: 1200,
            showConfirmButton: false
        });
    }

    function switchTab(tabName) {
        const isSuperAdmin = currentAdmin && currentAdmin.role === 'Super Admin';
        if (tabName === 'final-results' && !isSuperAdmin) {
            tabName = 'overview';
        }
        activeTab = tabName;
        // Tab buttons styling
        document.querySelectorAll('.admin-nav-tab').forEach(btn => {
            const restricted = btn.dataset.role === 'super-admin' && !isSuperAdmin;
            if (btn.dataset.tab === tabName) {
                btn.className = `admin-nav-tab${btn.dataset.role === 'super-admin' ? ' super-admin-only' : ''} px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 shadow-md flex items-center gap-2`;
            } else {
                btn.className = `admin-nav-tab${btn.dataset.role === 'super-admin' ? ' super-admin-only' : ''} px-4 py-2.5 rounded-xl font-medium text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition flex items-center gap-2`;
            }
            if (restricted) btn.classList.add('hidden');
        });

        // Tab views display
        document.querySelectorAll('.admin-tab-pane').forEach(pane => {
            pane.classList.add('hidden');
        });
        const target = document.getElementById(`admin-pane-${tabName}`);
        if (target) target.classList.remove('hidden');

        // Render data for active tab
        if (tabName === 'overview') renderOverview();
        else if (tabName === 'students') renderStudentsList();
        else if (tabName === 'judges') renderJudgesManagement();
        else if (tabName === 'scores') renderScoresBoard();
        else if (tabName === 'final-results') renderFinalResultsBoard();
        else if (tabName === 'database') renderDatabaseSettings();
    }

    // Render Admin Shell
    function renderAdminDashboard() {
        if (!currentAdmin) return;

        document.getElementById('admin-auth-container').classList.add('hidden');
        document.getElementById('admin-dashboard-container').classList.remove('hidden');

        document.getElementById('admin-user-display').textContent = currentAdmin.name;
        document.getElementById('admin-role-badge').textContent = currentAdmin.role;
        document.querySelectorAll('.super-admin-only').forEach(button => {
            button.classList.toggle('hidden', currentAdmin.role !== 'Super Admin');
        });

        switchTab(activeTab || 'overview');
    }

    // 1. OVERVIEW TAB
    async function renderOverview() {
        const regs = await DBService.getRegistrations('All');
        const judges = await DBService.getJudges();
        const scores = await DBService.getScores();
        const events = await DBService.getEvents('All');

        // Total Students (including individual + group team members)
        let totalParticipantCount = 0;
        const uniqueColleges = new Set();

        regs.forEach(r => {
            totalParticipantCount += 1; // Primary participant
            if (r.team_members && Array.isArray(r.team_members)) {
                totalParticipantCount += r.team_members.length;
            }
            if (r.college_name) uniqueColleges.add(r.college_name.trim());
        });

        document.getElementById('admin-stat-students').textContent = totalParticipantCount;
        document.getElementById('admin-stat-registrations').textContent = regs.length;
        document.getElementById('admin-stat-colleges').textContent = uniqueColleges.size;
        document.getElementById('admin-stat-judges').textContent = judges.length;
        document.getElementById('admin-stat-judges-scores').textContent = `${judges.length} / ${scores.length}`;

        const catCounts = { Music: 0, Dance: 0, Theatre: 0, Literary: 0, 'Fine Arts': 0, Procession: 0 };
        regs.forEach(r => {
            if (catCounts[r.category] !== undefined) catCounts[r.category]++;
        });
        const categoryContainer = document.getElementById('admin-category-distribution');
        categoryContainer.innerHTML = Object.entries(catCounts).map(([category, count]) => `
            <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-3 text-center">
                <span class="block text-xs font-semibold text-gray-400">${escapeHtml(category)}</span>
                <span class="mt-1 block text-xl font-black text-amber-400">${count}</span>
            </div>
        `).join('');
    }

    // 2. STUDENTS & TEAMS MASTER LIST
    async function renderStudentsList() {
        const categoryFilter = document.getElementById('admin-student-cat-filter');
        const searchInput = document.getElementById('admin-student-search');
        const container = document.getElementById('admin-students-table-container');
        if (!categoryFilter || !searchInput || !container) return;
        const filterCategory = categoryFilter.value;
        const searchQuery = (searchInput.value || '').toLocaleLowerCase().trim();

        const allRegs = await DBService.getRegistrations(filterCategory);
        let filtered = allRegs;

        if (searchQuery) {
            filtered = filtered.filter(r => 
                [r.participant_name, r.college_name, r.roll_no, r.id, r.event_name]
                    .some(value => String(value || '').toLocaleLowerCase().includes(searchQuery))
            );
        }

        container.innerHTML = `
            <div class="mb-3 text-xs font-semibold text-gray-400">${filtered.length} registrations</div>
            <table class="min-w-[1000px] w-full text-left text-xs">
                <thead><tr class="border-b border-gray-700 text-gray-400">
                    <th class="p-3">Registration</th><th class="p-3">Participant / team</th>
                    <th class="p-3">College</th><th class="p-3">Event</th>
                    <th class="p-3">Team size</th><th class="p-3">Status</th><th class="p-3 text-right">Actions</th>
                </tr></thead>
                <tbody id="admin-students-tbody"></tbody>
            </table>`;
        const tbody = container.querySelector('tbody');
        tbody.addEventListener('change', event => {
            const select = event.target.closest('[data-registration-status]');
            if (select) changeStatus(select.dataset.registrationStatus, select.value);
        });
        tbody.addEventListener('click', event => {
            const button = event.target.closest('button[data-registration-action]');
            if (!button) return;
            const { registrationAction: action, registrationId: id } = button.dataset;
            if (action === 'view') viewStudentDetails(id);
            else if (action === 'print') printStudentCard(id);
            else if (action === 'delete') deleteStudent(id);
        });
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center py-10 text-gray-400">कोई रिकॉर्ड नहीं मिला।</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(r => {
            const teamSize = 1 + (r.team_members ? r.team_members.length : 0);
            return `
                <tr class="border-b border-gray-800 hover:bg-gray-800/50 transition">
                    <td class="py-3 px-4 font-mono font-semibold text-amber-300">${escapeHtml(r.id)}</td>
                    <td class="py-3 px-4">
                        <div class="font-bold text-white text-base">${escapeHtml(r.participant_name)}</div>
                        <div class="text-xs text-gray-400">पिता: ${escapeHtml(r.father_name)} • Roll: ${escapeHtml(r.roll_no)}</div>
                    </td>
                    <td class="py-3 px-4">
                        <div class="text-sm text-gray-200 font-medium">${escapeHtml(r.college_name)}</div>
                        <div class="text-xs text-gray-400">${escapeHtml(r.class_name)}</div>
                    </td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-900/50 text-indigo-300 block w-fit mb-1">${escapeHtml(r.category)}</span>
                        <span class="text-xs text-gray-300 font-medium">${escapeHtml(r.event_name)}</span>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${teamSize > 1 ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-800 text-gray-300'}">
                            ${teamSize > 1 ? `टीम (${teamSize})` : 'एकल (Solo)'}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <select data-registration-status="${escapeHtml(r.id)}" class="bg-gray-900 border border-gray-700 text-xs rounded-lg py-1 px-2 font-semibold ${r.status === 'Eligible' ? 'text-emerald-400' : 'text-amber-400'}">
                            <option value="Eligible" ${r.status === 'Eligible' ? 'selected' : ''}>Eligible (पात्र)</option>
                            <option value="Under Review" ${r.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                            <option value="Disqualified" ${r.status === 'Disqualified' ? 'selected' : ''}>Disqualified</option>
                        </select>
                    </td>
                    <td class="py-3 px-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <button data-registration-action="view" data-registration-id="${escapeHtml(r.id)}" class="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-cyan-300 text-xs transition" title="विवरण देखें">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button data-registration-action="print" data-registration-id="${escapeHtml(r.id)}" class="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-amber-300 text-xs transition" title="आई-कार्ड प्रिंट करें">
                                <i class="fas fa-id-card"></i>
                            </button>
                            <button data-registration-action="delete" data-registration-id="${escapeHtml(r.id)}" class="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs transition" title="हटाएं">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    async function changeStatus(id, newStatus) {
        await DBService.updateRegistrationStatus(id, newStatus);
        Swal.fire({
            icon: 'success',
            title: 'स्थिति अपडेट हुई',
            text: `पंजीकरण ${id} को '${newStatus}' के रूप में चिह्नित किया गया।`,
            timer: 1200,
            showConfirmButton: false
        });
    }

    async function deleteStudent(id) {
        const confirm = await Swal.fire({
            title: 'क्या आप सुनिश्चित हैं?',
            text: `पंजीकरण ${id} को हमेशा के लिए हटा दिया जाएगा।`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'हाँ, हटाएं',
            cancelButtonText: 'रद्द करें'
        });

        if (confirm.isConfirmed) {
            try {
                await DBService.deleteRegistration(id);
                Swal.fire('हटाया गया!', 'रिकॉर्ड हटा दिया गया है।', 'success');
                await renderStudentsList();
                await renderOverview();
            } catch (error) {
                console.error('Unable to delete registration:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'रिकॉर्ड नहीं हटाया गया',
                    text: error.message || 'Supabase ने रिकॉर्ड हटाने से इनकार कर दिया।'
                });
            }
        }
    }

    async function viewStudentDetails(id) {
        const reg = await DBService.getRegistrationById(id);
        if (!reg) return;

        let membersHtml = '';
        if (reg.team_members && reg.team_members.length > 0) {
            membersHtml = `
                <div class="mt-4 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                    <h5 class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">टीम के अन्य सदस्य (Team Members):</h5>
                    <ul class="text-xs space-y-1.5 text-gray-300">
                        ${reg.team_members.map((m, i) => `<li>${i + 1}. <strong>${m.name}</strong> (पिता: ${m.father_name || '-'}, Class: ${m.class || '-'}, Roll: ${m.roll_no || '-'})</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        let accompHtml = '';
        if (reg.accompanists && reg.accompanists.length > 0) {
            accompHtml = `
                <div class="mt-4 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                    <h5 class="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">संगतकार (Accompanists):</h5>
                    <ul class="text-xs space-y-1.5 text-gray-300">
                        ${reg.accompanists.map((a, i) => `<li>${i + 1}. <strong>${a.name}</strong> (${a.type || 'Student'}) - ${a.instrument || '-'}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        Swal.fire({
            title: `<span class="text-amber-400">${reg.id}</span>`,
            html: `
                <div class="text-left text-sm text-gray-200 space-y-2">
                    <p><strong>प्रतिभागी का नाम:</strong> ${reg.participant_name} (${reg.gender || 'Not specified'})</p>
                    <p><strong>पिता का नाम:</strong> ${reg.father_name}</p>
                    <p><strong>जन्म तिथि (DOB):</strong> <span class="font-mono text-amber-300 font-bold">${reg.dob || 'N/A'}</span> (पात्रता स्थिति: <span class="text-emerald-400 font-bold">${reg.status || 'Eligible'}</span>)</p>
                    <p><strong>महाविद्यालय / विभाग:</strong> ${reg.college_name}</p>
                    <p><strong>कक्षा व रोल नंबर:</strong> ${reg.class_name} | ${reg.roll_no}</p>
                    <p><strong>इवेंट:</strong> [${reg.category}] ${reg.event_name}</p>
                    <p><strong>संपर्क सूत्र:</strong> ${reg.phone} | ${reg.email}</p>
                    <p><strong>टीम प्रबंधक:</strong> ${reg.team_manager_name || 'N/A'} (${reg.team_manager_phone || 'N/A'})</p>
                    ${membersHtml}
                    ${accompHtml}
                </div>
            `,
            confirmButtonText: 'बंद करें',
            confirmButtonColor: '#d97706'
        });
    }

    function printStudentCard(id) {
        window.App.openPrintCardModal(id);
    }

    function exportStudentsCSV() {
        DBService.getRegistrations('All').then(regs => {
            if (!regs || regs.length === 0) {
                Swal.fire('कोई डेटा नहीं', 'निर्यात के लिए कोई डेटा नहीं है।', 'info');
                return;
            }

            let csv = 'Registration ID,Participant Name,Father Name,Gender,DOB,College,Class,Roll No,Category,Event Name,Phone,Email,Status\n';
            regs.forEach(r => {
                csv += `"${r.id}","${r.participant_name}","${r.father_name}","${r.gender}","${r.dob || ''}","${r.college_name}","${r.class_name}","${r.roll_no}","${r.category}","${r.event_name}","${r.phone}","${r.email}","${r.status}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CDLU_13th_Triveni_Registrations_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
        });
    }

    // 3. JUDGES MANAGEMENT (DECIDE ROLES & UNIQUE EMAILS)
    async function renderJudgesManagement() {
        const judges = await DBService.getJudges();
        const container = document.getElementById('admin-judges-grid');
        if (!container) return;
        const allEvents = await DBService.getEvents('All');
        const eventFilter = document.getElementById('admin-judge-event-filter');
        const selectedEventId = eventFilter ? eventFilter.value : '';

        if (eventFilter && eventFilter.options.length === 1) {
            allEvents.forEach(event => {
                const option = document.createElement('option');
                option.value = event.id;
                option.textContent = `[${event.category}] ${event.name}`;
                eventFilter.appendChild(option);
            });
        }

        const visibleJudges = selectedEventId
            ? judges.filter(judge =>
                (judge.assigned_events || []).includes(selectedEventId) ||
                (judge.assigned_categories || []).includes(
                    (allEvents.find(event => event.id === selectedEventId) || {}).category
                )
            )
            : judges;

        if (visibleJudges.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-400">कोई जज अभी अधिकृत नहीं किया गया है। ऊपर दिए बटन से जज जोड़ें।</div>';
            return;
        }

        container.innerHTML = visibleJudges.map(j => `
            <div class="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-4 hover:border-amber-500/50 transition flex flex-col gap-4 min-w-0">
                <div class="flex items-start gap-3 min-w-0">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-gray-950 font-black text-xl flex items-center justify-center shrink-0">
                        ${j.name.charAt(0)}
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <h4 class="text-base font-bold text-white break-words">${j.name}</h4>
                            <span class="px-2 py-0.5 rounded text-xs font-bold ${j.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
                                ${j.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p class="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-1 rounded-lg w-full mb-1.5 flex items-start gap-1.5 break-all">
                            <i class="fas fa-envelope mt-0.5 shrink-0"></i> <span><strong>असाइन की गई ईमेल:</strong> ${j.email}</span>
                        </p>
                        <p class="text-xs text-gray-300">${j.organization || 'Affiliated Expert'}</p>
                        <div class="flex flex-wrap items-center gap-1.5 mt-2">
                            <span class="text-xs text-gray-400">असाइन श्रेणियां (Roles):</span>
                            ${(j.assigned_categories || []).map(c => `
                                <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                                    ${c}
                                </span>
                            `).join('')}
                        </div>
                        ${(j.assigned_events || []).length ? `
                            <div class="flex flex-wrap items-center gap-1.5 mt-2">
                                <span class="text-xs text-gray-400">विशिष्ट इवेंट:</span>
                                ${(j.assigned_events || []).map(eventId => {
                                    const event = allEvents.find(item => item.id === eventId);
                                    return event ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">${event.name}</span>` : '';
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="flex items-center gap-2 pt-3 border-t border-gray-700/80 w-full">
                    <button onclick="AdminApp.openEditJudgeModal('${j.id}')" title="Edit judge" aria-label="Edit ${j.name}" class="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm">
                        <i class="fas fa-pen-to-square"></i> Edit
                    </button>
                    <button onclick="AdminApp.deleteJudge('${j.id}')" title="Remove judge" aria-label="Remove ${j.name}" class="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-1.5">
                        <i class="fas fa-trash-can"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }

    function openAddJudgeModal() {
        document.getElementById('judge-modal-title').textContent = 'नया जज जोड़ें (Add Authorized Judge)';
        document.getElementById('judge-form-id').value = '';
        document.getElementById('judge-form-name').value = '';
        document.getElementById('judge-form-email').value = '';
        document.getElementById('judge-form-org').value = '';
        document.getElementById('judge-form-phone').value = '';
        document.getElementById('judge-form-pin').value = '1234';
        populateJudgeRosterSelect('');

        // Uncheck all categories
        document.querySelectorAll('.judge-cat-checkbox').forEach(cb => cb.checked = false);
        loadJudgeEventCheckboxes([]);

        document.getElementById('judge-crud-modal').classList.remove('hidden');
    }

    async function openEditJudgeModal(judgeId) {
        const judges = await DBService.getJudges();
        const judge = judges.find(j => j.id === judgeId);
        if (!judge) return;

        document.getElementById('judge-modal-title').textContent = 'जज विवरण व भूमिकाएं एडिट करें';
        document.getElementById('judge-form-id').value = judge.id;
        document.getElementById('judge-form-name').value = judge.name;
        document.getElementById('judge-form-email').value = judge.email;
        document.getElementById('judge-form-org').value = judge.organization || '';
        document.getElementById('judge-form-phone').value = judge.phone || '';
        document.getElementById('judge-form-pin').value = judge.pin || '1234';
        populateJudgeRosterSelect(judge.name);

        const assignedCats = judge.assigned_categories || [];
        document.querySelectorAll('.judge-cat-checkbox').forEach(cb => {
            cb.checked = assignedCats.includes(cb.value);
        });
        loadJudgeEventCheckboxes(judge.assigned_events || []);

        document.getElementById('judge-crud-modal').classList.remove('hidden');
    }

    function populateJudgeRosterSelect(selectedName) {
        const select = document.getElementById('judge-form-roster');
        if (!select) return;
        const roster = DBService.getOfficialJudgeDirectory();
        select.innerHTML = '<option value="">-- सूची से जज चुनें या नीचे नया नाम लिखें --</option>' +
            roster.map(judge =>
                `<option value="${judge.id}" ${judge.name === selectedName ? 'selected' : ''}>${judge.name}</option>`
            ).join('');
    }

    function selectJudgeFromRoster(judgeId) {
        if (!judgeId) return;
        const judge = DBService.getOfficialJudgeDirectory().find(item => item.id === judgeId);
        if (!judge) return;
        document.getElementById('judge-form-name').value = judge.name;
        document.getElementById('judge-form-email').value = judge.email;
        document.getElementById('judge-form-org').value = judge.organization;
        document.getElementById('judge-form-phone').value = judge.phone || '';
        document.getElementById('judge-form-pin').value = judge.pin || '1234';
    }

    async function loadJudgeEventCheckboxes(selectedEventIds) {
        const container = document.getElementById('judge-event-checkboxes');
        if (!container) return;
        const events = await DBService.getEvents('All');
        container.innerHTML = events.map(event => `
            <label class="flex items-start gap-2 bg-gray-900/80 p-2 rounded-lg cursor-pointer hover:bg-gray-800">
                <input type="checkbox" value="${event.id}" class="judge-event-checkbox accent-amber-500 mt-0.5" ${selectedEventIds.includes(event.id) ? 'checked' : ''} />
                <span class="leading-tight"><strong class="text-gray-200">${event.name}</strong><small class="block text-[10px] text-gray-500">${event.category} · ${event.id}</small></span>
            </label>
        `).join('');
    }

    async function saveJudgeForm(e) {
        if (e) e.preventDefault();

        const id = document.getElementById('judge-form-id').value;
        const name = document.getElementById('judge-form-name').value.trim();
        const email = document.getElementById('judge-form-email').value.trim().toLowerCase();
        const org = document.getElementById('judge-form-org').value.trim();
        const phone = document.getElementById('judge-form-phone').value.trim();
        const pin = document.getElementById('judge-form-pin').value.trim() || '1234';

        const checkedCats = [];
        document.querySelectorAll('.judge-cat-checkbox:checked').forEach(cb => {
            checkedCats.push(cb.value);
        });
        const checkedEvents = [];
        document.querySelectorAll('.judge-event-checkbox:checked').forEach(cb => {
            checkedEvents.push(cb.value);
        });

        if (!name || !email) {
            Swal.fire('आवश्यक', 'नाम और अद्वितीय ईमेल अनिवार्य हैं।', 'warning');
            return;
        }

        if (checkedCats.length === 0) {
            Swal.fire('भूमिका चुनें', 'कृपया जज के लिए कम से कम एक श्रेणी (Role/Category) चुनें।', 'warning');
            return;
        }

        try {
            if (id) {
                // Update
                await DBService.updateJudge(id, {
                    name,
                    email,
                    organization: org,
                    phone,
                    pin,
                    assigned_categories: checkedCats,
                    assigned_events: checkedEvents
                });
                Swal.fire('सफल!', 'जज विवरण अपडेट कर दिया गया है।', 'success');
            } else {
                // Add new
                await DBService.addJudge({
                    name,
                    email,
                    organization: org,
                    phone,
                    pin,
                    assigned_categories: checkedCats,
                    assigned_events: checkedEvents,
                    is_active: true
                });
                Swal.fire('सफल!', `जज '${name}' (${email}) सफलतापूर्वक जोड़ा गया।`, 'success');
            }

            closeJudgeModal();
            renderJudgesManagement();
            renderOverview();
        } catch (err) {
            Swal.fire('त्रुटि', err.message, 'error');
        }
    }

    function closeJudgeModal() {
        document.getElementById('judge-crud-modal').classList.add('hidden');
    }

    async function deleteJudge(id) {
        const confirm = await Swal.fire({
            title: 'जज को हटाएं?',
            text: 'यह जज अब लॉगिन नहीं कर पाएगा।',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'हटाएं',
            cancelButtonText: 'रद्द करें'
        });

        if (confirm.isConfirmed) {
            await DBService.deleteJudge(id);
            Swal.fire('हटाया गया!', 'जज अकाउंट हटा दिया गया।', 'success');
            renderJudgesManagement();
            renderOverview();
        }
    }

    // 4. SCORES & EVALUATION LEADERBOARD
    async function renderScoresBoard() {
        const isSuperAdmin = currentAdmin && currentAdmin.role === 'Super Admin';
        const eventSelect = document.getElementById('admin-score-event-filter');
        const selectedEvent = eventSelect.value || '';

        // Populate event options if needed
        if (eventSelect.children.length <= 1) {
            const allEvents = await DBService.getEvents('All');
            allEvents.forEach(evt => {
                const opt = document.createElement('option');
                opt.value = evt.id;
                opt.textContent = `[${evt.category}] ${evt.name}`;
                eventSelect.appendChild(opt);
            });
        }

        const leaderboard = await DBService.getLeaderboard(selectedEvent || null);
        const container = document.getElementById('admin-scoreboard-list');

        if (leaderboard.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-gray-400">इस इवेंट के लिए कोई पंजीकरण या स्कोर उपलब्ध नहीं है।</div>';
            return;
        }

        container.innerHTML = leaderboard.map((item, idx) => {
            const reg = item.registration;
            const hasScores = isSuperAdmin && item.judgeScores && item.judgeScores.length > 0;

            // Ranks badge
            let rankBadge = '';
            if (item.avgScore > 0) {
                if (idx === 0) rankBadge = '<span class="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-950 flex items-center gap-1 shadow-md shadow-amber-500/20"><i class="fas fa-crown"></i> 1st Winner</span>';
                else if (idx === 1) rankBadge = '<span class="px-3 py-1 rounded-full text-xs font-black bg-slate-300 text-gray-950 flex items-center gap-1"><i class="fas fa-medal"></i> 2nd Runner-up</span>';
                else if (idx === 2) rankBadge = '<span class="px-3 py-1 rounded-full text-xs font-black bg-amber-700 text-white flex items-center gap-1"><i class="fas fa-award"></i> 3rd Place</span>';
                else rankBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-800 text-gray-300">Rank ${idx + 1}</span>`;
            } else {
                rankBadge = '<span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400">मूल्यांकन लंबित</span>';
            }

            // Calculate if group or solo for max marks
            const isGroup = (reg.team_members && reg.team_members.length > 0) || (reg.participants_count && reg.participants_count > 1);
            const eventMaxScore = isGroup ? 20 : 10;

            // Judge scores breakdown pills
            let judgeScoresHtml = '';
            if (hasScores) {
                judgeScoresHtml = `
                    <div class="mt-3 pt-3 border-t border-gray-800 flex flex-wrap items-center gap-3">
                        <span class="text-xs text-gray-400 font-semibold">जज अनुसार स्कोर (Judge Breakdown):</span>
                        ${item.judgeScores.map(js => `
                            <div class="bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                                <span class="text-gray-300 font-medium">${js.judge_name}:</span>
                                <span class="font-black text-amber-400 text-sm">${js.total_score} / ${js.max_score || eventMaxScore}</span>
                                ${js.remarks ? `<button onclick="AdminApp.viewJudgeRemarks('${js.judge_name}', '${js.remarks.replace(/'/g, "\\'")}')" class="text-cyan-400 hover:underline text-[10px]" title="टिप्पणी देखें"><i class="fas fa-comment-dots"></i></button>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            return `
                <div class="bg-gray-800/80 border ${idx === 0 && item.avgScore > 0 ? 'border-amber-500/50 bg-amber-950/10' : 'border-gray-700'} rounded-2xl p-5 hover:border-gray-600 transition shadow-lg">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div class="flex items-start gap-4">
                            <div class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 ${idx === 0 && item.avgScore > 0 ? 'bg-amber-500 text-gray-950' : 'bg-gray-700 text-white'}">
                                ${idx + 1}
                            </div>
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="font-mono text-xs text-amber-300 font-bold">${reg.id}</span>
                                    <span class="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-900/40 text-indigo-300">${reg.category}</span>
                                    <span class="px-2 py-0.5 rounded text-xs font-bold ${isGroup ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}">
                                        ${isGroup ? 'समूह (Max 20)' : 'एकल (Max 10)'}
                                    </span>
                                    ${rankBadge}
                                </div>
                                <h4 class="text-lg font-bold text-white">${reg.participant_name}</h4>
                                <p class="text-sm text-gray-300">${reg.college_name}</p>
                                <p class="text-xs text-gray-400 mt-1"><i class="fas fa-music text-amber-400 mr-1"></i> ${reg.event_name}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-6 shrink-0 self-end md:self-center">
                            <div class="text-right">
                                <span class="text-xs text-gray-400 block font-semibold">${isSuperAdmin ? 'औसत स्कोर (Average)' : 'स्थिति (Position)'}</span>
                                ${isSuperAdmin ? `
                                    <span class="text-3xl font-black ${item.avgScore > 0 ? 'text-amber-400' : 'text-gray-500'}">
                                        ${item.avgScore > 0 ? item.avgScore : '--'}
                                        <span class="text-xs text-gray-400 font-normal"> / ${eventMaxScore}</span>
                                    </span>
                                    <span class="text-[11px] text-gray-400 block">${item.judgeCount} जजों द्वारा मूल्यांकित</span>
                                ` : `
                                    <span class="text-2xl font-black ${item.avgScore > 0 ? 'text-amber-300' : 'text-gray-500'}">
                                        ${item.avgScore > 0 ? (idx + 1) : '--'}
                                    </span>
                                    <span class="text-[11px] text-gray-400 block">Scores hidden from Admin</span>
                                `}
                            </div>
                        </div>
                    </div>

                    ${judgeScoresHtml}
                </div>
            `;
        }).join('');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    function normalizeResultKey(value) {
        return String(value == null ? '' : value).trim().toLocaleLowerCase();
    }

    function getFinalResultsRows(registrations, scores, judges, filters = {}) {
        const rows = registrations.map(registration => {
            const finalizedScores = scores.filter(score =>
                score.registration_id === registration.id &&
                score.event_id === registration.event_id &&
                score.is_locked === true
            );
            const submittedJudgeIds = new Set(finalizedScores.map(score =>
                normalizeResultKey(score.judge_email || score.judge_id)
            ));
            const expectedJudgeCount = 3;
            const isComplete = submittedJudgeIds.size === expectedJudgeCount;
            const teamNames = [
                registration.participant_name,
                ...(Array.isArray(registration.team_members)
                    ? registration.team_members.map(member => member && member.name).filter(Boolean)
                    : [])
            ].filter(Boolean);

            return {
                registration,
                category: registration.category || 'Uncategorized',
                college: registration.college_name || 'College not recorded',
                participants: [...new Set(teamNames)],
                scores: finalizedScores,
                total: finalizedScores.reduce((sum, score) => sum + (Number(score.total_score) || 0), 0),
                expectedJudgeCount,
                isComplete
            };
        }).filter(row => {
            if (filters.category && filters.category !== 'All' &&
                normalizeResultKey(row.category) !== normalizeResultKey(filters.category)) return false;
            if (filters.college && filters.college !== 'All' &&
                normalizeResultKey(row.college) !== normalizeResultKey(filters.college)) return false;
            if (filters.eventId && filters.eventId !== 'All' &&
                row.registration.event_id !== filters.eventId) return false;
            if (filters.status === 'Finalized' && !row.isComplete) return false;
            if (filters.status === 'Pending' && row.isComplete) return false;
            if (filters.search) {
                const teamNames = Array.isArray(row.registration.team_members)
                    ? row.registration.team_members.map(member => member && member.name).filter(Boolean)
                    : [];
                const searchable = [
                    row.registration.id,
                    row.registration.chest_number,
                    row.registration.roll_no,
                    row.registration.participant_name,
                    row.registration.event_name,
                    row.category,
                    row.college,
                    ...teamNames
                ].map(normalizeResultKey).join(' ');
                if (!searchable.includes(normalizeResultKey(filters.search))) return false;
            }
            return true;
        });
        const eventCollegeResults = new Map();
        rows.forEach(row => {
            const key = `${normalizeResultKey(row.registration.event_id)}\u0000${normalizeResultKey(row.college)}`;
            const current = eventCollegeResults.get(key);
            if (!current || row.total > current.total) eventCollegeResults.set(key, {
                eventId: row.registration.event_id,
                eventName: row.registration.event_name || row.registration.event_id,
                category: row.category,
                college: row.college,
                total: row.total,
                isComplete: row.isComplete,
                row
            });
        });
        const byEvent = new Map();
        eventCollegeResults.forEach(result => {
            if (!byEvent.has(result.eventId)) byEvent.set(result.eventId, []);
            byEvent.get(result.eventId).push(result);
        });
        const collegeTotals = new Map();
        eventCollegeResults.forEach(result => {
            if (!collegeTotals.has(result.college)) collegeTotals.set(result.college, {
                category: 'All categories',
                college: result.college,
                entries: [],
                events: new Set(),
                participants: new Set(),
                total: 0,
                trophyScore: 0,
                eligibleEvents: 0,
                judgeSubmissions: 0,
                completedEntries: 0,
                pendingEntries: 0
            });
            const summary = collegeTotals.get(result.college);
            summary.events.add(result.eventId);
            summary.entries.push(result.row);
            summary.total += result.isComplete ? result.total : 0;
            summary.eligibleEvents += result.isComplete ? 1 : 0;
            summary.trophyScore += result.trophyPoints || 0;
            summary.judgeSubmissions += result.row.scores.length;
            result.row.participants.forEach(name => summary.participants.add(normalizeResultKey(name)));
        });
        byEvent.forEach(results => {
            results.sort((a, b) => Number(b.isComplete) - Number(a.isComplete) || b.total - a.total || a.college.localeCompare(b.college));
            let position = 0;
            let previousTotal = null;
            results.forEach(result => {
                if (!result.isComplete) {
                    result.position = null;
                    result.trophyPoints = 0;
                    return;
                }
                position += 1;
                result.position = position;
                result.trophyPoints = result.total === previousTotal ? results[position - 2].trophyPoints : ({ 1: 10, 2: 8, 3: 5 }[position] || 0);
                previousTotal = result.total;
                const summary = collegeTotals.get(result.college);
                summary.trophyScore += result.trophyPoints;
            });
        });
        const summaries = Array.from(collegeTotals.values()).map(summary => {
            summary.averageTrophyPoints = summary.eligibleEvents ? summary.trophyScore / summary.eligibleEvents : null;
            summary.pendingEntries = summary.entries.filter(entry => !entry.isComplete).length;
            return summary;
        }).sort((a, b) =>
            Number(b.pendingEntries > 0) - Number(a.pendingEntries > 0) ||
            (b.averageTrophyPoints || 0) - (a.averageTrophyPoints || 0) ||
            b.trophyScore - a.trophyScore ||
            a.college.localeCompare(b.college)
        );
        let previousScoredTotal = null;
        let previousRank = 0;
        let scoredPosition = 0;
        summaries.forEach(summary => {
            if (summary.pendingEntries > 0 || summary.eligibleEvents === 0) {
                summary.rank = null;
                summary.trophyScore = null;
                return;
            }
            scoredPosition += 1;
            summary.rank = summary.averageTrophyPoints === previousScoredTotal ? previousRank : scoredPosition;
            previousScoredTotal = summary.averageTrophyPoints;
            previousRank = summary.rank;
        });

        rows.forEach(row => {
            const result = eventCollegeResults.get(`${normalizeResultKey(row.registration.event_id)}\u0000${normalizeResultKey(row.college)}`);
            row.position = result && result.row === row ? result.position : null;
            row.trophyPoints = result && result.row === row ? result.trophyPoints : 0;
        });

        return { rows, summaries };
    }

    async function renderFinalResultsBoard() {
        if (!currentAdmin || currentAdmin.role !== 'Super Admin') return;
        const summaryContainer = document.getElementById('admin-final-results-summary');
        const detailsContainer = document.getElementById('admin-final-results-details');
        const progressContainer = document.getElementById('admin-final-results-progress');
        const categoryFilter = document.getElementById('admin-final-category-filter');
        const collegeFilter = document.getElementById('admin-final-college-filter');
        const eventFilter = document.getElementById('admin-final-event-filter');
        const statusFilter = document.getElementById('admin-final-status-filter');
        const searchInput = document.getElementById('admin-final-search');
        if (!summaryContainer || !detailsContainer || !progressContainer ||
            !categoryFilter || !collegeFilter || !eventFilter || !statusFilter || !searchInput) return;

        summaryContainer.innerHTML = '<p class="p-6 text-center text-gray-400">Final scores are loading...</p>';
        try {
            const [registrations, scores] = await Promise.all([
                DBService.getRegistrations('All'),
                DBService.getScores()
            ]);
            const judges = await DBService.getJudges();
            const allData = getFinalResultsRows(registrations, scores, judges);
            const selectedCategory = categoryFilter.value || 'All';
            const previousCollege = collegeFilter.value || 'All';
            const previousEvent = eventFilter.value || 'All';
            const colleges = [...new Set(allData.summaries
                .filter(summary => selectedCategory === 'All' ||
                    normalizeResultKey(summary.category) === normalizeResultKey(selectedCategory))
                .map(summary => summary.college))]
                .sort((a, b) => a.localeCompare(b));
            collegeFilter.innerHTML = '<option value="All">सभी महाविद्यालय</option>' +
                colleges.map(college => `<option value="${escapeHtml(college)}">${escapeHtml(college)}</option>`).join('');
            collegeFilter.value = colleges.includes(previousCollege) ? previousCollege : 'All';

            const eventOptions = [...new Map(allData.rows
                .filter(row => selectedCategory === 'All' ||
                    normalizeResultKey(row.category) === normalizeResultKey(selectedCategory))
                .map(row => [row.registration.event_id, {
                    id: row.registration.event_id,
                    name: row.registration.event_name || row.registration.event_id
                }])).values()].sort((a, b) => a.name.localeCompare(b.name));
            eventFilter.innerHTML = '<option value="All">सभी कार्यक्रम</option>' +
                eventOptions.map(event => `<option value="${escapeHtml(event.id)}">${escapeHtml(event.name)}</option>`).join('');
            eventFilter.value = eventOptions.some(event => event.id === previousEvent) ? previousEvent : 'All';

            const filteredData = getFinalResultsRows(registrations, scores, judges, {
                category: selectedCategory,
                college: collegeFilter.value,
                eventId: eventFilter.value,
                status: statusFilter.value,
                search: searchInput.value.trim()
            });
            const { rows: filteredRows, summaries: filteredSummaries } = filteredData;
            const orderedRows = [...filteredRows].sort((a, b) =>
                normalizeResultKey(a.category).localeCompare(normalizeResultKey(b.category)) ||
                a.college.localeCompare(b.college) ||
                String(a.registration.event_name || '').localeCompare(String(b.registration.event_name || ''))
            );
            const finalizedEntryCount = filteredRows.filter(row => row.isComplete).length;
            const pendingEntryCount = filteredRows.length - finalizedEntryCount;
            const completion = filteredRows.length
                ? Math.round((finalizedEntryCount / filteredRows.length) * 100)
                : 0;
            progressContainer.innerHTML = `
                <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                    <span class="text-xs font-semibold text-gray-400">Entries in this view</span>
                    <strong class="mt-1 block text-2xl font-black text-white">${filteredRows.length}</strong>
                </div>
                <div class="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4">
                    <span class="text-xs font-semibold text-gray-400">Entries with locked scores</span>
                    <strong class="mt-1 block text-2xl font-black text-emerald-400">${finalizedEntryCount}</strong>
                </div>
                <div class="rounded-xl border border-amber-800/50 bg-amber-950/20 p-4">
                    <span class="text-xs font-semibold text-gray-400">Pending · ${completion}% finalized</span>
                    <strong class="mt-1 block text-2xl font-black text-amber-400">${pendingEntryCount}</strong>
                    <span class="mt-2 block h-1.5 overflow-hidden rounded-full bg-gray-800"><span class="block h-full rounded-full bg-emerald-500" style="width:${completion}%"></span></span>
                </div>
            `;

            summaryContainer.innerHTML = filteredSummaries.length ? `
                <table class="final-results-table">
                    <caption>College trophy standings · 10 / 8 / 5 event points</caption>
                    <thead><tr><th>Rank</th><th>College ID</th><th>College</th><th>Eligible events</th><th>Participants</th><th>Total trophy points</th><th>Average trophy points</th><th>Judge submissions</th></tr></thead>
                    <tbody>${filteredSummaries.map(summary => `
                        <tr>
                            <td>${summary.rank == null ? 'Pending evaluation' : `${summary.rank}${summary.rank <= 3 ? ' 🏆' : ''}`}</td>
                            <td>${summary.entries[0] && summary.entries[0].registration.college_id ? escapeHtml(summary.entries[0].registration.college_id) : '—'}</td>
                            <td>${escapeHtml(summary.college)}</td>
                            <td>${summary.eligibleEvents}</td>
                            <td>${summary.participants.size}</td>
                            <td class="font-bold text-amber-400">${summary.rank != null ? summary.trophyScore : '—'}</td>
                            <td class="font-bold">${summary.rank != null ? summary.averageTrophyPoints.toFixed(2) : '—'}</td>
                            <td>${summary.judgeSubmissions}</td>
                        </tr>
                    `).join('')}</tbody>
                </table>
                <p class="final-results-note">A college is ranked only when every event result in the selected view has all three locked judge scores. Trophy points: 1st = 10, 2nd = 8, 3rd = 5. Ties must be resolved before publication.</p>
            ` : '<p class="p-6 text-center text-gray-400">No registered college entries match these filters.</p>';

            detailsContainer.innerHTML = orderedRows.length ? `
                <table class="final-results-table">
                    <caption>Event-wise results · combined score, position and trophy points</caption>
                    <thead><tr><th>Category</th><th>College</th><th>Event</th><th>Team / registration</th><th>Participants</th><th>Judge score breakdown</th><th>Combined score</th><th>Position</th><th>Trophy points</th><th>Status</th></tr></thead>
                    <tbody>${orderedRows.map(row => `
                        <tr>
                            <td>${escapeHtml(row.category)}</td>
                            <td>${escapeHtml(row.college)}${row.registration.college_id ? `<br><small>ID: ${escapeHtml(row.registration.college_id)}</small>` : ''}</td>
                            <td>${escapeHtml(row.registration.event_name || row.registration.event_id)}</td>
                            <td>${escapeHtml(row.registration.id)}${row.registration.chest_number ? `<br>Chest: ${escapeHtml(row.registration.chest_number)}` : ''}</td>
                            <td>${row.participants.map(escapeHtml).join('<br>') || '—'}</td>
                            <td>${row.scores.length ? row.scores.map(score =>
                                `${escapeHtml(score.judge_name || score.judge_email)}: ${Number(score.total_score).toFixed(2)}`
                            ).join('<br>') : 'No locked score'}</td>
                                <td class="font-bold">${row.isComplete ? row.total.toFixed(2) : `Pending (${row.scores.length}/${row.expectedJudgeCount} judges)`}</td>
                                <td>${row.position == null ? 'Pending' : row.position}</td>
                                <td class="font-bold text-amber-400">${row.isComplete ? row.trophyPoints : '—'}</td>
                                <td>${row.isComplete ? 'Finalized' : 'Pending'}</td>
                        </tr>
                    `).join('')}</tbody>
                </table>
            ` : '<p class="p-6 text-center text-gray-400">No registered event entries match these filters.</p>';
        } catch (error) {
            console.error('Unable to load final results:', error);
            summaryContainer.innerHTML = '<p class="p-6 text-center text-rose-300">Could not load final results. Check the database connection and try again.</p>';
            detailsContainer.innerHTML = '';
        }
    }

    async function exportFinalResultsExcel() {
        if (!currentAdmin || currentAdmin.role !== 'Super Admin') return;
        try {
            const [registrations, scores] = await Promise.all([
                DBService.getRegistrations('All'),
                DBService.getScores()
            ]);
            const judges = await DBService.getJudges();
            const selectedCategory = document.getElementById('admin-final-category-filter').value || 'All';
            const selectedCollege = document.getElementById('admin-final-college-filter').value || 'All';
            const { rows: selectedRows, summaries: selectedSummaries } = getFinalResultsRows(
                registrations,
                scores,
                judges,
                {
                    category: selectedCategory,
                    college: selectedCollege,
                    eventId: document.getElementById('admin-final-event-filter').value || 'All',
                    status: document.getElementById('admin-final-status-filter').value || 'All',
                    search: document.getElementById('admin-final-search').value.trim()
                }
            );
            const xmlEscape = value => String(value == null ? '' : value)
                .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
            const worksheet = (name, data) => `
                <Worksheet ss:Name="${xmlEscape(name)}"><Table>
                    ${data.map(row => `<Row>${row.map(value => {
                        const type = typeof value === 'number' && Number.isFinite(value) ? 'Number' : 'String';
                        return `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
                    }).join('')}</Row>`).join('')}
                </Table></Worksheet>`;
            const summaryData = [
                ['Rank', 'College ID', 'College', 'Eligible event count', 'Participant count', 'Total trophy points', 'Average trophy points', 'Judge submissions'],
                ...selectedSummaries.map(summary => [
                    summary.rank == null ? 'Pending' : summary.rank,
                    summary.entries[0] && summary.entries[0].registration.college_id || '',
                    summary.college, summary.eligibleEvents, summary.participants.size,
                    summary.rank != null ? summary.trophyScore : '',
                    summary.rank != null ? Number(summary.averageTrophyPoints.toFixed(2)) : '',
                    summary.judgeSubmissions
                ])
            ];
            const detailData = [
                ['Category', 'College', 'Event', 'Registration ID', 'Chest number', 'Participants', 'Judge score breakdown', 'Combined score', 'Position', 'Trophy points', 'Status'],
                ...selectedRows.map(row => [
                    row.category, row.college, row.registration.event_name || row.registration.event_id,
                    row.registration.id, row.registration.chest_number || '',
                    row.participants.join('; '),
                    row.scores.map(score => `${score.judge_name || score.judge_email}: ${Number(score.total_score).toFixed(2)}`).join('; '),
                    row.isComplete ? Number(row.total.toFixed(2)) : `Pending (${row.scores.length}/${row.expectedJudgeCount} judges)`,
                    row.position == null ? 'Pending' : row.position,
                    row.isComplete ? row.trophyPoints : '',
                    row.isComplete ? 'Finalized' : 'Pending'
                ])
            ];
            const workbook = `<?xml version="1.0"?>
                <?mso-application progid="Excel.Sheet"?>
                <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
                    ${worksheet('College Summary', summaryData)}
                    ${worksheet('Event Scores', detailData)}
                </Workbook>`;
            const blob = new Blob(['\ufeff', workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'CDLU-Triveni-Yuva-Mahotsav-2026-Results.xls';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('Unable to export final results:', error);
            Swal.fire('Export failed', 'Final results could not be exported. Please retry.', 'error');
        }
    }

    function printFinalResults() {
        if (!currentAdmin || currentAdmin.role !== 'Super Admin') return;
        window.print();
    }

    async function declareFinalResults() {
        if (!currentAdmin || currentAdmin.role !== 'Super Admin') return;
        const selectedCollege = document.getElementById('admin-final-college-filter').value || 'All';
        const eventId = document.getElementById('admin-final-event-filter').value || 'All';
        const status = document.getElementById('admin-final-status-filter').value || 'All';
        const search = document.getElementById('admin-final-search').value.trim();
        if (selectedCollege !== 'All' || status !== 'All' || search) {
            Swal.fire({
                icon: 'warning',
                title: 'Broaden the results view',
                text: 'To declare fair standings, reset the college filter, status filter, and search field first.'
            });
            return;
        }

        try {
            const [registrations, scores, judges] = await Promise.all([
                DBService.getRegistrations('All'),
                DBService.getScores(),
                DBService.getJudges()
            ]);
            const category = document.getElementById('admin-final-category-filter').value || 'All';
            const { rows, summaries } = getFinalResultsRows(registrations, scores, judges, {
                category,
                eventId
            });
            if (!summaries.length) {
                Swal.fire('No results to declare', 'No registered entries match this category and event.', 'info');
                return;
            }

            const pendingRows = rows.filter(row => !row.isComplete);
            if (pendingRows.length) {
                const pendingColleges = [...new Set(pendingRows.map(row => row.college))];
                Swal.fire({
                    icon: 'warning',
                    title: 'Results are not ready',
                    html: `${pendingRows.length} entries still need scores from all three judges.<br><br><strong>${pendingColleges.slice(0, 8).map(escapeHtml).join('<br>')}</strong>${pendingColleges.length > 8 ? '<br>…' : ''}`
                });
                return;
            }

            const unresolvedTie = summaries.some((summary, index) =>
                index > 0 && summary.rank != null && summary.averageTrophyPoints === summaries[index - 1].averageTrophyPoints
            );
            if (unresolvedTie) {
                Swal.fire('Results are not ready', 'Overall ties must be resolved before publication.', 'warning');
                return;
            }
            const winners = summaries
                .filter(summary => summary.rank != null && summary.rank <= 3)
                .map(summary => `<li><strong>${summary.rank}.</strong> ${escapeHtml(summary.college)} — ${summary.trophyScore} trophy points (${summary.averageTrophyPoints.toFixed(2)} average)</li>`)
                .join('');
            const confirmation = await Swal.fire({
                icon: 'success',
                title: 'Ready to declare',
                html: `<p class="mb-3">All entries in the selected result view are finalized. Review the winners, then confirm to print the official result sheet.</p><ol class="text-left">${winners}</ol>`,
                showCancelButton: true,
                confirmButtonText: 'Declare and print',
                cancelButtonText: 'Review results'
            });
            if (confirmation.isConfirmed) window.print();
        } catch (error) {
            console.error('Unable to declare final results:', error);
            Swal.fire('Declaration failed', 'Results could not be verified. Check the database connection and try again.', 'error');
        }
    }

    function viewJudgeRemarks(judgeName, remarks) {
        Swal.fire({
            title: `<span class="text-sm text-gray-400 font-normal">${judgeName} की टिप्पणी</span>`,
            text: remarks || 'कोई विशेष टिप्पणी नहीं।',
            icon: 'info',
            confirmButtonColor: '#d97706'
        });
    }

    function printOfficialAwardSheet() {
        window.print();
    }

    // 5. DATABASE SETTINGS & 1-CLICK SUPABASE SETUP SCRIPT
    function renderDatabaseSettings() {
        const cloud = DBService.getCloudStatus();
        const statusBadge = document.getElementById('admin-db-status-badge');
        if (!statusBadge) return;
        if (cloud.isCloudConnected) {
            statusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
            statusBadge.textContent = 'Supabase Cloud Connected';
        } else {
            statusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40';
            statusBadge.textContent = 'Local cache / cloud unavailable';
        }
    }

    async function testCloudConnection() {
        try {
            const status = await DBService.init();
            renderDatabaseSettings();
            Swal.fire({
                icon: status.connected ? 'success' : 'warning',
                title: status.connected ? 'Cloud connected' : status.schemaPending ? 'Database setup required' : 'Cloud unavailable',
                text: status.message
            });
        } catch (error) {
            console.error('Cloud connection check failed:', error);
            Swal.fire('Connection check failed', error.message || 'Could not verify the database connection.', 'error');
        }

        function parseCollegeWorkbook(workbook) {
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            const colleges = rows.map(row => {
                const values = Object.entries(row);
                const nameEntry = values.find(([key]) => /college|institution|institute|name/i.test(key));
                const idEntry = values.find(([key]) => /team\s*code|college\s*id|code|id/i.test(key));
                return {
                    id: Number(String(idEntry ? idEntry[1] : '').replace(/[^\d]/g, '')),
                    name: String(nameEntry ? nameEntry[1] : '').trim()
                };
            }).filter(college => college.id && college.name);

            const duplicateIds = colleges.filter((college, index) =>
                colleges.findIndex(item => item.id === college.id) !== index
            );
            const duplicateNames = colleges.filter((college, index) =>
                colleges.findIndex(item => item.name.toLowerCase() === college.name.toLowerCase()) !== index
            );
            if (duplicateIds.length) throw new Error(`Duplicate team code found: ${duplicateIds[0].id}`);
            if (duplicateNames.length) throw new Error(`Duplicate college name found: ${duplicateNames[0].name}`);
            if (colleges.length === 0) throw new Error('No college rows found. Required columns: College Name and Team Code.');
            return colleges;
        }

        async function previewCollegeImport() {
            try {
                if (typeof XLSX === 'undefined') throw new Error('Excel reader is unavailable. Check your internet connection and reload the portal.');
                const input = document.getElementById('college-list-file');
                if (!input || !input.files || !input.files[0]) throw new Error('Choose an Excel file first.');
                const workbook = XLSX.read(await input.files[0].arrayBuffer(), { type: 'array' });
                pendingCollegeImport = parseCollegeWorkbook(workbook);
                const preview = document.getElementById('college-import-preview');
                preview.classList.remove('hidden');
                preview.innerHTML = `<strong>${pendingCollegeImport.length} colleges validated.</strong> Team codes are unique. Review the file, then click Publish to database.`;
            } catch (error) {
                pendingCollegeImport = null;
                Swal.fire('Excel validation failed', error.message, 'error');
            }
        }

        async function importCollegeList() {
            try {
                if (!currentAdmin || currentAdmin.role !== 'Super Admin') throw new Error('Only Super Admin can publish the college directory.');
                if (!pendingCollegeImport) await previewCollegeImport();
                if (!pendingCollegeImport) return;
                const confirmation = await Swal.fire({
                    icon: 'warning',
                    title: 'Replace active college list?',
                    text: `${pendingCollegeImport.length} validated colleges will become the active directory. Historical registrations are preserved.`,
                    showCancelButton: true,
                    confirmButtonText: 'Publish list',
                    cancelButtonText: 'Cancel'
                });
                if (!confirmation.isConfirmed) return;
                const count = await DBService.replaceAffiliatedColleges(pendingCollegeImport);
                await Swal.fire('College list updated', `${count} colleges are now active in Supabase. Reloading portals...`, 'success');
                window.location.reload();
            } catch (error) {
                console.error('College import failed:', error);
                Swal.fire('College import failed', error.message || 'The college list was not updated.', 'error');
            }
        }
    }

    async function copySupabaseSchema() {
        try {
            const resp = await fetch('supabase_schema.sql');
            const sqlText = await resp.text();
            await navigator.clipboard.writeText(sqlText);

            Swal.fire({
                icon: 'success',
                title: 'SQL Schema कॉपी हो गया!',
                html: `
                    <div class="text-left text-sm text-gray-200">
                        <p class="mb-2">Supabase Schema क्लिपबोर्ड में कॉपी हो गया है।</p>
                        <p class="mb-2"><strong>कदम:</strong></p>
                        <ol class="list-decimal pl-5 space-y-1 text-xs text-gray-300">
                            <li>Supabase Dashboard खोलें: <code>https://supabase.com/dashboard/project/mloifpvurnppsykpjtgc</code></li>
                            <li>बाएं मेन्यू से <strong>SQL Editor</strong> पर जाएं।</li>
                            <li><strong>New Query</strong> खोलें और कॉपी किया गया कोड पेस्ट (Paste) करें।</li>
                            <li><strong>Run</strong> बटन दबाएं! सभी टेबल्स व इवेंट्स तुरंत लाइव हो जाएंगे।</li>
                        </ol>
                    </div>
                `,
                confirmButtonText: 'समझ गया',
                confirmButtonColor: '#d97706'
            });
        } catch (e) {
            Swal.fire('त्रुटि', 'Schema कॉपी नहीं हो सका। कृपया supabase_schema.sql फाइल से कॉपी करें।', 'error');
        }
    }

    function quickDemoAdminLogin(email, password) {
        const emailInput = document.getElementById('admin-email-input');
        const passInput = document.getElementById('admin-password-input');
        if (emailInput) emailInput.value = email;
        if (passInput) passInput.value = password;
        login(email, password);
    }

    return {
        init: function() {
            loadSavedSession();
        },
        login,
        logout,
        switchTab,
        renderStudentsList,
        filterStudentsList: renderStudentsList,
        changeStatus,
        deleteStudent,
        viewStudentDetails,
        printStudentCard,
        exportStudentsCSV,
        renderJudgesManagement,
        openAddJudgeModal,
        openNewJudgeModal: openAddJudgeModal,
        openEditJudgeModal,
        selectJudgeFromRoster,
        saveJudgeForm,
        closeJudgeModal,
        deleteJudge,
        renderScoresBoard,
        renderFinalResultsBoard,
        exportFinalResultsExcel,
        printFinalResults,
        declareFinalResults,
        testCloudConnection,
        viewJudgeRemarks,
        printOfficialAwardSheet,
        copySupabaseSchema,
        previewCollegeImport,
        importCollegeList,
        quickDemoAdminLogin
    };
})();

window.AdminApp = AdminApp;
