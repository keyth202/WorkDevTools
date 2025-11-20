import React, {useState, useEffect} from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { genesysState,orgState } from '@/app/recoil/recoilState';
import { useRecoilState } from 'recoil';
import {
    authenticate,
    getMyUser,
    genesysInit,
  } from "../app/services/genesysCloudUtils";
import {  useLazyGetOrgsQuery } from '@/app/redux/apiSlice';
import OrgSelector2 from '@/components/orgselector/OrgSelector2';
import { loadFromLocalStorageWithExpiry } from '@/helpers/helper';
import Faceplate from '@/components/faceplate/Faceplate';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import logo from '@/assets/gryyndlogo2.png';
import emergency from '@/assets/EmergencyCallNotification.png';


const BaseLogin = () => {
    const [genesys, setGenesys] = useRecoilState(genesysState);
        const [orgs, setOrgs] = useRecoilState(orgState);
        const [initialized, setInitialized] = useState<boolean>(false);
        const [orgNames,setOrgNames] = useState<string[]>([]);
        const [orglistFound, setOrgListFound] = useState<boolean>(false);
        const [orgFound, setOrgFound] = useState<boolean>(false);
        const [name, setName] = useState<string>("");
        const [loggedIn,setLoggedIn] = useState<boolean>(false);
        const [token, setToken] = useState<string>("");
        const loadedClientId = loadFromLocalStorageWithExpiry("x-client-id");
        const loadedRegion = loadFromLocalStorageWithExpiry("x-org-region");
        const loadedOrgId = loadFromLocalStorageWithExpiry("x-org-id");
        
        const [getOrgsTrigger, { data:orgsData, isError:orgsIsError, error:orgsError }] = useLazyGetOrgsQuery();
    
        useEffect(() => {
            //getPlatformClientData();
            if(!orgFound && orgNames.length === 0 &&!initialized){
              console.log("Running Get Orgs");
               getOrgsTrigger(true);
            }
            
        }, []);
        
    
        useEffect(() => {
            if(orgsData && !orgFound){
                console.log("Org Found", orgsData);
                //console.log("Orgs is array", Array.isArray(orgsData));
                setOrgFound(true);
                updateOrgs(Array.isArray(orgsData)? orgsData: []);

            }else if(orgsIsError){
                console.log("Org Error", orgsError);
            }
        }, [orgsData]);
        useEffect(() => {
            if(loadedClientId && loadedRegion){
              console.log("Loaded Org", loadedRegion, loadedOrgId);
              initializeGenesys(loadedClientId, loadedRegion);
              setOrgs((prev) => ({
                ...prev,
                orgId: loadedOrgId,
              }));
            }else if(orgs.orgSelected && !initialized && orgs.client_id){
              console.log("Org Selected", orgs.orgSelected);
              initializeGenesys(orgs.client_id, orgs.orgName);
            }
        }, [orgs.client_id]);
        
        const updateOrgs = (org:any[]) => {
          //console.log("Updating Orgs with", org);
          if(org.length > 0){
            setOrgs((prev) => ({
              ...prev,
              orgList: [...org],
            }));
          }
        }
    
        async function initializeGenesys(id:string, region:string){
          await genesysInit(id, region)
            .then((data: any) => {
              setToken(data.accessToken);
              setLoggedIn(true);
              return getMyUser(); 
            })
            .then((userDetailsResponse: any) => {
              //console.log('userDetailsResponse', userDetailsResponse);       
              const name = userDetailsResponse.name || "";        
              setName(name);
              setInitialized(true);
              setGenesys((prev) => ({
                ...prev,
                name: name,
                email: userDetailsResponse.email,
                userId: userDetailsResponse.id,
                isAuthenticated: true,
                isAdmin: userDetailsResponse.isAdmin,
                isSupervisor: userDetailsResponse.isSupervisor,
                isListenOnly: userDetailsResponse.isListenOnly,
                organization: userDetailsResponse.organization,
              })); 
              
              return {orgId:userDetailsResponse.organization, userId:userDetailsResponse.id};
            })
            .catch((err: any) => {
              console.error(err); 
            });
        }
  return (
        <div className={`${!initialized ? "bg-slate-800" : "bg-slate-300"} flex items-center justify-center h-screen `} >
            {/*<img src={emergency} alt="logo" className="fixed top-0 left-0 z-0 w-54" /> */}
            <div className={`${!initialized ? "bg-slate-800" : "bg-slate-100"} flex items-center justify-center h-screen `} ></div>
            {!initialized ? (<div className="h-screen flex items-center justify-center">
              <div className={`mx-auto my-auto container shadow-lg rounded-lg h-[500px] w-[500px] z-20`}>
                <OrgSelector2 />
              </div>
            </div> ) : <Outlet />} 
            <img src={logo} alt="logo" className="fixed bottom-0 right-0 z-0 w-52" /> 
      </div>
  )
}

export default BaseLogin