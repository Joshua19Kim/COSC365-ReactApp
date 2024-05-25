import axios from 'axios';
import React, {ChangeEvent, ReactNode} from "react";
import {Link, useParams} from 'react-router-dom';
import Petition from './Petition';
import {DataGrid, GridCellParams, GridColDef, GridRowParams} from '@mui/x-data-grid';
import Diversity2Icon from '@mui/icons-material/Diversity2';

import {
    Box,
    Button, Card,
    Typography,

} from "@mui/material";
import Avatar from '@mui/material/Avatar';
import ResponsiveAppBar from './ResponsiveAppBar';

const PetitionImageCell = ({ petitionId }: any) => {
    const [imageError, setImageError] = React.useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <>
            {imageError ? (
                <Diversity2Icon sx={{ color:'grey', fontSize: '40px', marginTop:'2rem' }} />
            ) : (
                <img
                    src={`http://localhost:4941/api/v1/petitions/${petitionId}/image`}
                    alt="Petition Image"
                    onError={handleImageError}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            )}
        </>
    );
};

const MyPetitions = () => {


    const {id} = useParams();
    const [myPetitions, setMyPetitions] = React.useState<Array<Petition>>([])
    const [supportingPetitions, setSupportingPetitions] = React.useState<Array<Petition>>([])
    const [categories, setCategories] = React.useState<Array<Category>>([])

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")


    React.useEffect(() => {
        if(localStorage.getItem('userId')) {
            const currentUserId = localStorage.getItem('userId');
            if (currentUserId !== id) {
                setErrorFlag(true)
                setErrorMessage("You are not allowed for this function");
            }
        }
        getMyPetitions()
        getSupportingPetitions()
        getCategories()

    }, [id])

    const getCategories = () => {
        axios.get('http://localhost:4941/api/v1/petitions/categories')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setCategories(response.data)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText);
            })
    }
    const getSupportingPetitions = () => {

        axios.get('http://localhost:4941/api/v1/petitions/?supporterId='+ id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setSupportingPetitions(response.data.petitions)

            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText);
            })
    }

    const getMyPetitions = () => {

        axios.get('http://localhost:4941/api/v1/petitions?ownerId='+ id)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setMyPetitions(response.data.petitions)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.response.statusText);
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

    const columns: GridColDef[] = [
        { field: 'petitionImage', headerName: 'Petition Image', headerAlign: 'center', width: 130, sortable: false, filterable:false,
            align: 'center', renderCell: (params: GridCellParams) => {
                const petitionId = params.row.petitionId as number;
                return <PetitionImageCell petitionId={petitionId} />;
            },
        },
        { field: 'title', headerName: 'Title',headerAlign: 'center', width: 310, align: 'center', sortable: false, filterable:false,},
        { field: 'categories', headerName: 'Category',headerAlign: 'center', width: 210, align: 'center', filterable:false, sortable: false,
            renderCell: (params: GridCellParams) => {
                const categoryId = params.row.categoryId as number;
                const category = categories.find(cat => cat.categoryId === categoryId);
                return <span>{category ? category.name : 'Unknown'}</span>
            }},
        {field: 'ownerFullName', headerName: 'Owner Name', headerAlign: 'center', width: 200, align: 'center', filterable:false, sortable: false,
            renderCell: (params: GridCellParams) => {
                const { ownerFirstName, ownerLastName } = params.row;
                return <span>{ownerFirstName} {ownerLastName}</span>;
        }},
        { field: 'userImage', headerName: 'Owner Image',headerAlign: 'center', width: 130, sortable: false, filterable:false,
            align: 'center', renderCell: (params: GridCellParams) => {
                const userId = params.row.ownerId as number;
                return <Avatar style={{ marginTop: 4, width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', justifyContent: "center", alignContent:"center"}}
                    src={'http://localhost:4941/api/v1/users/' + userId + "/image"} />

            }},

        { field: 'creationDate', headerName: 'Creation Date',headerAlign: 'center', width: 180, align: 'center', sortable: false, filterable:false,
            renderCell: (params: GridCellParams) => {
                const creationDate = formatDate(params.row.creationDate)
                return <span>{creationDate}</span>;
            }
        },
        { field: 'supportingCost', headerName: 'Supporting Cost',headerAlign: 'center', width: 130, align: 'center', sortable: false, filterable:false,},
        { field: 'view', headerName: 'View Details', headerAlign: 'center', width: 100, align: 'center', filterable:false, sortable:false,
            renderCell: (params: GridCellParams) => {
            const petitionId = params.row.petitionId as number;
                return <Link to={"/petitions/" + petitionId}> <Button style={{backgroundColor:'#4a916e'}} variant="contained">View</Button> </Link>
            }
        },
    ];
    const getRowId = (row:Petition) => row.petitionId;


    if (errorFlag) {
        return (
            <div>
                <h1>My Petitions</h1>
                <div style={{color: "red"}}>
                    {errorMessage}
                </div>
            </div>
        )}
    else
        {
            return (
                <div>
                    <h1 style={{fontSize: '40px'}}>My Petitions</h1>
                    <Card
                        sx={{
                            display: 'inline-block', margin: 'auto', flexDirection: 'column', justifyContent: 'center',
                            alignItems: 'center', alignContent: 'center', alignSelf: 'center',
                            height: 'flex', width: 1500, boxShadow: 10, minHeight:300
                        }}
                    >
                        <Typography textAlign="center" variant="h6" component="h2"
                                    sx={{fontSize: '3rem', textAlign: 'left', marginLeft: '2rem', width: '400px' }}>
                            My Petitions
                        </Typography>
                        <Box style={{ height: 'flex', width: 1400, marginLeft: '2rem',}}>
                            {myPetitions.length > 0 ? (
                                <DataGrid
                                    rows={myPetitions}
                                    getRowId={getRowId}
                                    rowHeight={110}
                                    columns={columns}
                                    initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
                                    pageSizeOptions={[5, 6, 7, 8, 9, 10]}
                                    style={{
                                        height: '100%', width: '100%', alignContent: 'center', justifyContent: 'center'
                                    }}
                                />
                            ) : (
                                <Typography variant="h6" textAlign="center" sx={{ marginTop: '20px' }}>
                                    There is no matching petition.
                                </Typography>
                            )}

                        </Box>
                    </Card>
                    <Card
                        sx={{
                            display: 'inline-block', margin: 'auto', flexDirection: 'column', justifyContent: 'center',
                            alignItems: 'center', alignContent: 'center', alignSelf: 'center',
                            height: 'flex', width: 1500, boxShadow: 10, minHeight:500
                        }}
                    >
                        <Typography
                            textAlign="center" variant="h6" component="h2"
                            sx={{
                                fontSize: '3rem', textAlign: 'left', marginLeft: '2rem', width: '100%'
                            }}
                        >
                            Currently supporting petitions
                        </Typography>
                        <Box style={{ height: 'auto', width: 1400, marginLeft: '2rem' }}>
                            {supportingPetitions.length > 0 ? (
                                <DataGrid
                                    rows={supportingPetitions}
                                    getRowId={getRowId}
                                    rowHeight={110}
                                    columns={columns}
                                    initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
                                    pageSizeOptions={[5, 6, 7, 8, 9, 10]}
                                    style={{
                                        height: '100%', width: '100%', alignContent: 'center', justifyContent: 'center'
                                    }}
                                />
                            ) : (
                                <Typography variant="h6" textAlign="center" sx={{ marginTop: '20px' }}>
                                    There is no matching petition.
                                </Typography>
                            )}
                        </Box>
                    </Card>
                </div>


            )
        }

}


export default MyPetitions;