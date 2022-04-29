'use strict';
 
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const myBucket = process.env.bucket_name;
 
exports.handler = async (event) => {
 
var responseBody = "";
var buildResponseString = "";
 
var base64 = false;
var contentType = "text/html; charset=utf-8";
 
if (event.path!=="") {
console.log(event.path);
 
 
if (event.path === "/")
{
event.path = "index.html";
}
 
if (event.path.charAt(0) === '/')
{
event.path = event.path.substr(1,event.path.length);
}
 
console.log("encoded path: "+event.path);
event.path = decodeURIComponent(event.path);
console.log("decoded path: "+event.path);
 
var params = {
Bucket: myBucket,
Key: event.path,
};
 
var data = await s3.getObject(params).promise();
 
console.log("data: "+ data)
console.log("s3 object length: "+data.ContentLength);
 
if (data.ContentLength > 1023999 )
{
var paramsSigned = {
Bucket: myBucket,
Key: event.path,
Expires: 5 //seconds to expire Signed link
};
var url = s3.getSignedUrl('getObject', paramsSigned);
buildResponseString = buildMovedResponse(url)
return buildResponseString
}
if (event.path.substr(-3) === "png")
{
contentType = "image/png";
base64 = true;
data = encode(data.Body);
buildResponseString = buildResponse(200, data, base64, contentType);
}else if (event.path.substr(-3) === "jpg")
{
contentType = "image/jpeg";
base64 = true;
data = encode(data.Body);
buildResponseString = buildResponse(200, data, base64, contentType);
}
else if (event.path.substr(-3) === "pdf")
{
contentType = "application/pdf";
base64 = true;
data = encode(data.Body);
buildResponseString = buildResponse(200, data, base64, contentType);
}
else if (event.path.substr(-4) === "xlsx")
{
contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
base64 = true;
data = encode(data.Body);
buildResponseString = buildResponse(200, data, base64, contentType);
}
else if (event.path.substr(-4) === "pptx")
{
contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
base64 = true;
data = encode(data.Body);
buildResponseString = buildResponse(200, data, base64, contentType);
}
 
else if (event.path.substr(-3) === "ico")
{
contentType = "image/x-icon";
base64 = true;
data = encode(data.Body);
buildResponseString = buildResponse(200, data, base64, contentType);
}
else if (event.path.substr(-3) === "css")
{
contentType = "text/css; charset=utf-8";
buildResponseString = buildResponse(200, data.Body.toString('utf-8'), base64, contentType);
 
}
else if (event.path.substr(-2) === "js")
{
contentType = "text/javascript; charset=utf-8";
buildResponseString = buildResponse(200, data.Body.toString('utf-8'), base64, contentType);
 
}
else if (event.path.substr(-5) === "woff2" || event.path.substr(-4) === "woff" || event.path.substr(-3) === "ttf")
{
contentType = "binary/octet-stream";
base64 = true;
data = encode(data.Body);
buildResponseString = buildResponse(200, data, base64, contentType);
 
}
 
else
{
buildResponseString = buildResponse(200, data.Body.toString('utf-8'), base64, contentType);
}
 
 
 
return buildResponseString;
}
 
return buildResponse(404, '404 Error', false, "text/html; charset=utf-8");
 
};
 
function buildResponse(statusCode, responseBody, base64, contentType) {
 
console.log("contentType: " + contentType);
console.log("base64:" +base64);
var response = {
"isBase64Encoded": base64,
"statusCode": statusCode,
"headers": {
"Content-Type" : contentType
},
"body": responseBody,
};
 
return response;
}
 
function buildMovedResponse(newURL) {
 
var response = {
"isBase64Encoded": false,
"statusCode": 302,
"statusDescription": "Moved Permanently",
"headers": {
"Location" : newURL,
"X-Reason" : "File>1MB"
},
"body": "",
};
 
return response;
}
 
 
 
function encode(data){
let buf = Buffer.from(data);
let base64 = buf.toString('base64');
return base64;
}
