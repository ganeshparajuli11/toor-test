Check booking process
#b2b

https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/status/

This call is required if you don’t use the Receive booking status webhook call.
As the booking process is made asynchronously, repeatedly request this call to know the status.
The call checks the booking process status.

Usage scenarios 
The only possible call requesting scenarios:

General. No need for you to make additional steps except for receiving the final status.
3D Secure check. Needs you to make additional steps.
3D Secure check 
The scenario is required to be completed if the rate you are booking has the payment_types field with the now value.
To complete the scenario, make the following steps:

Request this call and receive the check details.
Make the 3D Secure check request.
After the 3D Secure check is completed, the payment gateway will redirect the user to the URL passed in the return_path field value of the Start booking process call.
Request this call again and receive the final status.
3D Secure check details 
If the issuing bank supports 3D Secure cards, as the response to this call you will get:

The status field with the 3ds value.
The special data in data.data_3ds field.
The response example:

{
  "data": {
    "data_3ds": {
      "action_url": "https://example.com/ACS/auth/start.do",
      "data": {
        "MD": "94cf25b2-aa6d-4204-83e4-acf036d263f6",
        "PaReq": "eJxVkt1ygjAQhV/F4R7zIwI6azptqa2dAR0L0+s0RKAV0ADVvn0TC33833+zObs5G7g5l/vRp1RNUVcLi4yxNZKVqNOiyhZWEi9t37phEOdKyuBFik5JBqFsGp6JUZEurBl358xfpLbvSWw7U05sHzvU3hGyS92Z8DyfWww2t1t5ZNA3YrrPmAIaUCsqkfOqZcDF8W4VMYd6LsaAeoRSqlXACJ04U9fzAf0wVLyUTPFW5vz0AeiCIOquatUXc20JoAGgU3uWt+1hjtBwYSzqEpA5APQ3waYzUaOFzkXKwvfwHMXZaR08kHWQOGH8cIqC5BTGyQKQqYBUyzGKKcYOpiPszbEzx1NAlzzw0kzACJmYXE9wME1ur47+p0AbrfQehkcMBPJ8qCupK7R7vzGgv3nvn4yHotXuLPPZIY2ecbeLGlI8bulbkh2zzRZvXvfG2UuRUSy0P5Rg9yJpAJCRQf3SUL9vHV39g287E7qa",
        "TermUrl": "https://example.com/rebpayment/rest/finish3ds.do?ret_path=finish"
      },
      "method": "post"
    },
    "partner_order_id": "asd123",
    "percent": 66
  },
  "debug": null,
  "error": null,
  "status": "3ds"
}

3D Secure check request 
Send the request with received data for the 3D Secure check:

Via the GET method if the data.data_3ds.method field has the get value.
Or via the POST method if the data.data_3ds.method field has the post value.
The request example:

curl -d '{"PaReq":"eJxVkt1ygjAQhV/F4R7zIwI6azptqa2dAR0L0+s0RKAV0ADVvn0TC33833+zObs5G7g5l/vRp1RNUVcLi4yxNZKVqNOiyhZWEi9t37phEOdKyuBFik5JBqFsGp6JUZEurBl358xfpLbvSWw7U05sHzvU3hGyS92Z8DyfWww2t1t5ZNA3YrrPmAIaUCsqkfOqZcDF8W4VMYd6LsaAeoRSqlXACJ04U9fzAf0wVLyUTPFW5vz0AeiCIOquatUXc20JoAGgU3uWt+1hjtBwYSzqEpA5APQ3waYzUaOFzkXKwvfwHMXZaR08kHWQOGH8cIqC5BTGyQKQqYBUyzGKKcYOpiPszbEzx1NAlzzw0kzACJmYXE9wME1ur47+p0AbrfQehkcMBPJ8qCupK7R7vzGgv3nvn4yHotXuLPPZIY2ecbeLGlI8bulbkh2zzRZvXvfG2UuRUSy0P5Rg9yJpAJCRQf3SUL9vHV39g287E7qa","termurl":"https://example.com/rebpayment/rest/finish3ds.do?ret_path=finish","MD":"94cf25b2-aa6d-4204-83e4-acf036d263f6}"' https://example.com/ACS/auth/start.do

Result interpretation 
The result is described in the status response field. The possible values:

ok — the booking finishing has ended with success.
processing — the booking finishing is in progress. Request the status change every second until you get the ok or error value.
3ds — the booking finishing needs to complete the 3D Secure check.
error — the booking finishing has ended with an error.
Don’t forget that you might have the timeout, unknown, and 5xx error.
Retry logic 
During the maximum booking time request this call any time you like. The recommended time is once per 5 seconds.

Always send a final status request at the last second before the booking timeout, even if you check every 5 seconds. This reduces the risk of missing the correct status, especially with short timeouts.
Request example 
curl --user '<KEY_ID>:<API_KEY>' 'https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/status/' \
--header 'Content-Type: application/json' \
--data '{
  "partner_order_id": "0b370500-5321-4046-92c5-5982f1a64fc6"
}'

Request body 
Expand this
|
Collapse this
 partner_order_id String required
Response 
Expand this
|
Collapse this
 data_3ds Object
 partner_order_id String
 percent Int
