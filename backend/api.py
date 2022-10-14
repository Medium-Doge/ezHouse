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