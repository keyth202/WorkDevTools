import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing VITE_GOOGLE_API_KEY environment variable");
}

const ai = new GoogleGenAI({ apiKey });
const urls =[
    "https://bigfuture.collegeboard.org/scholarships/*",
    "https://www.salliemae.com/student-loans/undergraduate-student-loans/*",
    "https://scholarshipamerica.org/students/browse-scholarships/*",
]
async function generateText(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config:{
                systemInstruction: "You are a sassy drag queen that helps the user find scholarships for college. Whenever you return a scholarship, return it as a link to where you can apply.",
                temperature:0.1,
                maxOutputTokens:50,
                tools:[
                    {urlContext:{urls}},
                    {googleSearch:{}}
                ]
            }
        });
        console.log("Response from generateText:", response);
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
    }
  
}
async function generateTextWHx(prompt, history=[]) {
    try {
        console.log("History in generateTextWHx:", history);
        const chat = ai.chats.create({
            model: "gemini-2.5-flash-lite",
            history: history,
            config:{
                //systemInstruction: "You are a sassy drag queen that helps the user find scholarships for college. Whenever you return a scholarship, return it as a link to where you can apply.",
                systemInstruction: "Continue the conversation in a helpful manner.",
                temperature:0.5,
                maxOutputTokens:300,
                tools:[
                    {urlContext:{urls}},
                    {googleSearch:{}}
                ]
            },
        });
        const response = await chat.sendMessage({
            message: prompt,
        });
        console.log("Full Response from generateTextWHx:", response);
        console.log("Metadata from generateTextWHx:", response.metadata);
        return response.text;
    } catch (error) {
        console.error("Error generating text with history:", error);
    }
    
}

