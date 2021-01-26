"use strict";
// Import the service function and various response classes
const {
	dialogflow,
	actionssdk,
	Image,
	Table,
	Carousel,
} = require('actions-on-google');
//const agent = new WebhookClient({request: request, response: response});
const app = dialogflow({
	debug: true
});

const {buildSoapForBP, makeAsyncRequestForBP} = require("../util/util_bp");

app.intent('BluePrismControllerIntent.ChromeDriver', (conv) => {
	console.log("Retrieved ChromeDriver");
	buildSoapForBP("ChromeDriverUpdater",null);
	makeAsyncRequestForBP();
	var response = "Avviato il processo";
	console.log("Response: "+response);
	conv.close(response);
});

app.intent('BluePrismControllerIntent.PrezziOfferte', (conv) => {
	console.log("Intent: bp_process_PrezziOfferte");
	buildSoapForBP("PrezziOfferteFase1Elettrico",null);
	//makeRequest(); // Test
	makeAsyncRequestForBP();
	var response = "Avviato il processo";
	console.log("Response: "+response);
	conv.ask(response);
	conv.close(response);
});

app.intent('BluePrismControllerIntent.ScaricoPortali', (conv, params) => {
	console.log("Intent: bp_process_ScaricoPortali");
	var dove = params.dove ? params.dove : "";
	var quando = params.quando ? params.quando : "";
	buildSoapForBP("OPERFPScaricoPortaliACEA",null);
	//makeRequest(); // Test
	makeAsyncRequestForBP();
	var response = "Avviato il processo";
	console.log("Response: "+response);
	conv.close(response);
});


app.intent('Somma Intent', (conv, params) => {
	var arg1 = params.arg1;
	var arg2 = params.arg2;
	var response = parseInt(arg1) + parseInt(arg2);
	response = "La somma di "+arg1+" e "+arg2+" è ugaule a "+response.toString();
	conv.close(response);
});

module.exports = app;
