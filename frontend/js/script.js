console.log("script loaded");

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('[data-section-content]');

// HISTORY API SECTION SWITCHER
function showSection(sectionName, push = true) {
  // Highlight active nav link
  navLinks.forEach(l => l.classList.remove("active"));
  document.querySelector(`.nav-link[data-section="${sectionName}"]`)
    ?.classList.add("active");

  // Show only the target section
  sections.forEach(sec => {
    sec.style.display = sec.id === `${sectionName}-section` ? "" : "none";
  });

  // Push to browser history (avoid loop)
  if (push) {
    history.pushState({ section: sectionName }, "", "");
  }
}

// Intercept normal nav clicking
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    const target = link.dataset.section;
    showSection(target, true);
  });
});

// Handle BACK button (restore last section)
window.addEventListener("popstate", (event) => {
  if (event.state && event.state.section) {
    showSection(event.state.section, false);
  } else {
    showSection("dashboard", false);
  }
});

// When page loads, restore last viewed section
window.addEventListener("load", () => {
  if (history.state && history.state.section) {
    showSection(history.state.section, false);
  } else {
    showSection("dashboard", false); // initial default
  }
});


// Password Strength Checker
const pwdInput = document.getElementById('password-input');
const fill = document.getElementById('strength-meter-fill');
const label = document.getElementById('strength-label');

const checks = {
  length: document.getElementById('length-check'),
  upper: document.getElementById('uppercase-check'),
  lower: document.getElementById('lowercase-check'),
  number: document.getElementById('number-check'),
  symbol: document.getElementById('symbol-check')
};

pwdInput?.addEventListener('input', e => updatePasswordUI(e.target.value));

function updatePasswordUI(password) {
  let score = 0;

  const rules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*(),.?":{}|<>[\];'`~_+=/\-\\]/.test(password)
  };

  Object.entries(rules).forEach(([key, passed]) => {
    const icon = checks[key].querySelector('.material-icons');
    if (passed) {
      icon.textContent = 'check';
      checks[key].style.color = 'var(--good)';
      score++;
    } else {
      icon.textContent = 'close';
      checks[key].style.color = 'var(--muted)';
    }
  });

  const percent = (score / 5) * 100;
  fill.style.width = `${percent}%`;

  if (percent <= 20) {
    fill.style.background = '#e03b3b';
    label.textContent = 'Very Weak';
  } else if (percent <= 40) {
    fill.style.background = '#ff7a00';
    label.textContent = 'Weak';
  } else if (percent <= 60) {
    fill.style.background = '#f4c242';
    label.textContent = 'Moderate';
  } else if (percent <= 80) {
    fill.style.background = '#19a974';
    label.textContent = 'Strong';
  } else {
    fill.style.background = 'var(--good)';
    label.textContent = 'Very Strong';
  }
}

// Phishing Checker Dialog
const form = document.getElementById('phishing-form');
const overlay = document.getElementById('overlay');
const dialogTitle = document.getElementById('dialog-title');
const dialogMessage = document.getElementById('dialog-message');
const dialogClose = document.getElementById('dialog-close');

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const url = document.getElementById("url-input").value.trim();
  dialogMessage.innerHTML = "Scanning URL with VirusTotal... please wait.";
  overlay.style.display = "flex";

  try {
    const response = await fetch("http://localhost:3000/api/scan-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();

    if (!result.data) {
      showDialog("Error", "VirusTotal did not return a valid response.");
      return;
    }

    const stats = result.data.attributes.stats;
    const malicious = stats.malicious;
    const suspicious = stats.suspicious;

    if (malicious > 0 || suspicious > 0) {
      showDialog(
        "⚠️ Potential Phishing Detected",
        `URL: <strong>${url}</strong><br><br>
         Malicious: <strong>${malicious}</strong><br>
         Suspicious: <strong>${suspicious}</strong><br><br>
         VirusTotal indicates this URL is dangerous.`
      );
    } else {
      showDialog(
        "✔️ URL Seems Safe",
        `VirusTotal did not find any malicious activity.<br><br>URL: <strong>${url}</strong>`
      );
    }
  } catch (error) {
    showDialog("Error", "Failed to check URL. Is your backend running?");
  }
});

function showDialog(title, message) {
  dialogTitle.textContent = title;
  dialogMessage.innerHTML = message;
  overlay.style.display = 'flex';
}

