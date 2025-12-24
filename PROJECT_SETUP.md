Create booking process
#affiliate

https://api.worldota.net/api/b2b/v3/hotel/order/booking/form/

This call is required.
Request this call right after the calls:
Retrieve hotelpage.
Prebook rate from hotelpage step.
Prebook rate from search step.
After requesting this call, you must send the Start booking process request.
The call creates a booking process. The booking process includes several stages. Their number depends on whether there are 3D Secure and fraud checks.

The limitations:

The booking form lifetime is 60 minutes.
All bookings for the test hotel (use hid = 8473727or id = test_hotel_do_not_book) will be real with all financial responsibilities. Nevertheless, giveaway prices are available within their rates for testing purposes.
All test bookings must be canceled.
Request example 
curl --user '<KEY_ID>:<API_KEY>' 'https://api.worldota.net/api/b2b/v3/hotel/order/booking/form/' \
--header 'Content-Type: application/json' \
--data '{
    "partner_order_id": "asd12399235",
    "book_hash": "h-372e7fa4-3a85-5a09-9f14-867766abf26c",
    "language": "en",
    "user_ip": "82.29.0.86"
}'

Request body 
Expand this
|
Collapse this
 partner_order_id String required
The external booking ID in the UUID format.

The ID remains the same if you cancel a booking that:

Is successful.
Is failed.
Has the fail status response from the Check booking process call.
Use this field value for the rest of the booking calls.

The value should be unique for the order within the same contact.
The minimum length is 3 character.
The maximum length is 256 characters.
 book_hash String required
The unique rate ID used to identify the selected rate.

Use the value of the book_hash field from one of the calls:

Prebook rate from hotelpage step.
Prebook rate from search step.
 language String required
The language.

The possible values:

ar — Arabic.
bg — Bulgarian.
cs — Czech.
da — Danish.
de — German.
el — Greek.
en — English.
es — Spanish.
fi — Finnish.
fr — French.
he — Hebrew.
hu — Hungarian.
it — Italian.
ja — Japanese.
kk — Kazakh.
ko — Korean.
nl — Dutch.
no — Norwegian Bokmål.
pl — Polish.
pt — Portuguese.
pt_PT — European Portuguese.
ro — Romanian.
ru — Russian.
sq — Albanian.
sr — Serbian.
sv — Swedish.
th — Thai.
tr — Turkish.
uk — Ukrainian.
vi — Vietnamese.
zh_CN — Simplified Chinese.
zh_TW — Traditional Chinese.
 user_ip String required
The end user IP address.

Will be used for credit card processing if you use payment type now.

Response 
Expand this
|
Collapse this
 order_id Int
The order ID created by the ETG.

The minimum value is 1.
 partner_order_id String
The external booking ID in the UUID format.

The ID remains the same if you cancel a booking that:

Is successful.
Is failed.
Has the fail status response from the Check booking process call.
Use this field value for the rest of the booking calls.

The value should be unique for the order within the same contact.
The minimum length is 3 character.
The maximum length is 256 characters.
 item_id Int
The order item ID.

Use this field value in the Create credit card token call to allow the user pay with a bank card.

 is_gender_specification_required Boolean
Whether the guests’ gender is required by the hotel or not.
 upsell_data [Object]
The order upsell information.

Set these parameters only when the user really needs additional services.
Only one early check-in and one late check-out should be requested and selected.
 charge_price Object
The upsell price information.

 amount String
