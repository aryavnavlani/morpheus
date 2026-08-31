/* ==========================================
   MORPHEUS VIII
   ADMIN PORTAL
========================================== */


import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


import {
    auth,
    db
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";



/* ==========================================
   ADMIN ACCESS
========================================== */

async function getAdminProfile(uid) {

    const adminReference = doc(
        db,
        "admins",
        uid
    );

    const adminSnapshot =
        await getDoc(adminReference);

    if (!adminSnapshot.exists()) {
        return null;
    }

    const adminData =
        adminSnapshot.data();

    if (adminData.role !== "admin") {
        return null;
    }

    return {
        uid,
        ...adminData
    };
}


/* ==========================================
   ADMIN LOGIN PAGE
========================================== */

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );

if (adminLoginForm) {

    const loginError =
        document.getElementById(
            "adminLoginError"
        );

    const loginButton =
        document.getElementById(
            "adminLoginBtn"
        );

    adminLoginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            loginError.textContent = "";

            const username =
                document
                    .getElementById(
                        "adminUsername"
                    )
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document.getElementById(
                    "adminPassword"
                ).value;

            const internalEmail =
                `${username}@morpheus-registration.com`;

            loginButton.disabled = true;

            loginButton.textContent =
                "Logging in...";

            try {

                const credentials =
                    await signInWithEmailAndPassword(
                        auth,
                        internalEmail,
                        password
                    );

                const adminProfile =
                    await getAdminProfile(
                        credentials.user.uid
                    );

                if (!adminProfile) {

                    await signOut(auth);

                    loginError.textContent =
                        "This account does not have administrator access.";

                    return;
                }

                sessionStorage.setItem(
                    "loggedInAdmin",
                    JSON.stringify(
                        adminProfile
                    )
                );

                window.location.href =
                    "admin-dashboard.html";

            } catch (error) {

                console.error(
                    "Admin login failed:",
                    error
                );

                loginError.textContent =
                    "Incorrect admin username or password.";

            } finally {

                loginButton.disabled = false;

                loginButton.textContent =
                    "Login";
            }
        }
    );
}


/* ==========================================
   ADMIN DASHBOARD ELEMENTS
========================================== */

const adminName =
    document.getElementById("adminName");

const schoolsList =
    document.getElementById("schoolsList");

const schoolRegistrationView =
    document.getElementById(
        "schoolRegistrationView"
    );

const schoolSearch =
    document.getElementById("schoolSearch");

const refreshButton =
    document.getElementById(
        "refreshAdminData"
    );

const totalSchoolsElement =
    document.getElementById("totalSchools");

const totalRegistrationsElement =
    document.getElementById(
        "totalRegistrations"
    );

const totalParticipantsElement =
    document.getElementById(
        "totalParticipants"
    );


let schoolsData = [];

let selectedSchoolId = null;

const exportRegistrationsButton =
    document.getElementById(
        "exportRegistrationsBtn"
    );


