const ZONE = 'America/Detroit';
const RECEIVER = 'Bremcilroy@gmail.com';
const easternParts = value => Object.fromEntries(new Intl.DateTimeFormat('en-US', {
  timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
}).formatToParts(new Date(value)).filter(p => p.type !== 'literal').map(p => [p.type, p.value]));
const dateString = p => `${p.year}-${p.month}-${p.day}`;
const addDays = (date, days) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};
export function requestWindow(now = Date.now()) {
  const today = dateString(easternParts(now));
  return { min: addDays(today, 2), max: addDays(today, 90) };
}
export function michiganTimestamp(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return NaN;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (hour > 23 || minute > 59 || month < 1 || month > 12 || day < 1 || day > 31) return NaN;
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let value = desired;
  for (let i = 0; i < 3; i++) {
    const p = easternParts(value);
    const represented = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
    value += desired - represented;
  }
  const p = easternParts(value);
  return dateString(p) === date && `${p.hour}:${p.minute}` === time ? value : NaN;
}
export function validateAppointment(date, time, now = Date.now()) {
  const timestamp = michiganTimestamp(date, time);
  if (!Number.isFinite(timestamp)) return 'Choose a valid date and time in Michigan time.';
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (![0, 3, 6].includes(day)) return 'Please choose a Wednesday, Saturday, or Sunday.';
  if (timestamp - now < 48 * 60 * 60 * 1000) return 'Please allow at least 48 hours before your requested session.';
  if (date > requestWindow(now).max) return 'Please choose a date no more than 90 days ahead.';
  return '';
}
export function prepareRequest(values) {
  const body = [
    'Photography session request — Bre Lynn Photography', '',
    `Name: ${values.clientName}`, `Reply email: ${values.clientEmail}`,
    `Session: ${values.sessionType}`, `Preferred date: ${values.sessionDate}`,
    `Preferred time: ${values.sessionTime} (${ZONE})`,
    `Location / area: ${values.location}`, `Participants: ${values.participants}`, '',
    'Session details:', values.details || 'Not specified', '',
    'Other requests:', values.notes || 'None', '',
    'I understand this is a request. Bre must approve the date, package, total, agreement, and deposit before confirming the appointment.'
  ].join('\n');
  return { body, href: `mailto:${RECEIVER}?subject=${encodeURIComponent('Bre Lynn Photography — Session Request')}&body=${encodeURIComponent(body)}` };
}

if (typeof document !== 'undefined') {
  const form = document.querySelector('#photography-request');
  if (form) {
    const date = form.querySelector('#session-date');
    const time = form.querySelector('#session-time');
    const session = form.querySelector('#session-type');
    const question = form.querySelector('[data-session-question]');
    const error = form.querySelector('[data-booking-error]');
    const status = form.querySelector('[data-booking-status]');
    const preview = document.createElement('div');
    preview.className = 'email-preview';
    preview.hidden = true;
    const intro = document.createElement('p');
    intro.textContent = 'Your request is ready. Open your email app, review it, and send it to Bre. You can also copy the message below into an email.';
    const emailLink = document.createElement('a');
    emailLink.className = 'button';
    emailLink.textContent = 'Open email app →';
    const label = document.createElement('label');
    label.htmlFor = 'request-message';
    label.textContent = 'Prepared request message';
    const message = document.createElement('textarea');
    message.id = 'request-message'; message.rows = 12; message.readOnly = true;
    preview.append(intro, emailLink, label, message);
    form.append(preview);
    const limits = requestWindow();
    date.min = limits.min; date.max = limits.max;
    form.hidden = false;
    const prompts = {
      'Portraits': 'Preferred style, location ideas, and outfit ideas',
      'Couples & Engagements': 'Occasion, preferred style, poses, and special requests',
      'Families': 'Group arrangements, location ideas, and any accessibility or preparation needs',
      'Senior Portraits': 'School, graduation year, outfits, and preferred locations',
      'Graduation': 'High school or college, cap-and-gown details, and family photographs',
      'Creative & Modeling': 'Theme, inspiration, outfits, and creative concept',
      'Concerts & Events': 'Venue, schedule, event size, and important moments',
      'Seasonal Memories Mini': 'Preferred seasonal or holiday theme and any event date discussed with Bre'
    };
    const clear = () => { error.hidden = true; date.setCustomValidity(''); time.setCustomValidity(''); preview.hidden = true; status.textContent = ''; };
    form.addEventListener('input', clear);
    session.addEventListener('change', () => { clear(); question.textContent = prompts[session.value]; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      const problem = validateAppointment(date.value, time.value);
      if (problem) { error.textContent = problem; error.hidden = false; preview.hidden = true; date.focus(); return; }
      const values = Object.fromEntries(new FormData(form).entries());
      const result = prepareRequest(values);
      message.value = result.body;
      emailLink.href = result.href;
      preview.hidden = false;
      status.textContent = 'Email prepared. Your request has not been sent and your appointment is not confirmed.';
      emailLink.focus();
    });
  }
}
