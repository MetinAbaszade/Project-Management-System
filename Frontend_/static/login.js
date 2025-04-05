const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');


registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});


loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});



document.addEventListener("DOMContentLoaded", function () {
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const sendCodeBtn = document.getElementById("send-code");
    const verifyCodeBtn = document.getElementById("verify-code");

    const container = document.querySelector(".container");
    const loginForm = document.querySelector(".form-box.login");
    const forgotForm = document.querySelector(".form-box.forgot-password");
    const otpForm = document.querySelector(".form-box.register-otp");

    const emailInput = document.getElementById("forgot-email");
    const emailDisplay = document.getElementById("register-email-display");

    if (!forgotForm || !emailInput || !sendCodeBtn) {
        console.error("Forgot password form or elements not found!");
        return;
    }

    // 🔹 Show forgot form
    forgotPasswordLink.addEventListener("click", function (e) {
        e.preventDefault();
        loginForm.classList.add("hidden");
        container.classList.add("no-blue");
        setTimeout(() => {
            forgotForm.classList.add("active");
        }, 300);
    });

    // 🔹 Handle Continue (Send Code)
    sendCodeBtn.addEventListener("click", function (e) {
        e.preventDefault();

        const emailValue = emailInput.value.trim();
        let valid = true;

        resetInput(emailInput, "Email");

        if (emailValue === '') {
            setError(emailInput, 'Email is required');
            valid = false;
        } else if (!isValidEmail(emailValue)) {
            setError(emailInput, 'Provide a valid email address');
            valid = false;
        } else {
            setSuccess(emailInput);
        }

        if (!valid) return;

        // ✅ Transition to OTP screen
        emailDisplay.textContent = emailValue;
        forgotForm.classList.remove("active");

        setTimeout(() => {
            otpForm.classList.add("active");
        }, 300);
    });

    // 🔹 Handle OTP verification (optional logic)
    verifyCodeBtn?.addEventListener("click", function () {
        const authCode = document.getElementById("register-otp-code").value.trim();
        if (authCode.length === 6) {
            alert("Verification successful! Redirecting...");
        } else {
            alert("Please enter a valid 6-digit code.");
        }
    });

    // ✅ Reuse login-style helpers
    function setError(element, message) {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    }

    function setSuccess(element) {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
        errorDisplay.innerText = '';
        inputControl.classList.add('success');
        inputControl.classList.remove('error');
    }

    function resetInput(element, placeholderText) {
        element.placeholder = placeholderText;
        setSuccess(element);
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    }
});





document.addEventListener("DOMContentLoaded", function () {
    const registerBtn = document.getElementById("register-btn");
    const registerVerifyBtn = document.getElementById("register-verify-btn");

    const backToEmailBtn = document.getElementById("back-to-email");

    const container = document.querySelector(".container");
    const registerForm = document.querySelector(".form-box.register");
    const registerOtpForm = document.querySelector(".form-box.register-otp");
    const loginForm = document.querySelector(".form-box.login"); // Get login form
    const registerEmailInput = document.getElementById("register-email");
    const registerEmailDisplay = document.getElementById("register-email-display");

    // Click "Register" -> Hide login, hide register form, show OTP verification
    registerBtn.addEventListener("click", function () {
        const email = registerEmailInput.value.trim();

        if (email === "") {
            alert("Please enter a valid email address.");
            return;
        }

        registerEmailDisplay.textContent = email;

        // 🔥 Instantly hide login form to prevent it from appearing
        loginForm.style.display = "none";
        registerForm.style.display = "none"; // Hide Register form
        container.classList.add("no-blue"); // Hide blue section

        // Show OTP form with no flickering
        setTimeout(() => {
            registerOtpForm.style.display = "flex"; // Make OTP form visible
            registerOtpForm.classList.add("active");
        }, 50); // Short delay to ensure smooth transition
    });
    
    
    // Click "Verify" -> Check OTP for Registration
    registerVerifyBtn.addEventListener("click", function () {
        const authCode = document.getElementById("otp-code").value.trim();

        if (authCode.length === 6) {
            alert("Registration successful! Redirecting to dashboard...");
            // Redirect or proceed with further steps
        } else {
            alert("Please enter a valid 6-digit code.");
        }
    });
});




