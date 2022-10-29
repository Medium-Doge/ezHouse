import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from datetime import date, datetime
from dateutil.relativedelta import relativedelta

RESALE = "resale.csv"
HDBINFO = "hdb_info.csv"

class RegressionTreeModel():
    def __init__(self):
        self.__resale = pd.read_csv(RESALE)
        self.__hdb_info = pd.read_csv(HDBINFO)

        self.__towns = None
        self.__flat_types = None
        self.__storey_ranges = None

        self.__predictors = None
        self.__model = None

        print("\t└Initialising datasets...")
        self.initialiseDatasets()
        print("\t└Setting predictors...")
        self.setPredictors()
        print("\t└Creating model...")
        self.createModel()
        
    def initialiseDatasets(self):
        self.__resale.drop(self.__resale.columns[self.__resale.columns.str.contains('unnamed',case = False)],
                            axis=1, inplace=True)

        self.__hdb_info.drop(self.__hdb_info.columns[self.__hdb_info.columns.str.contains('unnamed',case = False)],
                            axis=1, inplace=True)

        # # update postal code in resale dataframe from hdb_info dataframe
        # for index, row in self.__resale.iterrows():
        #     # self.resale.at[index, "postal_code"] = \
        #     #     self.hdb_info[(self.hdb_info["address"] == "{} {}".format(row[3],row[4]))]["postal_code"].array[0]
        #     self.__resale.at[index, "postal_code"] = self.__hdb_info[(self.__hdb_info["address"] == "{} {}".format(row[3], row[4]))]["postal_code"].array[0]

        # # change "month" column to datetime datatype
        # self.__resale["month"] =  pd.to_datetime(self.__resale["month"])
        # self.__resale.sort_values(by="month", ascending=False, inplace=True) 
        # # resale dataframe is now sorted with latest date as the first entry
        
        # # change remaining lease in years to months
        # for index, row in self.__resale.iterrows():
        #     lease = row[9].split(" ")
        #     self.__resale.at[index, "remaining_lease"] = \
        #         int(lease[0]) * 12 + int(lease[2]) if len(lease) == 4 else int(lease[0])

        # self.__resale.rename(columns = {"remaining_lease":"remaining_lease (months)"}, inplace=True)
        # self.__resale["remaining_lease (months)"] = self.__resale["remaining_lease (months)"].astype("int64")

        # export towns, floor_types, storey_ranges before encoding the

        self.resale_train = self.__resale.copy()

        self.__towns = list(self.resale_train["town"].unique())
        self.__towns.remove("KALLANG/WHAMPOA")
        self.__towns.append("KALLANG_WHAMPOA")
        self.__towns.sort()

        self.__flat_types = list(self.resale_train["flat_type"].unique())
        self.__flat_types.sort()

        self.__storey_ranges = list(self.resale_train["storey_range"].unique())
        self.__storey_ranges.sort()

        # encode categorial variables
        self.resale_train = pd.get_dummies(self.resale_train, columns=["town", "flat_type", "storey_range", "flat_model"])
        self.resale_train.columns = self.resale_train.columns.str.replace(" ","")
        self.resale_train.columns = self.resale_train.columns.str.replace("/","_")

        print(self.__towns)

    def setPredictors(self):
        # get predictors

        lease = [col for col in self.resale_train if col.startswith("remaining_lease")]
        towns = [col for col in self.resale_train if col.startswith("town_")]
        flat_types = [col for col in self.resale_train if col.startswith("flat_type_")]
        storey_ranges = [col for col in self.resale_train if col.startswith("storey_range_")]
        # flat_models = [col for col in self.resale_train if col.startswith("flat_model_")]

        # self.__predictors = towns + flat_types + storey_ranges + flat_models
        self.__predictors = lease + towns + flat_types + storey_ranges

    def createModel(self):
        # Extract Response and Predictors
        y = pd.DataFrame(self.resale_train["resale_price"])
        x = pd.DataFrame(self.resale_train[self.__predictors])

        X_train, X_test, y_train, y_test = train_test_split(x, y, test_size = 0.20)
        self.__model = DecisionTreeRegressor()
        self.__model.fit(X_train, y_train)
        # self.sample_predictions = self.__model.predict(X_test)
        print("\t\t└Goodness of Fit of Model \tTrain Dataset")
        print("\t\t└Regression Accuracy \t:", self.__model.score(X_train, y_train))
        # Check the Goodness of Fit (on Test Data)
        print("\t\t└Goodness of Fit of Model \tTest Dataset")
        print("\t\t└Regression Accuracy \t:", self.__model.score(X_test, y_test))

    def predict(self, predictors:dict) -> int:
        predictors = pd.DataFrame([predictors])
        return self.__model.predict(predictors)[0]

    def getHouseInfo(self, postal_code) -> dict:
        return self.__hdb_info.loc[self.__hdb_info["postal_code"] == postal_code].iloc[0]

    def getRemainingLease(self, postal_code) -> int:
        return (date.today().year - int(self.__hdb_info.loc[self.__hdb_info["postal_code"] == postal_code]["year_completed"])) * 12

    def getPredictors(self) -> list:
        return self.__predictors

    def getRecent(self):
        date = format(datetime.now() - relativedelta(months=1), "%Y-%m") + "-01"
        return self.__resale.loc[self.__resale["month"] >= date]

    def getAllPostalCodes(self) -> list:
        return self.__hdb_info["postal_code"].values

    def getTowns(self) -> list:
        return self.__towns
    
    def getFlatTypes(self) -> list:
        return self.__flat_types
    
    def getStoreyRanges(self) -> list:
        return self.__storey_ranges

    def getHistory(self , postal_code):
        data = self.__resale.loc[self.__resale["postal_code"] == postal_code].to_dict("records")
        return data if data else None

    def getSoldHDBsInTown(self, town, page):
        data = self.__resale.loc[self.__resale["town"] == town].to_dict("records")[(page*10)-10:page*2]
        return {"results" : data} if data else {"results" : None}