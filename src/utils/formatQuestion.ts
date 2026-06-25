/**
 * Transforma o texto original do item Portage em pergunta acessível para cuidadores.
 * Mantém o sentido original sem copiar literalmente.
 */
export function formatQuestion(text: string): string {
  // Remove número do item (ex: "001.", "012.", "1.")
  let t = text.replace(/^\d+\.\s*/, '').trim()

  // Remove ponto final, reticências ou ponto e vírgula no fim
  t = t.replace(/[.;…]+$/, '').trim()

  // Lowercase primeira letra
  const lower = t.charAt(0).toLowerCase() + t.slice(1)

  // Constrói a pergunta no estilo cuidador
  return `A criança ${lower}?`
}
