// ==============================================================================
// CHAUDHARY DEVI LAL UNIVERSITY (CDLU), SIRSA
// 13th TRIVENI YUVA MAHOTSAV 2026 - MAIN APP & STUDENT REGISTRATION CONTROLLER
// Poster Carousel, Dynamic Registration, I-Card Generator, Public Search
// ==============================================================================

const App = (function() {
    // Carousel state
    let currentSlide = 0;
    const totalSlides = 5;
    let slideInterval = null;

    // Team members & accompanists dynamic state for form
    let teamMembers = [];
    let accompanists = [];
    let currentSelectedEvent = null;

    // 1. CAROUSEL INITIALIZATION
    function initCarousel() {
        showSlide(0);
        startCarouselAuto();

        const carouselEl = document.getElementById('poster-carousel');
        if (carouselEl) {
            carouselEl.addEventListener('mouseenter', stopCarouselAuto);
            carouselEl.addEventListener('mouseleave', startCarouselAuto);
        }
    }

    function showSlide(index) {
        currentSlide = (index + totalSlides) % totalSlides;
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dot');

        slides.forEach((slide, i) => {
            if (i === currentSlide) {
                slide.classList.remove('opacity-0', 'pointer-events-none');
                slide.classList.add('opacity-100', 'z-10');
            } else {
                slide.classList.remove('opacity-100', 'z-10');
                slide.classList.add('opacity-0', 'pointer-events-none');
            }
        });

        dots.forEach((dot, i) => {
            if (i === currentSlide) {
                dot.className = 'carousel-dot w-8 h-2.5 rounded-full bg-amber-400 transition-all duration-300';
            } else {
                dot.className = 'carousel-dot w-2.5 h-2.5 rounded-full bg-gray-500/60 hover:bg-gray-400 transition-all duration-300';
            }
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startCarouselAuto() {
        stopCarouselAuto();
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopCarouselAuto() {
        if (slideInterval) clearInterval(slideInterval);
    }

    // 2. LOAD EVENTS INTO EXPLORER & REGISTRATION FORM
    async function loadEventsData() {
        const events = await DBService.getEvents('All');
        populateCollegeOptions();

        // Populate registration form event category & event dropdown
        const regCategorySelect = document.getElementById('reg-category');
        const regEventSelect = document.getElementById('reg-event');

        // Render Explorer Cards
        renderEventExplorer('All');
    }

    function populateCollegeOptions() {
        const select = document.getElementById('reg-college');
        if (!select || !DBService.getAffiliatedColleges) return;
        select.innerHTML = '<option value="">-- महाविद्यालय चुनें (Select Affiliated College) --</option>';
        DBService.getAffiliatedColleges().forEach(college => {
            const option = document.createElement('option');
            option.value = String(college.id);
            option.dataset.collegeName = college.name;
            option.textContent = `${college.name} [${college.id}]`;
            select.appendChild(option);
        });
    }

    async function onCategoryChange(selectedCategory) {
        const regEventSelect = document.getElementById('reg-event');
        regEventSelect.innerHTML = '<option value="">-- इवेंट चुनें (Select Event) --</option>';

        if (!selectedCategory) {
            regEventSelect.disabled = true;
            return;
        }

        const events = await DBService.getEvents(selectedCategory);
        events.forEach(evt => {
            const opt = document.createElement('option');
            opt.value = evt.id;
            const limit = (DBService.getOfficialEventAgeLimit) ? 
                DBService.getOfficialEventAgeLimit(evt.id, evt.name) : 
                evt.age_limit;
            const ageBadge = limit ? 'अधिकतम 25 वर्ष' : 'कोई आयु सीमा नहीं';
            opt.textContent = `${evt.name} [${ageBadge}]`;
            regEventSelect.appendChild(opt);
        });

        regEventSelect.disabled = false;
        resetDynamicFormSections();
    }

    async function onEventChange(eventId) {
        if (!eventId) {
            currentSelectedEvent = null;
            resetDynamicFormSections();
            return;
        }

        currentSelectedEvent = await DBService.getEventById(eventId);
        if (!currentSelectedEvent) return;

        // Show event info helper card
        const helperBox = document.getElementById('event-guidelines-box');
        helperBox.classList.remove('hidden');
        document.getElementById('helper-event-name').textContent = currentSelectedEvent.name;
        document.getElementById('helper-event-stage').textContent = currentSelectedEvent.stage || 'University Campus';
        document.getElementById('helper-event-time').textContent = currentSelectedEvent.time_limit || 'Standard';
        document.getElementById('helper-event-participants').textContent = `प्रतिभागी: Min ${currentSelectedEvent.participants_min} - Max ${currentSelectedEvent.participants_max}`;
        document.getElementById('helper-event-rules').textContent = currentSelectedEvent.rules || 'No special rules.';

        // Configure Age Limit in helper box and input hints
        const ageHelper = document.getElementById('helper-event-age');
        const dobHint = document.getElementById('reg-dob-rule-hint');
        const dobInput = document.getElementById('reg-dob');
        
        // Ensure authoritative official age limit is attached
        const officialAge = (DBService.getOfficialEventAgeLimit) ? 
            DBService.getOfficialEventAgeLimit(currentSelectedEvent.id, currentSelectedEvent.name) : 
            currentSelectedEvent.age_limit;
        currentSelectedEvent.age_limit = officialAge;

        if (officialAge) {
            if (ageHelper) ageHelper.innerHTML = `<span class="text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">अधिकतम 25 वर्ष (1 जुलाई 2026 तक)</span>`;
            if (dobHint) dobHint.textContent = '(अधिकतम 25 वर्ष - 1 जुलाई 2026 को)';
            if (dobInput) {
                dobInput.setAttribute('min', '2001-07-01');
                dobInput.setAttribute('max', '2011-12-31');
            }
        } else {
            const isProcession = (currentSelectedEvent.id || '').includes('procession') || (currentSelectedEvent.name || '').includes('procession');
            if (ageHelper) ageHelper.innerHTML = `<span class="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">${isProcession ? 'कोई सीमा नहीं (Ignored)' : 'कोई आयु सीमा नहीं (No Limit)'}</span>`;
            if (dobHint) dobHint.textContent = '(कोई आयु सीमा नहीं)';
            if (dobInput) {
                dobInput.removeAttribute('min');
                dobInput.setAttribute('max', '2011-12-31');
            }
        }

        // Real-time re-evaluation of DOB against newly selected event
        onDobChange();

        // Configure Team Members section
        const teamSection = document.getElementById('team-members-section');
        if (currentSelectedEvent.participants_max > 1) {
            teamSection.classList.remove('hidden');
            document.getElementById('team-max-notice').textContent = `(मुख्य प्रतिभागी के अतिरिक्त अधिकतम ${currentSelectedEvent.participants_max - 1} अन्य सदस्य जोड़ सकते हैं)`;
        } else {
            teamSection.classList.add('hidden');
            teamMembers = [];
            renderTeamMembers();
        }

        // Configure Accompanists section
        const accompSection = document.getElementById('accompanists-section');
        if (currentSelectedEvent.accompanists_max > 0) {
            accompSection.classList.remove('hidden');
            document.getElementById('accomp-max-notice').textContent = `(अधिकतम ${currentSelectedEvent.accompanists_max} संगतकार मान्य हैं)`;
        } else {
            accompSection.classList.add('hidden');
            accompanists = [];
            renderAccompanists();
        }
    }

    function resetDynamicFormSections() {
        document.getElementById('event-guidelines-box').classList.add('hidden');
        document.getElementById('team-members-section').classList.add('hidden');
        document.getElementById('accompanists-section').classList.add('hidden');
        const feedback = document.getElementById('reg-dob-feedback');
        if (feedback) {
            feedback.classList.add('hidden');
            feedback.innerHTML = '';
        }
        const hint = document.getElementById('reg-dob-rule-hint');
        if (hint) hint.textContent = '';
        const dobInput = document.getElementById('reg-dob');
        if (dobInput) {
            dobInput.classList.remove('border-rose-500', 'border-emerald-500', 'border-indigo-500');
            dobInput.removeAttribute('min');
        }
        teamMembers = [];
        accompanists = [];
        renderTeamMembers();
        renderAccompanists();
    }

    // Dynamic Team Member Handlers
    function addTeamMember() {
        if (!currentSelectedEvent) return;
        const maxAllowed = currentSelectedEvent.participants_max - 1;
        if (teamMembers.length >= maxAllowed) {
            Swal.fire({
                icon: 'warning',
                title: 'अधिकतम सीमा (Max Limit)',
                text: `इस इवेंट में अधिकतम ${currentSelectedEvent.participants_max} कुल प्रतिभागी हो सकते हैं।`
            });
            return;
        }

        teamMembers.push({
            name: '',
            father_name: '',
            class: '',
            roll_no: '',
            dob: ''
        });
        renderTeamMembers();
    }

    function removeTeamMember(index) {
        teamMembers.splice(index, 1);
        renderTeamMembers();
    }

    function updateTeamMember(index, field, value) {
        if (teamMembers[index]) {
            teamMembers[index][field] = value;
        }
    }

    function renderTeamMembers() {
        const container = document.getElementById('team-members-container');
        if (!container) return;
        if (teamMembers.length === 0) {
            container.innerHTML = '<p class="text-xs text-gray-400 italic">ग्रुप इवेंट के अन्य सदस्यों को जोड़ने के लिए नीचे दिए गए "+ सदस्य जोड़ें" बटन पर क्लिक करें।</p>';
            return;
        }

        const isRestricted = currentSelectedEvent && currentSelectedEvent.age_limit;

        container.innerHTML = teamMembers.map((m, idx) => {
            let memberAgeValidation = null;
            if (m.dob && currentSelectedEvent) {
                memberAgeValidation = DBService.checkAgeEligibility(m.dob, currentSelectedEvent);
            }

            return `
            <div class="bg-gray-800/80 p-3.5 rounded-xl border ${memberAgeValidation && !memberAgeValidation.isValid ? 'border-rose-500/80 bg-rose-950/20' : 'border-gray-700/80'} mb-2">
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-amber-400">टीम सदस्य #${idx + 2}</span>
                        ${memberAgeValidation ? (memberAgeValidation.isValid ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">✓ पात्र</span>' : '<span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold animate-pulse">⚠️ 25 वर्ष से अधिक</span>') : ''}
                    </div>
                    <button type="button" onclick="App.removeTeamMember(${idx})" class="text-rose-400 hover:text-rose-300 text-xs">
                        <i class="fas fa-times-circle mr-1"></i> हटाएं
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                    <input type="text" placeholder="सदस्य का नाम (Name)" value="${m.name}" oninput="App.updateTeamMember(${idx}, 'name', this.value)" required class="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    <input type="text" placeholder="पिता का नाम (Father)" value="${m.father_name}" oninput="App.updateTeamMember(${idx}, 'father_name', this.value)" class="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    <input type="text" placeholder="कक्षा (Class)" value="${m.class}" oninput="App.updateTeamMember(${idx}, 'class', this.value)" class="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    <input type="text" placeholder="रोल नंबर (Roll No)" value="${m.roll_no}" oninput="App.updateTeamMember(${idx}, 'roll_no', this.value)" class="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono" />
                    <div>
                        <input type="date" title="जन्म तिथि (Date of Birth)" value="${m.dob || ''}" onchange="App.updateTeamMember(${idx}, 'dob', this.value); App.renderTeamMembers();" ${isRestricted ? 'min="2001-07-01"' : ''} max="2011-12-31" class="w-full bg-gray-900 border ${memberAgeValidation && !memberAgeValidation.isValid ? 'border-rose-500 text-rose-300' : 'border-gray-700 text-white'} rounded-lg px-2 py-1.5 text-xs" />
                    </div>
                </div>
                ${memberAgeValidation && !memberAgeValidation.isValid ? `<p class="text-[11px] text-rose-400 mt-1.5"><i class="fas fa-exclamation-circle mr-1"></i> ${memberAgeValidation.message}</p>` : ''}
            </div>
            `;
        }).join('');
    }

    // Live Date of Birth Eligibility Checker
    function onDobChange() {
        const dobInput = document.getElementById('reg-dob');
        const feedbackBox = document.getElementById('reg-dob-feedback');
        if (!dobInput || !feedbackBox) return;

        const dobVal = dobInput.value;
        if (!dobVal) {
            feedbackBox.classList.add('hidden');
            feedbackBox.innerHTML = '';
            dobInput.classList.remove('border-rose-500', 'border-emerald-500', 'border-indigo-500');
            return;
        }

        if (!currentSelectedEvent) {
            feedbackBox.classList.remove('hidden');
            feedbackBox.innerHTML = `
                <div class="p-2.5 rounded-xl bg-gray-800/90 border border-gray-700 text-amber-300 flex items-center gap-2 text-xs">
                    <i class="fas fa-info-circle text-amber-400"></i>
                    <span>कृपया ऊपर से इवेंट चुनें ताकि आयु सीमा पात्रता जांची जा सके।</span>
                </div>
            `;
            dobInput.classList.remove('border-rose-500', 'border-emerald-500', 'border-indigo-500');
            return;
        }

        const res = DBService.checkAgeEligibility(dobVal, currentSelectedEvent);
        feedbackBox.classList.remove('hidden');

        if (!res.isValid) {
            dobInput.classList.add('border-rose-500');
            dobInput.classList.remove('border-emerald-500', 'border-indigo-500');
            feedbackBox.innerHTML = `
                <div class="p-3 rounded-xl bg-rose-950/90 border border-rose-500/80 text-rose-200 text-xs shadow-lg">
                    <div class="flex items-start gap-2.5">
                        <i class="fas fa-circle-xmark text-rose-400 text-base mt-0.5 shrink-0"></i>
                        <div>
                            <p class="font-bold text-rose-300 text-sm">⚠️ अपात्र (Not Eligible - आयु सीमा 25 वर्ष पार)</p>
                            <p class="mt-1">${res.message}</p>
                            <p class="text-[11px] text-gray-300 mt-1.5 border-t border-rose-800/60 pt-1">
                                <strong>नियम (13th TYM 2026):</strong> AIU व CDLU नियमावली के अनुसार 1 जुलाई 2026 को प्रतिभागी की आयु 25 वर्ष से अधिक नहीं होनी चाहिए (अर्थात् जन्म 01/07/2001 या इसके बाद का हो)।
                            </p>
                        </div>
                    </div>
                </div>
            `;
        } else if (res.isRestricted) {
            dobInput.classList.remove('border-rose-500', 'border-indigo-500');
            dobInput.classList.add('border-emerald-500');
            feedbackBox.innerHTML = `
                <div class="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs shadow-md">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-circle-check text-emerald-400 text-sm shrink-0"></i>
                        <div>
                            <strong class="font-bold text-emerald-300">✓ पात्र (Eligible):</strong> 
                            1 जुलाई 2026 को आयु <b>${res.ageYears} वर्ष ${res.ageMonths} माह</b> (अधिकतम 25 वर्ष की सीमा के अंतर्गत)।
                        </div>
                    </div>
                </div>
            `;
        } else {
            // No limit event or Cultural Procession
            dobInput.classList.remove('border-rose-500', 'border-emerald-500');
            dobInput.classList.add('border-indigo-500');
            feedbackBox.innerHTML = `
                <div class="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/60 text-indigo-200 text-xs shadow-md">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-check-circle text-indigo-400 text-sm shrink-0"></i>
                        <div>
                            <strong class="font-bold text-indigo-300">✓ आयु सीमा मुक्त (No Limit):</strong> 
                            इस प्रतियोगिता (शोभा यात्रा / ओपन इवेंट) के लिए 25 वर्ष की कोई आयु सीमा नहीं है। (आयु: <b>${res.ageYears} वर्ष ${res.ageMonths} माह</b>)
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // Dynamic Accompanist Handlers
    function addAccompanist() {
        if (!currentSelectedEvent) return;
        const maxAllowed = currentSelectedEvent.accompanists_max;
        if (accompanists.length >= maxAllowed) {
            Swal.fire({
                icon: 'warning',
                title: 'अधिकतम सीमा (Max Limit)',
                text: `इस इवेंट में अधिकतम ${maxAllowed} संगतकार ही मान्य हैं।`
            });
            return;
        }

        accompanists.push({
            name: '',
            father_name: '',
            type: 'Student',
            instrument: ''
        });
        renderAccompanists();
    }

    function removeAccompanist(index) {
        accompanists.splice(index, 1);
        renderAccompanists();
    }

    function updateAccompanist(index, field, value) {
        if (accompanists[index]) {
            accompanists[index][field] = value;
        }
    }

    function renderAccompanists() {
        const container = document.getElementById('accompanists-container');
        if (accompanists.length === 0) {
            container.innerHTML = '<p class="text-xs text-gray-400 italic">संगतकार जोड़ने के लिए नीचे दिए गए "+ संगतकार जोड़ें" बटन पर क्लिक करें।</p>';
            return;
        }

        container.innerHTML = accompanists.map((a, idx) => `
            <div class="bg-gray-800/80 p-3.5 rounded-xl border border-gray-700/80 mb-2">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-xs font-bold text-indigo-400">संगतकार (Accompanist) #${idx + 1}</span>
                    <button type="button" onclick="App.removeAccompanist(${idx})" class="text-rose-400 hover:text-rose-300 text-xs">
                        <i class="fas fa-times-circle mr-1"></i> हटाएं
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <input type="text" placeholder="संगतकार का नाम" value="${a.name}" oninput="App.updateAccompanist(${idx}, 'name', this.value)" required class="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    <input type="text" placeholder="पिता का नाम" value="${a.father_name}" oninput="App.updateAccompanist(${idx}, 'father_name', this.value)" class="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                    <select onchange="App.updateAccompanist(${idx}, 'type', this.value)" class="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white">
                        <option value="Student" ${a.type === 'Student' ? 'selected' : ''}>Student Participant</option>
                        <option value="Professional" ${a.type === 'Professional' ? 'selected' : ''}>Professional Accompanist</option>
                    </select>
                    <input type="text" placeholder="वाद्य यंत्र (Instrument)" value="${a.instrument}" oninput="App.updateAccompanist(${idx}, 'instrument', this.value)" class="bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white" />
                </div>
            </div>
        `).join('');
    }

    // 3. REGISTRATION FORM SUBMISSION
    async function handleRegistrationSubmit(e) {
        e.preventDefault();

        const category = document.getElementById('reg-category').value;
        const eventId = document.getElementById('reg-event').value;
        const collegeSelect = document.getElementById('reg-college');
        const collegeId = Number(collegeSelect.value);
        const collegeName = collegeSelect.selectedOptions[0]?.dataset.collegeName || '';
        const participantName = document.getElementById('reg-participant-name').value.trim();
        const fatherName = document.getElementById('reg-father-name').value.trim();
        const gender = document.getElementById('reg-gender').value;
        const className = document.getElementById('reg-class').value.trim();
        const rollNo = document.getElementById('reg-roll').value.trim();
        const dob = document.getElementById('reg-dob').value;
        const phone = document.getElementById('reg-phone').value.trim();
        const email = document.getElementById('reg-email').value.trim();

        // Contingent Incharge
        const tmName = document.getElementById('reg-tm-name').value.trim();
        const tmPhone = document.getElementById('reg-tm-phone').value.trim();
        const tmEmail = document.getElementById('reg-tm-email').value.trim();

        if (!currentSelectedEvent) {
            Swal.fire('इवेंट चुनें', 'कृपया इवेंट का चयन करें।', 'warning');
            return;
        }

        // 1. DATE OF BIRTH & 25-YEAR AGE LIMIT VALIDATION
        if (!dob) {
            Swal.fire('जन्म तिथि आवश्यक', 'कृपया मुख्य प्रतिभागी की जन्म तिथि (Date of Birth) दर्ज करें।', 'warning');
            document.getElementById('reg-dob').focus();
            return;
        }

        const ageCheck = DBService.checkAgeEligibility(dob, currentSelectedEvent);
        if (!ageCheck.isValid) {
            Swal.fire({
                icon: 'error',
                title: 'आयु सीमा अपात्र (Age Ineligible)',
                html: `
                    <div class="text-left text-sm text-gray-200">
                        <p class="font-bold text-rose-400 mb-2">⚠️ मुख्य प्रतिभागी इस प्रतियोगिता के लिए अपात्र है।</p>
                        <p><strong>प्रतियोगिता:</strong> ${currentSelectedEvent.name}</p>
                        <p><strong>दर्ज जन्म तिथि:</strong> ${dob}</p>
                        <p class="mt-2 text-xs text-rose-300 font-medium">${ageCheck.message}</p>
                        <div class="mt-3 p-3 bg-rose-950/60 rounded-xl border border-rose-800/60 text-xs text-gray-300">
                            <strong class="text-amber-400">आधिकारिक युवा महोत्सव नियम (13th TYM 2026):</strong><br>
                            AIU व विश्वविद्यालय नियमावली के अनुसार शैक्षणिक सत्र 2026 के प्रारंभ (1 जुलाई 2026) को प्रतिभागी की आयु 25 वर्ष से अधिक नहीं होनी चाहिए (अर्थात् जन्म 01/07/2001 या इसके बाद का होना अनिवार्य है)।
                        </div>
                    </div>
                `,
                confirmButtonText: 'जन्म तिथि सुधारें',
                confirmButtonColor: '#e11d48'
            });
            document.getElementById('reg-dob').focus();
            return;
        }

        // 2. Validate team member inputs & their DOB if provided
        for (let i = 0; i < teamMembers.length; i++) {
            if (!teamMembers[i].name) {
                Swal.fire('अधूरा विवरण', `कृपया टीम सदस्य #${i + 2} का नाम भरें।`, 'warning');
                return;
            }
            if (teamMembers[i].dob) {
                const tmCheck = DBService.checkAgeEligibility(teamMembers[i].dob, currentSelectedEvent);
                if (!tmCheck.isValid) {
                    Swal.fire({
                        icon: 'error',
                        title: 'टीम सदस्य अपात्र (Team Member Ineligible)',
                        html: `
                            <div class="text-left text-sm text-gray-200">
                                <p class="font-bold text-rose-400 mb-2">⚠️ टीम सदस्य #${i + 2} (${teamMembers[i].name}) 25 वर्ष की आयु सीमा पार कर चुके हैं।</p>
                                <p class="text-xs text-rose-300">${tmCheck.message}</p>
                            </div>
                        `,
                        confirmButtonColor: '#e11d48'
                    });
                    return;
                }
            }
        }

        // Validate accompanists inputs
        for (let i = 0; i < accompanists.length; i++) {
            if (!accompanists[i].name) {
                Swal.fire('अधूरा विवरण', `कृपया संगतकार #${i + 1} का नाम भरें।`, 'warning');
                return;
            }
        }

        const registrationPayload = {
            // The form uses the official E01-style display ID, while the
            // registrations foreign key must reference the real public.events
            // primary key (for example, music_classical_vocal).
            event_id: currentSelectedEvent.legacy_id || eventId,
            event_name: currentSelectedEvent.name,
            category: category,
            college_name: collegeName,
            college_id: collegeId,
            participant_name: participantName,
            father_name: fatherName,
            gender: gender,
            class_name: className,
            roll_no: rollNo,
            dob: dob,
            phone: phone,
            email: email,
            team_manager_name: tmName,
            team_manager_phone: tmPhone,
            team_manager_email: tmEmail,
            team_members: teamMembers,
            accompanists: accompanists,
            status: 'Eligible',
            chest_number: Math.floor(100 + Math.random() * 900)
        };

        try {
            // Save to DB (Supabase + Local sync)
            const saved = await DBService.addRegistration(registrationPayload);

            // Celebration confetti
            if (window.NativeUI) NativeUI.celebrate();

            // Reset form
            document.getElementById('registration-form').reset();
            resetDynamicFormSections();

            // Open I-Card / Registration Slip modal
            openPrintCardModal(saved.id);

            const syncWarning = saved.cloud_sync_error
                ? `<p class="text-xs text-amber-300 mt-2"><strong>Cloud sync warning:</strong> ${saved.cloud_sync_error}</p>`
                : '';
            Swal.fire({
                icon: saved.cloud_sync_error ? 'warning' : 'success',
                title: saved.cloud_sync_error ? 'पंजीकरण स्थानीय रूप से सुरक्षित' : 'पंजीकरण सफल! (Registration Successful)',
                html: `
                    <div class="text-left text-sm text-gray-200">
                        <p>पंजीकरण आईडी: <strong class="text-amber-400 font-mono text-base">${saved.id}</strong></p>
                        <p>इवेंट: <strong>${saved.event_name}</strong></p>
                        <p class="text-xs text-gray-400 mt-2">आपकी ऑफिशियल स्लिप और आई-कार्ड तैयार है। इसे सुरक्षित रखें व प्रिंट करें।</p>
                        ${syncWarning}
                    </div>
                `,
                confirmButtonText: 'आई-कार्ड देखें व प्रिंट करें',
                confirmButtonColor: '#d97706'
            });

            // Update stats
            updateLiveStats();
        } catch (err) {
            Swal.fire('त्रुटि', 'पंजीकरण सहेजने में विफल: ' + err.message, 'error');
        }
    }

    // 4. PRINT & DOWNLOAD I-CARD / REGISTRATION SLIP
    async function openPrintCardModal(regId) {
        const reg = await DBService.getRegistrationById(regId);
        if (!reg) {
            Swal.fire('नहीं मिला', 'पंजीकरण विवरण नहीं मिला।', 'error');
            return;
        }

        document.getElementById('card-id-display').textContent = reg.id;
        document.getElementById('card-name-display').textContent = reg.participant_name;
        document.getElementById('card-college-display').textContent = reg.college_name;
        document.getElementById('card-class-display').textContent = reg.class_name || 'Not provided';
        document.getElementById('card-department-display').textContent = reg.class_name || 'Not provided';
        document.getElementById('card-roll-display').textContent = reg.roll_no || 'Not provided';
        
        const dobDisplay = document.getElementById('card-dob-display');
        if (dobDisplay) {
            dobDisplay.textContent = reg.dob ? `${reg.dob} (पात्र)` : 'N/A';
        }

        const categoryDisplay = document.getElementById('card-category-display');
        if (categoryDisplay) {
            categoryDisplay.textContent = reg.category || 'Not provided';
        }
        document.getElementById('card-event-display').textContent = reg.event_name || 'Not provided';

        // Team members list inside slip
        const membersDiv = document.getElementById('card-members-container');
        if (reg.team_members && reg.team_members.length > 0) {
            membersDiv.classList.remove('hidden');
            membersDiv.innerHTML = `
                <div class="mt-2 pt-2 border-t border-dashed border-gray-300">
                    <p class="font-bold text-[11px] uppercase text-gray-800">सह-प्रतिभागी (Team Members - ${reg.team_members.length}):</p>
                    <p class="text-[11px] text-gray-700 leading-relaxed">
                        ${reg.team_members.map((m, i) => `${i + 1}. ${m.name} (${m.roll_no || 'Roll: -'})`).join(' • ')}
                    </p>
                </div>
            `;
        } else {
            membersDiv.classList.add('hidden');
            membersDiv.innerHTML = '';
        }

        // Accompanists list inside slip
        const accompDiv = document.getElementById('card-accomp-container');
        if (reg.accompanists && reg.accompanists.length > 0) {
            accompDiv.classList.remove('hidden');
            accompDiv.innerHTML = `
                <div class="mt-1 pt-1 border-t border-dashed border-gray-300">
                    <p class="font-bold text-[11px] uppercase text-gray-800">संगतकार (Accompanists - ${reg.accompanists.length}):</p>
                    <p class="text-[11px] text-gray-700 leading-relaxed">
                        ${reg.accompanists.map((a, i) => `${i + 1}. ${a.name} (${a.type}: ${a.instrument || 'Instrument'})`).join(' • ')}
                    </p>
                </div>
            `;
        } else {
            accompDiv.classList.add('hidden');
            accompDiv.innerHTML = '';
        }

        document.getElementById('icard-modal').classList.remove('hidden');
    }

    function closePrintCardModal() {
        document.getElementById('icard-modal').classList.add('hidden');
    }

    function printRegistrationCard() {
        const card = document.getElementById('icard-printable-area');
        const stylesheet = document.querySelector('link[href="assets/css/style.css"]')?.href;
        if (!card || !stylesheet) {
            Swal.fire('I-card unavailable', 'The I-card is not ready yet. Please find the registration again and try once more.', 'error');
            return;
        }

        const printWindow = window.open('', 'cdlu-icard-print', 'width=680,height=860');
        if (!printWindow) {
            Swal.fire('Print blocked', 'Please allow pop-ups for this site, then try printing the I-card again.', 'warning');
            return;
        }

        printWindow.document.write(`<!doctype html>
            <html><head><meta charset="utf-8"><title>CDLU I-card</title>
            <link rel="stylesheet" href="${stylesheet}">
            <style>
                @page { size: A4 portrait; margin: 0; }
                html, body { margin: 0; padding: 0; background: #fff; }
                body { min-height: auto; display: flex; justify-content: center; align-items: flex-start; padding-top: 18mm; }
                #icard-printable-area { position: relative !important; inset: auto !important; width: 410px !important; max-width: 410px !important; margin: 0 !important; break-inside: avoid !important; page-break-inside: avoid !important; }
            </style></head><body>${card.outerHTML}</body></html>`);
        printWindow.document.close();
        const startPrint = () => {
            printWindow.focus();
            printWindow.print();
        };
        printWindow.onload = startPrint;
        window.setTimeout(startPrint, 500);
    }

    // 5. SEARCH & STATUS LOOKUP
    async function lookupRegistration(query) {
        if (!query || !query.trim()) {
            Swal.fire('खोज दर्ज करें', 'कृपया रोल नंबर या पंजीकरण आईडी दर्ज करें।', 'warning');
            return;
        }

        const cleanQ = query.trim().toLowerCase();
        let found;
        try {
            found = await DBService.getRegistrationById(query.trim());
            if (!found) {
                const registrations = await DBService.getRegistrations('All');
                found = registrations.find(registration =>
                    [registration.id, registration.roll_no, registration.chest_number]
                        .some(value => String(value || '').trim().toLowerCase() === cleanQ)
                );
            }
        } catch (error) {
            console.error('Registration lookup failed:', error);
            Swal.fire('Lookup failed', error.message || 'Could not search registrations. Please try again.', 'error');
            return;
        }

        if (!found) {
            Swal.fire({
                icon: 'error',
                title: 'रिकॉर्ड नहीं मिला',
                html: `'${query}' के साथ कोई पंजीकरण नहीं मिला।<br><br><small>सही पंजीकरण आईडी (उदाहरण: CDLU-TYM-2026-001), विश्वविद्यालय रोल नंबर या चेस्ट नंबर दर्ज करें। यदि अभी पंजीकरण किया है, तो सफलता संदेश में दी गई आईडी का उपयोग करें।</small>`
            });
            return;
        }

        openPrintCardModal(found.id);
    }

    // 6. EVENT EXPLORER VIEW
    async function renderEventExplorer(category = 'All') {
        const events = await DBService.getEvents(category);
        const container = document.getElementById('events-explorer-grid');
        if (!container) return;

        // Retrieve master list to compute total counts and persistent item numbering
        const allEvents = (category === 'All') ? events : await DBService.getEvents('All');

        // Update competition count in the right upper area of this chart
        const countDisplay = document.getElementById('chart-competition-count');
        if (countDisplay) {
            if (category === 'All') {
                countDisplay.textContent = `${events.length}`;
            } else {
                countDisplay.textContent = `${events.length} (${category})`;
            }
        }

        // Update active styling on filter buttons
        document.querySelectorAll('#events-section .category-filter-btn').forEach(btn => {
            const btnCat = btn.getAttribute('data-category');
            if (btnCat === category) {
                btn.classList.add('ring-2', 'ring-amber-400', 'bg-amber-500', 'text-gray-950');
            } else {
                btn.classList.remove('ring-2', 'ring-amber-400', 'bg-amber-500', 'text-gray-950');
            }
        });

        container.innerHTML = events.map(evt => {
            let catColor = 'indigo';
            if (evt.category === 'Music') catColor = 'emerald';
            else if (evt.category === 'Dance') catColor = 'rose';
            else if (evt.category === 'Theatre') catColor = 'purple';
            else if (evt.category === 'Literary') catColor = 'sky';
            else if (evt.category === 'Fine Arts') catColor = 'amber';
            else if (evt.category === 'Procession') catColor = 'pink';

            const evtAge = (DBService.getOfficialEventAgeLimit) ? 
                DBService.getOfficialEventAgeLimit(evt.id, evt.name) : 
                evt.age_limit;

            // Competition Item Number (#01 to #35)
            const itemIdx = allEvents.findIndex(e => e.id === evt.id);
            const itemNum = itemIdx >= 0 ? String(itemIdx + 1).padStart(2, '0') : '';

            return `
                <div class="bg-gray-800/70 border border-gray-700/80 hover:border-${catColor}-500/50 rounded-2xl p-5 hover:bg-gray-800 transition duration-300 shadow-xl flex flex-col justify-between group">
                    <div>
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <div class="flex items-center gap-1.5">
                                ${itemNum ? `
                                    <span class="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-gray-900 text-amber-400 border border-gray-700/80 shadow-inner" title="Competition Item #${itemNum}">
                                        #${itemNum}
                                    </span>
                                ` : ''}
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-${catColor}-500/20 text-${catColor}-300 border border-${catColor}-500/30">
                                    ${evt.category}
                                </span>
                            </div>
                            <span class="text-xs text-gray-400 font-mono flex items-center gap-1">
                                <i class="fas fa-clock text-amber-400"></i> ${evt.time_limit || 'Standard'}
                            </span>
                        </div>
                        <h4 class="text-lg font-bold text-white group-hover:text-amber-400 transition mb-1.5 leading-snug">
                            ${evt.name}
                        </h4>
                        <p class="text-xs text-gray-300 font-medium mb-3">${evt.description || ''}</p>
                        <div class="bg-gray-900/60 p-2.5 rounded-xl border border-gray-800 text-xs text-gray-400 space-y-1 mb-4">
                            <div class="flex items-center gap-1.5 text-gray-300">
                                <i class="fas fa-map-marker-alt text-rose-400"></i>
                                <span><strong>स्थल:</strong> ${evt.stage || 'Stage'}</span>
                            </div>
                            <div class="flex items-center gap-1.5 text-gray-300">
                                <i class="fas fa-users text-blue-400"></i>
                                <span><strong>प्रतिभागी:</strong> ${evt.participants_max > 1 ? `टीम (Min ${evt.participants_min} - Max ${evt.participants_max})` : 'एकल (Solo - 1)'}</span>
                            </div>
                            ${evt.accompanists_max > 0 ? `
                                <div class="flex items-center gap-1.5 text-gray-300">
                                    <i class="fas fa-guitar text-amber-400"></i>
                                    <span><strong>संगतकार:</strong> अधिकतम ${evt.accompanists_max}</span>
                                </div>
                            ` : ''}
                            <div class="flex items-center gap-1.5 text-gray-300 pt-1 border-t border-gray-800/80">
                                <i class="fas fa-calendar-check ${evtAge ? 'text-amber-400' : 'text-emerald-400'}"></i>
                                <span><strong>आयु सीमा:</strong> ${evtAge ? `<span class="text-amber-300 font-bold">${evtAge} वर्ष (1 जुलाई 2026 तक)</span>` : '<span class="text-emerald-300 font-bold">कोई सीमा नहीं (No Limit)</span>'}</span>
                            </div>
                        </div>
                    </div>

                    <button onclick="App.quickSelectEventForReg('${evt.category}', '${evt.id}')" class="w-full py-2.5 rounded-xl bg-gray-700/80 hover:bg-amber-500 hover:text-gray-950 text-gray-200 font-bold text-xs transition flex items-center justify-center gap-2">
                        <i class="fas fa-user-plus"></i> इस इवेंट में पंजीकरण करें
                    </button>
                </div>
            `;
        }).join('');
    }

    function quickSelectEventForReg(category, eventId) {
        const catSelect = document.getElementById('reg-category');
        catSelect.value = category;
        onCategoryChange(category).then(() => {
            const eventSelect = document.getElementById('reg-event');
            eventSelect.value = eventId;
            onEventChange(eventId);
            // Scroll to form
            document.getElementById('registration-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 7. STATS COUNTER UPDATE
    async function updateLiveStats() {
        const regs = await DBService.getRegistrations('All');
        let totalStudents = 0;
        const uniqueColleges = new Set();

        regs.forEach(r => {
            totalStudents += 1;
            if (r.team_members) totalStudents += r.team_members.length;
            if (r.college_name) uniqueColleges.add(r.college_name.trim());
        });

        document.getElementById('hero-stat-students').textContent = totalStudents;
        document.getElementById('hero-stat-teams').textContent = regs.length;
        document.getElementById('hero-stat-colleges').textContent = uniqueColleges.size || 29;

        const heroEvtCount = document.getElementById('hero-stat-events');
        if (heroEvtCount) {
            const allEvts = await DBService.getEvents('All');
            heroEvtCount.textContent = allEvts.length || 35;
        }
    }

    // 8. MOBILE NAVIGATION & DRAWER
    function openMobileMenu() {
        const sidebar = document.getElementById('mobile-sidebar');
        const backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (sidebar && backdrop) {
            sidebar.classList.remove('-translate-x-full');
            sidebar.classList.add('translate-x-0');
            backdrop.classList.remove('opacity-0', 'pointer-events-none');
            backdrop.classList.add('opacity-100', 'pointer-events-auto');
            document.body.classList.add('overflow-hidden');
        }
    }

    function closeMobileMenu() {
        const sidebar = document.getElementById('mobile-sidebar');
        const backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (sidebar && backdrop) {
            sidebar.classList.add('-translate-x-full');
            sidebar.classList.remove('translate-x-0');
            backdrop.classList.add('opacity-0', 'pointer-events-none');
            backdrop.classList.remove('opacity-100', 'pointer-events-auto');
            document.body.classList.remove('overflow-hidden');
        }
    }

    // Close on resize to desktop & on Escape key
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) closeMobileMenu();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
    });

    return {
        init: async function() {
            initCarousel();
            await loadEventsData();
            await updateLiveStats();
        },
        nextSlide,
        prevSlide,
        showSlide,
        onCategoryChange,
        onEventChange,
        onDobChange,
        addTeamMember,
        removeTeamMember,
        updateTeamMember,
        renderTeamMembers,
        addAccompanist,
        removeAccompanist,
        updateAccompanist,
        handleRegistrationSubmit,
        openPrintCardModal,
        closePrintCardModal,
        printRegistrationCard,
        lookupRegistration,
        renderEventExplorer,
        quickSelectEventForReg,
        updateLiveStats,
        openMobileMenu,
        closeMobileMenu
    };
})();

window.App = App;
