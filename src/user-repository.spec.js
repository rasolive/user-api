const {MongoClient} = require('mongodb');
const UserRepository = require('./user-repository');
const {objectId} = require('bson');

describe('UserRepository', () => {
  let userRepository;
  let collection;
  let client;

  beforeAll(async () => {
    const uri = 'mongodb+srv://m001-student:rasolive0532291@sandbox.wuewv.mongodb.net/lims?retryWrites=true&w=majority';
    client = new MongoClient(uri);
    await client.connect();
    collection = client.db('users_db').collection('users');
    userRepository = new UserRepository(collection);
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    await collection.deleteMany({});
  });

  describe('findOneById', () => {
    test('Deve retornar o usuário por id', async () => {
      const result = await collection.insertOne({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      const user = await userRepository.findOneById(objectId(result.insertedId));

      expect(user).toStrictEqual({
        id: result.insertedId,
        name: 'John Doe',
        email: 'john@doe.com',
      });
    });

    test('Deve lançar uma exceção para um usuário não existente', async () => {
      await expect(userRepository.findOneById(objectId('61f59d2d712d72582e3803af')))
          .rejects.toThrow('User with id 61f59d2d712d72582e3803af does not exist');
    });
  });

  describe('findOneByEmail', () => {
    test('Deve retornar o usuário john@doe.com', async () => {
      const result = await collection.insertOne({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      const user = await userRepository.findOneByEmail('john@doe.com');

      expect(user).toStrictEqual({
        id: result.insertedId,
        name: 'John Doe',
        email: 'john@doe.com',
      });
    });

    test('Deve lançar uma exceção para um usuário não existente', async () => {
      await expect(userRepository.findOneByEmail('john@doe.com'))
          .rejects.toThrow('User with email john@doe.com does not exist');
    });
  });

  describe('insert', () => {
    test('Inserir um novo usuário', async () => {
      const user = await userRepository.insert({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      const result = await userRepository.findOneByEmail('john@doe.com');

      expect(result).toStrictEqual(user);
    });
  });

  describe('update', () => {
    test('Deve atualizar um usuário existente', async () => {
      const result = await userRepository.insert({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      await userRepository.update(result.id, {
        name: 'John Doe da Silva',
        email: 'john@doe.com',
      });

      const user = await userRepository.findOneByEmail('john@doe.com');

      expect(user).toStrictEqual({
        id: result.id,
        name: 'John Doe da Silva',
        email: 'john@doe.com',
      });
    });
    test('Deve lançar uma exceção para um usuário não existente', async () => {

    });
  });

  describe('delete', () => {
    test('Deve remover um usuário existente', async () => {
      const user = await userRepository.insert({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      await userRepository.delete(user.id);

      await expect(userRepository.findOneByEmail('john@doe.com')).rejects.toThrow();
    });

    test('Deve lançar uma exceção para um usuário não existente', async () => {
      await expect(userRepository.delete(objectId('61f59d2d712d72582e3803af')))
          .rejects.toThrow('User with id 61f59d2d712d72582e3803af does not exist');
    });
  });

  describe('findAll', () => {
    test('Deve retornar uma lista vazia de usuários', async () => {
      const list = await userRepository.findAll();
      expect(list).toStrictEqual([]);
    });
    test('Deve retornar uma lista contendo dois usuários', async () => {
      const user1 = await userRepository.insert({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      const user2 = await userRepository.insert({
        name: 'Alice Doe',
        email: 'alice@doe.com',
      });

      const list = await userRepository.findAll();

      expect(list).toStrictEqual([user1, user2]);
    });
  });
});
