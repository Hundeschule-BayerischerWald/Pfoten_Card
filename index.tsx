/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { GoogleGenAI } from "@google/genai";

// --- Declarations for external libraries ---
declare var jspdf: any;
declare var XLSX: any;


// --- CONFIGURATION ---

const REQUIREMENT_IDS = {
    GRUPPENSTUNDE: 'group_class',
    PRUEFUNG: 'exam',
    SOCIAL_WALK: 'social_walk',
    WIRTSHAUSTRAINING: 'tavern_training',
    ERSTE_HILFE: 'first_aid',
    VORTRAG_BINDUNG: 'lecture_bonding',
    VORTRAG_JAGD: 'lecture_hunting',
    WS_KOMMUNIKATION: 'ws_communication',
    WS_STRESS: 'ws_stress',
    THEORIEABEND: 'theory_night',
};

const TRANSACTION_TYPES = {
  GRUPPENSTUNDE: { name: 'Gruppenstunde', price: 12, requirementId: REQUIREMENT_IDS.GRUPPENSTUNDE },
  TRAIL: { name: 'Trail', price: 18, requirementId: null },
  PRUEFUNG: { name: 'Prüfungsstunde', price: 12, requirementId: REQUIREMENT_IDS.PRUEFUNG },
  SOCIAL_WALK: { name: 'Social Walk', price: 12, requirementId: REQUIREMENT_IDS.SOCIAL_WALK },
  WIRTSHAUSTRAINING: { name: 'Wirtshaustraining', price: 12, requirementId: REQUIREMENT_IDS.WIRTSHAUSTRAINING },
  ERSTE_HILFE: { name: 'Erste Hilfe Kurs', price: 50, requirementId: REQUIREMENT_IDS.ERSTE_HILFE },
  VORTRAG_BINDUNG: { name: 'Vortrag Bindung & Beziehung', price: 12, requirementId: REQUIREMENT_IDS.VORTRAG_BINDUNG },
  VORTRAG_JAGD: { name: 'Vortrag Jagdverhalten', price: 12, requirementId: REQUIREMENT_IDS.VORTRAG_JAGD },
  WS_KOMMUNIKATION: { name: 'WS Kommunikation & Körpersprache', price: 12, requirementId: REQUIREMENT_IDS.WS_KOMMUNIKATION },
  WS_STRESS: { name: 'WS Stress & Impulskontrolle', price: 12, requirementId: REQUIREMENT_IDS.WS_STRESS },
  THEORIEABEND: { name: 'Theorieabend Hundeführerschein', price: 25, requirementId: REQUIREMENT_IDS.THEORIEABEND }
};

const LEVEL_CONFIG = {
    1: { level: 1, title: 'Level 1 - Welpen', color: 'purple', note: 'Keine Voraussetzungen zum Aufsteigen nötig.' },
    2: { level: 2, title: 'Level 2 - Grundlagen', color: 'green' },
    3: { level: 3, title: 'Level 3 - Fortgeschrittene', color: 'blue' },
    4: { level: 4, title: 'Level 4 - Masterclass', color: 'orange' },
    5: { level: 5, title: 'Level 5 - Hundeführerschein', color: 'yellow' },
};

const LEVEL_REQUIREMENTS = {
    2: { [REQUIREMENT_IDS.GRUPPENSTUNDE]: 6, [REQUIREMENT_IDS.PRUEFUNG]: 1 },
    3: { [REQUIREMENT_IDS.GRUPPENSTUNDE]: 6, [REQUIREMENT_IDS.PRUEFUNG]: 1 },
    4: { [REQUIREMENT_IDS.SOCIAL_WALK]: 6, [REQUIREMENT_IDS.WIRTSHAUSTRAINING]: 2, [REQUIREMENT_IDS.PRUEFUNG]: 1 },
    5: { [REQUIREMENT_IDS.PRUEFUNG]: 1 }
};

const HUNDEFUEHRERSCHEIN_REQUIREMENTS = {
    [REQUIREMENT_IDS.VORTRAG_BINDUNG]: 1,
    [REQUIREMENT_IDS.VORTRAG_JAGD]: 1,
    [REQUIREMENT_IDS.WS_KOMMUNIKATION]: 1,
    [REQUIREMENT_IDS.WS_STRESS]: 1,
    [REQUIREMENT_IDS.THEORIEABEND]: 1,
    [REQUIREMENT_IDS.ERSTE_HILFE]: 1,
};

const REQUIREMENT_NAMES = {
    [REQUIREMENT_IDS.GRUPPENSTUNDE]: 'Gruppenstunde',
    [REQUIREMENT_IDS.PRUEFUNG]: 'Prüfung',
    [REQUIREMENT_IDS.SOCIAL_WALK]: 'Social Walk',
    [REQUIREMENT_IDS.WIRTSHAUSTRAINING]: 'Wirtshaustraining',
    [REQUIREMENT_IDS.VORTRAG_BINDUNG]: 'Vortrag Bindung & Beziehung',
    [REQUIREMENT_IDS.VORTRAG_JAGD]: 'Vortrag Jagdverhalten',
    [REQUIREMENT_IDS.WS_KOMMUNIKATION]: 'WS Kommunikation & Körpersprache',
    [REQUIREMENT_IDS.WS_STRESS]: 'WS Stress- & Impulskontrolle',
    [REQUIREMENT_IDS.THEORIEABEND]: 'Theorieabend Hundeführerschein',
    [REQUIREMENT_IDS.ERSTE_HILFE]: 'Erste-Hilfe-Kurs',
};

// --- MOCK DATA ---
const mockCustomers = [
    {
        id: 1,
        internalId: "68b03032",
        name: "Max Mustermann",
        dogName: "Bello",
        chipNumber: "987000012345678",
        email: "max.mustermann@email.com",
        password: "password123",
        phone: "+49 123 456789",
        status: "active",
        credits: 135.00,
        levelId: 1,
        levelUpHistory: { 1: "2025-01-10T10:00:00.000Z" },
        isVip: false,
        memberSince: "2025-08-28",
        createdBy: "Administrator",
        transactions: [
            { id: 1, type: "Aufladung", amount: 150, date: "2025-01-15", bookedBy: "Christian" },
            { id: 2, type: "Abbuchung: Gruppenstunde", amount: -15, date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0], bookedBy: "Sophie", meta: { requirementId: REQUIREMENT_IDS.GRUPPENSTUNDE } },
        ],
        documents: [
            { id: 1, name: "Impfausweis_Bello.pdf", url: "#" },
            { id: 2, name: "Vertrag_2025.pdf", url: "#" },
        ]
    },
    {
        id: 2,
        internalId: "68b03032",
        name: "Anna Schmidt",
        dogName: "Luna (Labrador)",
        chipNumber: "", // "Nicht angegeben" in screenshot
        email: "anna.schmidt@email.de",
        password: "password123",
        phone: "+49 687 654321",
        status: "active",
        credits: 229.00,
        levelId: 1,
        levelUpHistory: { 1: "2025-02-01T10:00:00.000Z" },
        isVip: false,
        memberSince: "2025-08-28",
        createdBy: "ersteller.webmaster@gmail.com",
        transactions: [
            { id: 3, type: "Abbuchung: Wirtshaustraining", amount: -25, date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], bookedBy: "Sandra", meta: { requirementId: REQUIREMENT_IDS.WIRTSHAUSTRAINING } }
        ],
        documents: [
            { id: 1, name: "Impfausweis_Luna.pdf", url: "#" },
            { id: 2, name: "Statuten des Verbandssiegels der zertifizierten kynologischen Berufsgruppen.pdf", url: "#"},
        ]
    },
    {
        id: 3,
        internalId: "68b03032",
        name: "Peter Wagner",
        dogName: "Rex",
        chipNumber: "987000011122333",
        email: "peter.wagner@email.com",
        password: "password123",
        phone: "+49 555 123456",
        status: "active",
        credits: 205.50,
        levelId: 1,
        levelUpHistory: { 1: "2025-03-15T10:00:00.000Z" },
        isVip: false,
        memberSince: "2025-08-28",
        createdBy: "Administrator",
        transactions: [
             { id: 1, type: "Aufladung", amount: 200, date: "2025-05-10", bookedBy: "Christian" },
        ],
        documents: []
    },
    {
        id: 4,
        internalId: "68b03032",
        name: "Lisa Müller",
        dogName: "Mia",
        chipNumber: "987000044455666",
        email: "julia.weber@email.com",
        password: "password123",
        phone: "+49 176 11223344",
        status: "active",
        credits: 45.00,
        levelId: 1,
        levelUpHistory: { 1: "2025-04-20T10:00:00.000Z" },
        isVip: false,
        memberSince: "2025-08-28",
        createdBy: "Administrator",
        transactions: [
            { id: 1, type: "Aufladung", amount: 50, date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], bookedBy: 'Susi' },
             { id: 2, type: "Abbuchung: Social Walk", amount: -5, date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString().split('T')[0], bookedBy: 'Sophie', meta: { requirementId: REQUIREMENT_IDS.SOCIAL_WALK } },
        ],
        documents: [
             { id: 1, name: "Haftpflicht_Mia.pdf", url: "#" },
        ]
    }
];

// Generate 50 additional mock customers
const firstNames = ["Lukas", "Leon", "Felix", "Jonas", "Elias", "Maximilian", "Paul", "Ben", "Noah", "Finn", "Mia", "Emma", "Hannah", "Sophia", "Anna", "Lea", "Emilia", "Marie", "Lena", "Leonie"];
const lastNames = ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann"];
const dogNames = ["Buddy", "Charlie", "Max", "Rocky", "Toby", "Jack", "Duke", "Bear", "Leo", "Oscar", "Bella", "Lucy", "Daisy", "Molly", "Sadie", "Lola", "Zoe", "Stella", "Chloe", "Penny"];