/* ==========================================
   SAFE HTML
========================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


const registrationStatusText =
    document.getElementById(
        "registrationStatusText"
    );

const toggleRegistrationsButton =
    document.getElementById(
        "toggleRegistrationsBtn"
    );

let registrationsOpen = true;

async function loadRegistrationSetting() {

    if (
        !registrationStatusText ||
        !toggleRegistrationsButton
    ) {
        return;
    }

    try {

        const settingSnapshot =
            await getDoc(
                doc(
                    db,
                    "settings",
                    "registration"
                )
            );

        if (!settingSnapshot.exists()) {

            registrationsOpen = true;

            await setDoc(
                doc(
                    db,
                    "settings",
                    "registration"
                ),
                {
                    isOpen: true,
                    message:
                        "Registrations are currently closed."
                }
            );

        } else {

            registrationsOpen =
                settingSnapshot.data()
                    .isOpen === true;
        }

        renderRegistrationSetting();

    } catch (error) {

        console.error(
            "Could not load registration setting:",
            error
        );

        registrationStatusText.textContent =
            "Unavailable";

        toggleRegistrationsButton.textContent =
            "Could Not Load";

        toggleRegistrationsButton.disabled =
            true;
    }
}


function renderRegistrationSetting() {

    registrationStatusText.textContent =
        registrationsOpen
            ? "OPEN"
            : "CLOSED";

    registrationStatusText.classList.toggle(
        "registration-status-open",
        registrationsOpen
    );

    registrationStatusText.classList.toggle(
        "registration-status-closed",
        !registrationsOpen
    );

    toggleRegistrationsButton.textContent =
        registrationsOpen
            ? "Close Registrations"
            : "Open Registrations";

    toggleRegistrationsButton.disabled =
        false;
}


async function toggleRegistrationSetting() {

    const newStatus =
        !registrationsOpen;

    const confirmationMessage =
        newStatus
            ? "Open registrations and allow schools to submit new entries?"
            : "Close registrations and stop all new school submissions?";

    if (!window.confirm(confirmationMessage)) {
        return;
    }

    toggleRegistrationsButton.disabled =
        true;

    toggleRegistrationsButton.textContent =
        "Updating...";

    try {

        await updateDoc(
            doc(
                db,
                "settings",
                "registration"
            ),
            {
                isOpen: newStatus,
                updatedAt:
                    serverTimestamp()
            }
        );

        registrationsOpen =
            newStatus;

        renderRegistrationSetting();

    } catch (error) {

        console.error(
            "Could not change registration status:",
            error
        );

        alert(
            "The registration status could not be changed."
        );

        renderRegistrationSetting();
    }
}

/* ==========================================
   FORMAT DATE
========================================== */

function formatTimestamp(timestamp) {

    if (!timestamp?.toDate) {
        return "Submission time unavailable";
    }

    return timestamp
        .toDate()
        .toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
        });
}


/* ==========================================
   COUNT PARTICIPANTS
========================================== */

function countParticipants(registration) {

    const groups =
        registration.groups || {};

    return Object
        .values(groups)
        .reduce(
            (total, participants) => {

                if (!Array.isArray(participants)) {
                    return total;
                }

                return total +
                    participants.length;
            },
            0
        );
}

function makeSafeSheetName(
    schoolName,
    usedSheetNames
) {

    /*
       Excel sheet names:
       - cannot contain \ / ? * [ ] :
       - cannot exceed 31 characters
    */

    let safeName = String(
        schoolName || "School"
    )
        .replace(/[\\/?*[\]:]/g, "")
        .trim()
        .slice(0, 31);

    if (!safeName) {
        safeName = "School";
    }

    let finalName = safeName;

    let counter = 2;

    while (
        usedSheetNames.has(
            finalName.toLowerCase()
        )
    ) {

        const suffix = ` (${counter})`;

        finalName =
            safeName
                .slice(
                    0,
                    31 - suffix.length
                )
            + suffix;

        counter++;
    }

    usedSheetNames.add(
        finalName.toLowerCase()
    );

    return finalName;
}


function getParticipantDetails(
    participant
) {

    if (
        typeof participant === "string"
    ) {

        return {
            name: participant,
            phone: ""
        };
    }

    return {
        name: participant?.name || "",
        phone: String(
            participant?.phone || ""
        )
    };
}

