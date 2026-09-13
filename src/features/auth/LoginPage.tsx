import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Info } from 'lucide-react';
import { Button } from '../../shared/components';
import { FormField, formErrors, loginAccount, registrationEnabled } from './auth';

export function LoginPage({ onLogin }: { onLogin: (userId: string | null) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState('');
  const [failure, setFailure] = useState('');
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);

  function clearFormMessages() {
    setFeedback('');
    setFailure('');
    setErrors({});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;

    const form = event.currentTarget;
    const nextErrors = formErrors(form);
    setErrors(nextErrors);
    setFeedback('');
    setFailure('');
    onLogin(null);
    if (Object.keys(nextErrors).length) return;

    if (!registrationEnabled) {
      setFeedback('Backend not connected. No sign-in was performed. Set VITE_API_BASE_URL and restart the frontend.');
      return;
    }

    const values = new FormData(form);
    submitting.current = true;
    setPending(true);
    try {
      const userId = await loginAccount({
        student_id: String(values.get('student_id')).trim(),
        password: String(values.get('password')),
      });
      form.reset();
      onLogin(userId);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <>
      <header className="auth-form-heading">
        <p className="auth-eyebrow">WELCOME BACK</p>
        <h2>Good to see you.</h2>
        <p>Your next study session starts here.</p>
      </header>
      {!registrationEnabled && (
        <div className="auth-preview-note">
          <Info size={17} />
          <p>Frontend preview. The backend is not connected.<br />Use sample details to try the form.</p>
        </div>
      )}
      <form noValidate onSubmit={handleSubmit} aria-busy={pending} onChange={clearFormMessages}>
        <fieldset className="auth-form registration-fields" disabled={pending}>
          <FormField label="Student ID" name="student_id" placeholder="Enter your student ID" required autoComplete="username" error={errors.student_id} />
          <FormField label="Password" name="password" type="password" placeholder="Enter your password" required autoComplete="current-password" error={errors.password} />
          {Object.keys(errors).length > 0 && <p className="form-error-summary" role="alert">Please check the highlighted fields.</p>}
          <Button className="auth-submit" type="submit">{pending ? 'Checking login…' : 'Log in'}{!pending && <ArrowRight size={18} />}</Button>
        </fieldset>
        {failure && <p className="registration-message auth-feedback auth-feedback-error" role="alert"><strong>Login failed.</strong> {failure}</p>}
        {feedback && <p className="registration-message auth-feedback" role="status">{feedback}</p>}
      </form>
      <p className="auth-form-switch">First time here? <a href="#register">Create an account</a></p>
    </>
  );
}