/Going to verify part STARTS/
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".container");

    // BUTTONS
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const sendCodeBtn = document.getElementById("send-code");
    const registerBtn = document.getElementById("register-btn");
    const verifyCodeBtn = document.getElementById("register-verify-btn");

    // FORMS

    const forgotForm = document.querySelector(".form-box.forgot-password");
    const registerForm = document.querySelector(".form-box.register");
    const otpForm = document.querySelector(".form-box.register-otp"); // ✅ SINGLE OTP FORM
    const newPasswordForm = document.querySelector(".form-box.new-password");

    // EMAIL INPUT FIELDS
    const emailInput = document.getElementById("forgot-email");
    const registerEmailInput = document.getElementById("register-email");
    const emailDisplay = document.getElementById("register-email-display"); // ✅ SINGLE EMAIL DISPLAY

    // OTP INPUT FIELDS
    const otpInputs = document.querySelectorAll(".otp-input-container input");

    const backToEmailBtn = document.getElementById("back-to-email");

    backToEmailBtn.addEventListener("click", function (e) {
        e.preventDefault();
    
        const forgotForm = document.querySelector(".form-box.forgot-password");
        const registerForm = document.querySelector(".form-box.register");
        const otpForm = document.querySelector(".form-box.register-otp");
    
        // Hide OTP form smoothly
        hideFormSmoothly(otpForm);
    
        setTimeout(() => {
            if (sessionStorage.getItem("cameFromForgot")) {
                // If user originally clicked "Continue" in forgot password, go back to Forgot Password Form
                forgotForm.classList.remove("hidden");
                forgotForm.classList.add("active");
            } else {
                // If user originally clicked "Register", go back to Register Form
                registerForm.classList.remove("hidden");
                registerForm.classList.add("active");
    
                // 🛠 Ensure visibility is reset (Fixes blank screen issue)
                registerForm.style.display = "block"; // Ensure it's visible
            }
        }, 600);
    });
    
    


    // Function to hide form smoothly
    function hideFormSmoothly(form) {
            form.classList.remove("active"); // Start fade-out
            setTimeout(() => {
                form.classList.add("hidden"); // Hide completely after fade-out
            }, 900); // Match CSS transition duration (600ms)
        }

    /** FUNCTION: Show OTP Form for BOTH Forgot Password & Register */
    function showOtpForm(email) {
        emailDisplay.textContent = email;
        
        hideFormSmoothly(forgotForm);
        setTimeout(() => {

            
            // Show OTP form smoothly
            registerOtpForm.classList.remove("hidden");
            setTimeout(() => {
                registerOtpForm.classList.add("active");
            }, 50); // Delay for transition smoothness
        }, 600);
    }

    /** CLICK EVENT: Forgot Password "Continue" Button */
    sendCodeBtn.addEventListener("click", function () {
        const email = emailInput.value.trim();
        if (email === "") {
            alert("Please enter a valid email address.");
            return;
        }
        showOtpForm(email); // ✅ Same OTP screen
    });




    /** CLICK EVENT: Register "Register" Button */
    registerBtn.addEventListener("click", function () {
        const email = registerEmailInput.value.trim();
        if (email === "") {
            alert("Please enter a valid email address.");
            return;
        }
        showOtpForm(email); // ✅ Same OTP screen
    });


    /** CLICK EVENT: OTP Input Validation (Only Numbers) */
    otpInputs.forEach((input, index) => {
        input.setAttribute("inputmode", "numeric"); // ✅ Mobile keyboard will show numbers

        input.addEventListener("input", (e) => {
            if (!/^[0-9]$/.test(e.target.value)) {
                e.target.value = ""; // ✅ Only allow numbers
            }

            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus(); // Move to next input
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && index > 0 && e.target.value === "") {
                otpInputs[index - 1].focus(); // Move back to previous input
            }
        });
    });

    /** CLICK EVENT: Verify OTP Code */
    verifyCodeBtn.addEventListener("click", function () {
        let otpCode = "";

        otpInputs.forEach(input => {
            otpCode += input.value.trim();
        });

        if (otpCode.length === 6) { // ✅ Check if OTP is complete
            alert("Verification successful! Redirecting to reset password...");
            otpForm.classList.add("hidden");
            setTimeout(() => {
                newPasswordForm.classList.remove("hidden");
                newPasswordForm.classList.add("active");
            }, 300);
        } else {
            alert("Please enter a valid 6-digit code.");
        }
    });
});

