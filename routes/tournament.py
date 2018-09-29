from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid

class Tournament(persistent.Persistent):
    def __init__(self, id):
        self.id = id
        self.name = None
        self.startDate = None
        self.endDate = None

    def assign(self, tournament):
        if 'name' in tournament:
            self.name = tournament['name']
        
        if 'startDate' in tournament:
            self.startDate = tournament['startDate']

        if 'endDate' in tournament:
            self.endDate = tournament['endDate']

    def __str__(self):
        return self.name

class tournamentIdRoute:
    def on_get(self, request, response, id):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                                
            if id == 'new':
                tournament = Tournament(uuid.uuid4())
            else:                
                tournament = connection.tournaments.getByShortId(id) 

            if tournament == None:
                response.status = '404 Not Found'
                response.body = 'Tournament with id ' + id + ' not found.'              
            else:
                response.body = json.dumps(tournament.__dict__)            
        finally:
            connection.close()

    def on_delete(self, request, response, id):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                                
            tournament = connection.tournaments.getByShortId(id) 
            if tournament == None:
                response.status = '404 Not Found'
                response.body = 'Tournament with id ' + id + ' not found.'              
            else:
                connection.tournaments.deleteTournament(tournament)
                transaction.commit()             
        finally:
            connection.close()

class tournamentRoute: 
    def on_put(self, request, response):
      body = json.loads(request.stream.read())
      print('PUT ' + str(body))
      
      connection = tourneyDatabase.tourneyDatabase()
      try:                                                
          tournament = connection.tournaments.getById(body['id'])                
          if tournament == None:
            tournament = Tournament(body['id'])
            connection.tournaments.addTournament(tournament)                 
          tournament.assign(body)
          transaction.commit()
      finally:
          connection.close()

api.add_route('/data/tournament/{id}', tournamentIdRoute()) 
api.add_route('/data/tournament/', tournamentRoute()) 