import { conversationsApi, routingApi, speechTextApi } from "./genesysCloudUtils";



export const parseConversations = async (data) => {
  let results = [];
  if (!data.conversations) return results;
  //console.log("entered data", JSON.stringify(data, null, 2));
  data.conversations.forEach((conversation) => {
    const conversationId = conversation.conversationId;
    const conversationStart = conversation.conversationStart;
    const direction = conversation.originatingDirection;
    let firstSessionId = null;
    if (
      conversation.participants[0].sessions &&
      conversation.participants[0].sessions.length > 0
    ) {
      firstSessionId = conversation.participants[0].sessions[0].sessionId;
    }

    // Define participants array locally per conversation
    const participants = conversation.participants.map((participant) => ({
      participantId: participant.participantId,
      purpose: participant.purpose,
      participantName: participant.participantName || null,
      userId: participant.userId || null,
    }));
    // Get queueid
    const queueIdsSet = new Set();

    conversation.participants?.forEach((participant) => {
      participant.sessions?.forEach((session) => {
        session.segments?.forEach((segment) => {
          if (segment.queueId) {
            queueIdsSet.add(segment.queueId);
          }
        });
      });
    });

    const queueIds = Array.from(queueIdsSet);

    // Push one result object per conversation
    results.push({
      conversationId,
      firstSessionId,
      conversationStart,
      direction,
      participants,
      queueIds,
    });

  });

  console.log(`parseConversations: ${results.length} conversations parsed`);
  return results;
};
export const searchConversations = async (startDate, endDate, queues) => {  
    let page = 1;
    let pageSize = 500;
    let predicates = [];
    let predicates2 = [];
    console.log(`searchConversations called with startDate: ${startDate}, endDate: ${endDate}, queues: ${queues}`);
    if (Array.isArray(queues) && queues.length > 0) {
        predicates = queues.map(queue => ({
            "type": "dimension",
            "dimension": "queueId",
            "operator": "matches",
            "value": queue
        }));
        predicates2 = queues.map(queue => ({
            "dimension": "queueId",
            "value": queue,
        }));
    }
    console.log(`searchConversations predicates:`, predicates);
    let body = {
        "segmentFilters": [
            {
            "type": "and",
            "clauses": [
                {
                "type": "and",
                "predicates": [
                    {
                    "type": "dimension",
                    "dimension": "mediaType",
                    "value": "voice",
                    "operator": "matches"
                    }
                ]
                }
            ],
            "predicates": predicates

            }
        ],
        "interval": `${startDate.toISOString()}/${endDate.toISOString()}`,
        "paging": {
            "pageSize": pageSize,
            "pageNumber": page
        }
    }; // Object | query
    let body2 = {
        "segmentFilters": [
            {
            "type": "and",
            "clauses": [
                {
                "type": "or",
                "predicates": predicates
               
                }
            ],
             "predicates": [
                    {
                    "type": "dimension",
                    "dimension": "mediaType",
                    "value": "voice",
                    "operator": "matches"
                    }
                ]
            

            }
        ],
        "interval": `${startDate.toISOString()}/${endDate.toISOString()}`,
        "paging": {
            "pageSize": pageSize,
            "pageNumber": page
        }
    }; // Object | query
    let body3 = {
      "order": "desc",
        "orderBy": "conversationStart",
        "paging": {
          "pageSize": 50,
          "pageNumber": 1
        },
        "interval": `${startDate.toISOString()}/${endDate.toISOString()}`,
        "segmentFilters": [
          {
            "type": "or",
            "predicates": [
              {
                "dimension": "mediaType",
                "value": "voice"
              }
            ]
          },
          {
            "type": "or",
            "predicates": [
              {
                "dimension": "direction",
                "value": "inbound"
              }/*,
              {
                "dimension": "direction",
                "value": "outbound"
              }*/
            ]
          },
          {
            "type": "or",
            "predicates": predicates2
          }
        ],
        "conversationFilters": [],
        "evaluationFilters": [],
        "surveyFilters": []
      };
    let results = [];
    let job = {};
    async function getConvs(currentPage){
        await conversationsApi.postAnalyticsConversationsDetailsJobs(body3)
        .then((data) => {
            console.log(`postAnalyticsConversationsDetailsJobs success! data:`, data?.jobId);
            if (data && data.jobId){
              console.log(`Job ${data.jobId} created, checking job status...`);
              job = data;
            }else if(data && data?.totalHits !== 0) {
              results.push(...parseConversations(data));
              if (data && data.totalHits > currentPage * pageSize) {
                  // Fetch the next page of results
                  getConvs(currentPage + 1);
              } 
            }
            
        })
        .catch((err) => {
            console.log("There was a failure calling postAnalyticsConversationsDetailsJobs");
            console.error(err);
        });
    }
    await getConvs(page);
    return results.length === 0 ? job : results;
}

