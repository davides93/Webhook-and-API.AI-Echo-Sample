const bp_user = 'admin';
const bp_pwd = 'admin1';
const bp_hostname = 'ec2-54-164-220-127.compute-1.amazonaws.com';


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
	var url = "http://localhost:8181/ws/Meteo";
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

module.exports.buildSoapForBP = function buildSoapForBP(processName,dictParam){
	// soap_xml = "<x:Envelope xmlns:x=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:blueprism:webservice:Meteo\">\n" +
	// 	"    <x:Header/>\n" +
	// 	"    <x:Body>\n" +
	// 	"        <urn:Meteo>\n" +
	// 	"            <urn:dove>"+dove+"</urn:dove>\n" +
	// 	"            <urn:quando>"+quando+"</urn:quando>\n" +
	// 	"        </urn:Meteo>\n" +
	// 	"    </x:Body>\n" +
	// 	"</x:Envelope>";

	if(processName.toString().trim() == ""){
		processName="ChromeDriverUpdater";
	}

	soap_xml = "<soapenv:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:urn=\"urn:blueprism:webservice:"+processName+"\">\n" +
		"   <soapenv:Header/>\n" +
		"   <soapenv:Body>\n" +
		"      <urn:"+processName+" soapenv:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\"/>\n" +
		"   </soapenv:Body>\n" +
		"</soapenv:Envelope>";

	http_options = {
		hostname: bp_hostname,
		port: 8181,
		path: '/ws/'+processName,
		method: 'POST',
		headers: {
			'Authorization': "Basic " + new Buffer(bp_user + ":" + bp_pwd).toString("base64"),
			'Content-Type': 'text/xml',
			'SOAPAction': '',
			'Content-Length': soap_xml.length
		}
	}
}
module.exports.makeAsyncRequestForBP = function makeAsyncRequestForBP(){
	soap_req = http.request(http_options, (res) => {
		console.log(`STATUS: ${res.statusCode}`);
		console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
		res.setEncoding('utf8');
		res.on('data', (chunk) => {
			console.log(`BODY: ${chunk}`);
			//conv.ask(chunk);
			//makeResponseRequestForGoogle(chunk);
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
