Retrieve bookings
#b2b

https://api.worldota.net/api/b2b/v3/hotel/order/info/

The call gets the order data of the successfully finished booking.

It is recommended that there should be a time gap between:

Receiving the booking confirmation.
Requesting the order information.
Request example 
curl --user '<KEY_ID>:<API_KEY>' 'https://api.worldota.net/api/b2b/v3/hotel/order/info/' \
--header 'Content-Type: application/json' \
--data '{
  "ordering": {
    "ordering_type": "desc",
    "ordering_by": "created_at"
  },
  "pagination": {
    "page_size": "3",
    "page_number": "1"
  }, 
  "search": {
    "created_at": {
      "from_date": "2018-12-05T00:00"
    }
  },
  "language": "en"
}'

Request body 
Expand this
|
Collapse this
 language String optional
The language.

The possible values:

ar — Arabic.
bg — Bulgarian.
cs — Czech.
ordering Object required
The response sorting options.

 ordering_type String required
The sorting type.

The possible values:
asc—ascending sorting.
desc—descending sorting.
 ordering_by String required
The name of the order field by which sorting is made.

The possible values:
cancelled_at.
checkin_at.
checkout_at.
created_at.
free_cancellation_before.
modified_at.
payment_due.
payment_pending.
 pagination Object required
The response pagination options.

 page_number Int required
The bookings’ page number to receive.

The minimum value is 1.
 page_size Int required
The number of bookings per page to receive.

The minimum value is 1.
The maximum value is 50.
 search Object optional
The response search options.

 cancelled_at Object optional
The date and time of the order cancellation.

 from_date String optional
The option to search greater than or equal to the value.
 to_date String optional
The option to search less than or equal to the value.
 checkin_at Object optional
The date and time of the order check-in.

 from_date String optional
The value to search for the value greater than or equal to.
 to_date String optional
The value to search for the value less than or equal to.
 checkout_at Object optional
The date and time of the order check-out.

 from_date String optional
The value to search for the value greater than or equal to.
 to_date String optional
The value to search for the value less than or equal to.
 created_at Object optional
The date and time of the order group creation.

 from_date String optional
The option to search greater than or equal to the value.
 to_date String optional
The option to search less than or equal to the value.
 free_cancellation_before Object optional
The date and time of the order free cancellation.

 from_date String optional
The option to search greater than or equal to the value.
 to_date String optional
The option to search less than or equal to the value.
 order_ids [Int] optional
The list of order IDs created by the ETG.
 partner_order_ids [String] optional
The list of external order IDs.
 status String required
The booking finishing status.

The possible values:
cancelled.
completed.
failed.
noshow.
rejected.
 modified_at Object optional
The date and time of the order update.

 from_date String optional
The option to search greater than or equal to the value.
 to_date String optional
The option to search less than or equal to the value.
 paid_at Object optional
The date and time of the order group payment.

 from_date String optional
The value to search for the value greater than or equal to.
 to_date String optional
The value to search for the value less than or equal to.
 payment_due Object optional
The maximum date and time of the needed payment.

 from_date String optional
The value to search for the value greater than or equal to.
 to_date String optional
The value to search for the value less than or equal to.
 payment_pending Object optional
The minimum date and time of the needed payment.

 from_date String optional
The value to search for the value greater than or equal to.
 to_date String optional
The value to search for the value less than or equal to.
 source String optional
The type of the web source where the booking has been made.

The possible values:
b2b-site — a site.
b2b-api — an API service.
b2b-card — a site.
b2b-handmade — the ETG staff member source.
b2b-mobile-app-andr—an Android mobile application.
b2b-mobile-app-ios—an iOS mobile application.

Response 
Expand this
|
Collapse this
 current_page_number Int
The current page number out of the received bookings’ page number.
 total_orders Int
The total number of all your bookings.
 total_pages Int
The total bookings’ page number received by the request.
 found_orders Int
The order number received by the request.
 found_pages Int
The bookings’ page number received by the request.
 orders Object
The bookings’ information.

 agreement_number String
The Midoffice agreement number.
 amount_payable Object
The completed order amount. Or the cancellation fee of the canceled order which isn’t free of charge.

 amount String
The amount of the completed order or the cancellation fee.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL

