/**
 * DatePicker & TimePicker Components
 * Advanced Date/Time selection with vanilla JS
 */

const DatePicker = {
  /**
   * Initialize a date picker on an input element
   */
  init(inputId, options = {}) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const config = {
      format: options.format || 'YYYY-MM-DD',
      minDate: options.minDate || null,
      maxDate: options.maxDate || null,
      disabledDates: options.disabledDates || [],
      onChange: options.onChange || null,
      showTodayBtn: options.showTodayBtn !== false,
      placeholder: options.placeholder || 'Select date'
    };

    input.placeholder = config.placeholder;
    input.readOnly = true;
    input.style.cursor = 'pointer';

    const wrapper = document.createElement('div');
    wrapper.className = 'datepicker-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const calendar = document.createElement('div');
    calendar.className = 'datepicker-calendar';
    calendar.innerHTML = this.renderCalendar(new Date(), config);
    wrapper.appendChild(calendar);

    let currentDate = new Date();
    let selectedDate = null;

    input.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.datepicker-calendar.show').forEach(c => c.classList.remove('show'));
      calendar.classList.toggle('show');
    });

    calendar.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = e.target;

      if (target.classList.contains('datepicker-prev')) {
        currentDate.setMonth(currentDate.getMonth() - 1);
        calendar.innerHTML = this.renderCalendar(currentDate, config, selectedDate);
      } else if (target.classList.contains('datepicker-next')) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        calendar.innerHTML = this.renderCalendar(currentDate, config, selectedDate);
      } else if (target.classList.contains('datepicker-day') && !target.classList.contains('disabled')) {
        selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(target.textContent));
        input.value = this.formatDate(selectedDate, config.format);
        calendar.classList.remove('show');
        if (config.onChange) config.onChange(selectedDate, input.value);
      } else if (target.classList.contains('datepicker-today')) {
        selectedDate = new Date();
        currentDate = new Date();
        input.value = this.formatDate(selectedDate, config.format);
        calendar.innerHTML = this.renderCalendar(currentDate, config, selectedDate);
        calendar.classList.remove('show');
        if (config.onChange) config.onChange(selectedDate, input.value);
      } else if (target.classList.contains('datepicker-clear')) {
        selectedDate = null;
        input.value = '';
        calendar.innerHTML = this.renderCalendar(currentDate, config, selectedDate);
        calendar.classList.remove('show');
        if (config.onChange) config.onChange(null, '');
      }
    });

    document.addEventListener('click', () => calendar.classList.remove('show'));

    return {
      getValue: () => selectedDate,
      setValue: (date) => {
        selectedDate = date ? new Date(date) : null;
        input.value = selectedDate ? this.formatDate(selectedDate, config.format) : '';
        currentDate = selectedDate ? new Date(selectedDate) : new Date();
        calendar.innerHTML = this.renderCalendar(currentDate, config, selectedDate);
      },
      clear: () => {
        selectedDate = null;
        input.value = '';
      }
    };
  },

  renderCalendar(date, config, selectedDate = null) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let html = `
      <div class="datepicker-header">
        <button type="button" class="datepicker-prev">‹</button>
        <span class="datepicker-title">${monthNames[month]} ${year}</span>
        <button type="button" class="datepicker-next">›</button>
      </div>
      <div class="datepicker-weekdays">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>
      <div class="datepicker-days">
    `;

    for (let i = 0; i < firstDay; i++) {
      html += '<span class="datepicker-day empty"></span>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateCheck = new Date(year, month, day);
      let classes = ['datepicker-day'];

      if (today.toDateString() === currentDateCheck.toDateString()) classes.push('today');
      if (selectedDate && selectedDate.toDateString() === currentDateCheck.toDateString()) classes.push('selected');
      if (config.minDate && currentDateCheck < new Date(config.minDate)) classes.push('disabled');
      if (config.maxDate && currentDateCheck > new Date(config.maxDate)) classes.push('disabled');

      html += `<span class="${classes.join(' ')}">${day}</span>`;
    }

    html += '</div>';

    if (config.showTodayBtn) {
      html += `
        <div class="datepicker-footer">
          <button type="button" class="datepicker-clear">Clear</button>
          <button type="button" class="datepicker-today">Today</button>
        </div>
      `;
    }

    return html;
  },

  formatDate(date, format) {
    const pad = (n) => n.toString().padStart(2, '0');
    return format
      .replace('YYYY', date.getFullYear())
      .replace('MM', pad(date.getMonth() + 1))
      .replace('DD', pad(date.getDate()));
  }
};

