"use strict";

const express = require("express");
const bodyParser = require("body-parser");

var http = require('http');
var request = require('request');
var city = "";
var date = "";
var soap_xml = "";
var response_json = "";
var http_options = {}
var http_res_options = {}

function makeRequest(){
	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
	var xmlhttp = new XMLHttpRequest();
	var url = "http://ec2-35-178-154-161.eu-west-2.compute.amazonaws.com:8181/ws/Meteo";
	xmlhttp.open('POST',url, true);
//Send the proper header information along with the request
	xmlhttp.setRequestHeader('Content-type', 'text/xml; charset=utf-8');
	xmlhttp.setRequestHeader('Authorization',"Basic " + new Buffer("admin" + ":" + "admin").toString("base64"));
	xmlhttp.setRequestHeader('SOAPAction','');
	//xmlhttp.setData("text/xml", soap_xml);

	xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
		if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			alert(xmlhttp.responseText);
		}
	}
	xmlhttp.send(soap_xml);
}

var soap_req;
var post_res;

function makeResponseRequestForGoogle(session, message){
	response_json = "{\"event\":{\"name\": \"bp_result_event\",\"data\": {\"result_message\": \""+message+"\", \"success_code\": 200}},\"lang\":\"en\",\"sessionId\":\""+session+"\"}";
	http_res_options = {
		hostname: 'api.dialogflow.com',
		port: 80,
		path: 'api/query',
		method: 'POST',
		headers: {
			'Authorization': "Bearer 8e2b1139164f43108031510c0c66fbec",
			'Content-Type': 'application/json',
			'Content-Length': response_json.length
		}
	}

	post_res = http.request(http_res_options, (res) => {
		console.log(`STATUS: ${res.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			console.log(`BODY: ${chunk}`);
		});

		res.on('end', () => {
			console.log('No more data in response.')
		})
	});

	post_res.on('error', (e) => {
		console.log(`problem with request: ${e.message}`);
	});

	post_res.write(response_json);
	post_res.end();
}

function makeAsyncRequestForBP(session){
	soap_req = http.request(http_options, (res) => {
		console.log(`STATUS: ${res.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			console.log(`BODY: ${chunk}`);
			makeResponseRequestForGoogle(session, chunk);
		});

		res.on('end', () => {
			console.log('No more data in response.')
		})
	});

	soap_req.on('error', (e) => {
		console.log(`problem with request: ${e.message}`);
	});

	soap_req.write(soap_xml);
	soap_req.end();
}

function isNumber(n) { return !isNaN(parseFloat(n)) && !isNaN(n - 0) }

function buildSoapForBP(city,date){
	soap_xml = "<x:Envelope xmlns:x=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:blueprism:webservice:Meteo\">\n" +
		"    <x:Header/>\n" +
		"    <x:Body>\n" +
		"        <urn:Meteo>\n" +
		"            <urn:City>"+city+"</urn:City>\n" +
		"            <urn:Date>"+date+"</urn:Date>\n" +
		"        </urn:Meteo>\n" +
		"    </x:Body>\n" +
		"</x:Envelope>";

	http_options = {
		hostname: 'ec2-35-178-154-161.eu-west-2.compute.amazonaws.com',
		port: 8181,
		path: '/ws/Meteo',
		method: 'POST',
		headers: {
			'Authorization': "Basic " + new Buffer("admin" + ":" + "admin").toString("base64"),
			'Content-Type': 'text/xml',
			'SOAPAction': '',
			'Content-Length': soap_xml.length
		}
	}
}


const restService = express();

restService.use(
	bodyParser.urlencoded({
		extended: true
	})
);

restService.use(bodyParser.json());


restService.post("/SSG_APP_V1", function (req, res) {
	var speech;
	// write data to request body
	var intentName = req.body.result.metadata.intentName;
	switch(intentName) {
		case "somma":
			var arg1 = req.body.result.parameters.arg1;
			var arg2 = req.body.result.parameters.arg2;
			speech = parseInt(arg1) + parseInt(arg2);
			speech = "La somma di "+arg1+" e "+arg2+" è ugaule a "+speech.toString();
			break;
		case "bp_process_meteo":
			var city = req.body.result.parameters.city;
			var date = req.body.result.parameters.date;
			buildSoapForBP(city,date);
			//makeRequest(); // Test
			makeAsyncRequestForBP();
			soap_req.write(soap_xml);
			soap_req.end();
			speech = "Avviato il processo per controllare il meteo";
			break;
		case "bp_result_event":
			break;
		default:
			speech = req.body.result && req.body.result.parameters &&
			req.body.result.parameters.echoText
				? req.body.result.parameters.echoText
				: "Seems like some problem. Speak again.";
			break;
	}

	console.log("Ciao!");
	console.log("End");
	return res.json({
		speech: speech,
		displayText: speech,
		source: "webhook-echo-sample"
	});
});

