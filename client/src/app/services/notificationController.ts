import { notificationsApi } from "./genesysCloudUtils";


let channel ={}; 
let conversationsTopic="";
//let ws = null; 

const topic ={
    convTopic:"",
    /**
     * @param {string} newTopic
     */
    set setTopic(newTopic:string){
        this.convTopic = newTopic;
    },
    get getTopic(){
        return this.convTopic;
    }
}

export async function createChannel(){
        let socket;
        await notificationsApi.postNotificationsChannels()
            .then((data:any)=>{
                //console.log(`postNotificationsChannels success! data: ${JSON.stringify(data, null, 2)}`);
                console.log(`postNotificationsChannels success!`);
                channel = data;
                //ws = new WebSocket(channel.connectUri);
                socket = {uri: channel.connectUri, id: channel.id};
                //ws.onmessage = handleNotification;
                

            }).catch((err:any) => {
                console.log('There was a failure calling postNotificationsChannels');
                console.error(err);
            });
        return socket;
    }

export async function addSubscription(userId: string, channelId:string){
        let conversationsTopic = 'v2.users.' + userId+ '.conversations.calls';
        const body = [ { id: conversationsTopic } ];
        topic.setTopic=conversationsTopic;
        return notificationsApi.postNotificationsChannelSubscriptions(channelId, body)
            .then((data)=>{
                console.log(`Added Subscription to ${conversationsTopic}`);
                return data
            })
}

export function extractIdFromTopic(topicName: string) {
    const match = topicName.match(/\.users\.([^.]*)\.conversations\.calls/);
    return match ? match[1] : null;
    /*
    const dotIndex = topicName.lastIndexOf('.');
    const hyphenIndex = topicName.lastIndexOf('-');
    
    if (dotIndex !== -1 && hyphenIndex !== -1 && hyphenIndex > dotIndex) {
        const idSubstring = topicName.substring(dotIndex + 1, hyphenIndex);
        return idSubstring;
    } else {
        // Handle the case where the pattern is not found
        return null;
    }
        */
}

export async function addMultipleSubscriptions(userIds:any[], channelId:string){
    let body:any = [];
    userIds.forEach((id)=>{
        let conversationsTopic = 'v2.users.' + id+ '.conversations.calls';
        let presenseTopic = 'v2.users.' + id+ '.presence';
        body.push({ id: conversationsTopic }, {id: presenseTopic}) ;
    });
    //console.log(`Subscription body  ${JSON.stringify(body, null, 2)}`);
    return notificationsApi.postNotificationsChannelSubscriptions(channelId, body)
        .then((data)=>{
            console.log(`Subscriptions added successfully`);
            return data;
        }).catch((err)=>{
            console.log(err.message);
        });
}
export async function resetSubscriptions(topics: string[], channelId:string){
   await removeAllSubscriptions(channelId);
   if(topics.length >0){
     let body = topics.map((topic)=>{
       return {id: topic};
    });
   return notificationsApi.postNotificationsChannelSubscriptions(channelId, body)
        .then((data)=>{
            console.log(`Subscriptions reset successfully`);
            return data;
        }).catch((err)=>{
            console.log(err.message);
        });
   }
   return ({message: "No topics to subscribe to"});
}
export async function removeAllSubscriptions( channelId:string){
    return notificationsApi.deleteNotificationsChannelSubscriptions(channelId)
        .then((data)=>{
            console.log(`Removed all Subscriptions`);
            return data
        })
}
export async function replaceSubscriptions(topics: string[], channelId:string){
    let opts = { 
        "ignoreErrors": true
      };
    const body = topics.map((topic)=>{
        return {id: topic, "state": "Rejected",};
    });
    return notificationsApi.putNotificationsChannelSubscriptions(channelId, body, opts)
        .then((data)=>{
            console.log(`Replaced Subscriptions`);
            return data;
        })
        .catch((err)=>{ 
            console.log(`Error replacing subs: ${err.message}`);
        });

}

export async function startNotifications(){
   let socket = createChannel()
    .then((socket)=>{
        //console.log("socket: ",socket);
        //monitorMessaging(socket?.uri);
        return socket;           
    })
    .catch((err)=>{
        console.log(err.message);
    });
    return socket;
}

//utilities to remove duplications and array values
function removeDups(data:any){
let arr = data.filter((value,index)=> data.indexOf(value)=== index);
return arr;
}
function removeArrVal(data:any, val:any){
let arr = data.filter(x => x !== val);
return arr;
}

export type notificationData = {
    userId: string,
    origCallId: string,
    intPartId?: string,
    extPartId?: string,
    join?: boolean,
    listen?: boolean,
    coach?: boolean,
    state?: string,
    callerName?: string,
    callerNumber?: string,
    livecall?: boolean,
    topic?: string,
    username?: string,
    station?: string,
    location?: string,
    time?: string
}

