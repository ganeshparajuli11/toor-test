Booking.com 

<!-- search hotel -->

curl --request GET \
	--url 'https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=man' \
	--header 'x-rapidapi-host: booking-com15.p.rapidapi.com' \
	--header 'x-rapidapi-key: 65a2fb9890msh2f1b3891422bcdap10b421jsndd0c715b3f03'

	results:
	{
  "status": true,
  "message": "Success",
  "timestamp": 1763304329447,
  "data": [
    {
      "dest_id": "929",
      "search_type": "district",
      "country": "United States",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAAoATICZW46A21hbkAASgBQAA==",
      "label": "Manhattan, New York, New York, United States",
      "nr_hotels": 1488,
      "type": "di",
      "image_url": "https://cf.bstatic.com/xdata/images/district/150x150/57691.jpg?k=de3390bd7f9a501b600f4954a39cb97aefe8ea5acaf438d75d689219a94fe981&o=",
      "city_ufi": 20088325,
      "lc": "en",
      "latitude": 40.776115,
      "region": "New York",
      "longitude": -73.970894,
      "dest_type": "district",
      "cc1": "us",
      "city_name": "New York",
      "hotels": 1488,
      "name": "Manhattan"
    },
    {
      "dest_id": "-2437894",
      "search_type": "city",
      "lc": "en",
      "type": "ci",
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/685726.jpg?k=25b602b90c38b13fe9e858b62a9bbd3c773bf459b16e84b26642a8a056c9f524&o=",
      "city_ufi": null,
      "label": "Manila, Metro Manila, Philippines",
      "nr_hotels": 13642,
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAEoATICZW46A21hbkAASgBQAA==",
      "country": "Philippines",
      "name": "Manila",
      "cc1": "ph",
      "hotels": 13642,
      "city_name": "Manila",
      "region": "Metro Manila",
      "longitude": 120.98368,
      "dest_type": "city",
      "latitude": 14.5967655
    },
    {
      "dest_id": "20079942",
      "search_type": "city",
      "lc": "en",
      "label": "Manchester, New Hampshire, United States",
      "nr_hotels": 26,
      "type": "ci",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/980138.jpg?k=13118c0c36fd028243e14cd7fbd70f7e9b0364ef8dfc82e82791d3022aac8bc7&o=",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAIoATICZW46A21hbkAASgBQAA==",
      "country": "United States",
      "cc1": "us",
      "hotels": 26,
      "city_name": "Manchester",
      "name": "Manchester",
      "longitude": -71.4553,
      "region": "New Hampshire",
      "dest_type": "city",
      "latitude": 42.9956
    },
    {
      "dest_id": "-2602512",
      "search_type": "city",
      "latitude": 53.4812,
      "region": "Greater Manchester",
      "dest_type": "city",
      "longitude": -2.23615,
      "name": "Manchester",
      "hotels": 3554,
      "city_name": "Manchester",
      "cc1": "gb",
      "country": "United Kingdom",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAMoATICZW46A21hbkAASgBQAA==",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/976977.jpg?k=8d13c94917fa00569d115c9123c7b5789ad41f7383b6fad32a1bda8e215e8936&o=",
      "type": "ci",
      "nr_hotels": 3554,
      "label": "Manchester, Greater Manchester, United Kingdom",
      "lc": "en"
    },
    {
      "dest_id": "-784833",
      "search_type": "city",
      "name": "Manama",
      "hotels": 348,
      "city_name": "Manama",
      "cc1": "bh",
      "region": "Capital Governorate",
      "dest_type": "city",
      "longitude": 50.58224,
      "latitude": 26.2235,
      "lc": "en",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/654907.jpg?k=ad1646e402771be9a1e984c4a4aea71121a2ae474b4bbc99386ccc0ef04f5c7c&o=",
      "type": "ci",
      "label": "Manama, Capital Governorate, Bahrain",
      "nr_hotels": 348,
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAQoATICZW46A21hbkAASgBQAA==",
      "country": "Bahrain"
    }
  ]
}


