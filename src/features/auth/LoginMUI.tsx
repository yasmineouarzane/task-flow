import { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type{ RootState } from '../../store';
import { loginStart, loginSuccess, loginFailure } from './authSlice';
import { setAuthToken } from '../../api/axios';
import api from '../../api/axios';

export default function LoginMUI() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const { data: users } = await api.get(`/users?email=${email}`);
      if (users.length === 0 || users[0].password !== password) {
        dispatch(loginFailure('Email ou mot de passe incorrect'));
        return;
      }
      const { password: _, ...user } = users[0];
      const fakeToken = btoa(JSON.stringify({ userId: user.id, email: user.email, role: 'admin', exp: Date.now() + 3600000 }));
      setAuthToken(fakeToken);
      dispatch(loginSuccess({ user, token: fakeToken }));
    } catch {
      dispatch(loginFailure('Erreur serveur'));
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f0f0f0' }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 4 }}>
          <Typography variant="h4" align="center" color="#1B8C3E" fontWeight={700}>TaskFlow</Typography>
          <Typography variant="body2" align="center" color="text.secondary">Connectez-vous pour continuer</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth required />
            <TextField label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth required />
            <Button type="submit" variant="contained" fullWidth disabled={loading}
              sx={{ bgcolor: '#1B8C3E', '&:hover': { bgcolor: '#157a33' } }}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}