for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const dogName = dogNames[Math.floor(Math.random() * dogNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const creationDate = new Date();
    creationDate.setDate(creationDate.getDate() - Math.floor(Math.random() * 365));
    const firstTransactionDate = new Date(creationDate);
    firstTransactionDate.setDate(firstTransactionDate.getDate() + 1);
    
    mockCustomers.push({
        id: mockCustomers.length + 1,
        internalId: Math.random().toString(36).substring(2, 10),
        name: name,
        dogName: dogName,
        chipNumber: `9870000${Math.floor(10000000 + Math.random() * 90000000)}`,
        email: email,
        password: "password123",
        phone: `+49 17${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: "active",
        credits: parseFloat((Math.random() * 200).toFixed(2)),
        levelId: Math.floor(Math.random() * 4) + 1,
        levelUpHistory: { 1: creationDate.toISOString() },
        isVip: Math.random() < 0.1,
        memberSince: creationDate.toISOString().split('T')[0],
        createdBy: ["Christian", "Sophie", "Sandra", "Susi"][Math.floor(Math.random() * 4)],
        transactions: [
             { id: Date.now() + i*2+1, type: "Aufladung", amount: 150, date: firstTransactionDate.toISOString().split('T')[0], bookedBy: "Christian" },
             { id: Date.now() + i*2+2, type: "Abbuchung: Gruppenstunde", amount: -15, date: new Date(new Date().setDate(new Date().getDate() - Math.floor(Math.random()*30))).toISOString().split('T')[0], bookedBy: "Sophie", meta: { requirementId: REQUIREMENT_IDS.GRUPPENSTUNDE } },
        ],
        documents: []
    });
}


const mockUsers = [
    { id: 1, name: "Christian", username: "Christian", email: "christian@dogslife.de", password: "password123", role: "admin", createdDate: "2025-08-12", avatarColor: '#4285F4' },
    { id: 2, name: "Sophie", username: "Sophie", email: "sophie@dogslife.de", password: "password123", role: "employee", createdDate: "2025-08-12", avatarColor: '#A142F4' },
    { id: 3, name: "Sandra", username: "Sandra", email: "sandra@dogslife.de", password: "password123", role: "employee", createdDate: "2025-08-12", avatarColor: '#A142F4' },
    { id: 4, name: "Susi", username: "Susi", email: "susi@dogslife.de", password: "password123", role: "employee", createdDate: "2025-08-12", avatarColor: '#A142F4' },
    { id: 5, name: "Petra", username: "Petra", email: "petra@dogslife.de", password: "password123", role: "employee", createdDate: "2025-08-12", avatarColor: '#F5A623' },
];

// --- STATE MANAGEMENT ---
const appState = {
    currentPage: 'login', // 'login', 'register', 'dashboard', 'customers', 'profile', 'users', 'reports', 'manage-transactions'
    currentUser: null,
    activeCustomerId: null,
    customers: mockCustomers,
    users: mockUsers,
    isProfileEditing: false,
    isDocumentModalOpen: false,
    documentToView: null,
    isDeleteConfirmModalOpen: false,
    documentToDelete: null,
    isUserEditModalOpen: false,
    userToEdit: null,
    isUserDeleteConfirmModalOpen: false,
    userToDelete: null,
    isNewCustomerModalOpen: false,
    isNewUserModalOpen: false,
    customerNameFilter: 'Alle',
    isDetailsModalOpen: false,
    detailsModalData: { title: '', type: 'customer', items: [] as any[] },
    isConfirmModalOpen: false,
    confirmModalData: null,
    isOnline: navigator.onLine,
    reportsTimeFilter: 'this_year' as string,
    reportsUserFilter: 'Alle',
};

const root = document.getElementById('root');

// --- RENDERER ---
function render() {
    if (!root) return;
    root.innerHTML = ''; 

    switch (appState.currentPage) {
        case 'login':
            root.appendChild(renderLoginPage());
            break;
        case 'register':
            root.appendChild(renderRegisterPage());
            break;
        case 'dashboard':
        case 'customers':
        case 'users':
        case 'reports':
        case 'profile':
        case 'manage-transactions':
            if (appState.currentUser) {
                 root.appendChild(renderAppLayout());
            } else {
                 root.appendChild(renderLoginPage()); // If not logged in, show login
            }
            break;
        default:
            root.innerHTML = '<h1>404 - Seite nicht gefunden</h1>';
    }
}

// --- NAVIGATION & LOGIN ---
function navigate(page, customerId = null) {
    if (page === 'login') {
        appState.currentUser = null;
    }
    appState.currentPage = page;
    if (customerId !== null) {
        appState.activeCustomerId = customerId;
    }
    // Reset editing state when navigating away from profile
    if (page !== 'profile') {
        appState.isProfileEditing = false;
    }
    render();
}

function handleLogin(email, password) {
    const adminOrEmployee = appState.users.find(u => u.email === email && u.password === password);
    if (adminOrEmployee) {
        appState.currentUser = adminOrEmployee;
        navigate('dashboard');
        return;
    }

    const customer = appState.customers.find(c => c.email === email && c.password === password);
    if (customer) {
        appState.currentUser = {
            id: customer.id,
            name: customer.name,
            role: 'customer',
            email: customer.email,
        };
        navigate('profile', customer.id);
        return;
    }
    
    // If no user found
    const errorEl = document.getElementById('login-error');
    if(errorEl) {
        errorEl.textContent = 'Ungültige E-Mail oder Passwort.';
        errorEl.classList.add('show');
    }
}

function handleRegister(formData) {
    const errorEl = document.getElementById('register-error');
    if (!errorEl) return;

    if (formData.password !== formData.passwordConfirm) {
        errorEl.textContent = 'Die Passwörter stimmen nicht überein.';
        errorEl.classList.add('show');
        return;
    }

    const emailExists = appState.users.some(u => u.email === formData.email) || appState.customers.some(c => c.email === formData.email);
    if (emailExists) {
        errorEl.textContent = 'Ein Konto mit dieser E-Mail-Adresse existiert bereits.';
        errorEl.classList.add('show');
        return;
    }

    const now = new Date().toISOString();
    const newCustomer = {
        id: Date.now(),
        internalId: Math.random().toString(36).substring(2, 10),
        name: `${formData.firstName} ${formData.lastName}`,
        dogName: formData.dogName,
        chipNumber: "",
        email: formData.email,
        password: formData.password,
        phone: "",
        status: "active",
        credits: 0,
        levelId: 1,
        levelUpHistory: { 1: now },
        isVip: false,
        memberSince: now.split('T')[0],
        createdBy: "Self-registered",
        transactions: [],
        documents: []
    };

    appState.customers.unshift(newCustomer);
    handleLogin(newCustomer.email, newCustomer.password);
}


// --- SVG ICONS ---
const ICONS = {
    dashboard: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>`,
    customers: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.305c.395-.453.748-1.303 1.013-2.222a21.46 21.46 0 0 0 .93-6.932C21.438 4.25 18.278 1.5 14.25 1.5c-4.028 0-7.188 2.75-7.188 6.75 0 2.37.632 4.492 1.66 6.311.453.81.93 1.637 1.442 2.433.28 .357.575.688.88.995a11.2 11.2 0 0 0 2.625.372Z M9.75 19.128a9.38 9.38 0 0 1-2.625.372A9.337 9.337 0 0 1 2.994 17.19c-.395-.453-.748-1.303-1.013-2.222A21.46 21.46 0 0 1 1.05 8.036C1.05 4.25 4.21 1.5 8.25 1.5c4.028 0 7.188 2.75 7.188 6.75 0 2.37-.632 4.492-1.66 6.311-.453.81-.93 1.637-1.442 2.433-.28 .357-.575.688-.88.995a11.2 11.2 0 0 1-2.625.372Z" /></svg>`,
    users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.023 1.53-1.85 2.7-2.366m-4.226 5.432a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1 4.682-2.72M12 12.75a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm-9 6c0 2.221 4.03 4.25 9 4.25s9-2.029 9-4.25c0-2.22-4.03-4.25-9-4.25s-9 2.029-9 4.25Z" /></svg>`,
    reports: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" /></svg>`,
    logout: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3.007-6.363L5.625 12l2.625 3.375" /></svg>`,
    document: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>`,
    menu: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>`,
    edit: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>`,
    delete: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>`,
    vip: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>`,
    eye: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`,
    heart: `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke-width="1.5" stroke="none"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`,
    save: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>`,
    // Stat Card Icons
    stat_users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.023 1.53-1.85 2.7-2.366m-4.226 5.432a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1 4.682-2.72M12 12.75a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm-9 6c0 2.221 4.03 4.25 9 4.25s9-2.029 9-4.25c0-2.22-4.03-4.25-9-4.25s-9 2.029-9 4.25Z" /></svg>`,
    stat_wallet: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></svg>`,
    stat_list: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg>`,
    stat_calendar_month: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Zm-3 0h.008v.008H9v-.008Zm-3 0h.008v.008H6v-.008Zm3 3h.008v.008H9v-.008Zm3 0h.008v.008H12v-.008Zm3 0h.008v.008H15v-.008Zm-3 3h.008v.008H12v-.008Zm-3 0h.008v.008H9v-.008Z" /></svg>`,
    stat_user_check: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg>`,
    stat_revenue: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25" /></svg>`,
    stat_consumption: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    transaction_plus: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5V4.5m0 0-5 5m5-5 5 5" /></svg>`,
    transaction_minus: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m0 0 5-5m-5 5-5-5" /></svg>`,
    back_arrow: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>`,
    user_profile: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>`,
    qr_code: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1-.75-.75v-1.5A.75.75 0 0 1 3 4.5h1.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75V6a.75.75 0 0 1-.75-.75V4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75H9a.75.75 0 0 1 0 1.5H7.5A.75.75 0 0 1 6.75 9V7.5a.75.75 0 0 1-.75-.75V6A.75.75 0 0 1 5.25 6H3.75a.75.75 0 0 1-.75-.75V4.5Zm0 9.75a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75V15a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75H9a.75.75 0 0 1 0 1.5H7.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1-.75-.75V12a.75.75 0 0 1 .75-.75H3.75Zm9 .75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0-.75-.75Zm1.5 1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5Zm-5.25-3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75V15a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H9.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1-.75-.75V12a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 1 0 1.5H18a.75.75 0 0 1-.75-.75V15a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75H21a.75.75 0 0 1 0-1.5h-1.5a.75.75 0 0 1-.75.75Zm-9 7.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0-.75.75v.75c0 .414.336.75.75.75h.75a.75.75 0 0 0 0-1.5h-.75a.75.75 0 0 0-.75-.75Z" /></svg>`,
    credit_card: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>`,
    transaction_icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.994 0-3.182-3.182a8.25 8.25 0 0 0-11.667 0l3.182 3.182" /></svg>`,
    level_icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>`,
    photo_icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" /></svg>`,
    // Data field icons
    icon_user: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`,
    icon_email: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>`,
    icon_phone: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>`,
    icon_chip: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h13.5m-13.5 7.5h13.5m-1.5-15-1.5 15m-1.5-15-1.5 15m-1.5-15-1.5 15m-1.5-15-1.5 15M21 4.875A2.25 2.25 0 0 0 18.75 2.625H5.25A2.25 2.25 0 0 0 3 4.875v14.25A2.25 2.25 0 0 0 5.25 21.375h13.5A2.25 2.25 0 0 0 21 19.125V4.875Z" /></svg>`,
    // Icons for customer page info cards
    info_users: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962c.57-1.023 1.53-1.85 2.7-2.366m-4.226 5.432a9.094 9.094 0 0 1-3.741-.479 3 3 0 0 1 4.682-2.72M12 12.75a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm-9 6c0 2.221 4.03 4.25 9 4.25s9-2.029 9-4.25c0-2.22-4.03-4.25-9-4.25s-9 2.029-9 4.25Z" /></svg>`,
    info_heart: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>`,
    info_card: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15A2.25 2.25 0 0 0 2.25 6.75v10.5A2.25 2.25 0 0 0 4.5 19.5Z" /></svg>`,
    info_graph: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>`,
    wifi: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.136 11.886c3.87-3.87 10.154-3.87 14.024 0M19.712 8.734a16.5 16.5 0 0 0-22.628 0M1.014 15.16a.75.75 0 0 1 1.06 0 15.001 15.001 0 0 1 19.852 0 .75.75 0 1 1-1.06 1.06 13.501 13.501 0 0 0-17.732 0 .75.75 0 0 1-1.06-1.06Z" /></svg>`,
    sync: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.994 0-3.182-3.182a8.25 8.25 0 0 0-11.667 0l3.182 3.182" /></svg>`,
    req_met: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    req_unmet: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l4-4m0 4-4-4m12 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`,
    bonus: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a2.25 2.25 0 0 1-2.25 2.25H5.25a2.25 2.25 0 0 1-2.25-2.25v-8.25M12 15v-7.5M12 7.5h3.75M12 7.5H8.25M3.75 12H20.25M3.75 12V6.75A2.25 2.25 0 0 1 6 4.5h12A2.25 2.25 0 0 1 20.25 6.75V12m-16.5 0h16.5" /></svg>`,
};

// --- DATA HELPERS ---
const DateHelpers = {
    isToday: (date) => {
        const d = new Date(date);
        const today = new Date();
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    },
    isDateInThis: (date, unit) => {
        const d = new Date(date);
        const today = new Date();
        if (unit === 'week') {
            const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1) )); // Monday as first day
            firstDayOfWeek.setHours(0,0,0,0);
            const lastDayOfWeek = new Date(firstDayOfWeek);
            lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
            lastDayOfWeek.setHours(23,59,59,999);
            return d >= firstDayOfWeek && d <= lastDayOfWeek;
        }
        if (unit === 'month') {
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }
        if (unit === 'year') {
            return d.getFullYear() === today.getFullYear();
        }
        return false;
    },
    isDateInPeriod: (dateStr, period) => {
        const d = new Date(dateStr);
        const today = new Date();
        switch (period) {
            case 'today':
                return DateHelpers.isToday(d);
            case 'this_month':
                return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
            case 'this_year':
                return d.getFullYear() === today.getFullYear();
            default:
                if (period && period.length === 4 && !isNaN(parseInt(period))) { // Year, e.g. "2025"
                    return d.getFullYear() === parseInt(period, 10);
                }
                if (period && period.length === 7 && period.includes('-')) { // Month, e.g. "2025-06"
                    const [year, month] = period.split('-').map(Number);
                    return d.getFullYear() === year && d.getMonth() === month - 1;
                }
                return false;
        }
    }
};

