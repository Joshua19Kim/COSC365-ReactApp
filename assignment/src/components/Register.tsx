import React, { ChangeEvent, useState } from "react";
import {Box, Button, IconButton, InputAdornment, Modal, TextField, Typography} from "@mui/material";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import {PhotoCamera, Visibility, VisibilityOff} from "@mui/icons-material";
import login from "./Login";

type userRegister = {
    firstName: string,
    lastName: string,
    email: string,
    password: string
};

const Register = () => {
    const [newUserId, setNewUserId] = React.useState<number|null>(-1);
    const [errorFlag, setErrorFlag] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");
    const [modalErrorFlag, setModalErrorFlag] = React.useState(false)
    const [modalErrorMessage, setModalErrorMessage] = React.useState("")

    const [firstName, setFirstName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const navigate = useNavigate();
    const [imageType, setImageType] = React.useState<string|null>(null);
    const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
    const [selectedImagePreview, setSelectedImagePreview] = React.useState<string | null>(null);


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
                loginUser();
            }, (error) => {
                setErrorFlag(true);

                if (error.response.statusText.includes("firstName must NOT")) {
                    setErrorMessage("First name must not have fewer than 1 characters.");
                } else if (error.response.statusText.includes("lastName must NOT")) {
                    setErrorMessage("Last name must not have fewer than 1 characters.");
                } else if (error.response.statusText.includes("data/email")) {
                    setErrorMessage("Email must match the format 'email'.");
                } else if (error.response.statusText.includes("password must NOT")) {
                    setErrorMessage("Password must not have fewer than 6 characters.");
                } else if (error.response.statusText.includes("Email already in")) {
                    setErrorMessage("Email is already in use.");
                } else {
                    setErrorMessage("You typed invalid input. Try again.");
                }
            }
            )
    }

    const loginUser = async () => {
        const userData: userLogin = {
            email,
            password
        };
        await axios.post('http://localhost:4941/api/v1/users/login', userData)
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.userId);
                setNewUserId(response.data.userId)
                setModalOpen(true);
            })
    }
    const sendUserImage = async () => {
        if (!selectedImage) {
            setModalErrorFlag(true);
            setModalErrorMessage("Please select an image.");
            return;
        }
        await axios.put('http://localhost:4941/api/v1/users/'+ newUserId +'/image', selectedImage, {
            headers: {
                'Content-Type': imageType,
                'X-Authorization': `${localStorage.getItem("token")}`
            }
        })
            .then((response) => {
                    setModalErrorFlag(false);
                    setModalErrorMessage("");
                    setModalOpen(false);
                    navigate('/user/' + newUserId)
                }, (error) => {
                    setModalErrorFlag(true);
                    if (error.response.statusText.includes("Payload Too Large")) {
                        setModalErrorMessage("Your image size is too big.");
                    } else if (error.response.statusText.includes("photo must be image/jpeg,")) {
                        setModalErrorMessage("You put invalid image. Please put .jpg, .png or .gif.");
                    } else {
                        setErrorMessage("You posted the invalid file. Try again.");
                    }
                }
            )
    }

    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only PNG, JPEG, and GIF files are allowed.');
                return;
            }
            setImageType(file.type);
            setSelectedImage(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setSelectedImagePreview(result);
            };
            reader.readAsDataURL(file);
        }
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

            <Box height={500} width={400} display="flex" flexDirection="column" justifyContent="center">
                <TextField id="outlined-basic" label="First Name" variant="outlined" sx={{ marginTop: '20px'}}
                           value={firstName} onChange={setFirstNameState} />
                <TextField id="outlined-basic" label="Last Name" variant="outlined" sx={{ marginTop: '20px'}}
                           value={lastName} onChange={setLastNameState} />
                <TextField id="outlined-basic" label="Email" variant="outlined" sx={{ marginTop: '20px'}}
                           value={email} onChange={setEmailState} />
                <TextField
                    id="outlined-basic"
                    label="Password"
                    variant="outlined" sx={{ marginTop: '20px'}}
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

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4
                }}>
                    <Typography variant="h6" component="h2">
                        Upload User Image (Optional)
                    </Typography>
                    <input
                        accept="image/png, image/jpeg, image/gif"
                        id="icon-button-file-modal"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <label htmlFor="icon-button-file-modal">
                        <IconButton color="primary" aria-label="upload picture" component="span">
                            <PhotoCamera />
                        </IconButton>
                    </label>
                    {selectedImagePreview && (
                        <Box mt={2}>
                            <img src={selectedImagePreview} alt="Selected" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                        </Box>
                    )}
                    <Box mt={2} display="flex" justifyContent="space-between">
                        {modalErrorFlag && (
                            <Typography color="error" sx={{ marginTop: '20px', textAlign:'center'}}>
                                {modalErrorMessage}
                            </Typography>
                        )}
                        <Button variant="contained" color="primary" onClick={sendUserImage}>
                            Upload
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => navigate('/user/' + newUserId)}>
                            Skip
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default Register;