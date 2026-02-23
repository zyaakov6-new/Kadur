const HEBREW_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export function getRelativeDay(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const gameDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((gameDay.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return 'היום';
  if (diffDays === 1) return 'מחר';
  if (diffDays > 1 && diffDays < 7) return `יום ${HEBREW_DAYS[date.getDay()]}`;
  return `${date.getDate()} ${HEBREW_MONTHS[date.getMonth()]}`;
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export function formatFullDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `יום ${HEBREW_DAYS[date.getDay()]}, ${date.getDate()} ${HEBREW_MONTHS[date.getMonth()]}`;
}

export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'עכשיו';
  if (diffMins < 60) return `לפני ${diffMins} דק׳`;

  return formatTime(timestamp);
}

export function getDateChips(): { label: string; timestamp: number }[] {
  const chips: { label: string; timestamp: number }[] = [];
  const now = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const label = i === 0 ? 'היום' : i === 1 ? 'מחר' : `יום ${HEBREW_DAYS[date.getDay()]}`;
    const shortDate = `${date.getDate()}/${date.getMonth() + 1}`;
    chips.push({
      label: `${label} ${shortDate}`,
      timestamp: date.getTime(),
    });
  }

  return chips;
}

export function getTimeSlots(): { label: string; hours: number; minutes: number }[] {
  return [
    { label: '16:00', hours: 16, minutes: 0 },
    { label: '17:00', hours: 17, minutes: 0 },
    { label: '17:30', hours: 17, minutes: 30 },
    { label: '18:00', hours: 18, minutes: 0 },
    { label: '19:00', hours: 19, minutes: 0 },
    { label: '19:30', hours: 19, minutes: 30 },
    { label: '20:00', hours: 20, minutes: 0 },
    { label: '20:30', hours: 20, minutes: 30 },
    { label: '21:00', hours: 21, minutes: 0 },
    { label: '22:00', hours: 22, minutes: 0 },
  ];
}

export function getHebrewDayName(date: Date): string {
  return HEBREW_DAYS[date.getDay()];
}