/** Formats a number as a currency string for DE locale */
function formatCurrency(amount) {
    return amount.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/** Gets data scoped to the current user's role and permissions */
function getScopedData() {
    const { currentUser, customers: allCustomers } = appState;
    if (!currentUser) return { customers: [], transactions: [], totalBalance: 0, activeCustomersMonth: [] };

    let scopedCustomers = [];
    if (currentUser.role === 'admin') {
        scopedCustomers = allCustomers;
    } else if (currentUser.role === 'employee') {
        scopedCustomers = allCustomers.filter(c =>
            c.transactions.some(t => t.bookedBy === currentUser.username)
        );
    } else if (currentUser.role === 'customer') {
        scopedCustomers = allCustomers.filter(c => c.id === currentUser.id);
    }

    const scopedTransactions = scopedCustomers
        .flatMap(c => c.transactions.map(t => ({ ...t, customerName: c.name })))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalBalance = scopedCustomers.reduce((sum, c) => sum + c.credits, 0);

    const activeCustomerIds = new Set();
    scopedTransactions
        .filter(t => DateHelpers.isDateInThis(t.date, 'month'))
        .forEach(t => {
            const customer = scopedCustomers.find(c => c.name === t.customerName);
            if(customer) activeCustomerIds.add(customer.id);
        });
    const activeCustomersMonth = scopedCustomers.filter(c => activeCustomerIds.has(c.id));

    return {
        customers: scopedCustomers,
        transactions: scopedTransactions,
        totalBalance: totalBalance,
        activeCustomersMonth: activeCustomersMonth
    };
}


const levelInfo = {
    1: { text: 'Level 1 - Welpen', shortName: 'Welpen', colorClass: 'badge-level-1', imageUrl: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L1.png' },
    2: { text: 'Level 2 - Grundlagen', shortName: 'Grundlagen', colorClass: 'badge-level-2', imageUrl: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L2.png' },
    3: { text: 'Level 3 - Fortgeschrittene', shortName: 'Fortgeschrittene', colorClass: 'badge-level-3', imageUrl: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L3.png' },
    4: { text: 'Level 4 - Masterclass', shortName: 'Masterclass', colorClass: 'badge-level-4', imageUrl: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L4.png' },
    5: { text: 'Level 5 - Hundeführerschein', shortName: 'Hundeführerschein', colorClass: 'badge-level-5', imageUrl: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/L5.png' },
    'experte': { text: 'Experte', shortName: 'Experte', colorClass: 'badge-experte', imageUrl: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/09/DZKB-Experte.png' },
    'vip': { text: 'VIP', shortName: 'VIP', colorClass: 'badge-vip', imageUrl: 'https://hundezentrum-bayerischer-wald.de/wp-content/uploads/2025/08/VIP.png' }
};

// --- COMPONENT RENDERERS ---

function renderLoginPage() {
    const container = document.createElement('div');
    container.className = 'login-container';
    container.innerHTML = `
        <div class="login-card">
            <div class="sidebar-header" style="justify-content: center; margin-bottom: 1rem;">
                <span class="logo">${ICONS.heart}</span>
                <h2>PfotenCard</h2>
            </div>
            <h1>Willkommen zurück!</h1>
            <p>Bitte melde Dich an, um fortzufahren.</p>
            <form id="login-form">
                <div class="form-group">
                    <label for="email">E-Mail</label>
                    <input type="email" id="email" required autocomplete="email" value="christian@dogslife.de">
                </div>
                <div class="form-group">
                    <label for="password">Passwort</label>
                    <input type="password" id="password" required autocomplete="current-password" value="password123">
                </div>
                <p class="error-message" id="login-error"></p>
                <button type="submit" class="btn btn-primary btn-block">Anmelden</button>
            </form>
            <div class="login-toggle">
                Noch kein Konto? <a href="#" id="go-to-register">Jetzt registrieren</a>
            </div>
        </div>
    `;

    container.querySelector('#login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const email = (form.querySelector('#email') as HTMLInputElement).value;
        const password = (form.querySelector('#password') as HTMLInputElement).value;
        handleLogin(email, password);
    });

    container.querySelector('#go-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('register');
    });

    return container;
}

function renderRegisterPage() {
    const container = document.createElement('div');
    container.className = 'login-container';
    container.innerHTML = `
        <div class="login-card">
            <div class="sidebar-header" style="justify-content: center; margin-bottom: 1rem;">
                <span class="logo">${ICONS.heart}</span>
                <h2>PfotenCard</h2>
            </div>
            <h1>Neues Konto erstellen</h1>
            <p>Fülle die folgenden Felder aus, um Dich zu registrieren.</p>
            <form id="register-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="firstName">Vorname</label>
                        <input type="text" id="firstName" required>
                    </div>
                    <div class="form-group">
                        <label for="lastName">Nachname</label>
                        <input type="text" id="lastName" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="dogName">Name des Hundes</label>
                    <input type="text" id="dogName" required>
                </div>
                <div class="form-group">
                    <label for="email">E-Mail</label>
                    <input type="email" id="email" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="password">Passwort</label>
                    <input type="password" id="password" required autocomplete="new-password">
                </div>
                <div class="form-group">
                    <label for="passwordConfirm">Passwort bestätigen</label>
                    <input type="password" id="passwordConfirm" required autocomplete="new-password">
                </div>
                <p class="error-message" id="register-error"></p>
                <button type="submit" class="btn btn-primary btn-block">Konto erstellen</button>
            </form>
            <div class="login-toggle">
                Bereits ein Konto? <a href="#" id="go-to-login">Hier anmelden</a>
            </div>
        </div>
    `;

    container.querySelector('#register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const formData = {
            firstName: (form.querySelector('#firstName') as HTMLInputElement).value,
            lastName: (form.querySelector('#lastName') as HTMLInputElement).value,
            dogName: (form.querySelector('#dogName') as HTMLInputElement).value,
            email: (form.querySelector('#email') as HTMLInputElement).value,
            password: (form.querySelector('#password') as HTMLInputElement).value,
            passwordConfirm: (form.querySelector('#passwordConfirm') as HTMLInputElement).value,
        };
        handleRegister(formData);
    });

    container.querySelector('#go-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        navigate('login');
    });

    return container;
}


function renderNewCustomerModal() {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';
    
    modalContainer.innerHTML = `
        <div class="modal" role="dialog" aria-labelledby="new-customer-modal-title" aria-modal="true">
            <div class="modal-header">
                <h3 id="new-customer-modal-title">Neuen Kunden anlegen</h3>
                <button class="icon-btn close-modal-btn" aria-label="Schließen">${ICONS.close}</button>
            </div>
            <form id="new-customer-form">
                <div class="modal-content">
                    <div class="form-grid">
                        <div class="form-group"><label for="firstName">Vorname</label><input type="text" id="firstName" required></div>
                        <div class="form-group"><label for="lastName">Nachname</label><input type="text" id="lastName" required></div>
                        <div class="form-group form-group-full"><label for="email">E-Mail</label><input type="email" id="email" required></div>
                        <div class="form-group"><label for="phone">Telefon</label><input type="tel" id="phone"></div>
                        <div class="form-group"><label for="dogName">Hund</label><input type="text" id="dogName"></div>
                        <div class="form-group form-group-full"><label for="chipNumber">Chipnummer</label><input type="text" id="chipNumber"></div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary close-modal-btn">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Kunden anlegen</button>
                </div>
            </form>
        </div>
    `;

    const closeModal = () => {
        appState.isNewCustomerModalOpen = false;
        render();
    };

    modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });

    modalContainer.querySelector('#new-customer-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const firstName = (form.querySelector('#firstName') as HTMLInputElement).value;
        const lastName = (form.querySelector('#lastName') as HTMLInputElement).value;
        const now = new Date().toISOString();
        
        const newCustomer = {
            id: Date.now(), // Simple unique ID
            internalId: Math.random().toString(36).substring(2, 10),
            name: `${firstName} ${lastName}`,
            dogName: (form.querySelector('#dogName') as HTMLInputElement).value,
            chipNumber: (form.querySelector('#chipNumber') as HTMLInputElement).value,
            email: (form.querySelector('#email') as HTMLInputElement).value,
            password: "password123", // Default password for manually created users
            phone: (form.querySelector('#phone') as HTMLInputElement).value,
            status: "active",
            credits: 0,
            levelId: 1,
            levelUpHistory: { 1: now },
            isVip: false,
            memberSince: now.split('T')[0],
            createdBy: appState.currentUser.name,
            transactions: [],
            documents: []
        };
        appState.customers.unshift(newCustomer);
        closeModal();
    });

    return modalContainer;
}

function renderNewUserModal() {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';

    modalContainer.innerHTML = `
        <div class="modal" role="dialog" aria-labelledby="new-user-modal-title" aria-modal="true">
            <div class="modal-header">
                <h3 id="new-user-modal-title">Neuen Benutzer anlegen</h3>
                <button class="icon-btn close-modal-btn" aria-label="Schließen">${ICONS.close}</button>
            </div>
            <form id="new-user-form">
                <div class="modal-content">
                    <div class="form-group form-group-full"><label for="userName">Name</label><input type="text" id="userName" required></div>
                    <div class="form-group form-group-full"><label for="userUsername">Benutzername</label><input type="text" id="userUsername" required></div>
                    <div class="form-group form-group-full"><label for="userEmail">E-Mail</label><input type="email" id="userEmail" required></div>
                    <div class="form-group form-group-full"><label for="userRole">Rolle</label>
                        <select id="userRole" required>
                            <option value="employee">Mitarbeiter</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary close-modal-btn">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Benutzer anlegen</button>
                </div>
            </form>
        </div>
    `;

    const closeModal = () => {
        appState.isNewUserModalOpen = false;
        render();
    };

    modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });

    modalContainer.querySelector('#new-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const name = (form.querySelector('#userName') as HTMLInputElement).value;
        const newUser = {
            id: Date.now(),
            name: name,
            username: (form.querySelector('#userUsername') as HTMLInputElement).value,
            email: (form.querySelector('#userEmail') as HTMLInputElement).value,
            password: "password123", // Default password
            role: (form.querySelector('#userRole') as HTMLSelectElement).value,
            createdDate: new Date().toISOString().split('T')[0],
            avatarColor: ['#4285F4', '#A142F4', '#F5A623', '#34A853'][Math.floor(Math.random() * 4)]
        };
        appState.users.unshift(newUser);
        closeModal();
    });

    return modalContainer;
}


function renderDocumentViewModal(doc) {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';

    modalContainer.innerHTML = `
        <div class="modal" role="dialog" aria-labelledby="doc-modal-title" aria-modal="true" style="max-width: 800px;">
            <div class="modal-header">
                <h3 id="doc-modal-title" class="document-modal-title">
                    ${ICONS.document}
                    <span title="${doc.name}">${doc.name}</span>
                </h3>
                <button class="icon-btn close-modal-btn" aria-label="Schließen">${ICONS.close}</button>
            </div>
            <div class="modal-content document-modal-content">
                <div class="document-preview-placeholder">
                    <p>Vorschau für "${doc.name}"</p>
                    <p class="text-secondary">In einer echten Anwendung würde hier der Dokumenteninhalt (z.B. eine PDF-Vorschau) angezeigt.</p>
                    <a href="${doc.url}" target="_blank" class="btn btn-secondary">In neuem Tab öffnen</a>
                </div>
            </div>
        </div>
    `;

    const closeModal = () => {
        appState.isDocumentModalOpen = false;
        appState.documentToView = null;
        render();
    };

    modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });

    return modalContainer;
}

function renderDeleteConfirmModal(doc) {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';
    modalContainer.innerHTML = `
        <div class="modal modal-confirm" role="dialog" aria-labelledby="delete-modal-title" aria-modal="true">
            <div class="modal-header">
                <h3 id="delete-modal-title">Dokument wirklich löschen?</h3>
                <button class="icon-btn close-modal-btn" aria-label="Schließen">${ICONS.close}</button>
            </div>
            <div class="modal-content">
                <p>Möchtest Du das Dokument "${doc.name}" wirklich endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary close-modal-btn">Abbrechen</button>
                <button type="button" class="btn btn-danger" id="confirm-delete-btn">Löschen</button>
            </div>
        </div>
    `;

    const closeModal = () => {
        appState.isDeleteConfirmModalOpen = false;
        appState.documentToDelete = null;
        render();
    };

    modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });

    modalContainer.querySelector('#confirm-delete-btn')?.addEventListener('click', () => {
        const customer = appState.customers.find(c => c.id === appState.activeCustomerId);
        if (customer && appState.documentToDelete) {
            customer.documents = customer.documents.filter(doc => doc.id !== appState.documentToDelete.id);
        }
        closeModal(); // This will re-render
    });

    return modalContainer;
}

function renderUserEditModal(user) {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';

    modalContainer.innerHTML = `
        <div class="modal" role="dialog" aria-labelledby="edit-user-modal-title" aria-modal="true">
            <div class="modal-header">
                <h3 id="edit-user-modal-title">Benutzer bearbeiten</h3>
                <button class="icon-btn close-modal-btn" aria-label="Schließen">${ICONS.close}</button>
            </div>
            <form id="edit-user-form">
                <div class="modal-content">
                    <div class="form-group form-group-full">
                        <label for="userName">Name</label>
                        <input type="text" id="userName" value="${user.name}" required>
                    </div>
                    <div class="form-group form-group-full">
                        <label for="userUsername">Benutzername</label>
                        <input type="text" id="userUsername" value="${user.username}" required>
                    </div>
                    <div class="form-group form-group-full">
                        <label for="userEmail">E-Mail</label>
                        <input type="email" id="userEmail" value="${user.email}" required>
                    </div>
                    <div class="form-group form-group-full">
                        <label for="userRole">Rolle</label>
                        <select id="userRole" required>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Mitarbeiter</option>
                        </select>
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary close-modal-btn">Abbrechen</button>
                    <button type="submit" class="btn btn-primary">Speichern</button>
                </div>
            </form>
        </div>
    `;

    const closeModal = () => {
        appState.isUserEditModalOpen = false;
        appState.userToEdit = null;
        render();
    };

    modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });

    modalContainer.querySelector('#edit-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const updatedUserIndex = appState.users.findIndex(u => u.id === user.id);
        if (updatedUserIndex > -1) {
            appState.users[updatedUserIndex] = {
                ...appState.users[updatedUserIndex],
                name: (form.querySelector('#userName') as HTMLInputElement).value,
                username: (form.querySelector('#userUsername') as HTMLInputElement).value,
                email: (form.querySelector('#userEmail') as HTMLInputElement).value,
                role: (form.querySelector('#userRole') as HTMLSelectElement).value,
            };
        }
        closeModal();
    });

    return modalContainer;
}

function renderUserDeleteConfirmModal(user) {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';
    modalContainer.innerHTML = `
        <div class="modal modal-confirm" role="dialog" aria-labelledby="delete-user-modal-title" aria-modal="true">
            <div class="modal-header">
                <h3 id="delete-user-modal-title">Benutzer wirklich löschen?</h3>
                <button class="icon-btn close-modal-btn" aria-label="Schließen">${ICONS.close}</button>
            </div>
            <div class="modal-content">
                <p>Möchtest Du den Benutzer "<strong>${user.name}</strong>" wirklich endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary close-modal-btn">Abbrechen</button>
                <button type="button" class="btn btn-danger" id="confirm-user-delete-btn">Löschen</button>
            </div>
        </div>
    `;

    const closeModal = () => {
        appState.isUserDeleteConfirmModalOpen = false;
        appState.userToDelete = null;
        render();
    };

    modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });

    modalContainer.querySelector('#confirm-user-delete-btn')?.addEventListener('click', () => {
        if (appState.userToDelete) {
            appState.users = appState.users.filter(u => u.id !== appState.userToDelete.id);
        }
        closeModal();
    });

    return modalContainer;
}

