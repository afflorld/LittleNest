const dateInput = document.getElementById('date');

// --- 1. Define Holidays ---
function getSlovakHolidays(year) {
     const fixedHolidays = [
          `${year}-01-01`, // Nový rok
          `${year}-01-06`, // Traja králi
          `${year}-05-01`, // Sviatok práce
          `${year}-05-08`, // Deň víťazstva
          `${year}-07-05`, // Cyrila a Metoda
          `${year}-08-29`, // Výročie SNP
          `${year}-09-01`, // Deň Ústavy
          `${year}-09-15`, // Sedembolestná Panna Mária
          `${year}-11-01`, // Všetkých svätých
          `${year}-11-17`, // Deň boja za slobodu
          `${year}-12-24`, // Štedrý deň
          `${year}-12-25`, // 1. vianočný sviatok
          `${year}-12-26`, // 2. vianočný sviatok
     ];

     const a = year % 19;
     const b = Math.floor(year / 100);
     const c = year % 100;
     const d = Math.floor(b / 4);
     const e = b % 4;
     const f = Math.floor((b + 8) / 25);
     const g = Math.floor((b - f + 1) / 3);
     const h = (19 * a + b - d - g + 15) % 30;
     const i = Math.floor(c / 4);
     const k = c % 4;
     const l = (32 + 2 * e + 2 * i - h - k) % 7;
     const m = Math.floor((a + 11 * h + 22 * l) / 451);
     const month = Math.floor((h + l - 7 * m + 114) / 31);
     const day = ((h + l - 7 * m + 114) % 31) + 1;

     const easter = new Date(year, month - 1, day);
     const goodFriday = new Date(easter);
     goodFriday.setDate(easter.getDate() - 2); // Veľký piatk
     const easterMonday = new Date(easter);
     easterMonday.setDate(easter.getDate() + 1); // Veľkonočný pondelok

     const variableHolidays = [
          formatDate(goodFriday),
          formatDate(easterMonday),
     ];

     return [...fixedHolidays, ...variableHolidays];
}

function formatDate(date) {
     const d = new Date(date);
     const year = d.getFullYear();
     const month = String(d.getMonth() + 1).padStart(2, '0');
     const day = String(d.getDate()).padStart(2, '0');
     return `${year}-${month}-${day}`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);
const threeWeeksLater = new Date();
threeWeeksLater.setDate(today.getDate() + 21);

dateInput.min = formatDate(today);
dateInput.max = formatDate(threeWeeksLater);

dateInput.addEventListener('change', function() {
     const selectedDate = new Date(this.value);
     const dayOfWeek = selectedDate.getDay();
     const holidays = getSlovakHolidays(selectedDate.getFullYear());

     if (dayOfWeek === 0 || dayOfWeek === 6) {
          alert("Vyberte si prosím pracovný deň (pondelok až piatok).");
          this.value = '';
     } else if (holidays.includes(formatDate(selectedDate))) {
          alert("Tento deň je štátny sviatok. Vyberte iný dátum.");
          this.value = '';
     }
});