amount_payable_vat Object
The completed order VAT amount. Or the cancellation fee of the canceled order which isn’t free of charge.

 amount String
The completed order VAT amount or the cancellation fee amount.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.

 amount_refunded Object
The cancelled order refunded amount.

 amount String
The cancelled order refunded amount.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.

 amount_sell Object
The booking amount.

 amount String
The booking amount.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.
 amount_sell_b2b2c Object
The resale price for the user.

 amount String
The resale price.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
api_auth_key_id Int
The API key ID.
 cancelled_at String
The date and time of the booking cancellation.
 checkin_at String
The date of the check-in at the hotel.
 checkout_at String
The date of the check-out from the hotel.
 contract_slug String
The ETG contract slug.
 created_at String
The date and time of the booking finishing.
 hotel_data Object
The information on the booked hotel.

 id String
The unique hotel ID in the legacy string format.

Either this field or the hid field is required.
 hid Int
The unique hotel ID in the new numeric format.

Each ID is an integer no longer than 10 digits.
We are gradually migrating all clients to use this format.
 order_id String
The hotel internal order confirmation.
 is_cancellable Boolean
Whether the order is cancellable or not.
 modified_at String
The date and time of the booking last update.
 nights Int
The number of nights of stay.
 order_id Int
The order ID created by the ETG.

The minimum value is 1.
 order_type String
The order type.

The possible values:
hotel.
upsell.
 roomnights Int
The total number of nights of stay for all rooms.
 rooms_data [Object]
The guests’ information for the rooms.

 bedding_name [String]
The bed type list.

To get all available bed types and their definitions, use the bedding field from the Retrieve hotel static data call.

 guest_data String
 adults_number Int
The number of adults in the room.
 children_number Int
The number of children in the room.
 guests [Object]
The guests’ information.

 first_name String
The guest first name.

It is mandatory to provide the first name for at least one guest in each booked room.
The minimum length is 1 character.
The maximum length is 50 characters.
Digits and non-word symbols are prohibited, field should contain only unicode letters (Latin, Cyrillic, Hebrew, Hindi, Bengali, Thai etc.), spaces or following special characters: '-,.’.
 first_name_original String
The guest first name in the original language sent in the booking request.
 last_name String
The guest last name. For test purposes use the Ratehawk value.

It is mandatory to provide the last name for at least one guest in each booked room.
The minimum length is 1 character.
The maximum length is 50 characters.
Digits and non-word symbols are prohibited, field should contain only unicode letters (Latin, Cyrillic, Hebrew, Hindi, Bengali, Thai etc.), spaces or following special characters: '-,.’.
 last_name_original String
The guest last name in the original language sent in the booking request.
 is_child Boolean
Whether the guest is a child or not.

Guests are considered adults unless is_child = true, even if their age is that of a child.
 age Int
The child age in years.

Specify the child’s age if there are children in the booking request (is_child = true).
The minimum value is 0.
The maximum value is 17.
 meal_name String
The meal type in the rate.

To get all available meal types and their definitions, use the meals field from the Retrieve hotel static data call.

Has the nomeal value if no meal type is provided.

 has_breakfast Boolean
Whether breakfast is included to the rate or not.
 no_child_meal Boolean
Whether the children meal is absent in the rate or not.
 room_idx Int
The room ID.
 room_name String
The room name.
 source String
The type of the web source where the booking has been made.

The possible values:
b2b-site — a site.
b2b-api — an API service.
b2b-card — a site.
b2b-handmade — the ETG staff member source.
b2b-mobile-app-andr—an Android mobile application.
b2b-mobile-app-ios—an iOS mobile application.
 status String
The booking finishing status.

The possible values:
cancelled.
completed.
failed.
noshow.
rejected.
 supplier_data Object
The supplier booking information.

 confirmation_id String
The confirmation ID.
 name String
The booking supplier name.
 order_id String
The supplier unique booking ID.
 taxes [Object]
The taxes list.

 amount_tax Object
The tax amount.

 amount String
The tax amount in the currency specified by the currency_code field.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.
AMD.

 is_included Boolean
Whether the tax is included by the supplier or not.

When it has:

The false value, the tax is supposed to be paid at the hotel in this object currency.
The true value, the tax is included in the price.
 name String
The ETG tax ID.

To get all available tax IDs and their definitions, use the taxes field from the Retrieve hotel static data call.

 total_vat Object
