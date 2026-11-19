import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import practiceService from "../../services/practiceService";
import "./AptitudeExam.css";

/* ─── Category → DB category mapping ────────────────────────────────────── */
const CATEGORY_DB_MAP = {
  quantitative: "Quantitative Aptitude",
  technical: "Technical",
  reasoning: "Logical Reasoning",
  verbal: "Verbal Ability",
};

/* ─── Exam question counts per category ─────────────────────────────────── */
const EXAM_QUESTION_COUNT = {
  quantitative: 25,
  technical: 30,
  reasoning: 20,
  verbal: 20,
};

/* ─── Fallback Static Question Banks (used if API is unavailable) ─────── */
const QUESTION_BANK = {
  quantitative: [
    { id: 1, question: "A train travels 360 km in 4 hours. What is its speed in m/s?", options: ["25 m/s", "90 m/s", "100 m/s", "36 m/s"], answer: 0 },
    { id: 2, question: "If 20% of a number is 80, what is 35% of the same number?", options: ["120", "140", "160", "180"], answer: 1 },
    { id: 3, question: "A shopkeeper sold an article for ₹1200 at a profit of 20%. What was the cost price?", options: ["₹900", "₹1000", "₹960", "₹1100"], answer: 1 },
    { id: 4, question: "Two pipes can fill a tank in 12 and 15 hours respectively. If both are opened simultaneously, in how many hours will the tank be filled?", options: ["6.67 hrs", "13.5 hrs", "6 hrs", "7.5 hrs"], answer: 0 },
    { id: 5, question: "The ratio of ages of A and B is 3:5. After 6 years it will be 2:3. What is A's current age?", options: ["18 yrs", "24 yrs", "12 yrs", "30 yrs"], answer: 0 },
    { id: 6, question: "What is the compound interest on ₹10,000 at 10% p.a. for 2 years?", options: ["₹2000", "₹2100", "₹1900", "₹2200"], answer: 1 },
    { id: 7, question: "A can do a work in 10 days and B in 15 days. They work together for 3 days and A leaves. In how many days will B finish remaining work?", options: ["7", "6.5", "8", "9"], answer: 0 },
    { id: 8, question: "The average of 5 consecutive even numbers is 14. What is the largest number?", options: ["16", "18", "20", "14"], answer: 1 },
    { id: 9, question: "If the simple interest on ₹5000 for 3 years is ₹900, what is the rate of interest?", options: ["5%", "6%", "5.5%", "4.5%"], answer: 1 },
    { id: 10, question: "A sum of money doubles itself in 8 years at simple interest. What is the rate of interest?", options: ["10%", "12.5%", "8%", "15%"], answer: 1 },
    { id: 11, question: "The HCF and LCM of two numbers are 8 and 96 respectively. If one number is 24, find the other.", options: ["32", "28", "36", "24"], answer: 0 },
    { id: 12, question: "What is the next number in the series: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "36"], answer: 1 },
    { id: 13, question: "A boat can travel 15 km/hr in still water. The stream speed is 3 km/hr. How long does it take to travel 72 km upstream?", options: ["5 hrs", "6 hrs", "4.5 hrs", "7 hrs"], answer: 1 },
    { id: 14, question: "A cylinder has radius 7 cm and height 10 cm. Find its volume. (π = 22/7)", options: ["1540 cm³", "1760 cm³", "1320 cm³", "1650 cm³"], answer: 0 },
    { id: 15, question: "If A : B = 2 : 3 and B : C = 4 : 5, then A : C = ?", options: ["8:15", "2:5", "6:10", "10:12"], answer: 0 },
    { id: 16, question: "A number when divided by 6 leaves remainder 4. What is the remainder when the square of that number is divided by 6?", options: ["4", "2", "0", "1"], answer: 0 },
    { id: 17, question: "Find the area of a rhombus with diagonals 12 cm and 16 cm.", options: ["96 cm²", "192 cm²", "48 cm²", "112 cm²"], answer: 0 },
    { id: 18, question: "Three numbers are in the ratio 1:2:3 and their HCF is 12. The smallest number is:", options: ["12", "24", "36", "48"], answer: 0 },
    { id: 19, question: "A man's salary is increased by 20% and then decreased by 20%. Net change in salary is:", options: ["0%", "+4%", "-4%", "-2%"], answer: 2 },
    { id: 20, question: "If 3x + 4y = 18 and 4x + 3y = 17, what is x + y?", options: ["5", "7", "4", "6"], answer: 0 },
    { id: 21, question: "The perimeter of a rectangle is 60 cm. Its length is 18 cm. Find the area.", options: ["216 cm²", "324 cm²", "180 cm²", "252 cm²"], answer: 0 },
    { id: 22, question: "A person walks at 4 km/h and reaches office 5 min late. If he walks at 5 km/h, he arrives 10 min early. Find the distance.", options: ["5 km", "3 km", "4 km", "6 km"], answer: 0 },
    { id: 23, question: "A bag contains 5 red, 3 blue and 2 green balls. One ball is drawn at random. Probability it is not green?", options: ["4/5", "1/5", "3/5", "7/10"], answer: 0 },
    { id: 24, question: "Find the missing term: 1, 4, 9, 16, ?, 36", options: ["25", "24", "20", "30"], answer: 0 },
    { id: 25, question: "Two numbers are in ratio 7:11. Their sum is 162. What is the difference?", options: ["36", "42", "27", "48"], answer: 0 },
  ],
  technical: [
    { id: 1, question: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Linked List", "Tree"], answer: 1 },
    { id: 2, question: "What is the time complexity of binary search?", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"], answer: 2 },
    { id: 3, question: "Which sorting algorithm has worst-case O(n log n)?", options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"], answer: 2 },
    { id: 4, question: "What does SQL SELECT statement do?", options: ["Deletes records", "Inserts records", "Retrieves data", "Updates data"], answer: 2 },
    { id: 5, question: "What is the output of: printf('%d', sizeof(int)) in C?", options: ["2", "4", "8", "Depends on compiler"], answer: 3 },
    { id: 6, question: "Which OSI layer handles routing?", options: ["Data Link", "Transport", "Network", "Session"], answer: 2 },
    { id: 7, question: "What is a deadlock in OS?", options: ["Infinite loop", "Memory overflow", "All processes waiting for each other", "CPU overload"], answer: 2 },
    { id: 8, question: "In Java, which keyword is used to create an object?", options: ["create", "object", "new", "alloc"], answer: 2 },
    { id: 9, question: "Which normal form removes transitive dependency?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 2 },
    { id: 10, question: "What is the default access modifier in Java?", options: ["public", "private", "protected", "package-private"], answer: 3 },
    { id: 11, question: "Which protocol is used for email?", options: ["HTTP", "FTP", "SMTP", "TCP"], answer: 2 },
    { id: 12, question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Transfer Markup Language", "None"], answer: 0 },
    { id: 13, question: "Which data structure is used in BFS?", options: ["Stack", "Queue", "Priority Queue", "Linked List"], answer: 1 },
    { id: 14, question: "What is polymorphism in OOP?", options: ["One class, many objects", "One name, many forms", "Hiding data", "Code reuse"], answer: 1 },
    { id: 15, question: "What is the purpose of a foreign key?", options: ["Identifies unique row", "Links two tables", "Encrypts data", "Indexes a column"], answer: 1 },
    { id: 16, question: "What is the value of 0xFF in decimal?", options: ["155", "255", "128", "256"], answer: 1 },
    { id: 17, question: "Which of the following is NOT a primitive data type in Java?", options: ["int", "float", "String", "boolean"], answer: 2 },
    { id: 18, question: "What is a mutex?", options: ["Memory unit", "Mutual exclusion lock", "Module extension", "None"], answer: 1 },
    { id: 19, question: "Which HTTP method is used to send data to the server?", options: ["GET", "PUT", "POST", "DELETE"], answer: 2 },
    { id: 20, question: "What does CPU cache do?", options: ["Stores permanent files", "Speeds up CPU access to frequently used data", "Manages RAM", "Handles I/O"], answer: 1 },
    { id: 21, question: "What is the output of 5 & 3 in C?", options: ["7", "3", "1", "0"], answer: 2 },
    { id: 22, question: "Which tree traversal visits root last?", options: ["Preorder", "Inorder", "Postorder", "Level order"], answer: 2 },
    { id: 23, question: "What is the size of a char in C?", options: ["1 byte", "2 bytes", "4 bytes", "Depends on system"], answer: 0 },
    { id: 24, question: "What does DBMS stand for?", options: ["Data Base Management System", "Digital Base Machine System", "Data Byte Management Setup", "None"], answer: 0 },
    { id: 25, question: "What is an abstract class in Java?", options: ["A class with no methods", "A class that cannot be instantiated", "A fully implemented class", "A final class"], answer: 1 },
    { id: 26, question: "Which protocol works at layer 4 of OSI?", options: ["IP", "TCP", "HTTP", "ARP"], answer: 1 },
    { id: 27, question: "What is the output of: int x = 5; System.out.println(x++);", options: ["6", "5", "4", "Error"], answer: 1 },
    { id: 28, question: "Which of the following is a NoSQL database?", options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"], answer: 2 },
    { id: 29, question: "What is the worst-case complexity of quicksort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], answer: 2 },
    { id: 30, question: "What is encapsulation?", options: ["Wrapping data and methods together", "Inheriting parent class", "Overloading methods", "None"], answer: 0 },
  ],
  reasoning: [
    { id: 1, question: "If MANGO is coded as NBOHP, how is APPLE coded?", options: ["BQQMF", "APQLF", "BQPMF", "CQQMF"], answer: 0 },
    { id: 2, question: "Find the odd one out: 3, 5, 7, 9, 11", options: ["3", "5", "9", "11"], answer: 2 },
    { id: 3, question: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", options: ["Granddaughter", "Daughter", "Niece", "Sister"], answer: 0 },
    { id: 4, question: "Which comes next? AB, DE, GH, JK, ?", options: ["MN", "NO", "LM", "OP"], answer: 0 },
    { id: 5, question: "In a row of 40 students, Ram is 15th from the left. What is his position from the right?", options: ["25th", "26th", "24th", "27th"], answer: 1 },
    { id: 6, question: "All cats are animals. All animals are living things. Which conclusion follows?", options: ["All living things are cats", "All cats are living things", "Some cats are not living things", "None"], answer: 1 },
    { id: 7, question: "Point A is 10 km north of B. C is 8 km east of B. How far is A from C?", options: ["12 km", "√164 km", "√164 ≈ 12.8 km", "10 km"], answer: 2 },
    { id: 8, question: "If 2 + 3 = 10, 3 + 4 = 21, 4 + 5 = 34, then 5 + 6 = ?", options: ["50", "55", "45", "60"], answer: 0 },
    { id: 9, question: "A clock shows 3:15. What is the angle between hour and minute hand?", options: ["0°", "7.5°", "15°", "30°"], answer: 1 },
    { id: 10, question: "Which mirror image of PRIZE is correct?", options: ["EZIRP", "PRIZE", "PRISE", "None"], answer: 0 },
    { id: 11, question: "Statements: Some pens are books. All books are tables. Conclusion: Some pens are tables.", options: ["True", "False", "Cannot be determined", "None"], answer: 0 },
    { id: 12, question: "Series: 2, 5, 10, 17, 26, ?", options: ["35", "37", "36", "38"], answer: 1 },
    { id: 13, question: "How many times does digit 3 appear from 1 to 100?", options: ["10", "19", "20", "21"], answer: 2 },
    { id: 14, question: "In a certain language, GARDEN is coded as GRDAEN. How is FLOWER coded?", options: ["FWOLRE", "FLOWRE", "FLWOER", "FOLWER"], answer: 0 },
    { id: 15, question: "If Sunday falls on 1st March, what day is 25th March?", options: ["Saturday", "Sunday", "Monday", "Friday"], answer: 1 },
    { id: 16, question: "What is the water image of the word CHAIR?", options: ["CHAIR inverted vertically", "RIAH\u200bC", "Same as mirror", "None"], answer: 0 },
    { id: 17, question: "6 men can complete work in 8 days. How many men are needed to do the same in 4 days?", options: ["10", "12", "14", "8"], answer: 1 },
    { id: 18, question: "P is Q's brother. Q is R's sister. R is S's son. How is P related to S?", options: ["Son", "Nephew", "Daughter", "Cannot determine"], answer: 1 },
    { id: 19, question: "Complete the analogy: Doctor : Hospital :: Teacher : ?", options: ["Book", "School", "Knowledge", "Student"], answer: 1 },
    { id: 20, question: "Find odd one out: Triangle, Square, Circle, Cube", options: ["Triangle", "Square", "Circle", "Cube"], answer: 3 },
  ],
  verbal: [
    { id: 1, question: "Choose the correct synonym of 'Benevolent':", options: ["Cruel", "Generous", "Selfish", "Ignorant"], answer: 1 },
    { id: 2, question: "Choose the antonym of 'Eloquent':", options: ["Fluent", "Expressive", "Inarticulate", "Loquacious"], answer: 2 },
    { id: 3, question: "Fill in the blank: She _____ to the market before it closed.", options: ["go", "goes", "went", "gone"], answer: 2 },
    { id: 4, question: "Identify the correctly spelled word:", options: ["Accomodation", "Accommodation", "Acommodation", "Accommodaton"], answer: 1 },
    { id: 5, question: "Choose the meaning of the idiom 'Beat around the bush':", options: ["Walk in a garden", "Avoid the main topic", "Work very hard", "Move quickly"], answer: 1 },
    { id: 6, question: "Select the correct passive voice: 'They built the house in 1990.'", options: ["The house was built in 1990", "The house is built in 1990", "The house built in 1990", "None"], answer: 0 },
    { id: 7, question: "Which word is the odd one out? Happy, Joyful, Elated, Melancholy", options: ["Happy", "Joyful", "Elated", "Melancholy"], answer: 3 },
    { id: 8, question: "Fill in: The committee _____ divided on the issue.", options: ["is", "are", "was", "were"], answer: 2 },
    { id: 9, question: "Find the error: 'Each of the boys were given a prize.'", options: ["Each of", "the boys", "were given", "a prize"], answer: 2 },
    { id: 10, question: "Choose the correctly punctuated sentence:", options: ["Its a fine day.", "It's a fine day.", "Its' a fine day.", "It is, a fine day."], answer: 1 },
    { id: 11, question: "Synonym of 'Cacophony':", options: ["Harmony", "Silence", "Noise", "Melody"], answer: 2 },
    { id: 12, question: "Which is the indirect speech of: He said, 'I am feeling well'?", options: ["He said he was feeling well", "He said that he is feeling well", "He told I was feeling well", "None"], answer: 0 },
    { id: 13, question: "'To burn the midnight oil' means:", options: ["Waste resources", "Work late into the night", "Start a fire", "Explore darkness"], answer: 1 },
    { id: 14, question: "Choose the antonym of 'Zenith':", options: ["Top", "Peak", "Nadir", "Apex"], answer: 2 },
    { id: 15, question: "The plural of 'Phenomenon' is:", options: ["Phenomenons", "Phenomena", "Phenomenas", "Phenomenes"], answer: 1 },
    { id: 16, question: "Fill in: Neither Ram nor his friends _____ present.", options: ["is", "are", "was", "were"], answer: 1 },
    { id: 17, question: "Which sentence uses the subjunctive mood?", options: ["If I was rich", "If I were rich", "If I am rich", "If I will be rich"], answer: 1 },
    { id: 18, question: "Choose the synonym of 'Ephemeral':", options: ["Eternal", "Temporary", "Vast", "Significant"], answer: 1 },
    { id: 19, question: "Identify the figure of speech: 'The stars danced in the night sky.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], answer: 2 },
    { id: 20, question: "Find the error: 'He is one of those who speak the truth.'", options: ["He is", "one of those", "who speak", "the truth"], answer: 2 },
  ],
};

/* ─── Convert DB row → exam question format ─────────────────────────────── */
function dbRowToQuestion(row, idx) {
  const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
  // answer field in DB is the text of the correct option; find its index
  const rawAnswer = (row.answer || "").trim().toUpperCase();
  let answerIdx = 0;
  if (rawAnswer === "A") answerIdx = 0;
  else if (rawAnswer === "B") answerIdx = 1;
  else if (rawAnswer === "C") answerIdx = 2;
  else if (rawAnswer === "D") answerIdx = 3;
  else {
    // Try matching full text
    const matched = options.findIndex(
      (opt) => opt && opt.trim().toLowerCase() === row.answer.trim().toLowerCase()
    );
    answerIdx = matched >= 0 ? matched : 0;
  }
  return { id: row.id ?? idx + 1, question: row.question, options, answer: answerIdx };
}

/* ─── Fisher-Yates shuffle ──────────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Web Audio Violation Sound ─────────────────────────────────────────── */
function playViolationBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) { }
}

/* ─── Timer formatter ────────────────────────────────────────────────────── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const DURATIONS = {
  quantitative: 30 * 60,
  technical: 40 * 60,
  reasoning: 25 * 60,
  verbal: 20 * 60,
};

const MAX_VIOLATIONS = 3;

/* ─── Main Aptitude Exam Component ───────────────────────────────────────── */
export default function AptitudeExam({ category, onExit }) {
  const totalTime = DURATIONS[category.id] || 30 * 60;
  const examCount = EXAM_QUESTION_COUNT[category.id] || 20;

  // ── Questions loaded from DB (or fallback) ──────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const dbCategory = CATEGORY_DB_MAP[category.id];
    if (!dbCategory) {
      const fb = QUESTION_BANK[category.id] || [];
      setQuestions(shuffle(fb).slice(0, examCount));
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    fetch(`https://main-mock-interview-platforms-pappus-workspace.light-cloud.io/api/questions?category=${encodeURIComponent(dbCategory)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(dbRowToQuestion);
          setQuestions(shuffle(mapped).slice(0, examCount));
          setLoadError(null);
        } else {
          const fb = QUESTION_BANK[category.id] || [];
          setQuestions(shuffle(fb).slice(0, examCount));
          setLoadError("no_db_data");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        const fb = QUESTION_BANK[category.id] || [];
        setQuestions(shuffle(fb).slice(0, examCount));
        setLoadError(err.message);
        setIsLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.id]);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [flagged, setFlagged] = useState([]);
  const [visited, setVisited] = useState([]);

  // Re-initialize answer/flag/visited arrays once questions are ready
  useEffect(() => {
    if (questions.length > 0 && answers.length !== questions.length) {
      setAnswers(Array(questions.length).fill(null));
      setFlagged(Array(questions.length).fill(false));
      setVisited(() => {
        const arr = Array(questions.length).fill(false);
        arr[0] = true;
        return arr;
      });
    }
  }, [questions.length, answers.length]);

  // Strict Anti-Cheat States
  const [warningCount, setWarningCount] = useState(0);
  const [violationLogs, setViolationLogs] = useState([]);
  const [showWarningToast, setShowWarningToast] = useState(false);
  const [warningToastMsg, setWarningToastMsg] = useState("");
  const [securityBreachModal, setSecurityBreachModal] = useState(false);
  const [breachReason, setBreachReason] = useState("");
  const [returnCountdown, setReturnCountdown] = useState(15);
  const [isDisqualified, setIsDisqualified] = useState(false);

  const timerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastViolationTimeRef = useRef(0);
  const lastInternalInteractionTimeRef = useRef(Date.now());
  const examRef = useRef(null);

  const answersRef = useRef(answers);
  answersRef.current = answers;

  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;

  const recordViolationRef = useRef(null);
  const handleFinalSubmitRef = useRef(null);

  /* ── Fullscreen Keyboard Lock API Helper (Blocks ESC from exiting) ──────── */
  const requestKeyboardLock = useCallback(async () => {
    try {
      if ("keyboard" in navigator && typeof navigator.keyboard.lock === "function") {
        await navigator.keyboard.lock(["Escape"]);
      }
    } catch (err) { }
  }, []);

  const releaseKeyboardLock = useCallback(() => {
    try {
      if ("keyboard" in navigator && typeof navigator.keyboard.unlock === "function") {
        navigator.keyboard.unlock();
      }
    } catch (err) { }
  }, []);

  /* ── Fullscreen Request Helpers ────────────────────────────────────────── */
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    const req = el.requestFullscreen
      ? el.requestFullscreen()
      : el.webkitRequestFullscreen
        ? el.webkitRequestFullscreen()
        : el.mozRequestFullScreen
          ? el.mozRequestFullScreen()
          : el.msRequestFullscreen
            ? el.msRequestFullscreen()
            : null;

    if (req && typeof req.then === "function") {
      req.then(() => requestKeyboardLock()).catch(() => { });
    } else {
      requestKeyboardLock();
    }
  }, [requestKeyboardLock]);

  const exitFullscreen = useCallback(() => {
    releaseKeyboardLock();
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => { });
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      }
    } catch (err) { }
  }, [releaseKeyboardLock]);

  /* ── Auto / Manual Submission Helpers ─────────────────────────────────── */
  const calcScore = useCallback(() => {
    return answersRef.current.reduce((acc, ans, i) => {
      if (ans === questions[i].answer) return acc + 1;
      return acc;
    }, 0);
  }, [questions]);

  const handleFinalSubmit = useCallback((disqualified = false) => {
    clearInterval(timerRef.current);
    clearInterval(countdownIntervalRef.current);
    const sc = calcScore();
    setScore(sc);
    setIsDisqualified(disqualified);
    setSubmitted(true);
    submittedRef.current = true;
    setSecurityBreachModal(false);
    setShowConfirm(false);
    exitFullscreen();

    const totalQ = questions ? questions.length : 20;
    const pct = totalQ > 0 ? Math.round((sc / totalQ) * 100) : 0;
    const catLabel = CATEGORY_DB_MAP[category?.id] || category?.title || "Quantitative Aptitude";
    const spentSec = Math.max(30, totalTime - timeLeft);
    practiceService.recordAssessmentSession({
      category: catLabel,
      topic: `${category?.title || catLabel} Exam`,
      totalQuestions: totalQ,
      correctCount: sc,
      score: pct,
      timeSpentSeconds: spentSec,
      type: "Aptitude",
    });
  }, [calcScore, exitFullscreen, questions, category, totalTime, timeLeft]);

  handleFinalSubmitRef.current = handleFinalSubmit;

  /* ── Violation Trigger (Stable Reference) ──────────────────────────────── */
  const recordViolation = useCallback((reason) => {
    if (submittedRef.current) return;

    // Debounce rapid multiple triggers within 800ms
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 800) return;
    lastViolationTimeRef.current = now;

    playViolationBeep();

    setWarningCount((prevCount) => {
      const nextCount = prevCount + 1;
      const timestamp = new Date().toLocaleTimeString();

      setViolationLogs((prevLogs) => [
        ...prevLogs,
        { time: timestamp, reason: `${reason} (Warning ${nextCount}/${MAX_VIOLATIONS})` },
      ]);

      // If reached or exceeded MAX_VIOLATIONS (3), auto-submit and disqualify!
      if (nextCount >= MAX_VIOLATIONS) {
        handleFinalSubmitRef.current?.(true);
        return nextCount;
      }

      // Otherwise show Breach Modal & Toast
      setBreachReason(reason);
      setSecurityBreachModal(true);
      setReturnCountdown(15);

      setWarningToastMsg(`Violation ${nextCount}/${MAX_VIOLATIONS}: ${reason}`);
      setShowWarningToast(true);
      setTimeout(() => setShowWarningToast(false), 4000);

      return nextCount;
    });
  }, []);

  recordViolationRef.current = recordViolation;

  /* ── 15s Countdown while Breach Modal is open ─────────────────────────── */
  useEffect(() => {
    if (securityBreachModal && !submitted) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        setReturnCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            recordViolationRef.current?.("Timeout: Failed to return to full-screen within 15 seconds.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(countdownIntervalRef.current);
    }

    return () => clearInterval(countdownIntervalRef.current);
  }, [securityBreachModal, submitted]);

  /* ── Mount Fullscreen & Listeners ──────────────────────────────────────── */
  useEffect(() => {
    // Lock body scroll
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    enterFullscreen();

    // Prevent Page Reload / Unload
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Exam in progress! Leaving will cancel your assessment.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Block Popstate (Browser Back)
    window.history.pushState(null, "", window.location.href);
    const handlePop = () => {
      window.history.pushState(null, "", window.location.href);
      recordViolationRef.current?.("Browser back button pressed.");
    };
    window.addEventListener("popstate", handlePop);

    // Fullscreen Exit Detection (ESC or OS action)
    const handleFullscreenChange = () => {
      const isFS =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement;
      if (!isFS && !submittedRef.current) {
        // Re-request fullscreen immediately
        enterFullscreen();
        recordViolationRef.current?.("Fullscreen exited / ESC key pressed.");
      } else if (isFS) {
        requestKeyboardLock();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);

    // Tab Switch / App Switch Detection (Visibility & Focus)
    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        recordViolationRef.current?.("Switched browser tab or minimized window.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Window Blur (Debounced and guarded against internal element clicks)
    const handleBlur = () => {
      if (submittedRef.current) return;
      // If user recently interacted inside the exam (e.g. clicking options, buttons, radio), ignore blur
      if (Date.now() - lastInternalInteractionTimeRef.current < 800) {
        return;
      }

      // Check after a brief delay if document genuinely lost focus to external app or tab
      setTimeout(() => {
        if (!submittedRef.current && !document.hasFocus() && (document.hidden || !document.fullscreenElement)) {
          recordViolationRef.current?.("Window minimized or switched to another application.");
        }
      }, 350);
    };
    window.addEventListener("blur", handleBlur);

    // Track internal user interactions (pointer/touch/click)
    const registerInternalInteraction = () => {
      lastInternalInteractionTimeRef.current = Date.now();
    };
    window.addEventListener("pointerdown", registerInternalInteraction, true);
    window.addEventListener("mousedown", registerInternalInteraction, true);

    // Block Keyboard Shortcuts, ESC Key, & DevTools
    const handleKeyDown = (e) => {
      // ESC Key - Strict Trap
      if (e.key === "Escape" || e.code === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        requestKeyboardLock();
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          enterFullscreen();
        }
        recordViolationRef.current?.("ESC key pressed (Blocked).");
        return false;
      }

      // Function keys: F5 (reload), F11 (fullscreen toggle), F12 (devtools)
      if (e.key === "F12" || e.key === "F5" || e.key === "F11") {
        e.preventDefault();
        e.stopPropagation();
        recordViolationRef.current?.(`Restricted function key (${e.key}) pressed.`);
        return false;
      }

      // Devtools shortcuts: Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
        recordViolationRef.current?.("Developer tools shortcut attempt.");
        return false;
      }

      // Copy, Paste, Cut, Print, Save, Select All, Source Code
      if (
        (e.ctrlKey || e.metaKey) &&
        ["c", "v", "x", "p", "s", "a", "u", "r"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        e.stopPropagation();
        recordViolationRef.current?.(`Forbidden keyboard shortcut (Ctrl+${e.key.toUpperCase()}).`);
        return false;
      }

      // Alt key combos (Alt+Tab, Alt+F4)
      if (e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        recordViolationRef.current?.("Alt key modifier detected.");
        return false;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyDown, true);

    // Block Context Menu, Copy, Paste, Drag (text selection blocked via CSS user-select)
    const blockEvent = (e) => e.preventDefault();
    document.addEventListener("contextmenu", blockEvent);
    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("paste", blockEvent);
    document.addEventListener("dragstart", blockEvent);

    return () => {
      document.body.style.overflow = origOverflow;
      exitFullscreen();
      clearInterval(timerRef.current);
      clearInterval(countdownIntervalRef.current);

      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePop);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("pointerdown", registerInternalInteraction, true);
      window.removeEventListener("mousedown", registerInternalInteraction, true);

      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyDown, true);

      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("paste", blockEvent);
      document.removeEventListener("dragstart", blockEvent);
    };
  }, [enterFullscreen, exitFullscreen, requestKeyboardLock]);

  /* ── Exam Countdown Timer ─────────────────────────────────────────────── */
  useEffect(() => {
    if (submitted || isLoading) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinalSubmit(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [handleFinalSubmit, submitted, isLoading]);

  /* ── Question Navigation Helpers ──────────────────────────────────────── */
  function navigateToQuestion(idx) {
    if (idx >= 0 && idx < questions.length) {
      setCurrentQ(idx);
      setVisited((prev) => {
        const copy = [...prev];
        copy[idx] = true;
        return copy;
      });
    }
  }

  function selectAnswer(optIdx) {
    lastInternalInteractionTimeRef.current = Date.now();
    const updated = [...answers];
    updated[currentQ] = optIdx;
    setAnswers(updated);
  }

  function handleMarkForReviewAndNext() {
    const updatedFlags = [...flagged];
    updatedFlags[currentQ] = true;
    setFlagged(updatedFlags);

    if (currentQ < questions.length - 1) {
      navigateToQuestion(currentQ + 1);
    }
  }

  function handleSaveAndNext() {
    if (currentQ < questions.length - 1) {
      navigateToQuestion(currentQ + 1);
    } else {
      setShowConfirm(true);
    }
  }

  function handleClearResponse() {
    const updated = [...answers];
    updated[currentQ] = null;
    setAnswers(updated);
  }

  // Summary counts
  const answeredCount = answers.filter((a) => a !== null).length;
  const flaggedCount = flagged.filter((f) => f).length;
  const unattemptedCount = questions.length - answeredCount;
  const timerCritical = timeLeft < 300; // < 5 minutes
  const pct = Math.round(((score || 0) / questions.length) * 100);

  /* ── 0. Loading Screen ──────────────────────────────────────────────────── */
  if (isLoading) {
    return createPortal(
      <div className="exam-loading-screen">
        <div className="exam-loading-box">
          <div className="exam-loading-spinner" />
          <p className="exam-loading-text">Loading questions from database…</p>
          <p className="exam-loading-sub">Please wait. Do not close this window.</p>
        </div>
      </div>,
      document.body
    );
  }

  /* ── 1. Result & Disqualification View ─────────────────────────────────── */
  if (submitted) {
    return createPortal(
      <div className="exam-result-view">
        <div className="result-container">
          {isDisqualified ? (
            <div className="disqualified-header-box">
              <div className="disqualified-icon">🚫</div>
              <h2>EXAM TERMINATED: DISQUALIFIED</h2>
              <p>
                You exceeded the maximum permissible security violations (3/3) by exiting full screen,
                pressing ESC, or switching windows/apps.
              </p>
            </div>
          ) : (
            <div className={`result-badge ${pct >= 70 ? "pass" : "fail"}`}>
              {pct >= 70 ? "✓ PASSED ASSESSMENT" : "✗ NEEDS IMPROVEMENT"}
            </div>
          )}

          <h1 className="result-title">{category.title}</h1>

          <div className="result-score-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={isDisqualified ? "#dc2626" : pct >= 70 ? "#16a34a" : "#ea580c"}
                strokeWidth="10"
                strokeDasharray={`${(pct / 100) * 326} 326`}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="64" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#0f172a">
                {isDisqualified ? "0%" : `${pct}%`}
              </text>
              <text x="60" y="80" textAnchor="middle" fontSize="10" fill="#64748b">
                {isDisqualified ? "Disqualified" : "Score"}
              </text>
            </svg>
          </div>

          <div className="result-stats-row">
            <div className="rstat-item">
              <span className="rstat-num">{isDisqualified ? 0 : score}</span>
              <label>Correct</label>
            </div>
            <div className="rstat-item">
              <span className="rstat-num">{questions.length - (score || 0)}</span>
              <label>Incorrect</label>
            </div>
            <div className="rstat-item">
              <span className="rstat-num">{unattemptedCount}</span>
              <label>Unattempted</label>
            </div>
            <div className="rstat-item warn-stat">
              <span className="rstat-num">{warningCount} / {MAX_VIOLATIONS}</span>
              <label>Violations</label>
            </div>
          </div>

          {/* Violation Audit Log */}
          {violationLogs.length > 0 && (
            <div className="violation-audit-card">
              <h4>⚠️ Security Incident Log</h4>
              <div className="violation-log-list">
                {violationLogs.map((log, idx) => (
                  <div key={idx} className="violation-log-item">
                    <span className="log-time">{log.time}</span>
                    <span className="log-reason">{log.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question Review */}
          {!isDisqualified && (
            <div className="result-review-section">
              <h3>Detailed Question Review</h3>
              <div className="review-list">
                {questions.map((q, i) => {
                  const isCorrect = answers[i] === q.answer;
                  const isSkipped = answers[i] === null;
                  return (
                    <div
                      key={q.id}
                      className={`review-card ${isCorrect ? "correct" : isSkipped ? "skipped" : "wrong"}`}
                    >
                      <div className="rq-header">
                        <span className="rq-badge">Q{i + 1}</span>
                        <span className="rq-status">
                          {isCorrect ? "✓ Correct" : isSkipped ? "— Skipped" : "✗ Incorrect"}
                        </span>
                      </div>
                      <p className="rq-text">{q.question}</p>
                      <div className="rq-answers">
                        <div className="rq-ans-your">
                          <strong>Your Answer:</strong>{" "}
                          {answers[i] !== null ? q.options[answers[i]] : "None (Skipped)"}
                        </div>
                        {!isCorrect && (
                          <div className="rq-ans-correct">
                            <strong>Correct Answer:</strong> {q.options[q.answer]}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="result-actions">
            <button className="btn-finish-exit" onClick={onExit}>
              ← Return to Aptitude Tests
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  /* ── 2. Active Exam View (Mounted via Portal directly to body) ──────────── */
  return createPortal(
    <div className="tcs-exam-viewport" ref={examRef}>
      {/* Violation Toast Notification */}
      {showWarningToast && (
        <div className="exam-warning-toast">
          <span className="toast-icon">🚨</span>
          <span>{warningToastMsg}</span>
        </div>
      )}

      {/* Fullscreen & Anti-Cheat Breach Lockdown Overlay */}
      {securityBreachModal && (
        <div className="breach-lockdown-overlay">
          <div className="breach-dialog">
            <div className="breach-siren">🚨</div>
            <h2>SECURITY VIOLATION DETECTED</h2>
            <div className="breach-violation-count">
              Warning {warningCount} of {MAX_VIOLATIONS}
            </div>
            <p className="breach-message">
              Reason: <strong>{breachReason}</strong>
            </p>
            <div className="breach-explanation">
              You exited full-screen mode or switched active windows. Switching windows to use external AI tools
              (such as ChatGPT, Claude, or search engines) is strictly prohibited.
            </div>

            <div className="breach-timer-box">
              <span>Auto-disqualification in:</span>
              <span className="breach-seconds">{returnCountdown}s</span>
            </div>

            <p className="breach-warning-sub">
              {warningCount === 2
                ? "⚠️ CRITICAL WARNING: This is your final chance! Next violation will permanently disqualify you."
                : "Please return to full-screen mode immediately to continue your test."}
            </p>

            <button
              className="btn-resume-fullscreen"
              onClick={() => {
                enterFullscreen();
                setSecurityBreachModal(false);
              }}
            >
              I Understand & Resume Full Screen
            </button>
          </div>
        </div>
      )}

      {/* Confirmation to Submit Modal */}
      {showConfirm && (
        <div className="exam-confirm-overlay">
          <div className="exam-confirm-modal">
            <h3>Ready to Submit Assessment?</h3>
            <p>Please review your test progress summary before final submission:</p>

            <div className="confirm-summary-grid">
              <div className="c-item">
                <span className="c-val answered">{answeredCount}</span>
                <span className="c-lbl">Answered</span>
              </div>
              <div className="c-item">
                <span className="c-val skipped">{unattemptedCount}</span>
                <span className="c-lbl">Unanswered</span>
              </div>
              <div className="c-item">
                <span className="c-val flagged">{flaggedCount}</span>
                <span className="c-lbl">Marked for Review</span>
              </div>
              <div className="c-item">
                <span className="c-val warnings">{warningCount}</span>
                <span className="c-lbl">Violations</span>
              </div>
            </div>

            {unattemptedCount > 0 && (
              <div className="confirm-warning-note">
                ⚠️ You still have <strong>{unattemptedCount} unanswered questions</strong>.
              </div>
            )}

            <div className="confirm-buttons-row">
              <button className="btn-cancel-submit" onClick={() => setShowConfirm(false)}>
                Continue Exam
              </button>
              <button className="btn-confirm-submit" onClick={() => handleFinalSubmit(false)}>
                Yes, Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fixed Slim Top Header Bar ───────────────────────────────────── */}
      <header className="tcs-topbar">
        <div className="topbar-left">
          <div className="tcs-badge">PrepPilot Mock</div>
          <div className="exam-title-meta">
            <span className="topbar-exam-name">{category.title}</span>
            <span className="topbar-section-pill">Aptitude Practice</span>
          </div>
        </div>

        <div className="topbar-center">
          <div className={`violations-pill ${warningCount > 0 ? "has-violations" : ""}`}>
            <span className="v-icon">🛡️</span>
            <span>
              Violations: <strong>{warningCount}</strong> / {MAX_VIOLATIONS}
            </span>
          </div>
        </div>

        <div className="topbar-right">
          <div className={`tcs-timer-box ${timerCritical ? "critical-timer" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="timer-text-wrap">
              <span className="timer-lbl">Time Left:</span>
              <span className="timer-digits">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Exam Body (100% Screen Fitted, No External Scroll) ──────── */}
      <div className="tcs-main-shell">
        {/* ── Left Column: Question Area + Fixed Bottom Nav ───────────────── */}
        <section className="tcs-left-pane">
          {/* Question Subheader (Fixed slim) */}
          <div className="question-subheader">
            <div className="q-badge-wrap">
              <span className="q-current-number">Question {currentQ + 1}</span>
              <span className="q-total-count">of {questions.length}</span>
            </div>
            <div className="q-marks-wrap">
              <span className="marks-badge">+1.00 / -0.00</span>
              {flagged[currentQ] && <span className="flagged-badge">🚩 Marked</span>}
            </div>
          </div>

          {/* Question & Options Scrollable Body (Compact & Fitted) */}
          <div className="question-content-container">
            <div className="question-card">
              <p className="question-prompt">{questions[currentQ]?.question}</p>
            </div>

            <div className="options-container">
              {questions[currentQ]?.options.map((opt, i) => {
                const isSelected = answers[currentQ] === i;
                const letter = String.fromCharCode(65 + i);
                return (
                  <label
                    key={i}
                    className={`option-card ${isSelected ? "selected-option" : ""}`}
                    onClick={() => selectAnswer(i)}
                  >
                    <div className="option-radio-circle">
                      <div className="radio-inner" />
                    </div>
                    <span className="option-badge-letter">{letter}</span>
                    <span className="option-label-text">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── 100% LOCKED / FIXED BOTTOM ACTION BAR ────────────────────── */}
          {/* Student NEVER needs to scroll down to reach Next or Submit! */}
          <footer className="fixed-bottom-action-bar">
            <div className="action-bar-left">
              <button
                className={`btn-action-outline ${flagged[currentQ] ? "active-flag" : ""}`}
                onClick={handleMarkForReviewAndNext}
              >
                🚩 {flagged[currentQ] ? "Marked" : "Mark Review"}
              </button>
              <button
                className="btn-action-outline"
                disabled={answers[currentQ] === null}
                onClick={handleClearResponse}
              >
                Clear
              </button>
            </div>

            <div className="action-bar-right">
              <button
                className="btn-action-prev"
                disabled={currentQ === 0}
                onClick={() => navigateToQuestion(currentQ - 1)}
              >
                ← Prev
              </button>

              <button className="btn-action-next" onClick={handleSaveAndNext}>
                {currentQ < questions.length - 1 ? "Save & Next →" : "Save & Review"}
              </button>

              <button className="btn-action-submit" onClick={() => setShowConfirm(true)}>
                Submit Exam
              </button>
            </div>
          </footer>
        </section>

        {/* ── Right Column: Question Palette Sidebar (Zero Sideways Scroll) ── */}
        <aside className="tcs-palette-sidebar">
          {/* Candidate Profile Box */}
          <div className="palette-user-card">
            <div className="palette-avatar">👤</div>
            <div className="palette-user-info">
              <span className="candidate-name">Candidate</span>
              <span className="candidate-status">● Live Exam</span>
            </div>
          </div>

          {/* Palette Legend (Zero Horizontal Overflow) */}
          <div className="palette-legend-grid">
            <div className="legend-item">
              <span className="pal-chip answered">{answeredCount}</span>
              <span className="legend-text">Answered</span>
            </div>
            <div className="legend-item">
              <span className="pal-chip unattempted">{unattemptedCount}</span>
              <span className="legend-text">Not Answered</span>
            </div>
            <div className="legend-item">
              <span className="pal-chip marked">{flaggedCount}</span>
              <span className="legend-text">Review</span>
            </div>
            <div className="legend-item">
              <span className="pal-chip current">1</span>
              <span className="legend-text">Current</span>
            </div>
          </div>

          {/* Questions Grid Header */}
          <div className="palette-title-bar">
            <span>Question Palette</span>
            <span className="palette-count-tag">{questions.length} Qs</span>
          </div>

          {/* Grid Numbers (No Sideways Scroll) */}
          <div className="palette-numbers-scroll">
            <div className="palette-grid">
              {questions.map((_, idx) => {
                const isCurrent = idx === currentQ;
                const isAnswered = answers[idx] !== null;
                const isFlagged = flagged[idx];
                const isVisited = visited[idx];

                let statusClass = "pal-not-visited";
                if (isCurrent) {
                  statusClass = "pal-current";
                } else if (isFlagged && isAnswered) {
                  statusClass = "pal-marked-answered";
                } else if (isFlagged) {
                  statusClass = "pal-marked";
                } else if (isAnswered) {
                  statusClass = "pal-answered";
                } else if (isVisited) {
                  statusClass = "pal-not-answered";
                }

                return (
                  <button
                    key={idx}
                    className={`pal-btn ${statusClass}`}
                    onClick={() => navigateToQuestion(idx)}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
