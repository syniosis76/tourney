import falcon
import ZODB, ZODB.FileStorage

api = falcon.API()

storage = ZODB.FileStorage.FileStorage('database/tourney.fs')
db = ZODB.DB(storage)
