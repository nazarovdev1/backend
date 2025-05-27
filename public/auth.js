const signInTab = document.getElementById('signInTab');
        const signUpTab = document.getElementById('signUpTab');
        const signInForm = document.getElementById('signInForm');
        const signUpForm = document.getElementById('signUpForm');

        const signInActualForm = document.getElementById('signInActualForm');
        const signUpActualForm = document.getElementById('signUpActualForm');

        const messageArea = document.getElementById('messageArea');

        // --- Formalarni almashtirish ---
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
            hideMessage();
        }

        // --- Xabarlarni ko'rsatish ---
        function showMessage(message, type = 'success') {
            messageArea.textContent = message;
            messageArea.className = 'mt-6 p-4 rounded-lg text-center'; 
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

        // --- Email tekshiruvi ---
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        
        // --- Kiritishni tekshirish va xatolikni ko'rsatish ---
        function validateAndShowError(inputElement, errorElement, validationFn, errorMessage) {
            if (!inputElement) return true; 
            const value = inputElement.value.trim();
            if (!validationFn(value)) {
                if (errorElement) {
                    errorElement.textContent = errorMessage;
                    errorElement.classList.remove('hidden');
                }
                inputElement.classList.add('border-red-500');
                inputElement.classList.remove('border-gray-300', 'focus:border-indigo-500');
                return false;
            } else {
                if (errorElement) {
                    errorElement.classList.add('hidden');
                }
                inputElement.classList.remove('border-red-500');
                inputElement.classList.add('border-gray-300', 'focus:border-indigo-500');
                return true;
            }
        }

        // Kirish formalari elementlari
        const signInEmailInput = document.getElementById('signInEmail');
        const signInEmailError = document.getElementById('signInEmailError');
        const signInPasswordInput = document.getElementById('signInPassword');
        
        if (signInEmailInput) {
            signInEmailInput.addEventListener('input', () => {
                validateAndShowError(signInEmailInput, signInEmailError, isValidEmail, 'Yaroqli elektron pochta manzilini kiriting.');
            });
        }

        // Ro'yxatdan o'tish formalari elementlari
        const signUpFullNameInput = document.getElementById('signUpFullName');
        const signUpEmailInput = document.getElementById('signUpEmail');
        const signUpEmailError = document.getElementById('signUpEmailError');
        const signUpPasswordInput = document.getElementById('signUpPassword');
        const signUpPasswordError = document.getElementById('signUpPasswordError');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const confirmPasswordError = document.getElementById('confirmPasswordError');

        if (signUpEmailInput) {
            signUpEmailInput.addEventListener('input', () => {
                validateAndShowError(signUpEmailInput, signUpEmailError, isValidEmail, 'Yaroqli elektron pochta manzilini kiriting.');
            });
        }
        if (signUpPasswordInput) {
            signUpPasswordInput.addEventListener('input', () => {
                validateAndShowError(signUpPasswordInput, signUpPasswordError, (val) => val.length >= 8, 'Parol kamida 8 belgidan iborat boʻlishi kerak.');
                if (confirmPasswordInput && confirmPasswordInput.value) validateConfirmPassword();
            });
        }
        function validateConfirmPassword() {
            if (!confirmPasswordInput || !signUpPasswordInput) return true;
            return validateAndShowError(confirmPasswordInput, confirmPasswordError, (val) => val === signUpPasswordInput.value, 'Parollar mos kelmadi.');
        }
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', validateConfirmPassword);
        }
        

        // --- Formani yuborishni qayta ishlash (Kirish) ---
        if (signInActualForm) {
            signInActualForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                hideMessage();
                let isValid = true;
                isValid = validateAndShowError(signInEmailInput, signInEmailError, isValidEmail, 'Yaroqli elektron pochta manzilini kiriting.') && isValid;
                isValid = validateAndShowError(signInPasswordInput, null, (val) => val.length > 0, 'Parolni kiriting.') && isValid;

                if (isValid) {
                    const username = signInEmailInput.value;
                    const password = signInPasswordInput.value;
                    try {
                        const response = await fetch('/api/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                        });
                        const data = await response.json();
                        if (response.ok) {
                            showMessage('Muvaffaqiyatli kirildi!', 'success');
                            localStorage.setItem('loggedInUserFullName', data.fullName);
                            localStorage.setItem('loggedInUserName', data.username);
                            window.location.href = '/index.html';
                        } else {
                            showMessage(data.message || 'Kirishda xatolik.', 'error');
                        }
                    } catch (error) {
                        console.error('Kirish xatoligi:', error);
                        showMessage('Server bilan bogʻlanishda xatolik.', 'error');
                    }
                } else {
                    showMessage('Iltimos, xatolarni tuzating.', 'error');
                }
            });
        }

        // --- Formani yuborishni qayta ishlash (Ro'yxatdan o'tish) ---
        if (signUpActualForm) {
            signUpActualForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                hideMessage();
                let isValid = true;
                isValid = validateAndShowError(signUpFullNameInput, null, (val) => val.trim().length > 0, 'Toʻliq ismni kiriting') && isValid;
                isValid = validateAndShowError(signUpEmailInput, signUpEmailError, isValidEmail, 'Yaroqli elektron pochta manzilini kiriting.') && isValid;
                isValid = validateAndShowError(signUpPasswordInput, signUpPasswordError, (val) => val.length >= 8, 'Parol kamida 8 belgidan iborat boʻlishi kerak.') && isValid;
                isValid = validateConfirmPassword() && isValid;

                const termsCheckbox = document.getElementById('terms');
                if (termsCheckbox && !termsCheckbox.checked) {
                    isValid = false;
                    showMessage('Iltimos, foydalanish shartlari va maxfiylik siyosatiga rozilik bildiring.', 'error');
                }
                
                // Tanlangan rolni olish
                const selectedRole = document.querySelector('input[name="signUpRole"]:checked');
                if (!selectedRole) {
                    isValid = false;
                    showMessage('Iltimos, rolni tanlang.', 'error');
                }

                if (isValid) {
                    const fullName = signUpFullNameInput.value;
                    const username = signUpEmailInput.value;
                    const password = signUpPasswordInput.value;
                    const role = selectedRole.value; // 'user' yoki 'admin'

                    try {
                        const response = await fetch('/api/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password, fullName, role })
                        });
                        const data = await response.json();
                        if (response.ok) {
                            showMessage('Muvaffaqiyatli roʻyxatdan oʻtdingiz!', 'success');
                            localStorage.setItem('loggedInUserFullName', data.fullName); // serverdan fullName qaytarilishi kerak
                            localStorage.setItem('loggedInUserName', data.username);  // serverdan username qaytarilishi kerak

                            if (role === 'admin') {
                                window.location.href = '/dashboard.html';
                            } else { // role === 'user'
                                window.location.href = '/index.html';
                            }
                        } else {
                            showMessage(data.message || 'Roʻyxatdan oʻtishda xatolik.', 'error');
                        }
                    } catch (error) {
                        console.error('Roʻyxatdan oʻtish xatoligi:', error);
                        showMessage('Server bilan bogʻlanishda xatolik.', 'error');
                    }
                } else if (termsCheckbox && termsCheckbox.checked && selectedRole) { 
                    showMessage('Iltimos, barcha xatolarni tuzating.', 'error');
                }
            });
        }
        showForm('signIn');