/Going to verify part ENDS/





document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".container");
    
    // BUTTONS
    const sendCodeBtn = document.getElementById("send-code");
    const registerBtn = document.getElementById("register-btn");
    const verifyForgotOtpBtn = document.getElementById("verify-forgot-otp-btn");
    const verifyRegisterOtpBtn = document.getElementById("verify-register-otp-btn");
    const setPasswordBtn = document.getElementById("set-password-btn");
    const completeRegBtn = document.getElementById("complete-registration-btn");

    // FORMS
    const forgotForm = document.querySelector(".form-box.forgot-password");
    const registerForm = document.querySelector(".form-box.register");
    const otpForm = document.querySelector(".form-box.register-otp");
    const newPasswordForm = document.querySelector(".form-box.new-password");
    const registrationForm = document.querySelector(".form-box.registration-form");

    // EMAIL INPUT FIELDS
    const emailInput = document.getElementById("forgot-email");
    const registerEmailInput = document.getElementById("register-email");
    const emailDisplay = document.getElementById("register-email-display");

    // OTP INPUT FIELDS
    const otpInputs = document.querySelectorAll(".otp-input-container input");

    // Function to Hide Forms Smoothly
    function hideFormSmoothly(form) {
        form.classList.remove("active");
        setTimeout(() => {
            form.classList.add("hidden");
        }, 600);
    }

    // Function to Show OTP Form and Set Correct Button
    function showOtpForm(email, type) {
        emailDisplay.textContent = email;
        hideFormSmoothly(forgotForm);
        hideFormSmoothly(registerForm);

        // Show OTP form
        setTimeout(() => {
            otpForm.classList.remove("hidden");
            otpForm.classList.add("active");

            // Hide both buttons first
            document.getElementById("back-to-email").classList.add("hidden");
            document.getElementById("back-to-main").classList.add("hidden");
            document.getElementById("verify-register-otp-btn").classList.add("hidden");
            document.getElementById("verify-forgot-otp-btn").classList.add("hidden");

            // Show the correct button
            if (type === "forgot-password") {
                document.getElementById("back-to-email").classList.remove("hidden");
            } else if (type === "register") {
                document.getElementById("back-to-main").classList.remove("hidden");
            }
            if (type === "forgot-password") {
                document.getElementById("verify-forgot-otp-btn").classList.remove("hidden");
            } else if (type === "register") {
                document.getElementById("verify-register-otp-btn").classList.remove("hidden");
            }
        }, 600);
    }

    // Click "Continue" (Forgot Password)
    sendCodeBtn.addEventListener("click", function () {
        const email = emailInput.value.trim();
        if (email === "") {
            alert("Please enter a valid email address.");
            return;
        }
        showOtpForm(email, "forgot-password");
    });

    // Click "Register" (Start Registration)
    registerBtn.addEventListener("click", function () {
        const email = registerEmailInput.value.trim();
        if (email === "") {
            alert("Please enter a valid email address.");
            return;
        }
        showOtpForm(email, "register");
    });

    // OTP Validation
    otpInputs.forEach((input, index) => {
        input.setAttribute("inputmode", "numeric");
        input.addEventListener("input", (e) => {
            if (!/^[0-9]$/.test(e.target.value)) {
                e.target.value = "";
            }
            if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && index > 0 && e.target.value === "") {
                otpInputs[index - 1].focus();
            }
        });
    });

    // Click "Verify" in Forgot Password OTP (SHOW NEW PASSWORD FORM)
    verifyForgotOtpBtn.addEventListener("click", function () {
        let otpCode = "";
        otpInputs.forEach(input => {
            otpCode += input.value.trim();
        });

        if (otpCode.length === 6) {
            hideFormSmoothly(otpForm);
            setTimeout(() => {
                newPasswordForm.classList.remove("hidden");
                newPasswordForm.classList.add("active");
            }, 600);
        } else {
            alert("Please enter a valid 6-digit code.");
        }
    });

    document.getElementById("back-to-email").addEventListener("click", function (e) {
        e.preventDefault();
    
        const forgotForm = document.querySelector(".form-box.forgot-password");
        const otpForm = document.querySelector(".form-box.register-otp");
    
        // Hide OTP Form
        otpForm.classList.remove("active");
        setTimeout(() => {
            otpForm.classList.add("hidden");
    
            // Show the Forgot Password email input form
            forgotForm.classList.remove("hidden");
            setTimeout(() => {
                forgotForm.classList.add("active");
            }, 50);
        }, 300);
    });

    document.getElementById("back-to-main").addEventListener("click", function (e) {
        e.preventDefault();
    
        const container = document.querySelector(".container");
        const otpForm = document.querySelector(".form-box.register-otp");
    
        // ✅ Start fade-out effect
        otpForm.classList.remove("active");
    
        // ✅ Set flag before reload
        sessionStorage.setItem("goToRegister", "true");
    
        // ✅ Wait for the fade-out to finish (adjust timing if needed)
        setTimeout(() => {
            window.location.reload();
        }, 300); // match your CSS transition duration
    });
    
    
    // Click "Verify" in Registration OTP (SHOW REGISTRATION FORM)
    verifyRegisterOtpBtn.addEventListener("click", function () {
        let otpCode = "";
        otpInputs.forEach(input => {
            otpCode += input.value.trim();
        });

        if (otpCode.length === 6) {
            hideFormSmoothly(otpForm);
            setTimeout(() => {
                registrationForm.classList.remove("hidden");
                registrationForm.classList.add("active");
            }, 600);
        } else {
            alert("Please enter a valid 6-digit code.");
        }
    });

    // Click "Set Password" (After Forgot Password OTP)
    setPasswordBtn.addEventListener("click", async function () {
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        const email = document.getElementById("register-email-display").textContent.trim(); 

        if (!newPassword || !confirmPassword) {
            alert("Please enter your new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    new_password: newPassword
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.detail || "Password reset failed.");
            }
    
            alert("✅ Password successfully reset! Redirecting to login...");
    
            // ✅ UI transitions (keep your logic)
            newPasswordForm.classList.remove("active");
            otpForm.classList.remove("active");
            registerForm.classList.remove("active");
    
            setTimeout(() => {
                loginForm.classList.add("active");
                container.classList.remove("active"); // Restore blue section
            }, 900);
    
            setTimeout(() => {
                window.location.href = "login.html"; // Redirect to login page
            }, 900);
            
        } catch (error) {
            console.error("Reset error:", error);
            alert("🚫 " + error.message);
        }
    });

        // Click "Complete Registration" (Return to Login)
        completeRegBtn.addEventListener("click", function () {
        const password = document.getElementById("register-password").value.trim();
        const confirmPassword = document.getElementById("confirm-register-password").value.trim();

            
        if (password === "" || confirmPassword === "") {
            alert("Please enter your new password.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

            alert("Registration successful! Redirecting to login...");
    
            // Hide Registration form smoothly
            hideFormSmoothly(registrationForm);
    
            // Show Login form with smooth transition
            setTimeout(() => {
                document.querySelector(".form-box.login").classList.remove("hidden");
                document.querySelector(".form-box.login").classList.add("active");
                container.classList.remove("active"); // Restore blue section
            }, 900); // Smooth transition timing
    
            // Refresh the page to reset all states (optional)
            setTimeout(() => {
                window.location.reload();
            }, 900); // Speed optimized for a clean restart
        });

});

