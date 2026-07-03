export interface Patient {
  id: string
  name: string
  birthDate: string
  diagnosis: string
  responsibleName: string
  photoBase64?: string
  createdAt: string
}

export interface PortageItem {
  id: string
  area: string
  age_range: string
  number: string
  text: string
}

export type ResponseType = 'sim' | 'nao' | 'as_vezes' | null

export interface StudentInfo {
  name: string
  birthDate: string
  diagnosis: string
  age: string
  date: string
}

export interface Assessment {
  id: string
  childId: string
  studentInfo: StudentInfo
  responses: Record<string, ResponseType>
  createdAt: string
  updatedAt: string
}

export const AREAS = [
  'I – ÁREA SOCIABILIZAÇÃO',
  'IIa – LINGUAGEM RECEPTIVA',
  'IIb – LINGUAGEM EXPRESSIVA',
  'III – ÁREA CUIDADOS PRÓPRIOS',
  'IV- ÁREA COGNITIVA',
  'V. ÁREA PSICOMOTORA',
] as const

export const AREA_COLOR: Record<string, { bg: string; header: string; text: string; badge: string; light: string }> = {
  'I – ÁREA SOCIABILIZAÇÃO':      { bg: 'bg-purple-50 border-purple-200', header: 'bg-purple-600', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', light: 'bg-purple-100' },
  'IIa – LINGUAGEM RECEPTIVA':    { bg: 'bg-blue-50 border-blue-200',     header: 'bg-blue-600',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',   light: 'bg-blue-100'   },
  'IIb – LINGUAGEM EXPRESSIVA':   { bg: 'bg-cyan-50 border-cyan-200',     header: 'bg-cyan-600',   text: 'text-cyan-700',   badge: 'bg-cyan-100 text-cyan-700',   light: 'bg-cyan-100'   },
  'III – ÁREA CUIDADOS PRÓPRIOS': { bg: 'bg-green-50 border-green-200',   header: 'bg-green-600',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700',  light: 'bg-green-100'  },
  'IV- ÁREA COGNITIVA':           { bg: 'bg-orange-50 border-orange-200', header: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', light: 'bg-orange-100' },
  'V. ÁREA PSICOMOTORA':          { bg: 'bg-red-50 border-red-200',       header: 'bg-red-600',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',     light: 'bg-red-100'    },
}
