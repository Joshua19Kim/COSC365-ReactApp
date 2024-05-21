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
                navigate('/', { state: { userId: response.data.userId, token: response.data.token } })
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                console.log("FROM Login, token is : "+localStorage.getItem('token'))
                console.log("FROM Login, userId is : "+localStorage.getItem('userId'))

            }, (error) => {
                setErrorFlag(true);

                if (error.response.statusText.includes("data/email")) {
                    setErrorMessage("Email must match the format 'email'.");
                } else if (error.response.statusText.includes("password must NOT")) {
                    setErrorMessage("Password must not have fewer than 6 characters.");
                } else {
                    setErrorMessage("You typed invalid input. Try again.");
                }

            })
    }


    if (errorFlag) {
        return (
            <div>
                <h1>Login</h1>
                <div style={{color: "red"}}>
                    {errorMessage}
                </div>
            </div>
        )}
    else
    {
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
                    <Typography textAlign="center" variant="h6" component="h2"
                                sx={{fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px'}}>
                        Email:
                    </Typography>
                    <TextField id="outlined-basic" label="Email" variant="outlined"
                               value={email} onChange={setEmailState}/>

                    <Typography textAlign="center" variant="h6" component="h2" sx={{
                        fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px'
                    }}>
                        Password:
                    </Typography>
                    <TextField
                        id="outlined-basic"
                        label="Password"
                        variant="outlined"
                        type={showPassword ? 'text' : 'password'}
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

}


export default Login;