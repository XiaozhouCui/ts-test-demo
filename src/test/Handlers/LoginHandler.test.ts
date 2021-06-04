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
    // use post request by default
    requestMock.method = HTTP_METHODS.POST
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

  test('post request with valid login', async () => {
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

  test('post request with INVALID login', async () => {
    getRequestBodyMock.mockReturnValueOnce({
      username: 'someUser',
      password: 'password',
    })
    // invalid request: no token
    authorizerMock.generateToken.mockReturnValueOnce(null)
    await loginHandler.handleRequest()
    expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND)
    expect(responseMock.write).toBeCalledWith('wrong username or password')
  })

  test('post request with unexpected error', async () => {
    const errorMessage = 'something went wrong!'
    // mock reject with error
    getRequestBodyMock.mockRejectedValueOnce(new Error(errorMessage))
    // without authorizerMock, loginHandler.handlePost() will end up in the catch error block
    await loginHandler.handleRequest()
    expect(responseMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR)
    expect(responseMock.write).toBeCalledWith('Internal error: ' + errorMessage)
  })
})
