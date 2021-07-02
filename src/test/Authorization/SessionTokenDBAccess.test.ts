import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess'
import * as Nedb from 'nedb'
import { SessionToken } from '../../app/Models/ServerModels'

// mock the database module as the injected dependency
jest.mock('nedb')

describe('SessionTokenDBAccess test suite', () => {
  let sessionTokenDBAccess: SessionTokenDBAccess

  // mock the nedb object, to be passed into SessionTokenDBAccess as arg
  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
  }

  // prepare dummy token
  const someToken: SessionToken = {
    accessRights: [],
    expirationTime: new Date(),
    tokenId: '123',
    userName: 'John',
    valid: true,
  }

  const someTokenId = '123'

  beforeEach(() => {
    // instanciate SessionTokenDBAccess with a mocked nedb object
    sessionTokenDBAccess = new SessionTokenDBAccess(nedbMock as any)
    // loadDatabase() is called inside ctor, need to test it here
    expect(nedbMock.loadDatabase).toBeCalled()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('store sessionToken without error', async () => {
    // mock the nedbMock.insert() with a CALLBACK function "cb"
    nedbMock.insert.mockImplementationOnce((someToken: any, cb: any) => {
      cb()
    })
    // nedbMock.insert in storeSessionToken() will be called
    await sessionTokenDBAccess.storeSessionToken(someToken)
    // expect insert() to be called with a CALLBACK, use "expect.any(Function)" to represent a CALLBACK
    expect(nedbMock.insert).toBeCalledWith(someToken, expect.any(Function)) // expect.any() is a matcher?
  })

  test('store sessionToken with error', async () => {
    nedbMock.insert.mockImplementationOnce((someToken: any, cb: any) => {
      cb(new Error('something went wrong')) // insert() will reject the promise if an error is returned
    })
    // to test errors on callbacks, need to add "expect()" directly after "await", then chain with .rejects
    await expect(
      sessionTokenDBAccess.storeSessionToken(someToken)
    ).rejects.toThrow('something went wrong') // expect promise to be rejected
    expect(nedbMock.insert).toBeCalledWith(someToken, expect.any(Function))
  })

  test('get token with result and no error', async () => {
    const bar = (someTokenId: string, cb: any) => {
      cb(null, [someToken])
    }
    nedbMock.find.mockImplementationOnce(bar)
    const getTokenResult = await sessionTokenDBAccess.getToken(someTokenId)
    expect(getTokenResult).toBe(someToken)
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    )
  })

  test('get token with no result and no error', async () => {
    const bar = (someTokenId: string, cb: any) => {
      cb(null, [])
    }
    nedbMock.find.mockImplementationOnce(bar)
    const getTokenResult = await sessionTokenDBAccess.getToken(someTokenId)
    expect(getTokenResult).toBeNull
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    )
  })

  test('get token with error', async () => {
    const bar = (someTokenId: string, cb: any) => {
      cb(new Error('something went wrong'), [])
    }
    nedbMock.find.mockImplementationOnce(bar)
    await expect(sessionTokenDBAccess.getToken(someTokenId)).rejects.toThrow(
      'something went wrong'
    )
    expect(nedbMock.find).toBeCalledWith(
      { tokenId: someTokenId },
      expect.any(Function)
    )
  })

  test('constructor argument', async () => {
    new SessionTokenDBAccess()
    expect(Nedb).toBeCalledWith('databases/sessionToken.db')
  })
})
