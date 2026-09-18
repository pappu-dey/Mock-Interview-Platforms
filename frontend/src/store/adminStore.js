/**
 * store/adminStore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * localStorage-backed reactive store for all admin-managed platform content.
 * Pre-seeded with the existing hardcoded data from Companies.jsx & Practice.jsx.
 *
 * Usage:
 *   import adminStore from '@/store/adminStore'
 *   adminStore.get('companies')            // read
 *   adminStore.add('companies', newItem)   // add
 *   adminStore.update('companies', id, patch) // update by id
 *   adminStore.remove('companies', id)     // delete by id
 */

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_COMPANIES = [
  {
    id: 'tcs', name: 'TCS', fullName: 'Tata Consultancy Services',
    industry: 'IT Services', logo: 'TC', color: '#1A6FBF',
    hq: 'Mumbai, India', employees: '600,000+', website: 'tcs.com',
    roles: ['Software Engineer', 'Systems Engineer', 'IT Analyst'],
    salaryRange: '₹3.5L – ₹7.5L', difficulty: 'Easy', status: 'applied',
    readiness: 84, rating: 4, hired: '18,000+ campus hires/yr',
    rounds: [
      { name: 'Online Aptitude', type: 'aptitude', desc: 'Quant, Reasoning, Verbal – 90 mins' },
      { name: 'Technical Interview', type: 'technical', desc: 'DSA basics, CS fundamentals, Java/Python' },
      { name: 'HR Round', type: 'hr', desc: 'Culture fit, situational questions' },
    ],
    topics: ['Arrays', 'OOP', 'SQL Basics', 'Aptitude', 'Verbal'],
    tip: 'TCS NQT has a strong aptitude section. Practice Quantitative Aptitude daily. Verbal section carries high weightage.',
    openRoles: 3,
  },
  {
    id: 'infosys', name: 'Infosys', fullName: 'Infosys Limited',
    industry: 'IT Services', logo: 'IN', color: '#006DB7',
    hq: 'Bengaluru, India', employees: '340,000+', website: 'infosys.com',
    roles: ['Systems Engineer', 'Technology Analyst', 'Associate Consultant'],
    salaryRange: '₹3.6L – ₹9L', difficulty: 'Medium', status: 'interview',
    readiness: 76, rating: 4, hired: '12,000+ campus hires/yr',
    rounds: [
      { name: 'HackerRank Test', type: 'aptitude', desc: 'Coding (2 problems) + Aptitude' },
      { name: 'Technical Round', type: 'technical', desc: 'DSA, OOPS, DBMS, OS concepts' },
      { name: 'HR Interview', type: 'hr', desc: 'Behavioral, goals, flexibility' },
    ],
    topics: ['Linked Lists', 'DBMS', 'Java OOP', 'OS', 'Coding'],
    tip: 'Infosys SP track (Power Programmer) requires strong coding skills. Focus on medium-level DSA problems.',
    openRoles: 5,
  },
  {
    id: 'wipro', name: 'Wipro', fullName: 'Wipro Limited',
    industry: 'IT Services', logo: 'WI', color: '#6B2D8B',
    hq: 'Bengaluru, India', employees: '250,000+', website: 'wipro.com',
    roles: ['Project Engineer', 'Software Engineer', 'Associate'],
    salaryRange: '₹3.5L – ₹6.5L', difficulty: 'Easy', status: 'saved',
    readiness: 61, rating: 3, hired: '10,000+ campus hires/yr',
    rounds: [
      { name: 'NLTH Online Test', type: 'aptitude', desc: 'Aptitude + English + Coding – 3 hrs' },
      { name: 'Technical Interview', type: 'technical', desc: 'Resume-based, DSA basics' },
      { name: 'HR Round', type: 'hr', desc: 'Standard HR questions' },
    ],
    topics: ['Basic DSA', 'Aptitude', 'English', 'Resume-Based'],
    tip: 'Wipro Elite NLTH is achievable with consistent aptitude practice. English section can be a differentiator.',
    openRoles: 4,
  },
  {
    id: 'accenture', name: 'Accenture', fullName: 'Accenture PLC',
    industry: 'Consulting & IT', logo: 'AC', color: '#A100FF',
    hq: 'Dublin / Bengaluru', employees: '750,000+', website: 'accenture.com',
    roles: ['Associate Developer', 'ASE', 'Analyst'],
    salaryRange: '₹4.5L – ₹8L', difficulty: 'Medium', status: 'offer',
    readiness: 91, rating: 5, hired: '20,000+ campus hires/yr',
    rounds: [
      { name: 'Cognitive & Technical', type: 'aptitude', desc: 'Gamified aptitude + coding challenge' },
      { name: 'Communication Test', type: 'technical', desc: 'Spoken English & situational scenarios' },
      { name: 'HR Discussion', type: 'hr', desc: 'Values fit, relocation, role preferences' },
    ],
    topics: ['Aptitude', 'Spoken English', 'Basic Coding', 'Behavioural'],
    tip: 'Accenture values communication skills highly. Practice spoken English and situational judgement questions.',
    openRoles: 7,
  },
  {
    id: 'cognizant', name: 'Cognizant', fullName: 'Cognizant Technology Solutions',
    industry: 'IT Services', logo: 'CG', color: '#1F6BE6',
    hq: 'Teaneck, NJ / Chennai', employees: '360,000+', website: 'cognizant.com',
    roles: ['Programmer Analyst', 'Associate', 'Full Stack Developer'],
    salaryRange: '₹4L – ₹7.5L', difficulty: 'Medium', status: 'applied',
    readiness: 72, rating: 4, hired: '8,000+ campus hires/yr',
    rounds: [
      { name: 'GenC Evolve Test', type: 'aptitude', desc: 'Aptitude + Coding – 90 mins' },
      { name: 'Technical Interview', type: 'technical', desc: 'DSA, project discussion, full-stack' },
      { name: 'HR Interview', type: 'hr', desc: 'Career goals, strengths' },
    ],
    topics: ['Full Stack', 'DSA', 'React', 'Node.js', 'Aptitude'],
    tip: 'Cognizant GenC Evolve track targets full-stack developers. Highlight your project work with React/Node.',
    openRoles: 2,
  },
  {
    id: 'hcl', name: 'HCL Tech', fullName: 'HCL Technologies',
    industry: 'IT Services', logo: 'HC', color: '#0F6FFF',
    hq: 'Noida, India', employees: '220,000+', website: 'hcltech.com',
    roles: ['Graduate Engineer Trainee', 'Software Engineer'],
    salaryRange: '₹3.5L – ₹6L', difficulty: 'Easy', status: 'saved',
    readiness: 68, rating: 3, hired: '6,000+ campus hires/yr',
    rounds: [
      { name: 'Online Assessment', type: 'aptitude', desc: 'Aptitude + Coding + Communication' },
      { name: 'Technical Interview', type: 'technical', desc: 'Core CS, OOP, Resume projects' },
      { name: 'HR Round', type: 'hr', desc: 'Standard HR questions' },
    ],
    topics: ['OOP', 'DBMS', 'Aptitude', 'Communication'],
    tip: 'HCL has a simpler interview process. Core CS fundamentals and good communication will get you through.',
    openRoles: 6,
  },
]

