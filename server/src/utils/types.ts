
export interface Chapter {
    title: string;
    body: string;
    index: number;
}

export interface Section {
    title: string;
    body: string;
    index: string;
    chapter: number;
}

export interface Discussion {

}

export interface Persona{
    id: string;
    name: string;
    role: string;
    isUser: string;
}

export interface Message{
    persona: string | Persona;
    body: string;
    sent: boolean;
    discussion: string;
}