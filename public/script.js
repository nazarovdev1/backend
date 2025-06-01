// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication and update navigation
  updateNavigation()

  const mobileMenuButton = document.getElementById("mobile-menu-button")
  const mobileMenu = document.getElementById("mobile-menu")

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

  // Floating chat functionality
  const floatingChat = document.getElementById("floating-chat")
  const chatPopup = document.getElementById("chat-popup")
  const closeChat = document.getElementById("close-chat")

  if (floatingChat && chatPopup && closeChat) {
    setTimeout(() => {
      floatingChat.classList.remove("hidden")
    }, 3000)

    floatingChat.addEventListener("click", () => {
      chatPopup.classList.remove("hidden")
      floatingChat.classList.add("hidden")
    })

    closeChat.addEventListener("click", () => {
      chatPopup.classList.add("hidden")
      floatingChat.classList.remove("hidden")
    })
  }
**




** 

  // Contact form submission
  const contactForm = document.getElementById("contactForm")
  const submitButton = document.getElementById("submitButton")
  const statusElement = document.getElementById("contactFormStatus")

  if (contactForm && submitButton && statusElement) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      submitButton.disabled = true
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Yuborilmoqda...'
      statusElement.textContent = ""
      statusElement.className = "mt-5 text-sm text-center"

      const formData = new FormData(contactForm)
      const messageData = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") || "",
        subject: formData.get("subject"),
        message: formData.get("message"),
      }

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          statusElement.textContent = "Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz."
          statusElement.className =
            "mt-5 text-sm text-center text-green-600 font-medium bg-green-50 p-3 rounded-lg border border-green-200"

          contactForm.reset()

          submitButton.innerHTML = '<i class="fas fa-check mr-2"></i>Yuborildi'
          submitButton.className =
            "w-full bg-green-600 text-white px-6 py-3.5 rounded-lg font-semibold transition duration-300 ease-in-out"

          setTimeout(() => {
            submitButton.innerHTML = "Xabarni Yuborish"
            submitButton.className =
              "w-full bg-purple-600 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition duration-300 ease-in-out"
            submitButton.disabled = false
            statusElement.textContent = ""
            statusElement.className = "mt-5 text-sm text-center"
          }, 3000)
        } else {
          throw new Error(result.message || "Xabar yuborishda xatolik yuz berdi")
        }
      } catch (error) {
        console.error("Xabar yuborishda xatolik:", error)
        statusElement.textContent = `Xatolik: ${error.message}. Iltimos, qaytadan urinib ko'ring.`
        statusElement.className =
          "mt-5 text-sm text-center text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-200"

        submitButton.innerHTML = "Xabarni Yuborish"
        submitButton.className =
          "w-full bg-purple-600 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 transition duration-300 ease-in-out"
        submitButton.disabled = false
      }
    })
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Form validation
  const inputs = document.querySelectorAll("input[required], textarea[required]")
  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      if (this.value.trim() === "") {
        this.classList.add("border-red-500")
        this.classList.remove("border-gray-300")
      } else {
        this.classList.remove("border-red-500")
        this.classList.add("border-gray-300")
      }
    })

    input.addEventListener("input", function () {
      if (this.value.trim() !== "") {
        this.classList.remove("border-red-500")
        this.classList.add("border-gray-300")
      }
    })
  })
})

// Authentication functions
function updateNavigation() {
  const userAuthSection = document.getElementById("user-auth-section")
  const loggedInUser = localStorage.getItem("loggedInUser")

  if (loggedInUser && userAuthSection) {
    const user = JSON.parse(loggedInUser)

    userAuthSection.innerHTML = `
      <div class="relative">
        <button id="userMenuButton" class="bg-white text-purple-700 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition flex items-center">
          <i class="fas fa-user-circle mr-2"></i>
          ${user.fullName}
          <i class="fas fa-chevron-down ml-2"></i>
        </button>
        <div id="userDropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <div class="px-4 py-2 text-sm text-gray-700 border-b">
            <div class="font-medium">${user.fullName}</div>
            <div class="text-gray-500">${user.username}</div>
            <div class="text-xs text-purple-600 uppercase">${user.role}</div>
          </div>
          ${
            user.role === "admin"
              ? '<a href="/dashboard.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><i class="fas fa-tachometer-alt mr-2"></i>Dashboard</a>'
              : ""
          }
          <a href="#" id="logoutButton" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i class="fas fa-sign-out-alt mr-2"></i>Chiqish
          </a>
        </div>
      </div>
    `

    // Add dropdown functionality
    const userMenuButton = document.getElementById("userMenuButton")
    const userDropdown = document.getElementById("userDropdown")
    const logoutButton = document.getElementById("logoutButton")

    userMenuButton.addEventListener("click", (e) => {
      e.stopPropagation()
      userDropdown.classList.toggle("hidden")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      userDropdown.classList.add("hidden")
    })

    // Logout functionality
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault()
      if (confirm("Haqiqatan ham tizimdan chiqmoqchimisiz?")) {
        localStorage.removeItem("loggedInUser")
        window.location.href = "/"
      }
    })
  }
}

function checkAuthForDashboard() {
  const loggedInUser = localStorage.getItem("loggedInUser")

  if (!loggedInUser) {
    window.location.href = "/auth.html"
    return false
  }

  const user = JSON.parse(loggedInUser)
  if (user.role !== "admin") {
    alert("Bu sahifaga faqat adminlar kira oladi!")
    window.location.href = "/"
    return false
  }

  return true
}

// Add some CSS animations
const style = document.createElement("style")
style.textContent = `
    .chat-message {
        animation: fadeInUp 0.3s ease-out;
        max-width: 80%;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .floating-button {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
        }
    }
    
    .service-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    }
    
    .gradient-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .chat-container {
        height: 300px;
    }

    .form-loading {
        position: relative;
        overflow: hidden;
    }

    .form-loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: loading 1.5s infinite;
    }

    @keyframes loading {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    /* User dropdown styles */
    #userDropdown {
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.1);
    }

    #userDropdown a:hover {
        background-color: #f3f4f6;
    }
`
document.head.appendChild(style)