const SEED_APTITUDE = [
  {
    id: 'apti-percent-profit', category: 'aptitude',
    title: 'Percentages, Profit & Loss',
    description: 'Master cost price, selling price, margin percentages, and discount calculations common in campus placement tests.',
    questionsCount: 15, timeLimit: '20 Mins', difficulty: 'Medium',
    attempts: '24.5k', avgScore: '78%',
    sampleQuestions: [
      { id: 1, question: 'A trader marks up his goods by 25% above cost price and gives a discount of 10%. What is his net profit percentage?', options: ['12.5%', '15%', '10%', '11.25%'], correctIndex: 0, explanation: 'Let Cost Price = 100. Marked Price = 125. Discount = 10% of 125 = 12.5. Selling Price = 112.5. Net Profit % = 12.5%.' },
      { id: 2, question: 'If 20% of a number is added to 80, the result is the number itself. What is the number?', options: ['100', '120', '80', '90'], correctIndex: 0, explanation: '0.2x + 80 = x => 0.8x = 80 => x = 100.' },
    ],
  },
  {
    id: 'apti-speed-distance', category: 'aptitude',
    title: 'Time, Speed & Distance',
    description: 'Solve relative speed, train crossing problems, boat & streams, and average speed equations.',
    questionsCount: 20, timeLimit: '25 Mins', difficulty: 'Hard',
    attempts: '19.2k', avgScore: '65%',
    sampleQuestions: [
      { id: 1, question: 'A train 150m long passes a telegraph pole in 12 seconds. What is the speed of the train in km/h?', options: ['45 km/h', '50 km/h', '36 km/h', '60 km/h'], correctIndex: 0, explanation: 'Speed = 150/12 = 12.5 m/s. In km/h = 12.5 * (18/5) = 45 km/h.' },
    ],
  },
  {
    id: 'apti-work-time', category: 'aptitude',
    title: 'Time & Work / Pipes & Cisterns',
    description: 'Learn efficient unit-work method to solve individual rate, alternate day, and pipe filling problems.',
    questionsCount: 15, timeLimit: '20 Mins', difficulty: 'Medium',
    attempts: '21.8k', avgScore: '72%',
    sampleQuestions: [
      { id: 1, question: 'A can complete a task in 10 days, and B in 15 days. Working together, how many days will they take?', options: ['5 days', '6 days', '8 days', '7.5 days'], correctIndex: 1, explanation: 'Combined rate = (1/10 + 1/15) = 1/6. Total days = 6 days.' },
    ],
  },
]

