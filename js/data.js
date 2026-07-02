/**
 * ============================================================
 *  Bhanja College of Nursing — data.js
 *  Default data definitions & localStorage CRUD helpers
 * ============================================================
 */

/* ── localStorage key constants ─────────────────────────────── */
const LS_KEYS = {
  notices: 'bcn_notices',
  gallery: 'bcn_gallery',
  leads:   'bcn_leads',
};

/* ── Default Notices ────────────────────────────────────────── */
const DEFAULT_NOTICES = [
  {
    id: 1,
    title: 'Admission Open for 2026-27 Batch',
    body: 'Applications are invited for ANM, GNM, and B.Sc. Nursing programs for the academic year 2026-27. Last date of application: August 31, 2026.',
    date: '2026-06-01',
    isNew: true,
    showOnTicker: true,
    pdfUrl: '#',
  },
  {
    id: 2,
    title: 'Annual Lamp Lighting Ceremony 2026',
    body: 'The annual lamp lighting and capping ceremony will be held on July 15, 2026 at the college auditorium.',
    date: '2026-05-28',
    isNew: true,
    showOnTicker: true,
    pdfUrl: '',
  },
  {
    id: 3,
    title: 'Clinical Posting Schedule - June 2026',
    body: 'Clinical posting schedule for all batches has been published. Students are advised to report to their respective hospitals.',
    date: '2026-05-20',
    isNew: false,
    showOnTicker: false,
    pdfUrl: '#',
  },
  {
    id: 4,
    title: 'Internal Assessment Exam Notice',
    body: 'Internal assessment examinations for GNM 2nd year will commence from July 1, 2026. Detailed schedule is attached.',
    date: '2026-05-15',
    isNew: false,
    showOnTicker: true,
    pdfUrl: '#',
  },
  {
    id: 5,
    title: 'Faculty Workshop on Clinical Teaching',
    body: 'A two-day faculty development workshop on clinical teaching methodologies will be conducted on June 20-21, 2026.',
    date: '2026-05-10',
    isNew: false,
    showOnTicker: false,
    pdfUrl: '',
  },
  {
    id: 6,
    title: 'Library New Books Addition',
    body: 'New reference books for B.Sc. Nursing and GNM curriculum have been added to the library. Students can access the updated catalogue.',
    date: '2026-05-05',
    isNew: false,
    showOnTicker: false,
    pdfUrl: '',
  },
];

/* ── Default Gallery ────────────────────────────────────────── */
const DEFAULT_GALLERY = [
  { id: 1,  src: 'assets/images/campus1.jpg',   caption: 'College Main Building',                category: 'campus'   },
  { id: 2,  src: 'assets/images/lab1.jpg',       caption: 'Nursing Simulation Laboratory',        category: 'labs'     },
  { id: 3,  src: 'assets/images/campus2.jpg',    caption: 'College Library',                      category: 'campus'   },
  { id: 4,  src: 'assets/images/clinical1.jpg',  caption: 'Clinical Training at District Hospital', category: 'clinical' },
  { id: 5,  src: 'assets/images/event1.jpg',     caption: 'Annual Lamp Lighting Ceremony 2025',   category: 'events'   },
  { id: 6,  src: 'assets/images/lab2.jpg',       caption: 'Anatomy Laboratory',                   category: 'labs'     },
  { id: 7,  src: 'assets/images/campus3.jpg',    caption: 'College Garden & Campus View',         category: 'campus'   },
  { id: 8,  src: 'assets/images/event2.jpg',     caption: 'International Nurses Day Celebration', category: 'events'   },
  { id: 9,  src: 'assets/images/clinical2.jpg',  caption: 'Community Health Nursing Field Visit', category: 'clinical' },
  { id: 10, src: 'assets/images/lab3.jpg',       caption: 'Computer Lab',                         category: 'labs'     },
  { id: 11, src: 'assets/images/campus4.jpg',    caption: 'College Hostel',                       category: 'campus'   },
  { id: 12, src: 'assets/images/event3.jpg',     caption: 'Farewell Ceremony 2025 Batch',         category: 'events'   },
];

