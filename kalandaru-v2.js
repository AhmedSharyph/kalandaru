(function(global){

  // --- Inject CSS dynamically ---
  const css = `
  .kalandaru-calendar {
    position: absolute;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 8px;
    z-index: 1000;
    display: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    width: 250px;
    font-family: Arial, sans-serif;
  }

  .kalandaru-calendar .calendar-header,
  .kalandaru-calendar .calendar-footer {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  .kalandaru-calendar .calendar-header select {
    padding: 4px;
    font-size: 14px;
  }

  .kalandaru-calendar .calendar-header select option.current {
    background-color: #3b82f6;
    color: #fff;
    font-weight: bold;
  }

  .kalandaru-calendar table {
    border-collapse: collapse;
    width: 100%;
  }

  .kalandaru-calendar th,
  .kalandaru-calendar td {
    width: 14.28%;
    text-align: center;
    padding: 2px;
    font-size: 12px;
    cursor: pointer;
  }

  .kalandaru-calendar th { font-weight: bold; }
  .kalandaru-calendar th.weekend-header { color: #ef4444; }

  .kalandaru-calendar td:hover { background: #e0f2fe; }

  .kalandaru-calendar .today {
    border: 2px solid #3b82f6;
    font-weight: bold;
    background: #bfdbfe;
  }

  .kalandaru-calendar .disabled {
    color: #999;
    cursor: not-allowed;
  }

  .kalandaru-calendar .weekend {
    color: #ef4444;
    font-weight: bold;
  }

  .kalandaru-calendar .calendar-footer button {
    flex: 1;
    margin: 0 2px;
    padding: 4px 0;
    font-size: 12px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #f3f4f6;
  }

  .kalandaru-calendar .calendar-footer button:hover { background: #e5e7eb; }

  .kalandaru-calendar .calendar-footer .todayBtn {
    background: #3b82f6;
    color: #fff;
    border-color: #2563eb;
  }

  .kalandaru-calendar .calendar-footer .todayBtn:hover { background: #2563eb; }

  @media (max-width: 500px) {
    .kalandaru-calendar { width: 90%; }
    .kalandaru-calendar .calendar-header,
    .kalandaru-calendar .calendar-footer { flex-direction: column; }
    .kalandaru-calendar .calendar-footer button { margin: 2px 0; }
  }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // --- Kalandaru Library ---
  function Kalandaru(input){
    this.input = input;
    this.calendar = document.createElement('div');
    this.calendar.className = 'kalandaru-calendar';
    document.body.appendChild(this.calendar);

    let today = new Date();
    this.selectedDate = input.value ? new Date(input.value) : today;
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();

    this.renderCalendar();
    this.attachEvents();
  }

  Kalandaru.prototype.renderCalendar = function(){
    const today = new Date();
    const firstDay = new Date(this.currentYear, this.currentMonth,1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth+1,0).getDate();

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthOptions = months.map((m,i)=>{
      const cls = (i===today.getMonth() && this.currentYear===today.getFullYear())?'current':'';
      return `<option value="${i}" class="${cls}" ${i===this.currentMonth?'selected':''}>${m}</option>`;
    }).join('');

    const yearOptions = Array.from({length:this.currentYear-1899},(_,i)=>1900+i)
      .map(y=>`<option value="${y}" ${y===this.currentYear?'selected':''} ${y===today.getFullYear()?'class="current"':''}>${y}</option>`)
      .join('');

    const header = `<div class="calendar-header">
      <select class="monthSelect">${monthOptions}</select>
      <select class="yearSelect">${yearOptions}</select>
    </div>`;

    const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    let table = '<table><tr>';
    weekdays.forEach((d,i)=>{
      table += `<th class="${i===5||i===6?'weekend-header':''}">${d}</th>`;
    });
    table += '</tr><tr>';

    for(let i=0;i<firstDay;i++) table+='<td></td>';
    for(let d=1;d<=daysInMonth;d++){
      const dateObj = new Date(this.currentYear,this.currentMonth,d);
      const dayOfWeek = dateObj.getDay();
      const dateStr = `${this.currentYear}-${String(this.currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const disabled = dateStr>today.toISOString().split('T')[0]?'disabled':''; 
      const todayClass = dateStr===today.toISOString().split('T')[0]?'today':'';
      const weekendClass = (dayOfWeek===5||dayOfWeek===6)?'weekend':'';
      table += `<td class="${disabled} ${todayClass} ${weekendClass}" data-date="${dateStr}">${d}</td>`;
      if((d+firstDay)%7===0) table+='</tr><tr>';
    }
    table+='</tr></table>';

    const footer = `<div class="calendar-footer">
      <button class="clearBtn">Clear</button>
      <button class="todayBtn">Today</button>
      <button class="closeBtn">Close</button>
    </div>`;

    this.calendar.innerHTML = header + table + footer;
  };

  Kalandaru.prototype.attachEvents = function(){
    const self = this;
    this.input.addEventListener('focus', ()=>{
      const rect = self.input.getBoundingClientRect();
      self.calendar.style.top = rect.bottom + window.scrollY + 'px';
      self.calendar.style.left = rect.left + window.scrollX + 'px';
      self.calendar.style.display = 'block';
      self.renderCalendar();
    });

    document.addEventListener('click', e=>{
      if(!self.calendar.contains(e.target) && e.target!==self.input){
        self.calendar.style.display='none';
      }
    });

    this.calendar.addEventListener('click', e=>{
      if(e.target.tagName==='TD' && e.target.dataset.date && !e.target.classList.contains('disabled')){
        self.input.value = e.target.dataset.date;
        self.calendar.style.display='none';
      } else if(e.target.classList.contains('clearBtn')){
        self.input.value='';
        self.calendar.style.display='none';
      } else if(e.target.classList.contains('todayBtn')){
        const t = new Date();
        self.input.value = t.toISOString().split('T')[0];
        self.currentMonth = t.getMonth();
        self.currentYear = t.getFullYear();
        self.renderCalendar();
      } else if(e.target.classList.contains('closeBtn')){
        self.calendar.style.display='none';
      }
    });

    this.calendar.addEventListener('change', e=>{
      if(e.target.classList.contains('monthSelect')){
        self.currentMonth = parseInt(e.target.value);
        self.renderCalendar();
      } else if(e.target.classList.contains('yearSelect')){
        self.currentYear = parseInt(e.target.value);
        self.renderCalendar();
      }
    });
  };

  Kalandaru.validateDate = function(input){
    input.addEventListener('blur', ()=>{
      const val = input.value.trim();
      if(!val) return;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(val)){
        alert('Date must be YYYY-MM-DD'); input.value=''; return;
      }
      const today = new Date().toISOString().split('T')[0];
      if(val>today){ alert('Future dates not allowed'); input.value=''; }
    });
  };

  global.Kalandaru = function(input){
    if(!input) return;
    Kalandaru.validateDate(input);
    return new Kalandaru(input);
  };

})(window);
