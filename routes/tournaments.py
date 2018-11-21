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
        self.administrators = persistent.list.PersistentList()

    def toJson(self, email = None):
        sortedList = sorted(self.list, key=lambda tournament: tournament.startDate)
        resultList = list(map(lambda tournament: tournament.__dict__, sortedList))
        result = {}        
        result['tournaments'] = resultList
        canEdit = self.canEdit(email)
        result['canEdit'] = canEdit
        if canEdit: result['administrators'] = self.administrators
        return json.dumps(result)

    def canEdit(self, email):
        return email in self.administrators

    def ensureLoaded(self):
        if not hasattr(self, 'administrators'):
            self.administrators = persistent.list.PersistentList()
            transaction.commit()
        
        if len(self.administrators) == 0:
            self.administrators.append('stacey@verner.co.nz')
            transaction.commit()

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
            tournaments.ensureLoaded()                     
            response.body = tournaments.toJson(email)
        finally:
            connection.close()

api.add_route('/data/tournaments', tournamentsRoute()) 