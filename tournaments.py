from server import api, db
import json
import falcon
import persistent
import persistent.list
import transaction
from datetime import datetime
import jsonDateTime

class Tournament(persistent.Persistent):
    def __init__(self, name, startDate, endDate):
        self.name = name
        self.startDate = startDate
        self.endDate = endDate

    def __str__(self):
        return self.name + ': Population ' + str(self.population)

class TournamentList(persistent.Persistent):
    def __init__(self):
        self.tournaments = persistent.list.PersistentList()

    def addTournament(self, tournament):
        self.tournaments.append(tournament)

defaultData = [('2019 Quarry Champs', datetime(2019, 1, 19), datetime(2019, 1, 20))
            , ('2018 South Island Champs', datetime(2018, 12, 1), datetime(2018, 12, 2))]
   
class tournaments:
    def on_get(self, req, resp, sort_order):        
        connection = db.open()
        root = connection.root

        if hasattr(root, 'tournaments'):
            print('Data is already stored.')
            tournaments = root.tournaments
        else:
            print('Data is not already stored.')
            tournaments = TournamentList()
            root.tournaments = tournaments
            for item in defaultData:
                tournaments.addTournament(Tournament(item[0], item[1], item[2]))
            transaction.commit()
      
        if sort_order == 'date':
            sorted_list = sorted(tournaments.tournaments, key=lambda tournament: tournament.startDate)
        else:
            sorted_list = sorted(tournaments.tournaments, key=lambda tournament: tournament.name)

        resp.body = json.dumps(list(map(lambda tournament: tournament.__dict__, sorted_list)))

api.add_route('/data/tournaments/{sort_order}', tournaments()) 