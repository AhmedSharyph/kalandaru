<script>
(function (global) {

  function injectStyles() {
    if (document.getElementById('kalandaru-styles')) return;
    const style = document.createElement('style');
    style.id = 'kalandaru-styles';
    style.textContent = `
      .calendar-popup {
        position: absolute;
        z-index: 9999;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: Arial, sans-serif;
        font-size: 14px;
        padding: 8px;
        display: none;
        width: 260px;
      }
      .calendar-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }
      .calendar-header select {
        font-size: 13px;
        padding: 2px 4px;
        border-radius: 4px;
        border: 1px solid #bbb;
        background: #f9f9f9;
      }
      .calendar-popup table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
      }
      .calendar-popup th {
        font-weight: bold;
        padding: 4px;
        border-bottom: 1px solid #ddd;
      }
      .calendar-popup td {
        padding: 6px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .calendar-popup td:hover {
        background: #e6f0ff;
      }
      .calendar-popup .today {
        background: #007bff;
        color: #fff;
        font-weight: bold;
      }
      .calendar-popup .selected {
        background: #ff9800;
        color: #fff;
        font-weight: bold;
      }
      .calendar-popup .disabled {
        color: #aaa;
        pointer-events: none;
        background: #f5f5f5;
      }
      .calendar-popup .weekend,
      .calendar-popup .weekend-header {
        color: #d9534f;
        font-weight: bold;
      }
      .calendar-footer {
        display: flex;
        justify-content: space-between;
        margin-top: 6px;
      }
      .calendar-footer button {
        flex: 1;
        margin: 0 2px;
        padding: 5px 0;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .calendar-footer .clearBtn { background: #f0ad4e; color: #fff; }
      .calendar-footer .todayBtn { background: #5cb85c; color: #fff; }
      .calendar-footer .closeBtn { background: #d9534f; color: #fff; }
      .calendar-footer button:hover { opacity: 0.9; }
    `;
    document.head.appendChild(style);
  }

  function Kalandaru() {
    injectStyles();
    this.calendar = document.createElement('div');
    this.calendar.className = 'calendar-popup';
    document.body.appendChild(this.calendar);

    this.activeInput = null;
    this.currentYear = new Date().getFullYear();
    this.currentMonth = new Date().getMonth();

    this.attachGlobalEvents();
  }

  Kalandaru.prototype.renderCalendar = function () {
    const today = new Date();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    let selectedDate = this.activeInput && this.activeInput.value ? new Date(this.activeInput.value) : null;
    let selectedStr = selectedDate && !isNaN(selectedDate.getTime())
      ? selectedDate.toISOString().split('T')[0]
      : null;

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthOptions = months.map((m, i) => {
      return `<option value="${i}" ${i === this.currentMonth ? 'selected' : ''}>${m}</option>`;
    }).join('');

    const yearOptions = Array.from({ length: this.currentYear - 1899 }, (_, i) => 1900 + i)
      .map(y => `<option value="${y}" ${y === this.currentYear ? 'selected' : ''}>${y}</option>`)
      .join('');

    const header = `<div class="calendar-header">
      <select class="monthSelect">${monthOptions}</select>
      <select class="yearSelect">${yearOptions}</select>
    </div>`;

    const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    let table = '<table><tr>';
    weekdays.forEach((d, i) => {
      table += `<th class="${i===5||i===6?'weekend-header':''}">${d}</th>`;
    });
    table += '</tr><tr>';

    for (let i=0;i<firstDay;i++) table += '<td></td>';
    for (let d=1;d<=daysInMonth;d++) {
      const dateObj = new Date(this.currentYear,this.currentMonth,d);
      const dayOfWeek = dateObj.getDay();
      const dateStr = `${this.currentYear}-${String(this.currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const disabled = dateStr > today.toISOString().split('T')[0] ? 'disabled' : '';
      const todayClass = dateStr === today.toISOString().split('T')[0] ? 'today' : '';
      const weekendClass = (dayOfWeek===5||dayOfWeek===6) ? 'weekend' : '';
      const selectedClass = (dateStr === selectedStr) ? 'selected' : '';
      table += `<td class="${disabled} ${todayClass} ${weekendClass} ${selectedClass}" data-date="${dateStr}">${d}</td>`;
      if ((d+firstDay)%7===0) table += '</tr><tr>';
    }
    table += '</tr></table>';

    const footer = `<div class="calendar-footer">
      <button class="clearBtn">Clear</button>
      <button class="todayBtn">Today</button>
      <button class="closeBtn">Close</button>
    </div>`;

    this.calendar.innerHTML = header + table + footer;
  };

  Kalandaru.prototype.showForInput = function (input) {
    this.activeInput = input;
    let selectedDate = input.value ? new Date(input.value) : new Date();
    if (isNaN(selectedDate.getTime())) selectedDate = new Date();
    this.currentYear = selectedDate.getFullYear();
    this.currentMonth = selectedDate.getMonth();
    this.renderCalendar();

    const rect = input.getBoundingClientRect();
    this.calendar.style.top = rect.bottom + window.scrollY + 'px';
    this.calendar.style.left = rect.left + window.scrollX + 'px';
    this.calendar.style.display = 'block';
  };

  Kalandaru.prototype.attachGlobalEvents = function () {
    const self = this;

    document.addEventListener('focusin', function (e) {
      if (e.target.classList.contains('kalandaru-calendar')) {
        self.showForInput(e.target);
      }
    });

    document.addEventListener('click', function (e) {
      if (!self.calendar.contains(e.target) && !e.target.classList.contains('kalandaru-calendar')) {
        self.calendar.style.display = 'none';
      }
    });

    this.calendar.addEventListener('click', function (e) {
      if (e.target.tagName==='TD' && e.target.dataset.date && !e.target.classList.contains('disabled')) {
        self.activeInput.value = e.target.dataset.date;
        self.calendar.style.display='none';
      } else if (e.target.classList.contains('clearBtn')) {
        self.activeInput.value='';
        self.calendar.style.display='none';
      } else if (e.target.classList.contains('todayBtn')) {
        const t = new Date();
        self.activeInput.value = t.toISOString().split('T')[0];
        self.currentMonth = t.getMonth();
        self.currentYear = t.getFullYear();
        self.renderCalendar();
      } else if (e.target.classList.contains('closeBtn')) {
        self.calendar.style.display='none';
      }
    });

    this.calendar.addEventListener('change', function (e) {
      if (e.target.classList.contains('monthSelect')) {
        self.currentMonth = parseInt(e.target.value);
        self.renderCalendar();
      } else if (e.target.classList.contains('yearSelect')) {
        self.currentYear = parseInt(e.target.value);
        self.renderCalendar();
      }
    });
  };

  Kalandaru.validateDate = function (input) {
    input.addEventListener('blur', () => {
      const val = input.value.trim();
      if (!val) return;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        alert('Date must be YYYY-MM-DD'); input.value=''; return;
      }
      const today = new Date().toISOString().split('T')[0];
      if (val > today) { alert('Future dates not allowed'); input.value=''; }
    });
  };

  global.Kalandaru = function () {
    const kal = new Kalandaru();
    document.querySelectorAll('.kalandaru-calendar').forEach(input => {
      Kalandaru.validateDate(input);
    });
    return kal;
  };

})(window);
</script>
