import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Alert from '@material-hu/components/design-system/Alert';
import Button from '@material-hu/components/design-system/Buttons/Button';
import FormInputClassic from '@material-hu/components/design-system/Inputs/Classic/form';
import FormInputPassword from '@material-hu/components/design-system/Inputs/Password/form';
import Spinner from '@material-hu/components/design-system/ProgressIndicators/Spinner';

import humandLogo from '../../../assets/humand.svg';
import { useAuth } from '../../../providers/AuthContext';

import { type LoginInput, loginSchema } from './schema';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  if (loading) return <Spinner />;
  if (user)
    return (
      <Navigate
        to="/"
        replace
      />
    );

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setSubmitError(null);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  });

  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Stack
        component="form"
        noValidate
        onSubmit={onSubmit}
        sx={{ width: 360, gap: 3 }}
      >
        <Stack sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
          <img
            src={humandLogo}
            alt="Humand"
            style={{ height: 32 }}
          />
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ letterSpacing: '-0.5px' }}
          >
            Proa Track
          </Typography>
        </Stack>

        <Typography variant="h5">Iniciar sesión</Typography>

        {submitError && (
          <Alert
            severity="error"
            title={submitError}
          />
        )}

        <FormProvider {...methods}>
          <Stack sx={{ gap: 2 }}>
            <FormInputClassic
              name="email"
              inputProps={{
                label: 'Usuario',
                autoFocus: true,
                hasCounter: false,
                autoComplete: 'username',
              }}
              rules={{}}
            />
            <FormInputPassword
              name="password"
              inputProps={{
                label: 'Contraseña',
                autoComplete: 'current-password',
              }}
              rules={{}}
            />
          </Stack>
        </FormProvider>

        <Button
          type="submit"
          variant="primary"
          size="large"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          Ingresar
        </Button>
      </Stack>
    </Stack>
  );
}
