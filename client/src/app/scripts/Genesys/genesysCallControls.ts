import { conversationsApi } from "../../services/genesysCloudUtils";



//create conversation
export async function placeOutboundCall(body:any){
    let callId ;
    conversationsApi.postConversationsCalls(body)
        .then((data) => {
            //console.log(`postConversationsCalls success! data: ${JSON.stringify(data, null, 2)}`);
            console.log(`postConversationsCalls success!`);
            callId = data.id;
        })
        .catch((err) => {
            console.log('There was a failure calling postConversationsCalls');
            console.error(err);
        });
    return callId;
}
type CardData ={
    callid: string,
    name:string,
    phoneNumber:string
}
// Get active call conversations for the logged in user
export async function getConversations(){
    let cardData:CardData ={
        callid: "",
        name:"",
        phoneNumber:""
    }
    await conversationsApi.getConversationsCalls()
        .then((data) => {
            //console.log(`getConversationsCalls success! data: ${JSON.stringify(data, null, 2)}`);
            if(data?.entities[0].id){
                console.log(`getConversationsCalls success ${data.entities[0].id}`);
            }else{
                console.log("*****No call Found****");
            }
            
            cardData={
                name: data.entities[0].participants[1].name,
                phoneNumber: data.entities[0].participants[1].address,
                callid: data.entities[0].id
            }
            return cardData;
        })
        .catch((err) => {
            console.log("There was a failure calling getConversationsCalls");
            console.warn(err.message);
        });
    
    return cardData;
}

// Get All Calls 
export async function getAllConversations(){
   
   let allData ={
        entLength:0,
        origId:"",
        origPart:"",
        callerCallId:[],
        allPartIds:[]
   };
    function removeDups(data:any){
                let arr = data.filter((value: any,index:number)=> data.indexOf(value)=== index);
             return arr;
    }
    await conversationsApi.getConversationsCalls()
        .then((data) => {
            console.log(`getConversationsCalls success! data: ${JSON.stringify(data, null, 2)}`);
            
            allData.entLength = data.entities.length;
       
            if(data.entities[0].id){
                allData.origId = data.entities[0].id;
                allData.origPart = data.entities[0].participants[1].id;
                //allData.callerCallId = data.entities?.participants?.id.map()
                for(let i = 0; i<data.entities.length; i++){                                     
                    allData.callerCallId.push(data.entities[i].id);   
                }                 
                for(let i = 0; i<data.entities.length; i++){
                    for(let p = 1; p< data.entities.length; p++){
                      allData.allPartIds.push(data.entities[i].participants[p].id);
                    }  
                }
            }else{
                console.log("*****No call Found****");
            }
            //console.log(`getConversationsCalls success! data: ${JSON.stringify(allData, null, 2)}`);
           
        })
        .catch((err) => {
            console.log("There was a failure calling getConversationsCalls");
            console.error(err);
        });
    console.log("Removing Dups");
    allData.callerCallId = removeDups(allData.callerCallId);
    allData.callerCallId.shift();
    allData.allPartIds = removeDups(allData.allPartIds);
    console.log("All Data: ", allData);
    return allData;
}

