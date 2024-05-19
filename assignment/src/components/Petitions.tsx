import axios from 'axios';
import React, {ChangeEvent, ReactNode} from "react";
import {Link} from 'react-router-dom';
import Petition from './Petition';
import {DataGrid, GridCellParams, GridColDef, GridRowParams} from '@mui/x-data-grid';
import Container from '@mui/material/Container';
import {
    Button,
    Chip,
    FormControl, IconButton, InputAdornment,
    InputLabel, MenuItem, OutlinedInput,
    Select,
    SelectChangeEvent, styled,
    TextField,
    Theme,
    useTheme
} from "@mui/material";
import Avatar from '@mui/material/Avatar';
import {Clear} from "@mui/icons-material";
import * as querystring from "querystring";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

function ClearIcon() {
    return null;
}

const ClearButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: -40,
    top: '50%',
    transform: 'translateY(-50%)',
}));

const Petitions = () => {
    const [petitions, setPetitions] = React.useState<Array<Petition>>([])
    const [categories, setCategories] = React.useState<Array<Category>>([])

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [query, setQuery] = React.useState("")
    const theme = useTheme();
    const [categoryName, setCategoryName] = React.useState<string[]>([]);
    const categoryNames = categories.map(category => category.name);
    const [maximumCost, setMaximumCost] = React.useState("");
    const [chosenCategoriesId, setChosenCategoriesId] = React.useState<Array<number>>([])

    const selectingCategories = (event: SelectChangeEvent<typeof categoryName>) => {
        const selectedCategoryNames = event.target.value as string[];
        const selectedCategoryIds: number[] = [];

        selectedCategoryNames.forEach(name => {
            const category = categories.find(category => category.name === name);
            if(category) {
                selectedCategoryIds.push(category.categoryId);
            }
        });
        setChosenCategoriesId(selectedCategoryIds);
        setCategoryName(selectedCategoryNames);

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
    }, [chosenCategoriesId, maximumCost, categoryName])

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
        let basicURL = 'http://localhost:4941/api/v1/petitions';
        let queryForm = "";
        let supportCostForm = "";
        let categoryForm = "";
        if (query.length !== 0) { queryForm = 'q='+query}

        if ( maximumCost !== ""  && query.length === 0) {
            supportCostForm = 'supportingCost='+ maximumCost;
        } else if (maximumCost !== "" && query.length !== 0) {
            supportCostForm = '&supportingCost='+ maximumCost;
        }

        if (chosenCategoriesId.length ===1) {
            categoryForm = '&categoryIds=' + chosenCategoriesId[0];
        } else if (chosenCategoriesId.length !== 0) {
            categoryForm = chosenCategoriesId.map(id => `&categoryIds=${id}`).join('&');
        }

        if (queryForm.length !== 0 || supportCostForm.length !== 0 || categoryForm.length !==0) {
            basicURL += "?";
        }
        const result = basicURL + queryForm + supportCostForm + categoryForm;
        axios.get(basicURL + queryForm + supportCostForm + categoryForm)
            .then((response) => {
                setErrorFlag(false)
                setErrorMessage("")
                setPetitions(response.data.petitions)
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
        console.log(result)
    }

    const checkMinimumCostState = (event:ChangeEvent<HTMLInputElement>) => {
        setMaximumCost(!isNaN(Number(event.target.value)) ? event.target.value : "");
    }
    const searchPetitionState = (event:ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value)
    }
    const handleSearchClick = () => {
        getPetitions()

    }
    const handleKeyPressEnter = (event: any) => {
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

        { field: 'creationDate', headerName: 'Creation Date',headerAlign: 'center', width: 140, align: 'center', filterable:false,
            renderCell: (params: GridCellParams) => {
                const creationDate = new Date(params.row.creationDate).toISOString().split('T')[0];
                return <span>{creationDate}</span>;
            }
        },
        { field: 'supportingCost', headerName: 'Supporting Cost',headerAlign: 'center', width: 170, align: 'center', filterable:false,},
        { field: 'view', headerName: 'View Details', headerAlign: 'center', width: 100, align: 'center', filterable:false, sortable:false,
            renderCell: (params: GridCellParams) => {
            const petitionId = params.row.petitionId as number;
                return <Link to={"/petitions/" + petitionId}> <Button variant="contained">View</Button> </Link>
            }
        },


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
                        display: 'grid',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 100
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', width: 1400}}>
                            <TextField style={{height: 55, width: '80%'}}
                                       id="outlined-basic" label="Search Petition" variant="outlined"
                                       value={query} onChange={searchPetitionState} onKeyPress={handleKeyPressEnter}/>
                            <Button style={{height: 55, width: '20%', fontSize: '1.5rem'}} variant="contained"
                                    onClick={handleSearchClick}>Search</Button>
                        </div>
                        <Container style={{
                            display: 'grid',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 80,
                            width: 1400
                        }}>
                            <div style={{display: 'grid',width: 1400}}>
                                <FormControl sx={{m: 1, width: '60%'}}>
                                    <InputLabel id="demo-multiple-name-label">Category</InputLabel>
                                    <Select
                                        labelId="demo-multiple-name-label"
                                        id="demo-multiple-name"
                                        multiple
                                        value={categoryName}
                                        onChange={selectingCategories}
                                        input={<OutlinedInput style={{textAlign: "left"}} label="Name"/>}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 48 * 4.5 + 8,
                                                    width: 250,
                                                },
                                            },
                                        }}
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
                                <FormControl sx={{m: 1, width: '20%'}}>
                                <TextField id="outlined-basic" label="Maximum Cost" variant="outlined"
                                           value={maximumCost} onChange={checkMinimumCostState} onKeyPress={handleKeyPressEnter}/>
                                </FormControl>

                            </div>
                        </Container>

                        <div style={{marginTop: '70px', height: 715, width: 1400}}>
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