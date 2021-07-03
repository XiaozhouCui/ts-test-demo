import * as axios from 'axios'
import { UserCredentialsDbAccess } from '../app/Authorization/UserCredentialsDbAccess'
import { SessionToken } from '../app/Models/ServerModels'
import { HTTP_CODES, UserCredentials } from '../app/Models/UserModels'

// replace the validateStatus() in axios with a generic function
axios.default.defaults.validateStatus = function () {
  return true
}

const serverUrl = 'http://localhost:8080'
const itestUserCredentials: UserCredentials = {
  accessRights: [1, 2, 3],
  password: 'iTestPassword',
  username: 'iTestUser',
}

describe('Server integration test suite', () => {
  // async is not allowed on describe()
  // const testIfServerReachable = (await serverReachable) ? test : test.skip

  let userCredentialsDbAccess: UserCredentialsDbAccess
  let sessionToken: SessionToken

  beforeAll(() => {
    userCredentialsDbAccess = new UserCredentialsDbAccess()
  })

  test('serve reachable', async () => {
    const response = await axios.default.options(serverUrl)
    expect(response.status).toBe(HTTP_CODES.OK)
  })

  test.skip('put credentials inside database', async () => {
    await userCredentialsDbAccess.putUserCredential(itestUserCredentials)
  })

  test('reject invalid credentials', async () => {
    const response = await axios.default.post(serverUrl + '/login', {
      username: 'someWrongCred',
      password: 'someWrongCred',
    })
    expect(response.status).toBe(HTTP_CODES.NOT_fOUND)
  })

  test('login successful with correct credentials', async () => {
    const response = await axios.default.post(serverUrl + '/login', {
      username: itestUserCredentials.username,
      password: itestUserCredentials.password,
    })
    expect(response.status).toBe(HTTP_CODES.CREATED)
    // get token for following tests
    sessionToken = response.data
  })

  test('Query data', async () => {
    // get username "someName3" from Users.db
    const response = await axios.default.get(
      serverUrl + '/users?name=someName3',
      {
        // add auth header for axios
        headers: {
          Authorization: sessionToken.tokenId,
        },
      }
    )
    expect(response.status).toBe(HTTP_CODES.OK)
  })

  test('Query data with invalid token', async () => {
    const response = await axios.default.get(
      serverUrl + '/users?name=someName3',
      {
        headers: {
          Authorization: sessionToken.tokenId + 'someStuff',
        },
      }
    )
    expect(response.status).toBe(HTTP_CODES.UNAUTHORIZED)
  })
})

/**
 * conditional test not usable for async contitions in Jest
 * @see https://github.com/facebook/jest/issues/8604
 */
async function serverReachable(): Promise<boolean> {
  try {
    await axios.default.get(serverUrl)
  } catch (error) {
    console.log('Server not reachable')
    return false
  }
  console.log('Server reachable')
  return true
}
