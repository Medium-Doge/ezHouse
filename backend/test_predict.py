"""
Automated Backend API testing with pytest

Valid Tests
-----------
    Test 1: "560615"

Invalid Tests
-------------
    Test 2: Invalid postal code "abcdef"    (invalid str)
    Test 3: Invalid postal code 123456      (int)
    Test 4: Invalid postal code ""          (invalid str)
    Test 5: Invalid postal code None        (NoneType)
    Test 6: Invalid postal code True        (Boolean)
"""

import requests

def callBackendAPI(route:str, body):
    data = requests.post("http://localhost:5000/api/{route}".format(
        route=route), json=body).json()
    return data

def test_predict_1_VALID_POSTAL_CODE_1():
    body = {
        "postal_code" : "560615",
        "town" : "ANG MO KIO",
        "flat_type" : "EXECUTIVE",
        "storey_range" : "10 TO 12"
    }

    data = callBackendAPI("predict", body)
    assert data["found"] == True
    assert data["address"] == "615 ANG MO KIO AVE 4"

def test_predict_2_INVALID_POSTAL_CODE_1():
    body = {
        "postal_code" : "abcdef",
        "town" : "ANG MO KIO",
        "flat_type" : "EXECUTIVE",
        "storey_range" : "10 TO 12"
    }   

    data = callBackendAPI("predict", body)
    assert data["found"] == False


def test_predict_3_INVALID_POSTAL_CODE_2():
    body = {
        "postal_code" : 123456,
        "town" : "ANG MO KIO",
        "flat_type" : "EXECUTIVE",
        "storey_range" : "10 TO 12"
    }   

    data = callBackendAPI("predict", body)
    assert data["found"] == False

def test_predict_4_INVALID_POSTAL_CODE_3():
    body = {
        "postal_code" : "",
        "town" : "ANG MO KIO",
        "flat_type" : "EXECUTIVE",
        "storey_range" : "10 TO 12"
    }   

    data = callBackendAPI("predict", body)
    assert data["found"] == False
    pass

def test_predict_4_INVALID_POSTAL_CODE_4():
    body = {
        "postal_code" : None,
        "town" : "ANG MO KIO",
        "flat_type" : "EXECUTIVE",
        "storey_range" : "10 TO 12"
    }   

    data = callBackendAPI("predict", body)
    assert data["found"] == False
    pass

def test_predict_4_INVALID_POSTAL_CODE_5():
    body = {
        "postal_code" : True,
        "town" : "ANG MO KIO",
        "flat_type" : "EXECUTIVE",
        "storey_range" : "10 TO 12"
    }   

    data = callBackendAPI("predict", body)
    assert data["found"] == False
    pass