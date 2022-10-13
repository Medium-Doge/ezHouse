
# Import flask and datetime module for showing date and time 

from flask import Flask 
 
# Initializing flask app 

app = Flask(__name__) 

# Route for seeing a data 

@app.route('/categories') 
def categories():  

    # Returning an api for showing in  reactjs 

    return { 

        # "hello" : "world"
        "flat_types" : ["1 ROOM"],
        "storey_ranges" : ["01 TO 03"],
        "towns" :   ["ANG MO KIO"]
        } 

# Running app 

if __name__ == '__main__': 
    # app.run("0.0.0.0", port=5000)
    app.run("0.0.0.0", port=5000, ssl_context=("cert.pem", "key.pem"))
