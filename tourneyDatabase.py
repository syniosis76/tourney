import ZODB, ZODB.FileStorage
import transaction
from routes import tournaments

class tourneyDatabase:
  storage = None
  db = None

  def __init__(self):    
    self.connection = None
    self.tournaments = None
    self.connect()

  def connect(self):
    if not tourneyDatabase.storage:
      print('Initialise Storage')
      tourneyDatabase.storage = ZODB.FileStorage.FileStorage('database/tourney.fs')    
    if not tourneyDatabase.db:
      print('Initialise Database')
      tourneyDatabase.db = ZODB.DB(tourneyDatabase.storage)

    if not self.connection:
      print('Connect')
      self.connection = tourneyDatabase.db.open()      
      
    if hasattr(self.connection.root, 'tournaments'):
      self.tournaments = self.connection.root.tournaments
    else:
      print('Creating Data.')
      self.tournaments = tournaments.Tournaments()
      self.connection.root.tournaments = self.tournaments      
      transaction.commit()
      self.tournaments.addDefaultData()
    
  def close(self):
    if self.connection:
      print('Disconnect')
      self.connection.close()
      self.tournaments = None
      self.connection = None      