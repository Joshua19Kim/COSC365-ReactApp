import React, {ChangeEvent, useEffect, useState} from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";
import {
    Box, Button,
    Container,
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


const CreatePetition: React.FC = () => {

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
    const [imageType, setImageType] = React.useState<string|null>(null);
    const [supportTier, setSupportTier] = React.useState<SupportTierPost[]>([{tempId:-1, title:"", description:"", cost:0}])
    const [tempId, setTempId] = React.useState<number>(0);
    const [modalOpen, setModalOpen] = useState(false);

    const [selectedImage, setSelectedImage] = React.useState<string | ArrayBuffer | null>(null);

    useEffect(() => {
        getCategories();

    }, [location]);

    useEffect(() => {
        setCategoryState();
    }, [selectedIndexCategory]);


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


        const sendPetitionImage = async () => {

            await axios.put('http://localhost:4941/api/v1/petitions/'+ newPetitionId + '/image', selectedImage, {
                headers:{
                    "Content-Type": imageType,
                    'X-Authorization': `${localStorage.getItem("token")}`
                }
            })
                .then((response) => {
                        setModalErrorFlag(false);
                        setModalErrorMessage("");
                        navigate("/")
                    }, (error) => {
                        setModalErrorFlag(true);
                        setModalErrorMessage("You typed invalid image type. Try again.");
                        // if (error.response.statusText.includes("data/title must NOT have")) {
                        //     setErrorMessage("Please enter the title for your petition.");
                        // }
                    }
                )

        }

    const createPetition = async () => {
        const petitionData: PetitionCreate = {
            title: title,
            description: description,
            categoryId: chosenCategoryId,
            supportTiers: supportTier
        };

        await axios.post('http://localhost:4941/api/v1/petitions', petitionData, {
            headers: {'X-Authorization': `${localStorage.getItem("token")}`}
        })
            .then((response) => {
                    setErrorFlag(false);
                    setErrorMessage("");
                    setModalOpen(true);
                    setNewPetitionId(response.data.petitionId);
            }, (error) => {
                setErrorFlag(true);
                if (error.response.statusText.includes("data/title must NOT have")) {
                    setErrorMessage("Please enter the title for your petition.");
                } else if (error.response.statusText.includes("data/description must NOT")) {
                    setErrorMessage("Please enter the description for your petition");
                } else if (error.response.statusText.includes("data/categoryId must be")) {
                    setErrorMessage("Select Category!");
                } else if (error.response.statusText.includes("supportTiers/0/title must NOT")) {
                    setErrorMessage("Need at least one Support Tier. You haven't entered the title.");
                } else if (error.response.statusText.includes("data/supportTiers/0/description must NOT")) {
                    setErrorMessage("Need at least one Support Tier. You haven't entered the description.");
                } else if (error.response.statusText.includes("Duplicate petition")) {
                    setErrorMessage("There is the same name of petition.");
                } else {
                    setErrorMessage("You typed invalid input. Try again.");
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
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
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
        if(supportTier.length < 3) {
            setTempId((prevId) => prevId + 1);
            setSupportTier([...supportTier, {tempId: tempId, title: "", description: "", cost: 0}])
        }
    }
    const deleteSupportTiersSlot = (id:number) => {
        const updatedSupporttiers = supportTier.filter(tier => tier.tempId !== id);
        setSupportTier(updatedSupporttiers);

    }

    const updateSupportTier = (id:number, key:string, value:string|number ) => {
        setSupportTier(supportTier.map(supporttier =>
            (supporttier.tempId === id) ? (
                {...supporttier, [key] : value}
            ) : (
                supporttier
            )
        ))
    }


    const addSupportTierForm = (aSupportTier:SupportTierPost) => {

        return (
            <Box sx={{border:1, marginTop:'40px', width:'500px', height:'400px'}}>
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
                        onChange={(e) => updateSupportTier(aSupportTier.tempId, "cost", Number(e.target.value))}
                    />

                </Box>
                <Button
                    sx={{marginTop:'5px', marginBottom:'10px'}}
                    variant="contained"
                    style={{ backgroundColor: '#FF0000' }}
                    onClick={() => deleteSupportTiersSlot(aSupportTier.tempId)}
                    disabled={supportTier.length <= 1}
                >
                    Delete
                </Button>



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




    return (

        <div>
            <ResponsiveAppBar/>
            <h1 style={{fontSize: '40px'}}>Create A Petition</h1>
            <Container style={{
                position: 'relative', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                height: 800, width: 1300, marginTop:50}}>
                <Box id={"title&category&desription"} height={500} width={2200} display={"flex"}>
                    <Box id={"title&category&description"} sx={{height:"400px", width:"400px", marginLeft: '40px'}} display="flex" flexDirection="column" justifyContent="center">
                        <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px' }}>
                            Title:
                        </Typography>
                        <TextField id="outlined-basic" variant="outlined"
                                   value={title} onChange={setTitleState} />

                        <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px' }}>
                            Category:
                        </Typography>

                        <Box sx={{border: '1px solid', borderColor: 'gray', borderRadius: '8px', }}>
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


                        <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '1rem', textAlign: 'left', marginRight: '8px', marginTop: '20px' }}>
                            Description:
                        </Typography>
                        <TextField id="outlined-basic" variant="outlined" value={description} onChange={setDescriptionState} multiline
                            rows={7} sx={{ height: '400px', width: '400px' }} InputProps={{
                                sx: {height: '100%',}}}
                        />

                    </Box>

                    <Box id={"supportTiers"} sx={{ display: 'flex', flexDirection: 'column', marginLeft: '100px', alignContent:'center' }} height={700} width={500} display={"flex"}>
                        <Typography textAlign="center" variant="h6" component="h2" sx={{
                            fontSize: '2rem', textAlign: 'center', marginLeft: '50px', marginTop: '20px', width:'400px'}}>
                            -Support Tier (Max.3)-
                        </Typography>
                        {supportTier.map(supporttier => addSupportTierForm(supporttier))}

                        <Button sx={{width:'200px', marginTop:'20px', alignSelf:'center'}} variant="contained" onClick={addSupportTiersSlot} disabled={supportTier.length >= 3} >Add Support Tier</Button>

                    </Box>
                </Box>

                <Box sx={{ marginLeft:'50px',display: 'flex', gap: '50px'}}>
                    {errorFlag && (
                        <Typography color="error" sx={{ marginTop: '20px', textAlign:'center'}}>
                            {errorMessage}
                        </Typography>
                    )}
                </Box>
                <Box id={"buttons"} sx={{ marginLeft:'50px', marginTop:'20px',display: 'flex', gap: '50px',}}>
                    <Button variant="contained" sx={{ width: '200px', height: '50px' }} onClick={createPetition}>Create</Button>
                    <Link to={'/'}>
                        <Button variant="contained" sx={{ width: '200px', height: '50px', backgroundColor: '#FF0000' }}>Cancel</Button>
                    </Link>
                </Box>

            </Container>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4
                }}>
                    <Typography variant="h6" component="h2">
                        Upload Image (Optional)
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
                    {selectedImage && (
                        <Box mt={2}>
                            <img src={selectedImage as string} alt="Selected" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                        </Box>
                    )}
                    <Box mt={2} display="flex" justifyContent="space-between">
                        {modalErrorFlag && (
                            <Typography color="error" sx={{ marginTop: '20px', textAlign:'center'}}>
                                {modalErrorMessage}
                            </Typography>
                        )}
                        <Button variant="contained" color="primary" onClick={sendPetitionImage}>
                            Upload
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => navigate('/petitions')}>
                            Skip
                        </Button>
                    </Box>
                </Box>
            </Modal>



        </div>


    )
}




export default CreatePetition;