The completed order VAT amount. Or the VAT cancellation fee of the canceled order which isn’t free of charge.

 amount String
The completed order VAT amount or the cancellation fee amount.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.
AMD.


included Boolean
Indicator of whether VAT is included in the order total.

Possible values:

true — the total amount already includes VAT;
false — VAT is charged in addition to the order total.
 is_package Boolean
Rates marked with is_package = true should be sold as a part of package, and the price for the hotel should not be shown separately.
 partner_data String
The partner booking information.

 order_comment String
The partner booking internal comment.

The comment isn’t sent to the hotel and not processed by the ETG API support team. It is visible only to the partner itself.

The minimum length is 1 character.
The maximum length is 256 character.
 order_id Int
The order ID created by the ETG.

The minimum value is 1.
 amount_payable_with_upsells Object
The completed order with upsell amount. Or the cancellation fee of the canceled order which isn’t free of charge.

 amount String
The amount of the completed order with upsell or the cancellation fee.
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

 cancellation_info Object
The booking cancellation information.

 free_cancellation_before String
The date and time when the free cancellation policy expires.

Has the null value, if there is no free cancellation.

The timezone is in UTC±0.

 policies String
The cancellation policies’ breakdown by periods.

 end_at String
The date and time when this cancellation policy expires.

Has the null value, if this cancellation policy takes effect from the start_at field value till the check-in date.

If the start_at and end_at fields have the null value, this cancellation policy:

Has no time restrictions.
Takes effect all the time.
The timezone is in UTC±0.

 penalty String
The penalty information.

 amount String
The penalty amount.
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

 amount_info Object
The cancellation information.

Has the null value if the commission type has the net or gross value.

Has the object value if you:

Have a net commission model.
Have indicated a non-zero commission in your account.
 amount_commission String
The commission amount.
 amount_gross String
The gross amount.
 amount_net String
The net amount.
 start_at String
The date and time when this cancellation policy takes effect.

Has the null value, if this cancellation policy takes effect till the end_at field value.

The timezone is in UTC±0.

 invoice_id String
The order group ID.

The minimum length is 1 character.
 is_checked Boolean
Whether the booking is additionally checked with the hotel by the support team or not.
 meta_data Object
The booking additional information.

 voucher_order_comment String
The API support team comment added upon the partner request.

For example, information on early check-in or late check-out.

The minimum length is 1 character.
 payment_data Object
The order payment information.

 payment_type String
The order payment type.

The possible values:

now.
deposit.
 invoice_id Int
The order group ID.
 invoice_id_v2 String
The order group ID v2.
 paid_at String
The date of the payment for the booking.
 payment_by String
The information on the person who has paid for the booking.
 payment_due String
The deadline date after which the booking payment becomes overdue. In case it hasn’t been received yet.
 payment_pending String
The date from which the ETG:

Begins to wait for the payment.
Will notify you with an email that the payment is pending.
 upsells [Object]
The order upsells’ information.

Only one early check-in and one late check-out can be requested and selected.
 amount_payable Object
The completed order with upsell amount. Or the cancellation fee of the canceled order which isn’t free of charge.

 amount String
The amount of the completed order with upsell or the cancellation fee.
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


amount_payable_vat Object
The completed order upsell VAT amount. Or the cancellation fee of the canceled order which isn’t free of charge.

 amount String
The completed order upsell VAT amount or the cancellation fee amount.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.
AMD.
ANG.


amount_refunded Object
The cancelled order upsell refunded amount.

 amount String
The cancelled order upsell refunded amount.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.

 amount_sell Object
The upsell amount.

 amount String
The upsell amount.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.


 amount_sell_b2b2c Object
The upsell resale price for the user.

 amount String
The upsell resale price.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.


cancelled_at String
The date and time of the order upsell cancellation.
 created_at String
The date and time of the order upsell completion.
 free_cancellation_before String
The date and time before which the order upsell cancellation is free of charge.
 info Object
The order upsell information.
 order_id Int
The order upsell ID.

The minimum value is 1.
 order_type String
The order upsell type.

The possible values:
additional_service.
complimentary.
dubai_expo_2020_month.
dubai_expo_2020_one_day.
early_checkin.
extra_bed.
hotel_facilities.
insurance.
late_checkout.
meal_upgrade.
name_change.
room_service.
room_upgrade.
taxes_and_fees.
visa_support.
 payment_data Object
