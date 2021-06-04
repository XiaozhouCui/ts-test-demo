import { Authorizer } from '../../app/Authorization/Authorizer'
import { SessionTokenDBAccess } from '../../app/Authorization/SessionTokenDBAccess'
import { UserCredentialsDbAccess } from '../../app/Authorization/UserCredentialsDbAccess'

// mock the entire modules before instanciating Authorizer
jest.mock('../../app/Authorization/SessionTokenDBAccess')
jest.mock('../../app/Authorization/UserCredentialsDbAccess')

describe('Authorizer test suite', () => {
  let authorizer: Authorizer

  test('constructor aarguments', () => {
    // constructor of Authorizer will call the mocks instead of real implementation
    new Authorizer()
    expect(SessionTokenDBAccess).toBeCalled()
    expect(UserCredentialsDbAccess).toBeCalled()
  })
})
