import axios from 'axios';
import React, {ChangeEvent} from "react";
import {Link} from 'react-router-dom';
import Petition from './Petition';
import {DataGrid, GridCellParams, GridColDef, GridRowParams} from '@mui/x-data-grid';
import Container from '@mui/material/Container';
import {Button, Chip, TextField} from "@mui/material";
import Avatar from '@mui/material/Avatar';

import {format} from "node:url";


const Petitions = () => {
    const [petitions, setPetitions] = React.useState<Array<Petition>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [query, setQuery] = React.useState("")
    const [petitionsWithCost, setPetitionsWithCost] = React.useState<PetitionWithCost[]>([]);

    React.useEffect(() => {
        getPetitions()
    }, [])

    React.useEffect(() => {
        const fetchCosts = async () => {
            const requests = petitions.map(async (petition) => {
                try {
                    const response = await axios.put<SupportTierPost>(`http://localhost:4941/api/v1/petitions/${petition.petitionId}/supportTiers`);
                    return {
                        ...petition,
                        description: response.data.description,
                        cost: response.data.cost
                    };
                } catch (error) {
                    console.error(`Error with ${petition.petitionId}:`, error);
                    return {
                        ...petition,
                        description:'',
                        cost:0
                    };
                }
            });

            const results = await Promise.all(requests);
            const validResults = results.filter((result) => result !== null) as PetitionWithCost[];
            setPetitionsWithCost(validResults);
        };

        if (petitions.length > 0) {
            fetchCosts();
        }
    }, [petitions]);

    const getPetitions = () => {
        axios.get('http://localhost:4941/api/v1/petitions')
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetitions(response.data.petitions)

            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }
    const getQueryPetitions = () => {
        axios.get('http://localhost:4941/api/v1/petitions?q=' + query)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetitions(response.data.petitions)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const searchPetitionState = (event:ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }
    const handleSearchClick = () => {
        if ( query.length === 0) {
            getPetitions()
        } else {
        getQueryPetitions()
            }
    }
    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter') {
            handleSearchClick();
        }
    };

    const columns: GridColDef[] = [
        { field: 'petitionImage', headerName: 'Petition Image', headerAlign: 'center', width: 130,
            align: 'center', renderCell: (aparams: GridCellParams) => {
                const petitionId = aparams.row.petitionId as number;
                return <img src={'http://localhost:4941/api/v1/petitions/' + petitionId + "/image"}
                            alt="Petition Image"
                            style={{ maxWidth: '100%', height: 'auto' }}
                />;
            }},
        { field: 'title', headerName: 'Title',headerAlign: 'center', width: 300, align: 'center' },
        {field: 'ownerFullName', headerName: 'Owner Name', headerAlign: 'center', width: 200, align: 'center',
            renderCell: (params: GridCellParams) => {
                const { ownerFirstName, ownerLastName } = params.row;
                return <span>{ownerFirstName} {ownerLastName}</span>;
        }},
        { field: 'userImage', headerName: 'Owner Image',headerAlign: 'center', width: 130,
            align: 'center', renderCell: (params: GridCellParams) => {
                const userId = params.row.ownerId as number;
                return <Avatar style={{ marginTop: 4, width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', justifyContent: "center", alignContent:"center"}}
                    src={'http://localhost:4941/api/v1/users/' + userId + "/image"} />

            }},
        { field: 'numberOfSupporters', headerName: 'No. of Supporters',headerAlign: 'center', width: 130,
            align: 'center' },
        { field: 'creationDate', headerName: 'Creation Date',headerAlign: 'center', width: 200, align: 'center'},
        { field: 'cost', headerName: 'Supporting Cost',headerAlign: 'center', width: 200, align: 'center'},


    ];
    const getRowId = (row:Petition) => row.petitionId;


    if (errorFlag) {
        return (
            <div>
                <h1>Petitions</h1>
                <div style={{color: "red"}}>
                    {errorMessage}
                </div>
            </div>
        )}
    else
        {
            return (
                <div>
                    <h1 style={{fontSize:'3rem'}}>Petitions</h1>
                    <Container style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 800
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', width:1400}}>
                            <TextField style={{height: 55, width: '80%'}}
                                       id="outlined-basic" label="Search Petition" variant="outlined"
                                       value={query} onChange={searchPetitionState} onKeyPress={handleKeyPress}/>
                            <Button style={{height: 55, width: '20%', fontSize: '1.5rem'}} variant="contained"
                                    onClick={handleSearchClick}>Search</Button>
                        </div>
                            <div style={{marginTop: '50px', height: 715, width: 1400}}>
                                <DataGrid
                                    rows={petitionsWithCost}
                                    getRowId={getRowId}
                                    rowHeight={110}
                                    style={{alignContent: "center", justifyContent: "center",}}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {page: 0, pageSize: 5},
                                        },
                                    }}
                                    pageSizeOptions={[5, 10]}
                                />
                            </div>
                    </Container>
                </div>
        )
        }

        }


        export default Petitions;