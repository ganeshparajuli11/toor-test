Retrieve endpoints
https://api.worldota.net/api/b2b/v3/overview/

The call gets the list of the ETG API endpoints to which your API key has permission.

Increasing limits is possible for a live key after separate approval, depending on the expected sales volume. Please contact our API support team for this.
Limits are increased only after certification is completed.
Request example 
curl --user '<KEY_ID>:<API_KEY>' 'https://api.worldota.net/api/b2b/v3/overview/'

Response 
Expand this
|
Collapse this
 endpoint String
 is_active Boolean
 is_debug_mode Boolean
 is_limited Boolean
 requests_number Int
 seconds_number Int
Response example 
{
  "data": [
    {
      "endpoint": "api/b2b/v3/hotel/incremental_reviews/dump/",
      "is_active": true,
      "is_debug_mode": false,
      "is_limited": true,
      "requests_number": 100,
      "seconds_number": 86400
    },
    {
      "endpoint": "api/b2b/v3/general/contract/data/info/",
      "is_active": true,
      "is_debug_mode": false,
      "is_limited": true,
      "requests_number": 30,
      "seconds_number": 60
    },
    {
      "endpoint": "api/b2b/v3/ordergroup/create/",
      "is_active": true,
      "is_debug_mode": false,
      "is_limited": true,
      "requests_number": 30,
      "seconds_number": 60
    },
    {
      "endpoint": "api/b2b/v3/ordergroup/order/add/",
      "is_active": true,
      "is_debug_mode": false,
      "is_limited": true,
      "requests_number": 30,
      "seconds_number": 60
    },
    {
      "endpoint": "api/b2b/v3/ordergroup/order/remove/",
      "is_active": true,
      "is_debug_mode": false,
      "is_limited": true,
      "requests_number": 30,
      "seconds_number": 60
    },
    {
      "endpoint": "api/b2b/v3/ordergroup/disband/",
      "is_active": true,
      "is_debug_mode": false,
      "is_limited": true,
      "requests_number": 30,
      "seconds_number": 60
    },
    {
      "endpoint": "api/b2b/v3/ordergroup/info/",
      "is_active": true,
      "is_debug_mode": false,
      "is_limited": true,
      "requests_number": 30,
      "seconds_number": 60
    }
  ],
  "debug": null,
  "error": null,
  "status": "ok"
}