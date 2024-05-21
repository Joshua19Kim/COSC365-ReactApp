import React from "react";







const Login = () => {

    const [errorFlag, setErrorFlag] = React.useState(false)
    const [errorMessage, setErrorMessage] = React.useState("")

    if (errorFlag) {
        return (
            <div>
                <h1>Login</h1>
                <div style={{color: "red"}}>
                    {errorMessage}
                </div>
            </div>
        )}
    else
    {
        return (
            <div>


            </div>


        )
    }

}



export default Login;