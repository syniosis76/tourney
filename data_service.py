from server import api, db
import json
import falcon
import persistent
import persistent.list
import transaction

class City(persistent.Persistent):
    def __init__(self, name, population):
        self.name = name
        self.population = population

    def __str__(self):
        return self.name + ': Population ' + str(self.population)

class CityList(persistent.Persistent):
    def __init__(self):
        self.cities = persistent.list.PersistentList()

    def addCity(self, city):
        self.cities.append(city)

defaultData = [('Auckland', 1495000)
            , ('Christchurch', 389700)
            , ('Dunedin', 118500)
            , ('Gisborne', 36100)
            , ('Hamilton', 230000)
            , ('Invercargill', 50700)
            , ('Napier-Hastings', 131000)
            , ('Nelson', 65700)
            , ('New Plymouth', 56800)
            , ('Palmerston North', 84300)
            , ('Rotorua', 57800)
            , ('Tauranga', 134400)
            , ('Wellington', 405000)
            , ('Whanganui', 39600)
            , ('Whangarei', 56400)]
   
class cities:
    def on_get(self, req, resp, sort_order):        
        connection = db.open()
        root = connection.root

        if hasattr(root, 'cities'):
            print('Data is already stored.')
            cities = root.cities
        else:
            print('Data is not already stored.')
            cities = CityList()
            root.cities = cities
            for item in defaultData:
                cities.addCity(City(item[0], item[1]))
            transaction.commit()
      
        if sort_order == 'population':
            sorted_list = sorted(cities.cities, key=lambda city: city.population, reverse=True)
        else:
            sorted_list = sorted(cities.cities, key=lambda city: city.name)

        resp.body = json.dumps(list(map(lambda city: city.__dict__, sorted_list)))

api.add_route('/data/cities/{sort_order}', cities()) 