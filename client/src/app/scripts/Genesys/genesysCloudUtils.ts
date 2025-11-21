//const clientId = import.meta.env.VITE_CLIENT_ID;
//const clientId = import.meta.env.VITE_DEV_CLIENT_ID;
const clientId = import.meta.env.VITE_RHEEM_CID
//const redirectUri = import.meta.env.VITE_REDIRECT_URI;
const supervisorRole = import.meta.env.VITE_SUPERVISOR_ROLE;
const traineeRole = import.meta.env.VITE_TRAINEE_ROLE;
const supervisorRoleID = import.meta.env.VITE_SUP_ROLE_ID;
//const supervisorRoleID = "ab1734ef-8fd2-422f-bb2e-05372fffeffa"
const traineeRoleID = import.meta.env.VITE_TRAINEE_ROLE_ID;
const redirectUri = window.location.origin;

//const platformClient = require('purecloud-platform-client-v2/dist/node/purecloud-platform-client-v2.js');
import platformClient from "purecloud-platform-client-v2";

const usersApi = new platformClient.UsersApi();
export const conversationsApi = new platformClient.ConversationsApi();
export const routingApi = new platformClient.RoutingApi();
const presenceApi = new platformClient.PresenceApi();
export const notificationsApi = new platformClient.NotificationsApi();
const authorizationApi = new platformClient.AuthorizationApi();
export const speechTextApi = new platformClient.SpeechTextAnalyticsApi();

//console.log("at line 7");
//Export for notifications
const apiClient = platformClient.ApiClient;
console.log("Created API Client");

const client = apiClient.instance;
//client.setEnvironment('usw2.pure.cloud');
//client.setEnvironment(platformClient.PureCloudRegionHosts.us_east_1);


console.log("Created Instance");

export async function genesysInit(importedClientId:string, region:string){

    const cid = importedClientId || clientId;
    switch(region){
        case "us-west-2":
            client.setEnvironment('usw2.pure.cloud');
            break;
        case "us-east-2":
            client.setEnvironment('use2.pure.cloud');
            break;
        default:
            client.setEnvironment(platformClient.PureCloudRegionHosts.us_east_1);
    }
    
    console.log("Running Authenticate");
    return client.loginImplicitGrant(cid, redirectUri, { state: 'state' })
          .then((data) => {
              //console.log(data);
              console.log("Authentication Success");
              client.setAccessToken(data.accessToken);
              return data;
          })
          .catch((err) => {
              console.error(err);
    });
  

}

export async function getUserObservations(userId:string[]){
    let predicates = userId.map((id)=>{return {dimension: "userId", operator: "matches", value: id}});
    let body = { 
            "filter": {
              "type": "or",
              "predicates":predicates
            },
            "metrics": [
              //"oActiveQueues"
              "oInteracting"
            ]
      };
    return usersApi.postAnalyticsUsersObservationsQuery(body)
        .then((data) => {
            console.log(`getUsersObservations success! data: ${JSON.stringify(data, null, 2)}`);
            return data;
        })
        .catch((err) => {
            console.log("There was a failure calling getUsersObservations");
            console.error(err);
    });
}
export async function getQueueObservations(queueId:string[]){
    let predicates = queueId.map((id)=>{return {
        dimension: "queueId", 
        operator: "matches", 
        value: id
    }});

    let body = { 
            "filter": {
              "type": "or",
              "predicates":predicates,
            },
            "metrics": [
              //"oActiveQueues"
              "oInteracting"
            ]
      };
      
    return routingApi.postAnalyticsQueuesObservationsQuery(body)
        .then((data) => {
            const results = data?.results.filter((data:any) => data.group.mediaType =="voice" && data.data[0]?.stats > 0) ;
            console.log(`getUsersObservations success! data: ${JSON.stringify(results, null, 2)}`);
            
            return data;
        })
        .catch((err) => {
            console.log("There was a failure calling getUsersObservations");
            console.error(err);
    });
}

// Get current user information and queues
interface IUser{
    id:string,
    name:string,
    roles: any[],
    listenOnly: boolean,
    supervisor:boolean,
    admin: boolean,
    organization: string
    email: string
}
export async function getMyUser(){
    let optsUser = { 
        "expand": ["authorization", "groups","organization"], // [String] | Which fields, if any, to expand.
      
    };
    let user:IUser ={
        id:"",
        name:"",
        roles:[],
        listenOnly: false,
        supervisor:false,
        admin: false,
        organization: "",
        email: ""
    };
    await usersApi.getUsersMe(optsUser)
        .then((userMe) => {
            //console.log('userMe: ', userMe);
            const appRoles = userMe.authorization?.roles?.filter((d)=> d.name == supervisorRole || d.name == traineeRole || d.name=='Master Admin') || []
            user ={
                id:userMe.id || "",
                name:userMe.name || "",
                roles: appRoles,
                listenOnly: appRoles.some((d)=> d.name ===traineeRole),
                supervisor: appRoles.some((d)=> d.name ===supervisorRole),
                admin: appRoles.some((d)=> d.name ==='Master Admin'),
                organization: userMe.organization?.id || "",
                email: userMe.email || ""
            } 
            //console.log(`getUsersMe success! data: ${JSON.stringify(userMe, null, 2)}`);              
            //return userMe.id;
        })       
        .catch((err)=>{
            console.log(err.message);
    });
    return user;
}