restService.post("/SSG_APP_V2", function (req, res) {
	var response;
	// write data to request body
	console.log("Start APP V2 POST!");
	var intentName = req.body.queryResult.intent.displayName;
	console.log("Retrieved Intent name: "+intentName);
	var session = req.session;
	switch(intentName) {
		case "Somma Intent":
			console.log("Intent: somma");
			var arg1 = req.body.queryResult.parameters.arg1;
			var arg2 = req.body.queryResult.parameters.arg2;
			response = parseInt(arg1) + parseInt(arg2);
			response = "La somma di "+arg1+" e "+arg2+" è ugaule a "+response.toString();
			console.log("Response: "+response);
			break;
		case "Blue Prism Controller - Meteo":
			console.log("Intent: bp_process_meteo");
			var city = req.body.queryResult.parameters.city;
			var date = req.body.queryResult.parameters.date;
			buildSoapForBP(city,date);
			//makeRequest(); // Test
			session = session.substr(session.length-36, session.length);
			makeAsyncRequestForBP(session);
			response = "Avviato il processo per controllare il meteo";
			console.log("Response: "+response);
			break;
		default:
			console.log("Intent DEFAULT: echo");
			response = req.body.queryResult && req.body.queryResult.parameters &&
			req.body.queryResult.parameters.echoText
				? req.body.queryResult.parameters.echoText
				: "Seems like some problem. Speak again.";
			console.log("Response: "+response);
			break;
	}
	console.log("End");
	return res.json({
		fulfillmentText: response
	});
});

restService.listen(process.env.PORT || 8000, function () {
	console.log("Server up and listening");
});


/*
restService.post("/audio", function (req, res) {
	var speech = "";
	switch (req.body.result.parameters.AudioSample.toLowerCase()) {
		//Speech Synthesis Markup Language
		case "music one":
			speech =
				'<speak><audio src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
			break;
		case "music two":
			speech =
				'<speak><audio clipBegin="1s" clipEnd="3s" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
			break;
		case "music three":
			speech =
				'<speak><audio repeatCount="2" soundLevel="-15db" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
			break;
		case "music four":
			speech =
				'<speak><audio speed="200%" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
			break;
		case "music five":
			speech =
				'<audio src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio>';
			break;
		case "delay":
			speech =
				'<speak>Let me take a break for 3 seconds. <break time="3s"/> I am back again.</speak>';
			break;
		//https://www.w3.org/TR/speech-synthesis/#S3.2.3
		case "cardinal":
			speech = '<speak><say-as interpret-as="cardinal">12345</say-as></speak>';
			break;
		case "ordinal":
			speech =
				'<speak>I stood <say-as interpret-as="ordinal">10</say-as> in the class exams.</speak>';
			break;
		case "characters":
			speech =
				'<speak>Hello is spelled as <say-as interpret-as="characters">Hello</say-as></speak>';
			break;
		case "fraction":
			speech =
				'<speak>Rather than saying 24+3/4, I should say <say-as interpret-as="fraction">24+3/4</say-as></speak>';
			break;
		case "bleep":
			speech =
				'<speak>I do not want to say <say-as interpret-as="bleep">F&%$#</say-as> word</speak>';
			break;
		case "unit":
			speech =
				'<speak>This road is <say-as interpret-as="unit">50 foot</say-as> wide</speak>';
			break;
		case "verbatim":
			speech =
				'<speak>You spell HELLO as <say-as interpret-as="verbatim">hello</say-as></speak>';
			break;
		case "date one":
			speech =
				'<speak>Today is <say-as interpret-as="date" format="yyyymmdd" detail="1">2017-12-16</say-as></speak>';
			break;
		case "date two":
			speech =
				'<speak>Today is <say-as interpret-as="date" format="dm" detail="1">16-12</say-as></speak>';
			break;
		case "date three":
			speech =
				'<speak>Today is <say-as interpret-as="date" format="dmy" detail="1">16-12-2017</say-as></speak>';
			break;
		case "time":
			speech =
				'<speak>It is <say-as interpret-as="time" format="hms12">2:30pm</say-as> now</speak>';
			break;
		case "telephone one":
			speech =
				'<speak><say-as interpret-as="telephone" format="91">09012345678</say-as> </speak>';
			break;
		case "telephone two":
			speech =
				'<speak><say-as interpret-as="telephone" format="1">(781) 771-7777</say-as> </speak>';
			break;
		// https://www.w3.org/TR/2005/NOTE-ssml-sayas-20050526/#S3.3
		case "alternate":
			speech =
				'<speak>IPL stands for <sub alias="indian premier league">IPL</sub></speak>';
			break;
	}
	return res.json({
		speech: speech,
		displayText: speech,
		source: "webhook-echo-sample"
	});
});

restService.post("/video", function (req, res) {
	return res.json({
		speech:
			'<speak>  <audio src="https://www.youtube.com/watch?v=VX7SSnvpj-8">did not get your MP3 audio file</audio></speak>',
		displayText:
			'<speak>  <audio src="https://www.youtube.com/watch?v=VX7SSnvpj-8">did not get your MP3 audio file</audio></speak>',
		source: "webhook-echo-sample"
	});
});

restService.post("/slack-test", function (req, res) {
	var slack_message = {
		text: "Details of JIRA board for Browse and Commerce",
		attachments: [
			{
				title: "JIRA Board",
				title_link: "http://www.google.com",
				color: "#36a64f",

				fields: [
					{
						title: "Epic Count",
						value: "50",
						short: "false"
					},
					{
						title: "Story Count",
						value: "40",
						short: "false"
					}
				],

				thumb_url:
					"https://stiltsoft.com/blog/wp-content/uploads/2016/01/5.jira_.png"
			},
			{
				title: "Story status count",
				title_link: "http://www.google.com",
				color: "#f49e42",

				fields: [
					{
						title: "Not started",
						value: "50",
						short: "false"
					},
					{
						title: "Development",
						value: "40",
						short: "false"
					},
					{
						title: "Development",
						value: "40",
						short: "false"
					},
					{
						title: "Development",
						value: "40",
						short: "false"
					}
				]
			}
		]
	};
	return res.json({
		speech: "speech",
		displayText: "speech",
		source: "webhook-echo-sample",
		data: {
			slack: slack_message
		}
	});
});
* */