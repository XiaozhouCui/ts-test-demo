import { SessionToken } from './../../app/Models/ServerModels'
import { LoginHandler } from '../../app/Handlers/LoginHandler'
import { HTTP_CODES, HTTP_METHODS } from '../../app/Models/ServerModels'
import { Utils } from '../../app/Utils/Utils'

describe('LoginHandler test suite', () => {
  let loginHandler: LoginHandler

  const requestMock = {
    method: '',
  }
  const responseMock = {
    // need to mock writeHead function inside handleOptions() private method
    writeHead: jest.fn(),
    write: jest.fn(),
    statusCode: 0,
  }
  const authorizerMock = {
    generateToken: jest.fn(),
  }
  const getRequestBodyMock = jest.fn()

  beforeEach(() => {
    loginHandler = new LoginHandler(
      requestMock as any,
      responseMock as any,
      authorizerMock as any
    )
    // replace the getRequestBody() method with mock function
    Utils.getRequestBody = getRequestBodyMock
  })

  afterEach(() => {
    // clear the mock data from previous test
    jest.clearAllMocks()
  })

  // dummy data
  const dummyToken: SessionToken = {
    tokenId: 'someTokenId',
    userName: 'someUserName',
    valid: true,
    expirationTime: new Date(),
    accessRights: [1, 2, 3],
  }

  // test private method handleOptions()
  test('options request', async () => {
    requestMock.method = HTTP_METHODS.OPTIONS
    // public method handleRequest() will cal private method handleOptions()
    await loginHandler.handleRequest()
    // assertion for mock function writeHead() inside handleOptions()
    expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK)
  })

  test('not handled http method', async () => {
    requestMock.method = 'someRandomMethod' // this will end up in he default case in handleRequest() method
    await loginHandler.handleRequest()
    // make sure mock is not called after jest.clearAllMocks()
    expect(responseMock.writeHead).not.toHaveBeenCalled()
  })

  test.only('post request with valid login', async () => {
    requestMock.method = HTTP_METHODS.POST
    getRequestBodyMock.mockReturnValueOnce({
      username: 'someUser',
      password: 'password',
    })
    authorizerMock.generateToken.mockReturnValueOnce(dummyToken)
    await loginHandler.handleRequest()
    expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED)
    expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.CREATED, { 'Content-Type': 'application/json' })
    expect(responseMock.write).toBeCalledWith(JSON.stringify(dummyToken))
  })
})