const SEED_REASONING = [
  {
    id: 'reasoning-coding-decoding', category: 'reasoning',
    title: 'Coding-Decoding & Number Series',
    description: 'Identify letter substitution patterns, arithmetic progression steps, and missing term logic.',
    questionsCount: 20, timeLimit: '20 Mins', difficulty: 'Easy',
    attempts: '31.0k', avgScore: '84%',
    sampleQuestions: [
      { id: 1, question: 'If CAT is coded as 3120, how is DOG coded in the same pattern?', options: ['4157', '4147', '3157', '4158'], correctIndex: 0, explanation: 'Alphabet positions: C=3, A=1, T=20. So D=4, O=15, G=7 => 4157.' },
    ],
  },
  {
    id: 'reasoning-syllogism', category: 'reasoning',
    title: 'Syllogisms & Venn Diagrams',
    description: 'Master categorical logic statements, "Some A are B", "No B is C", and Venn diagram deductions.',
    questionsCount: 15, timeLimit: '18 Mins', difficulty: 'Medium',
    attempts: '28.4k', avgScore: '74%',
    sampleQuestions: [
      { id: 1, question: 'Statements: All cats are animals. All animals are mammals. Conclusion: All cats are mammals.', options: ['True (Follows)', 'False (Does not follow)', 'Cannot be determined'], correctIndex: 0, explanation: 'Since Cats ⊆ Animals and Animals ⊆ Mammals, Cats ⊆ Mammals. Conclusion follows.' },
    ],
  },
  {
    id: 'reasoning-blood-relations', category: 'reasoning',
    title: 'Blood Relations & Direction Sense',
    description: 'Decode complex family tree descriptions and cardinal direction movements with compass angles.',
    questionsCount: 15, timeLimit: '20 Mins', difficulty: 'Medium',
    attempts: '22.1k', avgScore: '76%',
    sampleQuestions: [
      { id: 1, question: 'Pointing to a man, a woman says: "His mother is the only daughter of my mother." How is the woman related to the man?', options: ['Mother', 'Sister', 'Aunt', 'Grandmother'], correctIndex: 0, explanation: '"Only daughter of my mother" is the woman herself. So his mother is the woman. She is his Mother.' },
    ],
  },
]

