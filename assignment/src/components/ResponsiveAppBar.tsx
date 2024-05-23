import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate, useLocation } from "react-router-dom";
import Diversity3RoundedIcon from '@mui/icons-material/Diversity3Rounded';
import { Modal } from "@mui/material";
import Login from "./Login";
import Register from "./Register";
import axios from 'axios';

const ResponsiveAppBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userId, setUserId] = React.useState<number| null>(null);
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [openModal, setOpenModal] = React.useState(false);
    const [isLogin, setIsLogin] = React.useState(true);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [userImage, setUserImage] = React.useState<string>("");



    useEffect(() => {
        const currentUserId = localStorage.getItem('userId');
        if (localStorage.getItem('token')) {
            setLoggedIn(true);
            getUserImage();
            setUserId(Number(currentUserId));
        }

    }, [location]);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenModal = () => {
        setOpenModal(true);
        setIsLogin(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const switchToRegister = () => {
        setIsLogin(false);
    };

    const switchToLogin = () => {
        setIsLogin(true);
    };

    const handleLogout = () => {
        if (localStorage.state !== null) {
            axios.post('http://localhost:4941/api/v1/users/logout', {}, {
                headers: {'X-Authorization': `${localStorage.getItem("token")}`}
            })
                .then(() => {
                    setLoggedIn(false);
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    navigate('/');
                })
                .catch((error) => {
                    console.error("There was an error!", error);
                });
        }
    };

    const getUserImage = () => {
        if (loggedIn) {
            console.log(localStorage.getItem('userId'));
            axios.get('http://localhost:4941/api/v1/users/' + localStorage.getItem('userId') + "/image", {
                headers: {
                    'X-Authorization': `${localStorage.getItem("token")}`
                },
                responseType: 'blob'
            })
                .then((response) => {
                    const imageUrl = URL.createObjectURL(response.data);
                    setUserImage(imageUrl);
                }, (error) => {
                    console.error('No user profile photo for nav bar:', error);
                })
        }
    }

    return (
        <>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Diversity3RoundedIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            href="#"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                                SENG365
                            </Link>
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                {userImage ? (
                                    <Avatar src={userImage} alt="User Photo" />
                                ) : (
                                    <MenuIcon />
                                )}
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                            >
                                {loggedIn && (
                                    <MenuItem key="user" onClick={handleCloseNavMenu}>
                                        <Typography textAlign="center" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
                                            User
                                        </Typography>
                                    </MenuItem>
                                )}
                                {loggedIn && (
                                    <MenuItem key="logout" onClick={() => { handleCloseNavMenu(); handleLogout(); }}>
                                        <Typography textAlign="center" sx={{ textDecoration: 'none', color: 'inherit' }}>
                                            Logout
                                        </Typography>
                                    </MenuItem>
                                )}
                            </Menu>
                        </Box>

                        <Typography
                            variant="h5"
                            noWrap
                            component="a"
                            href="#"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            LOGO
                        </Typography>

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Button
                                key="user"
                                component={Link}
                                to="/"
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                Petitions
                            </Button>
                            {loggedIn && (
                                <Link to="/createPetition" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Button
                                    key="createPetition"
                                    sx={{ my: 2, color: 'white', display: 'block'}}
                                >
                                    Create petition
                                </Button>
                                </Link>
                            )}
                        </Box>

                        <Box sx={{ flexGrow: 0 }}>
                            {!loggedIn && (
                                <Button
                                    key="login"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handleOpenModal();
                                    }}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    Login
                                </Button>
                            )}
                            {loggedIn && (
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt="User Photo" src={userImage || "/static/images/avatar/2.jpg"} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {loggedIn && (
                                    <MenuItem key="user" onClick={handleCloseUserMenu}>
                                        <Typography textAlign="center" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
                                            User
                                        </Typography>
                                    </MenuItem>
                                )}
                                {loggedIn && (
                                    <MenuItem key="logout" onClick={() => { handleCloseUserMenu(); handleLogout(); }}>
                                        <Typography textAlign="center" sx={{ textDecoration: 'none', color: 'inherit' }}>
                                            Logout
                                        </Typography>
                                    </MenuItem>
                                )}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        border: '2px solid #000',
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Button onClick={handleCloseModal}>Close</Button>
                    {isLogin ? (
                        <>
                            <Login handleCloseModal={handleCloseModal} />
                            <Typography
                                variant="body2"
                                sx={{ cursor: 'pointer', textAlign: 'center', marginTop: '20px' }}
                                onClick={switchToRegister}
                            >
                                Register email
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Register />
                            <Typography
                                variant="body2"
                                sx={{ cursor: 'pointer', textAlign: 'center', marginTop: '20px' }}
                                onClick={switchToLogin}
                            >
                                Back to Login
                            </Typography>
                        </>
                    )}
                </Box>
            </Modal>
        </>
    );
}

export default ResponsiveAppBar;
