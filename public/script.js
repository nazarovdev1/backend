document.addEventListener('DOMContentLoaded', () => {
    // Mobil menyuni ochish/yopish
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Chat oynasini ochish/yopish
    const floatingChat = document.getElementById('floating-chat'); //
    const chatPopup = document.getElementById('chat-popup'); //
    const closeChat = document.getElementById('close-chat'); //
    document.addEventListener('DOMContentLoaded', () => {
    // ... (avvalgi kodlar: mobil menyu, chat, foydalanuvchi nomi/chiqish) ...

    // YANGI QISM: Murojaat formasini qayta ishlash
    const contactForm = document.getElementById('contactForm');
    const contactFormStatus = document.getElementById('contactFormStatus');

    if (contactForm && contactFormStatus) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            contactFormStatus.textContent = ''; // Oldingi statusni tozalash
            contactFormStatus.classList.remove('text-green-600', 'text-red-600');


            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone').value,
                problem: document.getElementById('contactMessage').value, // "message" o'rniga "problem" yoki boshqa nom
                // Foydalanuvchi tizimga kirgan bo'lsa, uning ma'lumotlarini qo'shish mumkin
                // Masalan: senderUsername: localStorage.getItem('loggedInUserName') || 'Anonymous'
            };

            // Oddiy validatsiya
            if (!formData.name || !formData.email || !formData.problem) {
                contactFormStatus.textContent = 'Iltimos, barcha kerakli maydonlarni to‘ldiring.';
                contactFormStatus.classList.add('text-red-600');
                return;
            }
            
            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    contactFormStatus.textContent = 'Xabaringiz muvaffaqiyatli yuborildi!';
                    contactFormStatus.classList.add('text-green-600');
                    contactForm.reset(); // Formani tozalash
                } else {
                    const errorData = await response.json();
                    contactFormStatus.textContent = `Xatolik yuz berdi: ${errorData.message || response.statusText}`;
                    contactFormStatus.classList.add('text-red-600');
                }
            } catch (error) {
                console.error('Murojaat yuborishda xatolik:', error);
                contactFormStatus.textContent = 'Server bilan bog‘lanishda xatolik.';
                contactFormStatus.classList.add('text-red-600');
            }
        });
    }
});

    if (floatingChat) {
        if (window.scrollY > 300) {
            floatingChat.classList.remove('hidden');
        } else {
            floatingChat.classList.add('hidden');
        }
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                floatingChat.classList.remove('hidden');
            } else {
                floatingChat.classList.add('hidden');
            }
        });
        floatingChat.addEventListener('click', () => {
            if (chatPopup) chatPopup.classList.toggle('hidden');
        });
    }
     if (closeChat && chatPopup) {
        closeChat.addEventListener('click', () => {
            chatPopup.classList.add('hidden');
        });
    }

    // Demo chat xabarlari
    const chatDemo = document.getElementById('chat-demo'); //
    if (chatDemo) {
        const demoMessages = [
             { sender: 'bot', text: 'Kompyuteringizni qayta ishga tushirib koʻring, bu yordam beradimi?'},
             { sender: 'user', text: 'Ok, hozir sinab koʻraman.'},
             { sender: 'bot', text: 'Siz buni qilguningizcha, agar qayta ishga tushirish yordam bermasa, sinab koʻrishimiz mumkin boʻlgan qoʻshimcha nosozliklarni tuzatish amallarini tayyorlayman.'},
             { sender: 'user', text: 'Ishladi! Internet qaytdi. Katta rahmat!'},
             { sender: 'bot', text: 'Bu ajoyib yangilik! Kelajakda bu muammoning oldini olish uchun sizga maslahatlar yuborishimni xohlaysizmi?'}
        ];
        setTimeout(() => {
            demoMessages.forEach((message, index) => {
                setTimeout(() => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `flex mb-4 ${message.sender === 'user' ? 'justify-end' : ''}`;
                    
                    const contentDiv = document.createElement('div');
                    contentDiv.className = `p-3 rounded-lg chat-message ${message.sender === 'user' ? 'bg-purple-100' : 'bg-gray-100'}`; //
                    contentDiv.innerHTML = `<p>${message.text}</p>`;
                    
                    messageDiv.appendChild(contentDiv);
                    chatDemo.appendChild(messageDiv);
                    if (chatDemo.scrollTop !== undefined) { 
                        chatDemo.scrollTop = chatDemo.scrollHeight;
                    }
                }, index * 2000);
            });
        }, 3000);
    }

    // Foydalanuvchi interfeysini va chiqish funksiyasini sozlash
    const userAuthSection = document.getElementById('user-auth-section');
    const loggedInUserFullName = localStorage.getItem('loggedInUserFullName');

    if (userAuthSection) {
        if (loggedInUserFullName && loggedInUserFullName !== "undefined") {
            userAuthSection.innerHTML = `
                <div class="user-dropdown">
                    <button id="userNameButton" class="bg-white text-purple-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition flex items-center">
                        ${loggedInUserFullName}
                        <svg class="ml-2 h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" fill-rule="evenodd"></path></svg>
                    </button>
                    <div id="dropdownMenu" class="dropdown-content">
                        <button id="logoutButton">Chiqish</button>
                    </div>
                </div>
            `;

            const userNameButton = document.getElementById('userNameButton');
            const dropdownMenu = document.getElementById('dropdownMenu');
            const logoutButton = document.getElementById('logoutButton');

            if (userNameButton && dropdownMenu) {
                userNameButton.addEventListener('click', (event) => {
                    event.stopPropagation(); 
                    dropdownMenu.classList.toggle('show');
                });
            }

            if (logoutButton) {
                logoutButton.addEventListener('click', () => {
                    localStorage.removeItem('loggedInUserFullName');
                    localStorage.removeItem('loggedInUserName');
                    localStorage.removeItem('loggedInUserRole'); // Agar saqlangan bo'lsa
                    window.location.reload(); // Sahifani qayta yuklash
                });
            }

            document.addEventListener('click', (event) => {
                if (dropdownMenu && dropdownMenu.classList.contains('show') && userNameButton && !userNameButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });

        } else {
            userAuthSection.innerHTML = `
                <a href="/auth.html">
                    <button class="bg-white text-purple-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition flex items-center">
                        Login / Signup
                    </button>
                </a>
            `;
        }
    }
});