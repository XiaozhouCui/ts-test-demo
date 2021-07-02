import { mocked } from 'ts-jest/utils'
import { Launcher } from '../app/Launcher'
import { Server } from '../app/Server/Server'

// should NOT starat a real server in unit tests
// overwrite the entire Server class
jest.mock('../app/Server/Server', () => {
  return {
    Server: jest.fn(() => {
      return {
        // mock the startServer() method
        startServer: () => {
          console.log('starting fake server')
        },
      }
    }),
  }
})

describe('Launcher test suite', () => {
  // DEEP MOCK: mocked() only available to ts-jest
  const mockedServer = mocked(Server, true) // pass in the imported Server
  test('create server', () => {
    // test the constructor
    new Launcher()
    expect(mockedServer).toBeCalled()
  })

    // another way to inject mocks, to test the launchApp() method
  test('launch app', () => {
    const launchAppMock = jest.fn()
    // prototype: access the non-static method launchApp() directly from Launcher class
    Launcher.prototype.launchApp = launchAppMock
    // call the function
    new Launcher().launchApp()
    expect(launchAppMock).toBeCalled()
  })
})