The upsell amount in the currency specified by the currency_code field.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.
AMD.
ANG.
AOA.
ARS.
AUD.
AWG.
AZN.
BAM.
BBD.
BDT.
BGN.
BHD.
BIF.
BMD.
BND.
BOB.
BOV.
BRL.
BSD.
BTN.
BWP.
BYR.
BYN.
BZD.
CAD.
CDF.
CHE.
CHF.
CHW.
CLF.
CLP.
CNY.
COP.
COU.
CRC.
CUC.
CUP.
CVE.
CZK.
DJF.
DKK.
DOP.
DZD.
EGP.
ERN.
ETB.
EUR.
FJD.
FKP.
GBP.
GEL.
GHS.
GIP.
GMD.
GNF.
GTQ.
GYD.
HKD.
HNL.
HRK.
HTG.
HUF.
IDR.
ILS.
INR.
IQD.
IRR.
ISK.
JMD.
JOD.
JPY.
KES.
KGS.
KHR.
KMF.
KPW.
KRW.
KWD.
KYD.
KZT.
LAK.
LBP.
LKR.
LRD.
LSL.
LTL.
LVL.
LYD.
MAD.
MDL.
MGA.
MKD.
MMK.
MNT.
MOP.
MRO.
MUR.
MVR.
MWK.
MXN.
MXV.
MYR.
MZN.
NAD.
NGN.
NIO.
NOK.
NPR.
NZD.
OMR.
PAB.
PEN.
PGK.
PHP.
PKR.
PLN.
PYG.
QAR.
RON.
RSD.
RUB.
RWF.
SAR.
SBD.
SCR.
SDG.
SEK.
SGD.
SHP.
SLL.
SOS.
SRD.
SSP.
STD.
SVC.
SYP.
SZL.
THB.
TJS.
TMT.
TND.
TOP.
TRY.
TTD.
TWD.
TZS.
UAH.
UGX.
USD.
USN.
USS.
UYI.
UYU.
UZS.
VEF.
VND.
VUV.
WST.
XAF.
XAG.
XAU.
XBA.
XBB.
XBC.
XBD.
XCD.
XDR.
XFU.
XOF.
XPD.
XPF.
XPT.
XSU.
XTS.
XUA.
YER.
ZAR.
ZMW.
ZWL.
 name String
The upsell name.

The possible values:
early_checkin.
late_checkout.
 rule_id Int
The upsell rule ID.
 uid String
The upsell ID.
 data Object
The upsell time. The local time in the HH:MM:SS format.
 payment_types [Object]
The order payment information.

 amount String
The booking amount in the currency specified by the currency_code field.
 currency_code String
The amount currency code. Is the same as the charged (contract) currency code.

If the payment_types is hotel, the hotel currency_code will be used here.
 is_need_credit_card_data Boolean
Whether the credit card information is needed or not.
 is_need_cvc Boolean
Whether the CVC is needed or not.
 recommended_price String
This parameter is currently under development and will be available later. It can be ignored at the moment.
The price below which the rate can’t be sold on B2C website.

 amount String
The deposit amount in the currency specified by the currency_code field.
 currency_code String
The deposit amount currency code. Is the same as the charged (hotel) currency code.
 show_amount String
The rate price in the request currency code of this object show_currency_code field value.

Isn’t necessarily the sum in the charged or payment currency code.

 show_currency_code String
The request currency code.

Isn’t necessarily in the charged or payment currency code.

 type String
The payment type.

The possible values:
now. Use it to allow the user to pay for the booking via the ETG payment system:
Request the Create booking process call and get the card details.
Request the Create credit card token call with the card details.
hotel. Use it to allow the user to pay for the booking upon check-in at the hotel. The user won’t be charged now.
Response example 
{
    "data": {
        "order_id": 559350847,
        "partner_order_id": "asd12399235",
        "item_id": 128903852,
        "payment_types": [
            {
                "amount": "2000.00",
                "currency_code": "RUB",
                "is_need_credit_card_data": false,
                "is_need_cvc": false,
                "type": "hotel",
                "recommended_price": null
            }
        ],
        "is_gender_specification_required": false,
        "upsell_data": []
    },
    "debug": {
        "api_endpoint": {
            "endpoint": "api/b2b/v3/hotel/order/booking/form",
            "is_active": true,
            "is_limited": true,
            "remaining": 29,
            "requests_number": 30,
            "reset": "2025-10-21T12:22:00",
            "seconds_number": 60
        },
        "request": {
            "partner_order_id": "asd12399235",
            "book_hash": "h-372e7fa4-3a85-5a09-9f14-867766abf26c",
            "language": "en",
            "user_ip": "82.29.0.86"
        },
        "method": "POST",
        "real_ip": "104.30.161.77",
        "request_id": "26f502336760ea6e5a71ed6beae781f5",
        "key_id": 1234,
        "api_key_id": 1234,
        "utcnow": "2025-10-21T12:21:01.572537"
    },
    "status": "ok",
    "error": null
}

