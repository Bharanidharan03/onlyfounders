// VECTOR - Guidance Engine Logic

// State
let userProfile = {
    name: "",
    class: "",
    stream: "",
    interests: [],
    talents: ""
};

// Skill Action Mapper Database (The core logic requested)
// Skill Action Mapper Database (Expanded & Premium)
// Skill Action Mapper Database (Expanded & Premium)
const OPPORTUNITY_DB = {
    "Mathematics": [
        { title: "International Math Olympiad (IMO)", type: "Competition", detail: "The world's most prestigious math championship. Proves exceptional analytical depth.", difficulty: "Expert", time: "6 Months", impact: "Global Recognition", why: "Top universities view this as the gold standard for logic." },
        { title: "Project Euler Ranking", type: "Challenge", detail: "Solve 50+ complex mathematical coding problems.", difficulty: "Hard", time: "Ongoing", impact: "Algorithm Mastery", why: "Demonstrates you can translate pure math into efficient code." },
        { title: "Research: Number Theory", type: "Publication", detail: "Write a survey paper on Prime Distribution patterns.", difficulty: "Expert", time: "3 Months", impact: "Academic Merit", why: "Critical for research-focused Ivy League applications." }
    ],
    "Physics": [
        { title: "CERN Beamline for Schools", type: "Competition", detail: "Propose an experiment to be run at a CERN accelerator.", difficulty: "Expert", time: "4 Months", impact: "Scientific Impact", why: "Direct collaboration with world-leading physicists." },
        { title: "Build a Particle Cloud Chamber", type: "Hardware", detail: "Construct a device to visualize radioactive decay trails.", difficulty: "Hard", time: "2 Weeks", impact: "Engineering Proof", why: "Tangible proof of understanding high-energy physics." }
    ],
    "AI & ML": [
        { title: "Train LLM from Scratch", type: "Project", detail: "Replicate GPT-2 architecture on a custom dataset.", difficulty: "Expert", time: "1 Month", impact: "Portfolio Star", why: "Proves you understand the math behind the hype." },
        { title: "Kaggle Grandmaster Track", type: "Competition", detail: "Rank in the top 1% of global data science challenges.", difficulty: "Hard", time: "Ongoing", impact: "Industry Hire", why: "Kaggle rank is often a direct interview bypass." },
        { title: "AI Ethics Research Paper", type: "Writing", detail: "Analyze bias in modern vision models.", difficulty: "Medium", time: "3 Weeks", impact: "Thought Leadership", why: "Shows you care about the societal impact of code." }
    ],
    "Investment / Finance": [
        { title: "Wharton Glb. Inv. Competition", type: "Strategy", detail: "Manage a $100k virtual portfolio with a team.", difficulty: "Hard", time: "10 Weeks", impact: "Ivy Connection", why: "Official recognition from UPenn Wharton School." },
        { title: "Deploy Algo-Trading Bot", type: "Devops", detail: "Live Python bot using SMA/RSI indicators on crypto markets.", difficulty: "Medium", time: "2 Weeks", impact: "Fintech Proof", why: "Combines coding skill with financial theory." },
        { title: "Valuation Case Study", type: "Analysis", detail: "Perform a DCF analysis on a public tech company.", difficulty: "Medium", time: "1 Week", impact: "Analyst Skill", why: "Standard entry test for Investment Banking roles." }
    ],
    "Sports & Athletics": [
        { title: "National Zonal Captaincy", type: "Leadership", detail: "Lead your state team in a national tournament.", difficulty: "Expert", time: "Year-round", impact: "Leadership", why: "Proves you can manage pressure and people." },
        { title: "Organize Charity Marathon", type: "Social Impact", detail: "Plan and execute a 5k run for a cause.", difficulty: "Medium", time: "2 Months", impact: "Community Leader", why: "Shows organizational capability beyond the field." }
    ],
    // Add default catches for others to avoid empty
    "Robotics": [
        { title: "FIRST Robotics Lead", type: "Engineering", detail: "Design the chassis for an FRC competition bot.", difficulty: "Hard", time: "Season", impact: "Teamwork", why: "Industry standard for mechatronics." }
    ],
    "General": [
        { title: "Launch a Podcast", type: "Creativity", detail: "Start a niche podcast and grow to 1k listeners.", difficulty: "Medium", time: "Ongoing", impact: "Influence", why: "Proof of communication and consistency." }
    ]
};

// UI Handling

function showSection(sectionId) {
    // Hide all
    document.querySelectorAll('section').forEach(el => {
        el.classList.remove('active-section');
        el.classList.add('hidden-section');
        setTimeout(() => {
            if (!el.classList.contains('active-section')) el.style.display = 'none';
        }, 500); // clear after anim
    });

    const target = document.getElementById(sectionId);
    target.style.display = 'block';

    // Small timeout to allow display:block to render before opacity anim
    setTimeout(() => {
        target.classList.remove('hidden-section');
        target.classList.add('active-section');
    }, 10);

    // Scroll to top
    window.scrollTo(0, 0);
}

