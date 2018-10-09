from server import api
import tourneyDatabase
import json
import falcon
import persistent
import transaction
import uuid
import shortuuid

class Game(persistent.Persistent):
    def __init__(self, id):        
        self.id = id
        self.group = None    
        self.team1 = None    
        self.team1Score = 0
        self.team1Points = 0
        self.team2 = None                
        self.team2Score = 0        
        self.team2Points = 0
        self.dutyTeam = None
        self.status = 'pending'

    def __str__(self):
        return self.name

    def assignValues(self, values):      
      if len(values) == 4:
        self.group = values[0]
        self.team1 = values[1]
        self.team2 = values[2]
        self.dutyTeam = values[3]
      elif len(values) == 3:
        self.group = values[0]
        self.team1 = values[1]
        self.team2 = values[2]
        self.dutyTeam = None
      elif len(values) == 2:
        self.group = None
        self.team1 = values[0]
        self.team2 = values[1]
        self.dutyTeam = None
        