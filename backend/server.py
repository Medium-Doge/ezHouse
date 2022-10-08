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

from flask import Flask, request

RESALE = "backend/resale.csv"
HDBINFO = "backend/hdb_info.csv"

class Server():
    def __init__(self, name):
        """
        Initialize the server.
        """
        print("Initialising Regression Tree Model...")
        self.regression_tree = RegressionTreeModel()
        print("Done")
        print("Initialising API server...")
        self.app = Flask(name)
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

        @self.app.route("/amenities", methods=["GET"])
        def __getAmenities():
            return self.getAmenities()
            
    def hello_world(self):
        return {"test": ["Hello", "World"]}

    def getPrediction(self, postal_code, town, flat_type, storey_range):
        data = dict(zip(self.regression_tree.predictors, [0] * len(self.regression_tree.predictors)))
        # data["remaining_lease(months)"] = int(lease)
        # data["town_{}".format(town)] = 1
        data["remaining_lease(months)"] = \
            (date.today().year - 
            int(self.regression_tree.hdb_info.loc[
                self.regression_tree.hdb_info["postal_code"] == postal_code
                ]
                ["year_completed"])) * 12
    
        data["town_{}".format(town)] = 1
        data["flat_type_{}".format(flat_type)] = 1
        data["storey_range_{}".format(storey_range)] = 1

        data = pd.DataFrame([data])

        return {"predicted_price" : self.regression_tree.model.predict(data)[0]}

    def getRecentlySold(self):
        date = format(datetime.now() - relativedelta(months=1), "%Y-%m") + "-01"
        temp_df = self.regression_tree.resale.loc[self.regression_tree.resale["month"] >= date]

        return {
            "town"      :   temp_df["town"].value_counts().to_dict(),
            "records"   :   temp_df.to_dict("records")
        }

    def getCategories(self):
        """
        Return self.regression_tree.towns, self.regression_tree.flat_types, self.regression_tree.storey_ranges
        as key value pairs in a dict: "towns" : self.regression_tree.towns... etc
        """
        
        pass

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
    def __init__(self):
        pass

    def get():
        pass

def main():
    server = Server(__name__)
    server.app.run("0.0.0.0", port=5000)
    
if __name__ == "__main__":
    main()