function exportRegistrationsToExcel() {

    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "The spreadsheet library did not load. Please refresh the page."
        );

        return;
    }


    /*
       Include only schools which have
       at least one registered event.
    */

    const schoolsWithRegistrations =
        schoolsData.filter(
            school =>
                school.registrations
                    .length > 0
        );


    if (
        schoolsWithRegistrations.length
        === 0
    ) {

        alert(
            "There are no registrations to export."
        );

        return;
    }


    const workbook =
        XLSX.utils.book_new();

    const usedSheetNames =
        new Set();


    schoolsWithRegistrations.forEach(
        school => {

            const rows = [];

            const merges = [];


            /*
               Main school heading
            */

            rows.push([
                school.name ||
                school.username ||
                school.id,
                "",
                ""
            ]);

            merges.push({
                s: {
                    r: rows.length - 1,
                    c: 0
                },

                e: {
                    r: rows.length - 1,
                    c: 2
                }
            });


            rows.push([
                "EVENT NAME",
                "STUDENT NAME",
                "PHONE NUMBER"
            ]);


            const registrations =
                [...school.registrations]
                    .sort(
                        (
                            firstRegistration,
                            secondRegistration
                        ) =>

                            (
                                firstRegistration
                                    .eventName ||
                                firstRegistration.id
                            ).localeCompare(
                                secondRegistration
                                    .eventName ||
                                secondRegistration.id
                            )
                    );


            registrations.forEach(
                registration => {

                    const eventName =
                        registration.eventName ||
                        registration.id;

                    const groups =
                        registration.groups || {};


                    Object.entries(groups)
                        .forEach(
                            (
                                [
                                    groupName,
                                    participants
                                ]
                            ) => {

                                if (
                                    !Array.isArray(
                                        participants
                                    )
                                    ||
                                    participants.length
                                        === 0
                                ) {
                                    return;
                                }


                                const firstParticipantRow =
                                    rows.length;


                                participants.forEach(
                                    (
                                        participant,
                                        index
                                    ) => {

                                        const details =
                                            getParticipantDetails(
                                                participant
                                            );

                                        const eventLabel =
                                            index === 0
                                                ? (
                                                    groupName
                                                        ? `${eventName} — ${groupName}`
                                                        : eventName
                                                )
                                                : "";

                                        rows.push([
                                            eventLabel,
                                            details.name,
                                            details.phone
                                        ]);
                                    }
                                );


                                const lastParticipantRow =
                                    rows.length - 1;


                                /*
                                   Merge the event/group
                                   name vertically when
                                   there is more than one
                                   participant.
                                */

                                if (
                                    lastParticipantRow >
                                    firstParticipantRow
                                ) {

                                    merges.push({
                                        s: {
                                            r:
                                                firstParticipantRow,
                                            c: 0
                                        },

                                        e: {
                                            r:
                                                lastParticipantRow,
                                            c: 0
                                        }
                                    });
                                }
                            }
                        );


                    /*
                       Blank line between events
                    */

                    rows.push([
                        "",
                        "",
                        ""
                    ]);
                }
            );


            /*
               Remove final blank row.
            */

            if (
                rows.length > 0 &&
                rows[rows.length - 1]
                    .every(
                        value => value === ""
                    )
            ) {

                rows.pop();
            }


            const worksheet =
                XLSX.utils.aoa_to_sheet(
                    rows
                );


            worksheet["!merges"] =
                merges;


            /*
               Column widths
            */

            worksheet["!cols"] = [
                {
                    wch: 38
                },
                {
                    wch: 28
                },
                {
                    wch: 18
                }
            ];


            /*
               Row heights
            */

            worksheet["!rows"] =
                rows.map(
                    (
                        row,
                        index
                    ) => ({

                        hpt:
                            index === 0
                                ? 28
                                : 20
                    })
                );


            /*
               Keep phone numbers as text.
            */

            const worksheetRange =
                XLSX.utils.decode_range(
                    worksheet["!ref"]
                );


            for (
                let row =
                    worksheetRange.s.r;

                row <=
                worksheetRange.e.r;

                row++
            ) {

                const phoneCellAddress =
                    XLSX.utils.encode_cell({
                        r: row,
                        c: 2
                    });

                const phoneCell =
                    worksheet[
                        phoneCellAddress
                    ];

                if (
                    phoneCell &&
                    phoneCell.v !==
                        "PHONE NUMBER"
                ) {

                    phoneCell.t = "s";

                    phoneCell.v =
                        String(
                            phoneCell.v || ""
                        );
                }
            }


            const sheetName =
                makeSafeSheetName(
                    school.name ||
                    school.username ||
                    school.id,
                    usedSheetNames
                );


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                sheetName
            );
        }
    );


    const exportDate =
        new Date()
            .toISOString()
            .slice(0, 10);


    XLSX.writeFile(
        workbook,
        `Morpheus-Registrations-${exportDate}.xlsx`,
        {
            compression: true
        }
    );
}

