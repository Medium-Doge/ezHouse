from typing import Union
import requests

class APIConnector():
    """
    APIConnector parent class. For a new API service, create a class that inherits from APIConnector, and override the
    call() method.
    """
    def __init__(self, api_key=None):
        self._API_KEY = api_key

    def call():
        """
        Abstract method meant to be inherited and implemented by child classes. 
        """
        raise NotImplementedError("The call() method is not implemented.")

class OneMapSearch(APIConnector):
    def __init__(self):
        super().__init__()
        self.__url = "https://developers.onemap.sg/commonapi/search?searchVal={}&returnGeom=Y&getAddrDetails=Y"

    def call(self, postal_code:Union[int, str]):
        """
        Args:
            postal_code (int or str) : postal code of HDB block
            request (str) : Has to be either of these options ("latlon", ...)
        """
        data = requests.get(
            self.__url.format(postal_code)
            ).json()

        return data

class HDBImageSearch(APIConnector):
    """
    Uses Custom Google Search Engine API 
    """
    def __init__(self, api_key, cx):
        super().__init__(api_key)
        self.__cx = cx
        self.__url = "https://www.googleapis.com/customsearch/v1?key={}&cx={}&q=Singapore%20{}"
    
    def call(self, postal_code:Union[str, int]) -> Union[dict, None]:
        url = self.__url.format(
                self._API_KEY, self.__cx, postal_code
            )

        data = requests.get(url).json()

        try:
            return data["items"][0]["pagemap"]["cse_image"][0]["src"]
        except:
            return None

class AmenitiesSearch(APIConnector):
    def __init__(self, api_key):
        super().__init__(api_key)
        self.__types = {
            "food"      : ["restaurant"], 
            "transport" : ["subway_station"], 
            "leisure"   : ["shopping_mall"],
            "education" : ["primary_school", "secondary_school", "university"]
        }
        self.__radius = 1000 # radius to search for places (in metres)
        self.__max_results = 2 # maximum results to return from subcategories (see self.__types)
        self.__url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?type={type}&location={location}&radius={radius}&key={api_key}"
        self.__image_url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth={width}&photo_reference={image_ref}&key={api_key}"

    def call(self, coord:list) -> dict:
        """
        Args:
            coord (list) : [<latitude>,<longitude>]
        
        """
        data = {
            "found"     : True,
            "food"      : [],
            "transport" : [],
            "leisure"   : [],
            "education" : []
        }

        for key, value in self.__types.items():
            for type_ in value:
                url = self.__url.format(
                    type = type_,
                    location = ",".join(coord),
                    radius = self.__radius,
                    api_key = self._API_KEY
                )
                temp = requests.get(url).json()

                if temp["status"] == "OK":
                    count = 0

                    for result in temp["results"]:
                        try:
                            image = requests.get(self.__image_url.format(
                                        width = 400,
                                        image_ref = result["photos"][0]["photo_reference"],
                                        api_key = self._API_KEY)).url
                        except KeyError: # image could not be found
                            image = None

                        data[key].append({
                            "name"      : result["name"],
                            "location"  :   {
                                            "lat" : result["geometry"]["location"]["lat"],
                                            "lon" : result["geometry"]["location"]["lng"]
                                            },
                            "image"     : image
                        })

                        count += 1

                        if count == self.__max_results:
                            break

                else:
                    data[key] = None

        return data