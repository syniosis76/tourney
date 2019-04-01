import ZODB, ZODB.config
import transaction
from routes import tournaments

class tourneyDatabase:  
  path = None
  db = None

  def __init__(self):        
    self.connection = None
    self.tournaments = None
    self.connect()

  def connect(self):    
    if not tourneyDatabase.db:
      print('Initialise Database')      
      tourneyDatabase.db = ZODB.config.databaseFromURL(tourneyDatabase.path)

    if not self.connection:
      print('Connect')
      self.connection = tourneyDatabase.db.open()      
      
    if hasattr(self.connection.root, 'tournaments'):
      self.tournaments = self.connection.root.tournaments
    else:
      print('Creating Data.')
      for attempt in transaction.manager.attempts():
          with attempt:
            self.tournaments = tournaments.Tournaments()
            self.connection.root.tournaments = self.tournaments      
            transaction.commit()

    self.correctData()
    
  def close(self):
    if self.connection:
      print('Disconnect')
      self.connection.close()
      self.tournaments = None
      self.connection = None  

  def correctData(self):
    pass