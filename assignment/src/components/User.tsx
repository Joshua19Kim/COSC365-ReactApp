import React, {ChangeEvent} from "react";
import {Box, Button, Card, CardContent, Container, Grid, IconButton, Modal, Typography} from "@mui/material";
import ResponsiveAppBar from "./ResponsiveAppBar";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import axios from "axios";
import Avatar from "@mui/material/Avatar";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import {PhotoCamera} from "@mui/icons-material";







const User = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const location = useLocation();
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

    React.useEffect(() => {
        checkAccessWithId()
        getUserDetail()
        getUserImage()
    }, [id, location])


    const getUserDetail = () => {
        axios.get('http://localhost:4941/api/v1/users/' + id, {
            headers: {'X-Authorization': `${localStorage.getItem("token")}`}
        })
            .then((response) => {
                setErrorFlag(false);
                setErrorMessage("");
                currentUser.email = response.data.email;
                currentUser.lastName = response.data.lastName;
                currentUser.firstName = response.data.firstName;
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
                <ResponsiveAppBar />
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
                <ResponsiveAppBar />
                <Container>
                    <h1 style={{ flex: 1, textAlign: 'center', fontSize: '40px' }}>
                        User Profile
                    </h1>
                    <Box display="flex" justifyContent="center">
                        <Card sx={{ border:1, width: 400, height: 600, textAlign: 'center', mt: 4 }}>
                            <Box display="flex" justifyContent="center" mt={2}>
                                {userImage ? (
                                    <Avatar
                                        alt={`${currentUser.firstName} ${currentUser.lastName}`}
                                        src={userImage}
                                        sx={{ width: 300, height: 300, border:1, }}
                                    />
                                ) : (
                                    <Avatar sx={{ width: 300, height: 300, border:1 }}>
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
                                                sx={{
                                                    color: 'red',
                                                    bgcolor: 'background.paper',
                                                    '&:hover': {bgcolor: 'background.paper'}
                                                }}
                                            ><DeleteForeverIcon/>
                                            </IconButton>
                                        )}
                                </Grid>
                            </Box>
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
                            </CardContent>
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
                            <Button variant="contained" color="primary" sx={{ width: '200px', height: '50px', backgroundColor: '#FF0000', '&:hover': {
                                    backgroundColor: '#8B0000',
                                }, }}
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
                            <Button variant="contained" color="primary"
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