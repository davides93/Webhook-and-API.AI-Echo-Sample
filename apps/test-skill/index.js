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
			"the second number is {!-100|second_num}", "{!-100|num}"]
	},
	function(request,response) {
		var session = null;
		var num1 = null;
		var num2 = null;
		console.log("Request initiated");
		// check if you can use session (read or write)
		if(request.hasSession()){
			session = request.getSession();
			num1 = session.get('first_num');
			num2 = session.get('second_num');
			console.log("Getting session with first num: "+num1+" and second num: "+num2+"!");
		}
		// get the session object
		var arg1 = request.slot('first_num');
		var arg2 = request.slot('second_num');
		var num = request.slot('num');
		console.log("Getting slots from request with first num: "+arg1+", second num: "+arg2+" and num: "+num);
		if(num1==null){
			console.log("Session: first_num not present");
			if(arg1 == null && num == null){
				console.log("Request: first_num and num not present");
				var say = "You need to give the first number";
				var prompt = "What's the first number?";
				response.say(say).reprompt(prompt).shouldKeepAlive(true);
			}else if (arg1 != null){
				console.log("Request: first_num present");
				session.set("first_num",arg1);
			}else if (num != null){
				console.log("Request: num present");
				session.set("first_num",num);
			}
		}else if(num2==null){
			console.log("Session: second_num not present");
			if(arg2 == null && num == null){
				console.log("Session: second_num and num not present");
				var say = "You need to give the second number";
				var prompt = "What's the second number?";
				response.say(say).reprompt(prompt).shouldKeepAlive(true);
			}else if (arg2 != null){
				console.log("Request: second_num present");
				session.set("second_num",arg2);
			}else if (num != null){
				console.log("Request: num present");
				session.set("second_num",num);
			}
		} else {
			console.log("Session: first_num: "+num1+" and second_num: "+num2+" present");
			var res = parseInt(num1) + parseInt(num2);
			res  = "The sum between "+num1+" and "+num2+" is equeal to "+res.toString();
			response.say(res);
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