function renderDetailsModal() {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';
    const { title, type, items } = appState.detailsModalData;

    let contentHtml = '<p class="text-secondary" style="text-align: center;">Keine Daten verfügbar.</p>';

    if (items && items.length > 0) {
        contentHtml = `<ul class="details-list">`;
        switch (type) {
            case 'customer':
                contentHtml += items.map(c => {
                    const customer = c as typeof mockCustomers[0];
                    const initials = customer.name.split(' ').map(n => n[0]).join('');
                    return `<li class="details-list-item">
                        <div class="customer-info">
                            <div class="customer-avatar">${initials}</div>
                            <div>
                                <div class="customer-name">${customer.name}</div>
                                <div class="customer-id-small">${customer.email}</div>
                            </div>
                        </div>
                    </li>`;
                }).join('');
                break;
            case 'customer-balance':
                 contentHtml += items.map(c => {
                    const customer = c as typeof mockCustomers[0];
                    const initials = customer.name.split(' ').map(n => n[0]).join('');
                    return `<li class="details-list-item details-list-item-balance">
                        <div class="customer-info">
                            <div class="customer-avatar">${initials}</div>
                            <div>
                                <div class="customer-name">${customer.name}</div>
                                <div class="customer-id-small">${customer.dogName}</div>
                            </div>
                        </div>
                        <span class="badge badge-balance">${formatCurrency(customer.credits)} €</span>
                    </li>`;
                }).join('');
                break;
            case 'transaction':
                contentHtml += items.map(t => {
                    const transaction = t as any;
                    const isPositive = transaction.amount > 0;
                    const icon = isPositive ? ICONS.transaction_plus : ICONS.transaction_minus;
                    const amountClass = isPositive ? 'text-green' : 'text-red';
                    const bookedByInfo = transaction.bookedBy ? ` &middot; Gebucht von ${transaction.bookedBy}` : '';
                    return `
                    <li class="details-list-item details-list-item-transaction">
                        <span class="transaction-icon ${isPositive ? 'positive' : 'negative'}">${icon}</span>
                        <div class="transaction-details">
                            <strong>${transaction.type}</strong>
                            <small>${transaction.customerName} &middot; ${new Date(transaction.date).toLocaleDateString('de-DE')}${bookedByInfo}</small>
                        </div>
                        <span class="${amountClass} transaction-amount">${isPositive ? '+' : ''}${formatCurrency(transaction.amount)} €</span>
                    </li>`;
                }).join('');
                break;
        }
        contentHtml += `</ul>`;
    }

    modalContainer.innerHTML = `
        <div class="modal" role="dialog" aria-labelledby="details-modal-title" aria-modal="true">
            <div class="modal-header">
                <h3 id="details-modal-title">${title} (${items.length})</h3>
                <button class="icon-btn close-modal-btn" aria-label="Schließen">${ICONS.close}</button>
            </div>
            <div class="modal-content modal-content-list">
                ${contentHtml}
            </div>
        </div>
    `;

    const closeModal = () => {
        appState.isDetailsModalOpen = false;
        render();
    };

    modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });

    return modalContainer;
}

function handleStatCardClick(modalType) {
    if (!modalType) return;
    const { customers, transactions, activeCustomersMonth } = getScopedData();
    let title = '';
    let type: 'customer' | 'customer-balance' | 'transaction' = 'customer';
    let items: any[] = [];

    switch(modalType) {
        // Dashboard & Customer Page
        case 'total-customers':
            title = 'Alle Kunden';
            type = 'customer';
            items = customers;
            break;
        case 'total-balance':
            title = 'Guthaben nach Kunde';
            type = 'customer-balance';
            items = customers;
            break;
        case 'transactions-week':
            title = 'Transaktionen (Woche)';
            type = 'transaction';
            items = transactions.filter(t => DateHelpers.isDateInThis(t.date, 'week'));
            break;
        case 'transactions-month':
            title = 'Transaktionen (Monat)';
            type = 'transaction';
            items = transactions.filter(t => DateHelpers.isDateInThis(t.date, 'month'));
            break;
        case 'active-customers-month':
            title = 'Aktive Kunden (Monat)';
            type = 'customer';
            items = activeCustomersMonth;
            break;
        // Reports Page
        case 'deposits-today':
            title = 'Aufladungen (Heute)';
            type = 'transaction';
            items = transactions.filter(t => t.amount > 0 && DateHelpers.isToday(t.date));
            break;
        // Users Page
        case 'new-customers-month':
            title = 'Neue Kunden (Dieser Monat)';
            type = 'customer';
            items = appState.customers.filter(c => DateHelpers.isDateInThis(c.memberSince, 'month'));
            break;
    }

    appState.isDetailsModalOpen = true;
    appState.detailsModalData = { title, type, items };
    render();
}

/** Renders the standard header for main pages */
function renderPageHeader(title, subtitle, description, buttons = []) {
    const headerEl = document.createElement('div');
    headerEl.className = 'page-header';
    headerEl.innerHTML = `
        <h1>${title}</h1>
        <div class="page-subheader">
            <div class="page-subheader-text">
                <h2>${subtitle}</h2>
                <p class="text-secondary">${description}</p>
            </div>
            ${buttons.length > 0 ? `
            <div class="header-actions">
                ${buttons.map(btn => `<button class="btn ${btn.className}" id="${btn.id}">${btn.icon || ''} ${btn.text}</button>`).join('')}
            </div>
            ` : ''}
        </div>
    `;
    buttons.forEach(btn => {
        headerEl.querySelector(`#${btn.id}`)?.addEventListener('click', btn.onClick);
    });
    return headerEl;
}

function renderAppLayout() {
    const layout = document.createElement('div');
    layout.className = 'app-layout';
    const { currentUser } = appState;

    if (currentUser.role === 'customer') {
        // --- CUSTOMER VIEW ---
        const customerSidebar = document.createElement('aside');
        customerSidebar.className = 'sidebar';
        const statusClass = appState.isOnline ? 'online' : 'offline';
        const statusText = appState.isOnline ? 'Online' : 'Offline';
        const initials = currentUser.name.split(' ').map(n => n[0]).join('');

        customerSidebar.innerHTML = `
             <div class="sidebar-header">
                <span class="logo">${ICONS.heart}</span>
                <h2>PfotenCard</h2>
            </div>
            <div class="sidebar-status">
                <span class="status-indicator ${statusClass}">
                    ${ICONS.wifi} ${statusText}
                </span>
                <span class="sync-indicator">
                    ${ICONS.sync} Sync: Gerade eben
                </span>
            </div>
            <nav class="sidebar-nav customer-nav">
                <a href="#" class="btn btn-green btn-block nav-button-customer" data-page="profile">
                    ${ICONS.user_profile}
                    <span>Meine Karte</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                 <div class="user-profile-widget">
                    <div class="user-avatar">${initials}</div>
                    <div class="user-info">
                        <span class="user-name">${currentUser.name}</span>
                        <span class="user-role">Kunde</span>
                    </div>
                </div>
                <a href="#" data-page="login" class="logout-button">
                    ${ICONS.logout}
                    <span>Abmelden</span>
                </a>
            </div>
        `;
        customerSidebar.querySelectorAll('a[data-page]').forEach(link => {
             link.addEventListener('click', (e) => {
                 e.preventDefault();
                 const page = link.getAttribute('data-page');
                 if (page) navigate(page);
             });
        });

        const mainArea = document.createElement('div');
        mainArea.className = 'main-area';

        const header = document.createElement('header');
        header.className = 'main-header';
        header.innerHTML = `
            <button id="menu-toggle" class="menu-toggle" aria-label="Menü öffnen">${ICONS.menu}</button>
            <div class="main-header-left">
                 <div class="header-title-group">
                    <h1>Meine Karte</h1>
                    <p>Übersicht Deiner Daten und Guthaben</p>
                 </div>
            </div>
        `;

        const pageContent = document.createElement('main');
        pageContent.className = 'page-content';
        pageContent.appendChild(renderCustomerProfilePage(currentUser.id));

        const overlay = document.createElement('div');
        overlay.className = 'page-overlay';

        mainArea.appendChild(header);
        mainArea.appendChild(pageContent);
        if (appState.isConfirmModalOpen) mainArea.appendChild(renderConfirmationModal());
        mainArea.appendChild(overlay);

        layout.appendChild(customerSidebar);
        layout.appendChild(mainArea);
        
        const menuToggle = layout.querySelector('#menu-toggle');
        menuToggle?.addEventListener('click', () => {
            customerSidebar.classList.add('is-open');
            overlay.classList.add('is-open');
        });
        overlay.addEventListener('click', () => {
             customerSidebar.classList.remove('is-open');
             overlay.classList.remove('is-open');
        });

    } else {
        // --- ADMIN & EMPLOYEE VIEW ---
        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        const navItems = [
            { page: 'dashboard', icon: ICONS.dashboard, label: 'Übersicht' },
            { page: 'customers', icon: ICONS.customers, label: 'Kunden' },
            { page: 'reports', icon: ICONS.reports, label: 'Berichte' },
        ];
        if (currentUser.role === 'admin') {
             navItems.push({ page: 'users', icon: ICONS.users, label: 'Benutzer' });
        }

        const statusClass = appState.isOnline ? 'online' : 'offline';
        const statusText = appState.isOnline ? 'Online' : 'Offline';

        sidebar.innerHTML = `
            <div class="sidebar-header">
                <span class="logo">${ICONS.heart}</span>
                <h2>PfotenCard</h2>
            </div>
            <div class="sidebar-status">
                <span class="status-indicator ${statusClass}">
                    ${ICONS.wifi} ${statusText}
                </span>
                <span class="sync-indicator">
                    ${ICONS.sync} Sync: Gerade eben
                </span>
            </div>
            <nav class="sidebar-nav">
                <ul class="nav-list">
                    ${navItems.map(item => `
                        <li class="nav-item">
                            <a href="#" data-page="${item.page}" class="${appState.currentPage === item.page ? 'active' : ''}">
                                ${item.icon}
                                <span>${item.label}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>
            <div class="sidebar-footer">
                 <div class="user-profile-widget">
                    <div class="user-avatar">${currentUser.name.charAt(0)}</div>
                    <div class="user-info">
                        <span class="user-name">${currentUser.name}</span>
                        <span class="user-role">${currentUser.role}</span>
                    </div>
                </div>
                <a href="#" data-page="login" class="logout-button">
                    ${ICONS.logout}
                    <span>Abmelden</span>
                </a>
            </div>
        `;
        
        sidebar.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if(page) navigate(page);
            });
        });

        const mainArea = document.createElement('div');
        mainArea.className = 'main-area';

        const header = document.createElement('header');
        header.className = 'main-header';
        let headerContent = `<button id="menu-toggle" class="menu-toggle" aria-label="Menü öffnen">${ICONS.menu}</button>`;
        
        const pageContent = document.createElement('main');
        pageContent.className = 'page-content';
        
        switch (appState.currentPage) {
            case 'dashboard':
                pageContent.appendChild(renderDashboardPage());
                break;
            case 'customers':
                pageContent.appendChild(renderCustomersPage());
                break;
            case 'profile':
                const customer = appState.customers.find(c => c.id === appState.activeCustomerId);
                if (customer) {
                    const memberSince = new Date(customer.memberSince).toLocaleDateString('de-DE');
                    const vipButtonText = customer.isVip ? 'VIP-Status entfernen' : 'Zum VIP ernennen';
                    const vipButtonClass = customer.isVip ? 'btn-secondary' : 'btn-vip';
                    
                    let actionButtons = '';
                    if (appState.isProfileEditing) {
                        actionButtons = `
                            <button class="btn btn-secondary" id="cancel-edit-btn">${ICONS.close} Abbrechen</button>
                            <button class="btn btn-green" id="save-customer-btn">${ICONS.save} Speichern</button>
                        `;
                    } else {
                        const vipButtonHtml = appState.currentUser?.role === 'admin' ? 
                            `<button class="btn ${vipButtonClass}" id="vip-toggle-btn">${ICONS.vip} ${vipButtonText}</button>` : '';

                        actionButtons = `
                            <button class="btn btn-green" id="manage-transactions-btn">${ICONS.transaction_icon} Transaktionen verwalten</button>
                            ${vipButtonHtml}
                            <button class="btn btn-secondary" id="edit-customer-btn">${ICONS.edit} Bearbeiten</button>
                        `;
                    }

                    headerContent += `
                        <div class="main-header-left">
                             <button class="icon-btn-bare" id="back-to-customers-btn">${ICONS.back_arrow}</button>
                             <div class="header-title-group">
                                <h1>${customer.name}</h1>
                                <p>Kunde seit ${memberSince}</p>
                             </div>
                        </div>
                         <div class="header-actions">
                            ${actionButtons}
                        </div>
                    `;
                    pageContent.appendChild(renderCustomerProfilePage(appState.activeCustomerId));
                } else {
                     headerContent += '<h1>Kundendetails</h1>';
                     pageContent.innerHTML = '<p>Kunde nicht gefunden.</p>';
                }
                break;
            case 'manage-transactions':
                const transCustomer = appState.customers.find(c => c.id === appState.activeCustomerId);
                 if (transCustomer) {
                    headerContent += `
                        <div class="main-header-left">
                             <button class="icon-btn-bare" id="back-to-profile-btn">${ICONS.back_arrow}</button>
                             <div class="header-title-group">
                                <h1>Transaktionen verwalten</h1>
                                <p>für ${transCustomer.name}</p>
                             </div>
                        </div>
                    `;
                    pageContent.appendChild(renderManageTransactionsPage(appState.activeCustomerId));
                } else {
                     headerContent += '<h1>Transaktionen</h1>';
                     pageContent.innerHTML = '<p>Kunde nicht gefunden.</p>';
                }
                break;
            case 'users':
                pageContent.appendChild(renderUsersPage());
                break;
            case 'reports':
                pageContent.appendChild(renderReportsPage());
                 break;
        }

        header.innerHTML = headerContent;
        
        if (appState.currentPage === 'profile') {
            header.querySelector('#back-to-customers-btn')?.addEventListener('click', () => navigate('customers'));
            header.querySelector('#edit-customer-btn')?.addEventListener('click', () => { appState.isProfileEditing = true; render(); });
            header.querySelector('#manage-transactions-btn')?.addEventListener('click', () => navigate('manage-transactions', appState.activeCustomerId));
            
            header.querySelector('#vip-toggle-btn')?.addEventListener('click', () => {
                const customerIndex = appState.customers.findIndex(c => c.id === appState.activeCustomerId);
                if (customerIndex > -1) {
                    appState.customers[customerIndex].isVip = !appState.customers[customerIndex].isVip;
                    render();
                }
            });

            header.querySelector('#cancel-edit-btn')?.addEventListener('click', () => { appState.isProfileEditing = false; render(); });
            header.querySelector('#save-customer-btn')?.addEventListener('click', () => {
                const customerIndex = appState.customers.findIndex(c => c.id === appState.activeCustomerId);
                if (customerIndex > -1) {
                    const updatedFirstName = (pageContent.querySelector('#edit-firstName') as HTMLInputElement).value;
                    const updatedLastName = (pageContent.querySelector('#edit-lastName') as HTMLInputElement).value;
                    
                    appState.customers[customerIndex] = {
                        ...appState.customers[customerIndex],
                        name: `${updatedFirstName} ${updatedLastName}`,
                        email: (pageContent.querySelector('#edit-email') as HTMLInputElement).value,
                        phone: (pageContent.querySelector('#edit-phone') as HTMLInputElement).value,
                        dogName: (pageContent.querySelector('#edit-dogName') as HTMLInputElement).value,
                        chipNumber: (pageContent.querySelector('#edit-chipNumber') as HTMLInputElement).value,
                    };
                }
                appState.isProfileEditing = false;
                render();
            });
        }
        
        if (appState.currentPage === 'manage-transactions') {
            header.querySelector('#back-to-profile-btn')?.addEventListener('click', () => navigate('profile', appState.activeCustomerId));
        }


        const overlay = document.createElement('div');
        overlay.className = 'page-overlay';

        mainArea.appendChild(header);
        mainArea.appendChild(pageContent);

        if (appState.isNewCustomerModalOpen) mainArea.appendChild(renderNewCustomerModal());
        if (appState.isNewUserModalOpen) mainArea.appendChild(renderNewUserModal());
        if (appState.isDocumentModalOpen && appState.documentToView) mainArea.appendChild(renderDocumentViewModal(appState.documentToView));
        if (appState.isDeleteConfirmModalOpen && appState.documentToDelete) mainArea.appendChild(renderDeleteConfirmModal(appState.documentToDelete));
        if (appState.isUserEditModalOpen && appState.userToEdit) mainArea.appendChild(renderUserEditModal(appState.userToEdit));
        if (appState.isUserDeleteConfirmModalOpen && appState.userToDelete) mainArea.appendChild(renderUserDeleteConfirmModal(appState.userToDelete));
        if (appState.isDetailsModalOpen) mainArea.appendChild(renderDetailsModal());
        if (appState.isConfirmModalOpen) mainArea.appendChild(renderConfirmationModal());

        mainArea.appendChild(overlay);

        layout.appendChild(sidebar);
        layout.appendChild(mainArea);
        
        const menuToggle = layout.querySelector('#menu-toggle');
        menuToggle?.addEventListener('click', () => {
            sidebar.classList.add('is-open');
            overlay.classList.add('is-open');
        });
        overlay.addEventListener('click', () => {
             sidebar.classList.remove('is-open');
             overlay.classList.remove('is-open');
        });
    }

    return layout;
}

function renderSummaryCard(title, value, color, icon, modalType) {
    const isClickable = modalType ? `data-modal-type="${modalType}"` : '';
    const clickableClass = modalType ? '' : 'non-clickable';
    return `
        <div class="summary-card summary-card-${color} ${clickableClass}" ${isClickable}>
            <div class="summary-card-icon">${icon}</div>
            <div class="summary-card-content">
                <div class="summary-card-title">${title}</div>
                <div class="summary-card-value">${value}</div>
            </div>
        </div>
    `;
}

function renderDashboardPage() {
    const container = document.createElement('div');
    container.className = 'page-container';

    const pageHeader = renderPageHeader(
        'Übersicht',
        `Hallo, ${appState.currentUser.name}!`,
        'Hier findest Du eine schnelle Zusammenfassung der wichtigsten Kennzahlen.'
    );

    const content = document.createElement('div');
    const { customers, transactions, totalBalance, activeCustomersMonth } = getScopedData();
    const transactionsMonth = transactions.filter(t => DateHelpers.isDateInThis(t.date, 'month'));
    const transactionsWeek = transactions.filter(t => DateHelpers.isDateInThis(t.date, 'week'));
    
    content.innerHTML = `
        <div class="summary-card-grid">
            ${renderSummaryCard('Kunden Gesamt', customers.length.toString(), 'green', ICONS.stat_users, 'total-customers')}
            ${renderSummaryCard('Guthaben Gesamt', `${formatCurrency(totalBalance)} €`, 'orange', ICONS.stat_wallet, 'total-balance')}
            ${renderSummaryCard('Transaktionen (Woche)', transactionsWeek.length.toString(), 'blue', ICONS.stat_list, 'transactions-week')}
            ${renderSummaryCard('Transaktionen (Monat)', transactionsMonth.length.toString(), 'purple', ICONS.stat_calendar_month, 'transactions-month')}
        </div>
        <div class="content-grid-half">
            <div class="card">
                <div class="card-header"><h3>Aktuelle Kunden (Dieser Monat)</h3></div>
                <div class="card-content" style="padding: 0;">
                    <ul class="compact-list">
                        ${activeCustomersMonth
                            .map(c => {
                                const initials = c.name.split(' ').map(n => n[0]).join('');
                                return `<li class="compact-list-item customer-list-item">
                                    <div class="customer-info">
                                        <div class="customer-avatar">${initials}</div>
                                        <div>
                                            <div class="customer-name">${c.name}</div>
                                            <div class="customer-id-small">${c.dogName}</div>
                                        </div>
                                    </div>
                                </li>`
                            }).join('') || '<li class="no-documents">Keine aktiven Kunden diesen Monat.</li>'}
                    </ul>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Letzte Transaktionen</h3></div>
                <div class="card-content" style="padding: 0;">
                    <ul class="compact-list">
                        ${transactions.slice(0, 5).map(t => {
                            const isPositive = t.amount > 0;
                            const icon = isPositive ? ICONS.transaction_plus : ICONS.transaction_minus;
                            const amountClass = isPositive ? 'text-green' : 'text-red';
                            return `
                            <li class="compact-list-item">
                                <span class="transaction-icon ${isPositive ? 'positive' : 'negative'}">${icon}</span>
                                <span>
                                    <strong>${t.customerName}</strong>
                                    <small>${new Date(t.date).toLocaleDateString('de-DE')} - ${t.type}</small>
                                </span>
                                <span class="${amountClass} transaction-amount">${isPositive ? '+' : ''}${formatCurrency(t.amount)} €</span>
                            </li>`
                        }).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    content.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('[data-modal-type]');
        if (card) {
            handleStatCardClick(card.getAttribute('data-modal-type'));
        }
    });
    
    container.appendChild(pageHeader);
    container.appendChild(content);
    return container;
}