dialogClose.addEventListener('click', () => (overlay.style.display = 'none'));
overlay.addEventListener('click', e => {
  if (e.target === overlay) overlay.style.display = 'none';
});

// ------------------------------------------------
// Cyber Safety Hub (News Section)
// ------------------------------------------------

// 1. Daily Scam Alert Content
const scamAlerts = [
  "New WhatsApp job scam: criminals offer ₹5,000/day to lure victims into payment traps.",
  "Fake courier message scam: SMS claims 'Your parcel is stuck. Pay ₹50 to confirm'. Never pay.",
  "Bank KYC update scam is rising. Banks never send links via SMS.",
  "Fake electricity bill scam: message says your power will be cut. Fraud link attached.",
  "Instagram verification scam: fake agents promise blue tick and steal accounts."
];

const dailyScam = document.getElementById("daily-scam-text");
dailyScam.textContent = scamAlerts[Math.floor(Math.random() * scamAlerts.length)];

// 2. Audio Reading (Text-to-Speech)
document.getElementById("play-alert-audio").onclick = () => {
  const utter = new SpeechSynthesisUtterance(dailyScam.textContent);
  utter.rate = 1;
  speechSynthesis.speak(utter);
};

// 3. Visual Safety Cards
const safetyTips = [
  { icon: "❌", text: "Never share an OTP with anyone." },
  { icon: "⚠️", text: "Avoid clicking unknown links." },
  { icon: "☎️", text: "Verify numbers before calling back." },
  { icon: "🔒", text: "Use strong passwords & enable 2FA." },
  { icon: "👮", text: "Police never ask for bank info." },
  { icon: "📦", text: "Do not pay for fake parcel messages." },
];

const cardsContainer = document.getElementById("visual-cards-container");

safetyTips.forEach(tip => {
  const card = document.createElement("div");
  card.className = "visual-card";
  card.innerHTML = `<h2>${tip.icon}</h2><p>${tip.text}</p>`;
  cardsContainer.appendChild(card);
});

// 4. Scam Example
document.getElementById("scam-example").innerHTML = `
  <strong>Fake SMS Example:</strong><br><br>
  <em>"Your bank account will be blocked. Update KYC now: <span style='color:red;'>http://fake-bank-verify.in</span>"</em>
  <br><br>
  <strong>Red Flags:</strong><br>
  - Wrong URL<br>
  - Threatening tone<br>
  - Random link<br>
  - Urgency tactic<br>
`;

// 5. Quick Quiz
const quizData = {
  question: "Which message is a scam?",
  options: [
    "Your parcel is waiting. Pay ₹20 here: http://xyparcel.in",
    "Bank never asks for OTP.",
    "Enable 2FA for your accounts."
  ],
  answerIndex: 0
};

document.getElementById("quiz-question").textContent = quizData.question;

quizData.options.forEach((opt, index) => {
  const btn = document.createElement("div");
  btn.className = "quiz-option";
  btn.textContent = opt;
  btn.onclick = () => {
    const result = document.getElementById("quiz-result");
    if (index === quizData.answerIndex) {
      result.textContent = "Correct! That message is a scam.";
      result.style.color = "red";
    } else {
      result.textContent = "Not correct. That one is safe advice.";
      result.style.color = "green";
    }
  };
  document.getElementById("quiz-options").appendChild(btn);
});

// 6. Daily Safety Checklist
const checklistItems = [
  "Do not share OTP",
  "Do not install unknown apps",
  "Do not click suspicious links",
  "Verify any message before acting",
  "Use strong passwords",
  "Enable 2FA (Two-Factor Authentication)",
];

const checklist = document.getElementById("safety-checklist");
checklistItems.forEach(item => {
  const li = document.createElement("li");
  li.textContent = "• " + item;
  checklist.appendChild(li);
});

// 7. Simple Mode Toggle
document.getElementById("simple-mode-toggle").addEventListener("change", function() {
  const isSimple = this.checked;

  document.querySelectorAll(".visual-card, .example-card, .alert-card, .quiz-card")
    .forEach(el => {
      el.style.fontSize = isSimple ? "18px" : "14px";
    });

  dailyScam.style.fontSize = isSimple ? "18px" : "14px";
});
