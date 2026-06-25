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

export function calcAgeMonths(birthDate: string): number {
  if (!birthDate) return 0
  const birth = new Date(birthDate + 'T00:00:00')
  const now = new Date()
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

// Normalize age_range strings to a sort key 0-5
export function ageRangeOrder(range: string): number {
  const r = range.toUpperCase().replace(/[.\s]/g, '')
  if (r.includes('0') && r.includes('1ANO')) return 0
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

// Fórmula da planilha Portage:
// pontos = sim*1 + as_vezes*0.5
// meses_bracket = (pontos * 12) / total_itens
// idade_desenvolvimental (anos) = soma_meses_todos_brackets / 12
export interface AgeGroupStat {
  key: number
  label: string
  total: number
  sim: number
  asVezes: number
  nao: number
  pontos: number
  mesesBracket: number  // contribuição em meses para a idade desenv.
  pctAcertos: number    // % de acertos (sim / total * 100)
}

export interface AreaDevResult {
  area: string
  groups: AgeGroupStat[]
  idadeDesenvMeses: number   // soma dos meses de todos os brackets
  idadeDesenvAnos: number    // idadeDesenvMeses / 12
  idadeDesenvLabel: string   // ex: "2 anos e 3 meses"
  totalSim: number
  totalAv: number
  totalNao: number
  totalItems: number
  totalPontos: number
}

export function formatDevAge(anos: number): string {
  const totalMeses = Math.round(anos * 12)
  const a = Math.floor(totalMeses / 12)
  const m = totalMeses % 12
  if (a === 0) return `${m} ${m === 1 ? 'mês' : 'meses'}`
  if (m === 0) return `${a} ${a === 1 ? 'ano' : 'anos'}`
  return `${a} ${a === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mês' : 'meses'}`
}

import type { PortageItem, ResponseType } from '../types'

export function calcAreaDevResult(
  area: string,
  items: PortageItem[],
  responses: Record<string, ResponseType>
): AreaDevResult {
  const groupsMap: Record<number, PortageItem[]> = {}
  for (const item of items) {
    const k = ageRangeOrder(item.age_range)
    if (!groupsMap[k]) groupsMap[k] = []
    groupsMap[k].push(item)
  }

  let totalMeses = 0
  let totalSim = 0, totalAv = 0, totalNao = 0, totalPontos = 0
  const groups: AgeGroupStat[] = []

  for (const k of Object.keys(groupsMap).map(Number).sort((a, b) => a - b)) {
    const g = groupsMap[k]
    const sim = g.filter(i => responses[i.id] === 'sim').length
    const av = g.filter(i => responses[i.id] === 'as_vezes').length
    const nao = g.filter(i => responses[i.id] === 'nao').length
    const pontos = sim * 1 + av * 0.5
    const meses = (pontos * 12) / g.length
    totalMeses += meses
    totalSim += sim; totalAv += av; totalNao += nao; totalPontos += pontos
    groups.push({
      key: k,
      label: AGE_RANGE_LABEL[k] ?? `Faixa ${k}`,
      total: g.length,
      sim, asVezes: av, nao,
      pontos,
      mesesBracket: meses,
      pctAcertos: Math.round((sim / g.length) * 100),
    })
  }

  const idadeDesenvAnos = totalMeses / 12
  return {
    area,
    groups,
    idadeDesenvMeses: totalMeses,
    idadeDesenvAnos,
    idadeDesenvLabel: formatDevAge(idadeDesenvAnos),
    totalSim, totalAv, totalNao,
    totalItems: items.length,
    totalPontos,
  }
}
