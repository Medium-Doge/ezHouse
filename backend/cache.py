import pickle

class Cache():
    def __init__(self, type):
        self.__data = {}
        try:
            self.load(type)
        except FileNotFoundError:
            print("cache file not found.")

    def load(self, type:str):
        with open("{}_cache.pkl".format(type), "rb") as f:
            self.__data = pickle.load(f)

    def save(self, type:str):
        with open("{}_cache.pkl".format(type), "wb") as f:
            pickle.dump(self.__data, f)

    def exists(self, key:str):
        return True if key in self.__data else False

    def add(self, key, value):
        self.__data[key] = value

    def get(self, key):
        return self.__data