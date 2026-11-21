// 1. Set Minimum Date to Today (Prevent selecting past dates)
const dateInput = document.getElementById("appointmentDate");
const today = new Date().toISOString().split("T")[0];
dateInput.setAttribute("min", today);

// 2. Slot Selection Logic
const slotButtons = document.querySelectorAll(".slot-btn");
const selectedSlotInput = document.getElementById("selectedSlot");
const slotError = document.getElementById("slotError");

// Function to check already booked slots for a selected date
function updateAvailableSlots(selectedDate) {
    // Get booked slots from browser localStorage
    const bookedData = JSON.parse(localStorage.getItem("shreeMakeoverBookings")) || {};
    const bookedSlotsForDate = bookedData[selectedDate] || [];

    // Reset selection
    selectedSlotInput.value = "";
    
    slotButtons.forEach(btn => {
        btn.classList.remove("active", "booked");
        btn.disabled = false;
        
        const slotTime = btn.getAttribute("data-slot");
        
        // If this slot is already booked on this date, disable it
        if (bookedSlotsForDate.includes(slotTime)) {
            btn.classList.add("booked");
            btn.disabled = true;
            btn.innerText = slotTime + " (Booked)";
        } else {
            btn.innerText = slotTime;
        }
    });
}

// Listen for date change
dateInput.addEventListener("change", function () {
    updateAvailableSlots(this.value);
});

// Handle slot button click
slotButtons.forEach(button => {
    button.addEventListener("click", function () {
        if (this.classList.contains("booked")) return;

        // Remove active class from all buttons
        slotButtons.forEach(btn => btn.classList.remove("active"));

        // Add active class to clicked button
        this.classList.add("active");

        // Store selected slot value
        selectedSlotInput.value = this.getAttribute("data-slot");
        slotError.style.display = "none";
    });
});

// 3. Form Submission & WhatsApp Redirect
document.getElementById("bookingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("clientName").value.trim();
    const mobile = document.getElementById("clientMobile").value.trim();
    const service = document.getElementById("serviceSelect").value;
    const date = dateInput.value;
    const slot = selectedSlotInput.value;

    // Check if slot is selected
    if (!slot) {
        slotError.style.display = "block";
        return;
    }

    // Save this slot as booked in localStorage
    const bookedData = JSON.parse(localStorage.getItem("shreeMakeoverBookings")) || {};
    if (!bookedData[date]) {
        bookedData[date] = [];
    }
    bookedData[date].push(slot);
    localStorage.setItem("shreeMakeoverBookings", JSON.stringify(bookedData));

    // Format WhatsApp Message cleanly
    const message =
        "✨ *Shree Makeover - New Appointment* ✨%0A%0A" +
        "👤 *Name:* " + encodeURIComponent(name) + "%0A" +
        "📞 *Mobile:* " + encodeURIComponent(mobile) + "%0A" +
        "💄 *Service:* " + encodeURIComponent(service) + "%0A" +
        "📅 *Date:* " + encodeURIComponent(date) + "%0A" +
        "⏰ *Time Slot:* " + encodeURIComponent(slot);

    const whatsappNumber = "919769269002";

    // Open WhatsApp
    window.open(
        "https://wa.me/" + whatsappNumber + "?text=" + message,
        "_blank"
    );

    // Update UI to show slot is now booked & reset form
    updateAvailableSlots(date);
    this.reset();
    dateInput.value = date; // Keep selected date visible
});