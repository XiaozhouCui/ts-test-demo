import { LoginHandler } from '../../app/Handlers/LoginHandler'
import { HTTP_CODES, HTTP_METHODS } from '../../app/Models/ServerModels'

describe('LoginHandler test suite', () => {
  let loginHandler: LoginHandler

  const requestMock = {
    method: '',
  }
  const responseMock = {
    // need to mock writeHead function inside handleOptions() private method
    writeHead: jest.fn(),
  }
  const authorizerMock = {}

  beforeEach(() => {
    loginHandler = new LoginHandler(
      requestMock as any,
      responseMock as any,
      authorizerMock as any
    )
  })

  afterEach(() => {
    // clear the mock data from previous test
    jest.clearAllMocks()
  })

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
})
