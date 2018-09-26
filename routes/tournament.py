from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction

class Tournament(persistent.Persistent):
    def __init__(self, id, name, startDate, endDate):
        self.id = id
        self.name = name
        self.startDate = startDate
        self.endDate = endDate

    def __str__(self):
        return self.name

class tournamentIdRoute:
    def on_get(self, request, response, id):        
        connection = tourneyDatabase.tourneyDatabase()
        try:                                                
            tournament = connection.tournaments.getByShortId(id)                
            if tournament == None:
              response.status = '404 Not Found'
              response.body = 'Tournament with id ' + id + ' not found.'              
            else:
              response.body = json.dumps(tournament.__dict__)
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
            pass            
          else:
            tournament.name = body['name']
            transaction.commit()
      finally:
          connection.close()


api.add_route('/data/tournament/{id}', tournamentIdRoute()) 
api.add_route('/data/tournament/', tournamentRoute()) 