The order payment information.

 invoice_id Int
The order group ID.
 invoice_id_v2 String
The order group ID v2.
 paid_at String
The date of the payment for the upsell.
 payment_by String
The information on the person who has paid for the upsell.
 payment_due String
The deadline date after which the upsell payment becomes overdue. In case it hasn’t been received yet.
 payment_pending String
The date from which the ETG:

Begins to wait for the payment.
Will notify you with an email that the payment is pending.
 payment_type String
The upsell payment type.

The possible values:

now.
hotel.
deposit.
 status String
The upsell status.

The possible values:
awaiting_confirmation.
cancelled.
completed.
noshow.
recalled.
 type String
The upsell type.

The possible values:
additional_service.
complimentary.
dubai_expo_2020_month.
dubai_expo_2020_one_day.
early_checkin.
extra_bed.
hotel_facilities.
insurance.
late_checkout.
meal_upgrade.
name_change.
room_service.
room_upgrade.
taxes_and_fees.
visa_support.
 has_tickets Boolean
Whether the booking has tickets (additional requests) or not.
 user_data Object
The information on the user who has created the booking.

 email String
The user email address.
 arrival_datetime String
The date and time at which the user plans to check into the hotel.
 user_comment String
The comment the user wrote when was filling out the booking form.
 amount_sell_b2b2c_commission Object
The commission information from reselling the ETG rate. Works in a pair with the amount_sell_b2b2c field from the Start booking process call.

Has the null value if there is no setting. To discuss a change, contact the API support team.

 amount String
The commission amount.
 currency_code String
The amount currency code in the ISO 4217 format.

The length is 3 characters.
The possible values:
AED.
AFN.
ALL.
AMD.


Response example 