Errors 
The error field has the value specified in the headers below.

contract_mismatch 
An attempt to make the booking with a rate found with the different contract.

double_booking_form 
An attempt to make a new booking with the partner_order_id that is already used for the API key contract and isn’t completed yet.

Make another request with a new partner_order_id.

duplicate_reservation 
An attempt to make a new booking with the partner_order_id that is already used for the API key contract and is already completed with a successful or error status.

Make another request with a new partner_order_id.

hotel_not_found 
The hotel isn’t found.

reservation_is_not_allowed 
There is no permission to use this call for this contract. Contact your account manager.

rate_not_found 
The rate with the book_hash field value isn’t found.
The book_hash field value has expired.
Send another search request and change the book_hash field value.

sandbox_restriction 
An attempt to book the real hotel in the test environment.

To book the real hotel, use the production environment.
To book the test hotel, use the test environment.
timeout, unknown, and 5xx 
If you get errors timeout, unknown, or the 5xx status code from this call:

Make another request with a new partner_order_id.
The number of calls should be limited to 10.
If you get this error more than 10 times in a row, the issue is probably in automatically changed settings of your contract. Contact your account manager to resolve the issue. Otherwise, the ETG has temporary technical issues.



Create credit card token
#affiliate

https://api.payota.net/api/public/v1/manage/init_partners

The call is required for bookings where the is_need_credit_card_data field was passed with the true value.
The call creates and returns a credit card token for the order payment. The PCI DSS standard guarantees safe and secure processing.

Request example 
curl --user '<KEY_ID>:<API_KEY>' 'https://api.payota.net/api/public/v1/manage/init_partners' \
--header 'Content-Type: application/json' \
--data '{
  "object_id": "32165487",
  "pay_uuid": "797870e3-e1f0-470a-87b3-38694f58bed1",
  "init_uuid": "c44ef1ba-595b-437f-ad14-74ce39a0f9ad",
  "user_last_name": "LastName",
  "cvc": "123",
  "is_cvc_required": true,
  "credit_card_data_core": {
    "year": "18",
    "card_number": "4111111111111111",
    "card_holder": "TEST",
    "month": "01"
  },
  "user_first_name": "Name"
}'

Request body 
Expand this
|
Collapse this
 object_id String required
The booking order ID.

You can find this value of the item_id field in the response to the Create booking process call.

The minimum length is `1` character.
The maximum length is `20` characters.
 pay_uuid String required
The external booking payment ID in the UUID format.

The length is 36 characters.
Must be unique for every payment. Otherwise, the ETG will return an error.
The value matches the pattern: ^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$.
 init_uuid String required
The external booking token ID in the UUID format.

The length is 36 characters.
Must be unique for every payment. Otherwise, the ETG will return an error.
The value matches the pattern: ^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$.
 user_first_name String required
The guest first name.

The minimum length is 1 character.
 user_last_name String required
The guest last name.

The minimum length is 1 character.
 cvc String optional
The CVC.

The length is 3 characters.
 is_cvc_required Boolean required
Whether the CVC is required or not.
 credit_card_data_core Object required
The credit card information.

 year String required
The valid thru year.

The length is 2 characters.
 card_number String required
The credit card number without spaces.

The minimum length is 13 characters.
The maximum length is 19 characters.
 card_holder String required
The cardholder name.

The minimum length is 1 character.
 month String required
The valid thru month.

The length is 2 characters.
Response example 
{
  "status": "ok"
}

Errors 
The error field has the value specified in the headers below.

body_error 
The passed JSON isn’t valid.

validation_error 
Not all required field values are passed.

invalid_pay_uuid 
The invalid_pay_uuid field value doesn’t match the pattern.

invalid_init_uuid 
The invalid_init_uuid field value doesn’t match the pattern.

invalid_month 
The month is invalid. Try a different one.

invalid_year 
The year is invalid. Try a different one.

invalid_cvc 
The credit card data is invalid. Try a different one.

invalid_card_number 
The credit card data is invalid. Try a different one.

invalid_card_holder 
The cardholder name is invalid. Try a different one.

invalid_is_cvc_required 
The is_cvc_required field value is required.

