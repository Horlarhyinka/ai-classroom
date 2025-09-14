import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message, Persona } from "../utils/types";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function generateChapter(token: string, content: string, existing: string[]) {
  const genAI = new GoogleGenerativeAI(token);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    You are an AI for generating classroom fit book chapters from a given text.
    You will be provided with text which forms part of a complete document, A list of existing chapters (if the text is not the start of the document).
    From the provided text, you are to:
    1. Generate A title for the chapter: Make sure there are no duplicate chapters. Make the chapter name clear and concise.
    For each chapter, provide:
    2. Generate a content: This should be a detailed chapter content of the provided text, keep explanation within the scope of the chapter, you can make reference to previous chapters if you have to.

    Output structure:
    ##CHAPTER##
    ##TITLE## My Title ##TITLE##
    ##BODY## My Content ##BODY##


    ${existing?.length ? "Here are the previous chapters: \n" + existing.join('\n') : ''}

    Here is the input content:

    ${content}

  
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const parsed = response.text()
  return extractChaptersObject(parsed)
}

export async function generateSection(token: string, chapterContent: string) {
  console.log("I was called")
  const genAI = new GoogleGenerativeAI(token);
  console.log("I")
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log("II")
  try{

    const prompt = `
    You are an AI for breaking down chapters into understandable and also elaborated chunks for the purpose of learning.
    You will be provided with a chapter, Generate summarized but detailed sections with keypoints for enhanced and easy learning. Each section should have a title and a content
    Output structure:
    ##SECTION##
    ##TITLE## Section 1 Title ##TITLE##
    ##BODY## Section 1 Content ##BODY##
    ##SECTION##
    ##TITLE## Section 2 title ##TITLE##
    ##BODY## Section 2 Content##BODY##
  `;
  console.log("III")
  const result = await model.generateContent([prompt, chapterContent]);
  console.log("IV")
  const response = result.response;
  console.log("V")
  const parsed = response.text()
  console.log('Parsed:', parsed)
  const extracted = extractSectionssObject(parsed)
  console.log('Extracted:', extracted)
  return extracted
  }catch(err: unknown){
    throw err
  }
}

export async function generateTeacherExplanation(content: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    Act as an enthusiastic and knowledgeable teacher explaining this content.
    Make it engaging and interactive, using examples and analogies where appropriate.
    Keep the tone conversational but professional.
  `;

  const result = await model.generateContent([prompt, content]);
  const response = await result.response;
  return response.text();
}

export async function generateStudentQuestion(content: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    Act as a curious student. Based on this content:
    1. Ask an insightful question that demonstrates understanding
    2. The question should encourage deeper discussion
    3. Keep it natural and conversational
    Return just the question.
  `;

  const result = await model.generateContent([prompt, content]);
  const response = await result.response;
  return response.text();
}

export async function generateTeacherAnswer(question: string, context: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    As a teacher, answer this student question: "${question}"
    Use this context for reference: "${context}"
    Provide a clear, thorough explanation while maintaining an encouraging tone.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

export async function generateDIscussionFromChapter(token: string, title: string, body: string, personas: Persona[]) {
  const genAI = new GoogleGenerativeAI(token);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const messagesMax = 10

  console.log('Personas provided')
  let formattedPersonas = ``
  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i]
    formattedPersonas += `
    persona_id: ${persona.id}
    persona_name: ${persona.name}
    role: ${persona?.isUser ? 'user' : persona.role == 'student' ? 'ai_student' : persona.role}
    `
  }
  console.log('Formatted personas::', formattedPersonas)
  const prompt = `
  You are an AI for generationg Classroom classroom conversation messages.
  You will be provided with a chapter title, chapter content, Personas present in the classrooms.
  You are to generate a queue of messages, not more than ${messagesMax}, and should be an interactive discussion that simulate a chatroom lecture for the provided chapter.
  You will be provided with ${personas.length} Personas with their ID and roles, role can be teacher, ai_student, user.
  Note that you are only to generate message queue for interaction between teacher and ai_student, information of the user is only provided so that it can be referenced or mentioned but no question should be directed to the user and also no message should be generated for user role.
  Your message should be messages in this format.
  ##MESSAGE##
  ##PERSONA##persona_id##PERSONA##
  ##BODY##message_body##BODY##
  ##MESSAGE##

  ##MESSAGE##
  ##PERSONA##persona_id##PERSONA##
  ##BODY##message_body##BODY##
  ##MESSAGE##

  ##MESSAGE##
  ##PERSONA##persona_id##PERSONA##
  ##BODY##message_body##BODY##
  ##MESSAGE##


  Note the persona_id in your response should correspond to the provided persona_id and not the index of the persona

  Here is the chapter:
  Title - ${title}
  
  ${body}

  ${formattedPersonas}

  `

  const result = await model.generateContent(prompt);
  const response = result.response;
  const parsed = response.text();
  const raw = extractMessages(parsed);
  console.log("personas:", personas)
  //sometimes gemini still returns message with index as persona
  const indexIdKey: { [k: string]: string } = {}
  for (let i = 0; i < personas.length; i++) {
    console.log("Personas::-", personas, { target: personas[i] })
    indexIdKey[(i + 1).toString()] = personas[i]?.id
  }
  console.log("Persona Key map::", indexIdKey)
  const fixedMessages = raw.map(m => ({ ...m, persona_id: isNaN(parseInt(m.persona_id)) ? indexIdKey[m.persona_id] : m.persona_id }))
  console.log("Fixed Messages::->", fixedMessages)
  return fixedMessages
}