function toggleInterest(chip, interest) {
    chip.classList.toggle('selected');
    if (userProfile.interests.includes(interest)) {
        userProfile.interests = userProfile.interests.filter(i => i !== interest);
    } else {
        userProfile.interests.push(interest);
    }
}

function handleProfileSubmit(e) {
    e.preventDefault();

    // 1. Capture Data
    userProfile.name = document.getElementById('inp-name').value;
    userProfile.class = document.getElementById('inp-class').value;
    userProfile.stream = document.getElementById('inp-stream').value;
    userProfile.talents = document.getElementById('inp-talents').value;

    // 2. Update UI with Name
    document.getElementById('user-name-display').innerText = userProfile.name;
    document.getElementById('sync-class').innerText = `Class ${userProfile.class}`;

    // 3. Run Analysis Engine
    const results = analyzeVector(userProfile);

    // 4. Render Results
    renderDashboard(results);

    // 5. Navigate
    // 5. Navigate
    showSection('dashboard');
    renderDashboardLeaderboard();
}

// The "Braaaains" 🧠
function analyzeVector(profile) {
    let recommendations = [];
    let primaryFocus = "Generalist";
    let score = 400; // Base score

    // Logic: Map Interests -> Opportunities
    profile.interests.forEach(interest => {
        if (OPPORTUNITY_DB[interest]) {
            recommendations = [...recommendations, ...OPPORTUNITY_DB[interest]];
            score += 150; // Boost score for having clear interests
        }
    });

    // Logic: Parse "talents" text for keywords (Simple NLP)
    const talentText = profile.talents.toLowerCase();
    if (talentText.includes("math") || talentText.includes("number")) {
        recommendations.push({ title: "Advanced Calculus Course", type: "Learning", detail: "Detected passion for math in your bio." });
        primaryFocus = "Analytical / STEM";
    }
    else if (talentText.includes("draw") || talentText.includes("paint")) {
        primaryFocus = "Creative / Arts";
    }

    // Dedupe
    recommendations = [...new Set(recommendations)];

    return {
        score,
        focus: profile.interests.length > 0 ? profile.interests[0] + " Specialist" : primaryFocus,
        recs: recommendations
    };
}

function renderDashboard(data) {
    // Set Score
    const scoreVal = document.getElementById('score-val');
    animateValue(scoreVal, 0, data.score, 1500);

    document.getElementById('res-focus').innerText = data.focus;

    // List Recs
    const list = document.getElementById('recommendation-list');
    list.innerHTML = '';

    if (data.recs.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted)">Add interests to see opportunities.</p>';
        return;
    }

    data.recs.forEach((rec, index) => {
        const item = document.createElement('div');
        item.className = 'rec-item';

        // Defaults if missing (backward compatibility)
        const time = rec.time || "Flexible";
        const impact = rec.impact || "Skill Proof";
        const why = rec.why || "Verifies your ability in this domain.";

        const diffColor = rec.difficulty === "Expert" ? "#ef4444" : rec.difficulty === "Hard" ? "#f59e0b" : "#4ade80";

        // Minimal Card - Title, Type, Difficulty + View Button
        item.innerHTML = `
            <div class="rec-header" style="margin-bottom:0; border-bottom:none;">
                <div class="badges-group">
                    <span class="tag-badge">${rec.type}</span>
                    <span class="meta-tag" style="border-color:${diffColor}; color:${diffColor}">${rec.difficulty}</span>
                </div>
            </div>
            
            <div class="rec-body">
                <h4 style="margin:10px 0; font-size:1.1rem;">${rec.title}</h4>
            </div>

            <button class="btn-top-action full-width" style="margin-top:10px; text-align:center;" onclick="viewEventDetails(${index})">View Details &rarr;</button>
        `;
        list.appendChild(item);
    });
}

let currentEventDetails = null;

function viewEventDetails(index) {
    if (!currentRecommendations) return;
    const rec = currentRecommendations.recs[index];
    currentEventDetails = rec; // Save for payment

    // Populate Details View
    document.getElementById('evt-type').innerText = rec.type;
    document.getElementById('evt-title').innerText = rec.title;
    document.getElementById('evt-desc').innerText = rec.detail;

    document.getElementById('evt-diff').innerText = rec.difficulty;
    document.getElementById('evt-time').innerText = rec.time || "Flexible";
    document.getElementById('evt-impact').innerText = rec.impact || "High";
    document.getElementById('evt-why').innerHTML = `<strong>Why it fits you:</strong> ${rec.why || "Builds core skills."}`;

    // Show Section
    showSection('event-details-section');
}

// -------------------------------------------------------------
// PAYMENT & REGISTRATION MODULE
// -------------------------------------------------------------

let pendingEventButton = null;
const EVENT_COST = 50;