luhn_algorithm_error 
The credit card number hasn’t passed the Luhn algorithm check.


Start booking process
#affiliate

https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/

This call is required.
Request this call right after the Create booking process call.
As the booking process is made asynchronously, repeatedly request the Check booking process call to know the status.
The call starts the booking process.

If invalid user data is used, the data may be added to the stop list.
Request example 
curl --user '<KEY_ID>:<API_KEY>' 'https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/' \
--header 'Content-Type: application/json' \
--data '{
  "user": {
    "email": "john.smith@example.com",
    "comment": "The user comment.",
    "phone": "12124567899"
  },
  "supplier_data": {
    "first_name_original": "Peter",
    "last_name_original": "Collins",
    "phone": "12124567880",
    "email": "peter.collins@example.com"
  },
  "partner": {
    "partner_order_id": "0b370500-5321-4046-92c5-5982f1a64fc6",
    "comment": "The partner comment.",
    "amount_sell_b2b2c": "10"
  },
  "language": "en",
  "rooms": [
    {
      "guests": [
        {
          "first_name": "Martin",
          "last_name": "Smith"
        },
        {
          "first_name": "Eliot",
          "last_name": "Smith"
        }
      ]
    }
  ],
  "payment_type": {
    "type": "deposit",
    "amount": "9",
    "currency_code": "EUR"
  },
  "return_path": "https://example.com"
}'

Request body 
Expand this
|
Collapse this
 arrival_datetime DateTime optional
The estimated arrival time to the hotel.
 book_timeout Int optional
The booking timeout in seconds.

The minimum value is 10.
The maximum value is 600.
 language String required
The language.

The possible values:

ar — Arabic.
bg — Bulgarian.
cs — Czech.
da — Danish.
de — German.
el — Greek.
en — English.
es — Spanish.
fi — Finnish.
fr — French.
he — Hebrew.
hu — Hungarian.
it — Italian.
ja — Japanese.
kk — Kazakh.
ko — Korean.
nl — Dutch.
no — Norwegian Bokmål.
pl — Polish.
pt — Portuguese.
pt_PT — European Portuguese.
ro — Romanian.
ru — Russian.
sq — Albanian.
sr — Serbian.
sv — Swedish.
th — Thai.
tr — Turkish.
uk — Ukrainian.
vi — Vietnamese.
zh_CN — Simplified Chinese.
zh_TW — Traditional Chinese.
 payment_type Object required
The order payment information.

 type String required
The payment type.

The possible values:
now. Use it to allow the user to pay for the booking via the ETG payment system:
Request the Create booking process call and get the card details.
Request the Create credit card token call with the card details.
hotel. Use it to allow the user to pay for the booking upon check-in at the hotel. The user won’t be charged now.
 amount String required
The booking amount in the currency specified by the currency_code field.
 currency_code String required
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.
AMD.
ANG.
AOA.
ARS.
AUD.
AWG.
AZN.
BAM.
BBD.
BDT.
BGN.
BHD.
BIF.
BMD.
BND.
BOB.
BOV.
BRL.
BSD.
BTN.
BWP.
BYR.
BYN.
BZD.
CAD.
CDF.
CHE.
CHF.
CHW.
CLF.
CLP.
CNY.
COP.
COU.
CRC.
CUC.
CUP.
CVE.
CZK.
DJF.
DKK.
DOP.
DZD.
EGP.
ERN.
ETB.
EUR.
FJD.
FKP.
GBP.
GEL.
GHS.
GIP.
GMD.
GNF.
GTQ.
GYD.
HKD.
HNL.
HRK.
HTG.
HUF.
IDR.
ILS.
INR.
IQD.
IRR.
ISK.
JMD.
JOD.
JPY.
KES.
KGS.
KHR.
KMF.
KPW.
KRW.
KWD.
KYD.
KZT.
LAK.
LBP.
LKR.
LRD.
LSL.
LTL.
LVL.
LYD.
MAD.
MDL.
MGA.
MKD.
MMK.
MNT.
MOP.
MRO.
MUR.
MVR.
MWK.
MXN.
MXV.
MYR.
MZN.
NAD.
NGN.
NIO.
NOK.
NPR.
NZD.
OMR.
PAB.
PEN.
PGK.
PHP.
PKR.
PLN.
PYG.
QAR.
RON.
RSD.
RUB.
RWF.
SAR.
SBD.
SCR.
SDG.
SEK.
SGD.
SHP.
SLL.
SOS.
SRD.
SSP.
STD.
SVC.
SYP.
SZL.
THB.
TJS.
TMT.
TND.
TOP.
TRY.
TTD.
TWD.
TZS.
UAH.
UGX.
USD.
USN.
USS.
UYI.
UYU.
UZS.
VEF.
VND.
VUV.
WST.
XAF.
XAG.
XAU.
XBA.
XBB.
XBC.
XBD.
XCD.
XDR.
XFU.
XOF.
XPD.
XPF.
XPT.
XSU.
XTS.
XUA.
YER.
ZAR.
ZMW.
ZWL.
 init_uuid String optional
