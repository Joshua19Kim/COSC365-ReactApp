import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";
import {
    Box, Button, Card,
    Container, Grid,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Menu,
    MenuItem, Modal,
    TextField,
    Typography
} from "@mui/material";
import {PhotoCamera} from "@mui/icons-material";
import axios from "axios";
import {Link, useLocation, useNavigate} from "react-router-dom";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import Diversity2Icon from "@mui/icons-material/Diversity2";


const CreatePetition: React.FC = () => {
    const maxSignedInt = 2147483647;
    const navigate = useNavigate();
    const location = useLocation();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [modalErrorFlag, setModalErrorFlag] = React.useState(false)
    const [modalErrorMessage, setModalErrorMessage] = React.useState("")
    const [errorMessage, setErrorMessage] = React.useState("")
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [categories, setCategories] = React.useState<Array<Category>>([])
    const categoryNames = categories.map(category => category.name);
    const [chosenCategoryId, setChosenCategoryId] = React.useState<number>(-1);
    const [newPetitionId, setNewPetitionId] = React.useState<number>(-1);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [selectedIndexCategory, setSelectedIndex] = React.useState(-1);
    const open = Boolean(anchorEl);
    const [supportTiers, setSupportTiers] = React.useState<SupportTierPost[]>([{tempId:-1, title:"", description:"", cost:0}])
    const [tempId, setTempId] = React.useState<number>(0);
    const [modalOpen, setModalOpen] = useState(false);

    const [imageType, setImageType] = React.useState<string|null>(null);
    const [petitionImage, setPetitionImage] = React.useState<string | null>(null);
    const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
    const [selectedImagePreview, setSelectedImagePreview] = React.useState<string | null>(null);



    useEffect(() => {
        getCategories();

    }, [location]);

    useEffect(() => {
        setCategoryState();
    }, [selectedIndexCategory]);

    useEffect(() => {
        sendPetitionImage()
    }, [newPetitionId])

    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (
        event: React.MouseEvent<HTMLElement>,
        index: number,
    ) => {
        setSelectedIndex(index);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    const createPetition = async () => {
        if (!selectedImage) {
            setErrorFlag(true);
            setErrorMessage("Please select an image.");
            return;
        }
        if (title.trim().length === 0) {
            setErrorFlag(true);
            setErrorMessage("Please enter the title for your petition.")
            return;
        }
        console.log(description)
        if (description.trim().length === 0) {
            setErrorFlag(true);
            setErrorMessage("Please enter the description for your petition.")
            return;
        }

        for(let supportier of supportTiers ) {
            if (isNaN(Number(supportier.cost))) {
                setErrorFlag(true);
                setErrorMessage("Support Tier's cost has to be integer.");
                return
            } else {
                supportier.cost = Number(supportier.cost)
                if (supportier.cost > maxSignedInt) {
                    setErrorFlag(true);
                    setErrorMessage("Maximum cost number is " + maxSignedInt);
                    return
                }
                if (supportier.title.trim().length === 0) {
                    setErrorFlag(true);
                    setErrorMessage("Please enter the support tier title for your petition.")
                    return
                }
                if (supportier.description.trim().length === 0) {
                    setErrorFlag(true);
                    setErrorMessage("Please enter the support tier description for your petition.")
                    return
                }

            }
        }

        const petitionData: PetitionCreate = {
            title: title, description: description, categoryId: chosenCategoryId, supportTiers: supportTiers
        };
        await axios.post('http://localhost:4941/api/v1/petitions', petitionData, {
            headers: {'X-Authorization': `${localStorage.getItem("token")}`}
        })
            .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setNewPetitionId(response.data.petitionId);

            }, (error) => {
                setErrorFlag(true);
                if (error.response.statusText.includes("data/title must NOT have fewer than 1 characters")) {
                    setErrorMessage("Please enter the title for your petition.");
                } else if (error.response.statusText.includes("data/description must NOT have fewer than 1 characters")) {
                    setErrorMessage("Please enter the description for your petition");
                } else if (error.response.statusText.includes("data/title must NOT have more than 128 characters")) {
                    setErrorMessage("Maximum petition length is 128 characters.");
                } else if (error.response.statusText.includes("data/description must NOT have more than 1024 characters")) {
                    setErrorMessage("Maximum description length is 1024 characters.");
                } else if (error.response.statusText.includes("data/categoryId must be")) {
                    setErrorMessage("Select Category!");
                } else if (error.response.statusText.includes("supportTiers" && "title must NOT have more than 128 characters")) {
                    setErrorMessage("Maximum support tier title length is 128.");
                } else if (error.response.statusText.includes("supportTiers" && "title must NOT")) {
                    setErrorMessage("You haven't entered the support tier title.");
                } else if (error.response.statusText.includes("supportTiers" && "description must NOT have more than 1024 characters")) {
                    setErrorMessage("Maximum support tier description length is 1024 characters.");
                } else if (error.response.statusText.includes("data/supportTiers" &&"description must NOT")) {
                    setErrorMessage("You haven't entered the support tier description.");
                } else if (error.response.statusText.includes("Duplicate petition")) {
                    setErrorMessage("There is the same name of petition.");
                } else if (error.response.statusText.includes("supportTiers" && "must have unique titles")) {
                    setErrorMessage("Each support tier name have to be unique.");
                } else if (error.response.statusText.includes("supportTiers must NOT have fewer than 1")) {
                    setErrorMessage("You need at least one support Tier.");
                } else {
                    setErrorMessage(error.response.statusText);
                }
            }
        )
    }
    const sendPetitionImage = async () => {

        await axios.put(`http://localhost:4941/api/v1/petitions/${newPetitionId}/image`, selectedImage, {
            headers: {
                'Content-Type': imageType,
                'X-Authorization': `${localStorage.getItem("token")}`
            }
        })
            .then((response) => {
                    setModalErrorFlag(false);
                    setModalErrorMessage("");
                    navigate("/petitions/" + newPetitionId);
                }, (error) => {
                    setModalErrorFlag(true);
                if (error.response.statusText.includes("Payload Too Large")) {
                    setModalErrorMessage("Your image size is too big.");
                } else if (error.response.statusText.includes("photo must be image/jpeg,")) {
                    setModalErrorMessage("You put invalid image. Please put .jpg, .png or .gif.");
                } else {
                    setErrorMessage(error.response.statusText);
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

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/petitions/categories')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setCategories(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const addSupportTiersSlot = () => {

        if(supportTiers.length < 3) {
            setTempId((prevId) => prevId + 1);
            setSupportTiers([...supportTiers, {tempId: tempId, title: "", description: "", cost: 0}])
        }
    }
    const deleteSupportTiersSlot = (id:number) => {
        const updatedSupporttiers = supportTiers.filter(tier => tier.tempId !== id);
        setSupportTiers(updatedSupporttiers);

    }

    const updateSupportTier = (id:number, key:string, value:string|number ) => {
        setSupportTiers(supportTiers.map(supporttier =>
            (supporttier.tempId === id) ? (
                {...supporttier, [key] : value}
            ) : (
                supporttier
            )
        ))
    }


    const addSupportTierForm = (aSupportTier:SupportTierPost) => {
        return (
            <Box display="flex" justifyContent="center">
                <Card sx={{ display: "flex", border: 1, width: 500, height:400, flexDirection: 'column', textAlign: 'center', mt: 4, boxShadow: 10 }}>
                    <Box id={"firstSupportTier"} sx={{ alignContent: 'center', alignItems: 'center', flexDirection: 'row' }}>

                        <Typography textAlign="center" variant="h6" component="h2"
                                    sx={{fontSize: '1rem', textAlign: 'left', marginLeft: '40px', marginTop: '20px', width: '400px'
                                    }}
                        >
                            Title:
                        </Typography>

                        <TextField id="outlined-basic" variant="outlined" sx={{ width: '400px' }} value={aSupportTier.title}
                                   onChange={(e) => updateSupportTier(aSupportTier.tempId, "title", e.target.value)}
                        />
                        <Typography textAlign="center" variant="h6" component="h2"
                                    sx={{fontSize: '1rem', textAlign: 'left', marginLeft: '40px', marginTop: '20px', width: '400px'}}
                        >
                            Description:
                        </Typography>

                        <TextField id="outlined-basic" variant="outlined" multiline rows={3} InputProps={{
                            sx: { minHeight: '100px', width: '400px' }}} value={aSupportTier.description}
                                   onChange={(e) => updateSupportTier(aSupportTier.tempId, "description", e.target.value)}
                        />

                        <Typography textAlign="center" variant="h6" component="h2"
                                    sx={{fontSize: '1rem', textAlign: 'left', marginLeft: '40px', marginTop: '20px', width: '400px'}}
                        >
                            Cost:
                        </Typography>

                        <TextField
                            id="outlined-basic" variant="outlined" sx={{ width: '400px' }} value={aSupportTier.cost}
                            onChange={(e) => updateSupportTier(aSupportTier.tempId, "cost", e.target.value)}
                        />
                    </Box>
                    <Button
                        sx={{marginTop:'5px', marginBottom:'10px',backgroundColor: '#8B0000', '&:hover': {backgroundColor: '#6e0101',},}}
                        variant="contained"
                        onClick={() => deleteSupportTiersSlot(aSupportTier.tempId)}
                        disabled={supportTiers.length <= 1}
                    >
                        Delete
                    </Button>
                </Card>
            </Box>
        )
    }


    const setTitleState = (event: ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }
    const setCategoryState = () => {
        categories.forEach(category => {
            if (category.name === categoryNames[selectedIndexCategory]) {
                setChosenCategoryId(category.categoryId);
            }})}
    const setDescriptionState = (event: ChangeEvent<HTMLInputElement>) => {
        setDescription(event.target.value);
    }
    const showImage = () => {
        if(selectedImagePreview) {
            setModalOpen(false)
            setPetitionImage(selectedImagePreview)
            setSelectedImagePreview(null)
        } else {
            setModalErrorFlag(true)
            setModalErrorMessage("Please, select an image file.")
        }

    }



    return (
        <div>
        <Container style={{
            position: 'relative', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            height: 1000, width: 2000, marginTop:50}}>

            <Box sx={{marginBottom:'20px'}}>
                <h1 style={{fontSize: '40px'}}>Create A Petition</h1>
            </Box>
            <Container style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 800, width: 2000}}>
                <Box display="flex" justifyContent="center" sx={{margin:'3rem'}}>
                    <Card sx={{ display: "flex", border: 1, width: 500, height:550, flexDirection: 'column', textAlign: 'center', alignContent:'center',alignItems:'center', boxShadow: 10 }}>
                        <Box sx={{ display: "flex", width: 400, height:400,  textAlign: 'center', margin:'1rem', justifyContent: 'center', alignItems: 'center'}}>
                            {petitionImage ? (
                                <img
                                    src={petitionImage}
                                    alt="Petition Image"
                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <Diversity2Icon sx={{ color:'grey', fontSize: '15rem', alignSelf:'center',}} />

                        )}

                        </Box>
                            <IconButton onClick={() => setModalOpen(true)}
                                        sx={{color: '#A7C7E7', bgcolor: 'background.paper',
                                            '&:hover': {bgcolor: 'background.paper'}}}
                            >
                                <AddAPhotoIcon />
                            </IconButton>


                    </Card>
                </Box>

                <Box display="flex" justifyContent="center">
                    <Card sx={{ display: "flex", border: 1, width: 500, height:620, flexDirection: 'column', textAlign: 'center', boxShadow: 10, margin:'3rem' }}>
                            <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '1.5rem', textAlign:'left', marginTop:'1.2rem', marginLeft:'3rem'}}>
                                Title:
                            </Typography>
                        <TextField id="outlined-basic" variant="outlined" sx={{width:'400px', alignSelf:'center'}}
                                   value={title} onChange={setTitleState} />
                        <Box sx={{ flexDirection:'row'}}>
                            <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '1.5rem', textAlign:'left', marginLeft:'3rem', marginTop:'1rem'}}>
                                Category:
                            </Typography>
                            <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '0.8rem', textAlign:'left', marginLeft:'3rem', marginTop:'0rem'}}>
                                (Select one in the options)
                            </Typography>
                        </Box>


                        <Box sx={{border: '1px solid', borderColor: 'gray', borderRadius: '8px', width:'400px', height: '50px', alignSelf:'center' }}>
                            <List component="nav" aria-label="Device settings" sx={{ bgcolor: 'background.paper' }}>
                                <ListItemButton
                                    id="lock-button" aria-haspopup="listbox" aria-controls="lock-menu" aria-label="when device is locked"
                                    aria-expanded={open ? 'true' : undefined} onClick={handleClickListItem}>
                                    <ListItemText primary={categoryNames[selectedIndexCategory]}/>
                                </ListItemButton>
                            </List>
                            <Menu id="lock-menu" anchorEl={anchorEl} open={open} onClose={handleClose}
                                  MenuListProps={{'aria-labelledby': 'lock-button', role: 'listbox',}}>
                                {categoryNames.map((option, index) => (
                                    <MenuItem
                                        key={option} selected={index === selectedIndexCategory} onClick={(event) => handleMenuItemClick(event, index)}>{option}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                        <Typography textAlign="center" variant="h6" component="h2" sx={{fontSize: '1.5rem', textAlign:'left', marginLeft:'3rem', marginTop:'1rem'}}>
                            Description:
                        </Typography>
                        <TextField id="outlined-basic" variant="outlined" value={description} onChange={setDescriptionState} multiline
                                   rows={5} sx={{ height: '300', width: '400px',alignSelf:'center' }} InputProps={{
                            sx: {height: '100%',}}}
                        />
                        <Box sx={{ marginLeft:'50px',display: 'flex', gap: '50px'}}>
                            {errorFlag && (
                                <Typography color="error" sx={{ marginTop: '20px', textAlign:'center'}}>
                                    {errorMessage}
                                </Typography>
                            )}
                        </Box>
                        <Box id={"buttons"} sx={{ alignSelf:'center', marginTop:'5rem',display: 'flex', gap: '50px',}}>
                            <Button variant="contained"sx={{ width: '200px', height: '50px',backgroundColor:'#4a916e', '&:hover': {backgroundColor: '#327a56',  }, }} onClick={createPetition}>Create</Button>
                            <Link to={'/'}>
                                <Button variant="contained" sx={{ width: '200px', height: '50px',backgroundColor: '#8B0000', '&:hover': {backgroundColor: '#6e0101',},}}>Cancel</Button>
                            </Link>
                        </Box>
                    </Card>
                </Box>

                <Box id={"supportTiers"} sx={{ display: 'flex', flexDirection: 'column', margin: '3rem', alignContent:'center' }} height={700} width={500} display={"flex"}>
                    <Typography textAlign="center" variant="h6" component="h2" sx={{
                        fontSize: '2rem', textAlign: 'center', marginLeft: '50px', marginTop: '20px', width:'400px'}}>
                        -Support Tier-
                    </Typography>
                    <Typography textAlign="center" variant="h6" component="h2" sx={{
                        fontSize: '0.8rem', textAlign: 'center', marginLeft: '50px', width:'400px'}}>
                        (Min.1 & Max.3)
                    </Typography>
                    {supportTiers.map(supporttier => addSupportTierForm(supporttier))}

                    <Button sx={{width:'200px', marginTop:'20px', alignSelf:'center',backgroundColor:'#4a916e', '&:hover': {backgroundColor: '#327a56',  },}} variant="contained" onClick={addSupportTiersSlot} disabled={supportTiers.length >= 3} >Add Support Tier</Button>

                </Box>
            </Container>


            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4
                }}>
                    <Typography variant="h6" component="h2">
                        Upload Petition Image.
                    </Typography>
                    <input
                        accept="image/png, image/jpeg, image/gif"
                        id="icon-button-file-modal"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <label htmlFor="icon-button-file-modal">
                        <IconButton sx={{color:"white" ,backgroundColor:'#4a916e', '&:hover': {backgroundColor: '#327a56',  },}} aria-label="upload picture" component="span">
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
                        <Button sx={{backgroundColor:'#4a916e', '&:hover': {backgroundColor: '#327a56',  },}} variant="contained" color="primary" onClick={showImage}>
                            Upload
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => setModalOpen(false)}>
                            Skip
                        </Button>
                    </Box>
                </Box>
            </Modal>



        </Container>
        </div>


    )
}




export default CreatePetition;