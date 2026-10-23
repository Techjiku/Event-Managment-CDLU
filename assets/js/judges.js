// ==============================================================================
// CHAUDHARY DEVI LAL UNIVERSITY (CDLU), SIRSA
// 13th TRIVENI YUVA MAHOTSAV 2026 - JUDGES PORTAL CONTROLLER
// Strict verification by unique admin-assigned email & multi-criteria evaluation
// ==============================================================================

const JudgesApp = (function() {
    let currentJudge = null;
    let currentParticipants = [];
    let assignedEventCount = 0;

    // Check existing judge session in sessionStorage
    function loadSavedSession() {
        try {
            const saved = sessionStorage.getItem('cdlu_active_judge');
            if (saved) {
                currentJudge = JSON.parse(saved);
                renderJudgeDashboard();
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Attempt Judge Login
    async function login(email, pin) {
        if (!email || !email.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'ईमेल आवश्यक है',
                text: 'कृपया एडमिन द्वारा दी गई अपनी आधिकारिक जज ईमेल दर्ज करें।'
            });
            return false;
        }

        const result = await DBService.verifyJudgeByEmail(email.trim(), pin || '1234');
        if (!result.authorized) {
            Swal.fire({
                icon: 'error',
                title: 'प्रवेश अस्वीकृत (Access Denied)',
                html: `<strong>${result.message}</strong><br><br><span class="text-xs text-gray-500">केवल एडमिन द्वारा असाइन की गई अधिकृत ईमेल ही लॉगिन कर सकती हैं।</span>`
            });
            return false;
        }

        currentJudge = result.judge;
        sessionStorage.setItem('cdlu_active_judge', JSON.stringify(currentJudge));

        Swal.fire({
            icon: 'success',
            title: 'सफल लॉगिन (Login Successful)',
            text: result.message,
            timer: 1600,
            showConfirmButton: false
        });

        renderJudgeDashboard();
        return true;
    }

    function logout() {
        currentJudge = null;
        sessionStorage.removeItem('cdlu_active_judge');
        document.getElementById('judge-auth-container').classList.remove('hidden');
        document.getElementById('judge-dashboard-container').classList.add('hidden');
        Swal.fire({
            icon: 'info',
            title: 'लॉगआउट सफल',
            timer: 1200,
            showConfirmButton: false
        });
    }

    // Render Judge Dashboard
    async function renderJudgeDashboard() {
        if (!currentJudge) return;

        document.getElementById('judge-auth-container').classList.add('hidden');
        document.getElementById('judge-dashboard-container').classList.remove('hidden');

        // Populate judge info
        document.getElementById('judge-display-name').textContent = currentJudge.name;
        document.getElementById('judge-display-email').textContent = currentJudge.email;
        document.getElementById('judge-display-org').textContent = currentJudge.organization || 'CDLU External Evaluator';
        document.getElementById('judge-display-categories').textContent = (currentJudge.assigned_categories || []).join(', ');

        // Load events assigned to this judge or categories
        const allEvents = await DBService.getEvents('All');
        const assignedCategories = currentJudge.assigned_categories || [];
        const judgeEvents = allEvents.filter(e => 
            assignedCategories.includes(e.category) || 
            (currentJudge.assigned_events && currentJudge.assigned_events.includes(e.id))
        );

        const eventSelect = document.getElementById('judge-event-filter');
        eventSelect.innerHTML = '<option value="">-- सभी असाइन किए गए इवेंट्स (All Assigned Events) --</option>';
        judgeEvents.forEach(evt => {
            const opt = document.createElement('option');
            opt.value = evt.id;
            opt.textContent = `[${evt.category}] ${evt.name} (${evt.stage})`;
            eventSelect.appendChild(opt);
        });

        assignedEventCount = judgeEvents.length;
        eventSelect.value = '';

        await loadParticipantsForEvaluation();
    }

    // Load participants for the active event
    async function loadParticipantsForEvaluation() {
        const eventSelect = document.getElementById('judge-event-filter');
        const eventId = eventSelect.value;
        const container = document.getElementById('judge-participants-list');
        container.innerHTML = '<div class="p-8 text-center text-gray-400"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>प्रतिभागियों की सूची लोड हो रही है...</p></div>';

        const allRegs = await DBService.getRegistrations('All');
        const scores = await DBService.getJudgeScores(currentJudge.email);
        const allEvents = await DBService.getEvents('All');

        const assignedCategories = currentJudge.assigned_categories || [];
        const assignedEvents = currentJudge.assigned_events || [];
        let filtered = allRegs.filter(r =>
            assignedCategories.includes(r.category) || assignedEvents.includes(r.event_id)
        );
        if (eventId) {
            filtered = filtered.filter(r => r.event_id === eventId);
        }

        filtered.sort((a, b) =>
            String(a.chest_number || '').localeCompare(String(b.chest_number || ''), undefined, { numeric: true }) ||
            String(a.participant_name || '').localeCompare(String(b.participant_name || ''))
        );

        currentParticipants = filtered.map(reg => {
            const eventObj = allEvents.find(event => event.id === reg.event_id);
            return {
                reg,
                eventObj,
                isGroup: isEventGroup(eventObj, reg),
                score: scores.find(item =>
                    item.registration_id === reg.id && item.judge_email === currentJudge.email
                )
            };
        });

        const evaluatedCount = currentParticipants.filter(item => item.score && item.score.is_locked).length;
        document.getElementById('judge-stat-events').textContent = assignedEventCount;
        document.getElementById('judge-stat-entries').textContent = currentParticipants.length;
        document.getElementById('judge-stat-evaluated').textContent = evaluatedCount;
        document.getElementById('judge-stat-pending').textContent = currentParticipants.length - evaluatedCount;

        filterParticipants();
    }

    function filterParticipants() {
        const container = document.getElementById('judge-participants-list');
        const searchInput = document.getElementById('judge-participant-search');
        const statusFilter = document.getElementById('judge-status-filter');
        const searchTerm = searchInput ? searchInput.value.trim().toLocaleLowerCase() : '';
        const status = statusFilter ? statusFilter.value : 'all';
        const filteredParticipants = currentParticipants.filter(({ reg, score }) => {
            const matchesStatus = status === 'all' ||
                (status === 'evaluated' && !!(score && score.is_locked)) ||
                (status === 'pending' && !(score && score.is_locked));
            const searchableText = [
                reg.participant_name,
                reg.college_name,
                reg.category,
                reg.event_name,
                reg.roll_no,
                reg.chest_number,
                reg.id
            ].join(' ').toLocaleLowerCase();
            return matchesStatus && searchableText.includes(searchTerm);
        });

        if (currentParticipants.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center bg-gray-800/40 rounded-2xl border border-gray-700/50">
                    <i class="fas fa-user-clock text-4xl text-amber-400 mb-3"></i>
                    <h4 class="text-lg font-bold text-gray-200">कोई प्रतिभागी अभी पंजीकृत नहीं है</h4>
                    <p class="text-sm text-gray-400 mt-1">इस इवेंट के लिए विद्यार्थी पंजीकरण प्राप्त होने पर यहाँ प्रदर्शित होंगे।</p>
                </div>
            `;
            return;
        }

        if (filteredParticipants.length === 0) {
            container.innerHTML = `
                <div class="p-10 text-center bg-gray-800/40 rounded-2xl border border-gray-700/50">
                    <i class="fas fa-filter-circle-xmark text-3xl text-gray-500 mb-3"></i>
                    <h4 class="font-bold text-gray-200">कोई मिलान नहीं मिला (No matches)</h4>
                    <p class="text-sm text-gray-400 mt-1">खोज शब्द या मूल्यांकन स्थिति बदलकर देखें।</p>
                </div>
            `;
            return;
        }

        const html = filteredParticipants.map(({ reg, isGroup, score: myScore }) => {
            const maxScore = isGroup ? 20 : 10;

            const isScored = !!myScore;
            const isLocked = !!(myScore && myScore.is_locked);

            return `
                <div class="judge-participant-card border ${isScored ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-gray-700'} rounded-2xl p-5 transition shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-start gap-4">
                        <div class="w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-center shrink-0 ${isScored ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'}">
                            <span class="text-xs uppercase tracking-wider">CHEST</span>
                            <span class="text-lg leading-tight font-extrabold">${reg.chest_number || reg.id.slice(-3)}</span>
                        </div>
                        <div>
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <span class="px-2 py-0.5 rounded text-xs font-semibold bg-gray-700 text-amber-300 font-mono">${reg.id}</span>
                                <span class="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-900/50 text-indigo-300">${reg.category}</span>
                                <span class="px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider ${isGroup ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' : 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'}">
                                    ${isGroup ? '<i class="fas fa-users mr-1"></i> समूह (Group - Max 20)' : '<i class="fas fa-user mr-1"></i> एकल (Solo - Max 10)'}
                                </span>
                                ${isLocked ? '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-900/50 text-emerald-300 flex items-center gap-1"><i class="fas fa-lock"></i> Final submitted</span>' : isScored ? '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-amber-900/50 text-amber-300 flex items-center gap-1"><i class="fas fa-pen"></i> Draft</span>' : '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-amber-900/40 text-amber-300 flex items-center gap-1"><i class="fas fa-clock"></i> Pending</span>'}
                            </div>
                            <h4 class="text-lg font-bold text-white flex items-center gap-2">
                                ${reg.participant_name}
                                ${reg.team_members && reg.team_members.length > 0 ? `<span class="text-xs font-normal text-indigo-300 bg-indigo-900/40 px-2 py-0.5 rounded-full">+${reg.team_members.length} Team Members</span>` : ''}
                            </h4>
                            <p class="text-sm text-gray-300 font-medium">${reg.college_name}</p>
                            <p class="text-xs text-gray-400 mt-1 flex items-center gap-3">
                                <span><i class="fas fa-trophy text-amber-400 mr-1"></i> ${reg.event_name}</span>
                                <span><i class="fas fa-id-card text-blue-400 mr-1"></i> Roll: ${reg.roll_no}</span>
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 shrink-0 self-end md:self-center">
                        ${isLocked ? `
                            <span class="text-xs font-semibold text-emerald-300 flex items-center gap-2"><i class="fas fa-eye-slash"></i> Submitted · score hidden</span>
                        ` : isScored ? `
                            <div class="text-right mr-2">
                                <span class="text-xs text-gray-400 block font-semibold">Draft score</span>
                                <span class="text-2xl font-black text-emerald-400">${myScore.total_score}<span class="text-xs text-gray-400 font-normal">/${myScore.max_score || maxScore}</span></span>
                            </div>
                            <button onclick="JudgesApp.openScoringModal('${reg.id}')" class="px-4 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-medium text-sm transition flex items-center gap-2 shadow">
                                <i class="fas fa-edit text-amber-400"></i> एडिट स्कोर (Edit)
                            </button>
                        ` : `
                            <button onclick="JudgesApp.openScoringModal('${reg.id}')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-amber-500/20">
                                <i class="fas fa-star"></i> स्कोर दें (Evaluate)
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    // Helper: Is event Solo or Group
    function isEventGroup(event, reg) {
        if (reg && reg.team_members && reg.team_members.length > 0) return true;
        if (event && event.participants_max && event.participants_max > 1) return true;
        return false;
    }

    // Open Clean Direct Scoring Modal (Marks upon 10 if solo, upon 20 if group)
    async function openScoringModal(regId) {
        const reg = await DBService.getRegistrationById(regId);
        if (!reg) return;

        const event = await DBService.getEventById(reg.event_id);
        const scores = await DBService.getJudgeScores(currentJudge.email);
        const existingScore = scores.find(s => s.registration_id === reg.id && s.judge_email === currentJudge.email);
        if (existingScore && existingScore.is_locked) {
            Swal.fire({
                icon: 'info',
                title: 'Score submitted',
                text: 'This final score is locked and hidden from the judge workspace.'
            });
            await loadParticipantsForEvaluation();
            return;
        }

        const isGroup = isEventGroup(event, reg);
        const maxScore = isGroup ? 20 : 10;
        const defaultScore = isGroup ? 16 : 8;
        const currentVal = existingScore ? existingScore.total_score : defaultScore;

        document.getElementById('score-modal-participant-name').textContent = reg.participant_name;
        document.getElementById('score-modal-college').textContent = reg.college_name;
        document.getElementById('score-modal-event').textContent = reg.event_name;
        document.getElementById('score-modal-chest').textContent = reg.chest_number || reg.id.slice(-3);
        document.getElementById('score-modal-reg-id').value = reg.id;
        document.getElementById('score-modal-event-id').value = reg.event_id;

        // Hidden max score
        let maxHidden = document.getElementById('score-modal-max-score');
        if (!maxHidden) {
            maxHidden = document.createElement('input');
            maxHidden.type = 'hidden';
            maxHidden.id = 'score-modal-max-score';
            document.getElementById('scoring-modal').appendChild(maxHidden);
        }
        maxHidden.value = maxScore;

        const perfTypeBadge = document.getElementById('score-modal-perf-type');
        if (perfTypeBadge) {
            perfTypeBadge.className = isGroup ? 
                'px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40' : 
                'px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
            perfTypeBadge.innerHTML = isGroup ? 
                '<i class="fas fa-users mr-1"></i> समूह प्रस्तुति (Group Performance - Max 20 Marks)' : 
                '<i class="fas fa-user mr-1"></i> एकल प्रस्तुति (Solo Performance - Max 10 Marks)';
        }

        // Direct scoring UI: clean slider + input + quick select pills
        const rubricContainer = document.getElementById('score-rubric-container');
        const quickPills = isGroup ? 
            [10, 12, 14, 15, 16, 17, 18, 19, 20] : 
            [5, 6, 7, 7.5, 8, 8.5, 9, 9.5, 10];

        rubricContainer.innerHTML = `
            <div class="bg-gray-800/80 p-5 rounded-2xl border border-gray-700 shadow-inner">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <span class="text-sm font-bold text-gray-200 block">
                            ${isGroup ? 'समूह प्रस्तुति समग्र मूल्यांकन (Group Performance Score)' : 'एकल प्रस्तुति समग्र मूल्यांकन (Solo Performance Score)'}
                        </span>
                        <span class="text-xs text-gray-400">
                            ${isGroup ? 'इस समूह प्रस्तुति को अधिकतम 20 में से अंक प्रदान करें' : 'इस एकल प्रस्तुति को अधिकतम 10 में से अंक प्रदान करें'}
                        </span>
                    </div>
                    <div class="text-right">
                        <span class="text-2xl font-black text-amber-400 font-mono">
                            <span id="score-val-direct">${currentVal}</span>
                            <span class="text-sm text-gray-400 font-normal"> / ${maxScore}</span>
                        </span>
                    </div>
                </div>

                <!-- Range Slider & Direct Input -->
                <div class="flex items-center gap-4 my-4">
                    <input type="range" 
                        min="0" 
                        max="${maxScore}" 
                        value="${currentVal}" 
                        step="0.5" 
                        id="direct-score-slider" 
                        class="w-full accent-amber-500 bg-gray-700 h-3 rounded-lg cursor-pointer"
                        oninput="JudgesApp.onDirectScoreChange(this.value, ${maxScore})"
                    />
                    <div class="flex items-center gap-1.5 shrink-0">
                        <input type="number" 
                            min="0" 
                            max="${maxScore}" 
                            value="${currentVal}" 
                            step="0.5"
                            id="direct-score-number" 
                            class="w-20 bg-gray-950 border border-gray-600 rounded-xl text-center text-amber-300 font-black text-lg py-2 focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                            oninput="JudgesApp.onDirectScoreChange(this.value, ${maxScore})"
                        />
                        <span class="text-xs font-bold text-gray-400 font-mono">/ ${maxScore}</span>
                    </div>
                </div>

                <!-- Quick Selection Buttons -->
                <div class="pt-3 border-t border-gray-700/60">
                    <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">त्वरित अंक चुनें (Quick Select):</span>
                    <div class="flex flex-wrap gap-1.5">
                        ${quickPills.map(val => `
                            <button type="button" data-direct-score="${val}" onclick="JudgesApp.setDirectScore(${val}, ${maxScore})" class="px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${Number(currentVal) === Number(val) ? 'bg-amber-500 text-gray-950 shadow-md ring-2 ring-amber-300' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} transition active:scale-95">
                                ${val}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Remarks
        document.getElementById('score-modal-remarks').value = existingScore ? (existingScore.remarks || '') : '';

        // Recalculate and update summary
        updateScoreSummary(currentVal, maxScore);

        // Show modal
        document.getElementById('scoring-modal').classList.remove('hidden');
    }

    function onDirectScoreChange(val, maxScore) {
        let num = parseFloat(val);
        if (isNaN(num)) num = 0;
        if (num > maxScore) num = maxScore;
        if (num < 0) num = 0;

        const slider = document.getElementById('direct-score-slider');
        const numInput = document.getElementById('direct-score-number');
        const scoreValDirect = document.getElementById('score-val-direct');

        if (slider) slider.value = num;
        if (numInput) numInput.value = num;
        if (scoreValDirect) scoreValDirect.textContent = num;

        document.querySelectorAll('#score-rubric-container [data-direct-score]').forEach(button => {
            const selected = Number(button.dataset.directScore) === num;
            button.className = `px-3 py-1.5 rounded-xl text-xs font-bold font-mono ${selected
                ? 'bg-amber-500 text-gray-950 shadow-md ring-2 ring-amber-300'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'} transition active:scale-95`;
        });

        updateScoreSummary(num, maxScore);
    }

    function setDirectScore(val, maxScore) {
        onDirectScoreChange(val, maxScore);
    }

    function updateScoreSummary(total, maxPossible) {
        const val = parseFloat(total) || 0;
        const max = parseFloat(maxPossible) || 10;

        const totalDisplay = document.getElementById('score-total-display');
        const maxDisplay = document.getElementById('score-max-display');
        if (totalDisplay) totalDisplay.textContent = val;
        if (maxDisplay) maxDisplay.textContent = max;

        // Visual grade indicator
        const pct = max > 0 ? (val / max) * 100 : 0;
        const badge = document.getElementById('score-grade-badge');
        if (badge) {
            if (pct >= 88) {
                badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1';
                badge.innerHTML = '<i class="fas fa-star text-amber-400"></i> उत्कृष्ट (Outstanding / A+)';
            } else if (pct >= 75) {
                badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 inline-flex items-center gap-1';
                badge.innerHTML = '<i class="fas fa-check text-blue-400"></i> बहुत अच्छा (Very Good / A)';
            } else if (pct >= 60) {
                badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1';
                badge.innerHTML = 'अच्छा (Good / B)';
            } else {
                badge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-300 border border-gray-500/40 inline-flex items-center gap-1';
                badge.innerHTML = 'संतोषजनक (Satisfactory / C)';
            }
        }
    }

    async function submitScore(isLocked = true) {
        const regId = document.getElementById('score-modal-reg-id').value;
        const eventId = document.getElementById('score-modal-event-id').value;
        const remarks = document.getElementById('score-modal-remarks').value;
        const maxScoreElem = document.getElementById('score-modal-max-score');
        const maxScore = maxScoreElem ? (parseFloat(maxScoreElem.value) || 10) : 10;
        const scoreInput = document.getElementById('direct-score-number');
        const score = scoreInput ? (parseFloat(scoreInput.value) || 0) : 0;

        const reg = await DBService.getRegistrationById(regId);
        if (!reg || !currentJudge) return;
        if (!Number.isFinite(score) || score < 0 || score > maxScore) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid score',
                text: `The judge score must be between 0 and ${maxScore}.`
            });
            return;
        }

        const scorePayload = {
            registration_id: reg.id,
            participant_name: reg.participant_name,
            college_id: reg.college_id,
            event_id: eventId,
            event_name: reg.event_name,
            judge_id: currentJudge.id,
            judge_name: currentJudge.name,
            judge_email: currentJudge.email,
            criteria_breakdown: { performance: score },
            total_score: score,
            max_score: maxScore,
            source_max_score: maxScore,
            normalized_score: score,
            remarks: remarks,
            is_locked: isLocked
        };

        try {
            await DBService.saveScore(scorePayload);
        } catch (error) {
            console.error('Unable to submit judge score:', error);
            Swal.fire({
                icon: 'error',
                title: 'Score not saved',
                text: error.message || 'The score could not be saved. Please try again.'
            });
            return;
        }

        if (isLocked && window.NativeUI) NativeUI.celebrate();

        closeScoringModal();

        Swal.fire({
            icon: 'success',
            title: isLocked ? 'स्कोर सफलतापूर्वक सबमिट और लॉक किया गया!' : 'स्कोर ड्राफ्ट के रूप में सहेजा गया!',
            html: `<strong>${reg.participant_name}</strong> (${reg.college_name})<br>कुल अंक: <span class="text-amber-400 font-bold text-xl">${score} / ${maxScore}</span>`,
            timer: 2000,
            showConfirmButton: false
        });

        await loadParticipantsForEvaluation();
    }

    function closeScoringModal() {
        document.getElementById('scoring-modal').classList.add('hidden');
    }

    // Quick demo login helper
    function quickDemoJudgeLogin(email) {
        document.getElementById('judge-email-input').value = email;
        document.getElementById('judge-pin-input').value = '1234';
        login(email, '1234');
    }

    return {
        init: function() {
            loadSavedSession();
        },
        login,
        logout,
        openScoringModal,
        closeScoringModal,
        onDirectScoreChange,
        setDirectScore,
        submitScore,
        loadParticipantsForEvaluation,
        filterParticipants,
        quickDemoJudgeLogin
    };
})();

window.JudgesApp = JudgesApp;
