function formatDate(date) {
     const d = new Date(date);
     const year = d.getFullYear();
     const month = String(d.getMonth() + 1).padStart(2, '0');
     const day = String(d.getDate()).padStart(2, '0');
     return `${year}-${month}-${day}`;
}

document.addEventListener('DOMContentLoaded', function() {
     const dateInput = document.getElementById('dateInput');
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

          const response = await fetch('https://script.google.com/macros/s/AKfycbxMX8_vNqxUS_F2rzNn9c2SajZ4oc_2mzwTbKFHVrTD0H6Zhd-wGL9U5CYUkqHqaknX/exec', {
               method: 'POST',
               headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
               },
               body: formData
          });


        const data = await response.json();

               if (data.success) {
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
               formData.append('date', document.getElementById('dateInput').value);
               formData.append('table', selectedTable);
               formData.append('startHour', startHourInput.value);
               formData.append('howlong', howlongInput.value);
               formData.append('chairs', chairsInput.value);

               const scriptUrl = 'https://script.google.com/macros/s/AKfycbxDZ-bi3FiVqSlavld9P7cmG2p3xgDXFqrIVbao89drw8vfzClx1LAKspp9EExgfyUv/exec';
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