export const processConversationsNotification = (userId:string,event:any)=>{ 
    //let event = JSON.parse(message.data); 
    //console.log("event is: ", typeof event);
    let data:notificationData ={
        "userId":userId,
        /*"username":null,
        "station":"",
        "location":"",*/
        "origCallId":event?.eventBody.id,
        "intPartId":"",
        "extPartId":"",
        //"time":"",
        "join":false,
        "listen":false,
        "coach":false,
        "state":"none",
        //"callerName":"",
        //"callerNumber":"",
        "livecall":false,
        "topic":'v2.users.' + userId+ '.conversations.calls'
    }
    //console.log(` Userid: ${userId.slice(0,6)} }`);
    //console.log(`Pre-Event Conv Notification 388 : ${JSON.stringify(event, null, 2)}`);
    try{
        if(event.eventBody?.participants) {
            const participants = event.eventBody.participants
            let agent = participants.filter((participant:any)=> participant.purpose === "agent");
            let customer = participants.filter((participant:any)=> participant.purpose=== "customer");
            let user = participants.filter((participant:any)=> participant.purpose=== "user");
            let external = participants.filter((participant:any)=> participant.purpose=== "external"); 
            
            let internalDialing = participants.filter((participant:any)=> ( participant.purpose=== "user") && participant.state == "dialing");
            let internalConnected = participants.filter((participant:any)=> (participant.purpose=== "agent" || participant.purpose=== "user") && participant.state == "connected");
            let externalConnected  = participants.filter((participant:any)=> (participant.purpose=== "external" || participant.purpose=== "customer") && participant.state == "connected");
            let internalDisc = participants.filter((participant:any)=> (participant.purpose=== "agent" || participant.purpose=== "user") && (participant.state == "disconnected" || participant.state == "terminated"));
            let externalDisc  = participants.filter((participant:any)=> (participant.purpose=== "external" || participant.purpose=== "customer") && (participant.state == "disconnected" || participant.state == "terminated"));
            
            //let isExtDisc = externalDisc.some((participant:any)=> participant.user.id === userId);
            let isInternalDisc = internalDisc.some((participant:any)=> participant.user.id === userId);
            let isInternalConn = internalConnected.some((participant:any)=> participant.user.id === userId);
            //console.log(`Internal Disconnect: ${isInternalDisc}`);
            //console.log(`Internal Dialing: ${internalDialing.length} Internal Connected: ${internalConnected.length} External Connected: ${externalConnected.length}`);
            if(internalDialing.length > 0 && !isInternalDisc){
                console.log(`Dialing:`, event);
                data.intPartId = internalDialing[0]?.id;
                data.extPartId = external[0]?.id;
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.state = "dialing";
                //data.callerName = external[0]?.name;
                //data.callerNumber = external[0]?.address;
                data.livecall = true;
                //data.time =  new Date().toISOString();
                return {...data};
            }else if(isInternalDisc && internalConnected.length < 1){
                //console.log(`Internal Disconnect: `, participants);
                //data.intPartId = "";
                //data.extPartId = "";
                data.state = "disconnected";
                data.join = false;
                data.listen = false;
                data.coach = false;
                //data.callerName = "";
                //data.callerNumber = "";
                data.livecall = false;
                return {...data};
            }else if(externalDisc.length > 0 && isInternalDisc){
                //console.log(`External Disconnect:`,participants);
                //data.intPartId = "";
                //data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                //data.callerName = "";
                //data.callerNumber = "";
                data.state = "disconnected";
                data.livecall = false;
                return {...data};
            }else if(internalConnected.length >= 1 && externalConnected.length >= 1){
                //console.log(`Connected:`, participants);
                data.intPartId = internalConnected[0]?.id;
                data.extPartId = externalConnected[0]?.id;
                data.join = true;
                data.listen = true;
                data.coach = true;
                //data.callerName = externalConnected[0]?.name;
                //data.callerNumber = externalConnected[0]?.address;
                data.livecall = true;
                data.state = "connected";
                return {...data};
            } else if (isInternalConn){
                data.intPartId = internalConnected[0]?.id;
                data.extPartId = externalConnected[0]?.id;
                data.join = true;
                data.listen = true;
                data.coach = true;
                //data.callerName = externalConnected[0]?.name;
                //data.callerNumber = externalConnected[0]?.address;
                data.livecall = true;
                data.state = "connected";
                return {...data};
            }else{
                console.log(`Not accounted for:`, participants);
                return null
                //return {...data};
            }  
        }else{
            console.log(`Not sure:`, event);
            return null
            //return {...data};
        }
          
    }catch(err:any){
        console.log(`Event returning undefined 446 Notification: ${JSON.stringify(event, null, 2)}`);
        console.error(err.message, err.stack);
        return {...data};
    }
}