deprecated
Response example 
{
  "data": {
    "data_3ds": null,
    "partner_order_id": "0b370500-5321-4046-92c5-5982f1a64fc6",
    "percent": 100
  },
  "debug": null,
  "error": null,
  "status": "ok"
}

Errors 
The error field has the value specified in the headers below.

block 
The card funds can’t be frozen (blocked) for the booking payment.

charge 
The card funds can’t be withdrawn for the booking payment due to:

A failed freeze.
Another reason.
3ds 
The MD field value is invalid.

soldout 
The rate is no longer available as its rooms are sold out.

book_limit 
The cut-off logic limit for the booking finishing is reached.

not_allowed 
There is no permission to use this call for this contract:

Contact the API support team.
Tell the user the booking error has occurred.
When contacting the API support team, provide at least:

The hotel name where the booking is in process.
The order_id field with the value from the Create booking process call.
The user and rooms fields with the values from the Start booking process call.
This information will help to identify the request attempt.

provider 
A technical error at the rate provider side.

order_not_found 
The order with the partner_order_id field value isn’t found. Try to change the value.

booking_finish_did_not_succeed 
An attempt to request this call without a successful response from the Start booking process call.

timeout, unknown, and 5xx 
An internal error. Continue to request this call until you get the following response:

The status field has the ok value.
The error field has one of the values:
3ds.
block.
book_limit.
booking_finish_did_not_succeed.
charge.
decoding_json.
endpoint_exceeded_limit.
endpoint_not_active.
endpoint_not_found.
incorrect_credentials.
invalid_auth_header.
invalid_params.
lock.
no_auth_header.
not_allowed.
not_allowed_host.
order_not_found.
overdue_debt.
provider.
soldout.
unexpected_method.

Receive booking status webhook
#b2b

This call is required if you don’t use the Check booking process call.
The call retrieves a webhook for the booking process status via the POST method.

Getting webhook scenario 
Provide the callback URL to the API support team.
The API support team sets up the callback URL.
Once the callback URL is set and the booking process is finished, the ETG API sends the webhook.
Check if the webhook is received on your side and send the appropriate response.
At the last second, request this call for the last time and receive the status:

completed — the booking finishing will end with success.
failed — the booking finishing will end with an error.
Your server responses 
The ETG listens to the following codes from your server and reacts accordingly:

Code 200 — the webhook is received successfully and doesn’t need a retry.
Code 500 — the ETG needs to retry sending for 7.5 minutes with the intervals:
30 seconds.
60 seconds.
90 seconds.
120 seconds.
150 seconds.
Payload 
Expand this
|
Collapse this
 partner_order_id String required
 status String required
The payload example:

{
  "partner_order_id": "0b370500-5321-4046-92c5-5982f1a64fc6",
  "status": "completed"
}

Secure data 
Expand this
|
Collapse this
 signature String required
 timestamp Int required
 token String required
The secure data example:

{
  "signature": {
    "signature": "7865d225dbee1b54909er153d193e0b57b707ebe81ff5b2e1b71ebaf749bec23",
    "timestamp": 1574146939,
    "token": "d3395025-1ee7-49a2-bd86-e4bd6b9908b2"
  }
}

Whole fields example 
{
  "data": {
    "partner_order_id": "0b370500-5321-4046-92c5-5982f1a64fc6",
    "status": "completed"
  },
  "signature": {
    "signature": "7865d225dbee1b54909er153d193e0b57b707ebe81ff5b2e1b71ebaf749bec23",
    "timestamp": 1574146939,
    "token": "d3395025-1ee7-49a2-bd86-e4bd6b9908b2"
  }
}

Signature verification 
To verify the webhook issued by the ETG:

Concatenate the timestamp and token values. The “token” means the one sent by the ETG in the webhook data.
Encode the resulting string with the HMAC algorithm:
Use your API Key token as a key.
Use the SHA256 digest mode.
Use the hexdigest() method to make a resulting string.
Compare the resulting string to the signature.
Optional. Cache the token locally and don’t honor any subsequent request with the same token. This will prevent replay attacks.
Optional. Check that the timestamp is within the token lifetime.
Examples 
Python 
import hashlib, hmac
def verify(api_key, token, timestamp, signature):
    hmac_digest = hmac.new(key=api_key,
                           msg='{}{}'.format(timestamp, token),
                           digestmod=hashlib.sha256).hexdigest()
    return hmac.compare_digest(unicode(signature), unicode(hmac_digest))

Ruby 
require 'openssl'
def verify(api_key, token, timestamp, signature)
  digest = OpenSSL::Digest::SHA256.new
  data = [timestamp, token].join
  signature == OpenSSL::HMAC.hexdigest(digest, api_key, data)
end

PHP 
function verify($apiKey, $token, $timestamp, $signature)
{
  // check if the timestamp is fresh
  if (abs(time() - $timestamp) > 15) {
    return false;
  }
  // returns true if signature is valid
  return hash_hmac('sha256', $timestamp . $token, $apiKey) === $signature;
}

Node.js 
const crypto = require('crypto')
const verify = ({ apiKey, timestamp, token, signature }) => {
    const encodedToken = crypto
        .createHmac('sha256', apiKey)
        .update(timestamp.toString().concat(token))
        .digest('hex')
    return (encodedToken === signature)
}