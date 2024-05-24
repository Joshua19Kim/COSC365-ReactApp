import React, {ChangeEvent, useState} from "react";
import {Box, Button, IconButton, InputAdornment, TextField, Typography} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import axios from "axios";


interface LoginProps {
    handleCloseModal: () => void;
}


const Login: React.FC<LoginProps> = ({ handleCloseModal }) => {

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();



    const setEmailState = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const setPasswordState = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const loginUser = async () => {
        const userData: userLogin = {
            email,
            password
        };
        await axios.post('http://localhost:4941/api/v1/users/login', userData)
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                handleCloseModal();
                navigate('/')
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                localStorage.setItem('userEmail', email);

            }, (error) => {
                setErrorFlag(true);

                if (error.response.statusText.includes("data/email")) {
                    setErrorMessage("Email is not registered.");
                } else if (error.response.statusText.includes("password must NOT")) {
                    setErrorMessage("Password is not correct.");
                } else {
                    setErrorMessage("You typed invalid information. Try again.");
                }

            })
    }


        return (
            <div>
                <Typography
                    textAlign="center"
                    variant="h6"
                    component="h2"
                    sx={{fontSize: '2rem'}}
                >
                    Login
                </Typography>

                <Box height={300} width={400} display="flex" flexDirection="column" justifyContent="center">
                    <TextField id="outlined-basic" label="Email" variant="outlined" sx={{ marginTop: '20px'}}
                               value={email} onChange={setEmailState}/>
                    <TextField
                        id="outlined-basic" label="Password" variant="outlined" type={showPassword ? 'text' : 'password'}
                        value={password} onChange={setPasswordState} sx={{ marginTop: '20px'}}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={togglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    {errorFlag && (
                        <Typography color="error" sx={{marginTop: '20px', textAlign: 'center'}}>
                            {errorMessage}
                        </Typography>
                    )}
                    <Button variant="contained" sx={{marginTop: '70px', height: '60px', color: 'inherit'}}
                            onClick={loginUser}>
                        Log In!
                    </Button>


                </Box>
            </div>


        )

}


export default Login;