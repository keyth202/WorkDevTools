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

// Make the user type in their org short name and then fetch the orgId from the API Talk to steve on this 
const OrgSelector = () => {
    const [genesys, setGenesys] = useRecoilState(genesysState)
    const [orgs, setOrgs] = useRecoilState(orgState)
    const [findOrg, { data:findData, isError:findIsError, error:findError }] = useFindOrgMutation();
    
    useEffect(() => {
          if(findData){
            console.log("Org Found", findData);
            saveToLocalStorageWithExpiry("x-client-id", findData?.client_id, 3600);
            setOrgs((prev) => ({
                ...prev,
                client_id: findData?.client_id,
            }))
          } else if(findIsError){
            console.log("Org Error", findError);
          }
    }, [findData]);
    const handleSelect = (value: any) => {
        setOrgs((prev) => ({
            ...prev,
            orgId: value.orgId,
            orgName: value.name,
            orgSelected: true,
        }))
        saveToLocalStorageWithExpiry("x-org-region", value.name, 3600);
        saveToLocalStorageWithExpiry("x-org-id", value.orgId, 3600);
        findOrg({orgId: value.orgId});
    }
    
  return (
     <Select onValueChange={handleSelect}>
      <SelectTrigger className="w-[280px]" >
        <SelectValue placeholder="Please Select Your Organization" />
      </SelectTrigger>
      <SelectContent>
      {Array.isArray(orgs.orgList) && orgs.orgList.map((org, index) => (
              <SelectItem key={index} value={org}>{org.name}</SelectItem>
            ))}
      </SelectContent>
    </Select>
  )
}

export default OrgSelector