// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
	},
	handle(handlerInput) {
		const speakOutput = 'Welcome, you can say Hello or Help. Which would you like to try?';
		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};
const HelloWorldIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
	},
	handle(handlerInput) {
		const speakOutput = 'Hello World!';
		return handlerInput.responseBuilder
			.speak(speakOutput)
			//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
			.getResponse();
	}
};
const HelpIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const speakOutput = 'You can say hello to me! How can I help?';

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};
const CancelAndStopIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
				|| Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		const speakOutput = 'Goodbye!';
		return handlerInput.responseBuilder
			.speak(speakOutput)
			.getResponse();
	}
};
const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		// Any cleanup logic goes here.
		return handlerInput.responseBuilder.getResponse();
	}
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
	},
	handle(handlerInput) {
		const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
		const speakOutput = `You just triggered ${intentName}`;

		return handlerInput.responseBuilder
			.speak(speakOutput)
			//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
			.getResponse();
	}
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		console.log(`~~~~ Error handled: ${error.stack}`);
		const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};

const {buildSoapForBP, makeAsyncRequestForBP} = require("../util/util_bp");

const BluePrismControllerChromedriverHandle = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'BluePrismControllerChromedriver';
	},
	handle(handlerInput) {
		console.log("Retrieved ChromeDriver");
		buildSoapForBP("ChromeDriverUpdater",null);
		makeAsyncRequestForBP();
		var response = "Avviato il processo";
		console.log("Response: "+response);
		return handlerInput.responseBuilder
			.speak(response)
			//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
			.getResponse();
	}
};

const BluePrismControllerNoteSpeseHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'BluePrismControllerNoteSpese';
	},
	handle(handlerInput) {
		console.log("Intent: bp_process_notespese");
		buildSoapForBP("NoteSpese",null);
		//makeRequest(); // Test
		makeAsyncRequestForBP();
		var response = "Avviato il processo";
		console.log("Response: "+response);
		return handlerInput.responseBuilder
			.speak(response)
			//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
			.getResponse();
	}
};

const BluePrismControllerMeteoHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'BluePrismControllerMeteo';
	},
	handle(handlerInput) {
		console.log("Intent: bp_process_meteo");
		var dove = params.dove ? params.dove : "";
		var quando = params.quando ? params.quando : "";
		buildSoapForBP("Meteo",null);
		//makeRequest(); // Test
		makeAsyncRequestForBP();
		var response = "Avviato il processo";
		console.log("Response: "+response);
		return handlerInput.responseBuilder
			.speak(response)
			//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
			.getResponse();
	}
};

const SommaIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
			&& Alexa.getIntentName(handlerInput.requestEnvelope) === 'SommaIntent';
	},
	handle(handlerInput) {
		var arg1 = params.arg1;
		var arg2 = params.arg2;
		var response = parseInt(arg1) + parseInt(arg2);
		response = "La somma di "+arg1+" e "+arg2+" è ugaule a "+response.toString();
		return handlerInput.responseBuilder
			.speak(response)
			//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
			.getResponse();
	}
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
const { ExpressAdapter } = require('ask-sdk-express-adapter');
const skill = Alexa.SkillBuilders.custom()
	.addRequestHandlers(
		LaunchRequestHandler,
		HelloWorldIntentHandler,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		SessionEndedRequestHandler,
		IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
		BluePrismControllerChromedriverHandle,
		BluePrismControllerMeteoHandler,
		BluePrismControllerNoteSpeseHandler,
		SommaIntentHandler
	)
	.addErrorHandlers(
		ErrorHandler,
	).create();
const adapter = new ExpressAdapter(skill, true, true);

module.exports = adapter.getRequestHandlers();
