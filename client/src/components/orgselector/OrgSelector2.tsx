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
import { saveToLocalStorageWithExpiry } from '@/tools/helper'

 let preOrgs = [
    {
        "name":"TTEC",
        "orgId":"268a1671-cd4a-4f36-9442-5d2e1a023f01",
        "client_id":"d2d35298-783d-4787-ab97-f9765f9b69ed",
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