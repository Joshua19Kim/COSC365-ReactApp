import axios from 'axios';
import React, {ChangeEvent, ReactNode, useState} from "react";
import {Link} from 'react-router-dom';
import Petition from './Petition';
import {DataGrid, GridCellParams, GridColDef, GridRowParams} from '@mui/x-data-grid';
import Container from '@mui/material/Container';
import { useLocation } from 'react-router-dom';
import {
    Alert,
    Box,
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
import ResponsiveAppBar from './ResponsiveAppBar';
import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";
import Diversity2Icon from "@mui/icons-material/Diversity2";
import CheckIcon from "@mui/icons-material/Check";

const Div = styled('div')(({ theme }) => ({
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
}));

function getStyles(name: string, personName: string[], theme: Theme) {
    return {
        fontWeight:
            personName.indexOf(name) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

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
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");


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
                setErrorMessage(error.response.statusText);
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
            axios.get(basicURL + queryForm + supportCostForm + categoryForm)
                .then((response) => {
                    setErrorFlag(false)
                    setErrorMessage("")
                    setPetitions(response.data.petitions)
                }, (error) => {
                    setErrorFlag(true)
                    setErrorMessage(error.response.statusText);
                })
            }

            const checkMinimumCostState = (event:ChangeEvent<HTMLInputElement>) => {
                setMaximumCost(!isNaN(Number(event.target.value)) ? event.target.value : "");
            }
            const searchPetitionState = (event:ChangeEvent<HTMLInputElement>) => {
                setQuery(event.target.value)
            }
            const handleSearchClick = () => {
                if (query.trim().length === 0) {
                    setAlertVisible(true)
                    showAlert("Please enter some vaild words to search.", "warning");
                    return;
                }
                getPetitions()

            }
            const handleKeyPressEnter = (event: any) => {
                if (event.key === 'Enter') {
                    handleSearchClick();
                }
            };


    const showAlert = (message: React.SetStateAction<string>, severity: React.SetStateAction<string>) => {
        setAlertMessage(message);
        setAlertVisible(true);
        setTimeout(() => {
            setAlertVisible(false);
        }, 2000);
    };

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

                { field: 'creationDate', headerName: 'Creation Date',headerAlign: 'center', width: 180, align: 'center', filterable:false,
                    renderCell: (params: GridCellParams) => {
                        const creationDate = formatDate(params.row.creationDate)
                        return <span>{creationDate}</span>;
                    }
                },
                { field: 'supportingCost', headerName: 'Supporting Cost',headerAlign: 'center', width: 130, align: 'center', filterable:false,},
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
                            {alertVisible && (
                                <Alert severity="warning" icon={<CheckIcon fontSize="inherit" />}>
                                    {alertMessage}
                                </Alert>
                            )}
                            <h1 style={{fontSize: '40px'}}>Petitions</h1>
                            <Container style={{
                                position: 'relative',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 100,
                                marginLeft:200,

                            }}>
                                <Box style={{display: 'flex', alignItems: 'center', width: 1400}}>
                                    <TextField style={{height: 55, width: '80%'}}
                                               id="outlined-basic" label="Search Petition" variant="outlined"
                                               value={query} onChange={searchPetitionState} onKeyPress={handleKeyPressEnter}/>
                                    <Button className="button-main-colour" style={{height: 55, width: '20%', fontSize: '1.5rem', backgroundColor:'#4a916e' }}variant="contained"
                                            onClick={handleSearchClick}>Search</Button>

                                </Box>
                                <Box style={{display: 'flex', alignItems: 'center', width: 1400}}>
                                        <FormControl sx={{m: 1, width: '80%'}}>
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
                                                       value={maximumCost} onChange={checkMinimumCostState}
                                                       onKeyPress={handleKeyPressEnter}/>
                                        </FormControl>

                                </Box>
                                <Div style={{color:'#4a916e'}}>You can sort by clicking the name of Title, Creation date or Supporting cost.</Div>
                                <Box style={{ height: 715, width: 1400}}>
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

                                </Box>
                            </Container>
                        </div>


                    )
                }

}


export default Petitions;