<!-- flights  -->
curl --request GET \
	--url 'https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId=BOM.AIRPORT&toId=DEL.AIRPORT&stops=none&pageNo=1&adults=1&children=0%2C17&sort=BEST&cabinClass=ECONOMY&currency_code=AED' \
	--header 'x-rapidapi-host: booking-com15.p.rapidapi.com' \
	--header 'x-rapidapi-key: 65a2fb9890msh2f1b3891422bcdap10b421jsndd0c715b3f03'

result:
{
  "status": true,
  "message": "Success",
  "timestamp": 1763304329447,
  "data": [
    {
      "dest_id": "929",
      "search_type": "district",
      "country": "United States",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAAoATICZW46A21hbkAASgBQAA==",
      "label": "Manhattan, New York, New York, United States",
      "nr_hotels": 1488,
      "type": "di",
      "image_url": "https://cf.bstatic.com/xdata/images/district/150x150/57691.jpg?k=de3390bd7f9a501b600f4954a39cb97aefe8ea5acaf438d75d689219a94fe981&o=",
      "city_ufi": 20088325,
      "lc": "en",
      "latitude": 40.776115,
      "region": "New York",
      "longitude": -73.970894,
      "dest_type": "district",
      "cc1": "us",
      "city_name": "New York",
      "hotels": 1488,
      "name": "Manhattan"
    },
    {
      "dest_id": "-2437894",
      "search_type": "city",
      "lc": "en",
      "type": "ci",
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/685726.jpg?k=25b602b90c38b13fe9e858b62a9bbd3c773bf459b16e84b26642a8a056c9f524&o=",
      "city_ufi": null,
      "label": "Manila, Metro Manila, Philippines",
      "nr_hotels": 13642,
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAEoATICZW46A21hbkAASgBQAA==",
      "country": "Philippines",
      "name": "Manila",
      "cc1": "ph",
      "hotels": 13642,
      "city_name": "Manila",
      "region": "Metro Manila",
      "longitude": 120.98368,
      "dest_type": "city",
      "latitude": 14.5967655
    },
    {
      "dest_id": "20079942",
      "search_type": "city",
      "lc": "en",
      "label": "Manchester, New Hampshire, United States",
      "nr_hotels": 26,
      "type": "ci",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/980138.jpg?k=13118c0c36fd028243e14cd7fbd70f7e9b0364ef8dfc82e82791d3022aac8bc7&o=",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAIoATICZW46A21hbkAASgBQAA==",
      "country": "United States",
      "cc1": "us",
      "hotels": 26,
      "city_name": "Manchester",
      "name": "Manchester",
      "longitude": -71.4553,
      "region": "New Hampshire",
      "dest_type": "city",
      "latitude": 42.9956
    },
    {
      "dest_id": "-2602512",
      "search_type": "city",
      "latitude": 53.4812,
      "region": "Greater Manchester",
      "dest_type": "city",
      "longitude": -2.23615,
      "name": "Manchester",
      "hotels": 3554,
      "city_name": "Manchester",
      "cc1": "gb",
      "country": "United Kingdom",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAMoATICZW46A21hbkAASgBQAA==",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/976977.jpg?k=8d13c94917fa00569d115c9123c7b5789ad41f7383b6fad32a1bda8e215e8936&o=",
      "type": "ci",
      "nr_hotels": 3554,
      "label": "Manchester, Greater Manchester, United Kingdom",
      "lc": "en"
    },
    {
      "dest_id": "-784833",
      "search_type": "city",
      "name": "Manama",
      "hotels": 348,
      "city_name": "Manama",
      "cc1": "bh",
      "region": "Capital Governorate",
      "dest_type": "city",
      "longitude": 50.58224,
      "latitude": 26.2235,
      "lc": "en",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/654907.jpg?k=ad1646e402771be9a1e984c4a4aea71121a2ae474b4bbc99386ccc0ef04f5c7c&o=",
      "type": "ci",
      "label": "Manama, Capital Governorate, Bahrain",
      "nr_hotels": 348,
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAQoATICZW46A21hbkAASgBQAA==",
      "country": "Bahrain"
    }
  ]
}

