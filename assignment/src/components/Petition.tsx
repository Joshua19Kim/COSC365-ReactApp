import React, {useEffect, useState} from "react";
import axios from "axios";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {
    Alert,
    Box, Button,
    Container,
    IconButton, Modal,
    Paper, SelectChangeEvent, Stack,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow, Typography
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Avatar from "@mui/material/Avatar";
import {Simulate} from "react-dom/test-utils";
import error = Simulate.error;
import ResponsiveAppBar from "./ResponsiveAppBar";
import {PhotoCamera} from "@mui/icons-material";
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';


const Div = styled('div')(({ theme }) => ({
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
}));

const Petition = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [modalErrorFlag, setModalErrorFlag] = React.useState(false)
    const [modalErrorMessage, setModalErrorMessage] = React.useState("")
    const [petition, setPetition]
        = React.useState<PetitionFull>({
        petitionId: 0, title: "", categoryId: 0, creationDate: "", ownerId: 0, ownerFirstName: "", ownerLastName: "",
        numberOfSupporters: 0, supportingCost:0, description: "", moneyRaised: 0, supportTiers: []})
    const [similarPetitions, setSimilarPetitions] = React.useState<Petition[]>([])
    const [categories, setCategories] = React.useState<Array<Category>>([])
    const [petitionImage, setPetitionImage] = React.useState<string | null>(null);
    const [petitions, setPetitions] = React.useState<Array<Petition>>([])
    const [supporters, setSupporters] = React.useState<Supporter[]>([])
    const [isUserTheOwner, setIsUserTheOwner] = React.useState<boolean>(false);
    const [modalOpen, setModalOpen] = React.useState(false);




    React.useEffect(() => {
        getPetition()
        getPetitionImage()
        getSupporters()
        getCategories()
    }, [id])

    React.useEffect(() => {
        if (petition.categoryId !== 0) {
            getPetitions();
        }
        if(localStorage.getItem('userId')) {
            const currentUserId = Number(localStorage.getItem('userId'));
            if (currentUserId === petition.ownerId) {
                setIsUserTheOwner(true);
            }
        }
    }, [petition]);

    React.useEffect(() => {
        if (petitions.length > 0 && petition.categoryId !== 0) {
            const similar = petitions.filter(tempPetitions => (petition.categoryId === tempPetitions.categoryId || petition.ownerId === tempPetitions.ownerId) &&
                 petition.petitionId !== tempPetitions.petitionId);
            setSimilarPetitions(similar);
        }
    }, [id,petitions]);


    const getPetition = () => {
        axios.get('http://localhost:4941/api/v1/petitions/' + id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetition(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }
    const getPetitions = () => {
        axios.get( 'http://localhost:4941/api/v1/petitions')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetitions(response.data.petitions)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }
    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.categoryId === categoryId);
        return category ? category.name : 'Unknown'
    }

    const getSupporters = () => {
        axios.get('http://localhost:4941/api/v1/petitions/' + id + '/supporters')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSupporters(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
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

    const findSupportTierTitle = (supportTierId: number): string => {
        const supportTier = petition.supportTiers.find(tier => tier.supportTierId === supportTierId)
        return supportTier ? supportTier.title:'';
    }
    const getPetitionImage = () => {
        axios.get( 'http://localhost:4941/api/v1/petitions/' + id + "/image", {responseType:"blob"})
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetitionImage(URL.createObjectURL(response.data))
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const formatDate = (date : string) => {
        const formattedDate = new Date(date);
        return formattedDate.toLocaleString('en-NZ', {
            timeZone: 'Pacific/Auckland',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    }

    const deletePetition = async () => {
        await axios.delete('http://localhost:4941/api/v1/petitions/'+ petition.petitionId , {
            headers: {
                'X-Authorization': `${localStorage.getItem("token")}`
            }
        })
            .then((response) => {
                    setModalErrorFlag(false);
                    setModalErrorMessage("");
                    navigate("/petitions/");
                }, (error) => {
                    setModalErrorFlag(true);
                if (error.response.statusText.includes("Unauthorized" || "Only the owner of")) {
                    setModalErrorMessage("You are not authorized to delete this petition.");
                } else if (error.response.statusText.includes("Can not delete a petition with one or")) {
                    setModalErrorMessage("You cannot delete a petition with one or more supporters");
                } else if (error.response.statusText.includes("Not Found. No petition")) {
                    setModalErrorMessage("Cannot find a petition!!");
                } else if (error.response.statusText.includes("Internal Server Error")) {
                    setModalErrorMessage("Server Error");
                } else {
                    setModalErrorMessage("Failed to delete this petition, ask a Developer.");
                }
                }
            )
    }

    if (errorFlag) {
        return (
            <div>
                <h1>Petition</h1>
                <div style={{color: "red"}}>
                    {errorMessage}
                </div>
            </div>
        )}
    else
    {
        return (
            <div>
                <ResponsiveAppBar />
                <div
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px'}}>
                    <IconButton aria-label="back to petitions" color="secondary" component={Link} to="/"
                                style={{marginRight: '16px'}}>
                        <ArrowBackIcon style={{fontSize: 50}}/>
                    </IconButton>
                    <h1 style={{flex: 1, textAlign: 'center', fontSize: '40px'}}>
                        {petition.title}
                    </h1>
                    {isUserTheOwner && (
                        <Box id={"buttons"} sx={{ marginLeft:'50px', marginTop:'20px',display: 'flex', gap: '50px',}}>
                            <Link to={'/editPetition/'+ petition.petitionId}><Button variant="contained" sx={{ width: '200px', height: '50px' }}>
                                Edit
                            </Button></Link>
                            <Button variant="contained" sx={{ width: '100px', height: '50px', backgroundColor: '#FF0000', '&:hover': {
                                    backgroundColor: '#8B0000', // Dark red color
                                }, }} onClick={() => setModalOpen(true)}>
                                Delete
                            </Button>
                        </Box>

                    )}
                    <div style={{width: '48px'}}></div>
                </div>

                    <Container style={{
                        position: 'relative', height: '1000px', width: '1800px', display: 'flex', maxWidth: '1800px'
                    }}>
                        <Container style={{
                            position: 'relative', height: '1000px', width: '800px', display: 'flex', maxWidth: '800px'
                        }}>
                            <Box height={1000} width={800} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                <Box height={1000} width={700} display="flex" flexDirection="row" alignItems="flex-start" justifyContent="flex-start">

                                    <Box height={600} width={400} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="flex-start" marginTop={5}>
                                        <Box height={300} width={300} display="flex" alignItems="center" justifyContent="center" p={1} sx={{ border: '0.2px solid grey' }}>
                                            {petitionImage ? (
                                                <img
                                                    src={petitionImage}
                                                    alt="Petition Image"
                                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <ImageNotSupportedIcon sx={{fontSize: '150px'}}></ImageNotSupportedIcon>
                                            )}
                                            {errorFlag && <p>Error: {errorMessage}</p>}
                                        </Box>
                                        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" textAlign="center">
                                            <Div>Created on {formatDate(petition.creationDate)}</Div>
                                            <Avatar style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', marginTop: '40px'}}
                                                    src={'http://localhost:4941/api/v1/users/' + petition.ownerId + "/image"} />
                                            <Div style={{fontSize: '30px'}}>{petition.ownerFirstName} {petition.ownerLastName} </Div>
                                        </Box>
                                    </Box>

                                    <Box height={200} width={300} display="flex" marginRight="20px" flexDirection="column" justifyContent="center" alignItems="center" >
                                        <Box position="absolute" top={10} flexDirection="column" justifyContent="center" alignItems="center" textAlign="center" marginTop={'10px'}>
                                            <Div>No.Supporters</Div>
                                            <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '4rem' }}>
                                                {petition.numberOfSupporters}
                                            </Typography>
                                            <Div>Total money raised</Div>
                                            <Typography textAlign="center" variant="h6" component="h2" sx={{ fontSize: '4rem' }}>
                                                ${petition.moneyRaised}
                                            </Typography>

                                        </Box>
                                        <Box position="absolute" top={400} flexDirection="column" justifyContent="center" alignItems="center" textAlign="center">
                                            <Div>{"-Description-"}</Div>
                                            <Div>{petition.description}</Div>
                                        </Box>
                                    </Box>

                                </Box>
                            </Box>

                        </Container>


                        <Container
                            style={{
                                position: 'relative', height: 800, width: 930, display: 'flex', flexDirection: "column"
                            }}>

                            <Box marginBottom={"20px"}>
                                <Div style={{fontSize: 30}}>{"-Support Tier-"}</Div>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Support Tier Title</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell align="right">Cost</TableCell>

                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {petition.supportTiers.map((row) => (
                                                <TableRow
                                                    key={row.title}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        {row.title}
                                                    </TableCell>
                                                    <TableCell>{row.description}</TableCell>
                                                    <TableCell align="right">${row.cost}</TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                            </Box>

                            <Box>
                                <Div style={{fontSize: 30}}>{"-Supporters-"}</Div>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Supporter Title</TableCell>
                                                <TableCell>Message</TableCell>
                                                <TableCell align="center">Name</TableCell>
                                                <TableCell align="center">Time Stamp</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {supporters.map((row) => (
                                                <TableRow
                                                    key={row.supportId}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell component="th" scope="row"> {findSupportTierTitle(row.supportTierId)}</TableCell>
                                                    <TableCell>{row.message}</TableCell>
                                                    <TableCell align="center">
                                                        <div style={{display: 'flex', alignItems: 'center', marginLeft:"100px"}}>
                                                            <Avatar
                                                                style={{
                                                                    marginRight: '8px',
                                                                    width: 80,
                                                                    height: 80,
                                                                    borderRadius: '50%',
                                                                    overflow: 'hidden',
                                                                }}
                                                                src={`http://localhost:4941/api/v1/users/${row.supporterId}/image`}
                                                                alt={`${row.supporterFirstName} ${row.supporterLastName}`}
                                                            />
                                                            {row.supporterFirstName} {row.supporterLastName}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align="right">{formatDate(row.timestamp)}</TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

                            <Box marginBottom={"50px"} marginTop={"50px"} maxWidth={"1000px"}>
                                <Div style={{fontSize: 30}}>{"-Similar Petitions-"}</Div>
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 700 }} size="small" aria-label="a dense table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Petition Image</TableCell>
                                                <TableCell>Title</TableCell>
                                                <TableCell align="left">Category</TableCell>
                                                <TableCell align="center">Owner</TableCell>
                                                <TableCell align="right">Creation Date</TableCell>
                                                <TableCell align="right">Supporting Cost</TableCell>
                                                <TableCell align="right">View Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {similarPetitions.map((row) => (
                                                <TableRow
                                                    key={row.petitionId}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell component="th" scope="row">
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}>
                                                            <img src={'http://localhost:4941/api/v1/petitions/' + row.petitionId + "/image"}
                                                                 alt="Petition Image"
                                                                 style={{ maxWidth: '100px', height: "auto" }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{row.title}</TableCell>
                                                    <TableCell>{getCategoryName(row.categoryId)}</TableCell>
                                                    <TableCell align="left">
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'left',
                                                            marginLeft: "40px"
                                                        }}>
                                                            {row.ownerFirstName} {row.ownerLastName}
                                                            <Avatar
                                                                style={{
                                                                    marginRight: '8px',
                                                                    width: 80,
                                                                    height: 80,
                                                                    borderRadius: '50%',
                                                                    overflow: 'hidden',
                                                                }}
                                                                src={`http://localhost:4941/api/v1/users/${row.ownerId}/image`}
                                                                alt={`${row.ownerFirstName} ${row.ownerLastName}`}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell align="right">{formatDate(row.creationDate)}</TableCell>
                                                    <TableCell align="right">${row.supportingCost}</TableCell>
                                                    <TableCell><Link to={"/petitions/" + row.petitionId}> <Button variant="contained">View</Button> </Link></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

                        </Container>
                    </Container>
                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)', width: 400, height: 200, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4
                    }}>
                        <Typography variant="h6" component="h2" sx={{marginTop:'40px'}}>
                            Do you really want to delete this petition???
                        </Typography>
                        {modalErrorFlag && (
                            <Typography color="error" sx={{ marginTop: '20px', textAlign:'center'}}>
                                {modalErrorMessage}
                            </Typography>
                        )}
                        <Box mt={2} display="flex" justifyContent="space-between" sx={{marginTop:'70px'}}>
                            <Button variant="contained" color="primary" sx={{ width: '200px', height: '50px', backgroundColor: '#FF0000', '&:hover': {
                                    backgroundColor: '#8B0000', // Dark red color
                                }, }}
                                onClick={deletePetition}
                            >
                                Delete
                            </Button>
                            <Button variant="contained" sx={{ width: '150px', height: '50px' }} onClick={() => setModalOpen(false)}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
        )
    }

}


export default Petition;