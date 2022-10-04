import pandas as pd
import requests

hdb_info = pd.read_csv("hdb_info.csv")
hdb_info.drop(hdb_info.columns[hdb_info.columns.str.contains('unnamed',case = False)],axis = 1, inplace = True)

for index, row in hdb_info.iterrows():
    hdb_info.loc[index, "Address"] = "{} {}".format(row[0], row[1])
    try:
        hdb_info.loc[index, "postal_code"] = requests.get("https://developers.onemap.sg/commonapi/search?searchVal={} {}&returnGeom=N&getAddrDetails=Y".format(row[0], row[1])).json()["results"][0]["POSTAL"]
    except:
        print(row[0], row[1])

hdb_info.to_csv("hdb_info.csv")
