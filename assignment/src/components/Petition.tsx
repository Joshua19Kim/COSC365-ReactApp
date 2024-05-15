import React, {ChangeEvent} from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {Link} from 'react-router-dom';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";



const Petition = () => {

    const {id} = useParams();
    const navigate = useNavigate();
    const [petition, setPetition]
        = React.useState<Petition>({
        petitionId: 0,
        title: "",
        categoryId: 0,
        creationDate: "",
        ownerId: 0,
        ownerFirstName: "",
        ownerLastName: "",
        numberOfSupporters: 0})
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
    const [openEditDialog, setOpenEditDialog] = React.useState(false)
    const [titleEdit, setTitleEdit] = React.useState('');

    const handleDeleteDialogOpen = () => {
        setOpenDeleteDialog(true); };
    const handleDeleteDialogClose = () => {
        setOpenDeleteDialog(false);
    };
    const handelEditDialogOpen = () => {
        setOpenEditDialog(true);
    }
    const handelEditDialogClose = () => {
        setOpenEditDialog(false);
    }
    const updateUsernameEditState = (event:ChangeEvent<HTMLInputElement>) => {
        setTitleEdit(event.target.value)
    }

    React.useEffect(() => {
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
        getPetition()
    }, [id])
    const deletePetition = (petition: Petition) => {
        axios.delete('http://localhost:4941/api/v1/petitions/' + petition.petitionId)
            .then((response) => {
                navigate('/petitions')
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
    }

    const editPetition = (user: Petition) => {
        axios.put(`http://localhost:4941/api/v1/petitions/${petition.petitionId}`,  { "title": titleEdit})
            .then((response) => {
                navigate('/petitions')
            }, (error) => {
                setErrorFlag(true)
                setErrorMessage(error.toString())
            })
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
                <h1>User</h1>
                {petition.petitionId}: {petition.title}
                <Link to={"/users"}>Back to users</Link>

                <Button variant="outlined" endIcon={<EditIcon/>} onClick={() => {
                    handelEditDialogOpen()
                }}>
                    Edit
                </Button>
                <Dialog
                    open={openEditDialog}
                    onClose={handelEditDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">
                        {"Edit User?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Do you wanna edit user detail?
                        </DialogContentText>
                    </DialogContent>
                    <TextField id="outlined-basic" label="Username" variant="outlined" value={titleEdit}
                               onChange={updateUsernameEditState}/>
                    <DialogActions>
                        <Button onClick={handelEditDialogClose}>Cancel</Button>
                        <Button variant="outlined" color="error" onClick={() => {
                            editPetition(petition)
                        }} autoFocus>
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                <Button variant="outlined" endIcon={<DeleteIcon/>} onClick={() => {
                    handleDeleteDialogOpen()
                }}>
                    Delete
                </Button>
                <Dialog
                    open={openDeleteDialog}
                    onClose={handleDeleteDialogClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description">
                    <DialogTitle id="alert-dialog-title">
                        {"Delete User?"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Are you sure you want to delete this user?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteDialogClose}>Cancel</Button>
                        <Button variant="outlined" color="error" onClick={() => {
                            deletePetition(petition)
                        }} autoFocus>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>
        )
    }

}


export default Petition;