export const getConvJobStatus = async (jobId) => {
  
  console.log(`getConvJob called with jobId: ${jobId}`);
  if (!jobId) {
    console.error("No jobId provided to getConvJob");
    return {error: "No jobId provided"};
  }
  return conversationsApi.getAnalyticsConversationsDetailsJob(jobId)
    .then((data) => {
      console.log(`getAnalyticsUsersDetailsJob success! data: ${data?.state}`);
      return data;
    })
    .catch((err) => {
      console.log("There was a failure calling getAnalyticsUsersDetailsJob");
      console.error(err);
      return {error: "Failed to get job results", details: err};
    });
}

export const getJobResults = async (jobId:string, cursor = null) => {
  let results = [];
  let opts ={}
  if(!cursor){
    opts ={
      pageSize: 500, // Number | Page size
    } 
  } else {
    opts = {
      pageSize: 500, // Number | Page size
      cursor: cursor
    };
  }
  return conversationsApi.getAnalyticsConversationsDetailsJobResults(jobId, opts)
    .then((data) => {
      console.log(`getAnalyticsUsersDetailsJobResults success! data:`, data?.conversations.length); 
      //results.push(...parseConversations(data));
      
      return data;
    })
    .catch((err) => {
      console.log("There was a failure calling getAnalyticsUsersDetailsJobResults");
      console.error(err);
      return {error: "Failed to get job results", details: err};
    });
}


export const getQueues = async () => {
    let opts = { 
      "pageNumber": 1, // Number | Page number
      "pageSize": 300, // Number | Page size
      "sortOrder": "asc", // String | Note: results are sorted by name.
    };

// Get list of queues.
 return routingApi.getRoutingQueues(opts)
  .then((data) => {
    console.log(`getRoutingQueues success! data: ${data?.entities?.length} queues found`);
    let queues = [];
    if (data && data.entities) {
      queues = data.entities.map(queue => ({
        id: queue.id,
        name: queue.name,
      }));
    }
    return queues;
  })
  .catch((err) => {
    console.log("There was a failure calling getRoutingQueues");
    console.error(err);
  });
}

export const getTranscriptsURL = async (conversationId, sessionId) => {
  //console.log(`getTranscripts called with conversationId: ${conversationId}, sessionId: ${sessionId}`);
  if (!conversationId || !sessionId) {
    console.error("Invalid conversationId or sessionId");
    return;
  }

    return  speechTextApi.getSpeechandtextanalyticsConversationCommunicationTranscripturl(conversationId, sessionId)
      .then((data) => {
        //console.log(`getSpeechandtextanalyticsConversationCommunicationTranscripturls success! data: ${JSON.stringify(data, null, 2)}`);
        return data
      })
      .catch((err) => {
        //console.log("There was a failure calling getSpeechandtextanalyticsConversationCommunicationTranscripturls");
        console.error(err);
      });
}

export const getNumberConversations = async (startDate, endDate, queues) => {
  console.log(`getNumberConversations called with startDate: ${startDate}, endDate: ${endDate}, queues: ${queues}`);
  let predicates = [];
   if (Array.isArray(queues) && queues.length > 0) {
        predicates = queues.map(queue => ({
            "type": "dimension",
            "dimension": "queueId",
            "operator": "matches",
            "value": queue
        }));
    }
  let body = {
    "interval": `${startDate.toISOString()}/${endDate.toISOString()}`,
    "metrics": [
      "nConnected"
    ],
    "filter": {
      "type": "or",
      "predicates": predicates,
    }
  }
  return conversationsApi.postAnalyticsConversationsAggregatesQuery(body)
    .then((data) => {
      console.log(`postAnalyticsConversationsAggregatesQuery success! data: ${JSON.stringify(data, null, 2)}`);
    })
    .catch((err) => {
      console.log("There was a failure calling postAnalyticsConversationsAggregatesQuery");
      console.error(err);
    });
}

export const searchConversationsByKeyword = async ( keywords, startDate, endDate) => {
  let body ={
      "pageSize": 75,
      "pageNumber": 1,
      "types": [
        "transcripts"
      ],
      "returnFields": [
        "conversationId",
        "communicationId",
        "conversationStartTime",
      ],
      "query": [
        {
          "type": "EXACT",
          "fields": [
            "language"
          ],
          "value": "en-us"
        },
        {
          "type": "EXACT",
          "fields": [
            "mediaType"
          ],
          "value": "call"
        },
        {
          "type": "EXACT",
          "fields": [
            "transcript.content"
          ],
          "values": keywords
        },
        {
          "type": "DATE_RANGE",
          "fields": [
            "conversationStartTime"
          ],
          "startValue": startDate.getTime(),
          "endValue": endDate.getTime()
        }
      ]
    }
  return speechTextApi.postSpeechandtextanalyticsTranscriptsSearch(body).then((data) => {
    console.log(`postSpeechandtextanalyticsTranscriptsSearch success! data: ${/*JSON.stringify(data, null, 2)*/data?.results.length}`);
    return data;
  })
  .catch((err) => {
    console.log("There was a failure calling postSpeechandtextanalyticsTranscriptsSearch");
    console.error(err);
  });
}