const isEmpty = (value) => value == null || String(value).trim() === "";

export const required = (value) =>
  isEmpty(value) ? "Campo obrigatório." : null;

export const minLength = (length) => (value) =>
  !isEmpty(value) && String(value).trim().length < length
    ? `Use ao menos ${length} caracteres.`
    : null;

export const maxLength = (length) => (value) =>
  String(value ?? "").length > length
    ? `Use no máximo ${length} caracteres.`
    : null;

export const email = (value) =>
  !isEmpty(value) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ? "Informe um e-mail válido."
    : null;

export const oneOf = (allowed) => (value) =>
  !isEmpty(value) && !allowed.includes(value)
    ? "Selecione uma opção válida."
    : null;

export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

export const validateForm = (data, schema) => {
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(data[field], rules);
    if (error) errors[field] = error;
  }
  return { valid: Object.keys(errors).length === 0, errors };
};
