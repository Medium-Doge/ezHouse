"""
Pre-requisites:
Python 3.9.5
==========================
pip install scikit-learn
pip install pandas
pip install Flask==2.1.2
pip install werkzeug==2.1.2
pip install flask-cors
"""
# self created libraries
from api import HDBImageSearch, OneMapSearch, AmenitiesSearch
from model import RegressionTreeModel

from flask import Flask, request
from flask_cors import CORS

GOOGLE_API_KEY = "AIzaSyDi6uFfup3Xhc4Y2azQ-VY-rdvridd22B4"
CX = "57ca1c7140b714b5b"

class Server():
    def __init__(self, name):
        """
        Initializes the server.
            - Creates a RegressionTreeModel object
            - Creates a HDBImageSearch API object
            - Creates a OneMapSearch API object
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

        print("Initialising API server...")
        self.app = Flask(name)
        CORS(self.app)
        print("Done.")

        # === START OF FLASK API ROUTES ===
        
        @self.app.route("/hello")
        def __hello_world():
            return self.hello_world()

        @self.app.route("/predict", methods=["GET"])
        def __getPrediction():
            # lease = request.args.get("lease")
            postal_code = request.args.get("postal_code")
            town = request.args.get("town")
            flat_type = request.args.get("flat_type")
            storey_range = request.args.get("storey_range")
            return self.getPrediction(postal_code, town, flat_type, storey_range)

        @self.app.route("/recentlysold", methods=["GET"])
        def __getRecentlySold():
            return self.getRecentlySold()

        @self.app.route("/categories", methods=["GET"])
        def __getCategories():
            return self.getCategories()

        @self.app.route("/image", methods=["POST"])
        def __getImage():
            data = request.get_json(silent=True)
            if data == None:
                return "Body is not JSON type or Request is not POST", 500

            return self.getImage(data)

        @self.app.route("/amenities", methods=["GET"])
        def __getAmenities():
            postal_code = request.args.get("postal_code")
            return self.getAmenities(postal_code)

        # === END OF FLASK API ROUTES ===
            
    def hello_world(self):
        return {"test": ["Hello", "World"]}

    def getPrediction(self, postal_code:str, town:str, flat_type:str, storey_range:str):

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

        # predictors = pd.DataFrame([predictors])

        house_info = self.regression_tree.getHouseInfo(postal_code)

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
            "image"                 : self.hdb_image_api.call(postal_code)
        }
        
    def getRecentlySold(self) -> dict:
        # date = format(datetime.now() - relativedelta(months=1), "%Y-%m") + "-01"
        # recent = self.regression_tree.resale.loc[self.regression_tree.resale["month"] >= date]
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
        if len(data) > 30:
            return {
                "status" : "BAD", 
                "message" : "Too many requests (> 30)"
            }

        images = dict()
        images["status"] = "OK"
        for postal in data["postalcodes"]:
            images[postal] = self.hdb_image_api.call(postal)

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

def main():
    server = Server(__name__)
    # server.app.run("0.0.0.0", port=5000, ssl_context=("cert.pem", "key.pem"))
    server.app.run("0.0.0.0", port=5000)
    
if __name__ == "__main__":
    main()