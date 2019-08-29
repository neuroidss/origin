import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchUser } from '@/actions/user'
import { getUser, getError, getIsLoading } from '@/reducers/user'
import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

class Welcome extends Component {
  state = {
    loading: true,
    redirectTo: null
  }

  componentDidMount() {
    this.handleWelcomeToken(this.props.match.params.token)
  }

  handleWelcomeToken = async token => {
    // Auth the user using the token
    let response
    try {
      response = await agent
        .post(`${apiUrl}/api/verify_email_token`)
        .set('Authorization', `Bearer ${token}`)
    } catch (error) {
      this.setState({ loading: false, error: 'Invalid token' })
      return
    }

    if (response.body.otpVerified) {
      // Looks like user has already onboarding, probably wants to login
      this.setState({ redirectTo: '/' })
    }

    this.props.fetchUser()

    this.setState({ loading: false })
  }

  render() {
    if (this.state.redirectTo) {
      return <Redirect push to={this.state.redirectTo} />
    }

    return (
      <>
        <div className="action-card">
          {this.state.loading || this.props.isLoading ? (
            <div className="spinner-grow" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <>
              <h1>Welcome to the Origin Investor Portal</h1>
              <p>
                You will be able to use this portal to manage your OGN
                investment.
              </p>
              <div className="form-group">
                <label>Name</label>
                <br />
                {this.props.user.name}
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <br />
                {this.props.user.email}
              </div>
              <button
                className="btn btn-secondary btn-lg mt-5"
                onClick={() => {
                  if (this.props.user.phone) {
                    this.setState({ redirectTo: '/terms' })
                  } else {
                    this.setState({ redirectTo: '/phone' })
                  }
                }}
              >
                Continue
              </button>
            </>
          )}
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ user }) => {
  return {
    user: getUser(user),
    error: getError(user),
    isLoading: getIsLoading(user)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchUser: fetchUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Welcome)
