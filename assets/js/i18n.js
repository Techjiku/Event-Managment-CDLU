(function() {
    const pairs = [
        ['Home', 'होम'],
        ['Events', 'कार्यक्रम'],
        ['Registration', 'पंजीकरण'],
        ['I-card Lookup', 'आई-कार्ड खोजें'],
        ['Programme Guide', 'कार्यक्रम मार्गदर्शिका'],
        ['Register Now', 'अभी पंजीकरण करें'],
        ['Register', 'पंजीकरण'],
        ['Menu', 'मेनू'],
        ['Competitions & Events', 'प्रतियोगिताएं एवं कार्यक्रम'],
        ['Student & Team Registration', 'विद्यार्थी एवं दल पंजीकरण'],
        ['I-Card Lookup & Download', 'आई-कार्ड खोजें एवं डाउनलोड करें'],
        ['Programme Guide (PDF)', 'कार्यक्रम मार्गदर्शिका (PDF)'],
        ['Navigation Menu', 'नेविगेशन मेनू'],
        ['Close navigation menu', 'नेविगेशन मेनू बंद करें'],
        ['Open Navigation Menu', 'नेविगेशन मेनू खोलें'],
        ['CDLU Sirsa', 'सीडीएलयू सिरसा'],
        ['Directorate of Youth Welfare', 'युवा कल्याण निदेशालय'],
        ['13th Triveni Yuva Mahotsav 2026', '13वां त्रिवेणी युवा महोत्सव 2026'],
        ['Student Portal', 'विद्यार्थी पोर्टल'],
        ['e.g. judge.music@cdlu.ac.in', 'उदा. judge.music@cdlu.ac.in'],
        ['Change language', 'भाषा बदलें'],
        ['Chaudhary Devi Lal University', 'चौधरी देवीलाल विश्वविद्यालय'],
        ['Sirsa, Haryana', 'सिरसा, हरियाणा'],
        ['Restricted Official Access', 'केवल अधिकृत उपयोगकर्ताओं के लिए'],
        ['Official portal login', 'आधिकारिक पोर्टल लॉगिन'],
        ['Judge Login', 'निर्णायक लॉगिन'],
        ['Admin Login', 'प्रशासक लॉगिन'],
        ['Officer Login', 'अधिकारी लॉगिन'],
        ['Super Admin', 'मुख्य प्रशासक'],
        ['विश्वविद्यालय प्रशासन', 'University administration'],
        ['13वां त्रिवेणी युवा महोत्सव 2026 • चौधरी देवी लाल विश्वविद्यालय, सिरसा', '13th Triveni Yuva Mahotsav 2026 • Chaudhary Devi Lal University, Sirsa'],
        ['कॉलेज परिणाम (Final Results)', 'महाविद्यालय परिणाम (अंतिम परिणाम)'],
        ['महाविद्यालय-वार एवं श्रेणी-वार परिणाम', 'College-wise and category-wise results'],
        ['केवल अंतिम (locked) जज स्कोर जोड़े जाते हैं। बराबर कुल स्कोर पर समान रैंक दी जाएगी।', 'Only finalized (locked) judge scores are added. Equal totals share the same rank.'],
        ['Final scores are loading...', 'अंतिम स्कोर लोड हो रहे हैं...'],
        ['College standings · summed locked judge scores', 'महाविद्यालय रैंकिंग · अंतिम जज स्कोर का योग'],
        ['Event-wise final scores and team details', 'कार्यक्रम-वार अंतिम स्कोर एवं दल का विवरण'],
        ['Rank', 'रैंक'],
        ['Event count', 'कार्यक्रमों की संख्या'],
        ['Entries in this view', 'इस दृश्य में कुल प्रविष्टियां'],
        ['Entries with locked scores', 'लॉक किए गए स्कोर वाली प्रविष्टियां'],
        ['Pending', 'लंबित'],
        ['All score statuses', 'सभी स्कोर स्थितियां'],
        ['Finalized scores only', 'केवल अंतिम स्कोर'],
        ['Pending only', 'केवल लंबित'],
        ['Declare results', 'परिणाम घोषित करें'],
        ['All entries in the selected result view are finalized. Review the winners, then confirm to print the official result sheet.', 'चुने गए परिणाम दृश्य की सभी प्रविष्टियां अंतिम हैं। विजेताओं की समीक्षा करें, फिर आधिकारिक परिणाम पत्रक प्रिंट करने की पुष्टि करें।'],
        ['Declare and print', 'घोषित करें और प्रिंट करें'],
        ['Review results', 'परिणाम की समीक्षा करें'],
        ['Results are not ready', 'परिणाम अभी तैयार नहीं हैं'],
        ['Broaden the results view', 'परिणाम दृश्य का दायरा बढ़ाएं'],
        ['To declare fair standings, reset the college filter, status filter, and search field first.', 'निष्पक्ष रैंकिंग घोषित करने के लिए पहले महाविद्यालय, स्थिति और खोज फ़िल्टर हटाएं।'],
        ['Search colleges, participants or chest number', 'महाविद्यालय, प्रतिभागी या चेस्ट नंबर खोजें'],
        ['A college is ranked only when every registered entry in the selected view has a locked score from every assigned judge. Tied totals share the same rank.', 'किसी महाविद्यालय को तभी रैंक मिलेगी जब चुने गए दृश्य की हर प्रविष्टि पर सभी नियुक्त निर्णायकों के लॉक किए गए अंक हों। बराबर कुल स्कोर पर समान रैंक होगी।'],
        ['Team / registration', 'दल / पंजीकरण'],
        ['Judge score breakdown', 'जज स्कोर का विवरण'],
        ['Event total', 'कार्यक्रम का कुल स्कोर'],
        ['Tied totals share the same rank. Pending entries are not ranked until a judge locks a score.', 'बराबर कुल स्कोर पर समान रैंक दी जाएगी। निर्णायक द्वारा स्कोर लॉक करने तक लंबित प्रविष्टियों की रैंक नहीं होगी।'],
        ['No registered college entries match these filters.', 'इन फ़िल्टर के लिए कोई महाविद्यालय प्रविष्टि नहीं मिली।'],
        ['No registered event entries match these filters.', 'इन फ़िल्टर के लिए कोई कार्यक्रम प्रविष्टि नहीं मिली।'],
        ['13th Triveni Yuva Mahotsav 2026 — Final Results', '13वां त्रिवेणी युवा महोत्सव 2026 — अंतिम परिणाम'],
        ['Final score', 'अंतिम स्कोर'],
        ['Judge submissions', 'जजों द्वारा सबमिट स्कोर'],
        ['Number of judges', 'जजों की संख्या'],
        ['Authorized judges', 'अधिकृत जज'],
        ['कुल पंजीकृत प्रतिभागी', 'Registered participants'],
        ['कुल प्रविष्टियां / दल', 'Total entries / teams'],
        ['संबद्ध महाविद्यालय', 'Affiliated colleges'],
        ['अधिकृत जज व स्कोर', 'Authorized judges and scores'],
        ['श्रेणी अनुसार पंजीकरण (Category Breakdown)', 'Registrations by category'],
        ['समीक्षा (Overview)', 'Overview'],
        ['पंजीकृत छात्र (Students)', 'Registered students'],
        ['जज प्रबंधन (Judges)', 'Judge management'],
        ['लाइव स्कोरबोर्ड (Results)', 'Live scoreboard'],
        ['डेटाबेस (DB Status)', 'Database status'],
        ['रिफ्रेश', 'Refresh'],
        ['लॉगआउट', 'Logout'],
        ['No locked score', 'कोई अंतिम स्कोर नहीं'],
        ['Finalized', 'अंतिम रूप से सबमिट'],
        ['Submitted · score hidden', 'सबमिट हो गया · स्कोर छिपा है'],
        ['Draft score', 'ड्राफ्ट स्कोर'],
        ['Score submitted', 'स्कोर सबमिट हो गया'],
        ['This final score is locked and hidden from the judge workspace.', 'यह अंतिम स्कोर लॉक है और निर्णायक डैशबोर्ड में नहीं दिखेगा।'],
        ['Excel', 'एक्सेल'],
        ['PDF / Print', 'PDF / प्रिंट'],
        ['Student', 'विद्यार्थी'],
        ['Stage Incharge', 'स्टेज प्रभारी'],
        ['Role Architecture & Responsibilities:', 'भूमिकाएं एवं जिम्मेदारियां:'],
        ['(Authorized Judge)', '(अधिकृत निर्णायक)'],
        ['(Evaluation sheet)', '(मूल्यांकन सूची)'],
        ['Judge workspace · Live evaluation', 'निर्णायक डैशबोर्ड · लाइव मूल्यांकन'],
        ['Evaluation overview', 'मूल्यांकन सारांश'],
        ['Assigned events', 'असाइन किए गए कार्यक्रम'],
        ['Entries', 'प्रविष्टियां'],
        ['Evaluated', 'मूल्यांकित'],
        ['Pending evaluations', 'शेष मूल्यांकन'],
        ['All statuses', 'सभी स्थितियां'],
        ['Pending', 'लंबित'],
        ['Evaluated', 'मूल्यांकित'],
        ['Refresh', 'रीफ्रेश'],
        ['Logout', 'लॉगआउट'],
        ['Student & Team Registration Form', 'विद्यार्थी एवं दल पंजीकरण फॉर्म'],
        ['Student registration', 'विद्यार्थी पंजीकरण'],
        ['Student & team registration', 'विद्यार्थी एवं दल पंजीकरण'],
        ['Registered students', 'पंजीकृत विद्यार्थी'],
        ['Registered teams', 'पंजीकृत दल'],
        ['Affiliated colleges', 'संबद्ध महाविद्यालय'],
        ['Youth festival competitions', 'युवा महोत्सव प्रतियोगिताएं'],
        ['Registration status and I-card download', 'पंजीकरण स्थिति एवं आई-कार्ड डाउनलोड'],
        ['Enter your CDLU roll number or registration ID to download your official I-card.', 'अपना CDLU रोल नंबर या पंजीकरण आईडी दर्ज करके आधिकारिक आई-कार्ड डाउनलोड करें।'],
        ['Search', 'खोजें'],
        ['Search', 'खोजें'],
        ['Student and team online registration', 'विद्यार्थी एवं दल ऑनलाइन पंजीकरण'],
        ['Select event category and competition', 'कार्यक्रम श्रेणी एवं प्रतियोगिता चुनें'],
        ['Event Selection', 'कार्यक्रम चुनें'],
        ['Category', 'श्रेणी'],
        ['Select Category', 'श्रेणी चुनें'],
        ['Event Name', 'कार्यक्रम का नाम'],
        ['Select Affiliated College', 'संबद्ध महाविद्यालय चुनें'],
        ['College / Institute Details', 'महाविद्यालय / संस्थान का विवरण'],
        ['Primary Participant Details', 'मुख्य प्रतिभागी का विवरण'],
        ['Full Name', 'पूरा नाम'],
        ["Father's Name", 'पिता का नाम'],
        ['Gender', 'लिंग'],
        ['Male', 'पुरुष'],
        ['Female', 'महिला'],
        ['Other', 'अन्य'],
        ['Class / Semester', 'कक्षा / सेमेस्टर'],
        ['University Roll No', 'विश्वविद्यालय रोल नंबर'],
        ['Date of Birth', 'जन्म तिथि'],
        ['Mobile No', 'मोबाइल नंबर'],
        ['Email ID', 'ईमेल आईडी'],
        ['Other Team Members', 'दल के अन्य सदस्य'],
        ['Accompanists', 'सहयोगी कलाकार'],
        ['Submit Registration', 'पंजीकरण जमा करें'],
        ['Submit', 'जमा करें'],
        ['Download I-card', 'आई-कार्ड डाउनलोड करें'],
        ['View Details', 'विवरण देखें'],
        ['No registrations found.', 'कोई पंजीकरण नहीं मिला।'],
        ['No participants are registered yet', 'अभी तक कोई प्रतिभागी पंजीकृत नहीं है'],
        ['No matches', 'कोई मिलान नहीं मिला'],
        ['Search by name, college, chest number or roll number...', 'नाम, कॉलेज, चेस्ट नंबर या रोल नंबर से खोजें...'],
        ['Filter by event', 'कार्यक्रम के अनुसार छांटें'],
        ['All statuses', 'सभी स्थितियां'],
        ['Official Judge Scorecard', 'आधिकारिक निर्णायक स्कोरकार्ड'],
        ['Performance Scorecard', 'प्रस्तुति मूल्यांकन पत्रक'],
        ['Awarded Score', 'प्राप्त अंक'],
        ['Judge Remarks - Optional', 'निर्णायक की टिप्पणी - वैकल्पिक'],
        ['Save Draft', 'ड्राफ्ट सहेजें'],
        ['Final Lock', 'अंतिम रूप से लॉक करें'],
        ['Cancel', 'रद्द करें'],
        ['Score', 'अंक'],
        ['Evaluate', 'मूल्यांकन करें'],
        ['Edit', 'संपादित करें'],
        ['Search by roll number or registration ID...', 'रोल नंबर या पंजीकरण आईडी से खोजें...'],
        ['Search by student, college, roll number or registration ID...', 'विद्यार्थी, कॉलेज, रोल नंबर या पंजीकरण आईडी से खोजें...'],
        ['Judge secure login', 'जज सुरक्षित लॉगिन'],
        ['Enter your official email address assigned by the administrator', 'प्रशासक द्वारा दी गई अपनी आधिकारिक ईमेल आईडी दर्ज करें'],
        ['Assigned email address', 'असाइन की गई ईमेल आईडी'],
        ['Security PIN', 'सिक्योरिटी पिन (Security PIN)'],
        ['Default: 1234', 'डिफ़ॉल्ट: 1234'],
        ['Log in to the judge portal', 'जज पोर्टल में लॉगिन करें'],
        ['Choose an authorized judge for quick testing:', 'त्वरित परीक्षण हेतु अधिकृत जज चुनें (1-Click Test):'],
        ['Administrator authentication', 'एडमिन प्रमाणीकरण'],
        ['Stage administrator login', 'स्टेज एडमिन लॉगिन'],
        ['University youth festival management system', 'केंद्रीय विश्वविद्यालय यूथ फेस्टिवल प्रबंधन प्रणाली'],
        ['Administrator email address', 'एडमिन ईमेल आईडी'],
        ['Secure password', 'सुरक्षित पासवर्ड'],
        ['Enter the administrator console', 'एडमिन कंसोल में प्रवेश करें'],
        ['Quick administrator login:', 'त्वरित एडमिन लॉगिन (1-Click Test):'],
        ['Authorized judge', 'अधिकृत निर्णायक'],
        ['Evaluation sheet', 'मूल्यांकन सूची'],
        ['Solo performance: up to 10 points · Group performance: up to 20 points', 'एकल प्रस्तुति: अधिकतम 10 अंक · समूह प्रस्तुति: अधिकतम 20 अंक'],
        ['Select event', 'इवेंट चुनें (Filter by event)'],
        ['Assigned events', 'असाइन किए गए कार्यक्रम'],
        ['Entries in this list', 'इस सूची में प्रविष्टियां'],
        ['Evaluated', 'मूल्यांकित'],
        ['Pending evaluations', 'शेष मूल्यांकन'],
        ['Refresh', 'रीफ्रेश'],
        ['Log out', 'लॉगआउट'],
        ['Confidential judge remarks / observations (optional):', 'जज की गोपनीय टिप्पणी / अवलोकन (Judge Remarks - Optional):'],
        ['Enter notes on performance, rhythm, coordination, or other observations...', 'प्रस्तुति, लय, समन्वय अथवा विशिष्ट टिप्पणी दर्ज करें...'],
        ['Save draft', 'ड्राफ्ट सहेजें (Save Draft)'],
        ['Submit and lock', 'सबमिट एवं लॉक करें (Final Lock)'],
        ['Cancel', 'रद्द करें'],
        ['Group performance', 'समूह प्रस्तुति'],
        ['Solo performance', 'एकल प्रस्तुति'],
        ['No participants are registered yet', 'अभी तक कोई प्रतिभागी पंजीकृत नहीं है'],
        ['Participants will appear here when registrations are received for this event.', 'इस इवेंट के लिए विद्यार्थी पंजीकरण प्राप्त होने पर यहाँ प्रदर्शित होंगे।'],
        ['No matches found', 'कोई मिलान नहीं मिला (No matches)'],
        ['Try changing the search term or evaluation status.', 'खोज शब्द या मूल्यांकन स्थिति बदलकर देखें।'],
        ['Loading evaluation list...', 'मूल्यांकन सूची लोड हो रही है...'],
        ['No registrations have been received.', 'कोई पंजीकरण प्राप्त नहीं हुआ।'],
        ['Email is required', 'ईमेल आवश्यक है'],
        ['Access denied', 'प्रवेश अस्वीकृत (Access Denied)'],
        ['Login successful', 'सफल लॉगिन'],
        ['Login failed', 'लॉगिन विफल (Login Failed)'],
        ['Logged out successfully', 'लॉगआउट सफल'],
        ['Enter your details', 'विवरण भरें'],
        ['Login successful', 'सफल लॉगिन'],
        ['Administrator login successful!', 'एडमिन लॉगिन सफल!'],
        ['Administrator logged out successfully', 'एडमिन लॉगआउट सफल'],
        ['Enter your administrator email and password.', 'कृपया एडमिन ईमेल और पासवर्ड दर्ज करें।'],
        ['Overview', 'समीक्षा (Overview)'],
        ['Registered students', 'पंजीकृत विद्यार्थी'],
        ['Judge management', 'जज प्रबंधन'],
        ['Live scoreboard', 'लाइव स्कोरबोर्ड (Results)'],
        ['Database status', 'डेटाबेस स्थिति'],
        ['Total registered participants', 'कुल पंजीकृत प्रतिभागी'],
        ['Total entries / teams', 'कुल प्रविष्टियां / दल'],
        ['Affiliated colleges', 'संबद्ध महाविद्यालय'],
        ['Authorized judges and scores', 'अधिकृत जज व स्कोर'],
        ['Registrations by category', 'श्रेणी अनुसार पंजीकरण (Category Breakdown)'],
        ['Judge management', 'जज प्रबंधन'],
        ['Add judge', 'जज जोड़ें'],
        ['Judge full name', 'जज का पूरा नाम'],
        ['Institution / department', 'संस्थान / विभाग'],
        ['Mobile number', 'मोबाइल नंबर'],
        ['Database status', 'डेटाबेस स्थिति'],
        ['Check connection', 'कनेक्शन जांचें'],
        ['Reset data', 'डेटा रीसेट करें'],
        ['Roles and responsibilities:', 'भूमिका एवं कार्य विभाजन (Role Architecture & Responsibilities):'],
        ['1. Student (Public)', '1. विद्यार्थी (सार्वजनिक)'],
        ['2. Judge', '2. निर्णायक'],
        ['3. Stage In-charge', '3. स्टेज प्रभारी'],
        ['4. Super Admin', '4. मुख्य प्रशासक'],
        ['Administrator login', 'Admin / Super Admin (प्रशासन लॉगिन)'],
        ['(Judge)', '(निर्णायक)'],
        ['(Administrator)', '(प्रशासक)'],
        ['(Super Administrator)', '(मुख्य प्रशासक)'],
        ['Stage operations and coordination access', 'स्टेज संचालन एवं समन्वय प्रवेश'],
        ['Stage admin email', 'स्टेज एडमिन ईमेल'],
        ['Enter stage admin console', 'स्टेज एडमिन कंसोल में प्रवेश करें'],
        ['Stage coordinator demo access', 'स्टेज समन्वयक डेमो प्रवेश'],
        ['Fill demo credentials', 'डेमो लॉगिन विवरण भरें'],
        ['Super Admin login', 'सुपर एडमिन लॉगिन'],
        ['University-wide control and festival management', 'विश्वविद्यालय-स्तरीय नियंत्रण एवं महोत्सव प्रबंधन'],
        ['Super Admin email', 'सुपर एडमिन ईमेल'],
        ['Enter Super Admin console', 'सुपर एडमिन कंसोल में प्रवेश करें'],
        ['Super Admin demo access', 'सुपर एडमिन डेमो प्रवेश'],
        ['Main Navigation', 'मुख्य नेविगेशन'],
        ['Choose Category', 'श्रेणी चुनें'],
        ['Choose Event', 'कार्यक्रम चुनें'],
        ['Select Event', 'कार्यक्रम चुनें'],
        ['Student & Team Online Registration', 'विद्यार्थी एवं दल ऑनलाइन पंजीकरण'],
        ['Current registration status', 'वर्तमान पंजीकरण स्थिति'],
        ['Roll No. or Reg ID', 'रोल नंबर या पंजीकरण आईडी'],
        ['Solo performance: up to 10 points · Group performance: up to 20 points', 'एकल प्रस्तुति: अधिकतम 10 अंक · समूह प्रस्तुति: अधिकतम 20 अंक'],
        ['Official access for authorized judges, stage coordinators and university administrators.', 'यह पोर्टल केवल अधिकृत निर्णायकों, स्टेज समन्वयकों और विश्वविद्यालय प्रशासकों के लिए है।'],
        ['Enter your official email address assigned by the administrator', 'प्रशासक द्वारा दी गई अपनी आधिकारिक ईमेल आईडी दर्ज करें'],
        ['Your college / institute', 'आपका महाविद्यालय / संस्थान'],
        ['Participant Details', 'प्रतिभागी का विवरण'],
        ['Registration Form', 'पंजीकरण फॉर्म'],
        ['Official Event Portal', 'आधिकारिक कार्यक्रम पोर्टल'],
        ['Solo', 'एकल'],
        ['Group', 'समूह'],
        ['Score', 'अंक'],
        ['Marks', 'अंक'],
        ['First Name', 'पहला नाम'],
        ['Last Name', 'अंतिम नाम'],
        ['Search Events', 'कार्यक्रम खोजें'],
        ['All Categories', 'सभी श्रेणियां'],
        ['All Events', 'सभी कार्यक्रम'],
        ['All', 'सभी'],
        ['Name', 'नाम'],
        ['College', 'महाविद्यालय'],
        ['Roll Number', 'रोल नंबर'],
        ['Phone Number', 'फोन नंबर'],
        ['Email', 'ईमेल'],
        ['Participant', 'प्रतिभागी'],
        ['Participants', 'प्रतिभागी'],
        ['Team', 'दल'],
        ['Teams', 'दल'],
        ['Event', 'कार्यक्रम'],
        ['Status', 'स्थिति'],
        ['Date', 'तिथि'],
        ['Time', 'समय'],
        ['Stage', 'मंच'],
        ['Venue', 'स्थान'],
        ['Rules and Guidelines', 'नियम एवं दिशा-निर्देश'],
        ['Maximum participants', 'अधिकतम प्रतिभागी'],
        ['Age limit', 'आयु सीमा'],
        ['Registration successful', 'पंजीकरण सफल'],
        ['Registration failed', 'पंजीकरण विफल'],
        ['Please wait...', 'कृपया प्रतीक्षा करें...'],
        ['Loading...', 'लोड हो रहा है...'],
        ['No data available', 'कोई डेटा उपलब्ध नहीं है'],
        ['Are you sure?', 'क्या आप निश्चित हैं?'],
        ['Confirm', 'पुष्टि करें'],
        ['Close', 'बंद करें'],
        ['Download', 'डाउनलोड करें'],
        ['Print', 'प्रिंट करें'],
        ['View', 'देखें'],
        ['Edit', 'संपादित करें'],
        ['Delete', 'हटाएं'],
        ['Save', 'सहेजें'],
        ['Add', 'जोड़ें'],
        ['Update', 'अपडेट करें'],
        ['Welcome', 'स्वागत है'],
        ['Successfully submitted', 'सफलतापूर्वक जमा हुआ'],
        ['1. Music (संगीत)', '1. संगीत'],
        ['2. Dance (नृत्य)', '2. नृत्य'],
        ['3. Theatre (रंगमंच एवं नाटक)', '3. रंगमंच एवं नाटक'],
        ['4. Literary (साहित्यिक)', '4. साहित्यिक'],
        ['5. Fine Arts (ललित कलाएं)', '5. ललित कलाएं'],
        ['6. Cultural Procession (सांस्कृतिक शोभा यात्रा - No Age Limit)', '6. सांस्कृतिक शोभा यात्रा (आयु सीमा नहीं)'],
        ['District / affiliated college', 'जिला / संबद्ध महाविद्यालय'],
        ['College / institute', 'महाविद्यालय / संस्थान'],
        ['Select college', 'महाविद्यालय चुनें'],
        ['Participant name', 'प्रतिभागी का नाम'],
        ["Father's name", 'पिता का नाम'],
        ['Class', 'कक्षा'],
        ['Date of birth', 'जन्म तिथि'],
        ['Mobile number', 'मोबाइल नंबर'],
        ['Email address', 'ईमेल आईडी'],
        ['Other team members', 'दल के अन्य सदस्य'],
        ['Add member', 'सदस्य जोड़ें'],
        ['Accompanists', 'सहयोगी कलाकार'],
        ['Submit registration', 'पंजीकरण जमा करें'],
        ['Festival competitions and stage venues', 'महोत्सव प्रतियोगिताएं एवं मंच स्थल'],
        ['Official programme chart', 'आधिकारिक कार्यक्रम चार्ट'],
        ['Number of Competitions:', 'प्रतियोगिताओं की संख्या:'],
        ['Official Programme Chart', 'आधिकारिक कार्यक्रम चार्ट'],
        ['Official CDLU Festival Pass', 'आधिकारिक CDLU महोत्सव पास'],
        ['Search events', 'कार्यक्रम खोजें'],
        ['All categories', 'सभी श्रेणियां'],
        ['All events', 'सभी कार्यक्रम'],
        ['Search participants', 'प्रतिभागी खोजें'],
        ['Evaluation status', 'मूल्यांकन स्थिति'],
        ['Select Affiliated College', 'संबद्ध महाविद्यालय चुनें'],
        ['Enter your roll number or registration ID', 'अपना रोल नंबर या पंजीकरण आईडी दर्ज करें'],
        ['In BLOCK LETTERS', 'बड़े अक्षरों में'],
        ['10-digit mobile number', '10 अंकों का मोबाइल नंबर'],
        ['Back to home', 'मुखपृष्ठ पर वापस जाएं'],
        ['Student Portal', 'विद्यार्थी पोर्टल'],
        ['Switch to Hindi', 'हिंदी में बदलें'],
        ['Switch to English', 'अंग्रेजी में बदलें'],
        ['Switch to dark theme', 'डार्क थीम में बदलें'],
        ['Switch to light theme', 'लाइट थीम में बदलें'],
        ['Light mode', 'लाइट मोड'],
        ['Dark mode', 'डार्क मोड'],
        ['Festival competitions', 'महोत्सव प्रतियोगिताएं'],
        ['Competition details', 'प्रतियोगिता का विवरण'],
        ['Event details', 'कार्यक्रम का विवरण'],
        ['College / Institute', 'महाविद्यालय / संस्थान'],
        ['Primary Participant Details', 'मुख्य प्रतिभागी का विवरण'],
        ['Select event category and competition', 'कार्यक्रम श्रेणी एवं प्रतियोगिता चुनें'],
        ['Stage operations and coordination access', 'स्टेज संचालन एवं समन्वय प्रवेश'],
        ['Super administrator access', 'मुख्य प्रशासक प्रवेश'],
        ['Log in securely', 'सुरक्षित रूप से लॉगिन करें'],
        ['Quick testing', 'त्वरित परीक्षण'],
        ['Authorized access only', 'केवल अधिकृत उपयोगकर्ताओं के लिए'],
        ['Registration status and I-card download', 'पंजीकरण स्थिति एवं आई-कार्ड डाउनलोड'],
        ['Events and venue explorer', 'कार्यक्रम एवं स्थल विवरण'],
        ['Competition category', 'प्रतियोगिता श्रेणी'],
        ['Stage venue', 'मंच स्थल'],
        ['Department of Youth Welfare', 'युवा कल्याण विभाग'],
        ['Chaudhary Devi Lal University, Sirsa', 'चौधरी देवीलाल विश्वविद्यालय, सिरसा'],
        ['University Judges and Administration Portal', 'विश्वविद्यालय निर्णायक एवं प्रशासनिक पोर्टल'],
        ['This portal is for authorized judges, stage coordinators, and university administrators only.', 'यह पोर्टल केवल अधिकृत जजों, स्टेज प्रभारियों एवं विश्वविद्यालय एडमिन के लिए है।'],
        ['Completes the form on the main website (index.html). The 25-year age limit is checked, and a digital I-card is issued using the roll number.', 'मुख्य वेबसाइट (index.html) पर फॉर्म भरता है। 25 वर्ष आयु सीमा जांची जाती है तथा रोल नंबर से डिजिटल आई-कार्ड प्राप्त करता है।'],
        ['Scores assigned events by chest number, awarding up to 10 points for solo and 20 for group performances, with confidential remarks.', 'असाइन किए गए इवेंट्स में चेस्ट नंबर अनुसार एकल (Solo) पर 10 में से और समूह (Group) पर 20 में से सीधे अंक व गोपनीय टिप्पणी देता है।'],
        ['Monitors stage schedules, student attendance, chest-number verification, and live evaluation progress.', 'स्टेज अनुसार समय सारिणी, छात्रों की उपस्थिति, चेस्ट नंबर सत्यापन और मूल्यांकन प्रक्रिया की लाइव प्रगति देखता है।'],
        ['Assigns events to judges, views the live scoreboard, locks winners (1st, 2nd, 3rd), and downloads reports.', 'सभी जजों को इवेंट्स असाइन करता है, लाइव स्कोरबोर्ड देखता है, विजेताओं (1st, 2nd, 3rd) को लॉक करता है तथा रिपोर्ट डाउनलोड करता है।'],
        ['Total registered students', 'कुल पंजीकृत विद्यार्थी'],
        ['Total registered teams', 'कुल पंजीकृत दल (Teams)'],
        ['Enter your CDLU roll number or registration ID to download your official I-card.', 'अपना CDLU रोल नंबर या पंजीकरण आईडी दर्ज करके आधिकारिक आई-कार्ड डाउनलोड करें।'],
        ['Complete the details according to the official Annexure I-VI rules for the 13th Triveni Yuva Mahotsav 2026.', '13वें त्रिवेणी युवा महोत्सव 2026 के लिए आधिकारिक एनेक्सचर (Annexure I-VI) नियमों के अनुसार विवरण भरें।'],
        ['Event category and competition selection', 'इवेंट श्रेणी व प्रतियोगिता का चयन (Event Selection)'],
        ['Event category', 'इवेंट श्रेणी (Category)'],
        ['Primary participant details', 'मुख्य प्रतिभागी का विवरण'],
        ['University roll number', 'विश्वविद्यालय रोल नंबर (Univ. Roll No)'],
        ['Stage 1 (Auditorium), Stage 2 (Open Air), Stage 3 (Seminar Hall), Stage 4 (Fine Arts)', 'स्टेज 1 (ऑडिटोरियम), स्टेज 2 (ओपन एयर), स्टेज 3 (सेमिनार हॉल), स्टेज 4 (फाइन आर्ट्स)'],
        ['Festival competitions and stage venues', 'महोत्सव प्रतियोगिताएं एवं मंच स्थल'],
        ['Registration Lookup', 'पंजीकरण खोजें'],
        ['Student and Team Registration', 'विद्यार्थी एवं दल ऑनलाइन पंजीकरण'],
        ['Complete the official form using the 13th Triveni Yuva Mahotsav 2026 programme guidelines.', '13वें त्रिवेणी युवा महोत्सव 2026 की आधिकारिक कार्यक्रम मार्गदर्शिका के अनुसार फॉर्म भरें।'],
        ['Registered entries', 'पंजीकृत प्रविष्टियां'],
        ['Participating colleges', 'भाग लेने वाले महाविद्यालय'],
        ['Official competitions', 'आधिकारिक प्रतियोगिताएं'],
        ['Find your registration and I-card', 'अपना पंजीकरण और आई-कार्ड खोजें'],
        ['Use your CDLU roll number or registration ID to view and print the official I-card.', 'आधिकारिक आई-कार्ड देखने और प्रिंट करने के लिए अपना CDLU रोल नंबर या पंजीकरण आईडी दर्ज करें।'],
        ['Enter roll no. or registration ID', 'रोल नंबर या पंजीकरण आईडी दर्ज करें'],
        ['Find', 'खोजें'],
        ['Event selection', 'कार्यक्रम चुनें'],
        ['College or institute details', 'महाविद्यालय या संस्थान का विवरण'],
        ['Primary participant details', 'मुख्य प्रतिभागी का विवरण'],
        ['Other team members', 'दल के अन्य सदस्य'],
        ['Accompanist details', 'सहयोगी कलाकारों का विवरण'],
        ['Contingent in-charge or team manager', 'दल प्रभारी या टीम मैनेजर'],
        ['Event category *', 'कार्यक्रम श्रेणी *'],
        ['Event name *', 'कार्यक्रम का नाम *'],
        ['Affiliated college or institute *', 'संबद्ध महाविद्यालय या संस्थान *'],
        ['Full name *', 'पूरा नाम *'],
        ["Father's name *", 'पिता का नाम *'],
        ['Gender *', 'लिंग *'],
        ['Class or semester *', 'कक्षा या सेमेस्टर *'],
        ['University roll number *', 'विश्वविद्यालय रोल नंबर *'],
        ['Date of birth *', 'जन्म तिथि *'],
        ['Mobile number *', 'मोबाइल नंबर *'],
        ['Email address *', 'ईमेल पता *'],
        ['Team manager or in-charge name', 'दल मैनेजर या प्रभारी का नाम'],
        ['In-charge mobile number', 'प्रभारी का मोबाइल नंबर'],
        ['Official in-charge email', 'प्रभारी का आधिकारिक ईमेल'],
        ['-- Select a category --', '-- श्रेणी चुनें --'],
        ['1. Music', '1. संगीत'],
        ['2. Dance', '2. नृत्य'],
        ['3. Theatre', '3. रंगमंच'],
        ['4. Literary', '4. साहित्यिक'],
        ['5. Fine Arts', '5. ललित कला'],
        ['6. Cultural Procession (No age limit)', '6. सांस्कृतिक शोभा यात्रा (आयु सीमा नहीं)'],
        ['-- Select a category first --', '-- पहले श्रेणी चुनें --'],
        ['-- Select an affiliated college --', '-- संबद्ध महाविद्यालय चुनें --'],
        ['-- Select an event --', '-- कार्यक्रम चुनें --'],
        ['Enter name in capital letters', 'नाम बड़े अक्षरों में दर्ज करें'],
        ["Enter father's name", 'पिता का नाम दर्ज करें'],
        ['Example: BA 2nd Year, MA, B.Sc.', 'उदाहरण: BA द्वितीय वर्ष, MA, B.Sc.'],
        ['Example: 220101004', 'उदाहरण: 220101004'],
        ['10-digit mobile number', '10 अंकों का मोबाइल नंबर'],
        ['Example: Dr. R. K. Sharma', 'उदाहरण: डॉ. आर. के. शर्मा'],
        ['I certify that the information provided is correct and follows CDLU Youth Festival rules.', 'मैं प्रमाणित करता/करती हूं कि दी गई जानकारी सही है और CDLU युवा महोत्सव के नियमों के अनुरूप है।'],
        ['Submit registration and get I-card', 'पंजीकरण जमा करें और आई-कार्ड प्राप्त करें'],
        ['Festival competitions and venues', 'महोत्सव प्रतियोगिताएं एवं स्थल'],
        ['Stage I · Auditorium  |  Stage II · Open Air Theatre  |  Stage III · Seminar Hall  |  Stage IV · Fine Arts', 'मंच I · ऑडिटोरियम | मंच II · ओपन एयर थिएटर | मंच III · सेमिनार हॉल | मंच IV · ललित कला'],
        ['Maximum age: 25 years', 'अधिकतम आयु: 25 वर्ष'],
        ['No age limit', 'आयु सीमा नहीं'],
        ['Time limit:', 'समय सीमा:'],
        ['Age limit:', 'आयु सीमा:'],
        ['Rules and guidance:', 'नियम एवं मार्गदर्शन:'],
        ['Participants:', 'प्रतिभागी:'],
        ['Other team members', 'दल के अन्य सदस्य'],
        ['Add members within the event limit.', 'कार्यक्रम की निर्धारित सीमा के अनुसार सदस्य जोड़ें।'],
        ['Add accompanists within the event limit.', 'कार्यक्रम की निर्धारित सीमा के अनुसार सहयोगी कलाकार जोड़ें।'],
        ['Use “Add team member” to include additional participants.', 'अतिरिक्त प्रतिभागियों को जोड़ने के लिए “दल का सदस्य जोड़ें” चुनें।'],
        ['Use “Add accompanist” to include approved accompanists.', 'अनुमोदित सहयोगी कलाकारों को जोड़ने के लिए “सहयोगी कलाकार जोड़ें” चुनें।'],
        ['Add team member', 'दल का सदस्य जोड़ें'],
        ['Add accompanist', 'सहयोगी कलाकार जोड़ें'],
        ['Team member', 'दल का सदस्य'],
        ['Remove', 'हटाएं'],
        ['Member name', 'सदस्य का नाम'],
        ['Roll number', 'रोल नंबर'],
        ['Accompanist name', 'सहयोगी कलाकार का नाम'],
        ['Instrument', 'वाद्य यंत्र'],
        ['Quick links', 'त्वरित लिंक'],
        ['Contact and support', 'संपर्क एवं सहायता'],
        ['The official online management portal for affiliated colleges participating in the 13th Triveni Yuva Mahotsav 2026.', '13वें त्रिवेणी युवा महोत्सव 2026 में भाग लेने वाले संबद्ध महाविद्यालयों का आधिकारिक ऑनलाइन प्रबंधन पोर्टल।'],
        ['Poster gallery and highlights', 'पोस्टर गैलरी एवं मुख्य आकर्षण'],
        ['Student registration', 'विद्यार्थी पंजीकरण'],
        ['I-card lookup', 'आई-कार्ड खोजें'],
        ['Judge portal', 'निर्णायक पोर्टल'],
        ['Admin console', 'प्रशासक कंसोल'],
        ['Department / Course', 'विभाग / पाठ्यक्रम'],
        ['Participating Student I-Card', 'प्रतिभागी विद्यार्थी का आई-कार्ड'],
        ['Youth Energy, Culture and Creativity', 'युवा ऊर्जा, संस्कृति और रचनात्मकता'],
        ['Valid from', 'मान्य तिथि'],
        ['Paste passport-size photo', 'पासपोर्ट आकार का फोटो लगाएं'],
        ['with dean/principal stamp', 'डीन/प्राचार्य की मुहर सहित'],
        ["Holder's signature", 'धारक के हस्ताक्षर'],
        ['Dean / Principal sign.', 'डीन / प्राचार्य के हस्ताक्षर'],
        ['Print I-card', 'आई-कार्ड प्रिंट करें'],
        ['Official Portal (Judges & Admin) | 13th Triveni Yuva Mahotsav 2026 - CDLU Sirsa', 'आधिकारिक पोर्टल (निर्णायक एवं प्रशासन) | 13वां त्रिवेणी युवा महोत्सव 2026 - CDLU सिरसा'],
        ['13th Triveni Yuva Mahotsav 2026 | Chaudhary Devi Lal University (CDLU), Sirsa', '13वां त्रिवेणी युवा महोत्सव 2026 | चौधरी देवीलाल विश्वविद्यालय (CDLU), सिरसा'],
        ['Official 13th Triveni Yuva Mahotsav 2026 banner at Chaudhary Devi Lal University, Sirsa', 'चौधरी देवीलाल विश्वविद्यालय, सिरसा में 13वें त्रिवेणी युवा महोत्सव 2026 का आधिकारिक बैनर'],
        ['Chaudhary Devi Lal University emblem', 'चौधरी देवीलाल विश्वविद्यालय का प्रतीक चिह्न'],
        ['Chaudhary Devi Lal University logo', 'चौधरी देवीलाल विश्वविद्यालय का लोगो'],
        ['Music Judge', 'संगीत निर्णायक'],
        ['Dance Judge', 'नृत्य निर्णायक'],
        ['Theatre Judge', 'रंगमंच निर्णायक'],
        ['Literary Judge', 'साहित्यिक निर्णायक'],
        ['Fine Arts Judge', 'ललित कला निर्णायक'],
        ['🎵 Music Judge', '🎵 संगीत निर्णायक'],
        ['💃 Dance Judge', '💃 नृत्य निर्णायक'],
        ['🎭 Theatre Judge', '🎭 रंगमंच निर्णायक'],
        ['📖 Literary Judge', '📖 साहित्यिक निर्णायक'],
        ['🎨 Fine Arts Judge', '🎨 ललित कला निर्णायक'],
        ['🎪 Fill demo credentials', '🎪 डेमो लॉगिन विवरण भरें'],
        ['Music', 'संगीत'],
        ['Dance', 'नृत्य'],
        ['Theatre', 'रंगमंच'],
        ['Literary', 'साहित्यिक'],
        ['Fine Arts', 'ललित कला'],
        ['Procession', 'शोभा यात्रा'],
        ['MUSIC', 'संगीत'],
        ['DANCE', 'नृत्य'],
        ['THEATRE', 'रंगमंच'],
        ['LITERARY', 'साहित्यिक'],
        ['FINE ARTS', 'ललित कला'],
        ['PROCESSION', 'शोभा यात्रा'],
        ['Venue:', 'स्थान:'],
        ['Accompanists:', 'सहयोगी कलाकार:']
    ];

    const dictionaries = { en: new Map(), hi: new Map() };
    pairs.forEach(([first, second]) => {
        const firstHasHindi = /[\u0900-\u097F]/.test(first);
        const secondHasHindi = /[\u0900-\u097F]/.test(second);
        const firstHindiCount = (first.match(/[\u0900-\u097F]/g) || []).length;
        const secondHindiCount = (second.match(/[\u0900-\u097F]/g) || []).length;
        const firstIsEnglish = !firstHasHindi || (firstHasHindi && secondHasHindi && firstHindiCount < secondHindiCount);
        const english = firstIsEnglish ? first : second;
        const hindi = firstIsEnglish ? second : first;
        dictionaries.en.set(hindi, english);
        dictionaries.hi.set(english, hindi);
    });

    const attributeNames = ['placeholder', 'title', 'aria-label', 'alt'];
    let language = 'en';
    let observer;
    let scheduled = false;
    const pendingRecords = [];
    const originalText = new WeakMap();
    const originalAttributes = new WeakMap();

    function translateNode(node) {
        if (!originalText.has(node)) originalText.set(node, node.nodeValue);
        const original = originalText.get(node);
        const trimmed = original.trim();
        if (!trimmed) return;

        const translation = dictionaries[language].get(trimmed) || trimmed;
        if (translation !== trimmed) {
            const leadingWhitespace = original.match(/^\s*/)[0];
            const trailingWhitespace = original.match(/\s*$/)[0];
            node.nodeValue = `${leadingWhitespace}${translation}${trailingWhitespace}`;
        } else if (node.nodeValue !== original) {
            node.nodeValue = original;
        }
    }

    function translateElement(element) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) translateNode(node);

        if (element.nodeType === Node.ELEMENT_NODE) {
            const elements = [element, ...element.querySelectorAll('*')];
            elements.forEach(item => {
                attributeNames.forEach(attribute => {
                    const value = item.getAttribute(attribute);
                    if (value === null) return;
                    let saved = originalAttributes.get(item);
                    if (!saved) {
                        saved = {};
                        originalAttributes.set(item, saved);
                    }
                    if (!(attribute in saved)) saved[attribute] = value;
                    const source = saved[attribute];
                    const translation = dictionaries[language].get(source.trim()) || source;
                    item.setAttribute(attribute, translation);
                });
            });
        }
    }

    function updateButtons() {
        document.documentElement.lang = language;
        document.querySelectorAll('[data-language-toggle]').forEach(button => {
            const label = language === 'en' ? 'हिंदी' : 'English';
            button.setAttribute('aria-label', language === 'en' ? 'Switch to Hindi' : 'Switch to English');
            const span = button.querySelector('span');
            if (span) span.textContent = label;
            else button.append(document.createTextNode(label));
        });
    }

    function applyLanguage(nextLanguage) {
        if (nextLanguage !== 'en' && nextLanguage !== 'hi') return;
        language = nextLanguage;
        document.documentElement.dataset.language = language;
        const titleTranslation = dictionaries[language].get(document.title.trim());
        if (titleTranslation) document.title = titleTranslation;
        translateElement(document.body);
        updateButtons();
        try {
            localStorage.setItem('cdlu-portal-language', language);
        } catch (error) {
            console.error('Unable to save language preference.', error);
        }
    }

    function scheduleNewContent(records) {
        pendingRecords.push(...records);
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            const recordsToProcess = pendingRecords.splice(0, pendingRecords.length);
            recordsToProcess.forEach(record => {
                if (record.type === 'characterData') {
                    translateNode(record.target);
                    return;
                }
                if (record.type === 'attributes') {
                    const value = record.target.getAttribute(record.attributeName);
                    if (value === null) return;
                    let saved = originalAttributes.get(record.target);
                    if (!saved) {
                        saved = {};
                        originalAttributes.set(record.target, saved);
                    }
                    if (!(record.attributeName in saved)) saved[record.attributeName] = value;
                    const source = saved[record.attributeName];
                    const translation = dictionaries[language].get(source.trim()) || source;
                    record.target.setAttribute(record.attributeName, translation);
                    return;
                }
                record.addedNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) translateNode(node);
                    else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node);
                });
            });
        });
    }

    function init() {
        try {
            language = 'en';
            localStorage.setItem('cdlu-portal-language', 'en');
        } catch (error) {
            console.error('Unable to restore language preference.', error);
            language = 'en';
        }
        applyLanguage(language);
        observer = new MutationObserver(scheduleNewContent);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: attributeNames,
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    window.CDLUI18n = {
        toggle: function() {
            applyLanguage(language === 'en' ? 'hi' : 'en');
        },
        setLanguage: applyLanguage,
        getLanguage: function() {
            return language;
        }
    };

    document.addEventListener('DOMContentLoaded', init, { once: true });
})();