export async function extendDiscussionMessages(token: string, title: string, body: string, previousMessages: Message[], queuedMessages: Message[], newMessage: Message, personas: Persona[]) {
  const maxQueue = 10
  let formattedPreviousMessages = ''
  let formattedUnsentMessages = ''
  for (let i = 0; i < previousMessages.length; i++) {
    const message = previousMessages[i]
    const persona = message.persona as Persona
    formattedPreviousMessages += `
    persona_id: ${persona?.id}
    persona_name: ${persona?.name}
    message_body: ${message?.body}
    role: ${persona?.role}
    `
  }
  for (let i = 0; i < queuedMessages.length; i++) {
    const message = queuedMessages[i]
    const persona = message.persona as Persona
    formattedUnsentMessages += `
    persona_id: ${persona?.id}
    persona_name: ${persona?.name}
    message_body: ${message?.body}
    role: ${persona?.role}
    `
  }
  const userPersona = newMessage?.persona as Persona
  let formattedPersonas = ``
  for (let i = 0; i < personas.length; i++) {
    const persona = personas[i]
    formattedPersonas += `
      persona_id: ${persona.id}
      persona_name: ${persona.name}
      role: ${persona?.isUser ? 'user' : persona.role == 'student' ? 'ai_student' : persona.role}
      `
  }
  const prompt = `
  You are an AI assistant for managing an AI simulated chatroom, you will be provided with a chapter upon which a classroom discussion is being held. You will be provided with a list of already sent messages and a list of queued unsent messages.
  You will be provided with a previously queued messages of the classroom flow before a new message likely to invalidate the previous flow. You are to generate a new queue (maximum of ${maxQueue} messages) which takes account of the new message received from the user and also maintains the context of the previously queued messages before user intervention.
    Note that you are only to generate messages queue for teacher and ai_student, information of the user is provided in the user message so that it can be referenced no message should be generated for user role.
  Your message should be messages in this format.

  ##MESSAGE##
  ##PERSONA##persona_id##PERSONA##
  ##BODY##message_body##BODY##
  ##MESSAGE##

  ##MESSAGE##
  ##PERSONA##persona_id##PERSONA##
  ##BODY##message_body##BODY##
  ##MESSAGE##

  ##MESSAGE##
  ##PERSONA##persona_id##PERSONA##
  ##BODY##message_body##BODY##
  ##MESSAGE##

  Note the persona_id and other persona information in your response should correspond to the one in the personas information below:
  ${formattedPersonas}

  Here is the chapter:

    Here is the chapter:
  Title - ${title}
  
  ${body}

  Previously Sent Messages:
  ${formattedPreviousMessages}

  Perious Unsent Messages:
  ${formattedUnsentMessages}

  New User Message:
  persona_id: ${userPersona?.id}
  persona_name: ${userPersona?.name}
  message_body: ${newMessage?.body}

  `
  const genAI = new GoogleGenerativeAI(token);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  const response = result.response;
  const parsed = response.text();
  console.log("Parsed::->", parsed)
  // return extractMessages(parsed);
  const raw = extractMessages(parsed);
  console.log("Raw ->", raw)
  //sometimes gemini still returns message with index as persona
  const indexIdKey: { [k: string]: string } = {}
  for (let i = 0; i < personas.length; i++) {
    indexIdKey[(i + 1).toString()] = personas[i]?.id
  }
  console.log("Persona Key map::", indexIdKey)
  const fixedMessages = raw.map(m => ({ ...m, persona_id: isNaN(parseInt(m.persona_id)) ? indexIdKey[m.persona_id] : m.persona_id }))
  console.log("Fixed Messages::->", fixedMessages)
  return fixedMessages
}

function extractChaptersObject(input: string) {
  const chapterRegex = /##CHAPTER##\s*##TITLE##(.*?)##TITLE##\s*##BODY##(.*?)##BODY##/gs;

  const chapters = [];
  let match;

  while ((match = chapterRegex.exec(input)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    chapters.push({ title, body: content });
  }

  return chapters;
}

function extractSectionssObject(input: string) {
  const chapterRegex = /##SECTION##\s*##TITLE##(.*?)##TITLE##\s*##BODY##(.*?)##BODY##/gs;

  const chapters = [];
  let match;

  while ((match = chapterRegex.exec(input)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    chapters.push({ title, body: content });
  }

  return chapters;
}

function extractMessages(input: string) {
  const messageRegex = /##MESSAGE##\s*##PERSONA##(.*?)##PERSONA##\s*##BODY##(.*?)##BODY##\s*##MESSAGE##/gs;

  const messages = [];
  let match;

  while ((match = messageRegex.exec(input)) !== null) {
    const persona_id = match[1].trim();
    const body = match[2].trim();
    messages.push({ persona_id, body });
  }

  return messages;
}