async function generateTextWHxMood(prompt, history=[], mood,randomNum) {
    
    const vetPrompt=`
        You are playing the role of the **USER**. Your goal is to find information about the **recent invoices for your pet** from the virtual AGENT. The tone of the conversation must be **${mood}**.

        **CONVERSATION RULES:**
        1.  You are the **USER** only. **NEVER** act as the virtual AGENT or respond to your own prompts.
        2.  Your response must be the *next line* of dialogue from the USER.
        3.  Your responses must sound like a regular person, avoiding overly formal language or technical jargon.
        4.  Be brief: **Respond with a maximum of two (2) sentences per turn.**
        5.  **NEVER** ask the AGENT for their information or offer assistance.

        **USER ACTIONS TO PERFORM (Select one per turn):**
        * Ask for a recent invoice for your pet.
        * Ask for details about a specific charge on the invoice.
        * Ask to verify the total amount due.
        * If the AGENT asks for a phone number, provide it: **7039660193**.
        * If the AGENT asks for a pin, provide it: **5440**.
        * If the AGENT asks for your account ID, provide it: **8901234**.
        * If the AGENT asks for your name, make one up (e.g., "It's John.").
        * If the AGENT asks for your dog's name, make one up (e.g., "It's Alfredo Fuffypants.").
        * Acknowledge the end of the required transaction (address and hours) and conclude the conversation.

        **CRUCIAL INSTRUCTION:** Your response should only be the text that the **USER** would say next.
    `
    
    
    const acctPrompt=`
        You are playing the role of the **USER**. Your goal is to obtain the **current financial account status, billing cycle, and payment options** from the virtual AGENT. The tone of the conversation must be **${mood}**.

        **CONVERSATION RULES:**
        1.  You are the **USER** only. **NEVER** act as the virtual AGENT or respond to your own prompts.
        2.  Your response must be the *next line* of dialogue from the USER.
        3.  Your responses must sound like a regular person, avoiding overly formal language or technical jargon.
        4.  Be brief: **Respond with a maximum of two (2) sentences per turn.**
        5.  **NEVER** ask the AGENT for their information or offer assistance.

        **USER ACTIONS TO PERFORM (Select one per turn):**
        * Ask for account balance and due date.
        * Ask about the blling cycle.
        * Ask to update billing address or payment method.
        * If the AGENT asks for a phone number, provide it: **7039660193**.
        * If the AGENT asks for a pin, provide it: **5440**.
        * If the AGENT asks for your account ID, provide it: **8901234**.
        * If the AGENT asks for your name, make one up (e.g., "It's John.").
        * Acknowledge the end of the required transaction (address and hours) and conclude the conversation.

        **CRUCIAL INSTRUCTION:** Your response should only be the text that the **USER** would say next.
    `
    
    const schedPrompt=`
        You are playing the role of the **USER**. Your goal is to obtain the **confirm an appointment this year or schedule an appointment** from the virtual AGENT. The tone of the conversation must be **${mood}**.

        **CONVERSATION RULES:**
        1.  You are the **USER** only. **NEVER** act as the virtual AGENT or respond to your own prompts.
        2.  Your response must be the *next line* of dialogue from the USER.
        3.  Your responses must sound like a regular person, avoiding overly formal language or technical jargon.
        4.  Be brief: **Respond with a maximum of two (2) sentences per turn.**
        5.  **NEVER** ask the AGENT for their information or offer assistance.

        **USER ACTIONS TO PERFORM (Select one per turn):**
        * Ask to schedule an appointment.
        * Ask to confirm an existing appointment.
        * If the AGENT asks for a phone number, provide it: **7039660193**.
        * If the AGENT asks for a pin, provide it: **5440**.
        * If the AGENT asks for your account ID, provide it: **8901234**.
        * If the AGENT asks for your name, make one up (e.g., "It's John.").
        * Acknowledge the end of the required transaction (address and hours) and conclude the conversation.

        **CRUCIAL INSTRUCTION:** Your response should only be the text that the **USER** would say next.
    `
    const genPrompt = `
        You are playing the role of the **USER**. Your goal is to obtain the **business address and the open/close times for a service location** from the virtual AGENT. The tone of the conversation must be **${mood}**.

        **CONVERSATION RULES:**
        1.  You are the **USER** only. **NEVER** act as the virtual AGENT or respond to your own prompts.
        2.  Your response must be the *next line* of dialogue from the USER.
        3.  Your responses must sound like a regular person, avoiding overly formal language or technical jargon.
        4.  Be brief: **Respond with a maximum of two (2) sentences per turn.**
        5.  **NEVER** ask the AGENT for their information or offer assistance.

        **USER ACTIONS TO PERFORM (Select one per turn):**
        * Ask for the physical address.
        * Ask to confirm a specific physical address or part of it.
        * Ask for the open/close times in general.
        * Ask for the hours for a specific day (e.g., "What time do you close on Friday?").
        * If the AGENT asks for a phone number, provide it: **7039660193**.
        * If the AGENT asks for a pin, provide it: **5440**.
        * If the AGENT asks for your account ID, provide it: **8901234**.
        * If the AGENT asks for your name, make one up (e.g., "It's John.").
        * Acknowledge the end of the required transaction (address and hours) and conclude the conversation.

        **CRUCIAL INSTRUCTION:** Your response should only be the text that the **USER** would say next.
    `
    const respPrompt=`You are a 22 year old adult. You are ${mood}. 
    You want to be brief, no more than 2 sentences per response.
    Your phone number is 7039660193 and your pin is 5440 and your accountId is 8901234. 
    Sometimes you want to know about your account balance, sometimes you want to schedule an appointment, sometimes you want to find the address of a service location, sometimes you want to find out about a vet invoice.
    If they ask for a name, make one up.
    Do not repeat the question they asked you.
    **CRUCIALLY** You should contine the conversation as if you are a person 
    `
    const systemIns = randomNum === 1 ? genPrompt : randomNum === 2 ? acctPrompt : randomNum === 3 ? schedPrompt : vetPrompt;
    //const systemIns = respPrompt;
    try {
        console.log("History in generateTextWHxMood:", history);
        const chat = ai.chats.create({
            model: "gemini-2.5-flash-lite",
            history: history,
            config:{
                //systemInstruction: "You are a sassy drag queen that helps the user find scholarships for college. Whenever you return a scholarship, return it as a link to where you can apply.",
                systemInstruction:systemIns,
                temperature:0.8,
                maxOutputTokens:100,

            },
        });
        const response = await chat.sendMessage({
            message: prompt,
        });
        console.log("Full Response from generateTextWHx:", response);
        console.log("Metadata from generateTextWHx:", response.metadata);
        return response.text;
    } catch (error) {
        console.error("Error generating text with history:", error);
    }
    
}
async function generateTextWOhx(prompt, mood) {
    const sysIns=`You are a 22 year old adult, who is trying to find information about their account. You are ${mood}. 
    You want to be brief, no more than 2 sentences per response.
    Your phone number is 7039660193 and your pin is 5440 and your accountId is 8901234. 
    Sometimes you want to know about your account balance, sometimes you want to schedule an appointment, sometimes you want to find the address of a service location, sometimes you want to find out about a vet invoice.
    If they ask for a name, make one up.
    `
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config:{
                systemInstruction: sysIns,
                temperature:0.2,
                maxOutputTokens:50,
                /*tools:[
                    {urlContext:{urls}},
                    {googleSearch:{}}
                ]*/
            }
        });
        console.log("Response from generateTextWOHx:", response);
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
    }
  
}
async function generateTextWPnS(prompt, sysIns) {

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config:{
                systemInstruction: sysIns,
                temperature:0.2,
                maxOutputTokens:500,
                /*tools:[
                    {urlContext:{urls}},
                    {googleSearch:{}}
                ]*/
            }
        });
        //console.log("Response from generateTextWOHx:", response);
        return response.text;
    } catch (error) {
        console.error("Error generating text:", error);
    }
  
}
async function countTokens(prompt){
    try {
        const response = await ai.models.countTokens({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });
        console.log("Response from countTokens:", response);
        return response.tokenCount;
    
    } catch (error) {
        console.error("Error counting tokens:", error);
    }
}
async function generateTextWHxIns(prompt, history=[], systemIns) {

    try {
        //console.log("History in generateTextWHxIns:", history);
        const chat = ai.chats.create({
            model: "gemini-2.5-flash-lite",
            history: history,
            config:{
                //systemInstruction: "You are a sassy drag queen that helps the user find scholarships for college. Whenever you return a scholarship, return it as a link to where you can apply.",
                systemInstruction:systemIns,
                temperature:0.8,
                maxOutputTokens:100,

            },
        });
        const response = await chat.sendMessage({
            message: prompt,
        });
        console.log("Full Response from generateTextWHx:", response);

        return response.text;
    } catch (error) {
        console.error("Error generating text with history:", error);
    }
    
}
export { generateText, generateTextWHx, generateTextWHxMood, generateTextWOhx,  generateTextWHxIns, generateTextWPnS };