// Override the old toggleStart
function toggleStart(btn) {
    if (btn.innerText === "Start") {
        // Trigger Payment Flow
        pendingEventButton = btn;
        openPaymentModal();
    } else if (btn.innerText === "In Progress") {
        btn.innerText = "Completed";
        btn.style.background = "#ffd700"; // Gold
        btn.style.color = "#000";
    }
}

function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('hidden-modal');

    // Update Balance UI in Modal
    document.getElementById('modal-balance').innerText = `${userTokens} Tokens`;

    const payBtn = document.getElementById('btn-pay');
    if (userTokens >= EVENT_COST) {
        payBtn.disabled = false;
        payBtn.innerText = "Pay & Register";
        payBtn.style.opacity = "1";
    } else {
        payBtn.disabled = true;
        payBtn.innerText = "Insufficient Tokens";
        payBtn.style.opacity = "0.5";
    }
}

function closeModal() {
    document.getElementById('payment-modal').classList.add('hidden-modal');
    pendingEventButton = null;
}

function confirmPayment() {
    if (userTokens >= EVENT_COST) {
        // Deduct
        userTokens -= EVENT_COST;
        updatePassportWithTokens(); // Update Dashboard UI

        // Success State
        if (pendingEventButton) {
            pendingEventButton.innerText = "In Progress";
            pendingEventButton.style.background = "#4ade80";
            pendingEventButton.style.color = "#000";
        }

        closeModal();
        alert(`Successfully registered! ${EVENT_COST} Tokens deducted.`); // Simple feedback
    }
}

// Utility: Number Animation
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// -------------------------------------------------------------
// QUIZ & GAMIFICATION MODULE
// -------------------------------------------------------------

// -------------------------------------------------------------
// QUIZ & GAMIFICATION MODULE
// -------------------------------------------------------------

// -------------------------------------------------------------
// QUIZ & GAMIFICATION MODULE
// -------------------------------------------------------------

