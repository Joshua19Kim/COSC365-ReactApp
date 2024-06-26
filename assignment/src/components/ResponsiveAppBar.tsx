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



    useEffect(() => {
        const currentUserId = localStorage.getItem('userId');
        if (localStorage.getItem('token')) {
            setLoggedIn(true);
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


    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: '#38ab92' }}>
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
                                    sx={{ my: 2, color: 'white', display: 'block', marginLeft:'30px'}}
                                >
                                    Create New Petition
                                </Button>
                                </Link>
                            )}
                            {loggedIn && (
                                <Link to={"/myPetitions/" + userId} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Button
                                        key="createPetition"
                                        sx={{ my: 2, color: 'white', display: 'block', marginLeft:'30px'}}
                                    >
                                        My Petition
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
                                        <Avatar alt="User Photo" src={'http://localhost:4941/api/v1/users/' + userId + "/image"} />
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
                                        <Typography textAlign="center" component={Link} to={"/user/"+userId} sx={{ textDecoration: 'none', color: 'inherit' }}>
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
