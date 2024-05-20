type Petition = {
    petitionId: number,
    title: string,
    categoryId: number,
    creationDate: string,
    ownerId: number,
    ownerFirstName: string,
    ownerLastName: string,
    numberOfSupporters: number,
    supportingCost: number,
}
type SupportTierPost = {
    title: string,
    description: string
    cost: number
}

type SupportTier = {
    supportTierId: number,
} & SupportTierPost

type PetitionFull = {
    description: string,
    moneyRaised: number,
    supportTiers: SupportTier[]
} & Petition

type PetitionWithCategory = Petition & {
    categoryName: string,
}

type Category = {
    categoryId: number,
    name: string,

}

type PostSupport = {
    supportTierId: number,
    message: string
}

type Supporter = {
    supportId: number,
    supporterId: number,
    supporterFirstName: string,
    supporterLastName: string,
    timestamp: string
} & PostSupport