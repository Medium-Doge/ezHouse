"""
Pre-requisites:
Python 3.9.5
==========================
pip install scikit-learn
pip install pandas
pip install Flask==2.1.2
pip install werkzeug==2.1.2
pip install flask-cors
pip install mysql-connector
"""
# self created libraries
from api import HDBImageSearch, OneMapSearch, AmenitiesSearch, ezHouseDatabase
from cache import Cache
from model import RegressionTreeModel

from flask import Flask, request
from flask_cors import CORS
from expiring_dict import ExpiringDict

GOOGLE_API_KEY = "AIzaSyDi6uFfup3Xhc4Y2azQ-VY-rdvridd22B4"
CX = "57ca1c7140b714b5b"

PLACEHOLDER = "https://s3-ap-southeast-1.amazonaws.com/static.streetsine/Web/Version_4/Assets/project/placeholder.png"

class Server():
    def __init__(self, name):
        """
        Initializes the server.
            - Creates a RegressionTreeModel object
            - Creates a HDBImageSearch API object
            - Creates an Amenities API object
            - Creates a OneMapSearch API object
            - Creates an ezHouseDatabase API object
        """
        print("Initialising Regression Tree Model...")
        self.regression_tree = RegressionTreeModel()
        print("Done.")

        print("Initialising HDBImageSearch API...")
        self.hdb_image_api = HDBImageSearch(GOOGLE_API_KEY, CX)
        print("Done.")

        print("Initialising AmenitiesSearch API...")
        self.amenities_api = AmenitiesSearch(GOOGLE_API_KEY)
        print("Done.")

        print("Initialising OneMapSearch API...")
        self.one_map_api = OneMapSearch()
        print("Done.")

        print("Initialising ezHouseDatabase API...")
        self.ezhouse_db = ezHouseDatabase()
        print("Done.")

        # print("Initialising sessions data...")
        # self.__sessions = ExpiringDict(900)
        # print("Done.")

        self.__cache = Cache("hdb")

        print("Initialising API server...")
        self.app = Flask(name)
        CORS(self.app)
        print("Done.")

        # === START OF FLASK API ROUTES ===
        
        @self.app.route("/hello")
        def __hello_world():
            return self.hello_world()

        @self.app.route("/api/predict", methods=["POST"])
        def __getPrediction():
            data = request.get_json()
            return self.getPrediction(data)

        @self.app.route("/api/recentlysold", methods=["GET"])
        def __getRecentlySold():
            return self.getRecentlySold()

        @self.app.route("/api/categories", methods=["GET"])
        def __getCategories():
            return self.getCategories()

        @self.app.route("/api/image", methods=["POST"])
        def __getImage():
            data = request.get_json(silent=True)
            if data == None:
                return "Body is not JSON type or Request is not POST", 500

            return self.getImage(data)

        @self.app.route("/api/amenities", methods=["GET"])
        def __getAmenities():
            postal_code = request.args.get("postal_code")
            return self.getAmenities(postal_code)

        @self.app.route("/api/soldintown", methods=["POST"])
        def __getSoldInTown():
            data = request.get_json(silent=True)
            if data == None:
                return "Body is not JSON type or Request is not POST", 500
            
            return self.getSoldInTown(data["town"], data["page"])

        # @self.app.route("/api/register", methods=["POST"])
        # def __register():
        #     data = request.get_json(silent=True)
        #     if data == None:
        #         return "Body is not JSON type or Request is not POST", 500

        #     return self.register(data)

        # @self.app.route("/api/login", methods=["POST"])
        # def __login():
        #     data = request.get_json(silent=True)
        #     if data == None:
        #         return "Body is not JSON type or Request is not POST", 500
            
        #     return self.login(data)

        # @self.app.route("/api/validsession", methods=["POST"])
        # def __validSession():
        #     data = request.get_json(silent=True)
        #     if data == None:
        #         return "Body is not JSON type or Request is not POST", 500
            
        #     return self.validSession(data)

        # === END OF FLASK API ROUTES ===
            
    def hello_world(self):
        return {"test": ["Hello", "World"]}

    def getPrediction(self, data:dict):

        # token = data["session"]

        # if token not in self.__sessions:
        #     return {
        #         "found" : False,
        #         "message" : "Session expired or not found."
        #     }

        postal_code = data["postal_code"]
        town = data["town"]
        flat_type = data["flat_type"]
        storey_range = data["storey_range"]

        one_map_data = self.one_map_api.call(postal_code)

        if (one_map_data["found"] == 0 
                or postal_code not in self.regression_tree.getAllPostalCodes()
                or town not in self.regression_tree.getTowns()
                or flat_type not in self.regression_tree.getFlatTypes()
                or storey_range not in self.regression_tree.getStoreyRanges()
            ):
            # Postal code must be found in OneMap API and postal_code, town, flat_type and storey_range must be found
            # hdb_info csv to be considered valid.
            return {
                "found" : False,
                "predicted_price" : None
            }


        # hdb_info = self.regression_tree.hdb_info
        predictors = dict(zip(self.regression_tree.getPredictors(), [0] * len(self.regression_tree.getPredictors())))

        predictors["remaining_lease(months)"] = self.regression_tree.getRemainingLease(postal_code)
    
        predictors["town_{}".format(town.replace(" ",""))] = 1
        predictors["flat_type_{}".format(flat_type.replace(" ",""))] = 1
        predictors["storey_range_{}".format(storey_range.replace(" ",""))] = 1

        house_info = self.regression_tree.getHouseInfo(postal_code)

        if self.__cache.exists(postal_code):
            image = self.__cache.get(postal_code)
        else:
            image = self.hdb_image_api.call(postal_code)
            if image == None: image = PLACEHOLDER
                
            self.__cache.add(postal_code, image)

        self.__cache.save("hdb")

        return {
            "found"                 : True,
            "latitude"              : one_map_data["results"][0]["LATITUDE"],
            "longitude"             : one_map_data["results"][0]["LONGITUDE"],
            "predicted_price"       : self.regression_tree.predict(predictors),
            "blk_no"                : str(house_info["blk_no"]),
            "street"                : house_info["street"],
            "max_floor_lvl"         : int(house_info["max_floor_lvl"]),
            "year_completed"        : str(house_info["year_completed"]),
            "residential"           : house_info["residential"],
            "commercial"            : house_info["commercial"],
            "market_hawker"         : house_info["market_hawker"],
            "miscellaneous"         : house_info["miscellaneous"],
            "multistorey_carpark"   : house_info["multistorey_carpark"],
            "precinct_pavilion"     : house_info["precinct_pavilion"],
            "bldg_contract_town"    : house_info["bldg_contract_town"],
            "total_dwelling_units"  : int(house_info["total_dwelling_units"]),
            "1room_sold"            : int(house_info["1room_sold"]),
            "2room_sold"            : int(house_info["2room_sold"]),
            "3room_sold"            : int(house_info["3room_sold"]),
            "4room_sold"            : int(house_info["4room_sold"]),
            "5room_sold"            : int(house_info["5room_sold"]),
            "exec_sold"             : int(house_info["exec_sold"]),
            "multigen_sold"         : int(house_info["multigen_sold"]),
            "studio_apartment_sold" : int(house_info["studio_apartment_sold"]),
            "1room_rental"          : int(house_info["1room_rental"]),
            "2room_rental"          : int(house_info["2room_rental"]),
            "3room_rental"          : int(house_info["3room_rental"]),
            "other_room_rental"     : int(house_info["other_room_rental"]),
            "address"               : house_info["address"],
            "image"                 : image,
            "history"               : self.regression_tree.getHistory(postal_code)
        }
        
    def getRecentlySold(self) -> dict:
        recent = self.regression_tree.getRecent()

        data = dict()
        for town in recent["town"].unique():
            town_df = recent.loc[recent["town"] == town]
            data[town] = {
                "records"   : town_df.to_dict("records"), 
                "total"     :   int(town_df["town"].count())
            }

        return data

    def getCategories(self) -> dict:
        """
        Return self.regression_tree.towns, self.regression_tree.flat_types, self.regression_tree.storey_ranges
        as key value pairs in a dict: "towns" : self.regression_tree.towns... etc
        """
        return { 
            "towns"         : self.regression_tree.getTowns(), 
            "flat_types"    : self.regression_tree.getFlatTypes(), 
            "storey_ranges" : self.regression_tree.getStoreyRanges()
        }

    def getImage(self, data:dict) -> dict:
        if len(data["postalcodes"]) > 30:
            return {
                "status" : "BAD", 
                "message" : "Too many requests (> 30)"
            }

        images = dict()
        images["status"] = "OK"
        for postal in data["postalcodes"]:
            if self.__cache.exists(postal):
                images[postal] = self.__cache.get(postal)
            else:
                images[postal] = self.hdb_image_api.call(postal)
                self.__cache.add(postal, images[postal])

        self.__cache.save("hdb")

        return images

    def getAmenities(self, postal_code:str) -> dict:
        one_map_data = self.one_map_api.call(postal_code)

        if one_map_data["found"] == False or postal_code not in self.regression_tree.getAllPostalCodes():
            return {
                "found" : False, 
                "message" : "Postal code is not a valid HDB postal code"
            }

        lat = one_map_data["results"][0]["LATITUDE"]
        lon = one_map_data["results"][0]["LONGITUDE"]

        return self.amenities_api.call([lat,lon])

    def getSoldInTown(self, town:str, page:int):
        data = self.regression_tree.getSoldHDBsInTown(town, page)
        for i in range(len(data["results"])):
            if self.__cache.exists(data["results"][i]["postal_code"]):
                data["results"][i]["image"] = self.__cache.get(data["results"][i]["postal_code"])
            else:
                data["results"][i]["image"] = self.getImage({"postalcodes":[data["results"][i]["postal_code"]]})

        return data


    # def register(self, data:dict):
    #     if self.ezhouse_db.validUsername(data["username"]):
    #         return {
    #             "username"  : data["username"],
    #             "SUCCESS"   : False,
    #             "message"   : "Username already exists!"
    #         }

    #     # if data["role"] not in self.ezhouse_db.getRoles():
    #     #     return {
    #     #         "username"  : data["username"],
    #     #         "SUCCESS"   : False,
    #     #         "message"   : "Invalid role."
    #     #     }

    #     self.ezhouse_db.append(data["username"], data["password"])
    #     return {
    #         "username"  : data["username"],
    #         "SUCCESS"   : True,
    #         "message"   : "Account added to database."
    #     }

    # def login(self, data:dict):
    #     if self.ezhouse_db.validAccount(data["username"], data["password"]):
    #         token = sha256("".join(random.choices(string.ascii_lowercase, k=20)).encode("utf-8")).hexdigest()
    #         self.__sessions[token] = True
    #         return {
    #             "username"      : data["username"],
    #             "SUCCESS"       : True,
    #             "message"       : "Successfully login.",
    #             "accessToken"   : token,
    #             "roles"         : 2001
    #         }

    #     else:
    #         return {
    #             "username"  : data["username"],
    #             "SUCCESS"   : False,
    #             "message"   : "Username or password is wrong."
    #         }

    # def validSession(self, data):
    #     """
    #     Checks if user session is still valid.
    #     """
    #     if not self.ezhouse_db.validUsername(data["username"]):
    #         return "Unable to verify session of username that does not exist in database.", 500

    #     if data["username"] in self.__sessions:
    #         return {"valid_session" : True}
    #     else:
    #         return {"valid_session" : False}

def main():
    server = Server(__name__)
    # server.app.run("0.0.0.0", port=5000, ssl_context=("cert.pem", "key.pem"))
    server.app.run("0.0.0.0", port=5000)

if __name__ == "__main__":
    main()