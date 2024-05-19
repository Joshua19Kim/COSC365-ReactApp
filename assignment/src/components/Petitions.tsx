import axios from 'axios';
import React, {ChangeEvent} from "react";
import {Link} from 'react-router-dom';
import Petition from './Petition';
import {DataGrid, GridCellParams, GridColDef, GridRowParams} from '@mui/x-data-grid';
import Container from '@mui/material/Container';
import {
    Button,
    Chip,
    FormControl,
    InputLabel, MenuItem, OutlinedInput,
    Select,
    SelectChangeEvent,
    TextField,
    Theme,
    useTheme
} from "@mui/material";
import Avatar from '@mui/material/Avatar';
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
];



const Petitions = () => {
    const [petitions, setPetitions] = React.useState<Array<Petition>>([])
    const [categories, setCategories] = React.useState<Array<Category>>([])

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [query, setQuery] = React.useState("")
    const theme = useTheme();
    const [categoryName, setCategoryName] = React.useState<string[]>([]);
    const categoryNames = categories.map(category => category.name);


    const handleChange = (event: SelectChangeEvent<typeof categoryName>) => {
        const {
            target: { value },
        } = event;
        setCategoryName(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
        }

    function getStyles(name: string, personName: string[], theme: Theme) {
        return {
            fontWeight:
                personName.indexOf(name) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
        };
    }


    React.useEffect(() => {
        getPetitions()
        getCategories()
    }, [])
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
        { field: 'petitionImage', headerName: 'Petition Image', headerAlign: 'center', width: 130, sortable: false, filterable:false,
            align: 'center', renderCell: (aparams: GridCellParams) => {
                const petitionId = aparams.row.petitionId as number;
                return <img src={'http://localhost:4941/api/v1/petitions/' + petitionId + "/image"}
                            alt="Petition Image"
                            style={{ maxWidth: '100%', height: 'auto' }}
                />;
            }},
        { field: 'title', headerName: 'Title',headerAlign: 'center', width: 310, align: 'center', filterable:false,},
        { field: 'categories', headerName: 'Category',headerAlign: 'center', width: 210, align: 'center', filterable:false,
            renderCell: (params: GridCellParams) => {
                const categoryId = params.row.categoryId as number;
                const category = categories.find(cat => cat.categoryId === categoryId);
                return <span>{category ? category.name : 'Unknown'}</span>
            }},
        {field: 'ownerFullName', headerName: 'Owner Name', headerAlign: 'center', width: 200, align: 'center', filterable:false,
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

        { field: 'creationDate', headerName: 'Creation Date',headerAlign: 'center', width: 140, align: 'center', filterable:false,
            renderCell: (params: GridCellParams) => {
                const creationDate = new Date(params.row.creationDate).toISOString().split('T')[0];
                return <span>{creationDate}</span>;
            }
        },
        { field: 'supportingCost', headerName: 'Supporting Cost',headerAlign: 'center', width: 200, align: 'center', filterable:false,},


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
                    <h1 style={{fontSize: '3rem'}}>Petitions</h1>
                    <Container style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 800
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', width: 1400}}>
                            <TextField style={{height: 55, width: '80%'}}
                                       id="outlined-basic" label="Search Petition" variant="outlined"
                                       value={query} onChange={searchPetitionState} onKeyPress={handleKeyPress}/>
                            <Button style={{height: 55, width: '20%', fontSize: '1.5rem'}} variant="contained"
                                    onClick={handleSearchClick}>Search</Button>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', width: 1400}}>
                            <FormControl sx={{m: 1, width: 1000}}>
                                <InputLabel id="demo-multiple-name-label">Category</InputLabel>
                                <Select
                                    labelId="demo-multiple-name-label"
                                    id="demo-multiple-name"
                                    multiple
                                    value={categoryName}
                                    onChange={handleChange}
                                    input={<OutlinedInput label="Name"/>}
                                    MenuProps={MenuProps}
                                >
                                    {categoryNames.map((name) => (
                                        <MenuItem
                                            key={name}
                                            value={name}
                                            style={getStyles(name, categoryName, theme)}
                                        >
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div style={{marginTop: '50px', height: 715, width: 1400}}>
                            <DataGrid
                                rows={petitions}
                                getRowId={getRowId}
                                rowHeight={110}
                                style={{alignContent: "center", justifyContent: "center",}}
                                columns={columns}
                                initialState={{
                                    pagination: {
                                        paginationModel: {page: 0, pageSize: 5},
                                    },
                                }}
                                pageSizeOptions={[5, 6, 7, 8, 9, 10]}
                            />
                        </div>
                    </Container>
                </div>
            )
        }

}


export default Petitions;