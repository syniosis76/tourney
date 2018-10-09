from server import api
import tourneyDatabase
import json
import falcon
import persistent
import persistent.list
import transaction
import uuid
from routes import gameDate
from datetime import datetime
from datetime import timedelta

class Tournament(persistent.Persistent):
    def __init__(self, id):
        self.id = id
        self.name = None
        self.startDate = None
        self.endDate = None
        self.gameDates = persistent.list.PersistentList()

    def __str__(self):
        return self.name

    def ensureLoaded(self):
        if not hasattr(self, 'gameDates'):
            self.gameDates = persistent.list.PersistentList()
            transaction.commit()
        
        if len(self.gameDates) == 0:
            self.addDate()

        for gamedate in self.gameDates:
            d = gamedate.id
            gamedate.ensurePitch()
            for pitch in gamedate.pitches:
                p = pitch.name

    def assign(self, tournament):
        if 'name' in tournament:
            self.name = tournament['name']
        
        if 'startDate' in tournament:
            self.startDate = tournament['startDate']

        if 'endDate' in tournament:
            self.endDate = tournament['endDate']

    def addDate(self):
        startDate = self.startDate
        if not startDate:
            startDate = datetime.today()

        startDate = startDate + timedelta(days=len(self.gameDates))

        newDate = gameDate.GameDate(uuid.uuid4())
        newDate.date = startDate 
        self.gameDates.append(newDate)
        transaction.commit()

        return newDate

    def deleteDate(self, date):        
        self.gameDates.remove(date)
        transaction.commit()

class tournamentIdRoute:
    def on_get(self, request, response, id):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                                
            if id == 'new':
                tournament = Tournament(uuid.uuid4())
            else:                
                tournament = connection.tournaments.getByShortId(id) 

            if tournament:
                response.body = json.dumps(tournament.__dict__)            
        finally:
            connection.close()

    def on_delete(self, request, response, id):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                                
            tournament = connection.tournaments.getByShortId(id) 
            if tournament:            
                connection.tournaments.deleteTournament(tournament)                            
        finally:
            connection.close()

class tournamentRoute: 
    def on_put(self, request, response):
      body = json.loads(request.stream.read())
      print('PUT ' + str(body))
      
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getById(body['id'])                
          if not tournament:
            tournament = Tournament(body['id'])
            connection.tournaments.addTournament(tournament)                 
          tournament.assign(body)
          transaction.commit()
      finally:
          connection.close()

class tournamentAddDateRoute: 
    def on_put(self, request, response, id):  
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getByShortId(id)                
          if tournament:
            tournament.addDate()                       
      finally:
          connection.close()

api.add_route('/data/tournament/{id}', tournamentIdRoute()) 
api.add_route('/data/tournament/', tournamentRoute()) 
api.add_route('/data/tournament/{id}/adddate', tournamentAddDateRoute()) 