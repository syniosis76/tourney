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

    def toJson(self, email = None, admin = False):
        tournaments = self.list
        #if (admin):
        #    tournaments = [x for x in self.list if x.canEdit(email)]
            
        sortedList = sorted(tournaments, key=lambda tournament: tournament.startDate, reverse=True)
        resultList = list(map(lambda tournament: tournament.basicDict(), sortedList))
        result = {}        
        result['tournaments'] = resultList
        canEdit = self.canEdit(email)
        result['canEdit'] = canEdit
        if canEdit: result['administrators'] = self.get_administrators()
        return json.dumps(result)

    def canEdit(self, email):        
        return email in self.get_administrators()

    def get_administrators(self):
        return ['stacey@verner.co.nz', 'nzcpacompetitions@gmail.com', 'cphb08@gmail.com', 'amlpnz@gmail.com']

    def ensureLoaded(self):     
        pass

    def addTournament(self, tournament):
        self.list.append(tournament)

    def deleteTournament(self, tournament):
        for attempt in transaction.manager.attempts():
            with attempt:
                self.list.remove(tournament)
                transaction.commit() 
    
    def getByShortId(self, id):
        try:
            tournamentId = shortuuid.decode(id)        
            return self.getById(tournamentId)
        except Exception as exception:
            print(exception)
            transaction.abort()
            return None        

    def getById(self, id):
        try:
            tournament = next((tournament for tournament in self.list if tournament.id == id), None)
            if tournament:
                tournament.ensureLoaded()
            return tournament
        except StopIteration as stopIteration:
            print(stopIteration)
            return None
        except ValueError as valueError:
            print(valueError)
            return None
   
class tournamentsRoute:
    def on_get(self, request, response):
        print('Loading Tournaments')       
        connection = tourneyDatabase.tourneyDatabase()
        try:
            email = googleAuthentication.getAuthenticatedEmail(request.headers)
            print('Email: ' + str(email))
            tournaments = connection.tournaments
            tournaments.ensureLoaded()                     
            response.body = tournaments.toJson(email, request.params.get('admin', 0) == '1')
        finally:
            connection.close()

api.add_route('/data/tournaments', tournamentsRoute()) 