const TimePicker = {
  /**
   * Initialize a time picker on an input element
   */
  init(inputId, options = {}) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const config = {
      format: options.format || '24h', // '12h' or '24h'
      step: options.step || 15, // minutes step
      minTime: options.minTime || '00:00',
      maxTime: options.maxTime || '23:59',
      onChange: options.onChange || null,
      placeholder: options.placeholder || 'Select time'
    };

    input.placeholder = config.placeholder;
    input.readOnly = true;
    input.style.cursor = 'pointer';

    const wrapper = document.createElement('div');
    wrapper.className = 'timepicker-wrapper';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    const dropdown = document.createElement('div');
    dropdown.className = 'timepicker-dropdown';
    dropdown.innerHTML = this.renderTimeList(config);
    wrapper.appendChild(dropdown);

    let selectedTime = null;

    input.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.timepicker-dropdown.show').forEach(d => d.classList.remove('show'));
      dropdown.classList.toggle('show');
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target.classList.contains('timepicker-option')) {
        selectedTime = e.target.dataset.time;
        input.value = config.format === '12h' ? this.to12Hour(selectedTime) : selectedTime;
        dropdown.querySelectorAll('.timepicker-option').forEach(o => o.classList.remove('selected'));
        e.target.classList.add('selected');
        dropdown.classList.remove('show');
        if (config.onChange) config.onChange(selectedTime, input.value);
      }
    });

    document.addEventListener('click', () => dropdown.classList.remove('show'));

    return {
      getValue: () => selectedTime,
      setValue: (time) => {
        selectedTime = time;
        input.value = time ? (config.format === '12h' ? this.to12Hour(time) : time) : '';
      },
      clear: () => {
        selectedTime = null;
        input.value = '';
      }
    };
  },

  renderTimeList(config) {
    let html = '<div class="timepicker-list">';
    const [minH, minM] = config.minTime.split(':').map(Number);
    const [maxH, maxM] = config.maxTime.split(':').map(Number);
    const minMinutes = minH * 60 + minM;
    const maxMinutes = maxH * 60 + maxM;

    for (let minutes = minMinutes; minutes <= maxMinutes; minutes += config.step) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const display = config.format === '12h' ? this.to12Hour(time24) : time24;
      html += `<div class="timepicker-option" data-time="${time24}">${display}</div>`;
    }

    html += '</div>';
    return html;
  },

  to12Hour(time24) {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
  }
};

const DateRangePicker = {
  /**
   * Initialize a date range picker
   */
  init(startInputId, endInputId, options = {}) {
    const startPicker = DatePicker.init(startInputId, {
      ...options,
      placeholder: options.startPlaceholder || 'Start date',
      onChange: (date, value) => {
        if (options.onChange) options.onChange({ start: date, end: endPicker.getValue() });
      }
    });

    const endPicker = DatePicker.init(endInputId, {
      ...options,
      placeholder: options.endPlaceholder || 'End date',
      onChange: (date, value) => {
        if (options.onChange) options.onChange({ start: startPicker.getValue(), end: date });
      }
    });

    return {
      getRange: () => ({ start: startPicker.getValue(), end: endPicker.getValue() }),
      setRange: (start, end) => {
        startPicker.setValue(start);
        endPicker.setValue(end);
      },
      clear: () => {
        startPicker.clear();
        endPicker.clear();
      }
    };
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DatePicker, TimePicker, DateRangePicker };
}
