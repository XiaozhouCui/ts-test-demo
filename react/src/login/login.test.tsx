import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Login } from './login'
import { fireEvent, waitFor } from '@testing-library/react'
import { LoginService } from '../services/LoginService'

describe('Login component tests', () => {
  let container: HTMLDivElement
  // don't call real http request in unit test
  const loginServiceSpy = jest.spyOn(LoginService.prototype, 'login') // replace login method

  beforeEach(() => {
    // create a div container in the body
    container = document.createElement('div')
    document.body.appendChild(container)
    // render the Login component into container
    ReactDOM.render(<Login />, container)
  })
  afterEach(() => {
    document.body.removeChild(container)
    container = null
  })

  // test visual components and make assertions
  it('Renders correctly initial document', () => {
    const inputs = container.querySelectorAll('input')
    expect(inputs).toHaveLength(3)
    expect(inputs[0].name).toBe('login')
    expect(inputs[1].name).toBe('password')
    expect(inputs[2].value).toBe('Login')
    // there is no label in the document
    const label = document.querySelector('label')
    expect(label).not.toBeInTheDocument()
  })

  // make use of the attribute "data-test" in Login form
  it('Renders correctly initial document with data-test query', () => {
    expect(
      container.querySelector('[data-test="login-form"]')
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-test="login-input"]')?.getAttribute('name')
    ).toBe('login')
    expect(
      container
        .querySelector('[data-test="password-input"]')
        ?.getAttribute('name')
    ).toBe('password')
  })

  // test user interaction: fireEvent, change, click
  it('Passes credentials correctly', () => {
    const inputs = container.querySelectorAll('input')
    const loginInput = inputs[0]
    const passwordInput = inputs[1]
    const loginButton = inputs[2]

    fireEvent.change(loginInput, { target: { value: 'someUser' } })
    fireEvent.change(passwordInput, { target: { value: 'somePassword' } })
    fireEvent.click(loginButton)
    expect(loginServiceSpy).toBeCalledWith('someUser', 'somePassword')
  })

  // test the rendered login status ("Login successful" / "Login failed")
  it('Renders status label correctly - invalid login', async () => {
    // simulate a successful login
    loginServiceSpy.mockResolvedValueOnce(true)
    const inputs = container.querySelectorAll('input')
    const loginButton = inputs[2]
    fireEvent.click(loginButton)
    // test async code using waitFor(), make assertion inside callback
    await waitFor(() => expect(container.querySelector('label')).toBeInTheDocument())
    await waitFor(() => expect(container.querySelector('label')).toHaveTextContent('Login successful'))
  })
})