document.addEventListener('DOMContentLoaded', function() {
     const dateInput = document.getElementById('date');
     const phoneInput = document.getElementById('phone');
     const mailInput = document.getElementById('email');
     const timeSlots = document.getElementById('timeSlots');
     const startHourInput = document.getElementById('startHour');
     const howlongInput = document.getElementById('howlong');
     const tableInput = document.getElementById('table');
     const chairsInput = document.getElementById('persons');

     let selectedTable = null;
     let selectedHours = [];
     let isSelectingRange = false;

     // Phone number validation
     phoneInput.addEventListener('input', function() {
          const phoneRegex = /^(\+421|0)[0-9]{9}$/;
          this.classList.toggle('is-invalid', this.value && !phoneRegex.test(this.value));
     });

     mailInput.addEventListener('input', function() {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          this.classList.toggle('is-invalid', this.value && !emailRegex.test(this.value));
     });

     dateInput.addEventListener('change', async function() {
          const date = this.value;
          if (!date) return;

          // Clear previous selection
          while (timeSlots.children.length > 6) {
               timeSlots.removeChild(timeSlots.lastChild);
          }

          selectedTable = null;
          selectedHours = [];
          startHourInput.value = '';
          howlongInput.value = '1';
          tableInput.value = '';

          try{
          const formData = new URLSearchParams();
          formData.append('date', date);

          const response = await fetch('https://script.google.com/macros/s/AKfycbz6WE828qWWfQYeH9uRjbXGZJ8mWEzR8RbGfvjjNcJrd531-vFwS1eVjpDT2KC-RlTK/exec', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
               },
               body: formData
          });


        const data = await response.json();

               if (data.success) {
                    console.log(data.bookedSlots);
                    renderTimeSlots(date, data.bookedSlots);
               } else {
                    console.error('Error fetching booked slots:', data.message);
                    renderTimeSlots(date, {});
               }
          } catch (error) {
               console.error('Error:', error);
               renderTimeSlots(date, {});
          }
     });

     function renderTimeSlots(date, bookedSlots) {
          // Clear existing time slots (keep headers)
          while (timeSlots.children.length > 6) {
               timeSlots.removeChild(timeSlots.lastChild);
          }

          for (let hour = 9; hour < 18; hour++) {
               const timeLabel = document.createElement('div');
               timeLabel.className = 'time-label';
               timeLabel.textContent = `${hour}:00 - ${hour + 1}:00`;
               timeSlots.appendChild(timeLabel);

               for (let table = 1; table <= 5; table++) {
                    const timeSlot = document.createElement('div');
                    timeSlot.className = 'time-slot';
                    timeSlot.dataset.hour = hour;
                    timeSlot.dataset.table = table;

                    const isBooked = bookedSlots[table] && bookedSlots[table].includes(hour);

                    if (isBooked) {
                         timeSlot.classList.add('booked');
                         timeSlot.textContent = '✗';
                         timeSlot.title = 'Tento čas je už obsadený';
                         timeSlot.style.cursor = 'not-allowed';
                    } else {
                         timeSlot.classList.add('available');
                         timeSlot.textContent = '✔';
                         timeSlot.title = 'Kliknite pre rezerváciu';
                         timeSlot.style.cursor = 'pointer';
                         timeSlot.addEventListener('click', function() {
                              handleTimeSlotClick(this, hour, table);
                         });
                    }

                    timeSlots.appendChild(timeSlot);
               }
          }
     }

     function handleTimeSlotClick(element, hour, table) {
          if (selectedTable === null || selectedTable !== table) {
               document.querySelectorAll('.time-slot.selected').forEach(slot => {
                    slot.classList.remove('selected');
               });

               selectedTable = table;
               selectedHours = [hour];
               isSelectingRange = true;
               element.classList.add('selected');
               tableInput.value = `Stôl ${table}`;
               startHourInput.value = `${hour}:00`;
               howlongInput.value = '1';
          } 
          else if (selectedTable === table) {
               if (isSelectingRange) {
                    const startHour = selectedHours[0];
                    const endHour = hour;

                    document.querySelectorAll('.time-slot.selected').forEach(slot => {
                         slot.classList.remove('selected');
                    });

                    const minHour = Math.min(startHour, endHour);
                    const maxHour = Math.max(startHour, endHour);
                    selectedHours = [];

                    for (let h = minHour; h <= maxHour; h++) {
                         const slot = document.querySelector(`.time-slot[data-hour="${h}"][data-table="${table}"]`);
                         if (slot && !slot.classList.contains('booked')) {
                              slot.classList.add('selected');
                              selectedHours.push(h);
                         }
                    }

                    // Update form fields
                    if (selectedHours.length > 0) {
                         startHourInput.value = `${minHour}:00`;
                         howlongInput.value = maxHour - minHour + 1;
                         isSelectingRange = false;
                    } else {
                         selectedTable = null;
                         tableInput.value = '';
                         startHourInput.value = '';
                         howlongInput.value = '1';
                    }
               } else {
                    // Start new selection
                    selectedHours = [hour];
                    isSelectingRange = true;
                    document.querySelectorAll('.time-slot.selected').forEach(slot => {
                         slot.classList.remove('selected');
                    });
                    element.classList.add('selected');
                    startHourInput.value = `${hour}:00`;
                    howlongInput.value = '1';
               }
          }
     }

     document.getElementById('reservationForm').addEventListener('submit', async (e) => {
          e.preventDefault();

          const responseDiv = document.getElementById('response');
          
          // Validate phone number
          const phoneRegex = /^(\+421|0)[0-9]{9}$/;
          if (!phoneRegex.test(phoneInput.value)) {
               responseDiv.textContent = "Prosím zadajte platné slovenské telefónne číslo (formát: +421XXXXXXXXX alebo 0XXXXXXXXX)";
               responseDiv.style.color = "red";
               phoneInput.focus();
               return;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(mailInput.value)) {
               responseDiv.textContent = "Prosím zadajte platnú emailovú adresu";
               responseDiv.style.color = "red";
               mailInput.focus();
               return;
          }

          // Validate time slot selection
          if (!selectedTable || selectedHours.length === 0) {
               responseDiv.textContent = "Prosím vyberte stôl a časový rozsah";
               responseDiv.style.color = "red";
               return;
          }

          responseDiv.textContent = "Spracovávam...";
          responseDiv.style.color = "black";

          try {
               const formData = new URLSearchParams();
               formData.append('name', document.getElementById('name').value);
               formData.append('mail', mailInput.value);
               formData.append('phone', phoneInput.value);
               formData.append('persons', document.getElementById('persons').value);
               formData.append('date', document.getElementById('date').value);
               formData.append('table', selectedTable);
               formData.append('startHour', startHourInput.value);
               formData.append('howlong', howlongInput.value);
               formData.append('chairs', chairsInput.value);

               const scriptUrl = 'https://script.google.com/macros/s/AKfycbyHvHpLbw0QKDtOQJiykyzGmYlkDS41bqGhITWTZuyM03ac4Aj5hQarkfD6xifdP9rr/exec';
               const response = await fetch(scriptUrl, {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData
               });

               const result = await response.json();

               if (result.success) {
                    responseDiv.textContent = result.message || "Rezervácia úspešná!";
                    responseDiv.style.color = "green";
                    
                    // Clear selection
                    document.querySelectorAll('.time-slot.selected').forEach(slot => {
                         slot.classList.remove('selected');
                    });
                    selectedTable = null;
                    selectedHours = [];
                    
                    // Refresh the time slots
                    dateInput.dispatchEvent(new Event('change'));
               } else {
                    responseDiv.textContent = result.message || "Chyba pri odosielaní rezervácie";
                    responseDiv.style.color = "red";

                    if (result.conflicts) {
                         // Highlight conflicting slots
                         document.querySelectorAll('.time-slot').forEach(slot => {
                              const slotHour = parseInt(slot.dataset.hour);
                              const slotTable = parseInt(slot.dataset.table);

                              if (slotTable === selectedTable) {
                                   const conflictStart = parseInt(result.conflicts.startHour);
                                   const conflictEnd = parseInt(result.conflicts.endHour.split(':')[0]);
                                   if (slotHour >= conflictStart && slotHour < conflictEnd) {
                                        slot.classList.add('booked');
                                        slot.textContent = '✗';
                                        slot.title = 'Tento čas je už obsadený';
                                   }
                              }
                         });
                    }
               }
          } catch (error) {
               console.error('Error:', error);
               responseDiv.textContent = `Chyba: ${error.message}`;
               responseDiv.style.color = "red";
          }
     });
});
