import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { Button } from '../../shared/components';
import type { Degree, RegisterInput } from './auth';
import { FormField, formErrors, registerAccount, registrationEnabled, degreeOptions, majorsByDegree, maxYearByDegree } from './auth';

export function RegisterPage() {
  const [degree, setDegree] = useState<Degree | ''>('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [serverError, setServerError] = useState('');
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const submitting = useRef(false);

  function clearFormMessages() {
    setFeedback('');
    setServerError('');
    setErrors({});
  }

  function handleDegreeChange(value: string) {
    setDegree(value as Degree);
    setMajor('');
    setYear('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || complete) return;

    const form = event.currentTarget;
    const nextErrors = formErrors(form);
    setErrors(nextErrors);
    setFeedback('');
    setServerError('');
    if (Object.keys(nextErrors).length || !degree) return;

    if (!registrationEnabled) {
      setFeedback('Your form is ready, but registration is not connected yet. No account was created and no details were sent.');
      return;
    }

    const values = new FormData(form);
    const input: RegisterInput = {
      full_name: String(values.get('full_name')).trim(),
      student_id: String(values.get('student_id')).trim(),
      email: String(values.get('email')).trim(),
      password: String(values.get('password')),
      degree,
      major,
      grade: Number(year),
    };

    submitting.current = true;
    setPending(true);
    try {
      await registerAccount(input);
      form.reset();
      setDegree('');
      setMajor('');
      setYear('');
      setComplete(true);
      setFeedback('Registration successful. Account created successfully. You can now log in with your student ID and password.');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Registration could not be completed. Please try again.');
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <header className="auth-form-heading">
        <p className="auth-eyebrow">FIND YOUR PLACE IN THE HIVE</p>
        <h2>Let’s start together.</h2>
        <p>A few details to introduce yourself.</p>
      </header>
      {!registrationEnabled && (
        <div className="auth-preview-note">
          <Info size={17} />
          <p>Frontend preview. Accounts are not created or saved.<br />Use fictional details to try the form.</p>
        </div>
      )}
      <form noValidate onSubmit={handleSubmit} aria-busy={pending} onChange={clearFormMessages}>
        <fieldset className="auth-form register-form registration-fields" disabled={pending || complete}>
          <FormField label="Full name" name="full_name" placeholder="Enter your full name" required autoComplete="name" error={errors.full_name} />
          <FormField label="Student ID" name="student_id" placeholder="Enter your student ID" required autoComplete="username" error={errors.student_id} />
          <div className="auth-full-width"><FormField label="Email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" error={errors.email} /></div>
          <FormField label="Degree" name="degree" placeholder="Choose your degree" options={degreeOptions} selectValue={degree} onSelectChange={handleDegreeChange} required error={errors.degree} />
          <FormField label="Year of study" name="grade" placeholder={degree ? 'Choose your year' : 'Choose degree first'} disabled={!degree} selectValue={year} onSelectChange={setYear} options={Array.from({ length: degree ? maxYearByDegree[degree] : 0 }, (_, index) => ({ value: String(index + 1), label: 'Year ' + (index + 1) }))} required error={errors.grade} />
          <div className="auth-full-width"><FormField label="Major" name="major" placeholder={degree ? 'Choose your major' : 'Choose degree first'} disabled={!degree} selectValue={major} onSelectChange={setMajor} options={(degree ? majorsByDegree[degree] : []).map(value => ({ value, label: value }))} required error={errors.major} /></div>
          <FormField label="Password" name="password" type="password" placeholder="Create a password" required minLength={8} autoComplete="new-password" hint="At least 8 characters." error={errors.password} />
          <FormField label="Confirm password" name="confirm_password" type="password" placeholder="Re-enter your password" required autoComplete="new-password" error={errors.confirm_password} />
          {Object.keys(errors).length > 0 && <p className="auth-full-width form-error-summary" role="alert">Please check the highlighted fields.</p>}
          <Button className="auth-submit auth-full-width" type="submit">{pending ? 'Creating account…' : complete ? 'Account created' : 'Create account'}{!pending && !complete && <ArrowRight size={18} />}</Button>
        </fieldset>
        {serverError && <p className="registration-message auth-feedback auth-feedback-error" role="alert"><strong>Registration failed.</strong> {serverError}</p>}
        {feedback && <p className="registration-message auth-feedback" role="status">{feedback}</p>}
      </form>
      <p className="auth-form-switch">Already have an account? <a href="#login">Log in</a></p>
    </>
  );
}



