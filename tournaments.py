from server import api, db
import json
import falcon
import persistent
import persistent.list
import transaction
from datetime import datetime
import jsonEncoder
import uuid

class Tournament(persistent.Persistent):
    def __init__(self, id, name, startDate, endDate):
        self.id = id
        self.name = name
        self.startDate = startDate
        self.endDate = endDate

    def __str__(self):
        return self.name

class Tournaments(persistent.Persistent):
    def __init__(self):
        self.list = persistent.list.PersistentList()

    def addTournament(self, tournament):
        self.list.append(tournament)

defaultData = [(uuid.uuid4(), '2019 Quarry Champs', datetime(2019, 1, 19), datetime(2019, 1, 20))
            , (uuid.uuid4(), '2018 South Island Champs', datetime(2018, 12, 1), datetime(2018, 12, 2))]
   
class tournaments:
    def on_get(self, req, resp, sort_order):        
        connection = db.open()
        try:            
            root = connection.root

            if hasattr(root, 'tournaments'):
                print('Data is already stored.')
                tournaments = root.tournaments
            else:
                print('Data is not already stored.')
                tournaments = Tournaments()
                root.tournaments = tournaments
                for item in defaultData:
                    tournaments.addTournament(Tournament(item[0], item[1], item[2], item[3]))
                transaction.commit()        
      
            if sort_order == 'date':
                sortedList = sorted(tournaments.list, key=lambda tournament: tournament.startDate)
            else:
                sortedList = sorted(tournaments.list, key=lambda tournament: tournament.name)

            resp.body = json.dumps(list(map(lambda tournament: tournament.__dict__, sortedList)))
        finally:
            connection.close()

api.add_route('/data/tournaments/{sort_order}', tournaments()) 