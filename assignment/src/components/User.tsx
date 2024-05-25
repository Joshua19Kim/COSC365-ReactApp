import React, {ChangeEvent, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    InputAdornment,
    Modal,
    TextField,
    Typography
} from "@mui/material";
import ResponsiveAppBar from "./ResponsiveAppBar";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import {PhotoCamera, Visibility, VisibilityOff} from "@mui/icons-material";
import '../css/style.css'
import CheckIcon from '@mui/icons-material/Check';


const User = () => {

    const {id} = useParams();
    const navigate = useNavigate();

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [modalErrorFlag, setModalErrorFlag] = React.useState(false)
    const [modalErrorMessage, setModalErrorMessage] = React.useState("")
    const [imageModalOpen, setImageModalOpen] = React.useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [deleteModalErrorFlag, setDeleteModalErrorFlag] = React.useState(false)
    const [deleteModalErrorMessage, setDeleteModalErrorMessage] = React.useState("")
    const [noAccessErrorFlag, setNoAccessErrorFlag] = React.useState(false)
    const [noAccessErrorMessage, setNoAccessErrorMessage] = React.useState("")

    const [userImage, setUserImage] = React.useState<string | null>(null);
    const [currentUser, setCurrentUser] = React.useState<userDetail>({firstName:"", lastName:"", email:""})
    const [hasImage, setHasImage] = React.useState<boolean>(false)
    const [imageType, setImageType] = React.useState<string|null>(null);
    const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
    const [selectedImagePreview, setSelectedImagePreview] = React.useState<string | null>(null);

    const [isEditMode, setIsEditMode] = React.useState<boolean>(false);

    const [newFirstName, setNewFirstName] = React.useState<string>("")
    const [newLastName, setNewLastName] = React.useState<string>("")
    const [newEmail, setNewEmail] = React.useState<string>("")
    const [currentPassword, setCurrentPassword] = React.useState<string>("")
    const [newPassword, setNewPassword] = React.useState<string>("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [wantUpdatePassword, setWantUpdatePassword] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");


    React.useEffect(() => {
        checkAccessWithId()
        getUserDetail()
        getUserImage()
    }, [id,hasImage])

    React.useEffect(() => {
        getUserDetail()
        setCurrentPassword('')
        setNewPassword('')
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setWantUpdatePassword(false)
    }, [isEditMode])


    const getUserDetail = () => {
        axios.get('http://localhost:4941/api/v1/users/' + id, {
            headers: {'X-Authorization': `${localStorage.getItem("token")}`}
        })
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                const loggedInUser = {firstName: response.data.firstName, lastName: response.data.lastName,email: response.data.email}
                setCurrentUser(loggedInUser)
                setNewFirstName(response.data.firstName)
                setNewLastName(response.data.lastName)
                setNewEmail(response.data.email)

            })
            .catch((error) => {
                console.error("Cannot get the details!", error);
            });

    };

    const deleteUserImage = () => {
        axios.delete('http://localhost:4941/api/v1/users/' + id + '/image', {
            headers: {'X-Authorization': `${localStorage.getItem("token")}`}
        })
            .then(() => {
                setErrorFlag(false);
                setErrorMessage("");
                setDeleteModalOpen(false);
                setHasImage(false);
                setUserImage(null);
                window.location.reload()
            })
            .catch((error) => {
                console.error("Cannot delete the photo!", error);
            });

    };

    const getUserImage = () => {
        axios.get( 'http://localhost:4941/api/v1/users/' + id + "/image", {responseType:"blob"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setUserImage(URL.createObjectURL(response.data))
                setHasImage(true)
                setSelectedImagePreview(null)
            }, (error) => {
                if (error.response.statusText.includes("Not Found")) {
                    setErrorFlag(false)
                    setErrorMessage("")
                }
                setHasImage(false)
            })
    }

    const sendUserImage = async () => {
        if (!selectedImage) {
            setModalErrorFlag(true);
            setModalErrorMessage("Please select an image.");
            return;
        }
        await axios.put('http://localhost:4941/api/v1/users/'+ id +'/image', selectedImage, {
            headers: {
                'Content-Type': imageType,
                'X-Authorization': `${localStorage.getItem("token")}`
            }
        })
            .then((response) => {
                    setModalErrorFlag(false);
                    setModalErrorMessage("");
                    setImageModalOpen(false);
                    setSelectedImage(null);
                    getUserImage();
                    window.location.reload()
                }, (error) => {
                    setDeleteModalErrorFlag(true);
                    if (error.response.statusText.includes("Payload Too Large")) {
                        setModalErrorMessage("Your image size is too big.");
                    } else if (error.response.statusText.includes("photo must be image/jpeg,")) {
                        setModalErrorMessage("You put invalid image. Please put .jpg, .png or .gif.");
                    } else {
                        setModalErrorMessage("You posted the invalid file. Try again.");
                    }
                }
            )
    }
    const handleEditChange = async() => {
        const updateDetail = {
            email: newEmail,
            firstName: newFirstName,
            lastName: newLastName,
            ...((currentPassword.trim().length > 0 || newPassword.trim().length > 0)
                && { password: newPassword, currentPassword: currentPassword })
        };

        await axios.patch('http://localhost:4941/api/v1/users/'+ id, updateDetail, {
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': `${localStorage.getItem("token")}`
            }
        })
            .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setIsEditMode(false)
                    navigate("/user/" + id)
                    setNewPassword("")
                    setCurrentPassword("")
                    showAlert("Your detail has been successfully updated.", "success");
                }, (error) => {
                    setErrorFlag(true)
                    if (error.response.statusText.includes("data/currentPassword must NOT")) {
                        setErrorMessage("Current Password is too short.")
                    } else if (error.response.statusText.includes("data/password must NOT have fewer")) {
                        setErrorMessage("Your new password is too short.")
                    } else if (error.response.statusText.includes("Incorrect currentPassword")) {
                        setErrorMessage("Password is not correct.")
                    } else if (error.response.statusText.includes("email must match format")) {
                        setErrorMessage("Email is invalid format.")
                    } else if (error.response.statusText.includes("firstName must NOT have fewer")) {
                        setErrorMessage("First name can not be empty.")
                    } else if (error.response.statusText.includes("lastName must NOT")) {
                        setErrorMessage("Last name can not be empty.")
                    } else if (error.response.statusText.includes("Email already in use")) {
                        setErrorMessage("Email is alreay in use.")
                    } else {
                        setErrorMessage("You entered the invalid/incorrect information. Try again.")
                    }
                }
            )
    }
    const setNewFirstNameState = (event: ChangeEvent<HTMLInputElement>) => {
        setNewFirstName(event.target.value);
    }
    const setNewLastNameState = (event: ChangeEvent<HTMLInputElement>) => {
        setNewLastName(event.target.value);
    }
    const setNewEmailState = (event: ChangeEvent<HTMLInputElement>) => {
        setNewEmail(event.target.value);
    }
    const setCurrentPasswordState = (event: ChangeEvent<HTMLInputElement>) => {
        setCurrentPassword(event.target.value);
    };

    const setNewPasswordState = (event: ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    };

    const toggleCurrentPasswordVisibility = () => {
        setShowCurrentPassword((prev) => !prev);
    };
    const toggleNewPasswordVisibility = () => {
        setShowNewPassword((prev) => !prev);
    };

    const showAlert = (message: React.SetStateAction<string>, severity: React.SetStateAction<string>) => {
        setAlertMessage(message);
        setAlertVisible(true);
        setTimeout(() => {
            setAlertVisible(false);
        }, 3000);
    };


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

    const checkAccessWithId = async () => {
        const currentUserId = localStorage.getItem('userId');
        if (id !== currentUserId) {
            setNoAccessErrorFlag(true)
            setNoAccessErrorMessage("Sorry. You don't have an authority to see this profile detail.")
        } else {
            setNoAccessErrorFlag(false)
            setNoAccessErrorMessage("")
        }
    }


    if (noAccessErrorFlag) {
        return (
            <div>
                <Container>
                    <h1 style={{flex: 1, textAlign: 'center', fontSize: '40px'}}>
                        User Profile
                    </h1>
                </Container>
                <div style={{color: "red"}}>
                    {noAccessErrorMessage}
                </div>
            </div>
        )}
    else
    {
        return (
            <div>
                <Container>
                    <h1 style={{ textAlign: 'center', fontSize: '40px' }}>
                        User Profile
                    </h1>
                    <Box display="flex" justifyContent="center">
                        <Card sx={{ display: "flex", border: 1, width: 700, alignContent: 'center', alignItems: 'center', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', mt: 4, boxShadow: 10 }}>
                            <Box display="flex" justifyContent="center" mt={2}>
                                {userImage ? (
                                    <Avatar
                                        alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                        src={userImage}
                                        sx={{ width: 250, height: 250, border:1, }}
                                    />
                                ) : (
                                    <Avatar sx={{ width: 250, height: 250, border:1 }}>
                                        <ImageNotSupportedIcon sx={{ fontSize: '100px' }} />
                                    </Avatar>
                                )}
                            </Box>
                            <Box>
                                <Grid item xs={8}>
                                        <IconButton onClick={() => setImageModalOpen(true)}
                                            sx={{color: '#A7C7E7', bgcolor: 'background.paper',
                                                '&:hover': {bgcolor: 'background.paper'}}}
                                        >
                                            <AddAPhotoIcon />
                                        </IconButton>
                                    {hasImage && (
                                            <IconButton
                                                onClick={() => setDeleteModalOpen(true)}
                                                sx={{ color: 'red', bgcolor: 'background.paper', '&:hover': {bgcolor: 'background.paper',}
                                                }}
                                            ><DeleteForeverIcon/>
                                            </IconButton>
                                        )}
                                </Grid>
                            </Box>
                            {isEditMode ? (
                                <>
                                    <CardContent sx={{marginTop: '20px'}}>
                                        <TextField label="First Name" name="firstName" value={newFirstName}
                                                   onChange={setNewFirstNameState}
                                                   fullWidth sx={{marginBottom:'10px'}}/>
                                        <TextField label="Last Name" name="lastName" value={newLastName}
                                                   onChange={setNewLastNameState}
                                                   fullWidth sx={{marginBottom:'10px'}}/>
                                        <TextField label="Email" name="email" value={newEmail}
                                                   onChange={setNewEmailState}
                                                   fullWidth sx={{marginBottom:'10px'}}/>
                                        {wantUpdatePassword && (
                                            <Box>
                                                <TextField label="Current Password" name="oldPassword" value={currentPassword} type={showCurrentPassword ? 'text' : 'password'}
                                                           onChange={setCurrentPasswordState}
                                                           InputProps={{
                                                               endAdornment: (
                                                                   <InputAdornment position="end">
                                                                       <IconButton
                                                                           aria-label="toggle password visibility"
                                                                           onClick={toggleCurrentPasswordVisibility}
                                                                           edge="end"
                                                                       >
                                                                           {showCurrentPassword ? <VisibilityOff/> : <Visibility/>}
                                                                       </IconButton>
                                                                   </InputAdornment>
                                                               )
                                                           }}
                                                           fullWidth sx={{marginBottom:'10px'}}/>
                                                <TextField label="New Password" name="newPassword" value={newPassword}
                                                           type={showNewPassword ? 'text' : 'password'}
                                                           onChange={setNewPasswordState}
                                                           InputProps={{
                                                               endAdornment: (
                                                                   <InputAdornment position="end">
                                                                       <IconButton
                                                                           aria-label="toggle password visibility"
                                                                           onClick={toggleNewPasswordVisibility}
                                                                           edge="end"
                                                                       >
                                                                           {showNewPassword ? <VisibilityOff/> : <Visibility/>}
                                                                       </IconButton>
                                                                   </InputAdornment>
                                                               )
                                                           }}
                                                           fullWidth sx={{marginBottom:'10px', height:'30px'}}/>
                                            </Box>
                                        )}

                                        {errorFlag && (
                                            <Typography variant="body2" color="error" mt={2}>
                                                Error: {errorMessage}
                                            </Typography>
                                        )}
                                        <Box sx={{marginTop:'30px',display: 'flex', gap: '50px',alignContent: 'center', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', textAlign: 'center',}}>
                                            <Button  variant="contained" sx={{ width: '200px', height: '50px',backgroundColor:'#4a916e', '&:hover': {backgroundColor: '#327a56',  }, }} onClick={handleEditChange}>
                                                Save
                                            </Button>
                                            <Button variant="contained" color="secondary"  onClick={()=>setIsEditMode(false)}  sx={{ width: '200px', height: '50px' }} >
                                                Cancel
                                            </Button>
                                        </Box>
                                        {!wantUpdatePassword && (
                                            <Button variant="contained" sx={{ width: '200px', height: '50px', marginTop:'40px', backgroundColor:'#4a916e', '&:hover': {backgroundColor: '#327a56',  }, }} onClick={()=>setWantUpdatePassword(true)}>
                                                Update password
                                            </Button>
                                        )}


                                    </CardContent>
                                </>
                                ) : (
                                    <>
                                        <CardContent sx={{marginTop: '20px'}}>

                                            <Typography variant="h5" component="div" mt={2} sx={{fontSize: '30px', fontWeight: 'bold' }}>
                                                {currentUser.firstName} {currentUser.lastName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" mt={2} sx={{fontSize:'20px'}}>
                                                {currentUser.email}
                                            </Typography>
                                            {errorFlag && (
                                                <Typography variant="body2" color="error" mt={2}>
                                                    Error: {errorMessage}
                                                </Typography>
                                            )}
                                            <Button sx={{backgroundColor: '#ccb44b', '&:hover': {
                                                    backgroundColor: '#a19045',}, width: '200px', height: '50px', marginTop:' 30px' }} variant="contained" onClick={()=>setIsEditMode(true)}>
                                                Edit
                                            </Button>
                                            {alertVisible && (
                                                <Alert icon={<CheckIcon fontSize="inherit" />}>
                                                    {alertMessage}
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </>

                                )}


                        </Card>
                    </Box>
                </Container>
                <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', width: 400, height: 200, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4
                    }}>
                        <Typography variant="h6" component="h2" sx={{marginTop:'40px'}}>
                            Do you really want to delete this image???
                        </Typography>
                        {deleteModalErrorFlag && (
                            <Typography color="error" sx={{ marginTop: '20px', textAlign:'center'}}>
                                {deleteModalErrorMessage}
                            </Typography>
                        )}
                        <Box mt={2} display="flex" justifyContent="space-between" sx={{marginTop:'70px'}}>
                            <Button variant="contained" color="primary" sx={{ width: '200px', height: '50px', backgroundColor: '#8B0000', '&:hover': {backgroundColor: '#6e0101',}, }}
                                    onClick={deleteUserImage}
                            >
                                Delete
                            </Button>
                            <Button variant="contained" sx={{ width: '150px', height: '50px' }} onClick={() => setDeleteModalOpen(false)}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Modal>

                <Modal open={imageModalOpen} onClose={() => setImageModalOpen(false)}>
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
                            <IconButton sx={{backgroundColor: '#4a916e', '&:hover': {backgroundColor: '#327a56',  },}} aria-label="upload picture" component="span">
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
                            <Button sx={{backgroundColor: '#4a916e', '&:hover': {backgroundColor: '#327a56',  },}} variant="contained" color="primary"
                                    onClick={sendUserImage}
                                >
                                Upload
                            </Button>
                            <Button variant="contained" color="secondary" onClick={() => setImageModalOpen(false)}>
                                Skip
                            </Button>
                        </Box>
                    </Box>
                </Modal>

            </div>
    )}
}


export default User;