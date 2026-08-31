import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const form = document.getElementById("loginForm");
const error = document.getElementById("loginError");


form.addEventListener("submit", async event => {

    event.preventDefault();

    error.textContent = "";

    const username = document
        .getElementById("username")
        .value
        .trim()
        .toLowerCase();

    const password =
        document.getElementById("password").value;

    const internalEmail =
        `${username}@morpheus2026.com`;

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                internalEmail,
                password
            );

        const authUid =
            userCredential.user.uid;

        const schoolQuery = query(
            collection(db, "schools"),
            where("authUid", "==", authUid)
        );

        const snapshot =
            await getDocs(schoolQuery);

        if (snapshot.empty) {

            error.textContent =
                "No school profile is connected to this account.";

            return;
        }

        const schoolDocument =
            snapshot.docs[0];

        const schoolData =
            schoolDocument.data();

        const school = {
            id: schoolDocument.id,
            authUid: authUid,
            name: schoolData.name,
            username: schoolData.username
        };

        sessionStorage.setItem(
            "loggedInSchool",
            JSON.stringify(school)
        );

        window.location.href =
            "dashboard.html";

    } catch (firebaseError) {

        console.error(firebaseError);

        error.textContent =
            "Incorrect username or password.";

    }

});
const passwordInput =
    document.getElementById("password");

const passwordToggle =
    document.getElementById("passwordToggle");

passwordToggle?.addEventListener("click", () => {

    const passwordIsHidden =
        passwordInput.type === "password";

    passwordInput.type =
        passwordIsHidden
            ? "text"
            : "password";

    passwordToggle.classList.toggle(
        "password-visible",
        passwordIsHidden
    );

    passwordToggle.setAttribute(
        "aria-label",
        passwordIsHidden
            ? "Hide password"
            : "Show password"
    );

});