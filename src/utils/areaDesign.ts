export const AREA_HUE: Record<string, number> = {
  'I – ÁREA SOCIABILIZAÇÃO':      224,
  'IIa – LINGUAGEM RECEPTIVA':    190,
  'IIb – LINGUAGEM EXPRESSIVA':   210,
  'III – ÁREA CUIDADOS PRÓPRIOS': 150,
  'IV- ÁREA COGNITIVA':           40,
  'V. ÁREA PSICOMOTORA':          6,
}

export const AREA_NUM: Record<string, string> = {
  'I – ÁREA SOCIABILIZAÇÃO':      'I',
  'IIa – LINGUAGEM RECEPTIVA':    'IIa',
  'IIb – LINGUAGEM EXPRESSIVA':   'IIb',
  'III – ÁREA CUIDADOS PRÓPRIOS': 'III',
  'IV- ÁREA COGNITIVA':           'IV',
  'V. ÁREA PSICOMOTORA':          'V',
}

export function areaHue(area: string): number { return AREA_HUE[area] ?? 214 }

export function areaVars(area: string): Record<string, string> {
  const h = areaHue(area)
  return {
    '--ah': String(h),
    '--a-solid': `hsl(${h} 46% 47%)`,
    '--a-text': `hsl(${h} 48% 38%)`,
    '--a-bg': `hsl(${h} 52% 96%)`,
    '--a-line': `hsl(${h} 42% 87%)`,
    '--a-strong': `hsl(${h} 46% 43%)`,
  }
}
