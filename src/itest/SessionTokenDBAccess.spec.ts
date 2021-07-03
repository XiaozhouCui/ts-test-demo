import { SessionTokenDBAccess } from '../app/Authorization/SessionTokenDBAccess'
import { SessionToken } from '../app/Models/ServerModels'

describe('SessionTokenDBAccess integration test suite', () => {
  let sessionTokenDBAccess: SessionTokenDBAccess
  let someSessionToken: SessionToken
  // generate a random ID for session token
  const randomString = Math.random().toString(36).substring(7)

  beforeAll(() => {
    // Instanciate session token
    sessionTokenDBAccess = new SessionTokenDBAccess()
    someSessionToken = {
      accessRights: [1, 2, 3],
      expirationTime: new Date(),
      tokenId: 'someTokenId' + randomString,
      userName: 'someUserName',
      valid: true,
    }
  })

  test('store and retrieve SessionToken', async () => {
    // store the token
    await sessionTokenDBAccess.storeSessionToken(someSessionToken)
    // query the token
    const resultToken = await sessionTokenDBAccess.getToken(
      someSessionToken.tokenId
    )
    // use .toMatchObject() assertion, because nedb will add an extra field "_id"
    expect(resultToken).toMatchObject(someSessionToken)
  })

  test('delete sessionToken', async () => {
    // delete the same token from previous test
    await sessionTokenDBAccess.deleteToken(someSessionToken.tokenId)
    // try to fetch the token after deletion
    const resultToken = await sessionTokenDBAccess.getToken(
      someSessionToken.tokenId
    )
    // should be deleted
    expect(resultToken).toBeUndefined()
  })

  test('delete missing sessionToken throws error', async () => {
    try {
      // delete the token that's already removed
      await sessionTokenDBAccess.deleteToken(someSessionToken.tokenId)
    } catch (error) {
      // add assertion in the catch block
      expect(error).toBeInstanceOf(Error)
      expect(error).toHaveProperty('message', 'SessionToken not deleted!')
    }
  })
})
