from server import api
import json
import falcon

class City:
    def __init__(self, name, population):
        self.name = name
        self.population = population

    def __str__(self):
        return self.name + ': Population ' + str(self.population)

city_list = [ City('Auckland', 1495000)
    , City('Christchurch', 389700)
    , City('Dunedin', 118500)
    , City('Gisborne', 36100)
    , City('Hamilton', 230000)
    , City('Invercargill', 50700)
    , City('Napier-Hastings', 131000)
    , City('Nelson', 65700)
    , City('New Plymouth', 56800)
    , City('Palmerston North', 84300)
    , City('Rotorua', 57800)
    , City('Tauranga', 134400)
    , City('Wellington', 405000)
    , City('Whanganui', 39600)
    , City('Whangarei', 56400) ]
   
class cities:
    def on_get(self, req, resp, sort_order):
        if sort_order == 'population':
            sorted_list = sorted(city_list, key=lambda city: city.population, reverse=True)
        else:
            sorted_list = sorted(city_list, key=lambda city: city.name)

        resp.body = json.dumps(list(map(lambda city: city.__dict__, sorted_list)))

api.add_route('/data/cities/{sort_order}', cities()) 