import React from "react";
import axios from "axios";
import {Link, useNavigate, useParams} from "react-router-dom";
import {
    Box,
    Container,
    IconButton,
    Paper, SelectChangeEvent,
    styled,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Avatar from "@mui/material/Avatar";


const Div = styled('div')(({ theme }) => ({
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
}));

const Petition = () => {

    const {id} = useParams();
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [petition, setPetition]
        = React.useState<PetitionFull>({
        petitionId: 0,
        title: "",
        categoryId: 0,
        creationDate: "",
        ownerId: 0,
        ownerFirstName: "",
        ownerLastName: "",
        numberOfSupporters: 0,
        supportingCost:0,
        description: "",
        moneyRaised: 0,
        supportTiers: []})
    const [similarPetitions, setSimilarPetitions] = React.useState<Petition[]>([])
    const [categories, setCategories] = React.useState<Array<Category>>([])
    const [petitionImage, setPetitionImage] = React.useState<string | null>(null);
    const [petitions, setPetitions] = React.useState<Array<Petition>>([])
    const [supporters, setSupporters] = React.useState<Supporter[]>([])


    React.useEffect(() => {
        getPetition()
        getPetitions()
        getPetitionImage()
        getSupporters()
        getCategories()
        getSimilarPetitions()
    }, [id])

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
    const getSimilarPetitions = () => {
        setSimilarPetitions(petitions.filter(tempPetitions => petition.categoryId === tempPetitions.categoryId))
        console.log(similarPetitions)
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
        console.log(petitionImage)
    }

    const tidyUpTime = (time:string):  string => {
        return new Date(time).toISOString().split('T')[0];
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
                <div
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px'}}>
                    <IconButton aria-label="back to petitions" color="secondary" component={Link} to="/"
                                style={{marginRight: '16px'}}>
                        <ArrowBackIcon style={{fontSize: 50}}/>
                    </IconButton>
                    <h1 style={{flex: 1, textAlign: 'center', fontSize: '40px'}}>{petition.title}</h1>
                    <div style={{width: '48px'}}></div>
                </div>
                <Container style={{
                    position: 'relative',
                    height: 700,
                    width: 1400,
                    display: 'flex',
                }}>
                    <Box height={500} width={500} my={4} display="flex" alignItems="flex-start" justifyContent="flex-start" p={2} sx={{ border: '0.5px solid grey' }}>
                        {petitionImage ? (
                            <img
                                src={petitionImage}
                                alt="Petition Image"
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <p>Loading image...</p>
                        )}
                        {errorFlag && <p>Error: {errorMessage}</p>}
                    </Box>
                    <Box height={700} width={500} my={4} display="flex" flexDirection="column" justifyContent="center" alignItems="center" position="relative">
                        <Box position="absolute" top={0} flexDirection="column" justifyContent="center" alignItems="center" textAlign="center">
                            <Div style={{fontSize : "20px"}}>{"-Petition Owner-"}</Div>
                            <Avatar style={{ marginLeft: 50, width: 160, height: 160, borderRadius: '50%'
                                , overflow: 'hidden'}}
                                    src={'http://localhost:4941/api/v1/users/' + petition.ownerId + "/image"} />
                            <Div style={{fontSize: '30px'}}>{petition.ownerFirstName} {petition.ownerLastName} </Div>

                        </Box>
                        <Box position="absolute" top={330} flexDirection="column" justifyContent="center" alignItems="center" textAlign="center">
                            <Div>No.Supporters: {petition.numberOfSupporters}</Div>
                            <Div>Total money raised: ${petition.moneyRaised}</Div>
                        </Box>
                        <Box position="absolute" bottom={50} flexDirection="column" justifyContent="center" alignItems="center" textAlign="center">
                            <Div>{"-Description-"}</Div>
                            <Div>{petition.description}</Div>
                            <Div>Created on {petition.creationDate}</Div>
                        </Box>
                    </Box>
                </Container>
                <Container
                    style={{
                        position: 'relative',
                        height: 700,
                        width: 1500,
                        display: 'flex',
                        flexDirection: "column"
                    }}>
                    <Box marginBottom={"50px"} marginTop={"50px"}>
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
                                        <TableCell align="right">Time Stamp</TableCell>


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
                                            <TableCell align="right">{tidyUpTime(row.timestamp)}</TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                    </Box>
                </Container>
                <Container
                    style={{
                        position: 'relative',
                        height: 700,
                        width: 1500,
                        display: 'flex',
                        flexDirection: "column"
                    }}>
                    <Box marginBottom={"50px"} marginTop={"100px"}>
                        <Div style={{fontSize: 30}}>{"-Similar Petitions-"}</Div>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Petition Image</TableCell>
                                        <TableCell>Title</TableCell>
                                        <TableCell align="center">Category</TableCell>
                                        <TableCell align="right">Owner Name</TableCell>
                                        <TableCell align="right">Owner Image</TableCell>
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
                                                    marginLeft: "100px"
                                                }}>

                                                </div>
                                            </TableCell>
                                            <TableCell>{row.title}</TableCell>
                                            <TableCell>{getCategoryName(row.categoryId)}</TableCell>
                                            <TableCell>{row.ownerFirstName} {row.ownerLastName}</TableCell>
                                            <TableCell align="center">
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginLeft: "100px"
                                                }}>

                                                </div>
                                            </TableCell>
                                            <TableCell>{row.supportingCost}</TableCell>

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Container>

            </div>
        )
    }

}


export default Petition;