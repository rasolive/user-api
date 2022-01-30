const {MongoClient} = require('mongodb');
const UserRepository = require('./user-repository.js');

(async () => {
  const uri = 'mongodb+srv://m001-student:rasolive0532291@sandbox.wuewv.mongodb.net/lims?retryWrites=true&w=majority';
  const client = new MongoClient(uri);
  await client.connect();
  const collection = client.db('users_db').collection('users');
  const userRepository = new UserRepository(collection);
  await userRepository.deleteAll();
  await client.close();
  console.log('Database cleared');
})();