/* ── Course Data (static, not stored in localStorage) ───────── */
const COURSE_DATA = {
  bsc: {
    name: 'B.Sc. Nursing',
    duration: '4 Years',
    eligibility:
      '10+2 with Physics, Chemistry, Biology with minimum 45% aggregate (40% for SC/ST)',
    intake: 60,
    fee: '₹1,20,000 per annum (approximate)',
    description:
      'Bachelor of Science in Nursing is a 4-year undergraduate degree programme that prepares students to become professional nurses capable of functioning in diverse healthcare settings. The curriculum integrates classroom learning with extensive clinical practice across specialty areas.',
    subjects: [
      'Anatomy & Physiology',
      'Nutrition & Biochemistry',
      'Nursing Foundations',
      'Psychology',
      'Microbiology',
      'Sociology',
      'Pharmacology',
      'Medical-Surgical Nursing',
      'Community Health Nursing',
      'Child Health Nursing',
      'Mental Health Nursing',
      'Midwifery & Obstetric Nursing',
      'Nursing Research',
      'Nursing Management',
    ],
    careers: [
      'Staff Nurse',
      'Nursing Officer',
      'Community Health Nurse',
      'Nursing Educator',
      'Research Associate',
      'Public Health Specialist',
    ],
  },

  gnm: {
    name: 'GNM (General Nursing & Midwifery)',
    duration: '3 Years + 6 Months Internship',
    eligibility:
      '10+2 with Science (PCB) with minimum 40% aggregate',
    intake: 40,
    fee: '₹80,000 per annum (approximate)',
    description:
      'GNM is a diploma course that trains students in general nursing and midwifery skills. Graduates are equipped to provide quality nursing care in hospitals, community health centres, and primary healthcare settings.',
    subjects: [
      'Anatomy & Physiology',
      'Microbiology',
      'Psychology & Sociology',
      'Fundamentals of Nursing',
      'First Aid',
      'Community Health Nursing',
      'Health Education',
      'Medical-Surgical Nursing',
      'Pharmacology',
      'Paediatric Nursing',
      'Midwifery',
      'Mental Health Nursing',
    ],
    careers: [
      'Staff Nurse',
      'Community Health Worker',
      'Home Care Nurse',
      'OT Technician',
      'Nursing Supervisor',
    ],
  },

  anm: {
    name: 'ANM (Auxiliary Nurse Midwifery)',
    duration: '2 Years',
    eligibility: '10+2 pass from a recognized board',
    intake: 30,
    fee: '₹60,000 per annum (approximate)',
    description:
      'ANM is a 2-year diploma course designed to prepare auxiliary nurses who can deliver essential healthcare services at the grassroots level, focusing on maternal and child health, community health, and primary care.',
    subjects: [
      'Community Health Nursing',
      'Health Promotion',
      'Child Health Nursing',
      'Midwifery',
      'Health Centre Management',
      'Primary Healthcare',
      'Nutrition',
      'Environmental Sanitation',
    ],
    careers: [
      'ANM in PHC/CHC',
      'Community Health Worker',
      'Health Educator',
      'Village Health Nurse',
    ],
  },
};

/* ================================================================
   CRUD Helpers – all safe-wrapped for JSON parse errors
   ================================================================ */

/**
 * Safely parse a localStorage value; returns fallback on error.
 */
function _parseLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    console.warn(`[data.js] Failed to parse localStorage key "${key}". Using fallback.`);
    return fallback;
  }
}

/* ── Notices ─────────────────────────────────────────────────── */

/**
 * Retrieve all notices. Falls back to DEFAULT_NOTICES when
 * localStorage is empty or corrupted.
 */
function getNotices() {
  return _parseLS(LS_KEYS.notices, DEFAULT_NOTICES);
}

/**
 * Persist the notices array to localStorage.
 * @param {Array} notices
 */
function saveNotices(notices) {
  try {
    localStorage.setItem(LS_KEYS.notices, JSON.stringify(notices));
  } catch (e) {
    console.error('[data.js] Could not save notices:', e);
  }
}

/* ── Gallery ─────────────────────────────────────────────────── */

/**
 * Retrieve all gallery items. Falls back to DEFAULT_GALLERY.
 */
function getGallery() {
  return _parseLS(LS_KEYS.gallery, DEFAULT_GALLERY);
}

/**
 * Persist the gallery array to localStorage.
 * @param {Array} gallery
 */
function saveGallery(gallery) {
  try {
    localStorage.setItem(LS_KEYS.gallery, JSON.stringify(gallery));
  } catch (e) {
    console.error('[data.js] Could not save gallery:', e);
  }
}

/* ── Admission Leads ─────────────────────────────────────────── */

/**
 * Retrieve all admission enquiry leads.
 */
function getLeads() {
  return _parseLS(LS_KEYS.leads, []);
}

/**
 * Persist the leads array to localStorage.
 * @param {Array} leads
 */
function saveLeads(leads) {
  try {
    localStorage.setItem(LS_KEYS.leads, JSON.stringify(leads));
  } catch (e) {
    console.error('[data.js] Could not save leads:', e);
  }
}

/**
 * Add a single lead entry. Auto-generates an `id` and `date`.
 * @param {Object} lead – form field data (name, email, phone, course, etc.)
 * @returns {Object} the enriched lead that was saved
 */
function addLead(lead) {
  const leads = getLeads();

  // Generate a unique numeric id
  const maxId = leads.reduce((max, l) => Math.max(max, l.id || 0), 0);

  const enrichedLead = {
    id: maxId + 1,
    date: new Date().toISOString(),
    ...lead,
  };

  leads.push(enrichedLead);
  saveLeads(leads);
  return enrichedLead;
}

/* ── Initialization ──────────────────────────────────────────── */

/**
 * Seed localStorage with default data if it doesn't already exist.
 * Call this once on every page load (idempotent).
 */
function initializeData() {
  if (!localStorage.getItem(LS_KEYS.notices)) {
    saveNotices(DEFAULT_NOTICES);
  }
  if (!localStorage.getItem(LS_KEYS.gallery)) {
    saveGallery(DEFAULT_GALLERY);
  }
  // Leads start empty — no seeding required, but ensure the key exists
  if (!localStorage.getItem(LS_KEYS.leads)) {
    saveLeads([]);
  }
}