function renderCustomersPage() {
    const container = document.createElement('div');
    container.className = 'page-container';

    const pageHeader = renderPageHeader(
        'Kunden',
        'Kundenverwaltung',
        'Verwalte alle Deine Kunden an einem Ort.',
        [{
            id: 'new-customer-btn',
            text: '+ Neuer Kunde',
            className: 'btn-green',
            onClick: () => {
                appState.isNewCustomerModalOpen = true;
                render();
            }
        }]
    );
    container.appendChild(pageHeader);

    const content = document.createElement('div');
    const { customers, totalBalance, activeCustomersMonth, transactions } = getScopedData();
    const transactionsMonth = transactions.filter(t => DateHelpers.isDateInThis(t.date, 'month'));
    
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    const filteredCustomers = customers.filter(customer => {
        if (appState.customerNameFilter === 'Alle') return true;
        const lastName = customer.name.split(' ').pop() || '';
        return lastName.toUpperCase().startsWith(appState.customerNameFilter);
    });
    
    content.innerHTML = `
        <div class="summary-card-grid">
            ${renderSummaryCard('Kunden Gesamt', customers.length.toString(), 'green', ICONS.info_users, 'total-customers')}
            ${renderSummaryCard('Aktiv', activeCustomersMonth.length.toString(), 'orange', ICONS.info_heart, 'active-customers-month')}
            ${renderSummaryCard('Guthaben', `${formatCurrency(totalBalance)} €`, 'blue', ICONS.info_card, 'total-balance')}
            ${renderSummaryCard('Transaktionen Monat', transactionsMonth.length.toString(), 'purple', ICONS.info_graph, 'transactions-month')}
        </div>

        <div class="alphabet-filter card">
            <button class="filter-letter ${appState.customerNameFilter === 'Alle' ? 'active' : ''}" data-letter="Alle">Alle</button>
            ${alphabet.map(letter => `
                <button class="filter-letter ${appState.customerNameFilter === letter ? 'active' : ''}" data-letter="${letter}">${letter}</button>
            `).join('')}
        </div>

        <div class="table-container card">
            <div class="card-header">
                <div>
                    <h3>Kundenliste (${filteredCustomers.length})</h3>
                </div>
            </div>
            <table>
                <thead>
                    <tr><th>Kunde</th><th>Haustier</th><th>Guthaben</th><th>Level</th><th>Erstellt</th><th>Aktionen</th></tr>
                </thead>
                <tbody>
                ${filteredCustomers.length > 0 ? filteredCustomers.map(customer => {
                    const initials = customer.name.split(' ').map(n => n[0]).join('');
                    const levelKey = customer.levelId > 5 ? 'experte' : customer.levelId;
                    const level = levelInfo[levelKey] || { text: `Level ${customer.levelId}`, colorClass: '' };
                    const createdDate = new Date(customer.memberSince).toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric', year: 'numeric' });
                    
                    return `
                    <tr data-customer-id="${customer.id}">
                        <td data-label="Kunde">
                            <div class="customer-info">
                                <div class="customer-avatar">${initials}</div>
                                <div>
                                    <div class="customer-name">${customer.name}</div>
                                    <div class="customer-id-small">ID: ${customer.internalId}</div>
                                </div>
                            </div>
                        </td>
                        <td data-label="Haustier">
                            <div class="pet-info">
                                ${ICONS.heart}
                                <span>${customer.dogName}</span>
                            </div>
                        </td>
                        <td data-label="Guthaben"><span class="badge badge-balance">${formatCurrency(customer.credits)} €</span></td>
                        <td data-label="Level"><span class="badge ${level.colorClass}">${level.text}</span></td>
                        <td data-label="Erstellt">${createdDate}</td>
                        <td data-label="Aktionen">
                            <button class="icon-btn" aria-label="Details ansehen">${ICONS.eye}</button>
                        </td>
                    </tr>
                `}).join('') : `<tr><td colspan="6" class="no-documents">Keine Kunden für den Filter "${appState.customerNameFilter}" gefunden.</td></tr>`}
                </tbody>
            </table>
        </div>
    `;
    
    content.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('click', () => {
            const customerId = parseInt(row.getAttribute('data-customer-id') || '0');
            if (customerId) {
                navigate('profile', customerId);
            }
        });
    });

    content.querySelectorAll('.filter-letter').forEach(button => {
        button.addEventListener('click', (e) => {
            appState.customerNameFilter = (e.currentTarget as HTMLElement).dataset.letter || 'Alle';
            render();
        });
    });

     content.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('[data-modal-type]');
        if (card) {
            handleStatCardClick(card.getAttribute('data-modal-type'));
        }
    });

    container.appendChild(content);
    return container;
}

function renderLevelProgressComponent() {
    const customer = appState.customers.find(c => c.id === appState.activeCustomerId);
    if (!customer) return document.createElement('div');

    const container = document.createElement('div');
    container.className = 'card level-progress-card';

    const customerTransactions = customer.transactions || [];
    const canUnlockNextLevel = areLevelRequirementsMet(customer, customerTransactions);
    const progress = getProgressForLevel(customer, customerTransactions);
    const allTimeProgress = getProgressForLevel(customer, customerTransactions, true); // for special events

    let levelBlocksHtml = Object.values(LEVEL_CONFIG).map(l => {
        let requirementsHtml = '';
        const levelReqs = LEVEL_REQUIREMENTS[l.level];
        const isPastLevel = l.level < customer.levelId;
        const isCurrentLevel = l.level === customer.levelId;

        if (levelReqs) {
            requirementsHtml = `
                <ul class="level-requirements">
                    ${Object.entries(levelReqs).map(([key, value]) => {
                        let currentProgress = 0;
                        if (isPastLevel) {
                            currentProgress = value as number; // Show as complete
                        } else if (isCurrentLevel) {
                            currentProgress = progress[key] || 0;
                        }
                        
                        const isMet = currentProgress >= (value as number);
                        const icon = isMet ? ICONS.req_met : ICONS.req_unmet;
                        const iconClass = isMet ? 'met' : 'unmet';
                        return `
                        <li class="requirement-item">
                            <span class="requirement-icon ${iconClass}">${icon}</span>
                            <span class="requirement-name">${REQUIREMENT_NAMES[key]}</span>
                            <span class="requirement-progress">${isPastLevel ? value : Math.min(currentProgress, value as number)}/${value}</span>
                        </li>
                        `;
                    }).join('')}
                </ul>`;
        }
        
        const showUnlockButton = isCurrentLevel && canUnlockNextLevel && l.level < 5 && appState.currentUser?.role !== 'customer';
        const showExpertButton = isCurrentLevel && canUnlockNextLevel && l.level === 5 && appState.currentUser?.role !== 'customer';

        return `
            <div class="level-block level-block-${l.color} ${isCurrentLevel ? 'level-block-current' : ''} ${isPastLevel ? 'level-block-completed' : ''}">
                <div class="level-header">
                    <div class="level-number-title">
                        <span class="level-number">${l.level}</span>
                        <h4 class="level-title">${l.title}</h4>
                    </div>
                    <div class="level-actions">
                        ${showUnlockButton ? `<button class="level-unlock-btn" data-level="${l.level + 1}">Ins nächste Level freischalten</button>` : ''}
                        ${showExpertButton ? `<button class="btn btn-primary level-expert-btn" data-level="6">Zum Experten ernennen</button>` : ''}
                        ${isCurrentLevel ? `<span class="level-status-badge status-current">Aktuell</span>` : ''}
                        ${isPastLevel ? `<span class="level-status-badge status-completed">Erledigt</span>` : ''}
                        ${l.level > customer.levelId ? `<span class="level-status-badge status-locked">Gesperrt</span>` : ''}
                    </div>
                </div>
                <div class="level-body">
                    ${(l as any).note ? `<p class="level-note">${(l as any).note}</p>` : ''}
                    ${requirementsHtml}
                </div>
            </div>
        `;
    }).join('');

    const extraEventsHtml = `
        <div class="extra-events-section">
            <h4 class="extra-events-title">Zusatz-Veranstaltungen (für Hundeführerschein)</h4>
            <ul class="level-requirements">
                 ${Object.entries(HUNDEFUEHRERSCHEIN_REQUIREMENTS).map(([key, value]) => {
                    const currentProgress = allTimeProgress[key] || 0;
                    const isMet = currentProgress >= value;
                    const icon = isMet ? ICONS.req_met : ICONS.req_unmet;
                    const iconClass = isMet ? 'met' : 'unmet';
                    return `
                    <li class="requirement-item">
                        <span class="requirement-icon ${iconClass}">${icon}</span>
                        <span class="requirement-name">${REQUIREMENT_NAMES[key]}</span>
                        <span class="requirement-progress">${Math.min(currentProgress, value)}/${value}</span>
                    </li>
                `}).join('')}
            </ul>
        </div>
    `;

    container.innerHTML = `
        <div class="card-header"><h3>Level-Fortschritt</h3></div>
        <div class="card-content">
            ${levelBlocksHtml}
            ${extraEventsHtml}
        </div>
    `;

    container.querySelectorAll('.level-unlock-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextLevel = parseInt(btn.getAttribute('data-level') || '0');
            if (nextLevel > customer.levelId) {
                customer.levelId = nextLevel;
                customer.levelUpHistory[nextLevel] = new Date().toISOString();
                render();
            }
        });
    });

    container.querySelectorAll('.level-expert-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const expertLevel = parseInt(btn.getAttribute('data-level') || '0');
            if (expertLevel) {
                customer.levelId = expertLevel;
                customer.levelUpHistory[expertLevel] = new Date().toISOString();
                render();
            }
        });
    });

    return container;
}