<!-- car rentlas -->
curl --request GET \
	--url 'https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals?pick_up_latitude=40.6397018432617&pick_up_longitude=-73.7791976928711&drop_off_latitude=40.6397018432617&drop_off_longitude=-73.7791976928711&pick_up_time=10%3A00&drop_off_time=10%3A00&driver_age=30&currency_code=USD&location=US' \
	--header 'x-rapidapi-host: booking-com15.p.rapidapi.com' \
	--header 'x-rapidapi-key: 65a2fb9890msh2f1b3891422bcdap10b421jsndd0c715b3f03'

reusults:
{
  "status": true,
  "message": "Success",
  "timestamp": 1763304329447,
  "data": [
    {
      "dest_id": "929",
      "search_type": "district",
      "country": "United States",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAAoATICZW46A21hbkAASgBQAA==",
      "label": "Manhattan, New York, New York, United States",
      "nr_hotels": 1488,
      "type": "di",
      "image_url": "https://cf.bstatic.com/xdata/images/district/150x150/57691.jpg?k=de3390bd7f9a501b600f4954a39cb97aefe8ea5acaf438d75d689219a94fe981&o=",
      "city_ufi": 20088325,
      "lc": "en",
      "latitude": 40.776115,
      "region": "New York",
      "longitude": -73.970894,
      "dest_type": "district",
      "cc1": "us",
      "city_name": "New York",
      "hotels": 1488,
      "name": "Manhattan"
    },
    {
      "dest_id": "-2437894",
      "search_type": "city",
      "lc": "en",
      "type": "ci",
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/685726.jpg?k=25b602b90c38b13fe9e858b62a9bbd3c773bf459b16e84b26642a8a056c9f524&o=",
      "city_ufi": null,
      "label": "Manila, Metro Manila, Philippines",
      "nr_hotels": 13642,
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAEoATICZW46A21hbkAASgBQAA==",
      "country": "Philippines",
      "name": "Manila",
      "cc1": "ph",
      "hotels": 13642,
      "city_name": "Manila",
      "region": "Metro Manila",
      "longitude": 120.98368,
      "dest_type": "city",
      "latitude": 14.5967655
    },
    {
      "dest_id": "20079942",
      "search_type": "city",
      "lc": "en",
      "label": "Manchester, New Hampshire, United States",
      "nr_hotels": 26,
      "type": "ci",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/980138.jpg?k=13118c0c36fd028243e14cd7fbd70f7e9b0364ef8dfc82e82791d3022aac8bc7&o=",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAIoATICZW46A21hbkAASgBQAA==",
      "country": "United States",
      "cc1": "us",
      "hotels": 26,
      "city_name": "Manchester",
      "name": "Manchester",
      "longitude": -71.4553,
      "region": "New Hampshire",
      "dest_type": "city",
      "latitude": 42.9956
    },
    {
      "dest_id": "-2602512",
      "search_type": "city",
      "latitude": 53.4812,
      "region": "Greater Manchester",
      "dest_type": "city",
      "longitude": -2.23615,
      "name": "Manchester",
      "hotels": 3554,
      "city_name": "Manchester",
      "cc1": "gb",
      "country": "United Kingdom",
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAMoATICZW46A21hbkAASgBQAA==",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/976977.jpg?k=8d13c94917fa00569d115c9123c7b5789ad41f7383b6fad32a1bda8e215e8936&o=",
      "type": "ci",
      "nr_hotels": 3554,
      "label": "Manchester, Greater Manchester, United Kingdom",
      "lc": "en"
    },
    {
      "dest_id": "-784833",
      "search_type": "city",
      "name": "Manama",
      "hotels": 348,
      "city_name": "Manama",
      "cc1": "bh",
      "region": "Capital Governorate",
      "dest_type": "city",
      "longitude": 50.58224,
      "latitude": 26.2235,
      "lc": "en",
      "city_ufi": null,
      "image_url": "https://cf.bstatic.com/xdata/images/city/150x150/654907.jpg?k=ad1646e402771be9a1e984c4a4aea71121a2ae474b4bbc99386ccc0ef04f5c7c&o=",
      "type": "ci",
      "label": "Manama, Capital Governorate, Bahrain",
      "nr_hotels": 348,
      "roundtrip": "GhA0YzM2NjdjNDk2ZjMwNWFlIAQoATICZW46A21hbkAASgBQAA==",
      "country": "Bahrain"
    }
  ]
}