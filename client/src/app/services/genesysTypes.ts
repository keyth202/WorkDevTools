interface IGPromptResponse {
    entities: IGPrompt[]
    pageNumber: number
    total: number
}
interface IGPrompt {
    id: string
    name: string
    resources: IGPromptResource[]
    type: string
}
interface IGPromptResource {
    promptId: string
    language: string
    ttsString: string
    text: string
    uploadUri: string
}
export type {IGPromptResponse, IGPrompt, IGPromptResource}