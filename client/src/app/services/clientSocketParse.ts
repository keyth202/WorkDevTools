var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;


export const handleConversationSocketNotification = (userId: string,message:any) => {
    try{
        let callInfo = processConversationsNotification3(userId,message.eventBody);
        return callInfo;
    }catch(err:any){
        console.error(err.message);
        return;
    }
}

//utilities to remove duplications and array values
function removeDups(data:any[]){
    let arr = data.filter((value:any,index:number)=> data.indexOf(value)=== index);
    return arr;
}
function removeArrVal(data:any[], val:string){
    let arr = data.filter(x => x !== val);
    return arr;
}

export function separateTopicName(event:any) {
    try{
        const topicParts = event.topicName.split('.');
        const userId = topicParts[2];
        const topic = topicParts[3];
        //console.log(`Topic: ${userId} ${topic }`);
        return { userId, topic };
    }catch(err:any){
        console.error(err.message);
        return {"userId":"", "topic":""};
    }  
}
// Allows all calls to be monitored
const processConversationsNotification2 = (userId:string,event:any)=>{ 
    //let event = JSON.parse(message.data); 

    let data ={
        "userId":userId,
        "origCallId":"",
        "joinedCallId":"",
        "userPartId":"",
        "joinedPartId":"",
        "agentPartId":"",
        "extPartId":"",
        "status": "ONLINE",
        "time":"",
        "join":false,
        "listen":false,
        "coach":false,
        "callerName":"",
        "callerNumber":"",
        "monitoredPartId":""
    }
    //console.log(` Userid: ${userId.slice(0,6)} }`);
    console.log(`Pre-Event Conv Notification 388 : ${JSON.stringify(event, null, 2)}`);
    try{
        if(event.participants) {
           
            const participants = event.participants
            let agent = participants.filter((participant:any)=> participant.purpose === "agent");
            let customer = participants.filter((participant:any)=> participant.purpose=== "customer");
            let user = participants.filter((participant:any)=> participant.purpose=== "user");
            let external = participants.filter((participant:any)=> participant.purpose=== "external");          
            let connectedAgent = agent.filter((participant:any)=> participant.state ==="connected");
            let connectedUser = user.filter((participant:any)=> participant.state ==="connected");
            let connectedCustomer = customer.filter((participant:any)=> participant.state ==="connected");
            let connectedExternal = external.filter((participant:any)=> participant.state ==="connected");
            let disconnectedAgent = agent.filter((participant:any)=> participant.state ==="disconnected")||[];
            let disconnectedUser = user.filter((participant:any)=> participant.state ==="disconnected")||[];
            let terminatedAgent = agent.filter((participant:any)=> participant.state ==="terminated")||[];
            let terminatedUser = user.filter((participant:any)=> participant.state ==="terminated")||[];
            
            let terminatedConf = terminatedUser.some((participant:any)=> participant.user.id ===userId);
            let disconnectedConf = terminatedAgent.some((participant:any)=> participant.user.id ===userId);

            let monitored = participants.filter((participant:any)=> participant.monitoredParticipantId );
            let coached = participants.filter((participant:any)=> participant.coachedParticipantId);
            let barged = participants.filter((participant:any)=> participant.bargedParticipantId );

            let monitoredDisc = participants.filter((participant:any)=> participant.monitoredParticipantId && participant.endTime);
            let coachedDisc = participants.filter((participant:any)=> participant.coachedParticipantId && participant.endTime);
            let bargedDisc = participants.filter((participant:any)=> participant.bargedParticipantId && participant.endTime);
            let xMon = monitoredDisc.some((participant:any)=> participant.user.id === userId);
            let xCoa = coachedDisc.some((participant:any)=> participant.user.id === userId);
            let xBar = bargedDisc.some((participant:any)=> participant.user.id === userId);

            if(participants[0].state === "disconnected" || participants[0].state === "terminated"){
                //console.log(`****Original disconnection`);
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status =  "Wrap Up";
                return {...data};
            }if(terminatedConf || disconnectedConf){
                //console.log(`**** Terminated Conf`);
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status =  "Wrap Up";
                return {...data};
            }else if(participants.length < 2){
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status = "ON_CALL";
                return {...data};
            }else if (participants.length>2 && (xMon || xCoa || xBar)){
                //console.log(`****xMon xCoa xBar`);
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status = "Wrap Up";
                return {...data};

            }else if(participants.length > 2 && (connectedAgent.length >= 1 || connectedUser.length >= 1) && (monitoredDisc.length>0 || coachedDisc.length>0 || bargedDisc.length>0)){
                //console.log(`****488`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = true;
                data.listen = true;
                data.coach = true;
                data.time= dateTime;                               
                data.status = "ON_CALL";
                return {...data};
    
            }else if(participants.length > 2 && (connectedAgent.length > 2 || connectedUser.length > 2)){
                //console.log(`****503 Conference`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = true;
                data.listen = true;
                data.coach = true;
                data.time= dateTime;                               
                data.status = "ON_CONFERENCE";
                return {...data};
            }else if( (monitoredDisc.length>0 || coachedDisc.length>0 || bargedDisc.length>0)){
                //console.log(`****580`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;      
                data.status =  "Wrap Up";
                return {...data};
            }else if((monitored.length>0 || coached.length>0 || barged.length>0)){
                //console.log(`****517`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = true;
                data.listen = true;
                data.coach = true;
                data.time= dateTime;      
                data.status =  "ON_CONFERENCE";
                return {...data};
            }else{
                //console.log(`****594`);
                //console.log(JSON.stringify(event, null, 2));
                    data.origCallId = event.id;
                    data.joinedCallId = connectedAgent[0]?.id;
                    data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                    data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                    data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                    data.join = true;
                    data.listen = true;
                    data.coach = true;
                    data.time= dateTime;
                    data.status = "ON_CALL";
                    return {...data}; 
                }
            }
   
             
          
    }catch(err:any){
        console.log(`Event returning undefined 446 Notification: ${JSON.stringify(event, null, 2)}`);
        console.error(err.message, err.stack);
        return {...data};
    }
}
//Only allows acd calls to be monitored
const processConversationsNotification3 = (userId:string,event:any)=>{ 
    //let event = JSON.parse(message.data); 

    let data ={
        "userId":userId,
        "origCallId":"",
        "joinedCallId":"",
        "userPartId":"",
        "joinedPartId":"",
        "agentPartId":"",
        "extPartId":"",
        "status": "ONLINE",
        "time":"",
        "join":false,
        "listen":false,
        "coach":false,
        "callerName":"",
        "callerNumber":"",
        "monitoredPartId":""
    }
    //console.log(` Userid: ${userId.slice(0,6)} }`);
    //console.log(`Pre-Event Conv Notification 388 : ${JSON.stringify(event, null, 2)}`);
    try{
        if(event.participants) {
           
            const participants = event.participants
            let agent = participants.filter((participant:any)=> participant.purpose === "agent");
            let customer = participants.filter((participant:any)=> participant.purpose=== "customer");
            let user = participants.filter((participant:any)=> participant.purpose=== "user");
            let external = participants.filter((participant:any)=> participant.purpose=== "external");          
            let connectedAgent = agent.filter((participant:any)=> participant.state ==="connected");
            let connectedUser = user.filter((participant:any)=> participant.state ==="connected");
            let connectedCustomer = customer.filter((participant:any)=> participant.state ==="connected");
            let connectedExternal = external.filter((participant:any)=> participant.state ==="connected");
            let disconnectedAgent = agent.filter((participant:any)=> participant.state ==="disconnected")||[];
            let disconnectedUser = user.filter((participant:any)=> participant.state ==="disconnected")||[];
            let terminatedAgent = agent.filter((participant:any)=> participant.state ==="terminated")||[];
            let terminatedUser = user.filter((participant:any)=> participant.state ==="terminated")||[];
            
            let cAgent = connectedAgent.some((participant:any)=> participant.user.id === userId);
            let cUser = connectedUser.some((participant:any)=> participant.user.id === userId);

            let tAgent = terminatedUser.some((participant:any)=> participant.user.id ===userId);
            let tUser = terminatedAgent.some((participant:any)=> participant.user.id ===userId);
            let dUser = disconnectedUser.some((participant:any)=> participant.user.id ===userId);
            let dAgent = disconnectedAgent.some((participant:any)=> participant.user.id ===userId);

            let dialingAgent = agent.some((participant:any)=> participant.state ==="dialing" && participant.user.id === userId);
            let dialingUser = user.some((participant:any)=> participant.state ==="dialing" && participant.user.id === userId);

            let monitored = participants.filter((participant:any)=> participant.monitoredParticipantId );
            let coached = participants.filter((participant:any)=> participant.coachedParticipantId);
            let barged = participants.filter((participant:any)=> participant.bargedParticipantId );

            let monitoredDisc = participants.filter((participant:any)=> participant.monitoredParticipantId && participant.endTime);
            let coachedDisc = participants.filter((participant:any)=> participant.coachedParticipantId && participant.endTime);
            let bargedDisc = participants.filter((participant:any)=> participant.bargedParticipantId && participant.endTime);
            let xMon = monitoredDisc.some((participant:any)=> participant.user.id === userId);
            let xCoa = coachedDisc.some((participant:any)=> participant.user.id === userId);
            let xBar = bargedDisc.some((participant:any)=> participant.user.id === userId);

            if(participants[0].state === "disconnected" || participants[0].state === "terminated"){
                //console.log(`****Original disconnection`);
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status =  "Wrap Up";
                return {...data};
            }if(tAgent || tUser || dAgent || dUser){
                //console.log(`**** Terminated Conf`);
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status =  "Wrap Up";
                return {...data};
            /*}else if(participants.length < 2){
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status = "ON_CALL";
                return {...data};*/
            }else if(dialingAgent){
                //console.log(`****Dialing Agent`);
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status = "Dialing";
                return {...data};
            }else if(dialingUser){
                //console.log(`****Dialing User`);
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status = "Dialing";
                return {...data};
            }else if(cAgent && connectedCustomer.length > 0){
                //console.log(`****Connected Agent and Customer`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = true;
                data.listen = true;
                data.coach = true;
                data.time= dateTime;                               
                data.status = "ON_ACD_CALL";
                return {...data};
            
            
            }else if (participants.length>2 && (xMon || xCoa || xBar)){
                //console.log(`****xMon xCoa xBar`);
                data.origCallId = "";
                data.joinedCallId = "";
                data.userPartId = "";
                data.joinedPartId = "";
                data.extPartId = "";
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status = "Wrap Up";
                return {...data};

            }else if(participants.length > 2 && (connectedUser.length >= 1) && (monitoredDisc.length>0 || coachedDisc.length>0 || bargedDisc.length>0)){
                //console.log(`****Connected User and monDisc, etc`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;                               
                data.status = "ON_CALL";
                return {...data};
    
            }else if(participants.length > 2 && (connectedAgent.length > 2 || connectedUser.length > 2)){
                //console.log(`****503 Conference`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = true;
                data.listen = true;
                data.coach = true;
                data.time= dateTime;                               
                data.status = "ON_CONFERENCE";
                return {...data};
            }else if( (monitoredDisc.length>0 || coachedDisc.length>0 || bargedDisc.length>0)){
                //console.log(`****580`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;      
                data.status =  "Wrap Up";
                return {...data};
            }else if((monitored.length>0 || coached.length>0 || barged.length>0)){
                //console.log(`****517`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.monitoredPartId = monitored[0]?.id;
                data.join = true;
                data.listen = true;
                data.coach = true;
                data.time= dateTime;      
                data.status =  "ON_CONFERENCE";
                return {...data};
            }else{
                //console.log(`****749`);
                //console.log(JSON.stringify(event, null, 2));
                console.log(`No match Notification 751 : ${JSON.stringify(event, null, 2)}`);
                data.origCallId = event.id;
                data.joinedCallId = connectedAgent[0]?.id;
                data.userPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.joinedPartId = connectedAgent[0]?.id || connectedUser[0]?.id;
                data.extPartId = connectedCustomer[0]?.id || connectedExternal[0]?.id;
                data.join = false;
                data.listen = false;
                data.coach = false;
                data.time= dateTime;
                data.status = "ON_CALL";
                return {...data}; 
                    
                }
            }
   
             
          
    }catch(err:any){
        console.log(`Event returning undefined 446 Notification: ${JSON.stringify(event, null, 2)}`);
        console.error(err.message, err.stack);
        return {...data};
    }
}