if (exportRegistrationsButton) {

    exportRegistrationsButton
        .addEventListener(
            "click",
            exportRegistrationsToExcel
        );
}

/* ==========================================
   LOAD ONE SCHOOL'S REGISTRATIONS
========================================== */

async function getSchoolRegistrations(
    schoolId
) {

    const registrationsReference =
        collection(
            db,
            "registrations",
            schoolId,
            "events"
        );

    const snapshot =
        await getDocs(
            registrationsReference
        );

    return snapshot.docs.map(
        registrationDocument => ({
            id: registrationDocument.id,
            ...registrationDocument.data()
        })
    );
}


/* ==========================================
   LOAD ALL ADMIN DATA
========================================== */

async function loadAdminData() {

    if (!schoolsList) {
        return;
    }

    schoolsList.innerHTML = `
        <p class="admin-loading">
            Loading schools...
        </p>
    `;

    try {

        const schoolsSnapshot =
            await getDocs(
                collection(db, "schools")
            );

        const schoolProfiles =
            schoolsSnapshot.docs.map(
                schoolDocument => ({
                    id: schoolDocument.id,
                    ...schoolDocument.data()
                })
            );

        schoolProfiles.sort(
    (firstSchool, secondSchool) => {

        const firstName =
            firstSchool.name ||
            firstSchool.username ||
            firstSchool.id;

        const secondName =
            secondSchool.name ||
            secondSchool.username ||
            secondSchool.id;

        return firstName.localeCompare(
            secondName
        );
    }
);

        schoolsData =
            await Promise.all(

                schoolProfiles.map(
                    async school => {

                        const registrations =
                            await getSchoolRegistrations(
                                school.id
                            );

                        return {
                            ...school,
                            registrations
                        };
                    }
                )
            );

        renderSchoolsList();

        updateAdminStatistics();

        if (selectedSchoolId) {

            const selectedSchool =
                schoolsData.find(
                    school =>
                        school.id ===
                        selectedSchoolId
                );

            if (selectedSchool) {

                renderSchoolRegistrations(
                    selectedSchool
                );
            }
        }

    } catch (error) {

        console.error(
            "Could not load admin data:",
            error
        );

        schoolsList.innerHTML = `
            <p class="admin-error">
                Could not load school registrations.
            </p>
        `;
    }
}


/* ==========================================
   ADMIN STATISTICS
========================================== */

function updateAdminStatistics() {

    const registrationCount =
        schoolsData.reduce(
            (total, school) =>
                total +
                school.registrations.length,
            0
        );

    const participantCount =
        schoolsData.reduce(
            (schoolTotal, school) => {

                const schoolParticipants =
                    school.registrations.reduce(
                        (
                            registrationTotal,
                            registration
                        ) =>
                            registrationTotal +
                            countParticipants(
                                registration
                            ),
                        0
                    );

                return schoolTotal +
                    schoolParticipants;
            },
            0
        );

    totalSchoolsElement.textContent =
        schoolsData.length;

    totalRegistrationsElement.textContent =
        registrationCount;

    totalParticipantsElement.textContent =
        participantCount;
}


/* ==========================================
   SCHOOL LIST
========================================== */

