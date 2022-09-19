
export const getPartnerInfo = (partnerInfo,email) =>{
    return partnerInfo.find(info=>info?.email !==email)
}


