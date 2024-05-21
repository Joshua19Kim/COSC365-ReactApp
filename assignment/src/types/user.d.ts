type userRegister = {
    firstName: string,
    lastName: string,
    email: string,
    password: string
}

type userLogin = {
    email: string,
    password: string
}

type user = {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    imageFilename: string,
    authToken: string
}
