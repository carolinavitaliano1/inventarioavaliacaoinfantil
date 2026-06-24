export function calcAge(birthDate: string): string {
  if (!birthDate) return ''
  const birth = new Date(birthDate + 'T00:00:00')
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) { years--; months += 12 }
  if (now.getDate() < birth.getDate()) months--
  if (months < 0) { years--; months += 11 }
  if (years === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`
  if (months === 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`
}

// Normalize age_range strings to a sort key 0-5
export function ageRangeOrder(range: string): number {
  const r = range.toUpperCase()
  if (r.includes('0') && r.includes('1')) return 0
  if (r.includes('1') && r.includes('2')) return 1
  if (r.includes('2') && r.includes('3')) return 2
  if (r.includes('3') && r.includes('4')) return 3
  if (r.includes('4') && r.includes('5')) return 4
  if (r.includes('5') && r.includes('6')) return 5
  return 99
}

export const AGE_RANGE_LABEL: Record<number, string> = {
  0: '0–1 ano',
  1: '1–2 anos',
  2: '2–3 anos',
  3: '3–4 anos',
  4: '4–5 anos',
  5: '5–6 anos',
}