// Dynamic Question Bank (15 Questions per topic, 4 Options each)
const TOPIC_QUIZ_DB = {
    "General": [
        { q: "Sequence: 2, 6, 12, 20, 30... Next?", options: ["40", "42", "44", "38"], ans: 1 },
        { q: "Logically: All Zorks are Gorks. Some Gorks are Corks.", options: ["All Zorks are Corks", "Some Corks might be Zorks", "No Zorks are Corks", "All Corks are Zorks"], ans: 1 },
        { q: "Which differs? Knife, Swan, Smile, Feather.", options: ["Knife", "Swan", "Smile", "Feather"], ans: 2 },
        { q: "A bat and ball cost $1.10. Bat is $1 more than ball. Cost of ball?", options: ["$0.10", "$0.05", "$0.50", "$0.01"], ans: 1 },
        { q: "Patterns: 1, 1, 2, 3, 5, 8... Next?", options: ["11", "13", "15", "12"], ans: 1 },
        { q: "What is heavier? 1kg of steel or 1kg of feathers?", options: ["Steel", "Feathers", "Equal", "Depends on gravity"], ans: 2 },
        { q: "If 5 machines take 5 min to make 5 widgets, how long for 100 machines to make 100 widgets?", options: ["100 min", "5 min", "1 min", "500 min"], ans: 1 },
        { q: "What has keys but can't open locks?", options: ["Map", "Piano", "Crypto", "Monkey"], ans: 1 },
        { q: "I speak without a mouth and hear without ears. What am I?", options: ["Echo", "Cloud", "River", "Wind"], ans: 0 },
        { q: "Which number is the outlier? 17, 19, 23, 27", options: ["17", "19", "23", "27"], ans: 3 }, // 27 is composite
        { q: "Rearrange 'CINDEPRA' to get a...", options: ["Country", "Ocean", "Fruit", "Animal"], ans: 0 }, // PICANDER? No. PROVINCE? No.
        { q: "Analogy: Finger is to Hand as Leaf is to...", options: ["Tree", "Branch", "Blossom", "Bark"], ans: 1 }, // Branch closest structural parent? Or Tree? Hand -> Finger. Branch -> Leaf. Tree -> Branch.
        { q: "Binary: What is 101 in decimal?", options: ["3", "5", "6", "7"], ans: 1 },
        { q: "If Yesterday was Thursday, what is the day after Tomorrow?", options: ["Saturday", "Sunday", "Monday", "Friday"], ans: 1 },
        { q: "Code Logic: x=5; x+=2; x*=3. Result?", options: ["15", "21", "17", "11"], ans: 1 }
    ],
    "Mathematics": [
        { q: "Derivative of x^2?", options: ["x", "2x", "x^2", "2"], ans: 1 },
        { q: "Sum of angles in a triangle?", options: ["180", "360", "90", "270"], ans: 0 },
        { q: "Pi to 2 decimals?", options: ["3.14", "3.41", "3.12", "3.15"], ans: 0 },
        { q: "What is a Prime Number?", options: ["Divisible by 1 & itself", "Any Odd number", "Positive integer", "Ends in 9"], ans: 0 },
        { q: "Slope of y = 3x + 2?", options: ["2", "3", "0", "x"], ans: 1 },
        { q: "What is 5! (5 factorial)?", options: ["20", "60", "120", "100"], ans: 2 },
        { q: "Solve: 2x - 4 = 10", options: ["5", "7", "6", "8"], ans: 1 },
        { q: "Area of circle radius r?", options: ["2πr", "πr^2", "πd", "4πr"], ans: 1 },
        { q: "Hypotenuse if legs are 3 and 4?", options: ["5", "6", "7", "5.5"], ans: 0 },
        { q: "Graph of y = x^2 is a?", options: ["Line", "Circle", "Parabola", "Hyperbola"], ans: 2 },
        { q: "Value of sin(90°)?", options: ["0", "1", "0.5", "-1"], ans: 1 },
        { q: "Root of 144?", options: ["10", "11", "12", "14"], ans: 2 },
        { q: "2^0 = ?", options: ["0", "1", "2", "undefined"], ans: 1 },
        { q: "Probability of flipping Heads?", options: ["25%", "50%", "75%", "100%"], ans: 1 },
        { q: "Log(100) base 10?", options: ["1", "2", "10", "100"], ans: 1 }
    ],
    "AI & ML": [
        { q: "GPT stands for?", options: ["Generative Pre-trained Transformer", "General Processing Text", "Global Python Token", "Graphic Process Thread"], ans: 0 },
        { q: "Supervised learning needs?", options: ["Labeled Data", "No Data", "Rewards", "Cluster"], ans: 0 },
        { q: "Activation function?", options: ["ReLU", "For Loop", "SQL", "CSV"], ans: 0 },
        { q: "Overfitting means?", options: ["Learns noise", "Too simple", "Faster training", "Under-trained"], ans: 0 },
        { q: "'Deep' Learning implies?", options: ["Multiple hidden layers", "Big data only", "Hard math", "Deep Search"], ans: 0 },
        { q: "Loss for regression?", options: ["MSE", "Cross-Entropy", "Accuracy", "F1 Score"], ans: 0 },
        { q: "Who created TensorFlow?", options: ["Facebook", "Google", "Amazon", "OpenAI"], ans: 1 },
        { q: "What is a Tensor?", options: ["Multi-dim array", "Neuron", "Flowchart", "Sensor"], ans: 0 },
        { q: "Backpropagation is for?", options: ["Inference", "Training", "Cleaning", "Plotting"], ans: 1 },
        { q: "NLP stands for?", options: ["Natural Language Processing", "Neural Loop Protocol", "No Latency Process", "Network Layer Port"], ans: 0 },
        { q: "Computer Vision task?", options: ["Object Detection", "SQL Query", "Audio file", "JSON parse"], ans: 0 },
        { q: "Unsupervised algorithm?", options: ["K-Means", "Linear Regression", "Logistic Regression", "Decision Tree"], ans: 0 },
        { q: "Reinforcement Learning agent learns via?", options: ["Rewards/Punishment", "Labels", "Patterns", "Images"], ans: 0 },
        { q: "Bias in AI refers to?", options: ["Prejudice in data", "Model speed", "Weight size", "Voltage"], ans: 0 },
        { q: "Turing Test measures?", options: ["Human-like intelligence", "Speed", "Memory", "Power"], ans: 0 }
    ],
    "Investment / Finance": [
        { q: "Bear Market means?", options: ["Rising prices", "Falling prices", "Stable prices", "Volatile prices"], ans: 1 },
        { q: "ROI stands for?", options: ["Return on Investment", "Rate of Inflation", "Risk of Income", "Return on Interest"], ans: 0 },
        { q: "Compound interest frequency?", options: ["Principal only", "Principal + Interest", "Market Cap", "Tax deduction"], ans: 1 },
        { q: "IPO is?", options: ["Initial Public Offering", "Internal Profit Org", "Inter-Public Option", "Invested Price Option"], ans: 0 },
        { q: "Diversification helps to?", options: ["Increase Risk", "Reduce Risk", "Avoid Taxes", "Maximize Fees"], ans: 1 },
        { q: "Blue Chip stock?", options: ["New startup", "Reliable large cap", "Tech only", "Penny stock"], ans: 1 },
        { q: "Shorting a stock?", options: ["Betting price drops", "Buying small amounts", "Holding long term", "Dividends"], ans: 0 },
        { q: "Forex market trades?", options: ["Stocks", "Currencies", "Options", "Bonds"], ans: 1 },
        { q: "S&P 500 tracks?", options: ["500 US Companies", "Global Tech", "Crypto", "European Banks"], ans: 0 },
        { q: "Liquidity refers to?", options: ["Cash availability", "Water assets", "Debt level", "Oil prices"], ans: 0 },
        { q: "Dividend is?", options: ["Profit share paid to owners", "Tax refund", "Bank fee", "Loan interest"], ans: 0 },
        { q: "Bull Market means?", options: ["Rising prices", "Falling prices", "Stable prices", "Crash"], ans: 0 },
        { q: "ETF stands for?", options: ["Exchange Traded Fund", "Equity Transfer Fund", "Electronic Trade Fee", "Early Tax Form"], ans: 0 },
        { q: "Venture Capital invests in?", options: ["Startups", "Bonds", "Gold", "Savings"], ans: 0 },
        { q: "Checking vs Savings?", options: ["Daily use vs Storage", "High interest vs Low", "Stocks vs Bonds", "Credit vs Debit"], ans: 0 }
    ],
    "Robotics": [
        { q: "Sensor for distance?", options: ["Ultrasonic", "Thermometer", "Barometer", "Gyro"], ans: 0 },
        { q: "Arduino is?", options: ["Microcontroller", "Motor", "Battery", "Sensor"], ans: 0 },
        { q: "PWM stands for?", options: ["Pulse Width Modulation", "Power Wave Mode", "Pulse Wave Motion", "Position Width Map"], ans: 0 },
        { q: "Motor for precise angles?", options: ["Servo", "DC Motor", "Stepper", "Brushless"], ans: 0 },
        { q: "PCB stands for?", options: ["Printed Circuit Board", "Power Control Block", "Plastic Case Box", "Program C-Byte"], ans: 0 },
        { q: "ROS is?", options: ["Robot Operating System", "Robotic Orbit System", "Real Output Sensor", "Remote OS"], ans: 0 },
        { q: "LiDAR uses?", options: ["Sound", "Light/Laser", "Radio", "Heat"], ans: 1 },
        { q: "DoF means?", options: ["Degrees of Freedom", "Dept of Finance", "Direct of Force", "Digital or Frequency"], ans: 0 },
        { q: "H-Bridge controls?", options: ["Motor direction", "CPU speed", "WiFi signal", "LED brightness"], ans: 0 },
        { q: "Inverse Kinematics calculates?", options: ["Joint angles for pose", "Battery life", "Future position", "Cost"], ans: 0 },
        { q: "Actuator does what?", options: ["Moves mechanism", "Senses heat", "Stores code", "Connects WiFi"], ans: 0 },
        { q: "UAV stands for?", options: ["Unmanned Aerial Vehicle", "Under Added Voltage", "Ultra Audio Video", "Universal Auto Van"], ans: 0 },
        { q: "SLAM algorithm?", options: ["Map building", "Fighting", "Cooking", "Emailing"], ans: 0 },
        { q: "Gyroscope measures?", options: ["Orientation/Rotation", "Speed", "Distance", "Light"], ans: 0 },
        { q: "Raspberry Pi is?", options: ["Single Board Computer", "Fruit", "Sensor", "Microcontroller"], ans: 0 }
    ]
};

