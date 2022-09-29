"""
Python 3.9.5

Pre-requisites:
pip install scikit-learn
pip install pandas
pip install Flask==2.1.2
pip install werkzeug==2.1.2
"""
##awfafea
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from datetime import date

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

        @self.app.route("/amenities", methods=["GET"])
        def __getAmenities():
            return self.getAmenities()
            
    def hello_world(self):
        return "Hello World"

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

    def getAmenities(self):
        raise NotImplementedError

class RegressionTreeModel():
    def __init__(self):
        self.resale = pd.read_csv(RESALE)
        self.hdb_info = pd.read_csv(HDBINFO)
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
                            axis = 1, inplace = True)

        # update postal code in resale dataframe from hdb_info dataframe
        for index, row in self.resale.iterrows():
            self.resale.at[index, "postal_code"] = \
                self.hdb_info[(self.hdb_info["Address"] == "{} {}".format(row[3],row[4]))]["postal_code"].array[0]
        
        # change remaining lease in years to months
        for index, row in self.resale.iterrows():
            lease = row[9].split(" ")
            self.resale.at[index, "remaining_lease"] = \
                int(lease[0]) * 12 + int(lease[2]) if len(lease) == 4 else int(lease[0])

        self.resale.rename(columns = {"remaining_lease":"remaining_lease (months)"}, inplace=True)
        self.resale["remaining_lease (months)"] = self.resale["remaining_lease (months)"].astype("int64")

        # encode categorial variables
        self.resale = pd.get_dummies(self.resale, columns=["town", "flat_type", "storey_range", "flat_model"])
        self.resale.columns = self.resale.columns.str.replace(" ","")
        self.resale.columns = self.resale.columns.str.replace("/","_")

    def setPredictors(self):
        # get predictors

        lease = [col for col in self.resale if col.startswith("remaining_lease")]
        towns = [col for col in self.resale if col.startswith("town_")]
        flat_types = [col for col in self.resale if col.startswith("flat_type_")]
        storey_ranges = [col for col in self.resale if col.startswith("storey_range_")]
        # flat_models = [col for col in self.resale if col.startswith("flat_model_")]

        # self.predictors = towns + flat_types + storey_ranges + flat_models
        self.predictors = lease + towns + flat_types + storey_ranges

    def createModel(self):
        # Extract Response and Predictors
        y = pd.DataFrame(self.resale["resale_price"])
        x = pd.DataFrame(self.resale[self.predictors])

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
    server.app.run("0.0.0.0")
    
if __name__ == "__main__":
    main()
