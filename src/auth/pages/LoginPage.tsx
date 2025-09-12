import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Container,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LoginPayload } from '@/types/admin/login.type';
import { useForm, useLoginAsync } from '@/hooks';

export const LoginPage = () => {
  const { fetchLogin } = useLoginAsync();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { onInputChange, formState } = useForm({
    user: '',
    password: '',
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginPayload: LoginPayload = {
        nick: formState.user,
        password: formState.password,
      };

      await fetchLogin(loginPayload);
    } catch (err) {
      setError('Credenciales inválidas. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Check if form is valid (both fields filled)
  const isFormValid = formState.user.trim() !== '' && formState.password.trim() !== '';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Logo and Title Section */}
              <Box
                sx={{
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: '#475569',
                    mb: 1,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Unnamed ERP
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569',
                    fontSize: '0.95rem',
                  }}
                >
                  Sistema de Gestión Empresarial
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {/* Login Form */}
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Username Field */}
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <TextField
                        fullWidth
                        label="Usuario"
                        name="user"
                        value={formState.user}
                        onChange={onInputChange}
                        autoComplete="username"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#667eea' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          },
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>

                  {/* Password Field */}
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      <TextField
                        fullWidth
                        label="Contraseña"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formState.password}
                        onChange={onInputChange}
                        autoComplete="current-password"
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#667eea' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                                sx={{ color: '#667eea' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#667eea',
                          },
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#667eea',
                            borderWidth: 2,
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>

                  {/* Remember Me Checkbox */}
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            sx={{
                              color: '#667eea',
                              '&.Mui-checked': {
                                color: '#667eea',
                              },
                            }}
                          />
                        }
                        label="Recordar mi sesión"
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            color: '#475569',
                            fontSize: '0.9rem',
                          },
                        }}
                      />
                    </motion.div>
                  </Grid>

                  {/* Login Button */}
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading || !isFormValid}
                        sx={{
                          height: 56,
                          borderRadius: 3,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          color: '#ffffff',
                          background: isFormValid 
                            ? 'linear-gradient(45deg, #667eea, #764ba2)' 
                            : 'linear-gradient(45deg, #cbd5e1, #94a3b8)',
                          boxShadow: isFormValid 
                            ? '0 8px 32px rgba(102, 126, 234, 0.3)' 
                            : '0 4px 16px rgba(148, 163, 184, 0.2)',
                          '&:hover': {
                            color: '#ffffff',
                            background: isFormValid 
                              ? 'linear-gradient(45deg, #5a6fd8, #6a4190)' 
                              : 'linear-gradient(45deg, #cbd5e1, #94a3b8)',
                            boxShadow: isFormValid 
                              ? '0 12px 40px rgba(102, 126, 234, 0.4)' 
                              : '0 4px 16px rgba(148, 163, 184, 0.2)',
                            transform: isFormValid ? 'translateY(-2px)' : 'none',
                          },
                          '&:active': {
                            color: '#ffffff',
                            transform: isFormValid ? 'translateY(0px)' : 'none',
                          },
                          '&:disabled': {
                            color: '#ffffff',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Iniciar Sesión'
                        )}
                      </Button>
                    </motion.div>
                  </Grid>
                </Grid>
              </Box>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Divider sx={{ my: 3, borderColor: 'rgba(0,0,0,0.1)' }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#475569',
                      fontSize: '0.85rem',
                    }}
                  >
                    ¿Necesitas ayuda?{' '}
                    <Button
                      variant="text"
                      sx={{
                        backgroundColor: 'transparent',
                        color: '#667eea',
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        },
                      }}
                    >
                      Contactar Soporte
                    </Button>
                  </Typography>
                </Box>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};