let userTokens = 0;
let currentQuestion = 0;
let userScore = 0;
let quizStartTime = 0;
let quizInterval = null;
let elapsedTime = 0; // seconds
let currentQuizSet = [];

const MOCK_LEADERBOARD = [
    { name: "Satoshi_N", score: 95, time: "45s" },
    { name: "Dev_Wizard", score: 90, time: "52s" },
    { name: "LogicBot_v1", score: 85, time: "38s" },
    { name: "Alpha_User", score: 80, time: "60s" }
];

function startQuiz() {
    // 1. Determine Topic
    // Use the first selected interest, or fall back to General
    const topic = (userProfile.interests && userProfile.interests.length > 0)
        ? userProfile.interests[0]
        : "General";

    // 2. Select Questions (Fall back to General if specific topic not found in DB)
    // Map complex interest names to keys if needed, or just use partial matches
    let selectedSet = TOPIC_QUIZ_DB["General"];

    // Simple matching
    if (topic.includes("Math")) selectedSet = TOPIC_QUIZ_DB["Mathematics"];
    else if (topic.includes("AI") || topic.includes("Web3")) selectedSet = TOPIC_QUIZ_DB["AI & ML"];
    else if (topic.includes("Finance") || topic.includes("Invest")) selectedSet = TOPIC_QUIZ_DB["Investment / Finance"];
    else if (topic.includes("Robot")) selectedSet = TOPIC_QUIZ_DB["Robotics"];

    // Improve: Mix general + specific if set is small
    currentQuizSet = selectedSet;

    showSection('quiz-section');

    // Update UI Title
    const quizTitle = document.querySelector('#quiz-section h2');
    if (quizTitle) quizTitle.innerText = `${topic} Assessment`;

    currentQuestion = 0;
    userScore = 0;
    userTokens = 0;
    elapsedTime = 0;

    // Start Timer
    quizStartTime = Date.now();
    if (quizInterval) clearInterval(quizInterval);
    quizInterval = setInterval(updateTimerDisplay, 1000);

    updateTimerDisplay(); // Initial call
    renderQuestion();
}

