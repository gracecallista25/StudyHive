import { useState } from 'react';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  selectValue?: string;
  onSelectChange?: (value: string) => void;
  options?: { value: string; label: string }[];
}
export function FormField({ label, name, error, hint, options, selectValue, onSelectChange, type = 'text', ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  const id = 'auth-' + name;
  const describedBy = [hint && id + '-hint', error && id + '-error'].filter(Boolean).join(' ') || undefined;
  return <div className={'auth-field' + (error ? ' has-error' : '')}>
    <label htmlFor={id}>{label}</label>
    <div className="auth-control">
      {options ? <><select id={id} name={name} required={inputProps.required} disabled={inputProps.disabled} value={selectValue} defaultValue={selectValue === undefined ? "" : undefined} onChange={event => onSelectChange?.(event.target.value)} aria-invalid={!!error} aria-describedby={describedBy}>
        <option value="" disabled>{inputProps.placeholder ?? 'Choose an option'}</option>
        {options.map(o => <option value={o.value} key={o.value}>{o.label}</option>)}
      </select><ChevronDown size={17} className="auth-chevron"/></> :
      <input {...inputProps} id={id} name={name} type={password && visible ? 'text' : type} aria-invalid={!!error} aria-describedby={describedBy} className={password ? 'password-input' : ''}/>}
      {password && <button className="password-toggle" type="button" aria-label={(visible ? 'Hide ' : 'Show ') + label.toLowerCase()} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={19}/> : <Eye size={19}/>}</button>}
    </div>
    {hint && <p id={id + '-hint'} className="field-hint">{hint}</p>}
    {error && <p id={id + '-error'} className="field-error">{error}</p>}
  </div>;
}
