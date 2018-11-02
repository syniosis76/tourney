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
from utilities import googleAuthentication

class Tournaments(persistent.Persistent):
    def __init__(self):
        self.list = persistent.list.PersistentList()        

    def toJson(self, email = None):
        sortedList = sorted(self.list, key=lambda tournament: tournament.startDate)
        resultList = list(map(lambda tournament: tournament.__dict__, sortedList))
        result = {}
        result['canEdit'] = self.canEdit(email)
        result['tournaments'] = resultList        
        return json.dumps(result)

    def canEdit(self, email):
        return email == 'stacey@verner.co.nz'

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
            email = googleAuthentication.getAuthenticatedEmail(request.headers)
            tournaments = connection.tournaments                        
            response.body = tournaments.toJson(email)
        finally:
            connection.close()

api.add_route('/data/tournaments', tournamentsRoute()) 