function updateTimerDisplay() {
    elapsedTime = Math.floor((Date.now() - quizStartTime) / 1000);
    const timerEl = document.getElementById('quiz-timer');
    if (timerEl) timerEl.innerText = `${elapsedTime}s`;
}

function renderQuestion() {
    const container = document.getElementById('quiz-container');
    // Safety check
    if (!currentQuizSet || currentQuizSet.length === 0) {
        currentQuizSet = TOPIC_QUIZ_DB["General"];
    }

    const qData = currentQuizSet[currentQuestion];

    if (!qData) {
        finishQuiz();
        return;
    }

    const optionsHTML = qData.options.map((opt, idx) => `
        <button class="btn-option" onclick="handleAnswer(${idx})">${opt}</button>
    `).join('');

    container.innerHTML = `
        <div class="question-card">
            <div class="q-header">
                <span>Question ${currentQuestion + 1} / ${currentQuizSet.length}</span>
                <span class="timer-badge">⏱ <span id="quiz-timer">${elapsedTime}s</span></span>
            </div>
            <div class="q-subheader" style="margin-bottom:15px; font-size:0.85rem; color:var(--text-muted)">
                <span style="color:#4ade80">+20 Tokens</span> | <span style="color:#ef4444">-5 Penalty</span>
            </div>
            <h3>${qData.q}</h3>
            <div class="options-grid">
                ${optionsHTML}
            </div>
        </div>
    `;
}

function handleAnswer(selectedIdx) {
    const qData = currentQuizSet[currentQuestion];
    if (selectedIdx === qData.ans) {
        userTokens += 20; // Increase reward for harder/specific quiz
        userScore++;
    } else {
        userTokens = Math.max(0, userTokens - 5);
    }
    currentQuestion++;
    renderQuestion();
}

