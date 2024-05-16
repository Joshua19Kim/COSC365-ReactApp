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

type SupportTierPost = {
    title: string,
    description: string,
    cost: number
}

type PetitionWithCost = Petition & {
    description: string,
    cost: number
}