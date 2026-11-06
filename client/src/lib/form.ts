import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiError, errorMessage } from './api';

/** Shows server-side field errors next to the matching inputs, otherwise a toast. */
export function handleFormError<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>) {
  if (err instanceof ApiError && err.details) {
    let shown = false;
    for (const [field, messages] of Object.entries(err.details)) {
      if (field !== '_' && messages[0]) {
        setError(field as Path<T>, { message: messages[0] });
        shown = true;
      }
    }
    if (shown) return;
  }
  toast.error(errorMessage(err));
}