The external booking token ID in the UUID format.

The length is 36 characters.
Must be unique for every payment. Otherwise, the ETG will return an error.
The value matches the pattern: ^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$.
Is required for bookings where the is_need_credit_card_data field was passed with the true value.
Should be the same with the init_uuid field value from the Create credit card token) call.
 pay_uuid String optional
The external booking payment ID in the UUID format.

The length is 36 characters.
Must be unique for every payment. Otherwise, the ETG will return an error.
The value matches the pattern: ^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$.
Is required for bookings where the is_need_credit_card_data field was passed with the true value.
Should be the same with the pay_uuid field value from the Create credit card token) call.
 return_path String optional
The URL at your side to redirect the user to. It is done by the payment gateway after 3D Secure check. The reason the ETG needs it.

This field is required if the rate you are booking has the payment_types field with the now value.

The field data_3ds of the Check booking process call will have the null value if:

You don’t pass this field.
The issuing bank requires 3D Secure check.
Must have the HTTPS scheme.
Might have GET parameters.
The minimum length is 1 character.
The maximum length is 256 character.
 rooms [Object] required
The guests’ information for the rooms.

 guests Object required
The guests’ information.

 first_name String optional
The guest first name.

It is mandatory to provide the first name for at least one guest in each booked room.
The minimum length is 1 character.
The maximum length is 50 characters.
Digits and non-word symbols are prohibited, field should contain only unicode letters (Latin, Cyrillic, Hebrew, Hindi, Bengali, Thai etc.), spaces or following special characters: '-,.’.
 last_name String optional
The guest last name. For test purposes use the Ratehawk value.

It is mandatory to provide the last name for at least one guest in each booked room.
The minimum length is 1 character.
The maximum length is 50 characters.
Digits and non-word symbols are prohibited, field should contain only unicode letters (Latin, Cyrillic, Hebrew, Hindi, Bengali, Thai etc.), spaces or following special characters: '-,.’.
 is_child Boolean required or optional
Whether the guest is a child or not.

Guests are considered adults unless is_child = true, even if their age is that of a child.
 age Int required or optional
The child age in years.

Specify the child’s age if there are children in the booking request (is_child = true).
The minimum value is 0.
The maximum value is 17.
 gender String optional
The guest gender.

Is required if the hotel you intend to book has the is_gender_specification_required field with the true value. The field appears only in the Retrieve hotel content call response.
The possible values:
male.
female.
unknown.
 user Object required
The guest additional information.

 comment String optional
The guest comments sent to the hotel.
 email String required
The guest email address for contacting purposes. The email address must be valid.
 phone String required
The guest phone number for contacting purposes. The phone number must be valid.

The minimum length is 5 characters.
The maximum length is 35 characters.
 supplier_data Object required or optional
The contact details of the user who initiated the booking.

To know if the field is required for you, contact your account manager.
 first_name_original String required
The first name of the user who initiated the booking.

To know if the field is required for you, contact your account manager.
 last_name_original String required
The last name of the user who initiated the booking.

To know if the field is required for you, contact your account manager.
 email String required
The email address of the user who initiated the booking.

To know if the field is required for you, contact your account manager.
 phone String required
The phone number of the user who initiated the booking.

To know if the field is required for you, contact your account manager.
The minimum length is 5 characters.
The maximum length is 35 characters.
 partner Object required