function renderCustomerStatusCard(customer) {
    let levelKey;
    if (customer.isVip) {
        levelKey = 'vip';
    } else if (customer.levelId > 5) {
        levelKey = 'experte';
    } else {
        levelKey = customer.levelId;
    }

    const level = levelInfo[levelKey];
    if (!level) return '';

    return `
        <div class="card">
            <div class="card-header"><h3>Status</h3></div>
            <div class="card-content status-card-content">
                <img src="${level.imageUrl}" alt="${level.text}" class="status-badge-image">
                <h4 class="status-level-name">${level.shortName}</h4>
                <p class="text-secondary">Aktueller Status des Kunden</p>
            </div>
        </div>
    `;
}

function renderCustomerDocumentsCardString(customer) {
    const isCustomerView = appState.currentUser?.role === 'customer';
    return `
        <div class="card documents-card">
            <div class="card-header card-header-icon">
                ${ICONS.document}
                <h3>Dokumente</h3>
            </div>
            <div class="card-content">
                <ul class="document-list">
                    ${customer.documents.map(doc => `
                        <li class="document-item" data-doc-id="${doc.id}">
                            <div class="document-info document-item-clickable">
                                <span class="document-icon">${ICONS.document}</span>
                                <span class="document-name" title="${doc.name}">${doc.name}</span>
                            </div>
                            <div class="document-actions">
                                 ${!isCustomerView ? `<button class="icon-btn icon-btn-danger delete-doc-btn" aria-label="Dokument löschen">${ICONS.delete}</button>` : ''}
                            </div>
                        </li>
                    `).join('') || '<li class="no-documents">Keine Dokumente hochgeladen.</li>'}
                </ul>
            </div>
            ${!isCustomerView ? `
            <div class="card-footer">
                 <label for="document-upload" class="btn btn-primary">
                    ${ICONS.document} Dokument hochladen
                 </label>
                 <input type="file" id="document-upload" class="visually-hidden">
            </div>
            ` : ''}
        </div>
    `;
}

