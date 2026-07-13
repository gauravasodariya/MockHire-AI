import axios from "axios"

export const AI=async ({message}) => {
    try{
        if(!message || !Array.isArray(message) || message.length === 0){
            throw new Error("message array is empty")
        }
        const response=await axios.post("https://openrouter.ai/api/v1/chat/completions",{
            model: "openai/gpt-4o-mini",
            messages: message
        },{
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        })
        const content = response?.data?.choices?.[0]?.message?.content
        if(!content){
            throw new Error("No content returned from OpenRouter API")
        }
        return content
    }
    catch(err){
        return {error: err.message}
    }
}