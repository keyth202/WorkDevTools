import { atom } from "recoil";


export const errorState= atom({
    key:'errorState',
    default:{ 
        type:"info",
        txt:"The bunnies broke something",
        show:false 
    }
})


export const formState = atom({
    key:'formState',
    default:{
      agentId: "",
      projectId: "",
      location: "us-central1",
      languageCode: "en",
      chatTitle: "Demo",
      prompt: "",
      mood: "",
      timeOfReply: 0,
      readyToLaunch: false,
      turns:30,
      testCase: "",
    }
})


export const modalState = atom<{
  taskModalOpen: boolean;
  knowledgeModalOpen: boolean;
}>({
  key: 'modalState',
  default: { 
    taskModalOpen: false, 
    knowledgeModalOpen: false },
});

export const transcriptState = atom({
  key: 'transcriptState',
  default:{
    msgHx: [],
    isFinished: false,
  } 
});