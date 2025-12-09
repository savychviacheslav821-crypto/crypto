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
  Snackbar,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Phone, Person } from '@mui/icons-material';
import { useWeb3React } from '@web3-react/core';
import axios from 'axios';
import { useWalletConnector, setNet } from '../../components/account/WalletConnector';

// Ensure proper API URL
const getApiUrl = () => {
  const envUrl = process.env.REACT_APP_SERVER_URL;
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl;
  }
  return 'http://localhost:4000';
};
const API_URL = getApiUrl();

const SignUp = () => {
  const history = useHistory();
  const { account } = useWeb3React();
  const { loginMetamask, loginWalletConnect } = useWalletConnector();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ...(formData.phone && { phone: formData.phone }),
        ...(account && { wallet: account }),
      };

      const url = `${API_URL}/api/user/signup`;
      const response = await axios.post(url, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Handle both 200 and 201 status codes as success
      if (response.status === 200 || response.status === 201) {
        // Check if response has success flag or just assume success on 200/201
        const responseData = response.data;
        
        if (responseData.success !== false) {
          // Store token and user data
          const token = responseData.token || responseData.data?.token;
          const user = responseData.data?.user || responseData.user;
          
          if (token) {
            localStorage.setItem('authToken', token);
          }
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          // Show success message
          setSuccess(true);
          setLoading(false);
          
          // Redirect to sign in page after 2 seconds
          setTimeout(() => {
            history.push('/signin');
          }, 2000);
          return;
        }
      }
      
      // If we get here, something unexpected happened
      setError('Sign up completed but there was an issue. Please try signing in.');
    } catch (err) {
      console.log('Sign up error:', err);
      console.log('Response:', err.response);
      
      // Show user-friendly error messages based on status code
      let errorMessage;
      const status = err.response?.status;
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = 'Request timed out. The server is taking too long to respond.';
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        errorMessage = 'Unable to connect to server. Please check if the server is running on port 4000.';
      } else if (status === 409) {
        // User already exists
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (status === 400) {
        // Validation error - try to get specific message
        const data = err.response?.data;
        if (data?.errors && typeof data.errors === 'object') {
          const errorValues = Object.values(data.errors);
          if (errorValues.length > 0 && typeof errorValues[0] === 'string' && errorValues[0].length > 3) {
            errorMessage = errorValues[0];
          } else {
            errorMessage = 'Please check your input fields and try again.';
          }
        } else if (data?.msg && typeof data.msg === 'string' && data.msg.length > 3) {
          errorMessage = data.msg;
        } else {
          errorMessage = 'Invalid information. Please check your input and try again.';
        }
      } else if (status === 503) {
        errorMessage = 'Database is temporarily unavailable. Please try again later.';
      } else if (status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = 'Sign up failed. Please try again.';
      }
      
      setError(errorMessage);
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
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign up to get started with your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Snackbar
            open={success}
            autoHideDuration={2000}
            onClose={() => setSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              severity="success" 
              sx={{ width: '100%' }}
              onClose={() => setSuccess(false)}
            >
              Account created successfully! Redirecting to sign in...
            </Alert>
          </Snackbar>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
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
              helperText="Must be at least 6 characters"
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
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  style={{
                    color: '#667eea',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignUp;