export async function getMyUserAndRoles(){
        let optsUser = { 
            "expand": ["authorization", "groups","organization"], // [String] | Which fields, if any, to expand.
          
        };
        let user:any ={
            id:"",
            name:"",
            queues:[],
            roles:[],
            listenOnly: false,
            supervisor:false,
            admin: false,
            listenOnlyUsers: [],
            listenCoaches: []
        };
        await usersApi.getUsersMe(optsUser)
            .then((userMe) => {
                console.log('userMe: ', userMe);
                const appRoles = userMe.authorization?.roles?.filter((d)=> d.name == supervisorRole || d.name == traineeRole || d.name=='Master Admin') || []
                user ={
                    id:userMe.id || "",
                    name:userMe.name || "",
                    queues:[],
                    roles: appRoles,
                    listenOnly: appRoles.some((d)=> d.name ===traineeRole),
                    supervisor: appRoles.some((d)=> d.name ===supervisorRole),
                    admin: appRoles.some((d)=> d.name ==='Master Admin'),
                    listenOnlyUsers:  [],
                    listenCoaches: []
                } 
                //console.log(`getUsersMe success! data: ${JSON.stringify(userMe, null, 2)}`);              
                //return userMe.id;
            })       
            .catch((err)=>{
                console.log(err.message);
        });
        
        await  getUserQueues(user.id).then((queues:any)=>{
            console.log(`Getting Queues for ${user.id}`);
            user.queues = queues;
        }).catch((err)=>{
            console.log(`Getting Queues failed ${err.message}`);
        });
        
        
        await getAllUserInRole(traineeRoleID).then((roles:any)=>{
            console.log(`Getting Listen Only Users`, roles.length);
            user.listenOnlyUsers = roles;
           
        }).catch((err)=>{
            console.log(`Getting Roles failed ${err.message}`);
        }) 

       
        await getAllUserInRole(supervisorRoleID).then((roles:any)=>{
            console.log(`Getting Supervisors`, roles.length);
            user.listenCoaches = roles;
            
        }).catch((err)=>{
            console.log(`Getting Roles failed ${err.message}`);
        }) 

       //console.log("Logged in User: ", JSON.stringify(user, null, 2));
       
        return user;
}

export async function getAllUserInRole(roleId:string){
    let opts = { 
        "pageSize": 100, 
        "pageNumber": 1 
      };
    return await authorizationApi.getAuthorizationRoleUsers(roleId, opts)
    .then((data:any) => {
        const results = data?.entities.map((data:any) => data.id) || [];
        console.log(`getAuthorizationRoleUsers success! data: ${results.length}`);
        return results;
     
    })
    .catch((err) => {
      console.log("There was a failure calling getAuthorizationRoleUsers");
      console.error(err);
    });
      
}
export async function getUserQueues(userId : string, pgNumber =1){
    let opts = { 
            "pageSize": 99, // Number | Page size
            "pageNumber": pgNumber, // Number | Page number
            "joined": true, // Boolean | Is joined to the queue
    };
    try {
        let results = await usersApi.getUserQueues(userId, opts);
        //console.log("GUQ Queues: ", results.entities);
        let queues = results.entities.map((x)=> {return{ "id":x.id, "name":x.name}}) || [];
        //console.log("Queues: ", queues);
        return queues;
    } catch (error) {
        console.log("Error getting Queues");
    }
    

}

export async function getQueueMembers(queueId:string){
    let opts = { 
        "pageNumber": 1, // Number | 
        "pageSize": 99, // Number | Max value is 100
        "sortOrder": "asc", // String | Note: results are sorted by name.
        "expand": ["presence"], // [String] | Which fields, if any, to expand.
        //"name": "name_example", // String | Filter by queue member name (contains-style search)
        //"profileSkills": ["profileSkills_example"], // [String] | Filter by profile skill (contains-style search)
        //"skills": ["skills_example"], // [String] | Filter by skill (contains-style search)
        //"languages": ["languages_example"], // [String] | Filter by language (contains-style search)
        //"routingStatus": ["routingStatus_example"], // [String] | Filter by routing status
        //"presence": ["presence_example"], // [String] | Filter by presence
        //"memberBy": "memberBy_example", // String | Filter by member type
        //"joined": true // Boolean | Filter by joined status
      };
    return routingApi.getRoutingQueueMembers(queueId, opts)
    .then((data:any) => {
        //console.log(`getRoutingQueueMembers success! data: ${JSON.stringify(data, null, 2)}`);
        const members = data.entities.map((data:any) => ({
                    id: data.id,
                    name: data.name,
                    status: data.user.presence?.presenceDefinition?.systemPresence || "Offline",
                    time: data.user.presence?.modifiedDate

        }));
        return {queueId: queueId, members: members};
    })
    .catch((err) => {
        console.log("There was a failure calling getRoutingQueueMembers");
        console.error(err);
    });
    
}
export async function getUserPresence(userId:string){
    return await presenceApi.getUserPresencesPurecloud(userId)
    .then((data) => {
        //console.log(`getUserPresence success! data: ${JSON.stringify(data, null, 2)}`);
        return data.presenceDefinition?.systemPresence;
    })
    .catch((err) => {
        console.log("There was a failure calling getUserPresence");
        console.error(err);
        return "ONLINE"
    });
}
//Browser authentication
export async function authenticate() {
  console.log("Running Authenticate");
    return client.loginImplicitGrant(clientId, redirectUri, { state: 'state' })
        .then((data) => {
            //console.log(data);
            console.log("Authentication Success");
            client.setAccessToken(data.accessToken);
            return data;
        })
        .catch((err) => {
            console.error(err);
        });
}
 
export async function getUserInfo(userId:string){
    let opts = { 
        "expand": ["station","location","geolocation"], 
        "state": "active" 
      };
    return usersApi.getUser(userId, opts)
    .then((data) => {
        //console.log(`getUser success! data: ${JSON.stringify(data, null, 2)}`);
        return data;
    })
    .catch((err) => {
        console.log("There was a failure calling getUser");
        console.error(err);
    });
}