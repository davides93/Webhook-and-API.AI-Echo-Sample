module.change_code = 1;
'use strict';

var alexa = require( 'alexa-app' );
var app = new alexa.app( 'test-skill' );
var Speech = require('ssml-builder');
var AmazonSpeech = require('ssml-builder/amazon_speech');

app.launch( function( request, response ) {
	response.say( 'Welcome to your test skill' ).reprompt( 'Way to go. You got it to run. Bad ass.' ).shouldEndSession( false );
} );


app.error = function( exception, request, response ) {
	console.log(exception)
	console.log(request);
	console.log(response);
	response.say( 'Sorry an error occured ' + error.message);
};

app.intent("AMAZON.HelpIntent", {
		"slots": {},
		"utterances": []
	},
	function(request, response) {
		var helpOutput = "You can say 'give me the number ten' or ask 'some question'. You can also say stop or exit to quit.";
		var reprompt = "What would you like to do?";
		// AMAZON.HelpIntent must leave session open -> .shouldEndSession(false)
		response.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
	}
);

app.intent("AMAZON.StopIntent", {
		"slots": {},
		"utterances": []
	}, function(request, response) {
		var stopOutput = "Don't You Worry. I'll be back.";
		response.say(stopOutput);
	}
);

app.intent("AMAZON.CancelIntent", {
		"slots": {},
		"utterances": []
	}, function(request, response) {
		var cancelOutput = "No problem. Request cancelled.";
		response.say(cancelOutput);
	}
);

app.intent('SumPlayer',
	{
		"slots":{"first_num":"NUMBER", "second_num":"NUMBER"}
		,"utterances":[
			"sum {1-100|first_num} and {1-100|second_num}",
			"sum two numbers",
			"the first number is {!-100|first_num}",
			"the second number is {!-100|second_num}"]
	},
	function(request,response) {
		var session = null;
		// check if you can use session (read or write)
		if(request.hasSession()){
			session = request.getSession();
		}
		// get the session object

		var arg1 = request.slot('first_num');
		var arg2 = request.slot('second_num');
		if(arg1 == null){
			var say = "You need to give the first number";
			var prompt = "What's the first number?";
			response.say(say).reprompt(prompt).shouldEndSession(false);
		}else{
			session.set("first_num",arg1);
		}
		if(arg2 == null){
			var say = "You need to give the second number";
			var prompt = "What's the second number?";
			response.say(say).reprompt(prompt).shouldEndSession(false);
		}else{
			session.set("second_num",arg2);
		}
		if(session != null){
			var num1 = session.get('first_num');
			var num2 = session.get('second_num');
			if(num1 != null && num2 != null){
				var res = parseInt(num1) + parseInt(num2);
				res  = "The sum between "+num1+" and "+num2+" is equeal to "+res.toString();
				response.say(res);
			}
		}
	}
);

app.intent('sayNumber',
	{
		"slots":{"number":"NUMBER"}
		,"utterances":[
			"say the number {1-100|number}",
			"give me the number {!-100|number}",
			"tell me the number {!-100|number}",
			"I want to hear you say the number {!-100|number}"]
	},
	function(request,response) {
		var number = request.slot('number');
		response.say("You asked for the number "+number).shouldEndSession(false);
	}
);

module.exports = app;