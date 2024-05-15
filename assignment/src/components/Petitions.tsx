import axios from 'axios';
import React, {ChangeEvent} from "react";
import {Link} from 'react-router-dom';
import Petition from './Petition';
import {DataGrid, GridCellParams, GridColDef} from '@mui/x-data-grid';
import Container from '@mui/material/Container';
import {Button, Chip, TextField} from "@mui/material";


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
        { field: 'image', headerName: 'Image', width: 130, renderCell: (params: GridCellParams) => {
                const petitionId = params.row.petitionId as number;
                return <img src={'http://localhost:4941/api/v1/petitions/' + petitionId + "/image"} alt="Petition Image" />;
            }},
        { field: 'petitionId', headerName: 'ID', width: 70},
        { field: 'title', headerName: 'Title', width: 130, align: 'center' },
        { field: 'ownerFirstName', headerName: 'Owner First Name', width: 130, align: 'center' },
        { field: 'ownerLastName', headerName: 'Owner Last Name', width: 130, align: 'center' },
        { field: 'numberOfSupporters', headerName: 'No. of Supporters', width: 130, align: 'center' },
        { field: 'creationDate', headerName: 'Creation Date', width: 200, align: 'center' },

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
                        <Container maxWidth="xl">
                            <TextField style={{height: 25, width: '80%'}}
                                       id="outlined-basic" label="Search Petition" variant="outlined"
                                        value={query} onChange={searchPetitionState} onKeyPress={handleKeyPress}/>
                            <Button style={{height: 55, width: '20%', fontSize: '1.5rem'}} variant="contained"
                                    onClick={handleSearchClick}>Search</Button>
                            <div style={{marginTop: '50px', height: 400, width: '100%'}}>
                                <DataGrid
                                    rows={petitions}
                                    getRowId={getRowId}
                                    rowHeight={50}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {page: 0, pageSize: 5},
                                        },
                                    }}
                                    pageSizeOptions={[5, 10]}
                                    checkboxSelection

                                />
                            </div>
                        </Container>
                </div>
            )
        }

}


export default Petitions;