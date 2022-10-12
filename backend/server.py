
"""
Pre-requisites:
Python 3.9.5
==========================
pip install scikit-learn
pip install pandas
pip install Flask==2.1.2
pip install werkzeug==2.1.2
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from datetime import date
from datetime import datetime
from dateutil.relativedelta import relativedelta
import requests

from flask import Flask, request
from flask_cors import CORS

RESALE = "resale.csv"
HDBINFO = "hdb_info.csv"
GOOGLE_API_KEY = "AIzaSyDi6uFfup3Xhc4Y2azQ-VY-rdvridd22B4"
CX = "57ca1c7140b714b5b"

class Server():
    def __init__(self, name):
        """
        Initialize the server.
        """
        print("Initialising Regression Tree Model...")
        self.regression_tree = RegressionTreeModel()
        print("Done")

        print("Initialising CustomGoogleSearchAPIConnector")
        self.hdb_image_api = HDBImageSearchAPIConnector(GOOGLE_API_KEY, CX)
        print("Done")

        print("Initialising API server...")
        self.app = Flask(name)
        CORS(self.app)
        print("Done")

        # === App routes ===
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

        @self.app.route("/image", methods=["GET", "POST"])
        def __getImage():
            data = request.get_json(silent=True)
            if data == None:
                return "Body is not json type or Request is not POST", 500

            return self.findImage(data)

        @self.app.route("/amenities", methods=["GET"])
        def __getAmenities():
            return self.getAmenities()
            
    def hello_world(self):
        return {"test": ["Hello", "World"]}

    def getPrediction(self, postal_code:str, town:str, flat_type:str, storey_range:str):
        if postal_code in self.regression_tree.hdb_info["postal_code"].values:
            hdb_info = self.regression_tree.hdb_info
            data = dict(zip(self.regression_tree.predictors, [0] * len(self.regression_tree.predictors)))

            data["remaining_lease(months)"] = \
                (date.today().year - 
                int(hdb_info.loc[
                    hdb_info["postal_code"] == postal_code
                    ]
                    ["year_completed"])) * 12
        
            data["town_{}".format(town.replace(" ",""))] = 1
            data["flat_type_{}".format(flat_type.replace(" ",""))] = 1
            data["storey_range_{}".format(storey_range.replace(" ",""))] = 1

            data = pd.DataFrame([data])

            # get lat lon from OneMap API
            query = requests.get(
                "https://developers.onemap.sg/commonapi/search?searchVal={}&returnGeom=Y&getAddrDetails=N".format(postal_code)
                ).json()

            if query["found"] == 0: # unable to find lat lon data from one map api
                return {
                    "found" : False,
                    "predicted_price" : None
                }
            else:
                lat = query["results"][0]["LATITUDE"]
                lon = query["results"][0]["LONGITUDE"]

            # get photo from Custom Google Image Search


            house_info = hdb_info.loc[hdb_info["postal_code"] == postal_code].iloc[0]

            return {
                "found"                 : True,
                "latitude"              : lat,
                "longitude"             : lon,
                "predicted_price"       : self.regression_tree.model.predict(data)[0],
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
                "address"               : house_info["Address"],
                "image"                 : self.hdb_image_api.getImage(postal_code)
            }
        
        else:
            return {
                "found" : False,
                "predicted_price" : None
            }

    def getRecentlySold(self):
        date = format(datetime.now() - relativedelta(months=1), "%Y-%m") + "-01"
        temp_df = self.regression_tree.resale.loc[self.regression_tree.resale["month"] >= date]
        
        # return {
        #     "town"      :   temp_df["town"].value_counts().to_dict(),
        #     "records"   :   temp_df.to_dict("records")
        # }

        data = dict()
        for town in temp_df["town"].unique():
            town_df = temp_df.loc[temp_df["town"] == town]
            data[town] = {
                "records"   : town_df.to_dict("records"),
                "total"     :   int(town_df["town"].count())
            }

        return data

    def getCategories(self):
        """
        Return self.regression_tree.towns, self.regression_tree.flat_types, self.regression_tree.storey_ranges
        as key value pairs in a dict: "towns" : self.regression_tree.towns... etc
        """
        
        return { 
            "towns"         : self.regression_tree.towns, 
            "flat_types"    : self.regression_tree.flat_types, 
            "storey_ranges" : self.regression_tree.storey_ranges
        }

    def findImage(self, data:dict):
        if len(data) > 30:
            return {
                "Too many postal codes (> 30):" : len(data)
            }

        images = dict()
        for postal in data["postalcodes"]:
            images[postal] = self.hdb_image_api.getImage(postal)

        return images

    def getAmenities(self):
        raise NotImplementedError

class RegressionTreeModel():
    def __init__(self):
        self.resale = pd.read_csv(RESALE)
        self.hdb_info = pd.read_csv(HDBINFO)

        self.towns = None
        self.flat_types = None
        self.storey_ranges = None

        print("\t└Initialising datasets...")
        self.initialiseDatasets()
        print("\t└Setting predictors...")
        self.setPredictors()
        print("\t└Creating model...")
        self.createModel()
        
    def initialiseDatasets(self):
        self.resale.drop(self.resale.columns[self.resale.columns.str.contains('unnamed',case = False)],
                            axis=1, inplace=True)

        self.hdb_info.drop(self.hdb_info.columns[self.hdb_info.columns.str.contains('unnamed',case = False)],
                            axis=1, inplace=True)

        # update postal code in resale dataframe from hdb_info dataframe
        for index, row in self.resale.iterrows():
            # self.resale.at[index, "postal_code"] = \
            #     self.hdb_info[(self.hdb_info["Address"] == "{} {}".format(row[3],row[4]))]["postal_code"].array[0]
            self.resale.at[index, "postal_code"] = self.hdb_info[(self.hdb_info["Address"] == "{} {}".format(row[3], row[4]))]["postal_code"].array[0]

        # change "month" column to datetime datatype
        self.resale["month"] =  pd.to_datetime(self.resale["month"])
        self.resale.sort_values(by="month", ascending=False, inplace=True) 
        # resale dataframe is now sorted with latest date as the first entry
        
        # change remaining lease in years to months
        for index, row in self.resale.iterrows():
            lease = row[9].split(" ")
            self.resale.at[index, "remaining_lease"] = \
                int(lease[0]) * 12 + int(lease[2]) if len(lease) == 4 else int(lease[0])

        self.resale.rename(columns = {"remaining_lease":"remaining_lease (months)"}, inplace=True)
        self.resale["remaining_lease (months)"] = self.resale["remaining_lease (months)"].astype("int64")

        # export towns, floor_types, storey_ranges before encoding them
        self.towns = list(self.resale["town"].unique())
        self.towns.sort()

        self.flat_types = list(self.resale["flat_type"].unique())
        self.flat_types.sort()

        self.storey_ranges = list(self.resale["storey_range"].unique())
        self.storey_ranges.sort()

        self.resale_train = self.resale.copy()
        # encode categorial variables
        self.resale_train = pd.get_dummies(self.resale_train, columns=["town", "flat_type", "storey_range", "flat_model"])
        self.resale_train.columns = self.resale_train.columns.str.replace(" ","")
        self.resale_train.columns = self.resale_train.columns.str.replace("/","_")

    def setPredictors(self):
        # get predictors

        lease = [col for col in self.resale_train if col.startswith("remaining_lease")]
        towns = [col for col in self.resale_train if col.startswith("town_")]
        flat_types = [col for col in self.resale_train if col.startswith("flat_type_")]
        storey_ranges = [col for col in self.resale_train if col.startswith("storey_range_")]
        # flat_models = [col for col in self.resale_train if col.startswith("flat_model_")]

        # self.predictors = towns + flat_types + storey_ranges + flat_models
        self.predictors = lease + towns + flat_types + storey_ranges

    def createModel(self):
        # Extract Response and Predictors
        y = pd.DataFrame(self.resale_train["resale_price"])
        x = pd.DataFrame(self.resale_train[self.predictors])

        X_train, X_test, y_train, y_test = train_test_split(x, y, test_size = 0.20)
        self.model = DecisionTreeRegressor()
        self.model.fit(X_train, y_train)
        # self.sample_predictions = self.model.predict(X_test)
        print("\t\t└Goodness of Fit of Model \tTrain Dataset")
        print("\t\t└Regression Accuracy \t:", self.model.score(X_train, y_train))
        # Check the Goodness of Fit (on Test Data)
        print("\t\t└Goodness of Fit of Model \tTest Dataset")
        print("\t\t└Regression Accuracy \t:", self.model.score(X_test, y_test))


class APIConnector():
    def __init__(self, api_key):
        self.API_KEY = api_key

    def get():
        pass

class HDBImageSearchAPIConnector(APIConnector):
    """
    Uses Custom Google Search API 
    """
    def __init__(self, api_key, cx):
        super().__init__(api_key)
        self.cx = cx
    
    def getImage(self, postal_code):
        url = "https://www.googleapis.com/customsearch/v1?key={}&cx={}&q=Singapore%20{}".format(
                self.API_KEY, self.cx, postal_code
            )

        data = requests.get(url).json()

        try:
            return data["items"][0]["pagemap"]["cse_image"][0]["src"]
        except:
            return None


def main():
    server = Server(__name__)
    server.app.run("0.0.0.0", port=5000, ssl_context=("cert.pem", "key.pem"))
    
    
if __name__ == "__main__":
    main()
