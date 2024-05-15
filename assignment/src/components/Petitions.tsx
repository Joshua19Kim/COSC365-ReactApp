import axios from 'axios';
import React from "react";
import {Link} from 'react-router-dom';
import Petition from './Petition';



const Petitions = () => {
    const [petitions, setPetitions] = React.useState<Array<Petition>>([])
    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")
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
    const list_of_petitions = () => {
        return petitions.map((petition: Petition) =>
            <tr key={petition.petitionId}>
                <th scope="row">{petition.petitionId}</th>
                <td>{petition.title}</td>
                {/*<td><Link to={"/users/" + petition.petitionId}>Go to*/}
                {/*    petition</Link></td>*/}
                <td>
                    <button type="button">Delete</button>
                    <button type="button">Edit</button>
                </td>
            </tr>
        )
    }

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
                    <table className="table">
                        <thead>
                        <tr>
                            <th scope="col">id</th>
                            <th scope="col">title</th>
                            <th scope="col">description</th>
                            <th scope="col">actions</th>
                        </tr>
                        </thead>
                        <tbody> {list_of_petitions()}
                        </tbody>
                    </table>
                </div>
            )
        }

}


export default Petitions;