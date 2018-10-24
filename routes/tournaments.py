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

    def toJson(self):
        sortedList = sorted(self.list, key=lambda tournament: tournament.startDate)
        resultList = list(map(lambda tournament: tournament.__dict__, sortedList))
        result = {}
        result['canEdit'] = self.canEdit()
        result['tournaments'] = resultList        
        return json.dumps(result)

    def canEdit(self):
        return True

    def addTournament(self, tournament):
        self.list.append(tournament)

    def deleteTournament(self, tournament):
        self.list.remove(tournament)
        transaction.commit() 
    
    def getByShortId(self, id):
        tournamentId = shortuuid.decode(id)
        return self.getById(tournamentId)

    def getById(self, id):
        try:
            tournament = next((tournament for tournament in self.list if tournament.id == id), None)
            if tournament:
                tournament.ensureLoaded()
            return tournament
        except (StopIteration, ValueError):
            return None
   
class tournamentsRoute:
    def on_get(self, request, response):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                    
            tournaments = connection.tournaments                        
            response.body = tournaments.toJson()
        finally:
            connection.close()

api.add_route('/data/tournaments', tournamentsRoute()) 