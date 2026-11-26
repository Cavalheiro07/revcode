import { translate } from '../i18n/index.jsx';

// As 10 categorias do dataset 3 (Injetora). A chave é a mesma usada no gabarito.
export const CATEGORIES = [
  { id: 'nome_generico', label: 'Nome genérico' },
  { id: 'comentario_ruim', label: 'Comentário ruim' },
  { id: 'codigo_morto', label: 'Código morto' },
  { id: 'condicional_confusa', label: 'Condicional confusa' },
  { id: 'magic_values', label: 'Valores mágicos' },
  { id: 'retorno_inconsistente', label: 'Retorno inconsistente' },
  { id: 'efeito_colateral', label: 'Efeito colateral' },
  { id: 'erro_vago', label: 'Erro vago' },
  { id: 'duplicacao', label: 'Duplicação' },
  { id: 'multiplas_responsabilidades', label: 'Múltiplas responsabilidades' },
];

const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

export function categoryLabel(id) {
  return LABELS[id] ? translate(LABELS[id]) : id;
}