function renderSchoolsList() {

    const searchTerm =
        schoolSearch
            ?.value
            .trim()
            .toLowerCase() || "";

    const filteredSchools =
        schoolsData.filter(
            school =>
                (
    school.name ||
    school.username ||
    school.id
)
    .toLowerCase()
    .includes(searchTerm)   
                ||
                school.username
                    ?.toLowerCase()
                    .includes(searchTerm)
        );

    schoolsList.innerHTML = "";

    if (filteredSchools.length === 0) {

        schoolsList.innerHTML = `
            <p class="admin-empty-message">
                No schools found.
            </p>
        `;

        return;
    }

    filteredSchools.forEach(school => {

        const schoolButton =
            document.createElement("button");

        schoolButton.type = "button";

        schoolButton.className =
            "admin-school-item";

        if (
            school.id === selectedSchoolId
        ) {
            schoolButton.classList.add(
                "active"
            );
        }

        schoolButton.innerHTML = `
            <span class="admin-school-name">
                ${escapeHTML(school.name)}
            </span>

            <span class="admin-school-count">
                ${
                    school.registrations.length
                }
                event${
                    school.registrations.length === 1
                        ? ""
                        : "s"
                }
            </span>
        `;

        schoolButton.addEventListener(
            "click",
            () => {

                selectedSchoolId =
                    school.id;

                renderSchoolsList();

                renderSchoolRegistrations(
                    school
                );
            }
        );

        schoolsList.appendChild(
            schoolButton
        );
    });
}


/* ==========================================
   SCHOOL REGISTRATION VIEW
========================================== */

function renderSchoolRegistrations(school) {

    const registrations =
        [...school.registrations].sort(
            (firstEvent, secondEvent) =>

                (
                    firstEvent.eventName ||
                    firstEvent.id
                ).localeCompare(
                    secondEvent.eventName ||
                    secondEvent.id
                )
        );

    let registrationsHTML = "";

    if (registrations.length === 0) {

        registrationsHTML = `
            <div class="admin-empty-state">

                <h3>
                    No registrations yet
                </h3>

                <p>
                    This school has not registered for any events.
                </p>

            </div>
        `;

    } else {

        registrationsHTML =
            registrations
                .map(
                    registration =>
                        buildRegistrationHTML(
                            registration
                        )
                )
                .join("");
    }

    schoolRegistrationView.innerHTML = `
        <div class="admin-school-header">

            <div>

                <p class="admin-section-label">
                    School
                </p>

                <h2>
                    ${escapeHTML(
    school.name ||
    school.username ||
    school.id
)}
                </h2>

                <p>
                    Username:
                    ${escapeHTML(
                        school.username
                    )}
                </p>

            </div>

            <div class="admin-school-summary">

                <strong>
                    ${registrations.length}
                </strong>

                <span>
                    Registered Event${
                        registrations.length === 1
                            ? ""
                            : "s"
                    }
                </span>

            </div>

        </div>

        <div class="admin-registration-list">
            ${registrationsHTML}
        </div>
    `;
}


/* ==========================================
   INDIVIDUAL EVENT REGISTRATION
========================================== */

function buildRegistrationHTML(registration) {

    const groups =
        registration.groups || {};

    const groupHTML =
        Object.entries(groups)
            .map(([groupName, participants]) => {

                const participantRows =
                    participants
                        .map((participant, index) => {

                            const participantName =
                                typeof participant === "string"
                                    ? participant
                                    : participant.name || "";

                            const participantPhone =
                                typeof participant === "string"
                                    ? ""
                                    : participant.phone || "";

                            return `
                                <tr
                                    data-group="${escapeHTML(groupName)}"
                                    data-index="${index}"
                                >

                                    <td>
                                        ${index + 1}
                                    </td>

                                    <td>
                                        <input
                                            type="text"
                                            class="admin-edit-name"
                                            value="${escapeHTML(participantName)}"
                                            disabled
                                        >
                                    </td>

                                    <td>
                                        <input
                                            type="tel"
                                            class="admin-edit-phone"
                                            value="${escapeHTML(participantPhone)}"
                                            inputmode="numeric"
                                            disabled
                                        >
                                    </td>

                                </tr>
                            `;
                        })
                        .join("");

                return `
                    <div
                        class="admin-group-section"
                        data-group-name="${escapeHTML(groupName)}"
                    >

                        <h4>
                            ${escapeHTML(groupName)}
                        </h4>

                        <div class="admin-table-wrapper">

                            <table class="admin-participant-table">

                                <thead>

                                    <tr>
                                        <th>#</th>
                                        <th>Student Name</th>
                                        <th>Phone Number</th>
                                    </tr>

                                </thead>

                                <tbody>
                                    ${participantRows}
                                </tbody>

                            </table>

                        </div>

                    </div>
                `;
            })
            .join("");

    const participantCount =
        countParticipants(registration);

    return `
        <article
            class="admin-registration-card"
            data-event-id="${escapeHTML(registration.id)}"
        >

            <div class="admin-registration-heading">

                <div>

                    <h3>
                        ${escapeHTML(
                            registration.eventName ||
                            registration.id
                        )}
                    </h3>

                    <p>
                        ${formatTimestamp(
                            registration.submittedAt
                        )}
                    </p>

                </div>

                <span class="admin-participant-count">

                    ${participantCount}
                    participant${
                        participantCount === 1
                            ? ""
                            : "s"
                    }

                </span>

            </div>

            ${groupHTML}

            <div class="admin-registration-actions">

    <button
        type="button"
        class="admin-btn admin-btn-secondary admin-edit-registration"
    >
        Edit
    </button>

    <button
        type="button"
        class="admin-btn admin-btn-primary admin-save-registration"
        hidden
    >
        Save Changes
    </button>

    <button
        type="button"
        class="admin-btn admin-btn-secondary admin-cancel-edit"
        hidden
    >
        Cancel
    </button>

    <button
        type="button"
        class="admin-btn admin-btn-danger admin-reset-registration"
    >
        Reset Registration
    </button>

</div>

        </article>
    `;
}

