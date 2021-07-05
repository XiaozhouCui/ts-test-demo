import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { Login } from './login'

describe('Login component tests', () => {
  let container: HTMLDivElement
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
    expect(container.querySelector('[data-test="login-form"]')).toBeInTheDocument()
    expect(container.querySelector('[data-test="login-input"]')?.getAttribute('name')).toBe('login')
    expect(container.querySelector('[data-test="password-input"]')?.getAttribute('name')).toBe('password')
  })
})
