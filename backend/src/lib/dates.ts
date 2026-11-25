// Datas de calendário como texto 'AAAA-MM-DD'. Evita surpresas de fuso nas contas de dia.

export type Ymd = string;

export function localDate(instant: Date, timeZone: string): Ymd {
  // en-CA formata como AAAA-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

export function ymdToDate(ymd: Ymd): Date {
  return new Date(`${ymd}T00:00:00.000Z`);
}

export function dateToYmd(date: Date): Ymd {
  return date.toISOString().slice(0, 10);
}

export function addDays(ymd: Ymd, days: number): Ymd {
  const d = ymdToDate(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToYmd(d);
}

// Domingo da semana que contém a data.
export function startOfWeek(ymd: Ymd): Ymd {
  return addDays(ymd, -ymdToDate(ymd).getUTCDay());
}

export function isValidYmd(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && dateToYmd(ymdToDate(value)) === value;
}
