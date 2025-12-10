import { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Account from "../../account/";
import Networks from "../../Chains/Networks";
// import logo from '../../../assets/images/logo-symbol1.svg';
import logo from '../../../assets/images/logo-elo.png';
import Navbar from './Navbar';
import Contracts from '../../shared/Contracts';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import SideDrawer from './SideDrawer';

// const mainLinks = [
//   { label: "Home", href: "/" },
//   { label: "Gallery", href: "/gallery" },
// ]

const mainLinks = [
// { label: "Home", href: "/" },
]

const presaleLink = { 
  label: "Pre-sale", 
  href: "/pre-sale" 
}

const privateLink = { 
  label: "Private-sale", 
  href: "/private-sale" 
}

// const bridgeLink = {
//   label: "Bridge",
//   href: "https://bridge.poly.network/token/"
// }

//const comingSoonLink = ["Swap", "Mint", "Stake"];
const comingSoonLink = ["Stake"];


const moreMenuLinks = [
  // { label: "Transactions", href: "/transactions" },
  // { label: "NFTs", href: "/nfts" },
  { label: "About us", href: "/about" },
] 

const MainNavigation = () => {
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [contractsDialogOpen, setContractsDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUserInfo(parsedUser);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setUserInfo(null);
      }
    } else {
      setUserInfo(null);
    }
  };

  useEffect(() => {
    // Check authentication on mount and when route changes
    checkAuth();
  }, [location.pathname]);

  useEffect(() => {
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when login happens in same tab
    const handleLogin = () => {
      checkAuth();
    };
    window.addEventListener('userLogin', handleLogin);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleLogin);
    };
  }, []);

  const handleContractsDialogToggle = () => {
    setContractsDialogOpen(!contractsDialogOpen);
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserInfo(null);
    // Redirect to home or signin page
    if (location.pathname === '/signin' || location.pathname === '/signup') {
      // Already on auth page, just update state
      return;
    }
    window.location.href = '/';
  };

  const getUserInitials = () => {
    if (!userInfo) return 'U';
    if (userInfo.name) {
      const names = userInfo.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return userInfo.name[0].toUpperCase();
    }
    if (userInfo.email) {
      return userInfo.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <Fragment>
      <AppBar
        position="fixed"
        color="inherit"
        enableColorOnDark
        elevation={0}
        sx={{bgcolor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(20px)'}}
      >
        <Toolbar 
          sx={{borderBottom: 1, borderColor: "grey.100"}}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{marginRight: "auto"}}>
            <Link to="/" style={{marginRight: "auto"}}>
              <img 
                src={logo} 
                alt="ELO logo" 
                width="50"
              />
            </Link>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Navbar 
              mainLinks={mainLinks}
              moreMenuLinks={moreMenuLinks}
              comingSoonLink={comingSoonLink}
              // bridgeLink={bridgeLink}
              presaleLink={presaleLink}
              privateLink={privateLink}
              handleClickContracts={handleContractsDialogToggle} />
          </Box>
          {isAuthenticated && (
            <>
              <Box sx={{marginLeft: "auto"}}>
                <Networks />
              </Box>
              <Box sx={{ml: 1}}>
                <Account />
              </Box>
            </>
          )}
          <Box sx={{ml: 2, display: 'flex', alignItems: 'center', gap: 2}}>
            {isAuthenticated && location.pathname !== '/signin' && location.pathname !== '/signup' ? (
              <>
                {/* User Info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {userInfo?.name ? userInfo.name : (userInfo?.email ? userInfo.email.split('@')[0] : '')}
                    </Typography>
                    {userInfo?.email && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {userInfo.email}
                      </Typography>
                    )}
                  </Box>
                </Box>
                {/* Logout Button */}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : location.pathname !== '/signin' && location.pathname !== '/signup' ? (
              <Button
                component={Link}
                to="/signin"
                variant="contained"
                startIcon={<LoginIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
                  },
                }}
              >
                Login
              </Button>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>
      <SideDrawer
        mainLinks={mainLinks}
        presaleLink={presaleLink}
        privateLink={privateLink}
        moreMenuLinks={moreMenuLinks}
        comingSoonLink={comingSoonLink}
        onClose={handleDrawerToggle}
        open={mobileDrawerOpen}
        handleClickContracts={handleContractsDialogToggle} 
      />
      <Contracts 
        open={contractsDialogOpen} 
        handleClose={handleContractsDialogToggle} 
      />
    </Fragment>
  );
}

export default MainNavigation;