const SEED_GENERAL_QS = [
  { id: 'gq-1', question: 'Tell me about yourself.', category: 'HR', difficulty: 'Easy', answer: 'Structure: present role/education, past experience, and why you are here. Keep it to 2 minutes.' },
  { id: 'gq-2', question: 'What are your strengths and weaknesses?', category: 'HR', difficulty: 'Easy', answer: 'Mention 2–3 genuine strengths relevant to the role. For weaknesses, share one real weakness and explain what you are doing to improve it.' },
  { id: 'gq-3', question: 'Where do you see yourself in 5 years?', category: 'HR', difficulty: 'Easy', answer: 'Show ambition aligned with the company\'s growth. Mention wanting to grow into a senior/lead role and contribute to meaningful projects.' },
  { id: 'gq-4', question: 'Why do you want to work at this company?', category: 'HR', difficulty: 'Medium', answer: 'Research the company\'s mission, products, culture, and recent news. Show genuine enthusiasm and alignment with their values.' },
  { id: 'gq-5', question: 'Describe a time you handled a conflict in a team.', category: 'Behavioral', difficulty: 'Medium', answer: 'Use the STAR method: Situation, Task, Action, Result. Focus on your communication and resolution skills.' },
  { id: 'gq-6', question: 'How do you prioritize tasks when working on multiple projects?', category: 'Behavioral', difficulty: 'Medium', answer: 'Mention frameworks like Eisenhower Matrix or MoSCoW. Show you communicate proactively about deadlines.' },
]

const SEED_JAVA_QS = [
  { id: 'jq-1', question: 'What is the difference between JDK, JRE, and JVM?', category: 'Core Java', difficulty: 'Easy', answer: 'JVM executes bytecode. JRE = JVM + libraries to run Java programs. JDK = JRE + development tools (compiler, debugger) to write Java programs.' },
  { id: 'jq-2', question: 'Explain the four pillars of OOP in Java.', category: 'OOP', difficulty: 'Easy', answer: 'Encapsulation (bundling data + methods, access modifiers), Inheritance (extends), Polymorphism (method overloading/overriding), Abstraction (abstract classes, interfaces).' },
  { id: 'jq-3', question: 'What is the difference between == and .equals() in Java?', category: 'Core Java', difficulty: 'Easy', answer: '== compares references (memory addresses). .equals() compares the actual content. Always use .equals() for String comparison.' },
  { id: 'jq-4', question: 'What is the difference between ArrayList and LinkedList?', category: 'Collections', difficulty: 'Medium', answer: 'ArrayList uses dynamic array, O(1) for get, O(n) for insert/delete in middle. LinkedList uses doubly linked list, O(n) get, O(1) insert/delete at known position.' },
  { id: 'jq-5', question: 'What is a HashMap and how does it handle collisions?', category: 'Collections', difficulty: 'Medium', answer: 'HashMap stores key-value pairs using hashing. Collisions are handled via chaining (linked list / tree at each bucket). In Java 8+, buckets use TreeNodes when size > 8.' },
  { id: 'jq-6', question: 'Explain the concept of multithreading in Java.', category: 'Concurrency', difficulty: 'Medium', answer: 'Java supports multithreading via Thread class or Runnable interface. JVM schedules threads. Use synchronized, volatile, or java.util.concurrent for thread safety.' },
  { id: 'jq-7', question: 'What is the difference between abstract class and interface in Java 8+?', category: 'OOP', difficulty: 'Medium', answer: 'Abstract class can have constructors, state (fields), and partial implementations. Interface in Java 8+ can have default and static methods but no state. A class can implement multiple interfaces but extend only one abstract class.' },
  { id: 'jq-8', question: 'What are Java Streams and how are they used?', category: 'Streams', difficulty: 'Hard', answer: 'Streams (java.util.stream) allow functional-style processing of collections. Operations: filter(), map(), reduce(), collect(). Lazy evaluation — intermediate ops run only when terminal op is called.' },
]

