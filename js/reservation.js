
document.getElementById("reservationForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const params = new URLSearchParams(formData.entries());

  try {
    // ✅ Critical fix: Use correct URL format
    const res = await fetch(
      `https://script.google.com/macros/s/AKfycbwIp7cEQXMmXYdeKNdHCxA_Ojy3966TR913OBEawZ_72oN1fhOtzEPJKgs4Zod2EVc5lw/exec?${params.toString()}`, 
      {
        method: "GET",
        redirect: "follow", // Required for GAS redirects
        headers: { 
          "Content-Type": "text/plain" // Avoids CORS preflight
        }
      }
    );

    const result = await res.json();
    console.log(result);
    
    if (result.success) {
      alert(`Chair ${result.chair} booked successfully!`);
    } else {
      alert(`Error: ${result.message || result.error}`);
    }
    
  } catch (error) {
    console.error('Fetch error:', error);
    alert("Booking failed - please try again");
  }
});

