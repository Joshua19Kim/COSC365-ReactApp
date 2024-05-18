type Petition = {
    petitionId: number,
    title: string,
    categoryId: number,
    creationDate: string,
    ownerId: number,
    ownerFirstName: string,
    ownerLastName: string,
    numberOfSupporters: number,
}

type PetitionWithCategory = Petition & {
    categoryName: string,
}

type Category = {
    categoryId: number,
    name: string,

}