document.getElementById("send-code").addEventListener("click", function () {
    const emailInput = document.getElementById("forgot-email").value.trim();

    // Regular expression for validating an Email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(emailInput)) {
        alert("Please enter a valid email address.");
        return; // Stop the function if email is invalid
    }

    // Proceed if email is valid
    showOtpForm(emailInput, "forgot-password");
});

function setCookie(name, value, maxAgeInSeconds = 3600) {
    document.cookie = `${name}=${value};path=/; max-age=${maxAgeInSeconds}; SameSite=Strict`;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, val] = cookie.trim().split('=');
        if (key === name) return val;
    }
    return null;
 }

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".form-box.login form");
    const emailInput = document.getElementById("email-input");
    const passwordInput = document.getElementById("password-input");

    if (!loginForm || !emailInput || !passwordInput) {
        console.error("Form or inputs not found!");
        return;
    }

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const isValid = validateInputs();

        if (!isValid) return;

        try {
            const response = await fetch("http://127.0.0.1:8001/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Email: emailInput.value.trim(),
                    Password: passwordInput.value.trim()
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login failed.");
            }

            setCookie("access_token", data.access_token);
            setCookie("token_type", data.token_type);

            console.log("Login Success:", data);
            window.location.href = "index.html";
        } catch (error) {
            console.error("Login error:", error);
            setError(emailInput, error.message || "Something went wrong.");
        }
    });

    const validateInputs = () => {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();
        let valid = true;

        if (emailValue === '') {
            setError(emailInput, 'Email is required');
            valid = false;
        } else if (!isValidEmail(emailValue)) {
            setError(emailInput, 'Provide a valid email address');
            valid = false;
        } else {
            setSuccess(emailInput);
        }

        if (passwordValue === '') {
            setError(passwordInput, 'Password is required');
            valid = false;
        } else {
            setSuccess(passwordInput);
        }

        return valid;
    }

    const setError = (element, message) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');

        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    }

    const setSuccess = element => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');

        errorDisplay.innerText = '';
        inputControl.classList.add('success');
        inputControl.classList.remove('error');
    }

    const isValidEmail = email => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
});





