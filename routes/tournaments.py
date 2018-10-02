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
    
    def getByShortId(self, id):
        tournamentId = shortuuid.decode(id)
        return self.getById(tournamentId)

    def getById(self, id):
        try:
            tournament = next(tournament for tournament in self.list if tournament.id == id)
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
            sortedList = sorted(tournaments.list, key=lambda tournament: tournament.startDate)
            response.body = json.dumps(list(map(lambda tournament: tournament.__dict__, sortedList)))
        finally:
            connection.close()

api.add_route('/data/tournaments', tournamentsRoute()) 