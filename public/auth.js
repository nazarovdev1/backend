        const signInTab = document.getElementById('signInTab');
        const signUpTab = document.getElementById('signUpTab');
        const signInForm = document.getElementById('signInForm');
        const signUpForm = document.getElementById('signUpForm');

        const signInActualForm = document.getElementById('signInActualForm');
        const signUpActualForm = document.getElementById('signUpActualForm');

        const messageArea = document.getElementById('messageArea');

        // --- Form Switching ---
        function showForm(formName) {
            if (formName === 'signIn') {
                signInForm.classList.remove('form-hidden');
                signInForm.classList.add('form-visible');
                signUpForm.classList.add('form-hidden');
                signUpForm.classList.remove('form-visible');

                signInTab.classList.add('tab-active');
                signInTab.classList.remove('tab-inactive');
                signUpTab.classList.remove('tab-active');
                signUpTab.classList.add('tab-inactive');
            } else {
                signUpForm.classList.remove('form-hidden');
                signUpForm.classList.add('form-visible');
                signInForm.classList.add('form-hidden');
                signInForm.classList.remove('form-visible');

                signUpTab.classList.add('tab-active');
                signUpTab.classList.remove('tab-inactive');
                signInTab.classList.remove('tab-active');
                signInTab.classList.add('tab-inactive');
            }
            // Clear any previous messages
            hideMessage();
        }

        // --- Message Display ---
        function showMessage(message, type = 'success') {
            messageArea.textContent = message;
            messageArea.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
            if (type === 'success') {
                messageArea.classList.add('bg-green-100', 'text-green-700');
            } else if (type === 'error') {
                 messageArea.classList.add('bg-red-100', 'text-red-700');
            }
             messageArea.classList.remove('hidden');
        }

        function hideMessage() {
            messageArea.classList.add('hidden');
            messageArea.textContent = '';
        }


        // --- Email Validation ---
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        // --- Input Validation & Error Display ---
        function validateAndShowError(inputElement, errorElement, validationFn, errorMessage) {
            if (!validationFn(inputElement.value)) {
                errorElement.textContent = errorMessage;
                errorElement.classList.remove('hidden');
                inputElement.classList.add('border-red-500');
                inputElement.classList.remove('border-gray-300', 'focus:border-indigo-500');
                return false;
            } else {
                errorElement.classList.add('hidden');
                inputElement.classList.remove('border-red-500');
                inputElement.classList.add('border-gray-300', 'focus:border-indigo-500');
                return true;
            }
        }

        // Sign In Email Validation
        const signInEmailInput = document.getElementById('signInEmail');
        const signInEmailError = document.getElementById('signInEmailError');
        signInEmailInput.addEventListener('input', () => {
            validateAndShowError(signInEmailInput, signInEmailError, isValidEmail, 'Yaroqli elektron pochta manzilini kiriting.');
        });

        // Sign Up Email Validation
        const signUpEmailInput = document.getElementById('signUpEmail');
        const signUpEmailError = document.getElementById('signUpEmailError');
        signUpEmailInput.addEventListener('input', () => {
            validateAndShowError(signUpEmailInput, signUpEmailError, isValidEmail, 'Yaroqli elektron pochta manzilini kiriting.');
        });

        // Sign Up Password Validation (Length)
        const signUpPasswordInput = document.getElementById('signUpPassword');
        const signUpPasswordError = document.getElementById('signUpPasswordError');
        signUpPasswordInput.addEventListener('input', () => {
            validateAndShowError(signUpPasswordInput, signUpPasswordError, (val) => val.length >= 8, 'Parol kamida 8 belgidan iborat boʻlishi kerak.');
        });

        // Sign Up Confirm Password Validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const confirmPasswordError = document.getElementById('confirmPasswordError');
        function validateConfirmPassword() {
            return validateAndShowError(confirmPasswordInput, confirmPasswordError, (val) => val === signUpPasswordInput.value, 'Parollar mos kelmadi.');
        }
        confirmPasswordInput.addEventListener('input', validateConfirmPassword);
        signUpPasswordInput.addEventListener('input', () => { // Re-validate confirm if main password changes
            if (confirmPasswordInput.value) {
                validateConfirmPassword();
            }
        });


        // --- Form Submission Handling (Placeholder) ---
        signInActualForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual submission for this demo
            hideMessage();
            let isValid = true;
            isValid = validateAndShowError(signInEmailInput, signInEmailError, isValidEmail, 'Yaroqli elektron pochta manzilini kiriting.') && isValid;

            if (isValid && signInPassword.value) {
                console.log('Sign In form submitted (demo)');
                console.log('Email:', signInEmailInput.value);
                // In a real app, you would send this data to a server.
                showMessage('Muvaffaqiyatli kirildi! (Demo)', 'success');
                signInActualForm.reset(); // Clear form
            } else if (!signInPassword.value) {
                 showMessage('Iltimos, parolni kiriting.', 'error');
            } else {
                showMessage('Iltimos, xatolarni tuzating.', 'error');
            }
        });

        signUpActualForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual submission for this demo
            hideMessage();
            let isValid = true;
            isValid = validateAndShowError(signUpEmailInput, signUpEmailError, isValidEmail, 'Yaroqli elektron pochta manzilini kiriting.') && isValid;
            isValid = validateAndShowError(signUpPasswordInput, signUpPasswordError, (val) => val.length >= 8, 'Parol kamida 8 belgidan iborat boʻlishi kerak.') && isValid;
            isValid = validateConfirmPassword() && isValid;

            const termsCheckbox = document.getElementById('terms');
            if (!termsCheckbox.checked) {
                isValid = false;
                showMessage('Iltimos, foydalanish shartlari va maxfiylik siyosatiga rozilik bildiring.', 'error');
            }


            if (isValid) {
                console.log('Sign Up form submitted (demo)');
                console.log('Full Name:', document.getElementById('signUpFullName').value);
                console.log('Email:', signUpEmailInput.value);
                // In a real app, you would send this data to a server.
                showMessage('Muvaffaqiyatli roʻyxatdan oʻtdingiz! (Demo)', 'success');
                signUpActualForm.reset(); // Clear form
            } else if (termsCheckbox.checked) { // Only show general error if terms were checked but other fields failed
                showMessage('Iltimos, barcha xatolarni tuzating.', 'error');
            }
        });

        showForm('signIn');