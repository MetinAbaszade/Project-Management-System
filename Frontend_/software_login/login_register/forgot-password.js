document.addEventListener("DOMContentLoaded", function () {
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const sendCodeBtn = document.getElementById("send-code");
    const verifyCodeBtn = document.getElementById("verify-code");

    const container = document.querySelector(".container");
    const loginForm = document.querySelector(".form-box.login");
    const forgotForm = document.querySelector(".form-box.forgot-password");
    const otpForm = document.querySelector(".form-box.otp");
    const emailInput = document.getElementById("forgot-email");
    const emailDisplay = document.getElementById("email-display");

    // Click "Forgot Password?" -> Remove Blue Section, Show Email Input
    forgotPasswordLink.addEventListener("click", function (e) {
        e.preventDefault();
        loginForm.classList.add("hidden"); // Hide login form
        container.classList.add("no-blue"); // Remove blue section
        setTimeout(() => {
            forgotForm.classList.add("active"); // Show forgot password form
        }, 300);
    });

    // Click "Send Code" -> Hide Email Input, Show OTP Section
    sendCodeBtn.addEventListener("click", function () {
        const email = emailInput.value.trim();

        if (email === "") {
            alert("Please enter a valid email address.");
            return;
        }

        emailDisplay.textContent = email;
        forgotForm.classList.remove("active"); // Hide email input
        setTimeout(() => {
            otpForm.classList.add("active"); // Show OTP input
        }, 300);
    });

    // Click "Verify" -> Check OTP
    verifyCodeBtn.addEventListener("click", function () {
        const authCode = document.getElementById("otp-code").value.trim();

        if (authCode.length === 6) {
            alert("Verification successful! Redirecting to reset password...");
            // Redirect or proceed to reset password step
        } else {
            alert("Please enter a valid 6-digit code.");
        }
    });
});
