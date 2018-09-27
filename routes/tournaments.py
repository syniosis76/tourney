from server import api
import tourneyDatabase
import json
import falcon
import persistent
import persistent.list
import transaction
from datetime import datetime
import uuid
import shortuuid
from routes import tournament

class Tournaments(persistent.Persistent):
    def __init__(self):
        self.list = persistent.list.PersistentList()

    def addTournament(self, tournament):
        self.list.append(tournament)

    def deleteTournament(self, tournament):
        self.list.remove(tournament)

    def addDefaultData(self):
        defaultData = [(uuid.uuid4(), '2019 Quarry Champs', datetime(2019, 1, 19), datetime(2019, 1, 20))
            , (uuid.uuid4(), '2018 South Island Champs', datetime(2018, 12, 1), datetime(2018, 12, 2))]        
        for item in defaultData:
          self.addTournament(tournament.Tournament(item[0], item[1], item[2], item[3]))
        transaction.commit()
    
    def getByShortId(self, id):
        tournamentId = shortuuid.decode(id)
        return self.getById(tournamentId)

    def getById(self, id):
        try:
            return next(tournament for tournament in self.list if tournament.id == id)
        except (StopIteration, ValueError):
            return None
   
class tournamentsRoute:
    def on_get(self, request, response, sort_order):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                    
            tournaments = connection.tournaments
      
            if sort_order == 'date':
                sortedList = sorted(tournaments.list, key=lambda tournament: tournament.startDate)
            else:
                sortedList = sorted(tournaments.list, key=lambda tournament: tournament.name)

            response.body = json.dumps(list(map(lambda tournament: tournament.__dict__, sortedList)))
        finally:
            connection.close()

api.add_route('/data/tournaments/{sort_order}', tournamentsRoute()) 