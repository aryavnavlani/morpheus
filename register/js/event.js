/* ==========================================
   EVENT PAGE
========================================== */

import { db, auth } from "./firebase.js";

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


/* ==========================================
   SCHOOL AND EVENT
========================================== */

const school = JSON.parse(
    sessionStorage.getItem("loggedInSchool")
);

if (!school) {
    window.location.href = "login.html";
}

const eventId =
    sessionStorage.getItem("selectedEvent");

if (!eventId) {
    window.location.href = "dashboard.html";
}

const currentEvent = EVENTS.find(
    event => event.id === eventId
);

if (!currentEvent) {
    window.location.href = "dashboard.html";
}


/* ==========================================
   PAGE ELEMENTS
========================================== */

let registrationsOpen = true;

let registrationClosedMessage =
    "Registrations are currently closed.";

const eventInfo =
    document.getElementById("eventInfo");

const participantsContainer =
    document.getElementById(
        "participantsContainer"
    );

const counter =
    document.getElementById("namesEntered");

const registerBtn =
    document.getElementById("registerBtn");


eventInfo.innerHTML = `
    <h1 class="event-title">
        ${currentEvent.title}
    </h1>

    <p class="event-summary">
        ${currentEvent.summary}
    </p>
`;


/* ==========================================
   GENERATE PARTICIPANT ROWS
========================================== */

function generateParticipantInputs() {

    participantsContainer.innerHTML = "";

    currentEvent.groups.forEach(group => {

        const groupCard =
            document.createElement("div");

        groupCard.className = "group-card";

        groupCard.innerHTML = `
            <h2>${group.name}</h2>

            <p class="group-info">
                ${group.display}
            </p>
        `;

        for (
            let participantNumber = 1;
            participantNumber <= group.max;
            participantNumber++
        ) {

            const participantRow =
                document.createElement("div");

            participantRow.className =
                "participant-row";

            const nameInput =
                document.createElement("input");

            nameInput.type = "text";

            nameInput.className =
                "participant-input participant-name";

            nameInput.placeholder =
                `${group.name} ${participantNumber} - Name`;

            nameInput.dataset.group = group.name;

            nameInput.dataset.index =
                participantNumber - 1;


            const phoneInput =
                document.createElement("input");

            phoneInput.type = "tel";

            phoneInput.className =
                "participant-input participant-phone";

            phoneInput.placeholder =
                "Phone Number";

            phoneInput.dataset.group = group.name;

            phoneInput.dataset.index =
                participantNumber - 1;

            phoneInput.inputMode = "numeric";

            phoneInput.autocomplete = "tel";

            participantRow.appendChild(nameInput);
            participantRow.appendChild(phoneInput);

            groupCard.appendChild(participantRow);
        }

        participantsContainer.appendChild(
            groupCard
        );
    });
}


/* ==========================================
   COUNTER
========================================== */

function updateCounter() {

    const nameInputs =
        document.querySelectorAll(
            ".participant-name"
        );

    let count = 0;

    nameInputs.forEach(input => {

        if (input.value.trim() !== "") {
            count++;
        }
    });

    counter.textContent =
        `${count} participant${count === 1 ? "" : "s"} entered`;
}


/* ==========================================
   PHONE NORMALISATION
========================================== */

function normalisePhone(phone) {

    let digits = phone.replace(/\D/g, "");

    /*
       Allows:
       9876543210
       98765 43210
       +91 98765 43210
    */

    if (
        digits.length === 12 &&
        digits.startsWith("91")
    ) {
        digits = digits.slice(2);
    }

    return digits;
}


/* ==========================================
   LOAD EXISTING REGISTRATION
========================================== */

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

            const settingData =
                settingSnapshot.data();

            registrationsOpen =
                settingData.isOpen === true;

            registrationClosedMessage =
                settingData.message ||
                "Registrations are currently closed.";
        }

    } catch (error) {

        console.error(
            "Could not load registration setting:",
            error
        );

        /*
           Fail closed if the setting cannot
           be verified.
        */

        registrationsOpen = false;

        registrationClosedMessage =
            "Registration status could not be verified. Please refresh the page.";
    }
}

async function loadSavedRegistration() {

    const registrationReference = doc(
        db,
        "registrations",
        school.id,
        "events",
        currentEvent.id
    );

    try {

        const registrationSnapshot =
            await getDoc(
                registrationReference
            );

        if (!registrationSnapshot.exists()) {
            return;
        }

        const savedData =
            registrationSnapshot.data();

        const savedGroups =
            savedData.groups || {};

        currentEvent.groups.forEach(group => {

            const participants =
                savedGroups[group.name] || [];

            const nameInputs =
                document.querySelectorAll(
                    `.participant-name[data-group="${group.name}"]`
                );

            const phoneInputs =
                document.querySelectorAll(
                    `.participant-phone[data-group="${group.name}"]`
                );

            participants.forEach(
                (participant, index) => {

                    /*
                       Supports the new format:
                       { name: "...", phone: "..." }

                       It also safely handles old test data
                       containing name strings only.
                    */

                    if (
                        typeof participant === "string"
                    ) {

                        if (nameInputs[index]) {
                            nameInputs[index].value =
                                participant;
                        }

                    } else {

                        if (nameInputs[index]) {

                            nameInputs[index].value =
                                participant.name || "";
                        }

                        if (phoneInputs[index]) {

                            phoneInputs[index].value =
                                participant.phone || "";
                        }
                    }
                }
            );

            nameInputs.forEach(input => {
                input.disabled = true;
            });

            phoneInputs.forEach(input => {
                input.disabled = true;
            });
        });

        registerBtn.textContent =
            "✓ Registered";

        registerBtn.disabled = true;

        updateCounter();

    } catch (error) {

        console.error(
            "Could not load registration:",
            error
        );

        alert(
            "The registration could not be loaded. Please refresh the page."
        );
    }
}


