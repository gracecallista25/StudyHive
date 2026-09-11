import type { LoginInput, RegisterInput } from '../../types/auth';

export const registrationEnabled = Boolean(import.meta.env.VITE_API_BASE_URL?.trim());

// UI transport only; FastAPI owns validation and accounts.
async function submitAccount(endpoint: 'register' | 'login', input: LoginInput | RegisterInput): Promise<string> {
  const action = endpoint === 'register' ? 'registration' : 'login';
  const base = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '');
  if (!base) throw new Error('The backend is not connected yet.');
  let response: Response;
  try {
    response = await fetch(base + '/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error('Could not confirm ' + action + '. Check that the backend is running and try again.');
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('The server returned an unexpected response. Please try again.'); }
  if (result?.status === 'failed' && typeof result.reason === 'string') throw new Error(result.reason);
  if (!response.ok) throw new Error(response.status === 422
    ? 'The server could not accept these details. Please check the form.'
    : 'The server is unavailable right now. Please try again.');
  if (result?.status !== 'success' || typeof result.user_id !== 'string' || result.user?.id !== result.user_id) {
    throw new Error('The server did not confirm ' + action + '. Please try again.');
  }
  return result.user_id;
}

export const registerAccount = (input: RegisterInput) => submitAccount('register', input);
export const loginAccount = (input: LoginInput) => submitAccount('login', input);
