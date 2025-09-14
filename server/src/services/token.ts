import envVars from "../config/envVars";
class TokenManager{
    private tokens: { value: string; rounds: number}[]
    constructor(){
        const tokens = (envVars.GEMINI_API_TOKENS ?? '').replace(' ', '').split(',')
        this.tokens = []
        if(tokens.length) {
        this.tokens = tokens.map(t=>({value: t, rounds: 0}))
        }
    }

    getToken = () => {
        if(!this.tokens.length) return null
        let minIndex = 0
        for(let i = 0; i < this.tokens.length; i++) {
            if(this.tokens[i] < this.tokens[minIndex]) {
                minIndex = i
                continue
            }
        }
        return this.tokens[minIndex]?.value

    }
}

const tokenManager = new TokenManager()

export const getGeminiToken = tokenManager.getToken