const SEED_SQL_QS = [
  { id: 'sq-1', question: 'What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?', category: 'Joins', difficulty: 'Medium', answer: 'INNER JOIN: only matching rows. LEFT JOIN: all from left + matching from right (NULLs for no match). RIGHT JOIN: opposite. FULL OUTER JOIN: all rows from both tables, NULLs where no match.' },
  { id: 'sq-2', question: 'What is the difference between WHERE and HAVING?', category: 'Filtering', difficulty: 'Easy', answer: 'WHERE filters rows before grouping (no aggregate functions). HAVING filters groups after GROUP BY (can use aggregate functions like COUNT, SUM).' },
  { id: 'sq-3', question: 'What are indexes in SQL and when should you use them?', category: 'Indexing', difficulty: 'Medium', answer: 'Indexes speed up SELECT queries by creating a sorted data structure. Use on frequently queried columns (WHERE, JOIN). Avoid on small tables or frequently updated columns as they slow DML operations.' },
  { id: 'sq-4', question: 'What is the difference between DELETE, TRUNCATE, and DROP?', category: 'DDL/DML', difficulty: 'Easy', answer: 'DELETE: removes specific rows, logs each row, can be rolled back. TRUNCATE: removes all rows, minimal logging, fast. DROP: deletes entire table structure and data.' },
  { id: 'sq-5', question: 'What is a subquery? What is the difference between correlated and non-correlated?', category: 'Subqueries', difficulty: 'Medium', answer: 'A subquery is a query nested inside another. Non-correlated: runs once independently. Correlated: references outer query column, runs once per outer row — slower.' },
  { id: 'sq-6', question: 'Explain normalization. What are 1NF, 2NF, 3NF?', category: 'Design', difficulty: 'Hard', answer: '1NF: atomic values, no repeating groups. 2NF: 1NF + no partial dependency on composite PK. 3NF: 2NF + no transitive dependency (non-key cols depend only on PK).' },
  { id: 'sq-7', question: 'What is a window function? Give an example.', category: 'Aggregation', difficulty: 'Hard', answer: 'Window functions perform calculations across a set of rows related to the current row without collapsing them. E.g., ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) gives rank within each department.' },
]

const SEED_ALL_QUESTIONS = [
  {
    id: 1,
    question: 'A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?',
    option_a: '120 metres',
    option_b: '150 metres',
    option_c: '180 metres',
    option_d: '324 metres',
    answer: '150 metres',
    category: 'Quantitative Aptitude',
    sub_category: 'Speed, Time & Distance',
    question_type: 'MCQ',
    difficulty: 'Easy',
    explanation: 'Speed = 60 * (5/18) m/sec = 50/3 m/sec. Length of train = Speed * Time = (50/3) * 9 = 150 metres.',
    company_tag: 'TCS, Infosys, Wipro',
    created_at: '2026-09-18T10:00:00',
    updated_at: '2026-09-18T10:00:00',
  },
  {
    id: 2,
    question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
    option_a: '(1/3)',
    option_b: '(1/8)',
    option_c: '(2/8)',
    option_d: '(1/16)',
    answer: '(1/8)',
    category: 'Logical Reasoning',
    sub_category: 'Number Series',
    question_type: 'MCQ',
    difficulty: 'Easy',
    explanation: 'This is an alternating division series. In each step, the previous number is divided by 2. (1/4) / 2 = 1/8.',
    company_tag: 'TCS, Accenture, Cognizant',
    created_at: '2026-09-18T10:15:00',
    updated_at: '2026-09-18T10:15:00',
  },
  {
    id: 3,
    question: 'Which of the following data structures is most suitable for implementing a LIFO (Last In First Out) behavior?',
    option_a: 'Queue',
    option_b: 'Array List',
    option_c: 'Stack',
    option_d: 'Linked List',
    answer: 'Stack',
    category: 'Technical',
    sub_category: 'Data Structures',
    question_type: 'MCQ',
    difficulty: 'Easy',
    explanation: 'A Stack follows the Last In First Out (LIFO) principle, where the last element inserted is the first one removed.',
    company_tag: 'Google, Amazon, TCS',
    created_at: '2026-09-18T10:30:00',
    updated_at: '2026-09-18T10:30:00',
  },
  {
    id: 4,
    question: 'What happens when you execute a program having multiple public classes in a single Java file?',
    option_a: 'It compiles successfully',
    option_b: 'Compile-time error: The public type must be defined in its own file',
    option_c: 'Runtime exception',
    option_d: 'Only the first public class is compiled',
    answer: 'Compile-time error: The public type must be defined in its own file',
    category: 'Technical',
    sub_category: 'Core Java',
    question_type: 'MCQ',
    difficulty: 'Medium',
    explanation: 'Java mandates that a single compilation unit (.java file) can contain at most one public class, and the filename must match that public class name.',
    company_tag: 'Infosys, Oracle, Wipro',
    created_at: '2026-09-18T10:45:00',
    updated_at: '2026-09-18T10:45:00',
  },
  {
    id: 5,
    question: 'In SQL, which clause is used with aggregate functions to filter groups after GROUP BY?',
    option_a: 'WHERE',
    option_b: 'HAVING',
    option_c: 'FILTER',
    option_d: 'ORDER BY',
    answer: 'HAVING',
    category: 'Technical',
    sub_category: 'SQL Database',
    question_type: 'MCQ',
    difficulty: 'Medium',
    explanation: 'HAVING is used to filter groups based on conditions involving aggregate functions, whereas WHERE filters individual rows before grouping.',
    company_tag: 'TCS, Microsoft, Amazon',
    created_at: '2026-09-18T11:00:00',
    updated_at: '2026-09-18T11:00:00',
  },
]

