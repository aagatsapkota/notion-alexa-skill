'use strict'

const Alexa = require('ask-sdk-core')
const fetch = require('node-fetch')
const file = require('./TestIssues.json')
require('dotenv').config()

// const { API_KEY } = process.env
// const { GIT_API_KEY } = process.env
const { GIT_API_KEY } = process.env
const user = 'aagatsapkota'
const repo = 'sls-meetup-alexa-skill'
let issueName = ''
const SKILL_NAME = 'Create Issue'

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

const MeetupIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'MeetupIntent'
  },
  async handle(handlerInput) {
    issueName = handlerInput.requestEnvelope.request.intent.slots.Name.value
    const speechText = `Hi have created your issue called ${issueName}`
    // process.env.TOKEN

    fetch(`https://api.github.com/repos/${user}/${repo}/issues`, {
      method: 'post',
      body: JSON.stringify(file),
      headers: { 'Content-Type': 'application/json', Authorization: `token ${GIT_API_KEY}` }
    })
      .then((res) => res.json())
      .then((json) => {
        console.log(`Issue created at ${json.url}`)
      })

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
