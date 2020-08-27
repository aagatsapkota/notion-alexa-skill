'use strict'

const Alexa = require('ask-sdk-core')
const fetch = require('node-fetch')

const API_KEY = 'b31a706851e5253ed1b1af5e9a6222d5'
let cityName = 'Kathmandu'
const SKILL_NAME = 'Check Weather'
let WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`

// Handlers
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    const speechText = `Welcome to ${SKILL_NAME}. Where are you from?`
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
    cityName = handlerInput.requestEnvelope.request.intent.slots.City.value
    WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}`
    const response = await fetch(WEATHER_API_URL)
    const data = await response.json()
    const temp = data.main.temp - 273
    const speechText = `Hi, person from ${cityName}, the temperature here is ${temp} celsius`

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
    // any cleanup logic goes here
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
