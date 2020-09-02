'use strict'

const Alexa = require('ask-sdk-core')
const fetch = require('node-fetch')
require('dotenv').config()

const { API_KEY } = process.env
const user = 'aagatsapkota'
const repo = 'sls-meetup-alexa-skill'
const SKILL_NAME = 'Create Issue'

// create project, and tell what project and status the issue is on
// second call create a project card, it accepts issue ID, pass status and create project entry

// Handlers
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    const speechText = `Welcome to ${SKILL_NAME}. What is the name of your issue?`
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_NAME, speechText)
      .getResponse()
  }
}

// const createIssue takes a tile and returns an issue
// take the fetch function in here

const createIssue = async (issueName) => {
  const issueResponse = await fetch(`https://api.github.com/repos/${user}/${repo}/issues`, {
    method: 'post',
    body: JSON.stringify({
      title: issueName
    }),
    headers: { 'Content-Type': 'application/json', Authorization: `token ${API_KEY}` }
  })
  return issueResponse.json()
}
const getProject = async () => {
  const projectName = await fetch(`https://api.github.com/repos/${user}/${repo}/projects`, {
    method: 'get',
    headers: { Authorization: `token ${API_KEY}`, Accept: 'application/vnd.github.inertia-preview+json' }
  })
  return projectName.json()
}
const getColumn = async () => {
  const project = await getProject()
  const projectId = project[0].id
  const column = await fetch(`https://api.github.com/projects/${projectId}/columns`, {
    method: 'get',
    headers: { Authorization: `token ${API_KEY}`, Accept: 'application/vnd.github.inertia-preview+json' }
  })
  return column.json()
}
// issueID  690637232
// projectID 5381051
// columnID 10656169
const addProjectCard = async (issue) => {
  const column = await getColumn()
  const columnId = column[0].id
  const createCard = await fetch(`https://api.github.com/projects/columns/${columnId}/cards`, {
    method: 'post',
    body: JSON.stringify({
      note: issue.title
    }),
    headers: { Authorization: `token ${API_KEY}`, Accept: 'application/vnd.github.inertia-preview+json' }
  })

  return createCard.json()
}

const MeetupIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MeetupIntent'
  },
  async handle(handlerInput) {
    const issueName = handlerInput.requestEnvelope.request.intent.slots.Name.value
    const issue = await createIssue(issueName)
    const projectCard = await addProjectCard(issue)
    const speechText = `Created issue ID ${issue.number} with title ${issue.title} `

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(SKILL_NAME, speechText)
      .getResponse()
  }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope
    console.log(`Request Type: ${request.type}`)
    console.log(`Intent: ${request.intent.name}`)
    return request.type === 'IntentRequest'
            && request.intent.name === 'AMAZON.HelpIntent'
  },
  handle(handlerInput) {
    const speechText = 'Say hi something'
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_NAME, speechText)
      .getResponse()
  }
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope
    console.log(`Request Type: ${request.type}`)
    console.log(`Intent: ${request.intent.name}`)
    return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.CancelIntent'
            || request.intent.name === 'AMAZON.StopIntent')
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!'
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(SKILL_NAME, speechText)
      .getResponse()
  }
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope
    console.log(`Request Type: ${request.type}`)
    console.log(`Intent: ${request.intent.name}`)
    return request.type === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse()
  }
}

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`)
    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse()
  },
}

// export the handlers
exports.meetupHandler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler,
    MeetupIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler)
  .addErrorHandlers(ErrorHandler)
  .lambda()