function normalisePhone(phone) {

    let digits =
        phone.replace(/\D/g, "");

    if (
        digits.length === 12 &&
        digits.startsWith("91")
    ) {
        digits = digits.slice(2);
    }

    return digits;
}


function enableRegistrationEditing(card) {

    card.querySelectorAll(
        ".admin-edit-name, .admin-edit-phone"
    ).forEach(input => {

        input.disabled = false;
    });

    card.querySelector(
        ".admin-edit-registration"
    ).hidden = true;

    card.querySelector(
        ".admin-save-registration"
    ).hidden = false;

    card.querySelector(
        ".admin-cancel-edit"
    ).hidden = false;
}


async function saveRegistrationChanges(card) {

    const eventId =
        card.dataset.eventId;

    const updatedGroups = {};

    const enteredNames =
        new Set();

    const groupSections =
        card.querySelectorAll(
            ".admin-group-section"
        );

    for (const groupSection of groupSections) {

        const groupName =
            groupSection.dataset.groupName;

        const participants = [];

        const rows =
            groupSection.querySelectorAll(
                "tbody tr"
            );

        for (const row of rows) {

            const nameInput =
                row.querySelector(
                    ".admin-edit-name"
                );

            const phoneInput =
                row.querySelector(
                    ".admin-edit-phone"
                );

            const name =
                nameInput.value
                    .trim()
                    .replace(/\s+/g, " ");

            const rawPhone =
                phoneInput.value.trim();

            const phone =
                normalisePhone(rawPhone);


            if (
                name === "" &&
                rawPhone === ""
            ) {
                continue;
            }

            if (name === "") {

                alert(
                    `Please enter the student name in ${groupName}.`
                );

                nameInput.focus();

                return;
            }

            if (rawPhone === "") {

                alert(
                    `Please enter a phone number for ${name}.`
                );

                phoneInput.focus();

                return;
            }

            if (phone.length !== 10) {

                alert(
                    `${name}'s phone number must contain exactly 10 digits.`
                );

                phoneInput.focus();

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

                nameInput.focus();

                return;
            }

            enteredNames.add(
                normalisedName
            );

            participants.push({
                name,
                phone
            });
        }

        if (participants.length > 0) {

            updatedGroups[groupName] =
                participants;
        }
    }

    if (
        Object.keys(updatedGroups).length === 0
    ) {

        alert(
            "A registration must contain at least one participant."
        );

        return;
    }

    const saveButton =
        card.querySelector(
            ".admin-save-registration"
        );

    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";

    try {

        await updateDoc(
            doc(
                db,
                "registrations",
                selectedSchoolId,
                "events",
                eventId
            ),
            {
                groups: updatedGroups,
                lastEditedAt:
                    serverTimestamp()
            }
        );

        await loadAdminData();

    } catch (error) {

        console.error(
            "Could not update registration:",
            error
        );

        alert(
            "The registration could not be updated."
        );

        saveButton.disabled = false;

        saveButton.textContent =
            "Save Changes";
    }
}