/* ==========================================
   VALIDATE AND SAVE
========================================== */

async function validateRegistration() {

    

    if (registerBtn.disabled) {
        return;
    }

    if (!registrationsOpen) {

    alert(
        registrationClosedMessage
    );

    return;
}

    let atLeastOneGroup = false;

    const registration = {};

    const enteredNames = new Set();

    for (const group of currentEvent.groups) {

        const nameInputs =
            document.querySelectorAll(
                `.participant-name[data-group="${group.name}"]`
            );

        const phoneInputs =
            document.querySelectorAll(
                `.participant-phone[data-group="${group.name}"]`
            );

        const participants = [];

        for (
            let index = 0;
            index < nameInputs.length;
            index++
        ) {

            const name = nameInputs[index]
                .value
                .trim()
                .replace(/\s+/g, " ");

            const rawPhone =
                phoneInputs[index].value.trim();

            const phone =
                normalisePhone(rawPhone);


            /*
               Completely blank row:
               ignore it.
            */

            if (
                name === "" &&
                rawPhone === ""
            ) {
                continue;
            }


            /*
               Name entered but phone missing.
            */

            if (
                name !== "" &&
                rawPhone === ""
            ) {

                alert(
                    `Please enter a phone number for ${name}.`
                );

                phoneInputs[index].focus();

                return;
            }


            /*
               Phone entered but name missing.
            */

            if (
                name === "" &&
                rawPhone !== ""
            ) {

                alert(
                    `Please enter the participant name corresponding to ${rawPhone}.`
                );

                nameInputs[index].focus();

                return;
            }


            /*
               Indian phone number:
               exactly 10 digits after removing
               spaces, hyphens and +91.
            */

            if (phone.length !== 10) {

                alert(
                    `${name}'s phone number must contain exactly 10 digits.`
                );

                phoneInputs[index].focus();

                return;
            }


            const normalisedName =
                name.toLowerCase();

            if (
                enteredNames.has(
                    normalisedName
                )
            ) {

                alert(
                    `${name} has been entered twice.`
                );

                nameInputs[index].focus();

                return;
            }

            enteredNames.add(
                normalisedName
            );

            participants.push({
                name: name,
                phone: phone
            });
        }


        /*
           No participant entered in this group.
           The group is treated as skipped.
        */

        if (participants.length === 0) {
            continue;
        }

        atLeastOneGroup = true;


        if (
            participants.length < group.min
        ) {

            alert(
                `${group.name} requires at least ${group.min} participants.`
            );

            return;
        }


        if (
            participants.length > group.max
        ) {

            alert(
                `${group.name} allows only ${group.max} participants.`
            );

            return;
        }


        registration[group.name] =
            participants;
    }


    if (!atLeastOneGroup) {

        alert(
            "Please register at least one team or group."
        );

        return;
    }


    const registrationReference = doc(
        db,
        "registrations",
        school.id,
        "events",
        currentEvent.id
    );


    try {

        registerBtn.disabled = true;

        registerBtn.textContent =
            "Submitting...";


        /*
           Check again before writing so an
           existing registration is not
           accidentally overwritten.
        */

        const existingSnapshot =
            await getDoc(
                registrationReference
            );

        if (existingSnapshot.exists()) {

            alert(
                "This school has already registered for this event."
            );

            registerBtn.textContent =
                "✓ Registered";

            return;
        }

        
        await setDoc(
            registrationReference,
            {
                registered: true,

                schoolId: school.id,

                schoolName: school.name,

                eventId: currentEvent.id,

                eventName: currentEvent.title,

                groups: registration,

                submittedAt:
                    serverTimestamp()
            }
        );


        window.location.replace(
            "event.html"
        );

    } catch (error) {

        console.error(
            "Registration failed:",
            error
        );

        registerBtn.disabled = false;

        registerBtn.textContent =
            "Register";

        alert(
            "The registration could not be submitted. Please try again."
        );
    }
}


/* ==========================================
   BUTTONS
========================================== */

document
    .querySelector(".dashboard-btn")
    .addEventListener("click", () => {

        window.location.href =
            "dashboard.html";
    });


document
    .querySelector(".logout-btn")
    .addEventListener(
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


registerBtn.addEventListener(
    "click",
    event => {

        event.preventDefault();

        validateRegistration();
    }
);


/* ==========================================
   INITIALISE PAGE
========================================== */

generateParticipantInputs();

document
    .querySelectorAll(".participant-input")
    .forEach(input => {

        input.addEventListener(
            "input",
            updateCounter
        );
    });

updateCounter();

async function initialiseEventPage() {

    await loadRegistrationSetting();

    await loadSavedRegistration();

    /*
       Do not replace the Registered state.
       Only disable new submissions.
    */

    if (
        !registrationsOpen &&
        !registerBtn.disabled
    ) {

        registerBtn.textContent =
            "Registrations Closed";

        registerBtn.disabled = true;
    }
}

initialiseEventPage();