import { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Phone } from '@mui/icons-material';
import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import { useWalletConnector, setNet } from '../../components/account/WalletConnector';

const API_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:4000';

const SignIn = () => {
  const history = useHistory();
  const { account } = useWeb3React();
  const { loginMetamask, loginWalletConnect } = useWalletConnector();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletConnected, setWalletConnected] = useState(!!account);

  useEffect(() => {
    // Initialize network (default to network 0)
    setNet(0);
  }, []);

  useEffect(() => {
    setWalletConnected(!!account);
  }, [account]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleConnectWallet = async (type) => {
    try {
      if (type === 'metamask') {
        await loginMetamask();
      } else if (type === 'walletconnect') {
        await loginWalletConnect();
      }
      setWalletConnected(true);
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        ...(formData.phone && { phone: formData.phone }),
        ...(account && { wallet: account }),
      };

      const response = await axios.post(`${API_URL}/api/user/signin`, payload);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        // Redirect to home or dashboard
        history.push('/');
        window.location.reload();
      }
    } catch (err) {
      setError(
        err.response?.data?.errors
          ? Object.values(err.response.data.errors)[0]
          : err.response?.data?.msg || 'Sign in failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Phone Number (Optional)"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              placeholder="+1 (555) 123-4567"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            />

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Connect Wallet (Optional)
              </Typography>
            </Divider>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                fullWidth
                variant={walletConnected && account ? 'contained' : 'outlined'}
                onClick={() => handleConnectWallet('metamask')}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  ...(walletConnected && account
                    ? {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                        },
                      }
                    : {}),
                }}
              >
                {walletConnected && account ? 'MetaMask Connected' : 'Connect MetaMask'}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleConnectWallet('walletconnect')}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                }}
              >
                WalletConnect
              </Button>
            </Box>

            {account && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Wallet connected: {account.slice(0, 6)}...{account.slice(-4)}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignIn;

