/* ==========================================
   MORPHEUS VIII
   DASHBOARD
========================================== */

import { db, auth } from "./firebase.js";

import {
    collection,
    doc,
    getDoc,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


const school = JSON.parse(
    sessionStorage.getItem("loggedInSchool")
);

if (!school) {
    window.location.href = "login.html";
}


document.getElementById(
    "schoolName"
).textContent = school.name;


const categories = [
    "On Stage",
    "Off Stage",
    "Sporting",
    "Online"
];

let activeCategory = categories[0];

const tabs =
    document.getElementById("categoryTabs");

const grid =
    document.getElementById("eventGrid");


/*
   Stores the IDs of events already registered
   by the current school.
*/

const registeredEventIds = new Set();

let registrationsOpen = true;
async function loadRegistrationSetting() {

    try {

        const settingSnapshot =
            await getDoc(
                doc(
                    db,
                    "settings",
                    "registration"
                )
            );

        if (settingSnapshot.exists()) {

            registrationsOpen =
                settingSnapshot.data()
                    .isOpen === true;
        }

    } catch (error) {

        console.error(
            "Could not load registration status:",
            error
        );

        registrationsOpen = false;
    }
}


/* ==========================================
   LOAD REGISTRATION STATUS
========================================== */

async function loadRegistrationStatuses() {

    try {

        const eventsReference = collection(
            db,
            "registrations",
            school.id,
            "events"
        );

        const snapshot =
            await getDocs(eventsReference);

        snapshot.forEach(documentSnapshot => {

            registeredEventIds.add(
                documentSnapshot.id
            );
            registrationCount.textContent =
    `${registeredEventIds.size} of ${EVENTS.length}`;
        });

    } catch (error) {

        console.error(
            "Could not load registration statuses:",
            error
        );

    
}
}


/* ==========================================
   CATEGORY TABS
========================================== */

function buildTabs() {

    tabs.innerHTML = "";

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.textContent = category;

        button.className = "category-tab";

        if (category === activeCategory) {

            button.classList.add("active");
        }

        button.addEventListener(
            "click",
            () => {

                activeCategory = category;

                buildTabs();

                buildGrid();
            }
        );

        tabs.appendChild(button);
    });
}


/* ==========================================
   EVENT CARDS
========================================== */

function buildGrid() {

    grid.innerHTML = "";

    const filteredEvents = EVENTS.filter(
        event =>
            event.category === activeCategory
    );

    filteredEvents.forEach(event => {

        const isRegistered =
            registeredEventIds.has(event.id);
            registrationCount.textContent =
    `${registeredEventIds.size} of ${EVENTS.length}`;

        const card =
            document.createElement("div");

        card.className = "event-card";

        if (isRegistered) {

            card.classList.add(
                "registered-event"
            );
        }

        card.innerHTML = `
            <div class="badge">
                ${event.type}
            </div>

            <p class="registration-event-name">
    ${event.eventName || event.title}
</p>

<h3 class="registration-event-title">
    ${event.title}
</h3>

<p class="registration-event-summary">
    👥 ${event.summary}
</p>
            <button
                type="button"
                class="primary-btn event-open-btn"
            >
                ${
    isRegistered
        ? "✓ Registered"
        : registrationsOpen
            ? "Register →"
            : "Registrations Closed"
}
            </button>
        `;

        const openButton =
            card.querySelector(
                ".event-open-btn"
            );

        openButton.addEventListener(
            "click",
            () => {

                openEvent(event.id);
            }
        );

        /*
           Registered events remain clickable.
           The event page will open them in
           read-only mode.
        */

        grid.appendChild(card);
    });
}




/* ==========================================
   OPEN EVENT
========================================== */

function openEvent(id) {

    sessionStorage.setItem(
        "selectedEvent",
        id
    );

    window.location.href =
        "event.html";
}


/* ==========================================
   LOGOUT
========================================== */

document.getElementById(
    "logoutBtn"
).addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Logout failed:",
                error
            );

        } finally {

            sessionStorage.removeItem(
                "loggedInSchool"
            );

            sessionStorage.removeItem(
                "selectedEvent"
            );

            window.location.href =
                "login.html";
        }
    }
);


/* ==========================================
   INITIALISE DASHBOARD
========================================== */

async function initialiseDashboard() {

    buildTabs();

    await Promise.all([
        loadRegistrationSetting(),
        loadRegistrationStatuses()  
    ]);

    buildGrid();
}

initialiseDashboard();

