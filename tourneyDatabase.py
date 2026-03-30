import ZODB, ZODB.config
import zodburi
import os
import transaction
from routes import tournaments

class tourneyDatabase:  
    database_uri = None
    db = None
    pool_size = 10

    def __init__(self):
        self.connection = None
        self.tournaments = None
        self.connect()

    def connect(self):
        if not tourneyDatabase.db:
            print('Initialise Database')
            storage_factory, dbkw = zodburi.resolve_uri(self.database_uri)
            
            pool_size_env = os.environ.get('DATABASE_POOL_SIZE')
            if pool_size_env:
                tourneyDatabase.pool_size = int(pool_size_env)
            
            if 'RelStorage' in str(type(storage_factory)):
                dbkw['pool_size'] = tourneyDatabase.pool_size
                dbkw['max_overflow'] = 0
            
            storage = storage_factory()
            tourneyDatabase.db = ZODB.DB(storage, **dbkw)

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
