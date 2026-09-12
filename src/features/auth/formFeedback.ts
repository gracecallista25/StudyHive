// Presentation-only feedback. The backend must enforce its own validation rules.
export function formErrors(form: HTMLFormElement): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement) || !element.name) continue;
    if (!element.validity.valid) errors[element.name] = element.validationMessage;
    else if (element.required && !element.value.trim()) errors[element.name] = 'Please fill in this field.';
  }
  const password = form.elements.namedItem('password') as HTMLInputElement | null;
  const confirmation = form.elements.namedItem('confirm_password') as HTMLInputElement | null;
  if (password && confirmation && confirmation.value && password.value !== confirmation.value) {
    errors.confirm_password = 'Your passwords do not match.';
  }
  const first = form.elements.namedItem(Object.keys(errors)[0] ?? '');
  if (first instanceof HTMLElement) first.focus();
  return errors;
}
