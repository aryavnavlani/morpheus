import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { getAuth }
    from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";


const firebaseConfig = {

    apiKey: "AIzaSyAZ5O1vZVTnXwp0aEBntKeXfnaGzNwVmLc",

    authDomain: "morpheus-registration.firebaseapp.com",

    projectId: "morpheus-registration",

    storageBucket:
        "morpheus-registration.firebasestorage.app",

    messagingSenderId: "97543305425",

    appId:
        "1:97543305425:web:6d9c5e1b46cdbaed3b2df0"

};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);