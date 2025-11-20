import React, {useEffect, useState} from 'react'
import { useRecoilState } from 'recoil'
import { genesysState, orgState } from '@/app/recoil/recoilState'
import { useFindOrgMutation } from '@/app/redux/apiSlice'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { saveToLocalStorageWithExpiry } from '@/helpers/helper'

 let preOrgs = [
    {
        "name":"Home Base",
        "orgId":import.meta.env.VITE_BASE_OID,
        "client_id":import.meta.env.VITE_BASE_CID,
        "region":"us-east-1"
    }
     
  ]

// Make the user type in their org short name and then fetch the orgId from the API Talk to steve on this 
const OrgSelector2 = () => {
    const [genesys, setGenesys] = useRecoilState(genesysState)
    const [orgs, setOrgs] = useRecoilState(orgState)
  
    const handleSelect = (value: any) => {
        setOrgs((prev) => ({
            ...prev,
            orgId: value.orgId,
            orgName: value.name,
            orgSelected: true,
            client_id: preOrgs[0]?.client_id,
        }))
        saveToLocalStorageWithExpiry("x-org-region", value.name, 3600);
        saveToLocalStorageWithExpiry("x-org-id", value.orgId, 3600);
        //findOrg({orgId: value.orgId});
    }
    
  return (
     <Select onValueChange={handleSelect}>
      <SelectTrigger className="w-[280px]" >
        <SelectValue placeholder="Please Select Your Organization" />
      </SelectTrigger>
      <SelectContent>
      {Array.isArray(preOrgs) && preOrgs.map((org, index) => (
              <SelectItem key={index} value={org}>{org.name}</SelectItem>
            ))}
      </SelectContent>
    </Select>
  )
}

export default OrgSelector2