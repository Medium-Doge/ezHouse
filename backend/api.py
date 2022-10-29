from typing import Union
import requests
import mysql.connector
from cache import Cache

class APIConnector():
    """
    APIConnector abstract parent class. For a new API service, create a class that inherits from APIConnector, and override the
    call() method.
    """
    def __init__(self, api_key=None, url=None):
        self._API_KEY = api_key
        self._url = url

    def call():
        """
        Abstract method meant to be inherited and implemented by child classes. 
        """
        raise NotImplementedError("The call() method is not implemented.")

class OneMapSearch(APIConnector):
    def __init__(self):
        super().__init__(url="https://developers.onemap.sg/commonapi/search?searchVal={}&returnGeom=Y&getAddrDetails=Y")

    def call(self, postal_code:Union[int, str]):
        """
        Args:
            postal_code (int or str) : postal code of HDB block
            request (str) : Has to be either of these options ("latlon", ...)
        """
        data = requests.get(
            self._url.format(postal_code)
            ).json()

        return data

class HDBImageSearch(APIConnector):
    """
    Uses Custom Google Search Engine API 
    """
    def __init__(self, api_key, cx):
        super().__init__(api_key=api_key, url="https://www.googleapis.com/customsearch/v1?key={}&cx={}&q=Singapore%20{}")
        self.__cx = cx
        self.__blacklist = [
            "placeholder.png",
            "certified-purple.png",
            "icon-hdb.png"
        ]
        # self.__url = "https://www.googleapis.com/customsearch/v1?key={}&cx={}&q=Singapore%20{}"
    
    def call(self, postal_code:str) -> Union[dict, None]:
        url = self._url.format(
                self._API_KEY, self.__cx, postal_code
            )

        data = requests.get(url).json()

        for x in self.__blacklist:
            if x in data["items"][0]["pagemap"]["cse_image"][0]["src"]:
                return None

        try:
            return data["items"][0]["pagemap"]["cse_image"][0]["src"]
        except:
            return None

class AmenitiesSearch(APIConnector):
    def __init__(self, api_key):
        super().__init__(
            api_key=api_key,
            url="https://maps.googleapis.com/maps/api/place/nearbysearch/json?type={type}&location={location}&radius={radius}&key={api_key}"
        )
        self.__types = {
            "food"      : ["restaurant"], 
            "transport" : ["subway_station"], 
            "leisure"   : ["shopping_mall"],
            # "education" : ["primary_school", "secondary_school", "university"]
            "education" : ["primary_school", "secondary_school"]
        }
        self.__radius = 1000 # radius to search for places (in metres)
        self.__max_results = 2 # maximum results to return from subcategories (see self.__types)
        self.__image_url = "https://maps.googleapis.com/maps/api/place/photo?maxwidth={width}&photo_reference={image_ref}&key={api_key}"

        self.__cache = Cache("amenities")

    def call(self, coord:list) -> dict:
        """
        Args:
            coord (list) : [<latitude>,<longitude>]
        
        """
        data = {
            "found"     : True,
            "results"   : list()
            # "food"      : [],
            # "transport" : [],
            # "leisure"   : [],
            # "education" : []
        }

        for key, value in self.__types.items():
            for type_ in value:
                url = self._url.format(
                    type = type_,
                    location = ",".join(coord),
                    radius = self.__radius,
                    api_key = self._API_KEY
                )
                temp = requests.get(url).json()

                if temp["status"] == "OK":
                    count = 0

                    for result in temp["results"]:
                        if self.__cache.exists(result["photos"][0]["photo_reference"]):
                            image == self.__cache.get(result["photos"][0]["photo_reference"])
                            print("Amenities image retrieved in cache")

                        else:
                            try:
                                image = requests.get(self.__image_url.format(
                                            width = 400,
                                            image_ref = result["photos"][0]["photo_reference"],
                                            api_key = self._API_KEY)).url
                            except KeyError: # image could not be found
                                image = None
                            finally:
                                self.__cache.add(result["photos"][0]["photo_reference"], image)
                                print("Amenities image added to cache")

                        self.__cache.save("amenities")

                        data["results"].append({
                            "name"      : result["name"] if type_ != "subway_station" else "{} MRT".format(result["name"]),
                            "location"  :   {
                                            "lat" : result["geometry"]["location"]["lat"],
                                            "lon" : result["geometry"]["location"]["lng"]
                                            },
                            "image"     : image,
                            "category"  : key,
                            "address"   : result["vicinity"]
                        })

                        count += 1

                        if count == self.__max_results:
                            break

        return data

class ezHouseDatabase(APIConnector):
    def __init__(self, api_key=None):
        super().__init__(api_key=api_key)
        self.__host = "localhost"
        self.__database = "ezHouse"
        self.__username = "flask"
        self.__password = "password123"
        self.__roles = ["buyer", "seller"]

    def getRoles(self):
        return self.__roles

    def __connect(self):
        """
        ONLY to be used in other methods.

        Returns a connection object.
        """
        return mysql.connector.connect(
            host = self.__host,
            database = self.__database,
            user = self.__username,
            password = self.__password
        )
    
    def append(self, username, password, role=None):
        """
        Adds new entry to the users database.
        """
        ezHouseDB_connection = self.__connect()
        
        cursor = ezHouseDB_connection.cursor()
        cursor.execute("INSERT INTO users (username, password, role) VALUES (%s,%s,%s)", 
            (username, password, str(role))
        )

        ezHouseDB_connection.commit()
        cursor.close()
        ezHouseDB_connection.close()

    def validUsername(self, username:str):
        """
        Checks if username already exists in the database.

        Returns True if valid, False if invalid.
        """
        ezHouseDB_connection = self.__connect()

        cursor = ezHouseDB_connection.cursor()
        cursor.execute("SELECT username FROM users")
        values = tuple(cursor)
        cursor.close()
        ezHouseDB_connection.close()

        for v in values:
            if username in v:
                return True

        return False

    def validAccount(self, username, password):
        """
        Checks if given username and password matches username and password stored in the database.
        """
        #  SELECT username FROM users WHERE username = 'jenseanfoo' AND password = 'password123';
        ezHouseDB_connection = self.__connect()

        cursor = ezHouseDB_connection.cursor()
        cursor.execute("SELECT username FROM users WHERE username = %s AND password = %s", 
            (username, password)
            )

        values = tuple(cursor)
        cursor.close()
        ezHouseDB_connection.close()

        for v in values:
            if username in v:
                return True
            
        return False