The partner information.

 partner_order_id String required
The external booking ID in the UUID format.

The ID remains the same if you cancel a booking that:

Is successful.
Is failed.
Has the fail status response from the Check booking process call.
Use this field value for the rest of the booking calls.

The value should be unique for the order within the same contact.
The minimum length is 3 character.
The maximum length is 256 characters.
 comment String optional
The partner booking internal comment.

The comment isn’t sent to the hotel and not processed by the ETG API support team. It is visible only to the partner itself.

The minimum length is 1 character.
The maximum length is 256 character.
 amount_sell_b2b2c String optional
The resale price for the user in the contract currency.

The value is accepted if transferred (even if automatic completion of the resale price value is activated) and is displayed in the confirmatory accounting documents for the partners.

The minimum value is 1.
Response example 
{
  "data": null,
  "debug": null,
  "error": null,
  "status": "ok"
}

Errors 
The error field has the value specified in the headers below.

book_hash_not_found 
A rare internal error when the ETG couldn’t recognize the book_hash used in the booking.

After getting the error, the only option is to find another rate and continue with it.

booking_form_expired 
In case Create booking process has been expired.

Request a new Create booking process with a different partner_order_id.

chosen_payment_type_was_not_available_on_booking_form 
The payment_type field values don’t match any of the payment_types field values in the response of the Create booking process call.

Try to change the payment_type field value according to the payment_types field values in the response.

double_booking_finish 
An attempt to finish the booking for the second time while the status of the first attempt isn’t an error.

email 
The provided email address isn’t valid.

incorrect_chosen_payment_type 
The type field value is incorrect.

incorrect_guests_number 
The adult guest number doesn’t match the adult guest number in the request of the Retrieve hotelpage call.

Try to change the rooms field item number according to the guests field values in the request.

The total number of adults derived from rooms[].guests[] does not match the search query. Any guest without is_child = true is treated as an adult (the age field alone does not mark a guest as a child).

incorrect_children_data 
The children guest number doesn’t match the children guest number in the request of the Retrieve hotelpage call.
The children age is incorrect.
Try to change:

The rooms field item number according to the guests field values in the request.
The age field value.
incorrect_rooms_number 
The room number doesn’t match the room number in the request of the Retrieve hotelpage call.

Try to change the rooms field item number according to the guests field values in the request.

insufficient_b2b_balance 
The credit limit is reached. Contact your account manager.

order_not_found 
The order with the partner_order_id field value isn’t found.

Send another booking creation request and change the partner_order_id field value.

rate_not_found 
The rate isn’t found. Send another search request.

return_path_required 
The return_path field is required if the rate you are booking has the payment_types field with the now value.

unauthorized_group_booking 
An attempt to make a request with the conditions:

More than 9 bookings in the same hotel.
More than 9 bookings for the same dates.
In one request.
To make a group booking:

Contact the API support team.
Fill in the group booking form on the site.
invalid_upsell_attributes 
Invalid name and attributes combination in upsell_data field.

invalid_upsell_uid 
Invalid upsell uid in upsell_data field.

arrival_date_differs_from_checkin_date 
The check-in date should be equal to or the day after the check-in date in the request of the Retrieve hotelpage call.

Try to change the checkin_datetime field value according to the checkin field value in the request.

not_enough_credit_card_data 
The init_uuid and pay_uuid fields are required if the rate you are booking has the is_need_credit_card_data field with the true value.

incorrect_init_uuid_format 
The init_uuid field values don’t match the regular expression.

incorrect_pay_uuid_format 
The pay_uuid field values don’t match the regular expression.

sandbox_restriction 
An attempt to book the test hotel with the hid = 6291619 or id = test_hotel_do_not_book in the production environment.

To book the test hotel, use the test environment.

supplier_data_required 
The supplier_data field is required for your integration. Contact your account manager.

timeout, unknown, and 5xx 
If you get the error, it doesn’t necessarily mean the booking isn’t created. These errors may occur because of the ETG services’ timeout. To check the booking finishing, send the Check booking process request.


Check booking process
#affiliate

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
The requests should be sent within the agreed booking timeout.

Receive booking status webhook
#affiliate

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