function renderCustomerProfilePage(customerId) {
    const customer = appState.customers.find(c => c.id === customerId);
    if (!customer) {
        const el = document.createElement('div');
        el.textContent = 'Kunde nicht gefunden.';
        return el;
    }

    const nameParts = customer.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0) || ''}`;

    const levelKey = customer.levelId > 5 ? 'experte' : customer.levelId;
    const level = levelInfo[levelKey];
    
    const isEditing = appState.isProfileEditing;
    const isCustomerView = appState.currentUser?.role === 'customer';

    const container = document.createElement('div');
    container.className = 'profile-layout-grid';

    container.innerHTML = `
        <div class="profile-main-col">
            <div class="card">
                <div class="card-header card-header-icon">
                    ${ICONS.user_profile}
                    <h3>Persönliche Daten</h3>
                </div>
                 <div class="card-content profile-data-grid">
                    <div class="profile-data-avatar">
                        <div class="customer-avatar large">${initials}</div>
                    </div>
                    <dl class="info-grid-profile">
                        <div>
                            <dt>${ICONS.icon_user} Vorname</dt>
                            <dd>${isEditing ? `<input type="text" id="edit-firstName" class="inline-edit-input" value="${firstName}">` : firstName}</dd>
                        </div>
                        <div>
                            <dt>${ICONS.icon_user} Nachname</dt>
                            <dd>${isEditing ? `<input type="text" id="edit-lastName" class="inline-edit-input" value="${lastName}">` : lastName}</dd>
                        </div>
                        <div>
                            <dt>${ICONS.icon_email} E-Mail</dt>
                            <dd>${isEditing ? `<input type="email" id="edit-email" class="inline-edit-input" value="${customer.email}">` : customer.email}</dd>
                        </div>
                        <div>
                            <dt>${ICONS.icon_phone} Telefon</dt>
                            <dd>${isEditing ? `<input type="tel" id="edit-phone" class="inline-edit-input" value="${customer.phone}">` : customer.phone}</dd>
                        </div>
                        <div>
                            <dt>${ICONS.heart} Hund</dt>
                            <dd>${isEditing ? `<input type="text" id="edit-dogName" class="inline-edit-input" value="${customer.dogName}">` : customer.dogName}</dd>
                        </div>
                        <div>
                            <dt>${ICONS.icon_chip} Chipnummer</dt>
                            <dd>${isEditing ? `<input type="text" id="edit-chipNumber" class="inline-edit-input" value="${customer.chipNumber}">` : (customer.chipNumber || 'Nicht angegeben')}</dd>
                        </div>
                    </dl>
                </div>
            </div>
            <div class="card">
                 <div class="card-header card-header-icon">
                    ${ICONS.credit_card}
                    <h3>Konto-Übersicht</h3>
                </div>
                 <div class="card-content">
                    <div class="overview-grid">
                        <div class="overview-box overview-box-green">
                            <div class="overview-box-title">Aktuelles Guthaben</div>
                            <div class="overview-box-value">${formatCurrency(customer.credits)} €</div>
                        </div>
                        <div class="overview-box overview-box-blue clickable" data-action="show-transactions">
                            <div class="overview-box-title">Transaktionen gesamt</div>
                            <div class="overview-box-value">${customer.transactions.length}</div>
                        </div>
                        <div class="overview-box overview-box-orange">
                             <div class="overview-box-title">Status</div>
                             <div class="overview-box-value">${level.text.split('-')[0].trim()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="profile-side-col">
            ${renderCustomerStatusCard(customer)}
            <div class="card">
                <div class="card-header card-header-icon">
                    ${ICONS.qr_code}
                    <h3>QR-Code</h3>
                </div>
                <div class="card-content qr-code-content">
                    <p class="text-secondary">Scannen für schnellen Zugriff</p>
                    <div class="qr-code-container">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://my-dog.school/c/${customer.internalId}`)}" alt="QR Code">
                    </div>
                    <p class="text-secondary qr-code-footer">Scanne diesen Code für direkten Zugriff auf das Kundenkonto</p>
                    <p class="text-secondary qr-code-id">QR-Code ID: ${customer.internalId}</p>
                </div>
            </div>
            ${renderCustomerDocumentsCardString(customer)}
             ${!isCustomerView ? `
             <div class="card">
                <div class="card-header"><h3>Konto-Status</h3></div>
                <dl class="info-list-profile">
                    <div><dt>Status</dt><dd><span class="badge ${level.colorClass}">${level.text}</span></dd></div>
                    <div><dt>Kunden-ID</dt><dd>${customer.internalId}</dd></div>
                    <div><dt>Erstellt am</dt><dd>${new Date(customer.memberSince).toLocaleDateString('de-DE')}</dd></div>
                    <div><dt>Erstellt von</dt><dd>${customer.createdBy}</dd></div>
                </dl>
            </div>
            ` : ''}
        </div>
    `;

    const mainCol = container.querySelector('.profile-main-col');
    mainCol.appendChild(renderLevelProgressComponent());

    // Event listener for transaction box
    container.querySelector('[data-action="show-transactions"]')?.addEventListener('click', () => {
        const customerTransactions = customer.transactions.map(t => ({ ...t, customerName: customer.name }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
        appState.isDetailsModalOpen = true;
        appState.detailsModalData = {
            title: `Transaktionen von ${customer.name}`,
            type: 'transaction',
            items: customerTransactions
        };
        render();
    });

    // Event listener for file upload
    const fileInput = container.querySelector('#document-upload') as HTMLInputElement;
    fileInput?.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const file = target.files[0];
            const newDocument = {
                id: Date.now(), // simple unique id
                name: file.name,
                url: '#' // In a real app, this would be the URL to the stored file
            };
            const customerIndex = appState.customers.findIndex(c => c.id === customerId);
            if (customerIndex > -1) {
                appState.customers[customerIndex].documents.push(newDocument);
                render(); // Re-render the entire view to show the new document
            }
        }
    });

    // Event listener for delete buttons
    container.querySelectorAll('.delete-doc-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const listItem = (event.currentTarget as HTMLElement).closest('.document-item');
            if (listItem) {
                const docId = parseInt(listItem.getAttribute('data-doc-id') || '0', 10);
                 const documentToDelete = customer.documents.find(d => d.id === docId);
                if (documentToDelete) {
                    appState.documentToDelete = documentToDelete;
                    appState.isDeleteConfirmModalOpen = true;
                    render();
                }
            }
        });
    });

    // Event listeners for clickable document items
    container.querySelectorAll('.document-item-clickable').forEach(element => {
        element.addEventListener('click', (event) => {
            const listItem = (event.currentTarget as HTMLElement).closest('.document-item');
            if (listItem) {
                const docId = parseInt(listItem.getAttribute('data-doc-id') || '0', 10);
                const documentToView = customer.documents.find(d => d.id === docId);

                if (documentToView) {
                    appState.documentToView = documentToView;
                    appState.isDocumentModalOpen = true;
                    render();
                }
            }
        });
    });
    
    return container;
}

// --- EXPORT FUNCTIONS ---
function getFilteredReportData() {
    const { transactions } = getScopedData();
    const { reportsTimeFilter, reportsUserFilter } = appState;
    
    const filteredTransactions = transactions.filter(t => {
        const timeMatch = DateHelpers.isDateInPeriod(t.date, reportsTimeFilter);
        const userMatch = reportsUserFilter === 'Alle' || t.bookedBy === reportsUserFilter;
        return timeMatch && userMatch;
    });
    
    const revenueFiltered = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const consumptionFiltered = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
    const revenueToday = transactions.filter(t => t.amount > 0 && DateHelpers.isToday(t.date)).reduce((sum, t) => sum + t.amount, 0);

    const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    let timeLabel;
    const yearMatch = reportsTimeFilter.match(/^(\d{4})$/);
    const monthMatch = reportsTimeFilter.match(/^(\d{4})-(\d{2})$/);
    if (reportsTimeFilter === 'today') timeLabel = 'Heute';
    else if (reportsTimeFilter === 'this_month') timeLabel = 'Dieser Monat';
    else if (reportsTimeFilter === 'this_year') timeLabel = 'Dieses Jahr';
    else if (yearMatch) timeLabel = yearMatch[1];
    else if (monthMatch) timeLabel = `${monthNames[parseInt(monthMatch[2], 10)-1]} ${monthMatch[1]}`;
    else timeLabel = 'Zeitraum';
    
    return {
        filteredTransactions,
        revenueFiltered,
        consumptionFiltered,
        revenueToday,
        timeLabel
    };
}


function handleExportPDF() {
    const { filteredTransactions, revenueFiltered, consumptionFiltered, timeLabel } = getFilteredReportData();
    const { reportsUserFilter } = appState;
    // Fix: Access jspdf directly as it is declared globally.
    const doc = new jspdf.jsPDF();

    doc.setFontSize(18);
    doc.text("Bericht & Statistiken - PfotenCard", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Exportiert am: ${new Date().toLocaleDateString('de-DE')}`, 14, 30);
    doc.text(`Filter - Zeitraum: ${timeLabel}`, 14, 35);
    doc.text(`Filter - Mitarbeiter: ${reportsUserFilter}`, 14, 40);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Zusammenfassung`, 14, 50);
    doc.text(`Aufladungen: ${formatCurrency(revenueFiltered)} €`, 14, 56);
    doc.text(`Abbuchungen: ${formatCurrency(consumptionFiltered)} €`, 14, 62);
    
    const tableColumn = ["Datum", "Typ", "Kunde", "Gebucht von", "Betrag (€)"];
    const tableRows = [];

    filteredTransactions.forEach(t => {
        const transactionData = [
            new Date(t.date).toLocaleDateString('de-DE'),
            t.type,
            t.customerName,
            t.bookedBy || 'N/A',
            formatCurrency(t.amount)
        ];
        tableRows.push(transactionData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        headStyles: { fillColor: [38, 50, 56] }, // sidebar-bg color
        styles: { halign: 'right' },
        columnStyles: { 
            1: { halign: 'left' }, 
            2: { halign: 'left' },
            3: { halign: 'left' }
        },
    });

    doc.save(`PfotenCard_Bericht_${new Date().toISOString().split('T')[0]}.pdf`);
}

function handleExportExcel() {
    const { filteredTransactions, revenueFiltered, consumptionFiltered, timeLabel } = getFilteredReportData();
    const { reportsUserFilter } = appState;
    
    const summaryData = [
        { A: "Bericht & Statistiken - PfotenCard" },
        {},
        { A: "Exportiert am:", B: new Date().toLocaleDateString('de-DE') },
        { A: "Filter - Zeitraum:", B: timeLabel },
        { A: "Filter - Mitarbeiter:", B: reportsUserFilter },
        {},
        { A: "Zusammenfassung" },
        { A: "Aufladungen:", B: `${formatCurrency(revenueFiltered)} €` },
        { A: "Abbuchungen:", B: `${formatCurrency(consumptionFiltered)} €` },
        {},
        { A: "Datum", B: "Typ", C: "Kunde", D: "Gebucht von", E: "Betrag (€)" }
    ];
    
    const transactionRows = filteredTransactions.map(t => ({
        A: new Date(t.date).toLocaleDateString('de-DE'),
        B: t.type,
        C: t.customerName,
        D: t.bookedBy || 'N/A',
        E: t.amount
    }));

    const exportData = summaryData.concat(transactionRows);
    
    const ws = XLSX.utils.json_to_sheet(exportData, { skipHeader: true });

    // Set column widths for better readability
    ws['!cols'] = [ {wch:12}, {wch:40}, {wch:25}, {wch:15}, {wch:12} ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bericht");
    XLSX.writeFile(wb, `PfotenCard_Bericht_${new Date().toISOString().split('T')[0]}.xlsx`);
}



function renderReportsPage() {
    const container = document.createElement('div');
    container.className = 'page-container';

    const pageHeader = renderPageHeader(
        'Berichte',
        'Berichte & Statistiken',
        'Analysiere wichtige Leistungsindikatoren Deiner Hundeschule.',
        [
            { id: 'export-pdf-btn', text: 'Export PDF', className: 'btn-secondary', onClick: handleExportPDF },
            { id: 'export-excel-btn', text: 'Export Excel', className: 'btn-secondary', onClick: handleExportExcel }
        ]
    );

    const content = document.createElement('div');
    const { customers, transactions, activeCustomersMonth } = getScopedData();
    const { reportsTimeFilter, reportsUserFilter } = appState;
    
    const filteredTransactions = transactions.filter(t => {
        const timeMatch = DateHelpers.isDateInPeriod(t.date, reportsTimeFilter);
        const userMatch = reportsUserFilter === 'Alle' || t.bookedBy === reportsUserFilter;
        return timeMatch && userMatch;
    });

    const customerTransactions = customers.map(c => ({
        ...c,
        transactionCount: c.transactions.filter(t => t.amount < 0 && DateHelpers.isDateInThis(t.date, 'month')).length
    })).sort((a, b) => b.transactionCount - a.transactionCount);

    const revenueFiltered = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const consumptionFiltered = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
    const revenueToday = transactions.filter(t => t.amount > 0 && DateHelpers.isToday(t.date)).reduce((sum, t) => sum + t.amount, 0);

    const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    let timeLabel;
    const yearMatch = reportsTimeFilter.match(/^(\d{4})$/);
    const monthMatch = reportsTimeFilter.match(/^(\d{4})-(\d{2})$/);
    if (reportsTimeFilter === 'today') timeLabel = 'Heute';
    else if (reportsTimeFilter === 'this_month') timeLabel = 'Dieser Monat';
    else if (reportsTimeFilter === 'this_year') timeLabel = 'Dieses Jahr';
    else if (yearMatch) timeLabel = yearMatch[1];
    else if (monthMatch) timeLabel = `${monthNames[parseInt(monthMatch[2], 10)-1]} ${monthMatch[1]}`;
    else timeLabel = 'Zeitraum';


    const transactionDates = transactions.map(t => new Date(t.date));
    const months = new Set<string>();
    const years = new Set<string>();
    transactionDates.forEach(d => {
        if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            years.add(year.toString());
            months.add(`${year}-${month.toString().padStart(2, '0')}`);
        }
    });
    const sortedYears = Array.from(years).sort((a,b) => b.localeCompare(a));
    const sortedMonths = Array.from(months).sort((a,b) => b.localeCompare(a));
    
    content.innerHTML = `
        <div class="summary-card-grid">
            ${renderSummaryCard(`Aufladungen (${timeLabel})`, `${formatCurrency(revenueFiltered)} €`, 'green', ICONS.stat_revenue, null)}
            ${renderSummaryCard(`Abbuchungen (${timeLabel})`, `${formatCurrency(consumptionFiltered)} €`, 'orange', ICONS.stat_consumption, null)}
            ${renderSummaryCard('Aktive Kunden (Monat)', activeCustomersMonth.length.toString(), 'blue', ICONS.stat_user_check, 'active-customers-month')}
            ${renderSummaryCard('Aufladungen (Heute)', `${formatCurrency(revenueToday)} €`, 'purple', ICONS.stat_revenue, 'deposits-today')}
        </div>
        <div class="card filter-bar">
             <div class="filter-group">
                <label for="time-filter">Zeitraum</label>
                <div class="filter-controls">
                    <select id="time-filter">
                        <option value="this_year" ${reportsTimeFilter === 'this_year' ? 'selected' : ''}>Dieses Jahr</option>
                        <option value="this_month" ${reportsTimeFilter === 'this_month' ? 'selected' : ''}>Dieser Monat</option>
                        <option value="today" ${reportsTimeFilter === 'today' ? 'selected' : ''}>Heute</option>
                        <optgroup label="Jahre">
                            ${sortedYears.map(y => `<option value="${y}" ${reportsTimeFilter === y ? 'selected' : ''}>${y}</option>`).join('')}
                        </optgroup>
                        <optgroup label="Monate">
                            ${sortedMonths.map(m => {
                                const [year, month] = m.split('-');
                                const label = `${monthNames[parseInt(month, 10)-1]} ${year}`;
                                return `<option value="${m}" ${reportsTimeFilter === m ? 'selected' : ''}>${label}</option>`;
                            }).join('')}
                        </optgroup>
                    </select>
                </div>
            </div>
            <div class="filter-group">
                <label for="user-filter">Mitarbeiter</label>
                <div class="filter-controls">
                    <select id="user-filter">
                        <option value="Alle">Alle</option>
                        ${appState.users.map(u => `<option value="${u.name}" ${reportsUserFilter === u.name ? 'selected' : ''}>${u.name}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
         <div class="content-grid-half">
            <div class="card">
                <div class="card-header"><h3>Transaktionen (${filteredTransactions.length})</h3></div>
                <div class="card-content" style="padding: 0;">
                    <ul class="compact-list">
                    ${filteredTransactions.length > 0 ? filteredTransactions.map(t => {
                        const isPositive = t.amount > 0;
                        const icon = isPositive ? ICONS.transaction_plus : ICONS.transaction_minus;
                        const amountClass = isPositive ? 'text-green' : 'text-red';
                        return `
                        <li class="compact-list-item">
                            <span class="transaction-icon ${isPositive ? 'positive' : 'negative'}">${icon}</span>
                            <span>
                                <strong>${t.type} (Kunde: ${t.customerName})</strong>
                                <small>Gebucht von ${t.bookedBy || 'System'} am ${new Date(t.date).toLocaleDateString('de-DE')}</small>
                            </span>
                            <span class="${amountClass} transaction-amount">${isPositive ? '+' : ''}${formatCurrency(t.amount)} €</span>
                        </li>`
                    }).join('') : `<li class="no-documents">Keine Transaktionen für die gewählten Filter gefunden.</li>`}
                    </ul>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Top Kunden (Monat)</h3></div>
                <div class="card-content" style="padding: 0;">
                    <ul class="compact-list">
                    ${customerTransactions.slice(0, 3).map(c => {
                        const initials = c.name.split(' ').map(n => n[0]).join('');
                        return `<li class="compact-list-item customer-list-item">
                            <div class="customer-info">
                                <div class="customer-avatar">${initials}</div>
                                <div>
                                    <div class="customer-name">${c.name}</div>
                                    <div class="customer-id-small">${c.transactionCount} Abbuchung(en)</div>
                                </div>
                            </div>
                        </li>`
                        }).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    content.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('[data-modal-type]');
        if (card) {
            handleStatCardClick(card.getAttribute('data-modal-type'));
        }
    });

    content.querySelector('#time-filter')?.addEventListener('change', (e) => {
        appState.reportsTimeFilter = (e.target as HTMLSelectElement).value;
        render();
    });

    content.querySelector('#user-filter')?.addEventListener('change', (e) => {
        appState.reportsUserFilter = (e.target as HTMLSelectElement).value;
        render();
    });

    container.appendChild(pageHeader);
    container.appendChild(content);    
    return container;
}

function renderUsersPage() {
    if (appState.currentUser.role !== 'admin') {
        const el = document.createElement('div');
        el.innerHTML = `<div class="card"><p>Zugriff verweigert.</p></div>`;
        return el;
    }
    const container = document.createElement('div');
    container.className = 'page-container';

    const pageHeader = renderPageHeader(
        'Benutzer',
        'Benutzerverwaltung',
        'Verwalte alle Systembenutzer an einem Ort.',
        [{
            id: 'new-user-btn',
            text: '+ Neuer Benutzer',
            className: 'btn-green',
            onClick: () => {
                appState.isNewUserModalOpen = true;
                render();
            }
        }]
    );
    container.appendChild(pageHeader);

    const summaryGrid = document.createElement('div');
    summaryGrid.className = 'summary-card-grid';
    const admins = appState.users.filter(u => u.role === 'admin');
    const employees = appState.users.filter(u => u.role === 'employee');
    const newCustomersThisMonth = appState.customers.filter(c => DateHelpers.isDateInThis(c.memberSince, 'month'));
    
    summaryGrid.innerHTML = `
        ${renderSummaryCard('Benutzer Gesamt', appState.users.length.toString(), 'blue', ICONS.info_users, null)}
        ${renderSummaryCard('Admins', admins.length.toString(), 'purple', ICONS.stat_users, null)}
        ${renderSummaryCard('Mitarbeiter', employees.length.toString(), 'orange', ICONS.stat_users, null)}
        ${renderSummaryCard('Kunden Neu (Monat)', newCustomersThisMonth.length.toString(), 'green', ICONS.stat_user_check, 'new-customers-month')}
    `;
    container.appendChild(summaryGrid);

    const tableContainer = document.createElement('div');
    tableContainer.className = 'card table-container users-table-card';
    tableContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>BENUTZER</th>
                        <th>E-MAIL</th>
                        <th>ROLLE</th>
                        <th>ERSTELLT</th>
                        <th>AKTIONEN</th>
                    </tr>
                </thead>
                <tbody>
                    ${appState.users.map(user => {
                        const d = new Date(user.createdDate);
                        const formattedDate = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear().toString().slice(-2)}`;
                        return `
                        <tr data-user-id="${user.id}">
                            <td data-label="BENUTZER">
                                <div class="customer-info">
                                    <div class="customer-avatar" style="background-color: ${user.avatarColor};">${user.name.charAt(0)}</div>
                                    <div>
                                        <div class="customer-name">${user.name}</div>
                                        <div class="customer-id-small">${user.username}</div>
                                    </div>
                                </div>
                            </td>
                            <td data-label="E-MAIL">${user.email}</td>
                            <td data-label="ROLLE">
                                <span class="badge badge-role badge-role-${user.role}">
                                    ${user.role === 'admin' ? 'Admin' : 'Mitarbeiter'}
                                </span>
                            </td>
                            <td data-label="ERSTELLT">${formattedDate}</td>
                            <td data-label="AKTIONEN">
                                <div class="action-icons">
                                    <button class="icon-btn edit-user-btn" aria-label="Bearbeiten" data-user-id="${user.id}">${ICONS.edit}</button>
                                    <button class="icon-btn icon-btn-danger delete-user-btn" aria-label="Löschen" data-user-id="${user.id}">${ICONS.delete}</button>
                                </div>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
    `;
    
    const openEditModal = (userId) => {
        const userToEdit = appState.users.find(u => u.id === userId);
        if (userToEdit) {
            appState.userToEdit = userToEdit;
            appState.isUserEditModalOpen = true;
            render();
        }
    };

    const openDeleteModal = (userId) => {
        const userToDelete = appState.users.find(u => u.id === userId);
        if (userToDelete) {
            appState.userToDelete = userToDelete;
            appState.isUserDeleteConfirmModalOpen = true;
            render();
        }
    };

    tableContainer.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            const userId = parseInt(row.getAttribute('data-user-id') || '0');
            if (userId) openEditModal(userId);
        });
    });

    tableContainer.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = parseInt(btn.getAttribute('data-user-id') || '0');
            if (userId) openEditModal(userId);
        });
    });

    tableContainer.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = parseInt(btn.getAttribute('data-user-id') || '0');
            if (userId) openDeleteModal(userId);
        });
    });

    tableContainer.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('[data-modal-type]');
        if (card) {
            handleStatCardClick(card.getAttribute('data-modal-type'));
        }
    });
    
    container.appendChild(tableContainer);
    return container;
}

// --- NEW TRANSACTION & LEVEL LOGIC ---