async function resetRegistration(card) {

    const eventId =
        card.dataset.eventId;

    const eventTitle =
        card.querySelector("h3")
            ?.textContent
            .trim() || eventId;

    const confirmed =
        window.confirm(
            `Reset ${eventTitle} for this school?\n\nThis permanently deletes the registration and allows the school to register again.`
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "registrations",
                selectedSchoolId,
                "events",
                eventId
            )
        );

        await loadAdminData();

    } catch (error) {

        console.error(
            "Could not reset registration:",
            error
        );

        alert(
            "The registration could not be reset."
        );
    }
}

if (schoolRegistrationView) {

    schoolRegistrationView.addEventListener(
        "click",
        event => {

            const card =
                event.target.closest(
                    ".admin-registration-card"
                );

            if (!card) {
                return;
            }

            if (
                event.target.closest(
                    ".admin-edit-registration"
                )
            ) {

                enableRegistrationEditing(
                    card
                );

                return;
            }

            if (
                event.target.closest(
                    ".admin-save-registration"
                )
            ) {

                saveRegistrationChanges(
                    card
                );

                return;
            }

            if (
                event.target.closest(
                    ".admin-cancel-edit"
                )
            ) {

                const selectedSchool =
                    schoolsData.find(
                        school =>
                            school.id ===
                            selectedSchoolId
                    );

                if (selectedSchool) {

                    renderSchoolRegistrations(
                        selectedSchool
                    );
                }

                return;
            }

            if (
                event.target.closest(
                    ".admin-reset-registration"
                )
            ) {

                resetRegistration(card);
            }
        }
    );
}


/* ==========================================
   SEARCH AND REFRESH
========================================== */

if (schoolSearch) {

    schoolSearch.addEventListener(
        "input",
        renderSchoolsList
    );
}

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadAdminData
    );
}


/* ==========================================
   ADMIN DASHBOARD AUTHENTICATION
========================================== */

if (adminName) {

    onAuthStateChanged(
        auth,
        async user => {

            if (!user) {

                sessionStorage.removeItem(
                    "loggedInAdmin"
                );

                window.location.href =
                    "admin-login.html";

                return;
            }

            try {

                const adminProfile =
                    await getAdminProfile(
                        user.uid
                    );

                if (!adminProfile) {

                    await signOut(auth);

                    sessionStorage.removeItem(
                        "loggedInAdmin"
                    );

                    window.location.href =
                        "admin-login.html";

                    return;
                }

                adminName.textContent =
                    adminProfile.name ||
                    "Morpheus Administrator";

                sessionStorage.setItem(
                    "loggedInAdmin",
                    JSON.stringify(
                        adminProfile
                    )
                );

                await Promise.all([
    loadAdminData(),
    loadRegistrationSetting()
]);

if (toggleRegistrationsButton) {

    toggleRegistrationsButton.addEventListener(
        "click",
        toggleRegistrationSetting
    );
}


            } catch (error) {

                console.error(
                    "Could not verify admin:",
                    error
                );

                await signOut(auth);

                window.location.href =
                    "admin-login.html";
            }
        }
    );
}





/* ==========================================
   ADMIN LOGOUT
========================================== */

const adminLogoutButton =
    document.getElementById(
        "adminLogoutBtn"
    );

if (adminLogoutButton) {

    adminLogoutButton.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);

            } catch (error) {

                console.error(
                    "Admin logout failed:",
                    error
                );

            } finally {

                sessionStorage.removeItem(
                    "loggedInAdmin"
                );

                sessionStorage.removeItem(
                    "selectedEvent"
                );

                window.location.href =
                    "admin-login.html";
            }
        }
    );
}
