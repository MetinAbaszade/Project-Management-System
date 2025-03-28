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
    const otpForm = document.querySelector(".form-box.register-otp"); // ✅ Correct class for OTP form

    const emailInput = document.getElementById("forgot-email");
    const emailDisplay = document.getElementById("register-email-display");
    
    // When "Forgot Password?" is clicked
    forgotPasswordLink.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default link behavior

        // Hide login form, hide blue section
        loginForm.classList.add("hidden");
        container.classList.add("no-blue");

        // Show forgot password form
        setTimeout(() => {
            forgotForm.classList.add("active");
        }, 300); // Delay so transition looks smooth
    });

    // When "Send Code" is clicked
    sendCodeBtn.addEventListener("click", function () {
        const email = emailInput.value.trim();

        if (email === "") {
            alert("Please enter a valid email address.");
            return;
        }

        // Display the email entered
        emailDisplay.textContent = email;

        // Hide email input form
        forgotForm.classList.remove("active");

        // Show OTP input form
        setTimeout(() => {
            otpForm.classList.add("active");
        }, 300);
    });

    // When "Verify" is clicked
    verifyCodeBtn.addEventListener("click", function () {
        const authCode = document.getElementById("register-otp-code").value.trim();

        if (authCode.length === 6) {
            alert("Verification successful! Redirecting to reset password...");
            // Here you can redirect the user to the reset password page
        } else {
            alert("Please enter a valid 6-digit code.");
        }
    });
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




/*Going to verify part STARTS*/
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
    
                // 🛠️ Ensure visibility is reset (Fixes blank screen issue)
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

/*Going to verify part ENDS*/





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
            verifyRegisterOtpBtn.classList.add("hidden");
            verifyForgotOtpBtn.classList.add("hidden");

            // Show the correct button
            if (type === "register") {
                verifyRegisterOtpBtn.classList.remove("hidden");
            } else if (type === "forgot-password") {
                verifyForgotOtpBtn.classList.remove("hidden");
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
    setPasswordBtn.addEventListener("click", function () {
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (newPassword === "" || confirmPassword === "") {
            alert("Please enter your new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        alert("Password successfully reset! Redirecting to login...");

        // Hide New Password form, reset all sections instantly
        newPasswordForm.classList.remove("active");
        otpForm.classList.remove("active");
        registerForm.classList.remove("active");

        // Transition back to login instantly with less delay
        setTimeout(() => {
            loginForm.classList.add("active");
            container.classList.remove("active"); // Restore blue section
        }, 900); // Reduced transition time for faster switch

        // Faster reload after transition (no unnecessary delay)
        setTimeout(() => {
            window.location.reload();
        }, 900); // Speed optimized for smooth experience
    });

        // Click "Complete Registration" (Return to Login)
        completeRegBtn.addEventListener("click", function () {
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






document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".form-box.login form");

    if (!loginForm) {
        console.error("Login form not found!");
        return;
    }

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = loginForm.querySelector('input[type="email"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }
        
        console.log(email);
        console.log(password);

        try {
            const response = await fetch("http://127.0.0.1:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
        
            const data = await response.json();
        
            if (!response.ok) {
                // Handle specific error returned from backend
                throw new Error(data.detail || "Login failed.");
            }
        
            // ✅ Store token
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("token_type", data.token_type);
        
            console.log("Login Success:", data);

            window.location.href = "index.html"; // if you're already inside Frontend
        } catch (error) {
            console.error("Login error:", error);
            alert(error.message || "Something went wrong.");
        }
        
    });
});




async function fetchProtectedData() {
    const token = localStorage.getItem("access_token");
    const tokenType = localStorage.getItem("token_type");

    if (!token) {
        alert("You are not authenticated. Please log in.");
        window.location.href = "/login"; // Redirect to login page
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/protected-route", {
            method: "GET",
            headers: {
                "Authorization": `${tokenType} ${token}`, // Sends "Bearer <token>"
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
        last_name: surname,
        email: email,
        password: password
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
}

document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("access_token");

    // ✅ If token exists, user is already logged in
    if (token) {
        // Redirect to homepage (or dashboard)
        window.location.href = "/Frontend_/static/index.html";  // Adjust path if needed
    }
});