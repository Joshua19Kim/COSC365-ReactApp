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


    React.useEffect(() => {
        getPetitions()
    }, [])

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
                // setSerchedNumber(response.data.count)
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

    const list_of_petitions = () => {
        return petitions.map((petition: Petition) =>
            <tr key={petition.petitionId}>
                <th scope="row">{petition.petitionId}</th>
                <td>{petition.title}</td>

                <td>
                    <button type="button">Delete</button>
                    <button type="button">Edit</button>
                </td>
            </tr>
        )
    }
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
        { field: 'ownerFirstName', headerName: 'Owner First Name',headerAlign: 'center', width: 130, align: 'center' },
        { field: 'ownerLastName', headerName: 'Owner Last Name',headerAlign: 'center', width: 130, align: 'center' },
        { field: 'userImage', headerName: 'Owner Image',headerAlign: 'center', width: 130,
            align: 'center', renderCell: (params: GridCellParams) => {
                const userId = params.row.ownerId as number;
                return <Avatar style={{ marginTop: 4, width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', justifyContent: "center", alignContent:"center"}}
                    src={'http://localhost:4941/api/v1/users/' + userId + "/image"} />

            }},
        { field: 'numberOfSupporters', headerName: 'No. of Supporters',headerAlign: 'center', width: 130,
            align: 'center' },
        { field: 'creationDate', headerName: 'Creation Date',headerAlign: 'center', width: 200, align: 'center'},

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
                    <h1>Petitions</h1>
                        <Container style={{ height: 800}}>
                            <TextField style={{height: 25, width: '80%'}}
                                       id="outlined-basic" label="Search Petition" variant="outlined"
                                        value={query} onChange={searchPetitionState} onKeyPress={handleKeyPress}/>
                            <Button style={{height: 55, width: '20%', fontSize: '1.5rem'}} variant="contained"
                                    onClick={handleSearchClick}>Search</Button>
                            <div style={{marginTop: '50px', height: 715, width: 1300} }>
                                <DataGrid
                                    rows={petitions}
                                    getRowId={getRowId}
                                    rowHeight={110}
                                    style={{alignContent:"center", justifyContent: "center",}}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {page: 0, pageSize: 5},
                                        },
                                    }}
                                    pageSizeOptions={[5, 10]}
                                    // checkboxSelection

                                />
                            </div>
                        </Container>
                </div>
            )
        }

}


export default Petitions;