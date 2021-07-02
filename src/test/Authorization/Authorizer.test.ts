import { Authorizer } from '../../app/Authorization/Authorizer'
import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess'
import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess'
import {
  Account,
  SessionToken,
  TokenState,
} from '../../app/Models/ServerModels'

// mock the entire modules (injected dependencies) BEFORE calling any Authorizer ctor
jest.mock('../../app/Authorization/SessionTokenDBAccess')
jest.mock('../../app/Authorization/UserCredentialsDbAccess')

const someAccount: Account = {
  username: 'someUser',
  password: 'password',
}

describe('Authorizer test suite', () => {
  let authorizer: Authorizer

  // mock dependencies of Authorizer
  const sessionTokenDBAccessMock = {
    // mock method in dependency
    storeSessionToken: jest.fn(),
    getToken: jest.fn(),
  }
  const userCredentialsDBAccessMock = {
    // mock method in dependency
    getUserCredential: jest.fn(),
  }

  beforeEach(() => {
    // initialize dummy instance with mocked args
    authorizer = new Authorizer(
      sessionTokenDBAccessMock as any,
      userCredentialsDBAccessMock as any
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // test class instanciation without args
  test('constructor arguments', () => {
    // Authorizer ctor can take 2 optional arguments: sessionTokenDBAccess and userCredentialsDbAccess
    new Authorizer() // running this ctor will call the default args (mocked modules, not real implementation)
    expect(SessionTokenDBAccess).toBeCalledTimes(1)
    expect(UserCredentialsDbAccess).toBeCalledTimes(1)
  })

  describe('login user tests suite', () => {
    test('should return null if invalid credentials', async () => {
      userCredentialsDBAccessMock.getUserCredential.mockReturnValue(null)
      const loginResult = await authorizer.generateToken(someAccount)
      expect(loginResult).toBeNull
      expect(userCredentialsDBAccessMock.getUserCredential).toBeCalledWith(
        someAccount.username,
        someAccount.password
      )
    })

    // test 2 private methods in Authorizer: generateRandomTokenId, generateExpirationTime
    test('should return sessionToken for valid credentials', async () => {
      // use jest.spyOn() to test CHANGING values like Math.random() and Date.now()
      jest.spyOn(global.Math, 'random').mockReturnValueOnce(0) // Math.random() in generateRandomTokenId() will return 0
      jest.spyOn(global.Date, 'now').mockReturnValueOnce(0) // Date.now() will return 1970-01-01T00:00:00.000Z, generateExpirationTime() will add 1 hour to it

      // getUserCredential() in authorizer.generateToken will async return the following obj
      userCredentialsDBAccessMock.getUserCredential.mockResolvedValueOnce({
        username: 'someUser',
        accessRights: [1, 2, 3],
      })

      // prepare dummy token
      const expectedSessionToken: SessionToken = {
        userName: 'someUser',
        accessRights: [1, 2, 3],
        valid: true,
        tokenId: '',
        expirationTime: new Date(60 * 60 * 1000), // 1970-01-01T01:00:00.000Z
      }

      // call the mocked dependencies inside authorizer
      const sessionToken = await authorizer.generateToken(someAccount)

      // dummy token should
      expect(expectedSessionToken).toEqual(sessionToken)
      expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(
        sessionToken
      )
    })
  })

  describe('validateToken tests', () => {
    test('validateToken returns invalid for null token', async () => {
      sessionTokenDBAccessMock.getToken.mockReturnValueOnce(null)
      const sessionToken = await authorizer.validateToken('123')
      expect(sessionToken).toStrictEqual({
        accessRights: [],
        state: TokenState.INVALID,
      })
    })

    test('validateToken returns expired for expired tokens', async () => {
      const dateInPast = new Date(Date.now() - 1)
      sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
        valid: true,
        expirationTime: dateInPast,
      })
      const sessionToken = await authorizer.validateToken('123')
      expect(sessionToken).toStrictEqual({
        accessRights: [],
        state: TokenState.EXPIRED,
      })
    })

    test('validateToken returns valid for not expired and valid tokens', async () => {
      const dateInFuture = new Date(Date.now() + 100000)
      sessionTokenDBAccessMock.getToken.mockReturnValue({
        valid: true,
        expirationTime: dateInFuture,
        accessRights: [1],
      })
      const sessionToken = await authorizer.validateToken('123')
      expect(sessionToken).toStrictEqual({
        accessRights: [1],
        state: TokenState.VALID,
      })
    })
  })
})