async function fetchProtectedData() {
    const token = getCookie("access_token");
    const tokenType = getCookie("token_type");

    if (!token) {
        alert("You are not authenticated. Please log in.");
        window.location.href = "/login"; // Redirect to login page
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/protected-route", {
            method: "GET",
            headers: {
                "Authorization": '${tokenType} ${token}', // Sends "Bearer <token>"
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch protected data.");
        }

        const data = await response.json();
        console.log("Protected Data:", data);
    } catch (error) {
        alert(error.message);
    }
}

// ✅ Bind click to registration button
document.addEventListener("DOMContentLoaded", function () {
    const registerBtn = document.getElementById("complete-registration-btn");

    if (registerBtn) {
        registerBtn.addEventListener("click", function (e) {
            e.preventDefault(); // Stop form submission
            registerUser();     // Call our function
        });
    }
});

// ✅ Function to register the user
async function registerUser() {
    const fullName = document.getElementById("full-name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const email = document.getElementById("register-email-display").textContent.trim(); // from OTP step
    const password = document.getElementById("register-password").value.trim();

    if (!fullName || !surname || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const payload = {
        first_name: fullName,
        Last_name: surname,
        Email: email,
        Password: password
    };

    try {
        
        const response = await fetch("http://127.0.0.1:8000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Registration failed.");
        }

        alert("✅ Registration successful!");
        window.location.href = "login.html"; // change if your login page is different
    } catch (error) {
        console.error("Registration error:", error);
        alert("🚫 " + error.message);
    }



    document.addEventListener("DOMContentLoaded", function () {
        const token = getCookie("access_token");
    
        // ✅ If token exists, user is already logged in
        if (token) {
            // Redirect to homepage (or dashboard)
            window.location.href = "/Frontend_/static/index.html";  // Adjust path if needed
        }
    });
}
// === OTP Countdown Timer ===
let timerDisplay = document.getElementById("timer");
let resendButton = document.getElementById("resend-code");
let countdownInterval;

function startOTPTimer(duration) {
    let remaining = duration;

    resendButton.classList.add("disabled");
    resendButton.classList.remove("enabled");
    resendButton.disabled = true;

    updateTimerDisplay(remaining);

    countdownInterval = setInterval(() => {
        remaining--;
        updateTimerDisplay(remaining);

        if (remaining <= 0) {
            clearInterval(countdownInterval);
            resendButton.disabled = false;
            resendButton.classList.remove("disabled");
            resendButton.classList.add("enabled");
            timerDisplay.textContent = "0";
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const display = seconds < 10 ? `0${seconds}` : seconds;
    timerDisplay.textContent = display;
}

// === Resend Code Button Click ===
resendButton.addEventListener("click", () => {
    // Here you'd trigger the actual resend OTP function (AJAX/fetch)
    console.log("Resend OTP triggered!");

    startOTPTimer(60); // Restart the 60s timer after resending
});

// === Start timer initially when OTP form is shown ===
const otpForm = document.querySelector(".form-box.register-otp");

const observer = new MutationObserver(() => {
    if (!otpForm.classList.contains("hidden")) {
        startOTPTimer(60); // Start when the form becomes visible
    }
});

observer.observe(otpForm, { attributes: true, attributeFilter: ['class'] });