function getProgressForLevel(customer, allCustomerTransactions, allTime = false) {
    const progress = {};
    Object.values(REQUIREMENT_IDS).forEach(id => { progress[id] = 0; });

    // Handle allTime logic for Hundeführerschein requirements ONLY
    if (allTime) {
        const hundefuehrerscheinIds = Object.keys(HUNDEFUEHRERSCHEIN_REQUIREMENTS);
        for (const t of allCustomerTransactions) {
            if (t.meta?.requirementId && hundefuehrerscheinIds.includes(t.meta.requirementId)) {
                 progress[t.meta.requirementId] = (progress[t.meta.requirementId] || 0) + 1;
            }
        }
        return progress;
    }

    // --- Logic for current level progress (not allTime) ---

    // 1. Get the timeframe and sort transactions by date
    const levelStartDate = new Date(customer.levelUpHistory[customer.levelId]);
    if (isNaN(levelStartDate.getTime())) return progress;
    const transactionsInTimeframe = allCustomerTransactions
        .filter(t => new Date(t.date) >= levelStartDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Get current level requirements
    const currentLevelRequirements = LEVEL_REQUIREMENTS[customer.levelId];
    if (!currentLevelRequirements) return progress;

    // 3. Filter for relevant transactions and separate them
    const relevantRequirementIds = Object.keys(currentLevelRequirements);
    const relevantTransactions = transactionsInTimeframe.filter(t =>
        t.meta?.requirementId && relevantRequirementIds.includes(t.meta.requirementId)
    );
    const examTransactions = relevantTransactions.filter(t => t.meta.requirementId === REQUIREMENT_IDS.PRUEFUNG);
    const otherTransactions = relevantTransactions.filter(t => t.meta.requirementId !== REQUIREMENT_IDS.PRUEFUNG);

    // 4. Calculate non-exam progress and find the fulfillment date of each prerequisite
    const otherReqs = { ...currentLevelRequirements };
    delete otherReqs[REQUIREMENT_IDS.PRUEFUNG];
    
    const fulfillmentDatesPerReq = {};
    const tempProgress = {};

    for (const t of otherTransactions) {
        const reqId = t.meta.requirementId;
        if (otherReqs[reqId]) {
            // Only count up to the required amount for the fulfillment date logic
            if ((tempProgress[reqId] || 0) < otherReqs[reqId]) {
                tempProgress[reqId] = (tempProgress[reqId] || 0) + 1;
                // Check if this transaction fulfills the requirement
                if (tempProgress[reqId] === otherReqs[reqId]) {
                    fulfillmentDatesPerReq[reqId] = new Date(t.date);
                }
            }
            // The final progress display should not be capped here
            progress[reqId] = (progress[reqId] || 0) + 1;
        }
    }

    // 5. Check if all non-exam requirements are met
    const otherReqsMet = Object.entries(otherReqs)
        .every(([id, count]) => (progress[id] || 0) >= (count as number));

    // 6. Find the fulfillment date. This is the moment the gate for exams opens.
    let fulfillmentDate = null;

    if (customer.levelId === 5) {
        // SPECIAL CASE: The gate for the final exam opens when all Hundeführerschein events are completed.
        const allTimeProgress = getProgressForLevel(customer, allCustomerTransactions, true);
        const specialReqsMet = Object.entries(HUNDEFUEHRERSCHEIN_REQUIREMENTS).every(([reqId, reqCount]) => {
             return (allTimeProgress[reqId] || 0) >= reqCount;
        });

        if (specialReqsMet) {
            // Find the date of the last completed special requirement
            const requiredIds = Object.keys(HUNDEFUEHRERSCHEIN_REQUIREMENTS);
            const hsRelevantTransactions = allCustomerTransactions
                .filter(t => t.meta?.requirementId && requiredIds.includes(t.meta.requirementId))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            const hsTempProgress = {};
            const hsFulfillmentDates = [];
            for (const t of hsRelevantTransactions) {
                const reqId = t.meta.requirementId;
                if ((hsTempProgress[reqId] || 0) < HUNDEFUEHRERSCHEIN_REQUIREMENTS[reqId]) {
                    hsTempProgress[reqId] = (hsTempProgress[reqId] || 0) + 1;
                    if (hsTempProgress[reqId] === HUNDEFUEHRERSCHEIN_REQUIREMENTS[reqId]) {
                        hsFulfillmentDates.push(new Date(t.date).getTime());
                    }
                }
            }
            if (hsFulfillmentDates.length > 0) {
                 fulfillmentDate = new Date(Math.max(...hsFulfillmentDates));
            }
        }
    } else if (otherReqsMet) {
        const dates = Object.values(fulfillmentDatesPerReq).map(d => (d as Date).getTime());
        if (dates.length > 0) {
           fulfillmentDate = new Date(Math.max(...dates));
        } else {
           // This handles levels with only an exam requirement.
           fulfillmentDate = levelStartDate;
        }
    }

    // 7. Conditionally count exams ONLY if the gate is open and they were booked AFTER it opened.
    if (fulfillmentDate) {
        for (const t of examTransactions) {
            if (new Date(t.date) > fulfillmentDate) {
                progress[REQUIREMENT_IDS.PRUEFUNG] = (progress[REQUIREMENT_IDS.PRUEFUNG] || 0) + 1;
            }
        }
    }
    
    return progress;
}


function areLevelRequirementsMet(customer, allCustomerTransactions) {
    if (customer.levelId === 1) {
        return true;
    }

    const requirements = LEVEL_REQUIREMENTS[customer.levelId];
    if (!requirements) return false;

    const progress = getProgressForLevel(customer, allCustomerTransactions);
    
    if (customer.levelId === 5) {
        const allTimeProgress = getProgressForLevel(customer, allCustomerTransactions, true);
        const specialReqsMet = Object.entries(HUNDEFUEHRERSCHEIN_REQUIREMENTS).every(([reqId, reqCount]) => {
             return (allTimeProgress[reqId] || 0) >= reqCount;
        });
        return specialReqsMet && (progress[REQUIREMENT_IDS.PRUEFUNG] || 0) >= requirements[REQUIREMENT_IDS.PRUEFUNG];
    }
    
    return Object.entries(requirements).every(([reqId, reqCount]) => {
        return (progress[reqId] || 0) >= reqCount;
    });
}

function executeTransaction(data) {
    const customerIndex = appState.customers.findIndex(c => c.id === data.customerId);
    if (customerIndex === -1) return;
    const customer = appState.customers[customerIndex];

    if (data.type === 'topup') {
        customer.credits += data.totalAmount;
        let transactionType = `Aufladung ${formatCurrency(data.amount)}€`;
        if (data.bonus > 0) {
            transactionType += ` (+ ${formatCurrency(data.bonus)}€ Bonus)`;
        }
        customer.transactions.unshift({
            id: Date.now(),
            type: transactionType,
            amount: data.totalAmount,
            date: new Date().toISOString(),
            bookedBy: data.bookedBy
        });
    } else if (data.type === 'debit') {
        const event = TRANSACTION_TYPES[data.eventKey];
        customer.credits -= event.price;
        const newTransaction: any = {
            id: Date.now(),
            type: `Abbuchung: ${event.name}`,
            amount: -event.price,
            date: new Date().toISOString(),
            bookedBy: data.bookedBy
        };
        if (event.requirementId) {
            newTransaction.meta = { requirementId: event.requirementId };
        }
        customer.transactions.unshift(newTransaction);
    }
}

function handleBooking(customerId, eventKey) {
    const customer = appState.customers.find(c => c.id === customerId);
    if (!customer) return;
    
    const event = TRANSACTION_TYPES[eventKey];

    if (customer.credits < event.price) {
        alert('Guthaben nicht ausreichend!');
        return;
    }
    
    appState.confirmModalData = {
        type: 'debit',
        customerId: customerId,
        customerName: customer.name,
        description: event.name,
        amount: event.price,
        oldBalance: customer.credits,
        newBalance: customer.credits - event.price,
        bookedBy: appState.currentUser.name,
        eventKey: eventKey
    };
    appState.isConfirmModalOpen = true;
    render();
}


function handleTopUp(customerId, amount, bonus = 0) {
    const customer = appState.customers.find(c => c.id === customerId);
    if (!customer) return;

    const totalAmount = amount + bonus;
    appState.confirmModalData = {
        type: 'topup',
        customerId: customerId,
        customerName: customer.name,
        amount: amount,
        bonus: bonus,
        totalAmount: totalAmount,
        oldBalance: customer.credits,
        newBalance: customer.credits + totalAmount,
        bookedBy: appState.currentUser.name
    };
    appState.isConfirmModalOpen = true;
    render();
}

function renderManageTransactionsPage(customerId) {
    const customer = appState.customers.find(c => c.id === customerId);
    if (!customer) return document.createElement('div');

    const container = document.createElement('div');
    container.className = 'transactions-page-layout';
    
    const topUpOptions = [
        { amount: 15, bonus: 0 },
        { amount: 50, bonus: 5 },
        { amount: 100, bonus: 20 },
        { amount: 150, bonus: 35 },
        { amount: 300, bonus: 75 },
        { amount: 500, bonus: 150 },
    ];
    
    container.innerHTML = `
        <div class="current-balance-banner">
            <div class="balance-banner-title">Aktuelles Guthaben</div>
            <div class="balance-banner-amount">${formatCurrency(customer.credits)} €</div>
        </div>
        <div class="card">
            <div class="card-header"><h3>Aufladungen</h3></div>
            <div class="card-content">
                <div class="button-grid">
                ${topUpOptions.map(opt => `
                    <button class="btn-transaction btn-topup" data-amount="${opt.amount}" data-bonus="${opt.bonus}">
                        <div class="btn-transaction-info">
                           <span class="btn-transaction-main">Aufladung ${opt.amount}€</span>
                           ${opt.bonus > 0 ? `<span class="btn-transaction-sub">(+ ${formatCurrency(opt.bonus)}€ Bonus)</span>` : ''}
                        </div>
                        <span class="btn-transaction-amount">+ ${formatCurrency(opt.amount + opt.bonus)} €</span>
                    </button>
                `).join('')}
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><h3>Abbuchungen (Training & Kurse)</h3></div>
            <div class="card-content">
                <div class="button-grid">
                ${Object.entries(TRANSACTION_TYPES).map(([key, event]) => `
                     <button class="btn-transaction btn-debit" data-event-key="${key}">
                        <div class="btn-transaction-info">
                            <span class="btn-transaction-main">${event.name}</span>
                        </div>
                        <span class="btn-transaction-amount">- ${formatCurrency(event.price)} €</span>
                    </button>
                `).join('')}
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.btn-topup').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const amount = parseInt(target.dataset.amount || '0');
            const bonus = parseInt(target.dataset.bonus || '0');
            handleTopUp(customerId, amount, bonus);
        });
    });

    container.querySelectorAll('.btn-debit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLElement;
            const eventKey = target.dataset.eventKey;
            if (eventKey) {
                handleBooking(customerId, eventKey);
            }
        });
    });

    return container;
}

function renderConfirmationModal() {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-overlay';
    const data = appState.confirmModalData;
    if (!data) return modalContainer;

    const closeModal = () => {
        appState.isConfirmModalOpen = false;
        appState.confirmModalData = null;
        render();
    };

    let detailsHtml = '';
    if (data.type === 'topup') {
        detailsHtml = `
            <div class="confirm-info-block info-block-topup">
                <div class="info-line"><span>Aufladung</span> <span>${formatCurrency(data.amount)} €</span></div>
                <div class="info-line"><span>${ICONS.bonus} Bonus</span> <span>+ ${formatCurrency(data.bonus)} €</span></div>
                <hr class="info-divider">
                <div class="info-line total"><span>Gesamt gutgeschrieben</span> <span>+ ${formatCurrency(data.totalAmount)} €</span></div>
                <div class="info-line-description">Beschreibung: Aufladung ${formatCurrency(data.amount)}€ + ${formatCurrency(data.bonus)}€ Bonus</div>
            </div>
        `;
    } else { // debit
        detailsHtml = `
             <div class="confirm-info-block info-block-debit">
                 <div class="info-line total"><span>Abbuchung</span> <span>- ${formatCurrency(data.amount)} €</span></div>
                 <div class="info-line-description">Beschreibung: ${data.description}</div>
            </div>
        `;
    }

    modalContainer.innerHTML = `
        <div class="modal modal-transaction-confirm" role="dialog" aria-labelledby="confirm-modal-title" aria-modal="true">
            <div class="modal-header confirm-header">
                <div class="confirm-icon-check">${ICONS.req_met}</div>
                <h3 id="confirm-modal-title">Transaktion bestätigen</h3>
                <button class="icon-btn close-modal-btn" aria-label="Schließen">${ICONS.close}</button>
            </div>
            <div class="modal-content">
                <p class="confirm-subtitle">Bitte bestätige die Transaktion für <strong>${data.customerName}</strong>.</p>
                <div class="confirm-info-block info-block-employee">
                    ${ICONS.user_profile} Mitarbeiter: ${data.bookedBy}
                </div>
                ${detailsHtml}
                <div class="confirm-info-block info-block-saldo">
                    <div class="saldo-item">
                        <span class="saldo-label">Alter Saldo</span>
                        <span class="saldo-value">${formatCurrency(data.oldBalance)} €</span>
                    </div>
                    <div class="saldo-arrow">&rarr;</div>
                    <div class="saldo-item">
                        <span class="saldo-label">Neuer Saldo</span>
                        <span class="saldo-value new">${formatCurrency(data.newBalance)} €</span>
                    </div>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary close-modal-btn">Abbrechen</button>
                <button type="button" class="btn btn-green" id="confirm-transaction-btn">${ICONS.save} Bestätigen und Buchen</button>
            </div>
        </div>
    `;

    modalContainer.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });

    modalContainer.querySelector('#confirm-transaction-btn')?.addEventListener('click', () => {
        executeTransaction(data);
        closeModal();
    });

    return modalContainer;
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('online', () => {
        appState.isOnline = true;
        render();
    });
    window.addEventListener('offline', () => {
        appState.isOnline = false;
        render();
    });
    render();
});
