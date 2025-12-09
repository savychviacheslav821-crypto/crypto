import { useState, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { Link, useLocation } from "react-router-dom";
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
//import Badge from '@mui/material/Badge';
//import Stack from '@mui/material/Stack';

const drawerWidth = 220;

// eslint-disable-next-line no-unused-vars
const SideDrawer = ({mainLinks, presaleLink, privateLink, moreMenuLinks, comingSoonLink, onClose, open, window, handleClickContracts}) => {
  const router = useLocation();
  const container = window !== undefined ? () => window().document.body : undefined;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    
    if (userStr) {
      try {
        setUserInfo(JSON.parse(userStr));
      } catch (e) {
        setUserInfo(null);
      }
    } else {
      setUserInfo(null);
    }
  }, [open]);

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserInfo(null);
    onClose();
    document.location.href = '/';
  }

  return ( 
    <Drawer
      container={container}
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        zIndex: 10000,
        display: { 
          xs: 'block', 
          sm: 'none' 
        },
        '& .MuiDrawer-paper': { 
          boxSizing: 'border-box', 
          width: drawerWidth, 
          border: 0,
          boxShadow: 'none'
        },
      }}
      BackdropProps={{style: {backgroundColor: 'rgba(111, 126, 140, 0.2)', backdropFilter: 'blur(2px)'}}}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List
          sx={{maxWidth: drawerWidth }}
          component="nav"
          className="sidebar"
          aria-labelledby="main-list"
          dense
        >
          {mainLinks.map(link => (
            <ListItemButton 
              component={Link} 
              to={link.href}
              key={link.href}
              selected={router.pathname === link.href}
              onClick={onClose}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
          <ListItemButton
            onClick={onClose}
            component={Link} 
            to={presaleLink.href}
            selected={router.pathname === presaleLink.href}
            sx={{display: 'flex', alignItems: 'center', width: '100%'}}
          >
            {/* <Badge 
              badgeContent={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span className="pulse"></span>
                  <span style={{color: 'rgba(255, 255, 255, .8)', fontWeight: 500, letterSpacing: 1}}>Live</span>
                </Stack>
              } 
              color="warning"
            >
            </Badge> */}
            <ListItemText primary={presaleLink.label} />
          </ListItemButton>

          <ListItemButton
            onClick={onClose}
            component={Link} 
            to={privateLink.href}
            selected={router.pathname === privateLink.href}
            sx={{display: 'flex', alignItems: 'center', width: '100%'}}
          >
            {/* <Badge 
              badgeContent={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span className="pulse"></span>
                  <span style={{color: 'rgba(255, 255, 255, .8)', fontWeight: 500, letterSpacing: 1}}>Live</span>
                </Stack>
              } 
              color="warning"
            >
            </Badge> */}
            <ListItemText primary={privateLink.label} />
          </ListItemButton>


          {comingSoonLink.map(link => (
            <ListItem 
              key={link}
              sx={{display: 'flex', alignItems: 'center', width: '100%'}}
            >
              <ListItemText primary={link} sx={{opacity: .3}} />
            </ListItem>
          ))}
        </List>
        <Divider light />
        <List component="nav" dense>
          {isAuthenticated ? (
            <>
              {/* User Info Section */}
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {userInfo?.name ? userInfo.name : (userInfo?.email ? userInfo.email.split('@')[0] : '')}
                  </Typography>
                  {userInfo?.email && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {userInfo.email}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Divider light />
              {/* Logout Button */}
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </>
          ) : (
            <ListItemButton
              component={Link}
              to="/signin"
              onClick={onClose}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderRadius: 1,
                mx: 1,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          )}
        </List>

      </Box>
    </Drawer>
  )
}

export default SideDrawer;