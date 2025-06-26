class SlovakCalendar {
    constructor() {
        this.selectedDates = [];
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.firstDay = null;
        this.lastDay = null;
        this.holidayCache = {};
        this.calendarBox = document.querySelector(".Calendar-table");
        this.chooseBtn = document.querySelector(".Calendar-choose");
        this.valueDisplay = document.querySelector(".Calendar-value p");
        this.body = document.querySelector("body");

        // Slovak day names (abbreviated) - Sunday first for correct indexing
        this.slovakDayNames = ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"];

        this.init();
    }

    async init() {
        try {
            const dates = await this.fetchAvailableDates();
            this.firstDay = dates.firstDay;
            this.lastDay = dates.lastDay;
            this.setupEventListeners();
        } catch (error) {
            console.error("Failed to initialize calendar:", error);
            this.valueDisplay.textContent = "Calendar unavailable";
        }
    }

    setupEventListeners() {
        this.chooseBtn.addEventListener("click", () => {
            this.toggleCalendarVisibility();
            if (this.calendarBox.classList.contains("visible")) {
                this.renderCalendar(this.currentMonth, this.currentYear);
            }
        });

        document.addEventListener("click", (e) => {
            if (!this.calendarBox.contains(e.target) && 
                e.target !== this.chooseBtn && 
                !this.chooseBtn.contains(e.target)) {
                this.calendarBox.classList.remove("visible");
                this.body.classList.remove("visible");
            }
        });
    }

    toggleCalendarVisibility() {
        this.calendarBox.classList.toggle("visible");
        this.calendarBox.setAttribute("aria-hidden", 
            !this.calendarBox.classList.contains("visible"));
        this.body.classList.toggle("visible");
    }

    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
    }

    getSlovakHolidays(year) {
        if (this.holidayCache[year]) {
            return this.holidayCache[year];
        }

        const fixedHolidays = [
            `${year}-01-01`, `${year}-01-06`, `${year}-05-01`, `${year}-05-08`,
            `${year}-07-05`, `${year}-08-29`, `${year}-09-01`, `${year}-09-15`,
            `${year}-11-01`, `${year}-11-17`, `${year}-12-24`, `${year}-12-25`, `${year}-12-26`
        ];

        // Easter calculation
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
        goodFriday.setDate(easter.getDate() - 2);
        const easterMonday = new Date(easter);
        easterMonday.setDate(easter.getDate() + 1);

        const variableHolidays = [
            this.formatDate(goodFriday),
            this.formatDate(easterMonday),
        ];

        const holidays = [...fixedHolidays, ...variableHolidays];
        this.holidayCache[year] = holidays;
        return holidays;
    }

    async fetchAvailableDates() {
        /*
        const response = await fetch("https://script.google.com/macros/s/AKfycbzDhY_99qjHQUceJCcJ_YfCOT6I1-V0k9aN7BuPMMskwIoNvUNs38gQdWHe79vi3X7V/exec", {
            method: "POST"
        });
        const data = await response.json();

        if (data.success) {
            return {
                firstDay: new Date(data.firstDay),
                lastDay: new Date(data.lastDay),
            };
        } else {
            console.error(data.message);
            throw new Error("Failed to fetch dates from server.");
        }
        */

        const fd = new Date();
        const ld = new Date(fd);
        ld.setDate(fd.getDate() + 12);
        return {
            firstDay: fd,
            lastDay: ld
        };

    }

    hasValidDaysInMonth(checkMonth, checkYear) {
        const start = new Date(checkYear, checkMonth, 1);
        const end = new Date(checkYear, checkMonth + 1, 0);
        const holidays = this.getSlovakHolidays(checkYear);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const fd = this.formatDate(d);
            if (d >= this.firstDay && d <= this.lastDay && 
                !holidays.includes(fd) && !this.isWeekend(d)) {
                return true;
            }
        }
        return false;
    }

    normalizeDate(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    renderCalendar(month, year) {
        this.calendarBox.innerHTML = "";
        this.currentMonth = month;
        this.currentYear = year;

        const holidays = this.getSlovakHolidays(year);
        const today = this.formatDate(new Date());

        const header = document.createElement("div");
        header.className = "Calendar-header";

        const title = document.createElement("span");
        title.textContent = new Date(year, month).toLocaleDateString('sk-SK', {
            month: 'long',
            year: 'numeric'
        });

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "<";
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            if (month === 0) {
                this.renderCalendar(11, year - 1);
            } else {
                this.renderCalendar(month - 1, year);
            }
        };

        const nextBtn = document.createElement("button");
        nextBtn.textContent = ">";
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            if (month === 11) {
                this.renderCalendar(0, year + 1);
            } else {
                this.renderCalendar(month + 1, year);
            }
        };

        if (!this.hasValidDaysInMonth(month === 0 ? 11 : month - 1, month === 0 ? year - 1 : year)) {
            prevBtn.disabled = true;
        }

        if (!this.hasValidDaysInMonth(month === 11 ? 0 : month + 1, month === 11 ? year + 1 : year)) {
            nextBtn.disabled = true;
        }

        header.appendChild(prevBtn);
        header.appendChild(title);
        header.appendChild(nextBtn);
        this.calendarBox.appendChild(header);

        // Create day names header
        const dayNamesRow = document.createElement("div");
        dayNamesRow.className = "Calendar-day-names";

        // Add day names (Ne to So)
        for (let i = 0; i < 7; i++) {
            const dayName = document.createElement("div");
            dayName.className = "day-name";
            dayName.textContent = this.slovakDayNames[i];
            dayNamesRow.appendChild(dayName);
        }
        this.calendarBox.appendChild(dayNamesRow);

        // Create calendar grid
        const calendarGrid = document.createElement("div");
        calendarGrid.className = "Calendar-grid";

        const firstDayOfMonth = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
        const startingDayOfWeek = firstDayOfMonth.getDay();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement("div");
            emptyDay.className = "Calendar-day empty";
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const fullDate = this.formatDate(date);
            const dayOfWeek = date.getDay();

            const dayBtn = document.createElement("button");
            dayBtn.className = "Calendar-day";

            // Add day number and Slovak day name
            dayBtn.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-name">${this.slovakDayNames[dayOfWeek]}</div>
                `;

            dayBtn.dataset.fullDate = fullDate;

            const isHoliday = holidays.includes(fullDate);
            const isWeekend = this.isWeekend(date);

            if (isHoliday || isWeekend) {
                dayBtn.disabled = true;
                dayBtn.classList.add("disabled");

                if (isWeekend) {
                    dayBtn.classList.add("weekend");
                }
            }

            if (fullDate === today) {
                dayBtn.classList.add("today");
            }
            if (!isHoliday && !isWeekend && 
                this.normalizeDate(date) >= this.normalizeDate(this.firstDay) && 
                this.normalizeDate(date) <= this.normalizeDate(this.lastDay)){
                dayBtn.onclick = () => {
                    this.selectedDates = [date];
                    this.valueDisplay.textContent = `${this.formatDate(date)} (${this.slovakDayNames[dayOfWeek]})`;
                    this.renderCalendar(month, year);

                    const dateInput = document.getElementById("dateInput");
                    if (dateInput) {
                        dateInput.value = this.formatDate(date);  // YYYY-MM-DD format
                        dateInput.dispatchEvent(new Event("change")); // optional, to trigger any listeners;
                    }
                };
            } else {
                dayBtn.disabled = true;
            }

            if (this.selectedDates.length && this.formatDate(this.selectedDates[0]) === fullDate) {
                dayBtn.classList.add("selected");
            }

            calendarGrid.appendChild(dayBtn);
        }

        this.calendarBox.appendChild(calendarGrid);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    new SlovakCalendar();
});

