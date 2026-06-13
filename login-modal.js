import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signOut, onAuthStateChanged, browserLocalPersistence, setPersistence, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCe1ryc5qIKE2GRzSv3xV-P6yIXCK_bNsg",
    authDomain: "spider-man-web.firebaseapp.com",
    projectId: "spider-man-web",
    storageBucket: "spider-man-web.appspot.com",
    messagingSenderId: "167500312977",
    appid: "1:167500312977:web:a634a1f5e2736381576a30",
    measurementId: "G-BBDC65THYH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Ulož pozici scrollu při otevření modálu
let savedScrollPosition = 0;

// Nastav persistenci, aby si Firebase pamatoval přihlášení
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.warn('Persistenci se nepodařilo nastavit:', error);
});

const loginModal = document.getElementById('login-modal');
const loginOpenButtons = document.querySelectorAll('.login-open');
const loginCloseButton = loginModal?.querySelector('.modal-close');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm'); 
const forgotPasswordLink = document.getElementById('forgot-password-link'); 
const emailInput = document.getElementById('email');
const hesloInput = document.getElementById('heslo');
const iconHeslo = document.getElementById('icon-heslo');
const rememberMe = document.getElementById('zapamatovat-si');
const successMessage = document.getElementById('success-message');
const successInfo = document.getElementById('success-info');
const switchAccount = document.getElementById('switch-account');
const openRegisterLinks = document.querySelectorAll('.open-register');
const openLoginLinks = document.querySelectorAll('.open-login-link');
const registerNameInput = document.getElementById('register-jmeno');
const registerEmailInput = document.getElementById('register-email');
const registerHesloInput = document.getElementById('register-heslo');
const registerHesloPotvrzeniInput = document.getElementById('register-heslo-potvrzeni');
const iconRegisterHeslo = document.getElementById('icon-register-heslo');
const iconRegisterHesloPotvrzeni = document.getElementById('icon-register-heslo-potvrzeni');
const registerSuccessMsg = document.getElementById('register-success-msg');
const registerErrorMsg = document.getElementById('register-error-msg');
const loginErrorMsg = document.getElementById('login-error-msg');

