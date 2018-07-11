module.change_code = 1;
'use strict';

var alexa = require( 'alexa-app' );
var app = new alexa.app( 'test-skill' );


app.launch( function( request, response ) {
	response.say( 'Welcome to your test skill' ).reprompt( 'Way to go. You got it to run. Bad ass.' ).shouldEndSession( false );
} );


app.error = function( exception, request, response ) {
	console.log(exception)
	console.log(request);
	console.log(response);
	response.say( 'Sorry an error occured ' + error.message);
};

app.intent('SumPlayer',
	{
		"slots": [
			{
				"name": "first_num",
				"type": "AMAZON.NUMBER",
				"samples": [
					"{first_num}"
				]
			},
			{
				"name": "second_num",
				"type": "AMAZON.NUMBER",
				"samples": [
					"{second_num}"
				]
			}
		],
		"samples": [
			"sum {first_num} and {second_num}",
			"sum two numbers"
		]
	},
	function(request,response) {
		var arg1 = request.slot('first_num');
		var arg2 = request.slot('second_num');
		var res = parseInt(arg1) + parseInt(arg2);
		res  = "The sum between "+arg1+" and "+arg2+" is queal to "+res.toString();
		response.say(res);
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
		response.say("You asked for the number "+number);
	}
);

module.exports = app;