// ─── Store Keys ───────────────────────────────────────────────────────────────
const KEYS = {
  allQuestions: 'admin_store_all_questions',
  companies:  'admin_store_companies',
  aptitude:   'admin_store_aptitude',
  reasoning:  'admin_store_reasoning',
  generalQs:  'admin_store_general_qs',
  javaQs:     'admin_store_java_qs',
  sqlQs:      'admin_store_sql_qs',
}

const SEEDS = {
  allQuestions: SEED_ALL_QUESTIONS,
  companies:  SEED_COMPANIES,
  aptitude:   SEED_APTITUDE,
  reasoning:  SEED_REASONING,
  generalQs:  SEED_GENERAL_QS,
  javaQs:     SEED_JAVA_QS,
  sqlQs:      SEED_SQL_QS,
}

// ─── Subscribers ──────────────────────────────────────────────────────────────
const subscribers = {}

// ─── Core helpers ─────────────────────────────────────────────────────────────
function _notify(key) {
  ;(subscribers[key] || []).forEach((cb) => cb())
}

function _read(key) {
  try {
    const raw = localStorage.getItem(KEYS[key])
    if (raw === null) {
      // First load — seed with default data
      const seed = SEEDS[key] || []
      localStorage.setItem(KEYS[key], JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw)
  } catch {
    return SEEDS[key] || []
  }
}

function _write(key, data) {
  localStorage.setItem(KEYS[key], JSON.stringify(data))
  _notify(key)
}

// ─── Public API ───────────────────────────────────────────────────────────────
const adminStore = {
  /** Get all items for a key */
  get(key) {
    return _read(key)
  },

  /** Subscribe to changes on a key. Returns unsubscribe fn. */
  subscribe(key, callback) {
    if (!subscribers[key]) subscribers[key] = []
    subscribers[key].push(callback)
    return () => {
      subscribers[key] = subscribers[key].filter((cb) => cb !== callback)
    }
  },

  /** Add a new item (auto-generates id if not provided) */
  add(key, item) {
    const data = _read(key)
    const newItem = {
      ...item,
      id: item.id || `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    }
    _write(key, [...data, newItem])
    return newItem
  },

  /** Update an existing item by id */
  update(key, id, patch) {
    const data = _read(key)
    _write(
      key,
      data.map((item) => (item.id === id ? { ...item, ...patch } : item))
    )
  },

  /** Remove an item by id */
  remove(key, id) {
    const data = _read(key)
    _write(key, data.filter((item) => item.id !== id))
  },

  /** Replace all data for a key */
  setAll(key, data) {
    _write(key, data)
  },

  /** Reset a key to seed data */
  reset(key) {
    _write(key, SEEDS[key] || [])
  },

  /** Reset ALL store data to seeds */
  resetAll() {
    Object.keys(KEYS).forEach((k) => _write(k, SEEDS[k] || []))
  },
}

export default adminStore