const okoOtevrene = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
const okoPreskrtnute = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`;

function togglePassword(input, icon) {
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = okoPreskrtnute;
    } else {
        input.type = 'password';
        icon.innerHTML = okoOtevrene;
    }
}

iconHeslo?.addEventListener('click', () => togglePassword(hesloInput, iconHeslo));
iconRegisterHeslo?.addEventListener('click', () => togglePassword(registerHesloInput, iconRegisterHeslo));
iconRegisterHesloPotvrzeni?.addEventListener('click', () => togglePassword(registerHesloPotvrzeniInput, iconRegisterHesloPotvrzeni));

function openModal(mode = 'login') {
    if (!loginModal) return;

    savedScrollPosition = window.scrollY || window.pageYOffset;
    loginModal.classList.add('active');
    
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, savedScrollPosition);

    const user = auth.currentUser;
    if (user) {
        showSignedIn(user);
    } else {
        if (mode === 'register') {
            showRegisterForm();
        } else if (mode === 'forgot') {
            showForgotPasswordForm();
        } else {
            showLoginForm();
        }
    }
}

function closeLoginModal() {
    if (!loginModal) return;
    loginModal.classList.remove('active');
    
    document.body.style.overflow = '';
    window.scrollTo(0, savedScrollPosition);
}

function showLoginForm() {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
}

function showRegisterForm() {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'none';
    if (successMessage) successMessage.style.display = 'none';
}

function showForgotPasswordForm() {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';
    if (forgotPasswordForm) forgotPasswordForm.style.display = 'block';
    if (successMessage) successMessage.style.display = 'none';
}

if (loginOpenButtons.length > 0) {
    loginOpenButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            openModal('login');
        });
    });
}

openRegisterLinks.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        openModal('register');
    });
});

openLoginLinks.forEach((button) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        openModal('login');
    });
});

// Zajištění funkčnosti odkazu "Zpět na přihlášení" uvnitř formuláře pro zapomenuté heslo
const backToLoginFromForgot = forgotPasswordForm?.querySelector('.open-login-link');
backToLoginFromForgot?.addEventListener('click', (event) => {
    event.preventDefault();
    openModal('login');
});

// Otevření formuláře zapomenutého hesla
forgotPasswordLink?.addEventListener('click', (event) => {
    event.preventDefault();
    openModal('forgot');
});

loginCloseButton?.addEventListener('click', closeLoginModal);
loginModal?.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        closeLoginModal();
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
});

// ==========================================
// GLOBÁLNÍ FUNKCE PRO SPRÁVU STAVU PŘIHLÁŠENÍ
// ==========================================
function showSignedIn(user) {
    if (!user) return;
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';
    
    const displayName = user.displayName || registerNameInput.value || user.email;
    if (successInfo) {
        successInfo.textContent = `Přihlášen jako ${displayName}`;
        
        // PŘIDÁNO: Nastavení zarovnání na střed
        successInfo.style.textAlign = 'center'; 
    }
    if (successMessage) successMessage.style.display = 'block';
}

function showLogin() {
    showLoginForm();
}

if (loginForm) {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedHeslo = localStorage.getItem('savedHeslo');

    if (savedEmail) {
        emailInput.value = savedEmail;
        if (rememberMe) rememberMe.checked = true;
    }

    if (savedHeslo) {
        hesloInput.value = savedHeslo;
    }
}

onAuthStateChanged(auth, (user) => {
  // Najdeme prvek ikony v navigační liště
  const loginIcon = document.getElementById('login-icon-img');

  if (user) {
    showSignedIn(user);
    // Pokud je uživatel přihlášený, nastavíme vyplněného panáčka
    if (loginIcon) {
      loginIcon.src = 'img/prihlaseni-logo.png'; 
    }
  } else {
    showLogin();
    // Pokud přihlášený není, nastavíme panáčka pouze s obrysem
    if (loginIcon) {
      loginIcon.src = 'img/logo-neprihlaseneho-uzivatele.png';
    }
  }
});

switchAccount?.addEventListener('click', async () => {
    await signOut(auth);
    closeLoginModal();
    showLogin();
});

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value;
        const heslo = hesloInput.value;

        // Schováme předchozí chybu před novým pokusem o přihlášení
        if (loginErrorMsg) {
            loginErrorMsg.style.display = 'none';
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, heslo);

            if (rememberMe?.checked) {
                localStorage.setItem('savedEmail', email);
                localStorage.setItem('savedHeslo', heslo);
            } else {
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('savedHeslo');
            }

            if (loginModal) {
                loginModal.classList.add('active');
            }
            showSignedIn(userCredential.user);
            
        } catch (error) {
            console.error(error);
            
            // Rozpoznání chyb z Firebase bez ošklivých alertů
            let textChyby = 'Chyba při přihlášení: ' + error.message;
            
            if (error.code === 'auth/user-not-found' || 
                error.code === 'auth/wrong-password' || 
                error.code === 'auth/invalid-credential') {
                textChyby = 'Neplatné přihlašovací údaje. Zkontroluj e-mail a heslo.';
            }

            // Vepíšeme chybu přímo do připraveného HTML odstavce a zobrazíme ho
            if (loginErrorMsg) {
                loginErrorMsg.textContent = textChyby;
                loginErrorMsg.style.display = 'block';
            }
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = registerNameInput.value;
        const email = registerEmailInput.value;
        const heslo = registerHesloInput.value;
        const hesloPotvrzeni = registerHesloPotvrzeniInput.value;

        // Skryjeme předchozí chybu i úspěšnou zprávu při novém pokusu
        if (registerErrorMsg) registerErrorMsg.style.display = 'none';
        if (registerSuccessMsg) registerSuccessMsg.style.display = 'none';

        // Kontrola shody hesel
        if (heslo !== hesloPotvrzeni) {
            if (registerErrorMsg) {
                registerErrorMsg.textContent = 'Hesla se neshodují.';
                registerErrorMsg.style.display = 'block';
            }
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, heslo);
            
            await updateProfile(userCredential.user, { displayName: name });
            await sendEmailVerification(userCredential.user);

            // Aktualizujeme UI, aby se hned ukázalo zadané jméno (trik z minula)
            showSignedIn(auth.currentUser);

            if (registerSuccessMsg) {
                registerSuccessMsg.textContent = 'Registrace proběhla úspěšně. Na e-mail jsme vám poslali ověřovací odkaz.';
                registerSuccessMsg.style.display = 'block';
            }
        } catch (error) {
            console.error(error);
            
            // Texty chyb podle kódu z Firebase
            let textChyby = 'Chyba registrace: ' + error.message;
            if (error.code === 'auth/email-already-in-use') {
                textChyby = 'Tento e-mail již používáme.';
            } else if (error.code === 'auth/weak-password') {
                textChyby = 'Heslo je příliš slabé. Použij alespoň 6 znaků.';
            }

            // Vepíšeme text chyby do nového HTML elementu a zviditelníme ho
            if (registerErrorMsg) {
                registerErrorMsg.textContent = textChyby;
                registerErrorMsg.style.display = 'block';
            }
        }
    });
}

// ==========================================
// OBSLUHA TLAČÍTEK FORMULÁŘE OBNOVY HESLA
// ==========================================
if (forgotPasswordForm) {
    const forgotEmailInput = document.getElementById('forgot-email');

    // Dynamické vytvoření textového pole pro zprávy, pokud v HTML neexistuje
    let forgotMessage = document.getElementById('forgot-message');
if (!forgotMessage && forgotEmailInput) {
    forgotMessage = document.createElement('p');
    forgotMessage.id = 'forgot-message'; // Vráceno ID
    forgotMessage.style.display = 'none'; // Vráceno počáteční skrytí
    forgotMessage.style.fontWeight = 'bold';
    
    // Tady už NENÍ ten řádek s fontFamily!
    
    // Vloží prvek rovnou pod e-mailový input
    forgotEmailInput.parentNode.insertBefore(forgotMessage, forgotEmailInput.nextSibling);
}

    // 1. Tlačítko POSLAT ODKAZ (Odeslání formuláře)
    forgotPasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const forgotEmail = forgotEmailInput.value;

        // Vynulujeme předchozí zprávu při novém pokusu
        if (forgotMessage) {
            forgotMessage.style.display = 'none';
        }

        try {
        await sendPasswordResetEmail(auth, forgotEmail);

        // ÚSPĚCH - Tmavě modrá zpráva
        if (forgotMessage) {
    forgotMessage.textContent = 'Odkaz pro obnovu hesla byl úspěšně odeslán na tvůj e-mail.';
    forgotMessage.style.color = '#114b98'; // Tmavě modrá barva
    forgotMessage.style.display = 'block'; // Zobrazení zprávy!
    
    // Nově přidané styly pro zarovnání a velikost
    forgotMessage.style.textAlign = 'center';
    forgotMessage.style.fontSize = '16px'; // Můžeš změnit např. na '0.9em'
}
        
        // OPRAVA: Vymažeme pouze text v políčku, abychom nespustili 'reset' event,
        // který by nám zprávu okamžitě zase schoval!
        forgotEmailInput.value = '';

    } catch (error) {
            console.error(error);
            
            // CHYBA - Červená zpráva
            if (forgotMessage) {
                forgotMessage.style.color = '#d32f2f'; // Výrazná červená
                forgotMessage.style.display = 'block';
                
                if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email') {
                    forgotMessage.textContent = 'Zadaná e-mailová adresa neexistuje nebo je v nesprávném formátu.';
                } else if (error.code === 'auth/api-key-not-valid') {
                    forgotMessage.textContent = 'Něco se pokazilo: API klíč k Firebase není platný.';
                } else {
                    forgotMessage.textContent = 'Něco se pokazilo: ' + error.message;
                }
            }
        }
    });

    // 2. Tlačítko SMAZAT VŠE (Odchycení reset eventu při manuálním kliknutí)
    forgotPasswordForm.addEventListener('reset', () => {
        if (forgotEmailInput) {
            forgotEmailInput.value = '';
        }
        // Skrytí zprávy pouze když uživatel klikne na smazat vše sám
        if (forgotMessage) {
            forgotMessage.style.display = 'none';
            forgotMessage.textContent = '';
        }
    });

    // 3. Skrytí zprávy, jakmile uživatel začne do políčka psát znovu
    forgotEmailInput?.addEventListener('input', () => {
        if (forgotMessage) {
            forgotMessage.style.display = 'none';
        }
    });
}
// ==========================================
// 4. INICIALIZACE SLIDERŮ PRO SCHOPNOSTI
// ==========================================
const wrappers = document.querySelectorAll(".slider-wrapper");

wrappers.forEach(function(wrapper) {
    const slider = wrapper.querySelector(".range-slider");
    const output = wrapper.querySelector(".slider-value");

    function updateSlider() {
        output.textContent = slider.value;
        const position = (slider.value / 10) * 160;
        output.style.left = position + "px";
    }

    if (slider && output) {
        slider.addEventListener("input", updateSlider);
        updateSlider();
    }
});

// ==========================================
// 5. KONTROLA PŘIHLÁŠENÍ PŘI ODESLÁNÍ HODNOCENÍ
// ==========================================
const hodnoceniForm = document.getElementById('hodnoceniForm');
const zpravaPrvek = document.getElementById('hodnoceni-zprava');

if (hodnoceniForm) {
    hodnoceniForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const user = auth.currentUser;

        if (!user) {
            zpravaPrvek.textContent = 'Pro odeslání hodnocení se musíš nejprve přihlásit!';
            zpravaPrvek.style.color = '#d32f2f';
            zpravaPrvek.style.display = 'block';
            return; 
        }
        const formData = new FormData(hodnoceniForm);
        try {
            const response = await fetch(hodnoceniForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                zpravaPrvek.textContent = 'Hodnocení bylo úspěšně odesláno!';
                zpravaPrvek.style.color = '#104b99';
                zpravaPrvek.style.display = 'block';
                
                // --- OPRAVA BUGU S POSUVNÍKY ---
                hodnoceniForm.reset(); 
                
                // Po resetu musíme ručně aktualizovat všechny slidery, 
                // aby se vizuálně vrátily do původního stavu
const vsechnySlidery = document.querySelectorAll('.range-slider');

vsechnySlidery.forEach(slider => {
    // Toto vyvolá událost 'input', na kterou už máš navázanou funkci updateSlider()
    slider.dispatchEvent(new Event('input'));
});;
                // --------------------------------
                
            } else {
                throw new Error('Chyba při odesílání');
            }
        } catch (error) {
            zpravaPrvek.textContent = 'Něco se pokazilo, zkus to znovu.';
            zpravaPrvek.style.display = 'block';
        }
    });
}