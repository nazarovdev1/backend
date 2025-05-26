        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Chat popup toggle
        const chatToggle = document.getElementById('chat-toggle');
        const floatingChat = document.getElementById('floating-chat');
        const chatPopup = document.getElementById('chat-popup');
        const closeChat = document.getElementById('close-chat');
        
        // Show floating chat button after scrolling
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                floatingChat.classList.remove('hidden');
            } else {
                floatingChat.classList.add('hidden');
            }
        });
        
        // Toggle chat popup
        chatToggle.addEventListener('click', () => {
            chatPopup.classList.toggle('hidden');
        });
        
        floatingChat.addEventListener('click', () => {
            chatPopup.classList.toggle('hidden');
        });
        
        closeChat.addEventListener('click', () => {
            chatPopup.classList.add('hidden');
        });

        // Demo chat messages
        const chatDemo = document.getElementById('chat-demo');
        const demoMessages = [
            {
                sender: 'bot',
                text: 'Could you try restarting your computer and see if that helps?'
            },
            {
                sender: 'user',
                text: 'Okay, Ill try that now.'
            },
            {
                sender: 'bot',
                text: 'While you do that, Ill prepare some additional troubleshooting steps we can try if the restart doesnt work.'
            },
            {
                sender: 'user',
                text: 'It worked! The internet is back. Thank you so much!'
            },
            {
                sender: 'bot',
                text: 'Thats great news! Would you like me to send you some tips to prevent this issue in the future?'
            }
        ];

        // Add demo messages with delay
        setTimeout(() => {
            demoMessages.forEach((message, index) => {
                setTimeout(() => {
                    const messageDiv = document.createElement('div');
                    messageDiv.className = `flex mb-4 ${message.sender === 'user' ? 'justify-end' : ''}`;
                    
                    const contentDiv = document.createElement('div');
                    contentDiv.className = `p-3 rounded-lg chat-message ${message.sender === 'user' ? 'bg-purple-100' : 'bg-gray-100'}`;
                    contentDiv.innerHTML = `<p>${message.text}</p>`;
                    
                    messageDiv.appendChild(contentDiv);
                    chatDemo.appendChild(messageDiv);
                    
                    // Scroll to bottom
                    chatDemo.scrollTop = chatDemo.scrollHeight;
                }, index * 2000);
            });
        }, 3000);