function finishQuiz() {
    clearInterval(quizInterval); // Stop Timer
    const container = document.getElementById('quiz-container');
    const resultTitle = userScore > 7 ? "Genius Level 🧠" : userScore > 4 ? "Sharp Thinker 💡" : "Rising Star 🌟";

    // Check Leaderboard Rank
    let rank = "Unranked";
    if (userTokens >= 90) rank = "#2";
    else if (userTokens >= 70) rank = "#4";
    else rank = "Top 10%";

    container.innerHTML = `
        <div class="quiz-result">
            <h2>Quiz Complete!</h2>
            <div class="result-stats">
                <div class="stat-box">
                    <span class="lbl">Score</span>
                    <span class="val">${userScore}/10</span>
                </div>
                <div class="stat-box">
                    <span class="lbl">Time</span>
                    <span class="val">${elapsedTime}s</span>
                </div>
                <div class="stat-box">
                    <span class="lbl">Tokens</span>
                    <span class="val" style="color:var(--accent)">${userTokens}</span>
                </div>
            </div>
            
            <h3 style="margin-top:20px">${resultTitle}</h3>
            
            <!-- Leaderboard Table -->
            <div class="leaderboard-panel">
                <h4>🏆 Live Leaderboard</h4>
                <table>
                    <tr style="opacity:0.7; font-size:0.8rem"><th>Rank</th><th>User</th><th>Tokens</th><th>Time</th></tr>
                    ${MOCK_LEADERBOARD.map((u, i) => `<tr><td>#${i + 1}</td><td>${u.name}</td><td>${u.score}</td><td>${u.time}</td></tr>`).join('')}
                    <tr class="highlight-row"><td>${rank}</td><td>YOU</td><td>${userTokens}</td><td>${elapsedTime}s</td></tr>
                </table>
            </div>

            <button class="btn-primary" onclick="showSection('dashboard'); updatePassportWithTokens();">Claim Rewards & Exit</button>
        </div>
    `;
}

function updateTokenDisplay() {
    // This function is no longer used in the new quiz flow, but keeping it for now
    // as it might be called from other parts of the application or removed later.
    // console.log("Tokens:", userTokens);
}

function updatePassportWithTokens() {
    // Inject token display into dashboard
    const identityCard = document.querySelector('.identity-card .score-details');
    if (!document.getElementById('token-row')) {
        const row = document.createElement('div');
        row.className = 'detail-row';
        row.id = 'token-row';
        row.innerHTML = `
            <span>Access Tokens</span>
            <strong style="color:var(--accent)">${userTokens} 🪙</strong>
        `;
        // identityCard.appendChild(row); // Removing this in favor of the specialized card
    }

    // Update the new Dashboard Card
    const dashVal = document.getElementById('dash-token-val');
    if (dashVal) dashVal.innerText = `${userTokens} 🪙`;

    // Also update modal balance if open
    const modalBal = document.getElementById('modal-balance');
    if (modalBal) modalBal.innerText = `${userTokens} Tokens`;

    renderDashboardLeaderboard(); // Update leaderboard specifically if user score changes
}

function renderDashboardLeaderboard() {
    const list = document.getElementById('dashboard-leaderboard');
    if (!list) return;

    // Sort Mock + User
    // Create a temporary list including the current user
    let allUsers = [...MOCK_LEADERBOARD, { name: "YOU", score: userTokens, time: "N/A" }];

    // Sort logic (just by score for dashboard view, ignoring time for simplicity or parsing it)
    allUsers.sort((a, b) => b.score - a.score);

    // Render top 5
    list.innerHTML = `
        <table style="width:100%; font-size:0.9rem;">
            ${allUsers.slice(0, 5).map((u, i) => {
        const isMe = u.name === "YOU";
        const rowStyle = isMe ? "color:var(--accent); font-weight:bold; background:rgba(99,102,241,0.1); border-radius:4px;" : "color:var(--text-muted);";
        return `
                <tr style="${rowStyle}">
                    <td style="padding:4px 0;">#${i + 1}</td>
                    <td style="padding:4px 0;">${u.name}</td>
                    <td style="padding:4px 0; text-align:right;">${u.score} 🪙</td>
                </tr>`;
    }).join('')}
        </table>
    `;
}

// -------------------------------------------------------------
// STUDY HUB / NOTES MODULE
// -------------------------------------------------------------

// Mock Database for Class 1-12 Notes (Expanded)
const NOTES_DB = {
    "1-5": {
        "Math": ["Number Systems", "Addition & Subtraction", "Multiplication & Division", "Shapes & Patterns", "Data Handling", "Measurement (Length, Weight)", "Time & Calendar", "Money", "Fractions Intro", "Mental Math"],
        "Science": ["Living vs Non-living", "Plants: Roots & Leaves", "Animals: Habitats", "Human Body: Bones & Muscles", "Food & Nutrition", "Air & Water", "Safety & First Aid", "The Solar System", "Matter: Solids, Liquids", "Force, Work & Energy"],
        "English": ["Nouns & Pronouns", "Verbs & Tenses", "Adjectives", "Prepositions", "Conjunctions", "Reading Comprehension", "Formal Letters", "Story Writing", "Opposites & Synonyms", "Punctuation"],
        "EVS": ["My Family", "Our Neighborhood", "Festivals of India", "Transport & Communication", "Seasons", "Pollution"],
        "GK": ["National Symbols", "Great Leaders", "Inventions", "Sports & Games", "Countries & Capitals"]
    },
    "6-8": {
        "Math": ["Integers", "Fractions & Decimals", "Data Handling", "Simple Equations", "Lines & Angles", "Triangles & Properties", "Congruence", "Comparing Quantities (Percentage)", "Rational Numbers", "Algebraic Expressions", "Exponents & Powers", "Symmetry", "Visualizing Solid Shapes"],
        "Science": ["Crop Production", "Microorganisms", "Synthetic Fibers", "Metals & Non-Metals", "Coal & Petroleum", "Combustion & Flame", "Conservation of Plants", "Cell Structure", "Reproduction in Animals", "Force & Pressure", "Friction", "Sound", "Chemical Effects of Current", "Light", "Stars & Solar System"],
        "Social": ["The Earth in Solar System", "Latitudes & Longitudes", "Motions of Earth", "Maps", "Major Domains of Earth", "Ashoka The Emperor", "New Kings & Kingdoms", "Mughal Empire", "Understanding Diversity", "Government", "Judiciary"],
        "Computer": ["Computer Fundamentals", "Windows OS", "MS Word Mastery", "MS Excel Intro", "HTML Basics", "Internet & Email", "Algorithms & Flowcharts", "Scratch Programming"]
    },
    "9-10": {
        "Math": ["Real Numbers", "Polynomials", "Linear Equations (2 vars)", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Trigonometry Intro", "Applications of Trig", "Circles", "Constructions", "Areas related to Circles", "Surface Areas & Volumes", "Statistics", "Probability"],
        "Physics": ["Motion", "Force & Laws of Motion", "Gravitation", "Work & Energy", "Sound", "Light: Reflection & Refraction", "Human Eye", "Electricity", "Magnetic Effects of Current", "Sources of Energy"],
        "Chemistry": ["Matter in Our Surroundings", "Is Matter Pure?", "Atoms & Molecules", "Structure of Atom", "Chemical Reactions", "Acids, Bases & Salts", "Metals & Non-metals", "Carbon & its Compounds", "Periodic Classification"],
        "Biology": ["The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Why do we fall ill?", "Natural Resources", "Life Processes", "Control & Coordination", "How do Organisms Reproduce?", "Heredity & Evolution", "Our Environment"],
        "Social": ["French Revolution", "Russian Revolution", "Nazism & Hitler", "Forest Society", "Pastoralists", "Contemporary India", "Drainage", "Climate", "Electoral Politics", "Constitutional Design"]
    },
    "11-12": {
        "Physics": ["Units & Measurement", "Motion in a Straight Line", "Laws of Motion", "Work, Energy, Power", "Rotational Motion", "Gravitation", "Solids & Fluids", "Thermodynamics", "Oscillations & Waves", "Electrostatics", "Current Electricity", "Magnetism", "EMI & AC", "Optics", "Dual Nature of Matter", "Atoms & Nuclei", "Semiconductors"],
        "Chemistry": ["Basic Concepts", "Structure of Atom", "Periodicity", "Bonding", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions", "Hydrogen", "s-Block", "p-Block", "Hydrocarbons", "Solid State", "Solutions", "Electrochemistry", "Kinetics", "Surface Chemistry", "Metallurgy", "d & f Block", "Coordination Compounds", "Haloalkanes", "Alcohols", "Aldehydes", "Amines", "Biomolecules"],
        "Math": ["Sets", "Relations & Functions", "Trigonometric Functions", "Complex Numbers", "Linear Inequalities", "Permutations & Combinations", "Binomial Theorem", "Sequences & Series", "Straight Lines", "Conic Sections", "3D Geometry", "Limits & Derivatives", "Probability", "Matrices & Determinants", "Continuity & Differentiability", "Integrals", "Differential Equations", "Vectors", "Linear Programming"],
        "Biology": ["Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology", "Anatomy", "Cell Cycle", "Transport in Plants", "Mineral Nutrition", "Photosynthesis", "Respiration", "Plant Growth", "Digestion", "Breathing", "Body Fluids", "Excretion", "Locomotion", "Neural Control", "Chemical Coordination", "Reproduction", "Genetics", "Evolution", "Human Health", "Biotech", "Ecology"],
        "Computer Sc.": ["Python Revision", "Functions", "File Handling", "Data Structures (Stack)", "Computer Networks", "Database Management (SQL)", "Interface Python with SQL", "Societal Impacts", "Boolean Algebra"],
        "Commerce": ["Nature of Business", "Forms of Organization", "Public vs Private", "Business Services", "E-Business", "Social Responsibility", "Sources of Finance", "Small Business", "Internal Trade", "International Business", "Financial Accounting", "Accounting Equation", "Journal & Ledger", "BRS", "Depreciation", "Final Accounts"],
        "Economics": ["Intro to Microeconomics", "Consumer Equilibrium", "Demand", "Production & Cost", "Market Forms", "National Income", "Money & Banking", "Govt Budget", "Balance of Payments", "Indian Economy 1950-1990", "Liberalization", "Poverty", "Human Capital", "Rural Development"],
        "Humanities": ["Early Societies", "Empires", "Changing Traditions", "Modernization", "Cold War Era", "End of Bipolarity", "US Hegemony", "Alternative Centres of Power", "South Asia", "International Organizations", "Security", "Environment", "Globalization"]
    }
};

function openStudyHub() {
    // Check if modal exists, if not create it dynamically (or use existing Section logic)
    // We will use a new section for this for better URL-like navigation feel
    const hubContent = document.getElementById('study-hub-content');
    if (hubContent) {
        hubContent.innerHTML = `
            <h2 style="margin-bottom:20px;">Study Hub 📚</h2>
            <div class="class-selector-grid">
                ${Object.keys(NOTES_DB).map(clsGrp => `
                    <button class="cls-btn" onclick="selectClass('${clsGrp}')">
                        Class ${clsGrp}
                    </button>
                `).join('')}
            </div>
            <div id="subject-area" style="margin-top:30px;">
                <p style="color:var(--text-muted)">Select your class group to view subjects.</p>
            </div>
        `;
        showSection('study-hub-section');
    } else {
        console.error("Study Hub content container not found!");
    }

}

function selectClass(clsGrp) {
    const subjects = NOTES_DB[clsGrp];
    const area = document.getElementById('subject-area');

    area.innerHTML = `
        <h3 style="color:var(--accent); margin-bottom:15px;">Class ${clsGrp} Subjects</h3>
        <div class="subject-grid">
            ${Object.keys(subjects).map(sub => `
                <div class="sub-card" onclick="viewNotes('${clsGrp}', '${sub}')">
                    <h4>${sub}</h4>
                    <span style="font-size:0.8rem; opacity:0.7;">${subjects[sub].length} Chapters</span>
                </div>
            `).join('')}
        </div>
        <div id="notes-list-area" style="margin-top:30px;"></div>
    `;
}

function viewNotes(clsGrp, sub) {
    const notes = NOTES_DB[clsGrp][sub];
    const area = document.getElementById('notes-list-area');

    area.innerHTML = `
        <h4 style="margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px;">
            ${sub} Notes
        </h4>
        <ul class="notes-list">
            ${notes.map(note => `
                <li class="note-item">
                    <span>📄 ${note}</span>
                    <button class="btn-sm-action">Download</button>
                </li>
            `).join('')}
        </ul>
    `;
}
