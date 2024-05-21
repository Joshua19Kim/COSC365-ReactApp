import React, { ChangeEvent, useState } from "react";
import {Box, Button, IconButton, InputAdornment, TextField, Typography} from "@mui/material";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import {Visibility, VisibilityOff} from "@mui/icons-material";

// Define the userRegister type
type userRegister = {
    firstName: string,
    lastName: string,
    email: string,
    password: string
};

const Register = () => {
    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newUserId, setNewUserId] = useState<number | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const setFirstNameState = (event: ChangeEvent<HTMLInputElement>) => {
        setFirstName(event.target.value);
    };

    const setLastNameState = (event: ChangeEvent<HTMLInputElement>) => {
        setLastName(event.target.value);
    };

    const setEmailState = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const setPasswordState = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const registerUser = async () => {
        const userData: userRegister = {
            firstName,
            lastName,
            email,
            password
        };
    await axios.post('http://localhost:4941/api/v1/users/register', userData)
        .then((response) => {
            setErrorFlag(false);
            setErrorMessage("");
            setNewUserId(response.data.userId);
            navigate(`/user/${newUserId}`)
        }, (error) => {
            setErrorFlag(true);
            setErrorMessage("You typed invalid input. Try again.");

        })
    }

    return (
        <div>
            <Typography
                textAlign="center"
                variant="h6"
                component="h2"
                sx={{ fontSize: '2rem' }}
            >
                Register
            </Typography>

            <Box height={700} width={400} display="flex" flexDirection="column" justifyContent="center">
                <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px' }}>
                    First Name:
                </Typography>
                <TextField id="outlined-basic" label="First Name" variant="outlined"
                           value={firstName} onChange={setFirstNameState} />

                <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px' }}>
                    Last Name:
                </Typography>
                <TextField id="outlined-basic" label="Last Name" variant="outlined"
                           value={lastName} onChange={setLastNameState} />

                <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px' }}>
                    Email:
                </Typography>
                <TextField id="outlined-basic" label="Email" variant="outlined"
                           value={email} onChange={setEmailState} />

                <Typography textAlign="center" variant="h6" component="h2" sx={{
                    fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px' }}>
                    Password:
                </Typography>
                <TextField
                    id="outlined-basic"
                    label="Password"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'} // Toggle between text and password
                    value={password}
                    onChange={setPasswordState}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={togglePasswordVisibility}
                                    edge="end"
                                >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                {errorFlag && (
                    <Typography color="error" sx={{ marginTop: '20px', textAlign:'center'}}>
                        {errorMessage}
                    </Typography>
                )}
                <Button variant="contained" sx={{ marginTop: '70px', height: '60px', color: 'inherit' }} onClick={registerUser}>
                    Register!
                </Button>


            </Box>
        </div>
    );
};

export default Register;