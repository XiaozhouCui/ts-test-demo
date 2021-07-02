import { Authorizer } from '../../app/Authorization/Authorizer'
import { UsersDBAccess } from '../../app/Data/UsersDBAccess'
import { DataHandler } from '../../app/Handlers/DataHandler'
import { LoginHandler } from '../../app/Handlers/LoginHandler'
import { Server } from '../../app/Server/Server'

// mock the dependency modules LoginHandler and DataHandler, so they can be tracked
jest.mock('../../app/Handlers/LoginHandler')
jest.mock('../../app/Handlers/DataHandler')

// mock the Authorizer so it will not mess up the database sessionToken.db
jest.mock('../../app/Authorization/Authorizer')

// mock req
const requestMock = {
  url: '', // getRequestBasePath() from Utils only need "req.url"
}
// mock res
const responseMock = {
  end: jest.fn(), // "res.end()" is called in createServer()
}

// mock the returned object of createServer()
const listenMock = {
  listen: jest.fn() // ".listen(8080)" is chained after createServer()
}

// mock the Node.js http module
jest.mock('http', () => {
  return {
    // overwrite the createServer() method
    createServer: (cb: any) => {
      cb(requestMock, responseMock)
      return listenMock
    },
  }
})

describe('Server test suite', () => {
  test('should create server on port 8080', () => {
    // startServer() will call res.end() and .listen(8080)
    new Server().startServer()
    expect(listenMock.listen).toBeCalledWith(8080)
    expect(responseMock.end).toBeCalled()
  })

  // test "/login" route
  test('should handle login requests', () => {
    requestMock.url = 'http://localhost:8080/login'
    new Server().startServer()
    const handleRequestSpy = jest.spyOn(LoginHandler.prototype, 'handleRequest')
    expect(handleRequestSpy).toBeCalled()
    // use a "expect.any()" matcher for private field "authorizer"
    expect(LoginHandler).toBeCalledWith(requestMock, responseMock, expect.any(Authorizer))
  })

  // test "/users" route
  test('should handle data requests', () => {
    requestMock.url = 'http://localhost:8080/users'
    new Server().startServer()
    // use "expect.any()" matcher for private fields "authorizer" and "usersDBAccess"
    expect(DataHandler).toBeCalledWith(requestMock, responseMock, expect.any(Authorizer), expect.any(UsersDBAccess))
    const handleRequestSpy = jest.spyOn(DataHandler.prototype, 'handleRequest')
    expect(handleRequestSpy).toBeCalled()
  })
})