//Merge all calls into a conference
export async function mergeAllCalls(origId:string, participantId:string, newConvId:string){
    let  body ={
 
             "participants": [
               {
                 "id": participantId
               }
             ],
             "conversationIds": newConvId
     }
 
     return await conversationsApi.patchConversationsCall(origId, body)
         .then((data) => {
         //console.log(`patchConversationsCall success! data: ${JSON.stringify(data, null, 2)}`);
         console.log(`Merge calls success!`);
         })
         .catch((err) => {
         console.log('There was a failure calling patchConversationsCall');
         console.error(err);
         });
 }
 //Mute single Call
 export async function muteCaller(conversationId:string, participantId:string){
     let body ={
             "muted": true         
     }
     console.log("muteCaller ",conversationId," | ",participantId);
      return await conversationsApi.patchConversationsCallParticipant(conversationId, participantId, body)
          .then((data) => {
          console.log(`patchConversationsCall success! data: ${JSON.stringify(data, null, 2)}`);
          console.log(`Mute Call success!`);
          })
          .catch((err) => {
          console.log('There was a failure calling muting caller');
          console.error(err);
          });
  }
  //Unmute Single Call
  export async function unMuteCaller(conversationId:string, participantId:string){
     let body ={
             "muted": false         
     }
  
      return await conversationsApi.patchConversationsCallParticipant(conversationId, participantId, body)
          .then((data) => {
          console.log(`patchConversationsCall success! data: ${JSON.stringify(data, null, 2)}`);
          console.log(`UnMute Call success!`);
          })
          .catch((err) => {
          console.log('There was a failure unmuting caller');
          console.error(err);
          });
  }
  //Hold Single Call 
  export async function holdCaller(conversationId:string, participantId:string){
     let body ={
         "held": true        
     }
     console.log("holdCaller ",conversationId," | ",participantId);
      return await conversationsApi.patchConversationsCallParticipant(conversationId, participantId, body)
          .then((data) => {
          console.log(`patchConversationsCall success! data: ${JSON.stringify(data, null, 2)}`);
          console.log(`Hold Call success!`);
          })
          .catch((err) => {
          console.log('There was a failure putting caller on hold');
          console.error(err);
          });
  }
  // Pick up single call
  export async function unHoldCaller(conversationId:string, participantId:string){
     let body ={
         "held": false        
     }
  
      return await conversationsApi.patchConversationsCallParticipant(conversationId, participantId, body)
          .then((data) => {
          //console.log(`patchConversationsCall success! data: ${JSON.stringify(data, null, 2)}`);
          console.log(`Un-Mute Call success!`);
          })
          .catch((err) => {
          console.log('There was a failure un-holding call');
          console.error(err);
          });
  }
  // disconnect single call
  export async function disconnectCaller(conversationId:string, participantId:string){
     let body ={
         "state": "disconnected"        
     }
  
      return await conversationsApi.patchConversationsCallParticipant(conversationId, participantId, body)
          .then((data) => {
          //console.log(`patchConversationsCall success! data: ${JSON.stringify(data, null, 2)}`);
          console.log(`Disconnect Sinlge Call success!`);
          })
          .catch((err) => {
          console.log('There was a failure disconnecting single');
          console.error(err);
          });
  }
 
 //disconnect conference calls
 export async function disconnectAllCalls(origId:string, participantId:string, newConvId:string){
     let  body ={
  
              "participants": [
                {
                  "id": participantId
                }
              ],
              "conversationIds": newConvId,
              "state": "disconnected"
      }
  
      return await conversationsApi.patchConversationsCall(origId, body)
          .then((data) => {
          //console.log(`patchConversationsCall success! data: ${JSON.stringify(data, null, 2)}`);
          console.log(`patchConversationsCall disconnect success! `);
          })
          .catch((err) => {
          console.log('There was a failure calling patchConversationsCall');
          console.error(err);
          });
  }
 
  export async function monitorCall(origId:string, participantId:string){
     // Listen in on the conversation from the point of view of a given participant.
     return await conversationsApi.postConversationsCallParticipantMonitor(origId, participantId)
         .then(() => {
         console.log(`postConversationsCallParticipantMonitor returned successfully.`);
         })
         .catch((err) => {
         console.log("There was a failure calling postConversationsCallParticipantMonitor");
         console.error(err);
         return {error:err.message};
     });
  }
  //Join Call
  export async function joinCall(origId:string, participantId:string, userId:string){
 
         let body = {
             "participants": [
               {
                 "userId": userId
               }
             ]
           }
 
         return await conversationsApi.postConversationsCalls(body)
         .then((data) => {
                 console.log(`postConversationsCalls success! data: ${JSON.stringify(data, null, 2)}`);
                 let  body ={
 
                     "participants": [
                     {
                         "id": participantId
                     },
                     {
                         "mediaRoles": [
                           "full"
                         ],
                     }
                     ],
                     "conversationIds": data.id
                 }
 
                 conversationsApi.patchConversationsCall(origId, body)
                 .then((data) => {
                     //console.log(`patchConversationsCall success! data: ${JSON.stringify(data, null, 2)}`);
                     console.log(`Merge calls success!`);
                 })
                 .catch((err) => {
                     console.log('There was a failure calling patchConversationsCall');
                     console.error(err);
                 });
 
         })
         .catch((err) => {
           console.log("There was a failure calling postConversationsCalls");
           console.error(err);
         });  
          
  }
 
  export async function coachCall(conversationId:string, participantId:string){
     // Listen in on the conversation from the point of view of a given participant.
     return await conversationsApi.postConversationsCallParticipantCoach(conversationId, participantId)
         .then((data) => {
         console.log("postConversationsCallParticipantCoach returned successfully.");
         console.log(`Coach Data: ${JSON.stringify(data, null, 2)}`);
         })
         .catch((err) => {
         console.log("There was a failure calling postConversationsCallParticipantMonitor");
         console.error(err);
         return {error:err.message};
     });
  }
 
  export async function joinListenedCall(origId:string, participantId:string, joinedId:string){
     console.log(`Joined Id ${joinedId} vs Participant Id ${participantId}`);
     let  body =
     {
         "participants": [
           {
             "mediaRoles": [
               "full"
             ],
             "id": joinedId
           }
         ]
       }
    
     return await conversationsApi.patchConversationsCall(origId, body)
         .then(() => {
             
         console.log(`postConversationsCallParticipantMonitor returned successfully.`);
         })
         .catch((err) => {
         console.log("There was a failure calling postConversationsCallParticipantMonitor");
         console.error(err);
     });
  }
 // Preview api Barge
 export async function participantBarge(conversationId:string, participantId:string){
     // Listen in on the conversation from the point of view of a given participant.
     return await conversationsApi.postConversationsCallParticipantBarge(conversationId, participantId)
         .then((data) => {
         console.log("postConversationsCallParticipantBarge returned successfully.");
         //console.log(`Barge Data: ${JSON.stringify(data, null, 2)}`);
         })
         .catch((err) => {
         console.log("There was a failure calling postConversationsCallParticipantBarge");
         
         console.error(err);
         return {error:err.message};
     });
  }
  export async function singleBarge(conversationId:string){
     // Listen in on the conversation from the point of view of a given participant.
     return await conversationsApi.postConversationBarge(conversationId)
         .then((data) => {
         console.log("postConversationBarge returned successfully.");
         //console.log(`Barge Data: ${JSON.stringify(data, null, 2)}`);
         })
         .catch((err) => {
         console.log("There was a failure calling postConversationBarge");
         console.error(err);
     });
  }
 
  export async function internalConsult(conversationId:string, participantId:string, agentId:string, userId:string){
     // Replaces Barge In
     let body = {
             "speakTo": "CONFERENCE",
             "userId": userId,
             "consultingUserId": agentId
 
     } 
     return await conversationsApi.postConversationsCallParticipantConsultAgent(conversationId, participantId, body)
     .then((data) => {
       console.log(`postConversationsCallParticipantConsultAgent success! data: ${JSON.stringify(data, null, 2)}`);
     })
     .catch((err) => {
       console.log("There was a failure calling postConversationsCallParticipantConsultAgent");
       console.error(err);
     });
  } 

  export async function startRecording(conversationId:string){
     let body ={
        "recordingState": "ACTIVE"
      }
     return await conversationsApi.putConversationsCallRecordingstate(conversationId, body)
     .then((data) => {
       console.log(`putConversationsCallRecordingstate success! data: ${JSON.stringify(data, null, 2)}`);
     })
     .catch((err) => {
       console.log("There was a failure calling putConversationsCallRecordingstate");
       console.error(err);
     });
    }