{
  "data": {
    "current_page_number": 1,
    "total_orders": 869,
    "total_pages": 290,
    "found_orders": 549,
    "found_pages": 183,
    "orders": [
      {
        "agreement_number": null,
        "amount_payable": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "amount_payable_vat": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "amount_refunded": {
          "amount": "411.20",
          "currency_code": "EUR"
        },
        "amount_sell": {
          "amount": "411.20",
          "currency_code": "EUR"
        },
        "amount_sell_b2b2c": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "api_auth_key_id": 1234,
        "cancelled_at": "2025-09-18T12:38:00",
        "checkin_at": "2025-12-25",
        "checkout_at": "2025-12-26",
        "contract_slug": "only.look.no.book",
        "created_at": "2025-09-18T08:09:04",
        "hotel_data": {
          "id": "test_hotel",
          "hid": 8526976,
          "order_id": null
        },
        "is_cancellable": false,
        "modified_at": "2025-09-18T12:38:01",
        "nights": 1,
        "order_id": 260453787,
        "order_type": "hotel",
        "roomnights": 1,
        "rooms_data": [
          {
            "bedding_name": [
              "sofa-bed"
            ],
            "guest_data": {
              "adults_number": 2,
              "children_number": 0,
              "guests": [
                {
                  "first_name": "Marty",
                  "first_name_original": "Marty",
                  "last_name": "Quatro",
                  "last_name_original": "Quatro",
                  "is_child": false,
                  "age": null
                },
                {
                  "first_name": "Marta",
                  "first_name_original": "Marta",
                  "last_name": "Quatro",
                  "last_name_original": "Quatro",
                  "is_child": false,
                  "age": null
                }
              ]
            },
            "meal_name": "half-board-lunch",
            "has_breakfast": true,
            "no_child_meal": false,
            "room_idx": 0,
            "room_name": "Quadruple Junior Suite (+ sofa, treatment program included, kitchen)"
          }
        ],
        "source": "b2b-api",
        "status": "cancelled",
        "supplier_data": {
          "confirmation_id": "361911424",
          "name": "Extranet",
          "order_id": "361911424"
        },
        "taxes": [
          {
            "amount_tax": {
              "amount": "0.41",
              "currency_code": "EUR"
            },
            "is_included": true,
            "name": "city_tax"
          },
          {
            "amount_tax": {
              "amount": "2000.00",
              "currency_code": "EUR"
            },
            "is_included": false,
            "name": "cleaning_fee"
          },
          {
            "amount_tax": {
              "amount": "3.06",
              "currency_code": "EUR"
            },
            "is_included": true,
            "name": "hotel_fee"
          },
          {
            "amount_tax": {
              "amount": "5000.00",
              "currency_code": "EUR"
            },
            "is_included": false,
            "name": "luxury_tax"
          },
          {
            "amount_tax": {
              "amount": "40.00",
              "currency_code": "EUR"
            },
            "is_included": false,
            "name": "resort_fee"
          },
          {
            "amount_tax": {
              "amount": "22.00",
              "currency_code": "EUR"
            },
            "is_included": false,
            "name": "service_fee"
          },
          {
            "amount_tax": {
              "amount": "11.00",
              "currency_code": "EUR"
            },
            "is_included": false,
            "name": "vat"
          }
        ],
        "total_vat": {
          "amount": "0.00",
          "currency_code": "EUR",
          "included": false
        },
        "is_package": false,
        "partner_data": {
          "order_comment": "partner_comment",
          "order_id": "tut"
        },
        "amount_payable_with_upsells": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "cancellation_info": {
          "free_cancellation_before": "2025-12-25T05:00:00",
          "policies": [
            {
              "end_at": "2025-12-25T05:00:00",
              "penalty": {
                "amount": "0.00",
                "currency_code": "EUR",
                "amount_info": {
                  "amount_commission": "0.00",
                  "amount_gross": "0.00",
                  "amount_net": "0.00"
                }
              },
              "start_at": null
            },
            {
              "end_at": null,
              "penalty": {
                "amount": "411.20",
                "currency_code": "EUR",
                "amount_info": {
                  "amount_commission": "102.80",
                  "amount_gross": "514.00",
                  "amount_net": "411.20"
                }
              },
              "start_at": "2025-12-25T05:00:00"
            }
          ]
        },
        "invoice_id": null,
        "is_checked": false,
        "meta_data": {
          "voucher_order_comment": null
        },
        "payment_data": {
          "payment_type": "deposit",
          "invoice_id": null,
          "invoice_id_v2": null,
          "paid_at": null,
          "payment_by": null,
          "payment_due": "2026-01-15",
          "payment_pending": "2026-01-12"
        },
        "upsells": [],
        "has_tickets": false,
        "user_data": {
          "email": "asdfds@foo.com",
          "arrival_datetime": null,
          "user_comment": "comment"
        },
        "amount_sell_b2b2c_commission": null
      },
      {
        "agreement_number": null,
        "amount_payable": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "amount_payable_vat": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "amount_refunded": {
          "amount": "30908.00",
          "currency_code": "EUR"
        },
        "amount_sell": {
          "amount": "30908.00",
          "currency_code": "EUR"
        },
        "amount_sell_b2b2c": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "api_auth_key_id": 1234,
        "cancelled_at": "2025-09-16T14:15:45",
        "checkin_at": "2025-09-29",
        "checkout_at": "2025-09-30",
        "contract_slug": "only.look.no.book",
        "created_at": "2025-09-16T14:06:35",
        "hotel_data": {
          "id": "test_hotel_do_not_book",
          "hid": 8473727,
          "order_id": null
        },
        "is_cancellable": false,
        "modified_at": "2025-09-16T14:15:46",
        "nights": 1,
        "order_id": 246069602,
        "order_type": "hotel",
        "roomnights": 2,
        "rooms_data": [
          {
            "bedding_name": [
              "double"
            ],
            "guest_data": {
              "adults_number": 1,
              "children_number": 0,
              "guests": [
                {
                  "first_name": "Mikhail",
                  "first_name_original": "Mikhail",
                  "last_name": "Rudenko",
                  "last_name_original": "Rudenko",
                  "is_child": false,
                  "age": null
                }
              ]
            },
            "meal_name": "nomeal",
            "has_breakfast": false,
            "no_child_meal": true,
            "room_idx": 0,
            "room_name": "Standard Double room (shared bathroom) (full double bed)"
          },
          {
            "bedding_name": [
              "double"
            ],
            "guest_data": {
              "adults_number": 1,
              "children_number": 0,
              "guests": [
                {
                  "first_name": "Alan",
                  "first_name_original": "Alan",
                  "last_name": "Tashev",
                  "last_name_original": "Tashev",
                  "is_child": false,
                  "age": null
                }
              ]
            },
            "meal_name": "nomeal",
            "has_breakfast": false,
            "no_child_meal": true,
            "room_idx": 1,
            "room_name": "Standard Double room (shared bathroom) (full double bed)"
          }
        ],
        "source": "b2b-api",
        "status": "cancelled",
        "supplier_data": {
          "confirmation_id": "853713014",
          "name": "Extranet",
          "order_id": "853713014"
        },
        "taxes": [
          {
            "amount_tax": {
              "amount": "781.92",
              "currency_code": "HNL"
            },
            "is_included": false,
            "name": "city_tax"
          },
          {
            "amount_tax": {
              "amount": "9.20",
              "currency_code": "EUR"
            },
            "is_included": true,
            "name": "electricity_fee"
          },
          {
            "amount_tax": {
              "amount": "2015.08",
              "currency_code": "HNL"
            },
            "is_included": false,
            "name": "service_fee"
          },
          {
            "amount_tax": {
              "amount": "705.46",
              "currency_code": "HNL"
            },
            "is_included": false,
            "name": "vat"
          }
        ],
        "total_vat": {
          "amount": "0.00",
          "currency_code": "EUR",
          "included": false
        },
        "is_package": false,
        "partner_data": {
          "order_comment": "Tryin p-hash.",
          "order_id": "52multi_book52"
        },
        "amount_payable_with_upsells": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "cancellation_info": {
          "free_cancellation_before": "2025-09-29T06:00:00",
          "policies": [
            {
              "end_at": "2025-09-29T06:00:00",
              "penalty": {
                "amount": "0.00",
                "currency_code": "EUR",
                "amount_info": {
                  "amount_commission": "0.00",
                  "amount_gross": "0.00",
                  "amount_net": "0.00"
                }
              },
              "start_at": null
            },
            {
              "end_at": null,
              "penalty": {
                "amount": "30908.00",
                "currency_code": "EUR",
                "amount_info": {
                  "amount_commission": "7727.00",
                  "amount_gross": "38635.00",
                  "amount_net": "30908.00"
                }
              },
              "start_at": "2025-09-29T06:00:00"
            }
          ]
        },
        "invoice_id": null,
        "is_checked": false,
        "meta_data": {
          "voucher_order_comment": null
        },
        "payment_data": {
          "payment_type": "deposit",
          "invoice_id": null,
          "invoice_id_v2": null,
          "paid_at": null,
          "payment_by": null,
          "payment_due": "2025-11-06",
          "payment_pending": "2025-10-31"
        },
        "upsells": [],
        "has_tickets": false,
        "user_data": {
          "email": "mikhail.rudenko@emergingtravel.com",
          "arrival_datetime": null,
          "user_comment": null
        },
        "amount_sell_b2b2c_commission": null
      },
      {
        "agreement_number": null,
        "amount_payable": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "amount_payable_vat": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "amount_refunded": {
          "amount": "30887.20",
          "currency_code": "EUR"
        },
        "amount_sell": {
          "amount": "30887.20",
          "currency_code": "EUR"
        },
        "amount_sell_b2b2c": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "api_auth_key_id": 1234,
        "cancelled_at": "2025-09-15T18:24:41",
        "checkin_at": "2025-09-29",
        "checkout_at": "2025-09-30",
        "contract_slug": "only.look.no.book",
        "created_at": "2025-09-15T18:21:50",
        "hotel_data": {
          "id": "test_hotel_do_not_book",
          "hid": 8473727,
          "order_id": null
        },
        "is_cancellable": false,
        "modified_at": "2025-09-15T18:24:42",
        "nights": 1,
        "order_id": 395221637,
        "order_type": "hotel",
        "roomnights": 2,
        "rooms_data": [
          {
            "bedding_name": [
              "double"
            ],
            "guest_data": {
              "adults_number": 1,
              "children_number": 0,
              "guests": [
                {
                  "first_name": "Mikhail",
                  "first_name_original": "Mikhail",
                  "last_name": "Rudenko",
                  "last_name_original": "Rudenko",
                  "is_child": false,
                  "age": null
                }
              ]
            },
            "meal_name": "nomeal",
            "has_breakfast": false,
            "no_child_meal": true,
            "room_idx": 0,
            "room_name": "Standard Double room (shared bathroom) (full double bed)"
          },
          {
            "bedding_name": [
              "double"
            ],
            "guest_data": {
              "adults_number": 1,
              "children_number": 0,
              "guests": [
                {
                  "first_name": "Alan",
                  "first_name_original": "Alan",
                  "last_name": "Tashev",
                  "last_name_original": "Tashev",
                  "is_child": false,
                  "age": null
                }
              ]
            },
            "meal_name": "nomeal",
            "has_breakfast": false,
            "no_child_meal": true,
            "room_idx": 1,
            "room_name": "Standard Double room (shared bathroom) (full double bed)"
          }
        ],
        "source": "b2b-api",
        "status": "cancelled",
        "supplier_data": {
          "confirmation_id": "261499472",
          "name": "Extranet",
          "order_id": "261499472"
        },
        "taxes": [
          {
            "amount_tax": {
              "amount": "781.92",
              "currency_code": "HNL"
            },
            "is_included": false,
            "name": "city_tax"
          },
          {
            "amount_tax": {
              "amount": "9.26",
              "currency_code": "EUR"
            },
            "is_included": true,
            "name": "electricity_fee"
          },
          {
            "amount_tax": {
              "amount": "2015.08",
              "currency_code": "HNL"
            },
            "is_included": false,
            "name": "service_fee"
          },
          {
            "amount_tax": {
              "amount": "705.46",
              "currency_code": "HNL"
            },
            "is_included": false,
            "name": "vat"
          }
        ],
        "total_vat": {
          "amount": "0.00",
          "currency_code": "EUR",
          "included": false
        },
        "is_package": false,
        "partner_data": {
          "order_comment": "Tryin p-hash.",
          "order_id": "52multibook52_test52"
        },
        "amount_payable_with_upsells": {
          "amount": "0.00",
          "currency_code": "EUR"
        },
        "cancellation_info": {
          "free_cancellation_before": "2025-09-29T06:00:00",
          "policies": [
            {
              "end_at": "2025-09-29T06:00:00",
              "penalty": {
                "amount": "0.00",
                "currency_code": "EUR",
                "amount_info": {
                  "amount_commission": "0.00",
                  "amount_gross": "0.00",
                  "amount_net": "0.00"
                }
              },
              "start_at": null
            },
            {
              "end_at": null,
              "penalty": {
                "amount": "30887.20",
                "currency_code": "EUR",
                "amount_info": {
                  "amount_commission": "7721.80",
                  "amount_gross": "38609.00",
                  "amount_net": "30887.20"
                }
              },
              "start_at": "2025-09-29T06:00:00"
            }
          ]
        },
        "invoice_id": null,
        "is_checked": false,
        "meta_data": {
          "voucher_order_comment": null
        },
        "payment_data": {
          "payment_type": "deposit",
          "invoice_id": null,
          "invoice_id_v2": null,
          "paid_at": null,
          "payment_by": null,
          "payment_due": "2025-11-06",
          "payment_pending": "2025-10-31"
        },
        "upsells": [],
        "has_tickets": false,
        "user_data": {
          "email": "mikhail.rudenko@emergingtravel.com",
          "arrival_datetime": null,
          "user_comment": null
        },
        "amount_sell_b2b2c_commission": null
      }
    ]
  },
  "debug": {
    "api_endpoint": {
      "endpoint": "api/b2b/v3/hotel/order/info",
      "is_active": true,
      "is_limited": true,
      "remaining": 29,
      "requests_number": 30,
      "reset": "2025-09-24T21:55:00",
      "seconds_number": 60
    },
    "request": {
      "ordering": {
        "ordering_type": "desc",
        "ordering_by": "created_at"
      },
      "pagination": {
        "page_size": "3",
        "page_number": "1"
      },
      "search": {
        "created_at": {
          "from_date": "2018-12-05T00:00"
        }
      },
      "language": "en"
    },
    "method": "POST",
    "real_ip": "2a09:bac0:1000:623::388:9b",
    "request_id": "75438e77fd5bb04f01b7876cc21980bb",
    "key_id": 1234,
    "api_key_id": 1234,
    "utcnow": "2025-09-24T21:54:26.442209"
  },
  "status": "ok",
  "error": null
}

