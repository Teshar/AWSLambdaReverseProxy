# AWSLambdaReverseProxy
A tiny AWS Lambda proxy to serve a static website hosted in S3. hosting via Lambda allows for use with ELB, and therefore can use other security features etc


Files larger than x amount will be redirected to an S3 bucket link which will expire after x seconds.
