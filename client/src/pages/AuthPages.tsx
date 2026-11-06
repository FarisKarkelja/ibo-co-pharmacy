import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput, registerSchema, type RegisterInput } from '@ibo/shared';
import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { useLogin, useRegister } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, Input } from '@/components/ui/input';
import { handleFormError } from '@/lib/form';

const PasswordInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={visible ? 'text' : 'password'} className="pr-11" {...props} />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Sakrij lozinku' : 'Prikaži lozinku'}
        className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

function AuthLayout({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-[78vh] animate-fade-in items-center gap-10 py-8 lg:grid-cols-2">
      <div className="relative hidden h-full min-h-[560px] overflow-hidden rounded-3xl lg:block">
        <img src="/images/about-us.webp" alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          <span className="mt-4 block h-1 w-16 rounded-full bg-brand" />
          <p className="mt-5 max-w-md leading-relaxed text-white/85">{text}</p>
        </div>
      </div>
      <Card className="mx-auto w-full max-w-md p-6 sm:p-10">{children}</Card>
    </div>
  );
}

export function LoginPage() {
  const login = useLogin();
  const [params] = useSearchParams();
  const registerLink = `/register${params.get('redirect') ? `?redirect=${encodeURIComponent(params.get('redirect')!)}` : ''}`;
  const { register, handleSubmit, formState, setError } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // On success the cached user changes and GuestOnly redirects to the right page.
  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onSuccess: (user) => toast.success(`Dobrodošli nazad, ${user.fullName.split(' ')[0]}!`),
      onError: (err) => handleFormError(err, setError),
    }),
  );

  return (
    <AuthLayout
      title="Dobrodošli nazad!"
      text="Upravljajte svojom korpom, narudžbama i pratite sve u realnom vremenu. Podijelite svoje mišljenje o našim uslugama i proizvodima!"
    >
      <h2 className="text-2xl font-semibold">Prijava</h2>
      <p className="mt-2 text-sm text-muted">
        Nemate profil?{' '}
        <Link to={registerLink} className="font-medium text-brand hover:underline">
          Registrujte se
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <Field label="Email" error={formState.errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Lozinka" error={formState.errors.password?.message}>
          <PasswordInput autoComplete="current-password" {...register('password')} />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={login.isPending}>
          Prijava
        </Button>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const registerUser = useRegister();
  const [params] = useSearchParams();
  const loginLink = `/login${params.get('redirect') ? `?redirect=${encodeURIComponent(params.get('redirect')!)}` : ''}`;
  const { register, handleSubmit, formState, setError } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '' },
  });

  const onSubmit = handleSubmit((values) =>
    registerUser.mutate(values, {
      onSuccess: () => toast.success('Profil je kreiran. Dobrodošli u IBO & CO!'),
      onError: (err) => handleFormError(err, setError),
    }),
  );

  return (
    <AuthLayout
      title="Vaša apoteka, jednostavno."
      text="Počnite već danas! Kreirajte svoj profil, pratite narudžbe i uživajte u jednostavnom iskustvu kupovine."
    >
      <h2 className="text-2xl font-semibold">Registracija</h2>
      <p className="mt-2 text-sm text-muted">
        Već imate profil?{' '}
        <Link to={loginLink} className="font-medium text-brand hover:underline">
          Prijavite se
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <Field label="Ime i prezime" error={formState.errors.fullName?.message}>
          <Input autoComplete="name" {...register('fullName')} />
        </Field>
        <Field label="Email" error={formState.errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Telefon" error={formState.errors.phone?.message} hint="Samo brojevi, npr. 061123456">
          <Input type="tel" inputMode="numeric" autoComplete="tel" {...register('phone')} />
        </Field>
        <Field
          label="Lozinka"
          error={formState.errors.password?.message}
          hint="Najmanje 8 znakova, veliko i malo slovo, broj i specijalni znak."
        >
          <PasswordInput autoComplete="new-password" {...register('password')} />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={registerUser.isPending}>
          Registracija
        </Button>
        <p className="text-center text-xs text-muted">
          Registracijom prihvatate našu{' '}
          <Link to="/privacy-policy" className="text-brand hover:underline">
            politiku privatnosti
          </Link>
          .
        </p>
      </form>
    </AuthLayout>
  );
}
